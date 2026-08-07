import { delay, HttpResponse, http } from "msw";
import { accounts, entries } from "./fixtures.ts";

export const handlers = [
  http.get("/api/accounts", async () => {
    await delay(500);
    return HttpResponse.json(accounts);
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

    const findEntries = entries.filter((entry) => entry.accountId === id);

    return HttpResponse.json(findEntries);
  }),
];
