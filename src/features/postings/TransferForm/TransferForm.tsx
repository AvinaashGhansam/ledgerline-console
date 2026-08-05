import { type ChangeEvent, useState } from "react";
import type { AccountDto, EntryDto } from "../../../shared/api/types.ts";
import { parseMoney } from "../../../shared/money/parseMoney.ts";
import styles from "./TransferForm.module.css";

type FormType = {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  memo: string;
};

type TransferFormProps = {
  accounts: readonly AccountDto[];
  onAdd: (entries: EntryDto[]) => void;
};

const INITIAL_FORM_STATE: FormType = { fromAccountId: "", toAccountId: "", amount: "", memo: "" };

const TransferForm = ({ accounts, onAdd }: TransferFormProps) => {
  const [form, setForm] = useState<FormType>(INITIAL_FORM_STATE);
  const isDirty = form.fromAccountId !== "" || form.toAccountId !== "" || form.amount !== "";
  const parsedMoney = parseMoney(form.amount);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = () => {
    if (errorMessage) {
      return;
    }
    const postingId = crypto.randomUUID();
    const occurredAt = new Date().toISOString();

    let amountMinorUnits = 0;
    if (parsedMoney.ok) {
      amountMinorUnits = parsedMoney.value;
    }

    const currency = accounts.find((acc) => acc.id === form.fromAccountId)?.currency;

    if (!currency) {
      return;
    }

    const debit: EntryDto = {
      id: crypto.randomUUID(),
      accountId: form.fromAccountId,
      postingId,
      direction: "DEBIT",
      amountMinorUnits,
      currency,
      occurredAt,
      memo: form.memo,
    };

    const credit: EntryDto = {
      id: crypto.randomUUID(),
      accountId: form.toAccountId,
      postingId,
      direction: "CREDIT",
      amountMinorUnits,
      currency,
      occurredAt,
      memo: form.memo,
    };

    onAdd([debit, credit]);
    setForm(INITIAL_FORM_STATE);
  };

  const getErrorMessage = () => {
    if (!(form.fromAccountId && form.toAccountId)) {
      return "Please select both accounts.";
    }

    if (form.fromAccountId === form.toAccountId) {
      return "Cannot transfer to the same account.";
    }

    const fromAccount = accounts.find((acc) => acc.id === form.fromAccountId);
    const toAccount = accounts.find((acc) => acc.id === form.toAccountId);

    if (fromAccount?.currency !== toAccount?.currency) {
      return "Accounts must have the same currency.";
    }

    if (!parsedMoney.ok) {
      return parsedMoney.reason;
    }

    if (parsedMoney.value <= 0) {
      return "Transfer amount must be greater than zero.";
    }

    return "";
  };

  const errorMessage = getErrorMessage();

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
    <form className={styles.form}>
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="fromAccountId">
          From Account Number
        </label>
        <select
          className={styles.input}
          name="fromAccountId"
          id="fromAccountId"
          value={form.fromAccountId}
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
          value={form.toAccountId}
          onChange={handleChange}
        >
          {accountOptions}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="amount">
          Amount
        </label>
        <input
          className={styles.input}
          name="amount"
          id="amount"
          value={form.amount}
          onChange={handleChange}
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="memo">
          Memo
        </label>
        <input
          className={styles.input}
          name="memo"
          id="memo"
          value={form.memo}
          onChange={handleChange}
        />
      </div>
      {isDirty && errorMessage && <p className={styles.error}>{errorMessage}</p>}
      <button
        className={styles.button}
        type="button"
        disabled={!!errorMessage}
        onClick={handleSubmit}
      >
        Add Transfer
      </button>
    </form>
  );
};
export default TransferForm;
