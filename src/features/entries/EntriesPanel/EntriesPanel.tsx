import type { EntryDto } from "../../../shared/api/types.ts";
import { formatDate } from "../../../shared/date/formatDate.ts";
import { formatMoney } from "../../../shared/money/formatMoney.ts";
import styles from "./EntriesPanel.module.css";

type EntriesPanelProps = {
  entries: readonly EntryDto[];
};

const EntriesPanel = ({ entries }: EntriesPanelProps) => {
  // Opted for Option B (hoisted filtering): Keeps this component perfectly pure for testing and scales better as the app grows.
  if (entries.length === 0) {
    return <div className={styles.emptyState}>No Transactions found for this account</div>;
  }

  return (
    <ul className={styles.list}>
      {entries.map((activeEntry) => (
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
