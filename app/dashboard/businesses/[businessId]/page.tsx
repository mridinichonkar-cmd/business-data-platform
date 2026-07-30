import { notFound, redirect } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  Sparkles,
  Upload,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import BusinessSidebar from "./components/business-sidebar";
import BusinessTopbar from "./components/business-topbar";
import DatasetsCard from "./components/datasets-card";
import MetricsGrid from "./components/metrics-grid";
import RecordActivityCard from "./components/record-activity-card";

import type { DashboardStats } from "./types";

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

  const dashboardStats: DashboardStats = {
    totalRecords: 0,
    datasetCount: 0,
    customFieldCount: 0,
    dataQualityScore: 0,
    validationIssueCount: 0,
    insightCount: 0,
  };

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
          <MetricsGrid stats={dashboardStats} />

          {/* Activity section */}
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <RecordActivityCard
              totalRecords={dashboardStats.totalRecords}
            />

            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Recent Activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest workspace events.
                  </p>
                </div>

                <Clock3 className="h-5 w-5 text-slate-400" />
              </div>

              <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                <Upload className="h-8 w-8 text-slate-300" />

                <p className="mt-4 font-semibold text-slate-900">
                  No activity yet
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Imports, schema changes and generated reports will appear
                  here.
                </p>
              </div>

              <button
                type="button"
                className="mt-5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                View all activity
              </button>
            </article>
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
                    description: "Requires at least one date field.",
                  },
                  {
                    label: "Numeric comparisons",
                    description: "Requires one or more numeric fields.",
                  },
                  {
                    label: "Category breakdowns",
                    description:
                      "Requires categorical or select fields.",
                  },
                  {
                    label: "Geographic analysis",
                    description:
                      "Requires location or coordinate fields.",
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

                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Not available
                    </span>
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
                    Healthy
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
          <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Latest Insights
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Findings generated from your uploaded data.
                </p>
              </div>

              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <FileText className="h-4 w-4" />
                Generate report
              </button>
            </div>

            <div className="flex min-h-52 flex-col items-center justify-center px-6 py-12 text-center">
              <Sparkles className="h-9 w-9 text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-900">
                No insights generated yet
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Once your business has data, this section can surface trends,
                anomalies, correlations and data-quality findings without
                assuming a particular industry.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}