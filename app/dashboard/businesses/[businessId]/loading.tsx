export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="space-y-4 p-6">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-12 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="h-16 border-b border-slate-200 bg-white" />

        <main className="mx-auto max-w-[1500px] px-4 py-8 md:px-8">
          <div className="mb-8 h-10 w-72 animate-pulse rounded bg-slate-200" />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}