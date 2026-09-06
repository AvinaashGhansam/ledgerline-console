import { NavLink, useParams } from "react-router";
import type { AccountDto } from "../../../shared/api/types.ts";
import { formatMoney } from "../../../shared/money/formatMoney.ts";
import type { RequestState } from "../../../shared/types.ts";
import styles from "./AccountsTable.module.css";

type AccountsTableProps = {
  accountsState: RequestState<AccountDto[]>;
  onRetry: () => void;
  isRevalidatingAccounts: boolean;
};

const AccountsTable = ({ accountsState, onRetry, isRevalidatingAccounts }: AccountsTableProps) => {
  const { accountId } = useParams();

  if (accountsState.status === "loading") {
    return <div>Loading accounts...</div>;
  }

  if (accountsState.status === "error") {
    return (
      <div>
        <p>{accountsState.message}</p>
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  }

  const sortedAccounts = accountsState.data.toSorted((a, b) => a.name.localeCompare(b.name));

  return (
    <table
      className={`${styles.table}`}
      style={{
        opacity: isRevalidatingAccounts ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Currency</th>
          <th scope="col" className={styles.numeric}>
            Balance
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedAccounts.map((acc) => {
          const isSelected = acc.id === accountId;

          return (
            <tr key={acc.id} className={isSelected ? styles.selectedRow : styles.row}>
              <td>
                <NavLink to={`/accounts/${acc.id}`}>{acc.name}</NavLink>
              </td>
              <td>{acc.currency}</td>
              <td className={acc.balanceMinorUnits < 0 ? styles.negative : styles.balance}>
                {formatMoney(acc.balanceMinorUnits, acc.currency)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default AccountsTable;
