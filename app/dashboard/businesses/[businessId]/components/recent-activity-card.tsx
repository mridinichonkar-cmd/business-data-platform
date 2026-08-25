import Link from "next/link";
import {
  Database,
  Upload,
} from "lucide-react";

type RecentDataset = {
  id: string;
  name: string;
  row_count: number;
  created_at: string;
};

type RecentActivityCardProps = {
  businessId: string;
  datasets: RecentDataset[];
};

function formatActivityTime(
  dateString: string,
): string {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export default function RecentActivityCard({
  businessId,
  datasets,
}: RecentActivityCardProps) {
  const recentDatasets = datasets.slice(0, 5);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-950">
          Recent Activity
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Latest workspace events.
        </p>
      </div>

      {recentDatasets.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
          <Upload className="h-8 w-8 text-slate-300" />

          <p className="mt-4 font-semibold text-slate-900">
            No activity yet
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Dataset imports will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {recentDatasets.map((dataset) => (
            <Link
              key={dataset.id}
              href={`/dashboard/businesses/${businessId}/datasets/${dataset.id}`}
              className="flex gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                <Database className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {dataset.name} imported
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {(dataset.row_count ?? 0).toLocaleString()}{" "}
                  records
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {formatActivityTime(dataset.created_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link
        href={`/dashboard/businesses/${businessId}/datasets`}
        className="mt-5 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        View datasets
      </Link>
    </article>
  );
}