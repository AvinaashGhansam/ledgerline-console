import { Outlet } from "react-router";
import Panel from "../../components/Panel/Panel.tsx";
import { AccountListSchema } from "../../shared/api/schemas.ts";
import { useQuery } from "../../shared/api/useQuery.ts";
import styles from "./AccountLayout.module.css";
import AccountsTable from "./AccountsTable/AccountsTable.tsx";

export default function AccountsLayout() {
  const {
    state: accountsState,
    refetch: refetchAccounts,
    isRevalidating: isAccountRevalidating,
  } = useQuery("accounts", "/api/accounts", AccountListSchema);

  return (
    <main className={styles.accountsGrid}>
      <Panel title="Accounts">
        <AccountsTable
          accountsState={accountsState}
          onRetry={() => refetchAccounts()}
          isRevalidatingAccounts={isAccountRevalidating}
        />
      </Panel>
      <Outlet />
    </main>
  );
}
