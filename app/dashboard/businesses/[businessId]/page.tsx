import { notFound, redirect } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

import BusinessSidebar from "./components/business-sidebar";
import BusinessTopbar from "./components/business-topbar";
import DatasetsCard from "./components/datasets-card";
import MetricsGrid from "./components/metrics-grid";
import RecordActivityCard from "./components/record-activity-card";
import RecentActivityCard from "./components/recent-activity-card";


import type { DashboardStats } from "./types/types";


import LatestInsights from "./components/latest-insights";

import { fetchAllDatasetRecords } from "@/lib/analytics/fetch-dataset-records";
import { summariseCategory } from "@/lib/analytics/summarise-category";
import { summariseNumber } from "@/lib/analytics/summarise-number";
import { summariseDate } from "@/lib/analytics/summarise-date";

import type { Insight } from "./types/insight";


type BusinessDashboardPageProps = {
  params: Promise<{
    businessId: string;
  }>;
};

export default async function BusinessDashboardPage({
  params,
}: BusinessDashboardPageProps) {
  const { businessId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .select("id, name, industry, created_at")
    .eq("id", businessId)
    .maybeSingle();

  if (error || !business) {
    notFound();
  }

const { data: datasets, error: datasetsError } = await supabase
  .from("datasets")
  .select("id, name, row_count, columns, created_at")
  .eq("business_id", business.id)
  .order("created_at", { ascending: false });

if (datasetsError) {
  console.error(
    "Failed to load datasets:",
    datasetsError,
  );
}




const safeDatasets = datasets ?? [];

const dashboardStats: DashboardStats = {
  datasetCount: safeDatasets.length,

  totalRecords: safeDatasets.reduce(
    (total, dataset) => total + (dataset.row_count ?? 0),
    0,
  ),

  customFieldCount: safeDatasets.reduce(
    (total, dataset) =>
      total +
      (Array.isArray(dataset.columns)
        ? dataset.columns.length
        : 0),
    0,
  ),


  
  
  /*
   * We have not implemented validation yet, so do not claim
   * that the data has a 100% quality score.
   */
  dataQualityScore: 0,
  validationIssueCount: 0,
  insightCount: 0,
};

const datasetIds = safeDatasets.map(
  (dataset) => dataset.id,
);

let fieldDefinitions: Array<{
  id: string;
  dataset_id: string;
  name: string;
  data_type: string;
}> = [];

if (datasetIds.length > 0) {
  const { data: fields, error: fieldsError } = await supabase
    .from("field_definitions")
    .select("id, dataset_id, name, data_type")
    .in("dataset_id", datasetIds);

  if (fieldsError) {
    console.error(
      "Failed to load field definitions:",
      fieldsError,
    );
  }

  fieldDefinitions = fields ?? [];
}

const insights: Insight[] = [];

const latestDataset = safeDatasets[0];

if (latestDataset) {
  const latestFields = fieldDefinitions.filter(
    (field) => field.dataset_id === latestDataset.id,
  );

  const latestRecords = await fetchAllDatasetRecords(
    supabase,
    latestDataset.id,
  );

  const categoryField = latestFields.find(
    (field) => field.data_type === "category",
  );

  const numericField = latestFields.find(
    (field) => field.data_type === "number",
  );

  const dateField = latestFields.find(
    (field) => field.data_type === "date",
  );

  // CATEGORY INSIGHT
  if (categoryField) {
    const values = latestRecords.map(
      (record) => record.data[categoryField.name],
    );

    const summary = summariseCategory(values);

    if (summary.mostCommonValue) {
      insights.push({
        id: `category-${latestDataset.id}-${categoryField.name}`,
        title: `${categoryField.name} distribution`,
        description:
          `${summary.mostCommonValue} is the most common value, appearing in ${summary.mostCommonCount.toLocaleString()} records.`,
        source: "deterministic",
        category: "category",
      });
    }
  }

  // NUMERIC INSIGHT
  if (numericField) {
    const values = latestRecords.map(
      (record) => record.data[numericField.name],
    );

    const summary = summariseNumber(values);

    if (summary.average !== null) {
      insights.push({
        id: `numeric-${latestDataset.id}-${numericField.name}`,
        title: `${numericField.name} summary`,
        description:
          `The average ${numericField.name} is ${summary.average.toLocaleString(
            "en-AU",
            {
              maximumFractionDigits: 2,
            },
          )}, with a median of ${
            summary.median?.toLocaleString("en-AU", {
              maximumFractionDigits: 2,
            }) ?? "—"
          }.`,
        source: "deterministic",
        category: "numeric",
      });
    }
  }

  // DATE INSIGHT
  if (dateField) {
    const values = latestRecords.map(
      (record) => record.data[dateField.name],
    );

    const summary = summariseDate(values);

    if (summary.earliest && summary.latest) {
      const formatter = new Intl.DateTimeFormat("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const earliest = formatter.format(
        new Date(summary.earliest),
      );

      const latest = formatter.format(
        new Date(summary.latest),
      );

      insights.push({
        id: `date-${latestDataset.id}-${dateField.name}`,
        title: `${dateField.name} coverage`,
        description:
          `The dataset covers ${dateField.name} values from ${earliest} to ${latest}.`,
        source: "deterministic",
        category: "date",
      });
    }
  }
}

    const activityMap = new Map<string, number>();

    // Add records from each dataset import
    for (const dataset of safeDatasets) {
      const date = new Date(dataset.created_at);

      const key = date.toISOString().slice(0, 10);

      activityMap.set(
        key,
        (activityMap.get(key) ?? 0) +
          (dataset.row_count ?? 0),
      );
    }

    // Always show the last 7 days
    const recordActivity = Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date();

        date.setDate(
          date.getDate() - (6 - index),
        );

        const key = date
          .toISOString()
          .slice(0, 10);

        return {
          date: key,
          count: activityMap.get(key) ?? 0,
        };
      },
    );

    const hasCategoryFields = fieldDefinitions.some(
      (field) => field.data_type === "category",
    );

    const hasNumericFields = fieldDefinitions.some(
      (field) => field.data_type === "number",
    );

    const hasDateFields = fieldDefinitions.some(
      (field) => field.data_type === "date",
    );

    const analyticsPath =
      `/dashboard/businesses/${business.id}/analytics`;

      

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <BusinessSidebar business={business} />

      <div className="lg:pl-64">
        <BusinessTopbar business={business} />

        <main className="mx-auto max-w-[1500px] px-4 py-8 md:px-8">
          {/* Dashboard heading */}
          <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                Business overview
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                {business.name}
              </h1>

              <p className="mt-2 max-w-2xl text-slate-600">
                Review your datasets, data quality, recent activity and
                automatically generated insights.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                className="rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
              >
                7 days
              </button>

              <button
                type="button"
                className="rounded-md px-4 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
              >
                30 days
              </button>

              <button
                type="button"
                className="rounded-md px-4 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
              >
                All time
              </button>
            </div>
          </section>

          {/* Extracted metrics component */}
          <MetricsGrid stats={{
            ...dashboardStats,
            insightCount: insights.length,
          }} />

          {/* Activity section */}
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <RecordActivityCard
              activity = {recordActivity}
            />

          <RecentActivityCard
          businessId={business.id}
          datasets={safeDatasets}
        />
          </section>

          {/* Datasets and capabilities */}
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <DatasetsCard
              businessId={business.id}
              datasetCount={dashboardStats.datasetCount}
            />

            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-950">
                  Data Capabilities
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Analyses available based on the field types in your data.
                </p>
              </div>

              
                
        <div className="space-y-3">
        {[
          {
            label: "Time-series analysis",
            description:
              "Explore trends and record patterns across date fields.",
            available: hasDateFields,
          },
          {
            label: "Numeric comparisons",
            description:
              "Explore averages, medians, ranges and numeric patterns.",
            available: hasNumericFields,
          },
          {
            label: "Category breakdowns",
            description:
              "Compare distributions across categorical fields.",
            available: hasCategoryFields,
          },
          {
            label: "Geographic analysis",
            description:
              "Analyse records by geographic location.",
            available: false,
          },
        ].map((capability) => (
          <div
            key={capability.label}
            className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {capability.label}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {capability.description}
              </p>
            </div>

            {capability.available ? (
              <Link
                href={analyticsPath}
                className="shrink-0 rounded-full bg-teal-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-teal-800 transition hover:bg-teal-200"
              >
                View analytics →
              </Link>
            ) : (
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Not available
              </span>
            )}
          </div>
        ))}
      </div>
                  </article>
          </section>

          {/* Assistant and data health */}
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <article className="rounded-xl bg-slate-950 p-7 text-white shadow-sm xl:col-span-2">
              <div className="flex flex-col justify-between gap-8 md:flex-row">
                <div className="max-w-xl">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                    <Bot className="h-5 w-5 text-teal-300" />
                  </div>

                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
                    Automated insights
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Ask questions about any dataset
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Once data has been uploaded, the assistant can identify
                    trends, compare categories, detect unusual values and
                    explain results in plain language.
                  </p>
                </div>

                <div className="flex min-w-52 flex-col justify-end">
                  <button
                    type="button"
                    disabled={dashboardStats.datasetCount === 0}
                    className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Open data assistant
                  </button>

                  {dashboardStats.datasetCount === 0 && (
                    <p className="mt-2 text-center text-xs text-slate-400">
                      Add a dataset first
                    </p>
                  )}
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Validation
                  </p>

                  <h2 className="mt-2 text-lg font-bold text-slate-950">
                    Data Health
                  </h2>
                </div>

                {dashboardStats.validationIssueCount === 0 ? (
                  <CheckCircle2 className="h-7 w-7 text-teal-700" />
                ) : (
                  <AlertTriangle className="h-7 w-7 text-amber-600" />
                )}
              </div>

              <div className="mt-8">
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-bold">
                    {dashboardStats.dataQualityScore}%
                  </p>

                  <p className="text-sm font-semibold text-teal-700">
                    Not Analysed
                  </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-slate-950"
                    style={{
                      width: `${dashboardStats.dataQualityScore}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Missing values
                  </span>

                  <span className="font-semibold text-slate-900">
                    0
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Duplicate records
                  </span>

                  <span className="font-semibold text-slate-900">
                    0
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Invalid values
                  </span>

                  <span className="font-semibold text-slate-900">
                    0
                  </span>
                </div>
              </div>
            </article>
          </section>

          {/* Insights */}
        <LatestInsights
          businessId={business.id}
          insights={insights}
        />
        </main>
      </div>
    </div>
  );
}