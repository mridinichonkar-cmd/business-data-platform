export default function DatasetsLoading() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />

        <div className="mt-8 space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-96 max-w-full animate-pulse rounded bg-slate-200" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    </main>
  );
}