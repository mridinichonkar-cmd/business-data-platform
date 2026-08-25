export type NumericSummary = {
  count: number;
  missingCount: number;
  minimum: number | null;
  maximum: number | null;
  average: number | null;
  median: number | null;
};

function parseNumber(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const cleaned = String(value)
    .trim()
    .replaceAll(",", "")
    .replace(/[$£€%]/g, "");

  if (cleaned === "") {
    return null;
  }

  const parsed = Number(cleaned);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

export function summariseNumber(
  values: unknown[],
): NumericSummary {
  const parsedValues = values
    .map(parseNumber)
    .filter(
      (value): value is number =>
        value !== null,
    )
    .sort((a, b) => a - b);

  const count = parsedValues.length;
  const missingCount = values.length - count;

  if (count === 0) {
    return {
      count: 0,
      missingCount,
      minimum: null,
      maximum: null,
      average: null,
      median: null,
    };
  }

  const total = parsedValues.reduce(
    (sum, value) => sum + value,
    0,
  );

  const middleIndex = Math.floor(count / 2);

  const median =
    count % 2 === 0
      ? (
          parsedValues[middleIndex - 1] +
          parsedValues[middleIndex]
        ) / 2
      : parsedValues[middleIndex];

  return {
    count,
    missingCount,
    minimum: parsedValues[0],
    maximum: parsedValues[count - 1],
    average: total / count,
    median,
  };
}