import type { z } from "zod";
import type {
  AccountDtoSchema,
  CurrencySchema,
  EntryDtoSchema,
  PostingRequestSchema,
  PostingResponseSchema,
  ProblemDetailSchema,
} from "./schemas.ts";

export type AccountDto = z.infer<typeof AccountDtoSchema>;

export type EntryDto = z.infer<typeof EntryDtoSchema>;

export type Currency = z.infer<typeof CurrencySchema>;

export type PostingRequest = z.infer<typeof PostingRequestSchema>;

export type PostingResponse = z.infer<typeof PostingResponseSchema>;

export type ProblemDetail = z.infer<typeof ProblemDetailSchema>;
