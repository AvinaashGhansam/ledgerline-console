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

  const filteredEntries =
    currentFilter === "ALL"
      ? entriesState.data
      : entriesState.data?.filter((entry) => entry.direction === currentFilter);

  return (
    <>
      <div className={styles.filterButtons}>
        <button
          className={styles.button}
          style={{ fontWeight: currentFilter === "ALL" ? "bold" : "normal" }}
          type="button"
          onClick={() => {
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.delete("direction");
              return next;
            });
          }}
        >
          All
        </button>
        <button
          className={styles.button}
          style={{ fontWeight: currentFilter === "DEBIT" ? "bold" : "normal" }}
          type="button"
          onClick={() =>
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set("direction", "DEBIT");
              return next;
            })
          }
        >
          Debit
        </button>
        <button
          className={styles.button}
          style={{ fontWeight: currentFilter === "CREDIT" ? "bold" : "normal" }}
          type="button"
          onClick={() =>
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set("direction", "CREDIT");
              return next;
            })
          }
        >
          Credit
        </button>
      </div>
      {filteredEntries.length === 0 && (
        <div className={styles.emptyState}>No Transactions found for this account</div>
      )}
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
    </>
  );
};

const DirectionBadge = ({ direction }: { direction: EntryDto["direction"] }) => {
  const badgeColorClass = direction === "DEBIT" ? styles.badgeDebit : styles.badgeCredit;
  return <span className={`${styles.badge} ${badgeColorClass}`}>{direction}</span>;
};
export default EntriesPanel;
