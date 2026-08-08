import { useEffect, useState } from "react";
import Panel from "../components/Panel/Panel.tsx";
import AccountsTable from "../features/accounts/AccountsTable/AccountsTable.tsx";
import EntriesPanel from "../features/entries/EntriesPanel/EntriesPanel.tsx";
import TransferForm from "../features/postings/TransferForm/TransferForm.tsx";
import { entries as ledgerEntries } from "../mocks/fixtures.ts";
import { getJson, toMessage } from "../shared/api/client.ts";
import { AccountListSchema } from "../shared/api/schemas.ts";
import type { AccountDto, EntryDto } from "../shared/api/types.ts";
import type { RequestState } from "../shared/types.ts";
import styles from "./App.module.css";

function App() {
  const [selectedAccountId, setSelectedAccountId] = useState("acc-cash");
  const [entries, setEntries] = useState(ledgerEntries);
  const [accountsState, setAccountsState] = useState<RequestState<AccountDto[]>>({
    status: "loading",
  });

  useEffect(() => {
    const controller = new AbortController();

    getJson("/api/accounts", AccountListSchema, controller.signal)
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
  }, []);

  const accounts = accountsState.status === "success" ? accountsState.data : [];

  const activeAccount = accounts.find((account) => account.id === selectedAccountId);

  const activeEntries = entries
    .filter((entry) => entry.accountId === selectedAccountId)
    .toSorted((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
  };

  const handleAddEntries = (newEntries: EntryDto[]) => {
    setEntries((prevEntry) => [...prevEntry, ...newEntries]);
  };

  const newEntries = entries.slice(ledgerEntries.length);
  const derivedAccounts = accounts.map((acc) => {
    const sum = newEntries
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
  });

  return (
    <div className={styles.appContainer}>
      <header className={styles.appHeader}>
        <h1>Ledgerline Console [LCX-1]</h1>
      </header>
      <main className={styles.appGrid}>
        <Panel title="Accounts">
          <AccountsTable
            accounts={derivedAccounts}
            selectedAccountId={selectedAccountId}
            onSelect={handleSelectAccount}
          />
        </Panel>
        <Panel title={activeAccount ? `Entries — ${activeAccount.name}` : "Entries"}>
          <EntriesPanel entries={activeEntries} />
        </Panel>
        <Panel title="New Transfer">
          <TransferForm accounts={accounts} onAdd={handleAddEntries} />
        </Panel>
      </main>
    </div>
  );
}

export default App;
