import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Database,
  FileBarChart,
  Gauge,
  LayoutDashboard,
  Settings,
  Upload,
} from "lucide-react";

import type { Business } from "../types";

type BusinessSidebarProps = {
  business: Business;
};

export default function BusinessSidebar({
  business,
}: BusinessSidebarProps) {
  const createdDate = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(business.created_at));

  const basePath = `/dashboard/businesses/${business.id}`;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="border-b border-slate-200 px-6 py-6">
        <Link
          href="/dashboard"
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          All businesses
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
            <BarChart3 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{business.name}</p>
            <p className="truncate text-xs text-slate-500">
              {business.industry || "Business workspace"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <Link
          href={basePath}
          className="flex items-center gap-3 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>

        <Link
          href={`${basePath}/datasets`}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          <Database className="h-5 w-5" />
          Datasets
        </Link>

        <Link
          href={`${basePath}/upload`}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          <Upload className="h-5 w-5" />
          Data upload
        </Link>

        <Link
          href={`${basePath}/analytics`}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          <Gauge className="h-5 w-5" />
          Analytics
        </Link>

        <Link
          href={`${basePath}/reports`}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          <FileBarChart className="h-5 w-5" />
          Reports
        </Link>

        <Link
          href={`${basePath}/settings`}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Workspace created
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {createdDate}
          </p>
        </div>
      </div>
    </aside>
  );
}