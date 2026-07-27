export type AccountDto = {
  id: string;
  name: string;
  currency: Currency;
  balanceMinorUnits: number;
};

export type EntryDto = {
  id: string;
  accountId: string;
  postingId: string;
  direction: "CREDIT" | "DEBIT";
  amountMinorUnits: number;
  currency: Currency;
  occurredAt: string;
  memo?: string;
};

export type Currency = "USD" | "EUR";
