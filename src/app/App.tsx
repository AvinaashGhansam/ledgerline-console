import Panel from "../components/Panel/Panel.tsx";
import AccountsTable from "../features/accounts/AccountsTable/AccountsTable.tsx";
import EntriesPanel from "../features/entries/EntriesPanel/EntriesPanel.tsx";
import { accounts, entries } from "../mocks/fixtures.ts";
import styles from "./App.module.css";
import { useState } from "react";

function App() {
  const [selectedAccountId, setSelectedAccountId] = useState("acc-cash");
  const activeAccount = accounts.find((account) => account.id === selectedAccountId);

  console.log("App rendered");

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
          <EntriesPanel entries={entries} selectedAccountId={selectedAccountId} />
        </Panel>
      </main>
    </div>
  );
}

export default App;
