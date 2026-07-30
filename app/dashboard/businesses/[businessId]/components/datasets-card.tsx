import Link from "next/link";
import {
  ChevronRight,
  Database,
  Plus,
} from "lucide-react";

type DatasetsCardProps = {
  businessId: string;
  datasetCount: number;
};

export default function DatasetsCard({
  businessId,
  datasetCount,
}: DatasetsCardProps) {
  const datasetsPath =
    `/dashboard/businesses/${businessId}/datasets`;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Datasets
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Data collections registered to this business.
          </p>
        </div>

        <Link
          href={datasetsPath}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {datasetCount === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <Database className="h-9 w-9 text-slate-300" />

          <h3 className="mt-4 font-semibold text-slate-900">
            Create your first dataset
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Define fields manually or upload a CSV file to create your dataset
            structure.
          </p>

          <Link
            href={datasetsPath}
            className="mt-5 flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Create dataset
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            {datasetCount}{" "}
            {datasetCount === 1 ? "dataset" : "datasets"} available.
          </p>

          <Link
            href={datasetsPath}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
          >
            Browse datasets
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </article>
  );
}