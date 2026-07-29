import type { EntryDto } from "../../../shared/api/types.ts";
import { formatDate } from "../../../shared/date/formatDate.ts";
import { formatMoney } from "../../../shared/money/formatMoney.ts";
import styles from "./EntriesPanel.module.css";

type EntriesPanelProps = {
  entries: readonly EntryDto[];
  selectedAccountId: string;
};

const EntriesPanel = ({ entries, selectedAccountId }: EntriesPanelProps) => {
  console.log("Entries rendered");
  const activeEntries = entries
    .filter((entry) => entry.accountId === selectedAccountId)
    .toSorted((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return (
    <ul className={styles.list}>
      {activeEntries.map((activeEntry) => (
        <li key={activeEntry.id} className={styles.entryRow}>
          <div className={styles.entryHeader}>
            <span className={styles.date}>{formatDate(activeEntry.occurredAt)}</span>
            <DirectionBadge direction={activeEntry.direction} />
            <div className={styles.amount}>
              {formatMoney(activeEntry.amountMinorUnits, activeEntry.currency)}
            </div>
          </div>
          {activeEntry.memo && <p className={styles.memo}>{activeEntry.memo}</p>}
        </li>
      ))}
    </ul>
  );
};

const DirectionBadge = ({ direction }: { direction: EntryDto["direction"] }) => {
  const badgeColorClass = direction === "DEBIT" ? styles.badgeDebit : styles.badgeCredit;
  return <span className={`${styles.badge} ${badgeColorClass}`}>{direction}</span>;
};
export default EntriesPanel;
