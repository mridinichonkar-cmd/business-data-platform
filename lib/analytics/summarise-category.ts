export type CategoryFrequency = {
  value: string;
  count: number;
  percentage: number;
};

export type CategorySummary = {
  totalValues: number;
  missingCount: number;
  uniqueCount: number;
  mostCommonValue: string | null;
  mostCommonCount: number;
  frequencies: CategoryFrequency[];
};

export function summariseCategory(
  values: unknown[],
): CategorySummary {
  const frequencyMap = new Map<string, number>();

  let missingCount = 0;

  for (const rawValue of values) {
    if (
      rawValue === null ||
      rawValue === undefined ||
      String(rawValue).trim() === ""
    ) {
      missingCount += 1;
      continue;
    }

    const value = String(rawValue).trim();

    frequencyMap.set(
      value,
      (frequencyMap.get(value) ?? 0) + 1,
    );
  }

  const totalValues = values.length - missingCount;

  const frequencies = Array.from(
    frequencyMap.entries(),
  )
    .map(([value, count]) => ({
      value,
      count,
      percentage:
        totalValues === 0
          ? 0
          : (count / totalValues) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  const mostCommon = frequencies[0];

  return {
    totalValues,
    missingCount,
    uniqueCount: frequencyMap.size,
    mostCommonValue:
      mostCommon?.value ?? null,
    mostCommonCount:
      mostCommon?.count ?? 0,
    frequencies,
  };
}