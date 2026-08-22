import { delay, HttpResponse, http } from "msw";
import { CURRENCY_MISMATCH_TYPE } from "../shared/api/schemas.ts";
import type { EntryDto, PostingRequest } from "../shared/api/types.ts";
import { mockAccounts, mockEntries } from "./store.ts";

export const handlers = [
  http.get("/api/accounts", async () => {
    await delay(500);
    return HttpResponse.json(mockAccounts);
  }),
  http.get("/api/accounts/:id/entries", async ({ params, request }) => {
    const id = params.id;
    await delay(Math.random() * 600 + 200);

    const url = new URL(request.url);

    // A query parameter to force an error. Ex: /api/accounts/acc-rev/entries?forceError=true
    const forceError = url.searchParams.get("forceError");
    if (forceError === "true") {
      return new HttpResponse(null, { status: 500 });
    }

    const findEntries = mockEntries.filter((entry) => entry.accountId === id);

    return HttpResponse.json(findEntries);
  }),
  http.post("/api/postings", async ({ request }) => {
    const body = (await request.json()) as PostingRequest;

    const fromAccount = mockAccounts.find((acc) => acc.id === body.fromAccountId);
    const toAccount = mockAccounts.find((acc) => acc.id === body.toAccountId);

    if (!fromAccount) {
      return HttpResponse.json(
        {
          type: "about:blank",
          title: "Account Not Found",
          status: 404,
          detail: "from account does not exist for this transaction",
        },
        { status: 404, headers: { "Content-Type": "application/problem+json" } },
      );
    }

    if (!toAccount) {
      return HttpResponse.json(
        {
          type: "about:blank",
          title: "Account Not Found",
          status: 404,
          detail: "'to account' does not exist for this transaction",
        },
        { status: 404, headers: { "Content-Type": "application/problem+json" } },
      );
    }

    if (fromAccount.currency !== toAccount.currency) {
      return HttpResponse.json(
        {
          type: CURRENCY_MISMATCH_TYPE,
          title: "Currency Mismatch",
          status: 422,
          detail: `Cannot transfer between ${fromAccount.currency} and ${toAccount.currency} accounts`,
        },
        { status: 422, headers: { "Content-Type": "application/problem+json" } },
      );
    }

    const postingId = crypto.randomUUID();
    const occurredAt = new Date().toISOString();

    const debitEntryDto: EntryDto = {
      id: crypto.randomUUID(),
      postingId: postingId,
      occurredAt: occurredAt,
      accountId: fromAccount.id,
      amountMinorUnits: body.amountMinorUnits,
      currency: fromAccount.currency,
      direction: "DEBIT",
      memo: body.memo,
    };

    const creditEntryDto: EntryDto = {
      id: crypto.randomUUID(),
      postingId: postingId,
      occurredAt: occurredAt,
      accountId: toAccount.id,
      amountMinorUnits: body.amountMinorUnits,
      currency: toAccount.currency,
      direction: "CREDIT",
      memo: body.memo,
    };

    mockEntries.push(debitEntryDto);
    mockEntries.push(creditEntryDto);

    fromAccount.balanceMinorUnits -= body.amountMinorUnits;
    toAccount.balanceMinorUnits += body.amountMinorUnits;

    return HttpResponse.json(
      {
        postingId: postingId,
        entries: [debitEntryDto, creditEntryDto],
      },
      { status: 201 },
    );
  }),
];
