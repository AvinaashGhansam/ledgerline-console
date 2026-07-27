import type { AccountDto, EntryDto } from "../shared/api/types.ts";

export const accounts: readonly AccountDto[] = [
  { id: "acc-cash", name: "Cash", currency: "USD", balanceMinorUnits: 125_000 },
  { id: "acc-rev", name: "Revenue", currency: "USD", balanceMinorUnits: 310_500 },
  { id: "acc-exp", name: "Expenses", currency: "USD", balanceMinorUnits: -4_200 },
  { id: "acc-eur", name: "EUR Clearing", currency: "EUR", balanceMinorUnits: 99_999 },
] as const;

export const entries: readonly EntryDto[] = [
  {
    id: "ent-9",
    accountId: "acc-cash",
    postingId: "pst-5",
    direction: "CREDIT",
    amountMinorUnits: 25_000,
    currency: "USD",
    occurredAt: "2026-07-21T14:03:00Z",
    memo: "Invoice #1042 settled",
  },
  {
    id: "ent-8",
    accountId: "acc-rev",
    postingId: "pst-5",
    direction: "DEBIT",
    amountMinorUnits: 25_000,
    currency: "USD",
    occurredAt: "2026-07-21T14:03:00Z",
    memo: "Invoice #1042 settled",
  },
  {
    id: "ent-7",
    accountId: "acc-cash",
    postingId: "pst-4",
    direction: "DEBIT",
    amountMinorUnits: 4_200,
    currency: "USD",
    occurredAt: "2026-07-19T09:30:00Z",
    memo: "Office supplies",
  },
  {
    id: "ent-6",
    accountId: "acc-exp",
    postingId: "pst-4",
    direction: "CREDIT",
    amountMinorUnits: 4_200,
    currency: "USD",
    occurredAt: "2026-07-19T09:30:00Z",
    memo: "Office supplies",
  },
  {
    id: "ent-5",
    accountId: "acc-cash",
    postingId: "pst-3",
    direction: "CREDIT",
    amountMinorUnits: 100_000,
    currency: "USD",
    occurredAt: "2026-07-15T08:00:00Z",
  },
] as const;
