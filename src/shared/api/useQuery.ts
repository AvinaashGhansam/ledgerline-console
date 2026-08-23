import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import type { RequestState } from "../types.ts";
import { getJson, toMessage } from "./client.ts";

export const useQuery = <T>(_key: "entries" | "accounts", url: string, schema: z.ZodSchema<T>) => {
  const [state, setState] = useState<RequestState<T>>({ status: "loading" });
  const [nonce, setNonce] = useState(0);
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const refetch = () => {
    setNonce((prevCount) => prevCount + 1);
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setState({ status: "loading" });

      try {
        const data = await getJson(url, schemaRef.current, {
          signal: controller.signal,
          headers: { "X-Retry": String(nonce) },
        });
        setState({ status: "success", data });
      } catch (err) {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: toMessage(err) });
      }
    };
    void fetchData();

    return () => controller.abort();
  }, [url, nonce]);
  return { state, refetch };
};
