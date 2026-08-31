import type { z } from "zod";
import { getJson, toMessage } from "../api/client.ts";
import type { RequestState } from "../types.ts";

const STALE_TIME = 30_000;
const INITIAL_STATE: RequestState<unknown> = { status: "loading" };

type CacheEntry<T> = {
  state: RequestState<T>;
  fetchAt: number;
  inFlight: Promise<void> | null;
  url: string;
  schema: z.ZodSchema<T>;
  emptyAt: number | null;
  abortController: AbortController | null;
};

const cache = new Map<string, CacheEntry<unknown>>();
const listeners = new Map<string, Set<() => void>>();

const emit = (key: string) => {
  const keyListeners = listeners.get(key);

  keyListeners?.forEach((listener) => {
    listener();
  });
};

export const subscribe = (key: string, listener: () => void) => {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)?.add(listener);

  const entry = cache.get(key);
  if (entry) {
    entry.emptyAt = null;
  }

  return () => {
    listeners.get(key)?.delete(listener);
    const keyListeners = listeners.get(key);
    if (keyListeners && keyListeners.size === 0) {
      const entry = cache.get(key);
      if (entry) {
        entry.emptyAt = Date.now();
        entry.abortController?.abort();
        entry.inFlight = null;
        entry.abortController = null;
      }
    }
  };
};

export const getSnapshot = <T>(key: string): RequestState<T> => {
  const entry = cache.get(key);

  if (!entry) {
    return INITIAL_STATE;
  }

  return entry.state as RequestState<T>;
};

export const fetchQuery = <T>(key: string, url: string, schema: z.ZodSchema<T>): Promise<void> => {
  const now = Date.now();
  let entry = cache.get(key);

  if (!entry) {
    entry = {
      state: INITIAL_STATE,
      fetchAt: 0,
      inFlight: null,
      url,
      schema,
      emptyAt: null,
      abortController: null,
    };
    cache.set(key, entry);
    startGc();
    emit(key);
  } else {
    const isFresh = now - entry.fetchAt < STALE_TIME;

    if (isFresh && !entry.inFlight) return Promise.resolve();

    entry.url = url;
    entry.schema = schema;
  }

  // Deduplication lock
  if (entry.inFlight) return entry.inFlight;

  const activeEntry = entry;
  const controller = new AbortController();

  entry.abortController = controller;
  const signal = controller.signal;

  // Network call
  const promise = (async () => {
    try {
      const data = await getJson(url, schema, { signal });
      activeEntry.state = { status: "success", data };
      activeEntry.fetchAt = Date.now();
      emit(key);
    } catch (err) {
      if (signal.aborted) {
        return;
      }
      activeEntry.state = { status: "error", message: toMessage(err) };
      emit(key);
    } finally {
      if (activeEntry.abortController === controller) {
        activeEntry.inFlight = null;
      }
    }
  })();
  activeEntry.inFlight = promise;
  emit(key);
  return promise;
};

export const invalidate = (key: string) => {
  const entry = cache.get(key);

  if (entry) {
    entry.fetchAt = 0;
    void fetchQuery(key, entry.url, entry.schema);
  }
};

export const getIsRevalidating = (key: string): boolean => {
  const entry = cache.get(key);

  return !!(entry?.inFlight && entry.state.status === "success");
};

const GC_TIME = 300_000;
let gcIntervalId: ReturnType<typeof setInterval> | null = null;
const GC_TICK_RATE = Math.floor(GC_TIME / 10);

export const stopGc = () => {
  if (gcIntervalId) {
    clearInterval(gcIntervalId);
    gcIntervalId = null;
  }
};

const startGc = () => {
  if (!gcIntervalId) {
    gcIntervalId = setInterval(() => {
      for (const [key, entry] of cache.entries()) {
        if (entry.emptyAt && !entry.inFlight) {
          if (Date.now() - entry.emptyAt > GC_TIME) {
            cache.delete(key);
            listeners.delete(key);
          }
        }
      }
      if (cache.size === 0) stopGc();
    }, GC_TICK_RATE);
    (gcIntervalId as unknown as { unref?: () => void }).unref?.();
  }
};

declare global {
  interface Window {
    __queryCache?: typeof cache;
  }
}

if (import.meta.env.DEV) {
  window.__queryCache = cache;
}
