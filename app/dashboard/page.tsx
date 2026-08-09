import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateBusinessForm from "@/components/create-business-form";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  HelpCircle,
  Search,
  Settings,
} from "lucide-react";

async function DashboardContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, industry, created_at,datasets(id)")
    .order("created_at", { ascending: false });

  const businessCount = businesses?.length ?? 0;
    return (
    <>
      {/* Top navigation */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-xl font-bold tracking-tight text-slate-950"
            >
              Analytics Portal
            </Link>

            {/* Search is visual for now. We can add filtering later. */}
            <div className="hidden items-center rounded-lg border border-slate-200 bg-slate-50 px-3 md:flex">
              <Search className="h-4 w-4 text-slate-500" />

              <input
                type="search"
                placeholder="Search businesses..."
                aria-label="Search businesses"
                className="w-64 border-none bg-transparent px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Notifications"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <Bell className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label="Help"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            <div className="mx-3 hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="hidden max-w-56 text-right sm:block">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.email}
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Account owner
              </p>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto min-h-screen max-w-[1440px] px-4 py-10 md:px-8">
        {/* Page heading */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            My Businesses
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Manage your organisations and access the datasets, records and
            insights belonging to each business.
          </p>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load businesses: {error.message}
          </div>
        )}

        {/* Business cards and create-business form */}
        <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          {businesses?.map((business) => (
            <article
              key={business.id}
              className="group flex min-h-[310px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-700 hover:shadow-lg"
            >
              <div>
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
                      <Building2 className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-semibold text-slate-950">
                        {business.name}
                      </h2>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {business.industry || "Industry not provided"}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-800">
                    Active
                  </span>
                </div>

                <div className="mb-8 grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-transparent bg-slate-100 p-4 transition group-hover:border-slate-200">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Datasets
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                      {business.datasets.length.toString().padStart(2, "0")}
                    </p>
                  </div>

                  <div className="rounded-lg border border-transparent bg-slate-100 p-4 transition group-hover:border-slate-200">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Data status
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-teal-700" />

                      <p className="text-sm font-semibold text-teal-700">
                        Ready
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/businesses/${business.id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Go to dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  aria-label={`Settings for ${business.name}`}
                  className="flex items-center justify-center rounded-lg border border-slate-300 px-3 text-slate-700 transition hover:bg-slate-100"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </article>
          ))}

          {/* Existing create-business form */}
          <div className="min-h-[310px]">
            <CreateBusinessForm />
          </div>

          {/* Portfolio summary */}
          <article className="relative min-h-[280px] overflow-hidden rounded-xl justify-items-center bg-slate-950 p-8 text-white lg:col-span-2">
            <div className="relative z-10 flex h-full flex-col justify-center">
              <p className="text-3xl font-bold uppercase tracking-[0.2em] text-teal-300">
                Portfolio insights
              </p>


              <p className="mt-2 max-w-xl text-md text-slate-300">
                A combined summary of the businesses and data connected to your
                account.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-8">
                <div>
                  <p className="text-[16px] font-bold uppercase tracking-wide text-slate-400">
                    Total businesses
                  </p>

                  <p className="mt-1 text-3xl font-semibold">
                    {businessCount.toString().padStart(2, "0")}
                  </p>
                </div>

                <div className="h-12 w-px bg-slate-700" />

                <div>
                  <p className="text-[16px] font-bold uppercase tracking-wide text-slate-400">
                    Total datasets
                  </p>

                  <p className="mt-1 text-3xl font-semibold">00</p>
                </div>

                <div className="h-12 w-px bg-slate-700" />

                <div>
                  <p className="text-[16px] font-bold uppercase tracking-wide text-slate-400">
                    Pending imports
                  </p>

                  <p className="mt-1 text-3xl font-semibold">00</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-slate-700 opacity-50" />
            <div className="absolute -bottom-32 right-24 h-72 w-72 rounded-full border border-slate-800 opacity-50" />
          </article>
        </section>

        {/* Activity section */}
        <section className="mt-12">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-950">
              Account Activity
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Recent actions across all your registered businesses.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-100 px-6 py-3">
              <div className="grid grid-cols-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Event</span>
                <span>Business</span>
                <span>Date</span>
                <span>Status</span>
              </div>
            </div>

            <div className="p-10 text-center">
              <h3 className="font-semibold text-slate-900">
                No account activity yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Dataset creation, CSV imports and record updates will appear
                here later.
              </p>
            </div>
          </div>
        </section>
      </main>

      </div>
      <footer className="border-t border-slate-200 bg-slate-100">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row md:px-8">
          <p className="font-semibold text-slate-800">Analytics Portal</p>
          <p>Business data management platform</p>
        </div>
      </footer>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 p-10">
          <p className="text-slate-600">Loading dashboard...</p>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}