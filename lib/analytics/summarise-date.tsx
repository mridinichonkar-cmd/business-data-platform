export type DateFrequency = {
  period: string;
  count: number;
};

export type DateSummary = {
  count: number;
  missingCount: number;
  earliest: string | null;
  latest: string | null;
  byMonth: DateFrequency[];
};

function parseDate(value: unknown): Date | null {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const parsed = new Date(String(value));

  return Number.isNaN(parsed.getTime())
    ? null
    : parsed;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;
}

export function summariseDate(
  values: unknown[],
): DateSummary {
  const parsedDates = values
    .map(parseDate)
    .filter(
      (value): value is Date =>
        value !== null,
    )
    .sort(
      (a, b) =>
        a.getTime() - b.getTime(),
    );

  const count = parsedDates.length;
  const missingCount = values.length - count;

  if (count === 0) {
    return {
      count: 0,
      missingCount,
      earliest: null,
      latest: null,
      byMonth: [],
    };
  }

  const monthCounts = new Map<
    string,
    number
  >();

  for (const date of parsedDates) {
    const key = monthKey(date);

    monthCounts.set(
      key,
      (monthCounts.get(key) ?? 0) + 1,
    );
  }

  const byMonth = Array.from(
    monthCounts.entries(),
  )
    .map(([period, count]) => ({
      period,
      count,
    }))
    .sort((a, b) =>
      a.period.localeCompare(b.period),
    );

  return {
    count,
    missingCount,
    earliest:
      parsedDates[0].toISOString(),
    latest:
      parsedDates[
        parsedDates.length - 1
      ].toISOString(),
    byMonth,
  };
}