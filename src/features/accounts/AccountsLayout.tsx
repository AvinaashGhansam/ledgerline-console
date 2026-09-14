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
        {/*  This form is mounted here because this layout never unmounts when a use clicks between different accounts in the account table. The form local state will survive navigation*/}
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
