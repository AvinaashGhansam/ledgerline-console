import type { AccountDto } from "../../shared/api/types.ts";
import styles from "./AccountsTable.module.css";
import { formatMoney } from "../../shared/money/formatMoney.ts";

type AccountTableProps = {
  accounts: readonly AccountDto[];
};

const AccountsTable = ({ accounts }: AccountTableProps) => {
  const sortedAccounts = accounts.toSorted((a, b) => a.name.localeCompare(b.name));
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Currency</th>
          <th scope="col" className={styles.numeric}>Balance</th>
        </tr>
      </thead>
      <tbody>
        {sortedAccounts.map((acc) => (
          <tr key={acc.id}>
            <td>{acc.name}</td>
            <td>{acc.currency}</td>
            <td className={acc.balanceMinorUnits < 0 ? styles.negative : styles.balance}>
              {formatMoney(acc.balanceMinorUnits, acc.currency)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default AccountsTable;
