import { useEffect, useState } from "react";
import Panel from "../components/Panel/Panel.tsx";
import AccountsTable from "../features/accounts/AccountsTable/AccountsTable.tsx";
import EntriesPanel from "../features/entries/EntriesPanel/EntriesPanel.tsx";
import TransferForm from "../features/postings/TransferForm/TransferForm.tsx";
import { getJson, toMessage } from "../shared/api/client.ts";
import { AccountListSchema, EntryListSchema } from "../shared/api/schemas.ts";
import type { AccountDto, EntryDto } from "../shared/api/types.ts";
import type { RequestState } from "../shared/types.ts";
import styles from "./App.module.css";

function App() {
  const [selectedAccountId, setSelectedAccountId] = useState("acc-cash");
  // local writes are unknown to the mock server until LCX-3, this is purely a client-side illusion of persistence
  const [postedEntries, setPostedEntries] = useState<EntryDto[]>([]);
  const [accountsState, setAccountsState] = useState<RequestState<AccountDto[]>>({
    status: "loading",
  });
  const [entriesState, setEntriesState] = useState<RequestState<EntryDto[]>>({ status: "loading" });
  const [accountsRetry, setAccountsRetry] = useState(0);
  const [entriesRetry, setEntriesRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getJson(`/api/accounts`, AccountListSchema, {
      signal: controller.signal,
      headers: { "X-Retry": String(accountsRetry) },
    })
      .then((data) => {
        setAccountsState({ status: "success", data });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setAccountsState({ status: "error", message: toMessage(err) });
      });
    return () => {
      controller.abort();
    };
  }, [accountsRetry]);

  useEffect(() => {
    setEntriesState({ status: "loading" });
    const controller = new AbortController();

    getJson(`/api/accounts/${selectedAccountId}/entries`, EntryListSchema, {
      signal: controller.signal,
      headers: { "X-Retry": String(entriesRetry) },
    })
      .then((data) => {
        setEntriesState({ status: "success", data });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setEntriesState({ status: "error", message: toMessage(err) });
      });
    console.log("Retrying...", entriesRetry);
    return () => {
      controller.abort();
    };
  }, [selectedAccountId, entriesRetry]);

  const accounts = accountsState.status === "success" ? accountsState.data : [];
  const activeAccount = accounts.find((account) => account.id === selectedAccountId);

  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
  };

  const handleAddEntries = (newEntries: EntryDto[]) => {
    setPostedEntries((prevEntry) => [...prevEntry, ...newEntries]);
  };

  const derivedAccountsState: RequestState<AccountDto[]> =
    accountsState.status === "success"
      ? {
          status: "success",
          data: accounts.map((acc) => {
            const sum = postedEntries
              .filter((entry) => entry.accountId === acc.id)
              .reduce((runningTotal, currEntry) => {
                // Check the direction to decide if we add or subtract!
                if (currEntry.direction === "CREDIT") {
                  return runningTotal + currEntry.amountMinorUnits;
                } else {
                  return runningTotal - currEntry.amountMinorUnits;
                }
              }, 0);
            return {
              ...acc,
              balanceMinorUnits: acc.balanceMinorUnits + sum,
            };
          }),
        }
      : accountsState;

  const derivedEntriesState: RequestState<EntryDto[]> =
    entriesState.status === "success"
      ? {
          status: "success",
          data: [
            ...entriesState.data,
            ...postedEntries.filter((entry) => entry.accountId === selectedAccountId),
          ].toSorted((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
        }
      : entriesState;

  return (
    <div className={styles.appContainer}>
      <header className={styles.appHeader}>
        <h1>Ledgerline Console [LCX-1]</h1>
      </header>
      <main className={styles.appGrid}>
        <Panel title="Accounts">
          <AccountsTable
            accountsState={derivedAccountsState}
            selectedAccountId={selectedAccountId}
            onSelect={handleSelectAccount}
            onRetry={() => setAccountsRetry((t) => t + 1)}
          />
        </Panel>
        <Panel title={activeAccount ? `Entries — ${activeAccount.name}` : "Entries"}>
          <EntriesPanel
            entriesState={derivedEntriesState}
            onRetry={() => setEntriesRetry((t) => t + 1)}
          />
        </Panel>
        <Panel title="New Transfer">
          <TransferForm accounts={accounts} onAdd={handleAddEntries} />
        </Panel>
      </main>
    </div>
  );
}

export default App;
