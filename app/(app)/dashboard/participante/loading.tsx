export default function ParticipanteDashboardLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 px-4 py-6">
      <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
      <div className="h-3 w-32 rounded bg-muted animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border bg-card p-5 space-y-3">
          <div className="h-4 w-36 rounded bg-muted animate-pulse" />
          <div className="h-3 w-full rounded bg-muted animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}
