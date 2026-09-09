import { useSearchParams } from "react-router";
import type { EntryDto } from "../../../shared/api/types.ts";
import { formatDate } from "../../../shared/date/formatDate.ts";
import { formatMoney } from "../../../shared/money/formatMoney.ts";
import type { RequestState } from "../../../shared/types.ts";
import styles from "./EntriesPanel.module.css";

type EntriesPanelProps = {
  entriesState: RequestState<EntryDto[]>;
  onRetry: () => void;
  isRevalidatingEntries: boolean;
};

const EntriesPanel = ({ entriesState, onRetry, isRevalidatingEntries }: EntriesPanelProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const param = searchParams.get("direction");
  const currentFilter = param === "DEBIT" || param === "CREDIT" ? param : "ALL";

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

  const filteredEntries =
    currentFilter === "ALL"
      ? entriesState.data
      : entriesState.data.filter((entry) => entry.direction === currentFilter);

  const handleFilterChange = (direction: "ALL" | "CREDIT" | "DEBIT" = "ALL") => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (direction === "ALL") {
        next.delete("direction");
      } else {
        next.set("direction", direction);
      }
      return next;
    });
  };

  return (
    <>
      <div className={styles.filterButtons}>
        <button
          className={
            currentFilter === "ALL" ? `${styles.button} ${styles.boldText}` : styles.button
          }
          aria-pressed={currentFilter === "ALL"}
          type="button"
          onClick={() => handleFilterChange()}
        >
          All
        </button>
        <button
          className={
            currentFilter === "DEBIT" ? `${styles.button} ${styles.boldText}` : styles.button
          }
          aria-pressed={currentFilter === "DEBIT"}
          type="button"
          onClick={() => handleFilterChange("DEBIT")}
        >
          Debit
        </button>
        <button
          className={
            currentFilter === "CREDIT" ? `${styles.button} ${styles.boldText}` : styles.button
          }
          aria-pressed={currentFilter === "CREDIT"}
          type="button"
          onClick={() => handleFilterChange("CREDIT")}
        >
          Credit
        </button>
      </div>
      {filteredEntries.length === 0 ? (
        <div
          className={styles.emptyState}
        >{`No ${currentFilter.toLowerCase()} transactions found`}</div>
      ) : (
        <ul
          className={styles.list}
          style={{ opacity: isRevalidatingEntries ? 0.5 : 1, transition: "opacity 0.2s" }}
        >
          {filteredEntries.map((activeEntry) => (
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
      )}
    </>
  );
};

const DirectionBadge = ({ direction }: { direction: EntryDto["direction"] }) => {
  const badgeColorClass = direction === "DEBIT" ? styles.badgeDebit : styles.badgeCredit;
  return <span className={`${styles.badge} ${badgeColorClass}`}>{direction}</span>;
};
export default EntriesPanel;
