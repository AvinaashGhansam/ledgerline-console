import { type ChangeEvent, useState } from "react";
import type { AccountDto } from "../../../shared/api/types.ts";
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
};

const TransferForm = ({ accounts }: TransferFormProps) => {
  const [form, setForm] = useState<FormType>({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    memo: "",
  });

  const isDirty = form.fromAccountId !== "" || form.toAccountId !== "" || form.amount !== "";

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prevData) => ({ ...prevData, [name]: value }));
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

    const money = parseMoney(form.amount);

    if (!money.ok) {
      return money.reason;
    }

    if (money.value <= 0) {
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
      <button className={styles.button} type="button" disabled={!!errorMessage}>
        Add Transfer
      </button>
    </form>
  );
};
export default TransferForm;
