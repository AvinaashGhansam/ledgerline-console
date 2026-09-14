import { Outlet } from "react-router";
import Panel from "../../components/Panel/Panel.tsx";
import { AccountListSchema } from "../../shared/api/schemas.ts";
import { useQuery } from "../../shared/api/useQuery.ts";
import { invalidate } from "../../shared/query/queryStore.ts";
import TransferForm from "../postings/TransferForm/TransferForm.tsx";
import styles from "./AccountLayout.module.css";
import AccountsTable from "./AccountsTable/AccountsTable.tsx";

export default function AccountsLayout() {
  const {
    state: accountsState,
    refetch: refetchAccounts,
    isRevalidating: isAccountRevalidating,
  } = useQuery("accounts", "/api/accounts", AccountListSchema);

  const accounts = accountsState.status === "success" ? accountsState.data : [];

  return (
    <main className={styles.accountsGrid}>
      <Panel title="Accounts">
        <AccountsTable
          accountsState={accountsState}
          onRetry={() => refetchAccounts()}
          isRevalidatingAccounts={isAccountRevalidating}
        />
      </Panel>
      <div className={styles.rightColumn}>
        <Outlet />
        {/*
  R8 / REM-V UX Decision:
  The Transfer form is mounted in the persistent layout rather than as a route.
  It acts as an independent workspace: its `fromAccountId` and `toAccountId`
  selections are driven by its own local dropdowns, completely decoupled from
  the currently viewed `:accountId` in the URL.

  This intentionally allows users to safely persist an in-progress transfer
  draft while freely navigating between different account ledgers in the sidebar
  to check balances.
*/}
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
      </div>
    </main>
  );
}
