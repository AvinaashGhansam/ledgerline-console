import { z } from "zod";

export const CURRENCY_MISMATCH_TYPE = "urn:ledgerline:problem:currency-mismatch";
export const CurrencySchema = z.enum(["USD", "EUR"]);

export const AccountDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  currency: CurrencySchema,
  balanceMinorUnits: z.number().int(),
});

export const EntryDtoSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  postingId: z.string(),
  direction: z.enum(["CREDIT", "DEBIT"]),
  amountMinorUnits: z.number().int(),
  currency: CurrencySchema,
  occurredAt: z.iso.datetime(),
  memo: z.optional(z.string()),
});

export const PostingRequestSchema = z.object({
  fromAccountId: z.string(),
  toAccountId: z.string(),
  amountMinorUnits: z.number().int().positive(),
  memo: z.string().optional(),
});

export const PostingResponseSchema = z.object({
  postingId: z.string(),
  entries: z.array(EntryDtoSchema),
});

export const ProblemDetailSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string(),
});
export const AccountListSchema = z.array(AccountDtoSchema);
export const EntryListSchema = z.array(EntryDtoSchema);
