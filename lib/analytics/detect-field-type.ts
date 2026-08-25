export type FieldType =
  | "text"
  | "number"
  | "date"
  | "id"
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

function isIdValue(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (/^\d+$/.test(trimmed)) {
    return true;
  }

  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      trimmed,
    )
  ) {
    return true;
  }

  return (
    !/\s/.test(trimmed) &&
    /[0-9]/.test(trimmed) &&
    /[a-z]/i.test(trimmed) &&
    /^[a-z0-9._-]+$/i.test(trimmed)
  );
}

function looksLikeIdColumn(columnName: string): boolean {
  const normalized = columnName.trim().toLowerCase();

  return /(^|_)(id|identifier|uuid|guid|code)(_|$)/.test(normalized);
}

function isDateValue(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (/^\d+$/.test(trimmed)) {
    return false;
  }

  return !Number.isNaN(Date.parse(trimmed));
}

export type PersistedFieldType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "category";

export function normalizeFieldTypeForStorage(
  type: string,
): PersistedFieldType {
  switch (type) {
    case "number":
    case "date":
    case "boolean":
    case "category":
    case "text":
      return type;

    case "id":
    default:
      return "text";
  }
}

export function detectFieldType(
  values: string[],
  columnName = "",
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
    looksLikeIdColumn(columnName) ||
    ratioMatching(isIdValue) >= requiredMatchRatio
  ) {
    return "id";
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