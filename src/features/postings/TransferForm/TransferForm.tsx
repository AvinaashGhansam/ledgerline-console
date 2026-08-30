import { type ChangeEvent, type SubmitEvent, useReducer, useState } from "react";
import { ApiError, postJson, toMessage } from "../../../shared/api/client.ts";
import { CURRENCY_MISMATCH_TYPE, PostingResponseSchema } from "../../../shared/api/schemas.ts";
import type { AccountDto, PostingRequest } from "../../../shared/api/types.ts";
import { parseMoney } from "../../../shared/money/parseMoney.ts";
import { useToast } from "../../../shared/toast/ToastProvider.tsx";
import styles from "./TransferForm.module.css";

type TransferFormProps = {
  accounts: readonly AccountDto[];
  onPostingSucceeded: (fromAccountId: string, toAccountId: string) => void;
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

const TransferForm = ({ accounts, onPostingSucceeded }: TransferFormProps) => {
  const [form, formDispatch] = useReducer(postingReducer, initialPostingState);
  const [bypassCurrencyCheck, setBypassCurrencyCheck] = useState(false);
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

  const getLocalFieldErrors = () => {
    const errors: Partial<Record<keyof PostingState["fields"], string>> = {};

    if (fromAccountId && toAccountId && toAccountId === fromAccountId) {
      errors.toAccountId = "Cannot transfer to the same account.";
    }

    if (
      !bypassCurrencyCheck &&
      fromAccountId &&
      toAccountId &&
      fromAccountCurrency !== toAccountCurrency
    ) {
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

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const hasLocalErrors = Object.keys(localErrors).length > 0;
    if (hasLocalErrors) {
      return;
    }

    const currency = accounts.find((acc) => acc.id === fromAccountId)?.currency;

    if (!parsedMoney.ok || !currency) {
      return;
    }

    const body: PostingRequest = {
      fromAccountId,
      toAccountId,
      amountMinorUnits: parsedMoney.value,
      memo: memo || undefined,
    };

    formDispatch({ type: "submitStarted" });

    try {
      await postJson("/api/postings", body, PostingResponseSchema);
      formDispatch({ type: "submitSucceeded" });
      show("Transfer successful", "success");
      onPostingSucceeded(fromAccountId, toAccountId);
    } catch (err) {
      const message = toMessage(err);
      if (err instanceof ApiError && err.problemType === CURRENCY_MISMATCH_TYPE) {
        formDispatch({
          type: "submitFailed",
          payload: { error: message, fieldErrors: { toAccountId: message } },
        });
      } else {
        formDispatch({ type: "submitFailed", payload: { error: message, fieldErrors: {} } });
      }
      show(message, "error");
    }
  };

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

  const serverToAccountError =
    form.mutation.status === "error" ? form.mutation.fieldErrors?.toAccountId : undefined;

  const displayToAccountError = localErrors.toAccountId || serverToAccountError;
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
        {displayToAccountError && <p className={styles.error}>{displayToAccountError}</p>}
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
      {form.mutation.status === "error" ? (
        <p role="alert" className={styles.error}>
          {form.mutation.error}
        </p>
      ) : (
        ""
      )}
      {import.meta.env.DEV && (
        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              checked={bypassCurrencyCheck}
              onChange={(e) => setBypassCurrencyCheck(e.target.checked)}
            />
            [DEV] Bypass local currency validation
          </label>
        </div>
      )}
      <button
        className={styles.button}
        type="submit"
        disabled={
          Object.keys(localErrors).length > 0 ||
          isAmountMuted ||
          amount === "" ||
          form.mutation.status === "pending"
        }
      >
        Add Transfer
      </button>
    </form>
  );
};
export default TransferForm;
