export default function AccesosLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 px-4 py-6">
      <div className="h-7 w-28 rounded-lg bg-muted animate-pulse" />
      <div className="h-3 w-52 rounded bg-muted animate-pulse" />
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="size-10 rounded-xl bg-muted animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
