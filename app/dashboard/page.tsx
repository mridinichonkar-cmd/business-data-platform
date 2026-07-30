import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateBusinessForm from "@/components/create-business-form";
import Link from "next/link";

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
    .select("id, name, industry, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
     <div className="mb-8">
      <p className="text-sm text-gray-500">Signed in as</p>
      <p className="font-medium text-gray-900">{user.email}</p>
    </div>

     <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
      <section>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            My businesses
          </h2>

           <p className="mt-1 text-gray-600">
            Select a business to manage its datasets and records.
          </p>
        </div>


        {error && (
          <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
            Failed to load businesses: {error.message}
          </p>
        )}

        {!error && businesses?.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed bg-white p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              No businesses yet
            </h3>

            <p className="mt-2 text-gray-600">
              Use the form to create your first business.
            </p>
          </div>
        )}

        {!error && businesses && businesses.length > 0 && (
          <div className="mt-6 grid gap-4">
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={`dashboard/businesses/${business.id}`}
                className="block rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {business.name}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  {business.industry || "No industry provided"}
                </p>
                </div>

                <span className="mt-4 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  Open →

                </span>
              </div>

                <p className="mt-4 text-xs text-gray-400">
                  Created{" "}
                  {new Date(business.created_at).toLocaleDateString("en-AU")}
                </p>
              
              </Link>

          
            ))}
          </div>
        )}
      </section>

      <aside className="lg:sticky lg:top-8">
        <CreateBusinessForm />
      </aside>
    </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
        </div>

        <Suspense fallback={<p>Loading dashboard...</p>}>
          <DashboardContent />
        </Suspense>
      </div>
    </main>
  );
}