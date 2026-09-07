function Bar({ className }) {
  return <div className={`rounded bg-line ${className}`} />;
}

function FlightSkeleton() {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="size-9 shrink-0 rounded-lg bg-line" />
          <div className="flex-1 space-y-2">
            <Bar className="h-3.5 w-28" />
            <Bar className="h-2.5 w-20" />
          </div>
        </div>
        <div className="space-y-2">
          <Bar className="h-5 w-16" />
          <Bar className="h-2.5 w-12" />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="w-12 space-y-1.5">
          <Bar className="h-4" />
          <Bar className="h-2.5 w-8" />
        </div>
        <Bar className="h-px flex-1" />
        <div className="w-12 space-y-1.5">
          <Bar className="h-4" />
          <Bar className="h-2.5 w-8" />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-3">
        <Bar className="h-5 w-24" />
        <Bar className="h-10 w-28 rounded-xl" />
      </div>
    </article>
  );
}

function HotelSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="aspect-16/10 bg-line sm:aspect-21/9" />
      <div className="space-y-3 p-4">
        <div className="flex justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Bar className="h-3.5 w-2/3" />
            <Bar className="h-2.5 w-1/3" />
          </div>
          <div className="size-9 rounded-lg bg-line" />
        </div>
        <div className="flex items-end justify-between gap-3 border-t border-line pt-3">
          <div className="space-y-2">
            <Bar className="h-5 w-20" />
            <Bar className="h-2.5 w-28" />
          </div>
          <Bar className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </article>
  );
}

export function ResultsSkeleton({ type = "flights", count = 4 }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="grid gap-4 motion-safe:animate-pulse"
    >
      <span className="sr-only">Loading {type}…</span>
      {Array.from({ length: count }, (_, i) =>
        type === "flights" ? (
          <FlightSkeleton key={i} />
        ) : (
          <HotelSkeleton key={i} />
        ),
      )}
    </div>
  );
}
