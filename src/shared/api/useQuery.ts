import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import type { z } from "zod";
import { fetchQuery, getIsRevalidating, getSnapshot, subscribe } from "../query/queryStore.ts";

export const useQuery = <T>(key: string, url: string, schema: z.ZodSchema<T>) => {
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const subscribeToStore = useCallback(
    (listener: () => void) => {
      return subscribe(key, listener);
    },
    [key],
  );

  const state = useSyncExternalStore(subscribeToStore, () => getSnapshot<T>(key));
  const isRevalidating = useSyncExternalStore(subscribeToStore, () => getIsRevalidating(key));

  useEffect(() => {
    void fetchQuery(key, url, schemaRef.current);
  }, [key, url]);

  const refetch = () => {
    void fetchQuery(key, url, schemaRef.current);
  };

  return { state, refetch, isRevalidating };
};
