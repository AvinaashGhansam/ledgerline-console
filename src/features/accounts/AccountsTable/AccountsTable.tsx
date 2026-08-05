import type * as React from "react";
import type { AccountDto } from "../../../shared/api/types.ts";
import { formatMoney } from "../../../shared/money/formatMoney.ts";
import styles from "./AccountsTable.module.css";

type AccountsTableProps = {
  accounts: readonly AccountDto[];
  selectedAccountId: string;
  onSelect: (id: string) => void;
};

const AccountsTable = ({ accounts, selectedAccountId, onSelect }: AccountsTableProps) => {
  const sortedAccounts = accounts.toSorted((a, b) => a.name.localeCompare(b.name));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, id: string) => {
    if (e.key === " ") {
      e.preventDefault();
    }
    onSelect(id);
  };

  return (
    <table className={styles.table}>
      <thead>
        <tr tabIndex={0}>
          <th scope="col">Name</th>
          <th scope="col">Currency</th>
          <th scope="col" className={styles.numeric}>
            Balance
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedAccounts.map((acc) => (
          <tr
            key={acc.id}
            onClick={() => onSelect(acc.id)}
            className={acc.id === selectedAccountId ? styles.selectedRow : ""}
            tabIndex={0}
            aria-selected={acc.id === selectedAccountId}
            onKeyDown={(e) => handleKeyDown(e, acc.id)}
          >
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
