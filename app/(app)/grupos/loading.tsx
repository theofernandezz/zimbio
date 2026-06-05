export default function GruposLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-28 rounded-lg bg-muted animate-pulse" />
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-full rounded-2xl border bg-card p-4 flex items-center gap-4"
        >
          <div className="flex -space-x-2 shrink-0">
            <div className="size-12 rounded-xl bg-muted animate-pulse ring-2 ring-background" />
            <div className="size-12 rounded-xl bg-muted animate-pulse ring-2 ring-background" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-4 w-4 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}
