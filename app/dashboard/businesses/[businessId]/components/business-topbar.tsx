import Link from "next/link";
import {
  ArrowLeft,
  CircleHelp,
  Plus,
  Search,
} from "lucide-react";

type BusinessTopbarProps = {
  business: {
    id: string;
    name: string;
  };
};

export default function BusinessTopbar({
  business,
}: BusinessTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 lg:hidden"
            aria-label="Return to businesses"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-semibold text-slate-950">
              {business.name}
            </p>

            <p className="text-xs text-slate-500">
              Data workspace
            </p>
          </div>

          <div className="relative hidden w-80 lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              placeholder="Search records, fields or datasets..."
              aria-label="Search workspace"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Help"
          >
            <CircleHelp className="h-5 w-5" />
          </button>

          <Link
            href={`/dashboard/businesses/${business.id}/datasets`}
            className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add dataset
          </Link>
        </div>
      </div>
    </header>
  );
}