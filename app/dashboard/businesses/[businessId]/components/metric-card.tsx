import type { ReactNode } from "react";

type MetricCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: ReactNode;
  status?: "positive" | "neutral" | "warning";
};

export default function MetricCard({
  title,
  value,
  detail,
  icon,
  status = "neutral",
}: MetricCardProps) {
  const detailStyles = {
    positive: "text-teal-700",
    neutral: "text-slate-500",
    warning: "text-amber-700",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
          {icon}
        </div>

        <span className={`text-xs font-semibold ${detailStyles[status]}`}>
          {detail}
        </span>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
    </article>
  );
}