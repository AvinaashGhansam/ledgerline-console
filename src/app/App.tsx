import { useState } from "react";
import Panel from "../components/Panel/Panel.tsx";
import AccountsTable from "../features/accounts/AccountsTable/AccountsTable.tsx";
import EntriesPanel from "../features/entries/EntriesPanel/EntriesPanel.tsx";
import TransferForm from "../features/postings/TransferForm/TransferForm.tsx";
import { accounts, entries as ledgerEntries } from "../mocks/fixtures.ts";
import styles from "./App.module.css";

function App() {
  const [selectedAccountId, setSelectedAccountId] = useState("acc-cash");
  const [entries, setEntries] = useState(ledgerEntries);

  const activeAccount = accounts.find((account) => account.id === selectedAccountId);

  const activeEntries = entries
    .filter((entry) => entry.accountId === selectedAccountId)
    .toSorted((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.appHeader}>
        <h1>Ledgerline Console [LCX-0]</h1>
      </header>
      <main className={styles.appGrid}>
        <Panel title="Accounts">
          <AccountsTable
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            onSelect={handleSelectAccount}
          />
        </Panel>
        <Panel title={activeAccount ? `Entries — ${activeAccount.name}` : "Entries"}>
          <EntriesPanel entries={activeEntries} />
        </Panel>
        <Panel title="New Transfer">
          <TransferForm accounts={accounts} />
        </Panel>
      </main>
    </div>
  );
}

export default App;
