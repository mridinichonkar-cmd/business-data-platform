import {
  CheckCircle2,
  Database,
  Sparkles,
  Table2,
} from "lucide-react";

import type { DashboardStats } from "../types";
import MetricCard from "./metric-card";

type MetricsGridProps = {
  stats: DashboardStats;
};

export default function MetricsGrid({ stats }: MetricsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Total records"
        value={stats.totalRecords.toLocaleString()}
        detail="Across all datasets"
        icon={<Table2 className="h-5 w-5" />}
      />

      <MetricCard
        title="Datasets"
        value={stats.datasetCount.toLocaleString()}
        detail={`${stats.customFieldCount} custom fields`}
        icon={<Database className="h-5 w-5" />}
      />

      <MetricCard
        title="Data quality"
        value={`${stats.dataQualityScore}%`}
        detail={
          stats.validationIssueCount === 0
            ? "No issues detected"
            : `${stats.validationIssueCount} issues`
        }
        status={stats.validationIssueCount === 0 ? "positive" : "warning"}
        icon={<CheckCircle2 className="h-5 w-5" />}
      />

      <MetricCard
        title="Generated insights"
        value={stats.insightCount.toLocaleString()}
        detail="AI-assisted analysis"
        icon={<Sparkles className="h-5 w-5" />}
      />
    </section>
  );
}