import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { fetchAllDatasetRecords } from "@/lib/analytics/fetch-dataset-records";
import { summariseCategory } from "@/lib/analytics/summarise-category";
import { summariseNumber } from "@/lib/analytics/summarise-number";
import { summariseDate } from "@/lib/analytics/summarise-date";

import AnalyticsDashboard from "./components/analytics-dashboard";

type AnalyticsPageProps = {
  params: Promise<{
    businessId: string;
  }>;

  searchParams: Promise<{
    dataset?: string;
  }>;
};

type FieldDefinition = {
  id: string;
  name: string;
  field_key: string;
  data_type: string;
};

export default async function AnalyticsPage({
  params,
  searchParams,
}: AnalyticsPageProps) {
  const { businessId } = await params;
  const { dataset: requestedDatasetId } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, industry")
    .eq("id", businessId)
    .maybeSingle();

  if (businessError || !business) {
    notFound();
  }

  const { data: datasets, error: datasetsError } = await supabase
    .from("datasets")
    .select("id, name, row_count, columns, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (datasetsError) {
    throw new Error(datasetsError.message);
  }

  const safeDatasets = datasets ?? [];

  /*
   * If no ?dataset=... exists in the URL,
   * automatically use the first dataset.
   */
  const selectedDataset =
    safeDatasets.find(
      (dataset) => dataset.id === requestedDatasetId,
    ) ?? safeDatasets[0];

  /*
   * Business has no datasets yet.
   */
  if (!selectedDataset) {
    return (
      <AnalyticsDashboard
        business={business}
        datasets={[]}
        selectedDataset={null}
        categoryAnalyses={[]}
        numericAnalyses={[]}
        dateAnalyses={[]}
      />
    );
  }

  const { data: fields, error: fieldsError } = await supabase
    .from("field_definitions")
    .select("id, name, field_key, data_type")
    .eq("dataset_id", selectedDataset.id)
    .order("name");

  if (fieldsError) {
    throw new Error(fieldsError.message);
  }

  const safeFields = (fields ?? []) as FieldDefinition[];

  /*
   * Fetch every record for analytics.
   *
   * This is separate from the 100-row dataset table.
   */
  const records = await fetchAllDatasetRecords(
    supabase,
    selectedDataset.id,
  );

  /*
   * CATEGORY ANALYSIS
   */
  const categoryFields = safeFields.filter(
    (field) => field.data_type === "category",
  );

  const categoryAnalyses = categoryFields.map((field) => {
    const values = records.map(
      (record) => record.data[field.name],
    );

    return {
      fieldId: field.id,
      fieldName: field.name,
      summary: summariseCategory(values),
    };
  });

  /*
   * NUMERIC ANALYSIS
   */
  const numericFields = safeFields.filter(
    (field) => field.data_type === "number",
  );

  const numericAnalyses = numericFields.map((field) => {
    const values = records.map(
      (record) => record.data[field.name],
    );

    return {
      fieldId: field.id,
      fieldName: field.name,
      summary: summariseNumber(values),
    };
  });

  /*
   * DATE ANALYSIS
   */
  const dateFields = safeFields.filter(
    (field) => field.data_type === "date",
  );

  const dateAnalyses = dateFields.map((field) => {
    const values = records.map(
      (record) => record.data[field.name],
    );

    return {
      fieldId: field.id,
      fieldName: field.name,
      summary: summariseDate(values),
    };
  });

  return (
    <AnalyticsDashboard
      business={business}
      datasets={safeDatasets}
      selectedDataset={selectedDataset}
      categoryAnalyses={categoryAnalyses}
      numericAnalyses={numericAnalyses}
      dateAnalyses={dateAnalyses}
    />
  );
}