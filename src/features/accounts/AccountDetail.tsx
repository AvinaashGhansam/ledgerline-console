import { useParams } from "react-router";
import Panel from "../../components/Panel/Panel.tsx";
import { AccountListSchema, EntryListSchema } from "../../shared/api/schemas.ts";
import { useQuery } from "../../shared/api/useQuery.ts";
import EntriesPanel from "../entries/EntriesPanel/EntriesPanel.tsx";

const AccountDetail = () => {
  const { accountId } = useParams();

  const { state: accountsState, refetch: accountRetry } = useQuery(
    "accounts",
    "/api/accounts",
    AccountListSchema,
  );

  const {
    state: entriesState,
    refetch: entriesRetry,
    isRevalidating: entriesRevalidate,
  } = useQuery(`entries:${accountId}`, `/api/accounts/${accountId}/entries`, EntryListSchema);

  const activeAccount =
    accountsState.status === "success"
      ? accountsState.data.find((acc) => acc.id === accountId)
      : null;

  let accountTitle: string;
  switch (accountsState.status) {
    case "loading": {
      accountTitle = "Loading account...";
      break;
    }
    case "error": {
      accountTitle = "Account Error";
      break;
    }
    case "success": {
      if (activeAccount) {
        accountTitle = `Account: ${activeAccount.name}`;
      } else {
        accountTitle = "Account Not Found";
      }
      break;
    }
  }

  const isConfirmedNotFound = accountsState.status === "success" && !activeAccount;
  return (
    <Panel title={accountTitle}>
      {accountsState.status === "error" && (
        <div>
          <p>{accountsState.message}</p>
          <button type="button" onClick={accountRetry}>
            Retry
          </button>
        </div>
      )}
      {!isConfirmedNotFound && (
        <EntriesPanel
          entriesState={entriesState}
          onRetry={entriesRetry}
          isRevalidatingEntries={entriesRevalidate}
        />
      )}
    </Panel>
  );
};
export default AccountDetail;
