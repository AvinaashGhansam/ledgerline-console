export type ParseMoneyResult = { ok: true; value: number } | { ok: false; reason: string };

export const parseMoney = (input: string): ParseMoneyResult => {
  const money = input.trim();

  // 1. Guard against empty strings
  if (money.length === 0) {
    return { ok: false, reason: "Input value cannot be empty." };
  }

  // 2. Reject negatives, and positive signs
  if (money.includes("-") || money.includes("+")) {
    return { ok: false, reason: "Input value cannot contain +/- symbol" };
  }

  // 3. Reject commas to enforce strict formatting
  if (money.includes(",")) {
    return { ok: false, reason: "Input cannot contain commas." };
  }

  const parts = money.split(".");
  if (parts.length > 2) {
    return { ok: false, reason: "Input has too many decimal places." };
  }

  const [major = "", minor = ""] = parts;

  // 5. Validate that major part contains only digits
  const digitRegex = /^\d+$/;
  if (!digitRegex.test(major)) {
    return { ok: false, reason: "Input must contain only valid numeric digits." };
  }

  // Handle whole-dollar inputs (no decimal point)
  if (parts.length === 1) {
    const totalCents = parseInt(major, 10) * 100;
    return { ok: true, value: totalCents };
  }

  // 5b. Validate that minor part contains only digits
  if (!digitRegex.test(minor)) {
    return { ok: false, reason: "Input must contain only valid numeric digits." };
  }

  // 6. Enforce strict fractional lengths (e.g., "1.3" or "1.30")
  if (minor.length !== 1 && minor.length !== 2) {
    return { ok: false, reason: "The fractional part must have 1 or 2 decimal digits." };
  }

  // 7. Parse safely into integer cents without floating-point math
  const majorCents = parseInt(major, 10) * 100;
  const minorCents = minor.length === 1 ? parseInt(minor, 10) * 10 : parseInt(minor, 10);

  return { ok: true, value: majorCents + minorCents };
};
