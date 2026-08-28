import { useState } from "react";
import Panel from "../components/Panel/Panel.tsx";
import AccountsTable from "../features/accounts/AccountsTable/AccountsTable.tsx";
import EntriesPanel from "../features/entries/EntriesPanel/EntriesPanel.tsx";
import TransferForm from "../features/postings/TransferForm/TransferForm.tsx";
import { AccountListSchema, EntryListSchema } from "../shared/api/schemas.ts";
import { useQuery } from "../shared/api/useQuery.ts";
import { CURRENT_LCX_RUNG } from "../shared/config.ts";
import { invalidate } from "../shared/query/queryStore.ts";
import styles from "./App.module.css";

function App() {
  const [selectedAccountId, setSelectedAccountId] = useState("acc-cash");

  const {
    state: accountsState,
    refetch: refetchAccounts,
    isRevalidating: isAccountRevalidating,
  } = useQuery("accounts", "/api/accounts", AccountListSchema);
  const {
    state: entriesState,
    refetch: refetchEntries,
    isRevalidating: isEntriesRevalidating,
  } = useQuery(
    `entries:${selectedAccountId}`,
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
            isRevalidatingAccounts={isAccountRevalidating}
          />
        </Panel>
        <Panel title={activeAccount ? `Entries — ${activeAccount.name}` : "Entries"}>
          <EntriesPanel
            entriesState={entriesState}
            onRetry={() => refetchEntries()}
            isRevalidatingEntries={isEntriesRevalidating}
          />
        </Panel>
        <Panel title="New Transfer">
          <TransferForm
            accounts={accounts}
            onPostingSucceeded={(fromId, toId) => {
              invalidate("accounts");
              invalidate(`entries:${fromId}`);
              invalidate(`entries:${toId}`);
            }}
          />
        </Panel>
      </main>
    </div>
  );
}

export default App;
