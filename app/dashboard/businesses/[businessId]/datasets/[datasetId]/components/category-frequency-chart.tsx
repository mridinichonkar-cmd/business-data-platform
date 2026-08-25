"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartItem = {
  name: string;
  count: number;
};

type CategoryFrequencyChartProps = {
  fieldName: string;
  data: ChartItem[];
};

export default function CategoryFrequencyChart({
  fieldName,
  data,
}: CategoryFrequencyChartProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
          Category analysis
        </p>

        <h2 className="mt-2 text-lg font-semibold text-slate-950">
          Records by {fieldName}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Distribution of records across the most common values.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
          No category data available.
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="name"
                angle={-25}
                textAnchor="end"
                interval={0}
                height={70}
                tick={{ fontSize: 12 }}
              />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="#0f172a"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}