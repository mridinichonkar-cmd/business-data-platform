import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateBusinessForm from "@/components/create-business-form";

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
              <article
                key={business.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {business.name}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  {business.industry || "No industry provided"}
                </p>

                <p className="mt-4 text-xs text-gray-400">
                  Created{" "}
                  {new Date(business.created_at).toLocaleDateString("en-AU")}
                </p>
              </article>
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