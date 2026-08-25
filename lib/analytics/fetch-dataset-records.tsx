import type { SupabaseClient } from "@supabase/supabase-js";

type AnalyticsRecord = {
  id: string;
  data: Record<string, unknown>;
};

const BATCH_SIZE = 1000;

export async function fetchAllDatasetRecords(
  supabase: SupabaseClient,
  datasetId: string,
): Promise<AnalyticsRecord[]> {
  const allRecords: AnalyticsRecord[] = [];

  let start = 0;

  while (true) {
    const end = start + BATCH_SIZE - 1;

    const { data, error } = await supabase
      .from("records")
      .select("id, data")
      .eq("dataset_id", datasetId)
      .range(start, end);

    if (error) {
      throw new Error(error.message);
    }

    const batch = (data ?? []) as AnalyticsRecord[];

    allRecords.push(...batch);

    if (batch.length < BATCH_SIZE) {
      break;
    }

    start += BATCH_SIZE;
  }

  return allRecords;
}