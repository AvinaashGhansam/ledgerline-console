import { type ChangeEvent, type SubmitEvent, useReducer } from "react";
import type { AccountDto, EntryDto } from "../../../shared/api/types.ts";
import { parseMoney } from "../../../shared/money/parseMoney.ts";
import { useToast } from "../../../shared/toast/ToastProvider.tsx";
import styles from "./TransferForm.module.css";

type TransferFormProps = {
  accounts: readonly AccountDto[];
  onAdd: (entries: EntryDto[]) => void;
};

type MutationState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "error"; error: string; fieldErrors?: Record<string, string> };

type PostingState = {
  fields: {
    fromAccountId: string;
    toAccountId: string;
    amount: string;
    memo?: string;
  };
  mutation: MutationState;
};

type PostingAction =
  | {
      type: "fieldChanged";
      payload: { field: keyof PostingState["fields"]; value: string };
    }
  | { type: "submitStarted" }
  | { type: "submitFailed"; payload: { error: string; fieldErrors?: Record<string, string> } }
  | { type: "submitSucceeded" };

const postingReducer = (state: PostingState, action: PostingAction): PostingState => {
  switch (action.type) {
    case "fieldChanged":
      if (state.mutation.status === "pending") {
        return state;
      }
      return {
        ...state,
        fields: { ...state.fields, [action.payload.field]: action.payload.value },
        mutation: { status: "idle" },
      };
    case "submitStarted":
      return { ...state, mutation: { status: "pending" } };
    case "submitFailed": {
      return {
        ...state,
        mutation: {
          status: "error",
          error: action.payload.error,
          fieldErrors: action.payload.fieldErrors,
        },
      };
    }
    case "submitSucceeded":
      return {
        ...initialPostingState,
      };
  }
};

export const initialPostingState: PostingState = {
  fields: {
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    memo: "",
  },
  mutation: {
    status: "idle",
  },
};

const TransferForm = ({ accounts, onAdd }: TransferFormProps) => {
  const [form, formDispatch] = useReducer(postingReducer, initialPostingState);
  const { show } = useToast();
  const { fromAccountId, toAccountId, amount, memo } = form.fields;
  const toAccountCurrency = accounts.find((acc) => acc.id === toAccountId)?.currency;
  const fromAccountCurrency = accounts.find((acc) => acc.id === fromAccountId)?.currency;
  const isDirty = fromAccountId !== "" || toAccountId !== "" || amount !== "";
  const isToMuted = form.fields.fromAccountId === "";
  const isAmountMuted = isToMuted || form.fields.toAccountId === "";

  const parsedMoney = parseMoney(amount);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    formDispatch({
      type: "fieldChanged",
      payload: {
        field: e.target.name as keyof PostingState["fields"],
        value: e.target.value,
      },
    });
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    const hasLocalErrors = Object.keys(localErrors).length > 0;
    if (hasLocalErrors) {
      return;
    }

    const currency = accounts.find((acc) => acc.id === fromAccountId)?.currency;

    if (!parsedMoney.ok || !currency) {
      return;
    }

    const postingId = crypto.randomUUID();
    const occurredAt = new Date().toISOString();
    const amountMinorUnits = parsedMoney.value;

    const debit: EntryDto = {
      id: crypto.randomUUID(),
      accountId: fromAccountId,
      postingId,
      direction: "DEBIT",
      amountMinorUnits,
      currency,
      occurredAt,
      memo: memo,
    };

    const credit: EntryDto = {
      id: crypto.randomUUID(),
      accountId: toAccountId,
      postingId,
      direction: "CREDIT",
      amountMinorUnits,
      currency,
      occurredAt,
      memo: memo,
    };

    onAdd([debit, credit]);
    formDispatch({ type: "submitSucceeded" });
    show("Transfer successful!", "success");
  };

  const getLocalFieldErrors = () => {
    const errors: Partial<Record<keyof PostingState["fields"], string>> = {};

    if (fromAccountId && toAccountId && toAccountId === fromAccountId) {
      errors.toAccountId = "Cannot transfer to the same account.";
    }

    if (fromAccountId && toAccountId && fromAccountCurrency !== toAccountCurrency) {
      errors.toAccountId = "Account must have the same currency.";
    }

    if (amount !== "") {
      if (!parsedMoney.ok) {
        errors.amount = parsedMoney.reason;
      }
    }

    if (parsedMoney.ok && parsedMoney.value <= 0) {
      errors.amount = "Transfer amount must be greater than zero.";
    }

    return errors;
  };

  const localErrors = getLocalFieldErrors();

  const accountOptions = (
    <>
      <option value="" disabled>
        Select Account...
      </option>
      {accounts.map((acc) => (
        <option key={acc.id} value={acc.id}>
          {acc.name}
        </option>
      ))}
    </>
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="fromAccountId">
          From Account Number
        </label>
        <select
          className={styles.input}
          name="fromAccountId"
          id="fromAccountId"
          value={fromAccountId}
          onChange={handleChange}
        >
          {accountOptions}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="toAccountId">
          To Account Number
        </label>
        <select
          className={styles.input}
          name="toAccountId"
          id="toAccountId"
          value={toAccountId}
          disabled={isToMuted}
          onChange={handleChange}
        >
          {accountOptions}
        </select>
        {localErrors.toAccountId && <p className={styles.error}>{localErrors.toAccountId}</p>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="amount">
          Amount
        </label>
        <input
          className={styles.input}
          name="amount"
          id="amount"
          value={amount}
          disabled={isAmountMuted}
          onChange={handleChange}
        />
        {isDirty && localErrors.amount && <p className={styles.error}>{localErrors.amount}</p>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="memo">
          Memo
        </label>
        <input
          className={styles.input}
          name="memo"
          id="memo"
          value={memo}
          disabled={isAmountMuted}
          onChange={handleChange}
        />
      </div>
      <button
        className={styles.button}
        type="submit"
        disabled={Object.keys(localErrors).length > 0 || isAmountMuted || amount === ""}
      >
        Add Transfer
      </button>
    </form>
  );
};
export default TransferForm;
