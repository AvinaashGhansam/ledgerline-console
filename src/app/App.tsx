import { useState } from "react";
import Panel from "../components/Panel/Panel.tsx";
import AccountsTable from "../features/accounts/AccountsTable/AccountsTable.tsx";
import EntriesPanel from "../features/entries/EntriesPanel/EntriesPanel.tsx";
import TransferForm from "../features/postings/TransferForm/TransferForm.tsx";
import { AccountListSchema, EntryListSchema } from "../shared/api/schemas.ts";
import { useQuery } from "../shared/api/useQuery.ts";
import { CURRENT_LCX_RUNG } from "../shared/config.ts";
import styles from "./App.module.css";

function App() {
  const [selectedAccountId, setSelectedAccountId] = useState("acc-cash");

  const { state: accountsState, refetch: refetchAccounts } = useQuery(
    "accounts",
    "/api/accounts",
    AccountListSchema,
  );
  const { state: entriesState, refetch: refetchEntries } = useQuery(
    "entries",
    `/api/accounts/${selectedAccountId}/entries`,
    EntryListSchema,
  );

  const accounts = accountsState.status === "success" ? accountsState.data : [];
  const activeAccount = accounts.find((account) => account.id === selectedAccountId);

  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.appHeader}>
        <h1>Ledgerline Console [LCX-{CURRENT_LCX_RUNG}]</h1>
      </header>
      <main className={styles.appGrid}>
        <Panel title="Accounts">
          <AccountsTable
            accountsState={accountsState}
            selectedAccountId={selectedAccountId}
            onSelect={handleSelectAccount}
            onRetry={() => refetchAccounts()}
          />
        </Panel>
        <Panel title={activeAccount ? `Entries — ${activeAccount.name}` : "Entries"}>
          <EntriesPanel entriesState={entriesState} onRetry={() => refetchEntries()} />
        </Panel>
        <Panel title="New Transfer">
          <TransferForm
            accounts={accounts}
            onPostingSucceeded={() => {
              refetchAccounts();
              refetchEntries();
            }}
          />
        </Panel>
      </main>
    </div>
  );
}

export default App;
