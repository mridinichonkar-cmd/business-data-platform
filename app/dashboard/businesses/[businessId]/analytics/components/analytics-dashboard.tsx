"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Database,
  Hash,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Business = {
  id: string;
  name: string;
  industry: string | null;
};

type Dataset = {
  id: string;
  name: string;
  row_count: number;
  columns: unknown;
  created_at: string;
};

type CategoryFrequency = {
  value: string;
  count: number;
  percentage: number;
};

type CategoryAnalysis = {
  fieldId: string;
  fieldName: string;

  summary: {
    totalValues: number;
    missingCount: number;
    uniqueCount: number;
    mostCommonValue: string | null;
    mostCommonCount: number;
    frequencies: CategoryFrequency[];
  };
};

type NumericAnalysis = {
  fieldId: string;
  fieldName: string;

  summary: {
    count: number;
    missingCount: number;
    minimum: number | null;
    maximum: number | null;
    average: number | null;
    median: number | null;
  };
};

type DateAnalysis = {
  fieldId: string;
  fieldName: string;

  summary: {
    count: number;
    missingCount: number;
    earliest: string | null;
    latest: string | null;

    byMonth: Array<{
      period: string;
      count: number;
    }>;
  };
};

type AnalyticsDashboardProps = {
  business: Business;
  datasets: Dataset[];
  selectedDataset: Dataset | null;

  categoryAnalyses: CategoryAnalysis[];
  numericAnalyses: NumericAnalysis[];
  dateAnalyses: DateAnalysis[];
};

