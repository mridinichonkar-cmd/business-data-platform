import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  BarChart3,
  Database,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">
        Loading...
      </p>
    </main>
  );
}

async function HomeContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 text-lg font-bold tracking-tight"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>

            Data Portal
          </Link>

          <div className="flex items-center gap-3">
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense fallback={null}>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-20 md:px-8 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              Flexible business data management
            </p>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Organise, manage and understand your business data.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Import structured business data, create flexible datasets and
              uncover useful insights without being locked into a single
              industry or data model.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Go to dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/sign-up"
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Sign in
                    
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Product preview */}
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Customer Data
                  </p>

                  <p className="text-xs text-slate-500">
                    Example workspace
                  </p>
                </div>

                <span className="rounded-full bg-teal-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-800">
                  Active
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-100 p-4">
                  <p className="text-xs text-slate-500">
                    Records
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-950">
                    2,500
                  </p>
                </div>

                <div className="rounded-lg bg-slate-100 p-4">
                  <p className="text-xs text-slate-500">
                    Fields
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-950">
                    11
                  </p>
                </div>

                <div className="rounded-lg bg-slate-100 p-4">
                  <p className="text-xs text-slate-500">
                    Insights
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-950">
                    3
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-slate-950 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-300">
                  Latest insight
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Australia is the most common country represented in this
                  dataset.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Built for flexible data
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            One workspace for different kinds of business records
          </h2>

          <p className="mt-4 text-slate-600">
            The platform adapts to the structure of the data you upload rather
            than assuming every organisation works the same way.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
              <FileSpreadsheet className="h-5 w-5 text-slate-800" />
            </div>

            <h3 className="mt-5 font-semibold text-slate-950">
              Import CSV data
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Upload structured data and automatically create reusable
              datasets.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
              <Database className="h-5 w-5 text-slate-800" />
            </div>

            <h3 className="mt-5 font-semibold text-slate-950">
              Flexible schemas
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Store different types of business records without relying on one
              fixed industry model.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
              <BarChart3 className="h-5 w-5 text-slate-800" />
            </div>

            <h3 className="mt-5 font-semibold text-slate-950">
              Automatic analytics
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Detect categories, numbers and dates to generate relevant
              summaries and charts.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
              <Sparkles className="h-5 w-5 text-slate-800" />
            </div>

            <h3 className="mt-5 font-semibold text-slate-950">
              AI-ready insights
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The analytics layer is designed to support AI-generated
              explanations and a data assistant later.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              From raw CSV to useful insights
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-bold text-teal-700">
                01
              </p>

              <h3 className="mt-3 text-lg font-semibold text-slate-950">
                Create a business workspace
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Register an organisation and keep its data separated from your
                other workspaces.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-teal-700">
                02
              </p>

              <h3 className="mt-3 text-lg font-semibold text-slate-950">
                Upload a dataset
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Import CSV records and automatically detect useful field types.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-teal-700">
                03
              </p>

              <h3 className="mt-3 text-lg font-semibold text-slate-950">
                Explore the data
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View distributions, numeric summaries, time trends and
                high-level insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="rounded-2xl bg-slate-950 px-6 py-10 text-white md:px-10">
          <div className="flex max-w-3xl flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <ShieldCheck className="h-6 w-6 text-teal-300" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Business data stays separated by account
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Authentication and row-level database policies ensure that
                business workspaces and their datasets are only available to
                authorised users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center md:px-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Turn your business data into something useful.
            </h2>

            <p className="mt-2 text-slate-600">
              Create a workspace and start exploring your data.
            </p>
          </div>

          <Link
            href={user ? "/dashboard" : "/auth/sign-up"}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {user ? "Go to dashboard" : "Create an account"}

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-7 text-sm text-slate-500 sm:flex-row md:px-8">
          <p className="font-semibold text-slate-800">
            Data Portal
          </p>

          <p>
            Flexible business data management and analytics
          </p>
        </div>
      </footer>
    </main>
  );
}