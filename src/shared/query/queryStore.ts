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

  return () => {
    listeners.get(key)?.delete(listener);
  };
};

export const getSnapshot = <T>(key: string): RequestState<T> => {
  const entry = cache.get(key);

  if (!entry) {
    return INITIAL_STATE;
  }

  return entry.state as RequestState<T>;
};

export const fetchQuery = <T>(key: string, url: string, schema: z.ZodSchema<T>) => {
  const now = Date.now();
  let entry = cache.get(key);

  if (!entry) {
    entry = {
      state: INITIAL_STATE,
      fetchAt: 0,
      inFlight: null,
      url,
      schema,
    };
    cache.set(key, entry);
    emit(key);
  } else {
    const isFresh = now - entry.fetchAt < STALE_TIME;

    if (isFresh && !entry.inFlight) return;

    entry.url = url;
    entry.schema = schema;
  }

  // Deduplication lock
  if (entry.inFlight) return entry.inFlight;

  // Network call
  const promise = (async () => {
    try {
      const data = await getJson(url, schema);

      if (entry) {
        entry.state = { status: "success", data };
        entry.fetchAt = Date.now();
        emit(key);
      }
    } catch (err) {
      if (entry) {
        entry.state = { status: "error", message: toMessage(err) };
      }
      emit(key);
    } finally {
      if (entry) {
        entry.inFlight = null;
      }
    }
  })();
  entry.inFlight = promise;
  return promise;
};

export const invalidate = (key: string) => {
  const entry = cache.get(key);

  if (entry) {
    entry.fetchAt = 0;
    void fetchQuery(key, entry.url, entry.schema);
  }
};
