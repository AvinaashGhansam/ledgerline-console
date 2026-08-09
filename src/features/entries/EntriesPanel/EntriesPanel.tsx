import type { EntryDto } from "../../../shared/api/types.ts";
import { formatDate } from "../../../shared/date/formatDate.ts";
import { formatMoney } from "../../../shared/money/formatMoney.ts";
import type { RequestState } from "../../../shared/types.ts";
import styles from "./EntriesPanel.module.css";

type EntriesPanelProps = {
  entriesState: RequestState<EntryDto[]>;
  onRetry: () => void;
};

const EntriesPanel = ({ entriesState, onRetry }: EntriesPanelProps) => {
  if (entriesState.status === "loading") {
    return <div>Loading entries...</div>;
  }

  if (entriesState.status === "error") {
    return (
      <div>
        <p>{entriesState.message}</p>
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  }

  if (entriesState.data.length === 0) {
    return <div className={styles.emptyState}>No Transactions found for this account</div>;
  }

  return (
    <ul className={styles.list}>
      {entriesState.data.map((activeEntry) => (
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
