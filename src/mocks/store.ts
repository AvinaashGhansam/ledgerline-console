import { accounts, entries } from "./fixtures.ts";

export const mockAccounts = accounts.map((acc) => ({ ...acc }));
export const mockEntries = entries.map((entry) => ({ ...entry }));