function formatNumber(value: number | null) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function AnalyticsDashboard({
  business,
  datasets,
  selectedDataset,
  categoryAnalyses,
  numericAnalyses,
  dateAnalyses,
}: AnalyticsDashboardProps) {
  const router = useRouter();

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categoryAnalyses[0]?.fieldId ?? "",
  );

  const [selectedNumericId, setSelectedNumericId] = useState(
    numericAnalyses[0]?.fieldId ?? "",
  );

  const [selectedDateId, setSelectedDateId] = useState(
    dateAnalyses[0]?.fieldId ?? "",
  );

  const selectedCategory = useMemo(
    () =>
      categoryAnalyses.find(
        (analysis) =>
          analysis.fieldId === selectedCategoryId,
      ) ?? categoryAnalyses[0],
    [categoryAnalyses, selectedCategoryId],
  );

  const selectedNumeric = useMemo(
    () =>
      numericAnalyses.find(
        (analysis) =>
          analysis.fieldId === selectedNumericId,
      ) ?? numericAnalyses[0],
    [numericAnalyses, selectedNumericId],
  );

  const selectedDate = useMemo(
    () =>
      dateAnalyses.find(
        (analysis) =>
          analysis.fieldId === selectedDateId,
      ) ?? dateAnalyses[0],
    [dateAnalyses, selectedDateId],
  );

  const availableAnalysisCount =
    (categoryAnalyses.length > 0 ? 1 : 0) +
    (numericAnalyses.length > 0 ? 1 : 0) +
    (dateAnalyses.length > 0 ? 1 : 0);

  function handleDatasetChange(datasetId: string) {
    router.push(
      `/dashboard/businesses/${business.id}/analytics?dataset=${datasetId}`,
    );
  }

  if (!selectedDataset) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/dashboard/businesses/${business.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Business dashboard
          </Link>

          <section className="mt-10 flex min-h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
            <Database className="h-12 w-12 text-slate-300" />

            <h1 className="mt-5 text-2xl font-bold text-slate-950">
              No datasets available
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Upload a dataset before using analytics.
            </p>

            <Link
              href={`/dashboard/businesses/${business.id}/upload`}
              className="mt-6 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Upload dataset
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href={`/dashboard/businesses/${business.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Business dashboard
        </Link>

        {/* Page heading */}
        <header className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              {business.name}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              Explore patterns, distributions and trends detected from your
              uploaded data.
            </p>
          </div>

          <div className="w-full lg:w-72">
            <label
              htmlFor="analytics-dataset"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Dataset
            </label>

            <select
              id="analytics-dataset"
              value={selectedDataset.id}
              onChange={(event) =>
                handleDatasetChange(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            >
              {datasets.map((dataset) => (
                <option
                  key={dataset.id}
                  value={dataset.id}
                >
                  {dataset.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Dataset overview */}
        <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Database className="h-5 w-5 text-slate-500" />

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Records analysed
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {selectedDataset.row_count.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Hash className="h-5 w-5 text-slate-500" />

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Detected fields
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {Array.isArray(selectedDataset.columns)
                ? selectedDataset.columns.length
                : 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <BarChart3 className="h-5 w-5 text-slate-500" />

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Analysis types
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {availableAnalysisCount}
            </p>
          </div>
        </section>

        {/* High-level insights */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
              <Lightbulb className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Insights
              </h2>

              <p className="text-sm text-slate-500">
                Automatically generated from the selected dataset.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {selectedCategory && (
              <div className="rounded-lg bg-slate-100 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Category pattern
                </p>

                <p className="mt-3 font-semibold text-slate-950">
                  {selectedCategory.summary.mostCommonValue ?? "No value"} is
                  the most common {selectedCategory.fieldName}.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {selectedCategory.summary.mostCommonCount.toLocaleString()}{" "}
                  records share this value.
                </p>
              </div>
            )}

            {selectedNumeric && (
              <div className="rounded-lg bg-slate-100 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Numeric summary
                </p>

                <p className="mt-3 font-semibold text-slate-950">
                  Average {selectedNumeric.fieldName}:{" "}
                  {formatNumber(selectedNumeric.summary.average)}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Median: {formatNumber(selectedNumeric.summary.median)}
                </p>
              </div>
            )}

            {selectedDate && (
              <div className="rounded-lg bg-slate-100 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Date coverage
                </p>

                <p className="mt-3 font-semibold text-slate-950">
                  Records span from{" "}
                  {formatDate(selectedDate.summary.earliest)} to{" "}
                  {formatDate(selectedDate.summary.latest)}.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Category analysis */}
        {selectedCategory && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                  Category breakdown
                </p>

                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Distribution by {selectedCategory.fieldName}
                </h2>
              </div>

              <select
                value={selectedCategory.fieldId}
                onChange={(event) =>
                    setSelectedCategoryId(event.target.value)
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-950"
                >
                {categoryAnalyses.map((analysis) => (
                    <option
                    key={analysis.fieldId}
                    value={analysis.fieldId}
                    className="bg-white text-slate-950"
                    >
                    {analysis.fieldName}
                    </option>
                ))}
                </select>
            </div>

            <div className="mt-8 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={selectedCategory.summary.frequencies
                    .slice(0, 10)
                    .map((item) => ({
                      name: item.value,
                      count: item.count,
                    }))}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={75}
                  />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    fill="#0f172a"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-100 p-4 text-slate-950">
            <p className="text-xs font-semibold text-slate-500">
            Unique values
            </p>

            <p className="mt-1 text-xl font-bold text-slate-950">
            {selectedCategory.summary.uniqueCount}
            </p>
        </div>

        <div className="rounded-lg bg-slate-100 p-4 text-slate-950">
            <p className="text-xs font-semibold text-slate-500">
            Most common
            </p>

            <p className="mt-1 text-xl font-bold text-slate-950">
            {selectedCategory.summary.mostCommonValue ?? "—"}
            </p>
        </div>

        <div className="rounded-lg bg-slate-100 p-4 text-slate-950">
            <p className="text-xs font-semibold text-slate-500">
            Missing
            </p>

            <p className="mt-1 text-xl font-bold text-slate-950">
            {selectedCategory.summary.missingCount.toLocaleString()}
            </p>
        </div>
        </div>
          </section>
        )}

        {/* Numeric analysis */}
        {selectedNumeric && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                  Numeric analysis
                </p>

                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  {selectedNumeric.fieldName}
                </h2>
              </div>

              <select
                value={selectedDate.fieldId}
                onChange={(event) =>
                    setSelectedDateId(event.target.value)
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-950"
                >
                {dateAnalyses.map((analysis) => (
                    <option
                    key={analysis.fieldId}
                    value={analysis.fieldId}
                    className="bg-white text-slate-950"
                    >
                    {analysis.fieldName}
                    </option>
                ))}
                </select>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
              {[
                ["Average", selectedNumeric.summary.average],
                ["Median", selectedNumeric.summary.median],
                ["Minimum", selectedNumeric.summary.minimum],
                ["Maximum", selectedNumeric.summary.maximum],
                ["Missing", selectedNumeric.summary.missingCount],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-lg bg-slate-100 p-4"
                >
                  <p className="text-xs font-semibold text-slate-500">
                    {label}
                  </p>

                  <p className="mt-2 text-xl font-bold text-slate-950">
                    {typeof value === "number"
                      ? formatNumber(value)
                      : "—"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Date trend */}
        {selectedDate && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-teal-700" />

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                    Time analysis
                  </p>
                </div>

                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Records over time by {selectedDate.fieldName}
                </h2>
              </div>

            {dateAnalyses.length > 1 && (
            <select
                value={selectedDate.fieldId}
                onChange={(event) =>
                setSelectedDateId(event.target.value)
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950"
            >
                {dateAnalyses.map((analysis) => (
                <option
                    key={analysis.fieldId}
                    value={analysis.fieldId}
                >
                    {analysis.fieldName}
                </option>
                ))}
            </select>
            )}
            </div>

            <div className="mt-8 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedDate.summary.byMonth}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="period" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0f172a"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Capabilities */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-teal-700" />

            <div>
              <h2 className="font-bold text-slate-950">
                Available analytics
              </h2>

              <p className="text-sm text-slate-500">
                Based on detected field types.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-slate-100 p-4">
              <p className="font-semibold text-slate-900">
                Category breakdowns
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {categoryAnalyses.length > 0
                  ? `${categoryAnalyses.length} compatible fields`
                  : "Not available"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-4">
              <p className="font-semibold text-slate-900">
                Numeric summaries
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {numericAnalyses.length > 0
                  ? `${numericAnalyses.length} compatible fields`
                  : "Not available"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-4">
              <p className="font-semibold text-slate-900">
                Time-series analysis
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {dateAnalyses.length > 0
                  ? `${dateAnalyses.length} compatible fields`
                  : "Not available"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}