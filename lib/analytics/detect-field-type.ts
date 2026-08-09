export type FieldType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "category";

const BOOLEAN_VALUES = new Set([
  "true",
  "false",
  "yes",
  "no",
  "1",
  "0",
]);

function isBooleanValue(value: string): boolean {
  return BOOLEAN_VALUES.has(value.trim().toLowerCase());
}

function isNumberValue(value: string): boolean {
  const cleaned = value
    .trim()
    .replaceAll(",", "")
    .replace(/[$£€%]/g, "");

  return cleaned !== "" && Number.isFinite(Number(cleaned));
}

function isDateValue(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  /*
   * Avoid classifying plain numbers such as customer IDs as dates.
   */
  if (/^\d+$/.test(trimmed)) {
    return false;
  }

  return !Number.isNaN(Date.parse(trimmed));
}

export function detectFieldType(
  values: string[],
): FieldType {
  const nonEmptyValues = values
    .map((value) => value.trim())
    .filter(Boolean);

  if (nonEmptyValues.length === 0) {
    return "text";
  }

  const requiredMatchRatio = 0.9;

  const ratioMatching = (
    validator: (value: string) => boolean,
  ) =>
    nonEmptyValues.filter(validator).length /
    nonEmptyValues.length;

  if (
    ratioMatching(isBooleanValue) >= requiredMatchRatio
  ) {
    return "boolean";
  }

  if (
    ratioMatching(isNumberValue) >= requiredMatchRatio
  ) {
    return "number";
  }

  if (
    ratioMatching(isDateValue) >= requiredMatchRatio
  ) {
    return "date";
  }

  const uniqueValues = new Set(
    nonEmptyValues.map((value) =>
      value.toLowerCase(),
    ),
  );

  /*
   * A column with repeated values is probably categorical.
   * These thresholds can be improved later.
   */
  const categoryLimit = Math.min(
    50,
    Math.max(10, nonEmptyValues.length * 0.2),
  );

  if (uniqueValues.size <= categoryLimit) {
    return "category";
  }

  return "text";
}