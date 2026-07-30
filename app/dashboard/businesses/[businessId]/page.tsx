import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type BusinessPageProps = {
  params: Promise<{
    businessId: string;
  }>;
};

async function BusinessContent({
  businessId,
}: {
  businessId: string;
}) {
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

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="font-semibold text-red-800">
          Failed to load business
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error.message}
        </p>
      </div>
    );
  }

  if (!business) {
    notFound();
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Back to dashboard
        </Link>
      </div>

      <header className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Business
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          {business.name}
        </h1>

        <p className="mt-2 text-gray-600">
          {business.industry || "No industry provided"}
        </p>

        <p className="mt-4 text-sm text-gray-400">
          Created{" "}
          {new Date(business.created_at).toLocaleDateString("en-AU")}
        </p>
      </header>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Datasets
            </h2>

            <p className="mt-1 text-gray-600">
              Create a dataset for the type of information this business
              manages.
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg bg-black px-4 py-2 font-medium text-white"
          >
            Create dataset
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-dashed bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No datasets yet
          </h3>

          <p className="mt-2 text-gray-600">
            Examples include customers, projects, orders, properties or
            inventory.
          </p>
        </div>
      </section>
    </>
  );
}

export default async function BusinessPage({
  params,
}: BusinessPageProps) {
  const { businessId } = await params;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Suspense fallback={<p>Loading business...</p>}>
          <BusinessContent businessId={businessId} />
        </Suspense>
      </div>
    </main>
  );
}