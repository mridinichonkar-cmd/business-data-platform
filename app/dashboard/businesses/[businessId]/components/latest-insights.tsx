import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  FileText,
  Hash,
  Sparkles,
} from "lucide-react";

import type { Insight } from "../types/insight";

type LatestInsightsProps = {
  businessId: string;
  insights: Insight[];
};

function InsightIcon({
  category,
}: {
  category: Insight["category"];
}) {
  switch (category) {
    case "category":
      return <BarChart3 className="h-5 w-5" />;

    case "numeric":
      return <Hash className="h-5 w-5" />;

    case "date":
      return <CalendarDays className="h-5 w-5" />;

    default:
      return <Sparkles className="h-5 w-5" />;
  }
}

export default function LatestInsights({
  businessId,
  insights,
}: LatestInsightsProps) {
  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Latest Insights
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Key findings detected across your business data.
          </p>
        </div>

        <Link
          href={`/dashboard/businesses/${businessId}/analytics`}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <FileText className="h-4 w-4" />
          View analytics
        </Link>
      </div>

      {insights.length === 0 ? (
        <div className="flex min-h-52 flex-col items-center justify-center px-6 py-12 text-center">
          <Sparkles className="h-9 w-9 text-slate-300" />

          <h3 className="mt-4 font-semibold text-slate-900">
            No insights available yet
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Insights will appear here once your datasets contain fields that
            can be analysed.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {insights.slice(0, 4).map((insight) => (
            <div
              key={insight.id}
              className="flex gap-4 px-6 py-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <InsightIcon
                  category={insight.category}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">
                    {insight.title}
                  </p>

                  <span
                    className={
                      insight.source === "ai"
                        ? "rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700"
                        : "rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700"
                    }
                  >
                    {insight.source === "ai"
                      ? "AI"
                      : "Analytics"}
                  </span>
                </div>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {insight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}