import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Database,
  Rows3,
  TableProperties,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { summariseCategory } from "@/lib/analytics/summarise-category";
import CategoryAnalysis from "./components/category-analysis";
import { fetchAllDatasetRecords } from "@/lib/analytics/fetch-dataset-records";


type DatasetPageProps = {
  params: Promise<{
    businessId: string;
    datasetId: string;
  }>;
};

type RecordRow = {
  id: string;
  data: Record<string, unknown>;
  created_at: string;
};

const PAGE_SIZE = 100;

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function formatFieldType(type: string): string {
  switch (type) {
    case "number":
      return "Number";

    case "date":
      return "Date";

    case "id":
      return "ID";

    case "boolean":
      return "Boolean";

    case "category":
      return "Category";

    default:
      return "Text";
  }
}

export default async function DatasetPage({
  params,
}: DatasetPageProps) {
  const { businessId, datasetId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("id", businessId)
    .maybeSingle();

  if (businessError || !business) {
    notFound();
  }

  const { data: dataset, error: datasetError } = await supabase
    .from("datasets")
    .select("id, business_id, name, columns, row_count, created_at")
    .eq("id", datasetId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (datasetError || !dataset) {
    notFound();
  }

  const {data: fields, error: fieldsError } = await supabase
    .from("field_definitions")
    .select("id, name, field_key, data_type")
    .eq("dataset_id", dataset.id)
    .order("name", { ascending: true });

  const analyticsRecords = await fetchAllDatasetRecords(
    supabase,
    dataset.id,
  );

  const safeFields = fields ?? [];

  const categoryFields = safeFields.filter(
  (field) => field.data_type === "category",
);

const categorySummaries = categoryFields.map((field) => {
  const values = analyticsRecords.map(
    (record) => record.data[field.name],
  );

  return {
    fieldId: field.id,
    fieldName: field.name,
    summary: summariseCategory(values),
  };
});

  const categoryField = safeFields.find(
    (field) => field.data_type === "category",
  );

  const { data: records, error: recordsError } = await supabase
    .from("records")
    .select("id, data, created_at")
    .eq("dataset_id", dataset.id)
    .order("created_at", { ascending: true })
    .limit(PAGE_SIZE);

  const columns = Array.isArray(dataset.columns)
    ? dataset.columns.filter(
        (column): column is string => typeof column === "string",
      )
    : [];

   

  const tableRecords = (records ?? []) as RecordRow[];

  let categorySummary = null;

  if (categoryField) {
    const values = tableRecords.map(
      (record) => record.data[categoryField.name],
    );

    categorySummary = summariseCategory(values);
  }

  const categoryChartData =
    categorySummary?.frequencies
      .slice(0, 10)
      .map(({ value, count }) => ({
        name: value,
        count,
      })) ?? [];

  const importedDate = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dataset.created_at));

  const datasetsPath =
    `/dashboard/businesses/${business.id}/datasets`;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[1600px]">
        <Link
          href={datasetsPath}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to datasets
        </Link>

        <header className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              {business.name}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {dataset.name}
            </h1>

            <p className="mt-2 text-slate-600">
              Browse the records imported into this dataset.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="min-w-32 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Rows3 className="h-4 w-4" />
                <p className="text-[10px] font-bold uppercase tracking-wide">
                  Records
                </p>
              </div>

              <p className="mt-2 text-xl font-bold text-slate-950">
                {(dataset.row_count ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="min-w-32 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <TableProperties className="h-4 w-4" />
                <p className="text-[10px] font-bold uppercase tracking-wide">
                  Columns
                </p>
              </div>

              <p className="mt-2 text-xl font-bold text-slate-950">
                {columns.length}
              </p>
            </div>

            <div className="min-w-32 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4" />
                <p className="text-[10px] font-bold uppercase tracking-wide">
                  Imported
                </p>
              </div>

              <p className="mt-2 whitespace-nowrap text-sm font-bold text-slate-950">
                {importedDate}
              </p>
            </div>
          </div>
        </header>

        {recordsError && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load records: {recordsError.message}
          </div>
        )}

        {!recordsError && tableRecords.length === 0 && (
          <section className="mt-8 flex min-h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 text-center">
            <Database className="h-12 w-12 text-slate-300" />

            <h2 className="mt-5 text-xl font-semibold text-slate-950">
              This dataset has no records
            </h2>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              The dataset exists, but no imported rows were found.
            </p>
          </section>
        )}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Fields
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Detected field structure for this dataset.
          </p>
        </div>

        {fieldsError ? (
          <div className="p-6">
            <p className="text-sm text-red-700">
              Failed to load field definitions: {fieldsError.message}
            </p>
          </div>
        ) : safeFields.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-slate-900">
              No field definitions found
            </p>

            <p className="mt-2 text-sm text-slate-500">
              This dataset may have been uploaded before field detection was added.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Field
                  </th>

                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Key
                  </th>

                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Detected type
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {safeFields.map((field) => (
                  <tr
                    key={field.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {field.name}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {field.field_key}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {formatFieldType(field.data_type)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>


      {categoryField ? (
    <CategoryAnalysis
      analyses={categorySummaries}
    />

       
      ) : (
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="font-semibold text-slate-950">
            No categorical analysis available
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This dataset does not currently contain a field detected as a category.
          </p>
        </section>
      )}


        {!recordsError && tableRecords.length > 0 && (
          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-semibold text-slate-950">
                  Dataset records
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Showing the first{" "}
                  {Math.min(PAGE_SIZE, tableRecords.length).toLocaleString()} of{" "}
                  {(dataset.row_count ?? 0).toLocaleString()} records.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {columns.length} columns
              </span>
            </div>

            <div className="max-h-[650px] overflow-auto">
              <table className="min-w-max w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-100">
                  <tr>
                    <th className="w-16 whitespace-nowrap border-b border-r border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    {columns.map((column) => (
                      <th
                        key={column}
                        className="min-w-40 whitespace-nowrap border-b border-r border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 last:border-r-0"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {tableRecords.map((record, rowIndex) => (
                    <tr
                      key={record.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="border-r border-slate-200 px-4 py-3 font-mono text-xs text-slate-400">
                        {rowIndex + 1}
                      </td>

                      {columns.map((column) => {
                        const value = displayValue(record.data[column]);
                        const isEmpty = value === "—";

                        return (
                          <td
                            key={`${record.id}-${column}`}
                            title={value}
                            className={`max-w-80 truncate border-r border-slate-200 px-4 py-3 last:border-r-0 ${
                              isEmpty
                                ? "italic text-slate-300"
                                : "text-slate-700"
                            }`}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(dataset.row_count ?? 0) > PAGE_SIZE && (
              <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-500">
                This initial version displays the first {PAGE_SIZE} records.
                Pagination will be added next.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}