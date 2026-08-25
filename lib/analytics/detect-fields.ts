import {
  detectFieldType,
  type FieldType,
} from "./detect-field-type";

type CsvRow = Record<string, string>;

export type DetectedField = {
  name: string;
  field_key: string;
  data_type: FieldType;
};

function createFieldKey(
  columnName: string,
): string {
  return columnName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function detectFields(
  columns: string[],
  rows: CsvRow[],
): DetectedField[] {
  return columns.map((column) => {
    const values = rows.map(
      (row) => row[column] ?? "",
    );

    return {
      name: column,
      field_key: createFieldKey(column),
      data_type: detectFieldType(values, column),
    };
  });
}