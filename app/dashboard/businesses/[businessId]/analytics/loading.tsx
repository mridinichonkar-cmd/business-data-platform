export default function AnalyticsLoading() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />

        <div className="mt-8 space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />

          <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />

          <div className="h-5 w-96 max-w-full animate-pulse rounded bg-slate-200" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-xl bg-white"
            />
          ))}
        </div>

        <div className="mt-6 h-72 animate-pulse rounded-xl bg-white" />

        <div className="mt-6 h-96 animate-pulse rounded-xl bg-white" />
      </div>
    </main>
  );
}