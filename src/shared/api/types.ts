import type { z } from "zod";
import type { AccountDtoSchema, CurrencySchema, EntryDtoSchema } from "./schemas.ts";

export type AccountDto = z.infer<typeof AccountDtoSchema>;

export type EntryDto = z.infer<typeof EntryDtoSchema>;

export type Currency = z.infer<typeof CurrencySchema>;
