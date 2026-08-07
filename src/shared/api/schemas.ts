import { z } from "zod";

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
