import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Database,
  Plus,
  Table2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type DatasetsPageProps = {
  params: Promise<{
    businessId: string;
  }>;
};

export default async function DatasetsPage({
  params,
}: DatasetsPageProps) {
  const { businessId } = await params;

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
    .select("id, name, columns, row_count, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  const basePath = `/dashboard/businesses/${business.id}`;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href={basePath}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to business dashboard
        </Link>

        <header className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              {business.name}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Datasets
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              Browse the data collections imported into this business
              workspace.
            </p>
          </div>

          <Link
            href={`${basePath}/upload`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Upload dataset
          </Link>
        </header>

        {datasetsError && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load datasets: {datasetsError.message}
          </div>
        )}

        {!datasetsError && (!datasets || datasets.length === 0) && (
          <section className="mt-8 flex min-h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 text-center">
            <Database className="h-12 w-12 text-slate-300" />

            <h2 className="mt-5 text-xl font-semibold text-slate-950">
              No datasets yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Upload a CSV file to create your first dataset and begin
              managing its records.
            </p>

            <Link
              href={`${basePath}/upload`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Upload your first dataset
            </Link>
          </section>
        )}

        {!datasetsError && datasets && datasets.length > 0 && (
          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {datasets.map((dataset) => {
              const columns = Array.isArray(dataset.columns)
                ? dataset.columns
                : [];

              const createdDate = new Intl.DateTimeFormat("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date(dataset.created_at));

              return (
                <Link
                  key={dataset.id}
                  href={`${basePath}/datasets/${dataset.id}`}
                  className="group flex min-h-64 flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-700 hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white">
                        <Database className="h-6 w-6" />
                      </div>

                      <span className="rounded-full bg-teal-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-800">
                        Imported
                      </span>
                    </div>

                    <h2 className="mt-6 truncate text-xl font-semibold text-slate-950">
                      {dataset.name}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Open this dataset to browse its records and columns.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-100 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Records
                        </p>

                        <p className="mt-1 text-2xl font-semibold text-slate-950">
                          {(dataset.row_count ?? 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-100 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Columns
                        </p>

                        <p className="mt-1 text-2xl font-semibold text-slate-950">
                          {columns.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-4 w-4" />
                      Imported {createdDate}
                    </div>

                    <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                      Open
                      <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}

        {datasets && datasets.length > 0 && (
          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
                <Table2 className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {datasets.length}{" "}
                  {datasets.length === 1 ? "dataset" : "datasets"}
                </p>

                <p className="text-sm text-slate-500">
                  Select a dataset above to browse its records.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}