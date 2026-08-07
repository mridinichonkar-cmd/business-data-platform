import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import CsvUploadForm from "./csv-upload-form";

type UploadPageProps = {
  params: Promise<{
    businessId: string;
  }>;
};

export default async function UploadPage({
  params,
}: UploadPageProps) {
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
    .select("id, name")
    .eq("id", businessId)
    .maybeSingle();

  if (error || !business) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/dashboard/businesses/${business.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to {business.name}
        </Link>

        <header className="mb-8 mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Data upload
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Import a CSV dataset
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Preview your file before importing its rows into the{" "}
            {business.name} workspace.
          </p>
        </header>

        <CsvUploadForm businessId={business.id} />
      </div>
    </main>
  );
}