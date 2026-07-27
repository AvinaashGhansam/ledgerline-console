import type { Currency } from "../api/types.ts";

export const formatMoney = (minorUnits: number, currency: Currency): string => {
  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency });
  return formatter.format(minorUnits / 100);
};
