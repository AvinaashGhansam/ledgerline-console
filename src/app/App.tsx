import Panel from "../components/Panel/Panel.tsx";
import AccountsTable from "../features/accounts/AccountsTable/AccountsTable.tsx";
import EntriesPanel from "../features/entries/EntriesPanel/EntriesPanel.tsx";
import { accounts, entries } from "../mocks/fixtures.ts";
import styles from "./App.module.css";

function App() {
  return (
    <div className={styles.appContainer}>
      <header className={styles.appHeader}>
        <h1>Ledgerline Console [LCX-0]</h1>
      </header>
      <main className={styles.appGrid}>
        <Panel title="Accounts">
          <AccountsTable accounts={accounts} />
        </Panel>
        <Panel title="Entries - Cash">
          <EntriesPanel entries={entries} />
        </Panel>
      </main>
    </div>
  );
}

export default App;
