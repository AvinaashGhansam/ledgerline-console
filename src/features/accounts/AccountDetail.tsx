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

  if (accountsState.status === "loading") {
    return <div>Loading...</div>;
  }

  if (accountsState.status === "error") {
    return (
      <div>
        <p>{accountsState.message}</p>
        <button type="button" onClick={accountRetry}>
          Retry
        </button>
      </div>
    );
  }

  const activeAccount = accountsState.data.find((acc) => acc.id === accountId);

  if (!activeAccount) {
    return <div>Account Not Found</div>;
  }

  return (
    <Panel title={`Account: ${activeAccount.name}`}>
      <EntriesPanel
        entriesState={entriesState}
        onRetry={entriesRetry}
        isRevalidatingEntries={entriesRevalidate}
      />
    </Panel>
  );
};
export default AccountDetail;
