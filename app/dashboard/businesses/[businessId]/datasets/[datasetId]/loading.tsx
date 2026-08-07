export default function DatasetLoading() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />

        <div className="mt-8 space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-72 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-96 max-w-full animate-pulse rounded bg-slate-200" />
        </div>

        <div className="mt-8 h-[500px] animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    </main>
  );
}