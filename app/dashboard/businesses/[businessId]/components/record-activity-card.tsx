"use client";

import { BarChart3 } from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ActivityPoint = {
  date: string;
  count: number;
};

type RecordActivityCardProps = {
  activity: ActivityPoint[];
};

function formatActivityDate(
  dateString: string,
): string {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export default function RecordActivityCard({
  activity,
}: RecordActivityCardProps) {
  const chartData = activity.map((item) => ({
    date: formatActivityDate(item.date),
    count: item.count,
  }));

  const importedRecords = activity.reduce(
    (total, item) => total + item.count,
    0,
  );

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Import Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Records added through dataset imports over the last 7 days.
          </p>
        </div>

        {activity.length > 0 && (
          <div className="text-right">
            <p className="text-xl font-bold text-slate-950">
              {importedRecords.toLocaleString()}
            </p>

            <p className="text-xs text-slate-500">
              records imported
            </p>
          </div>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
          <BarChart3 className="h-8 w-8 text-slate-300" />

          <p className="mt-4 font-semibold text-slate-900">
            No import activity yet
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Upload a dataset to begin tracking record activity.
          </p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
             <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 0,
              }}
              >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  value >= 1000
                    ? `${(value / 1000).toFixed(1)}k`
                    : String(value)
                }
              />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="#0f172a"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}