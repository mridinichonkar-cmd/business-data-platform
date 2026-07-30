import { BarChart3 } from "lucide-react";

type RecordActivityCardProps = {
  totalRecords: number;
};

const activityValues = [18, 28, 22, 42, 35, 52, 46];

const dayLabels = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export default function RecordActivityCard({
  totalRecords,
}: RecordActivityCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Record Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Records added or updated during the selected period.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Last 7 days
        </span>
      </div>

      <div className="relative flex h-64 items-end gap-3 border-b border-l border-slate-200 px-4">
        {activityValues.map((height, index) => (
          <div
            key={dayLabels[index]}
            className="group flex h-full flex-1 items-end"
          >
            <div
              className="w-full rounded-t-md bg-slate-200 transition group-hover:bg-slate-950"
              style={{ height: `${height}%` }}
            />
          </div>
        ))}

        {totalRecords === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90">
            <div className="max-w-sm px-6 text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 font-semibold text-slate-900">
                No activity data yet
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Upload a dataset to begin tracking record activity over time.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between text-xs font-medium text-slate-400">
        {dayLabels.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </article>
  );
}