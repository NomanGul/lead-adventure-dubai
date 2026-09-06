function FlightCardSkeleton() {
  return (
    <article className="animate-pulse rounded-md border border-line p-4 shadow-sm sm:p-6">
      <div className="flex gap-3">
        <div className="size-10 shrink-0 rounded-sm bg-line" />
        <div className="min-w-0 flex-1 space-y-3 py-1">
          <div className="h-4 w-1/3 rounded bg-line" />
          <div className="h-3 w-1/2 rounded bg-line" />
          <div className="h-3 w-2/5 rounded bg-line" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="h-6 w-20 rounded-md bg-line" />
        <div className="h-4 w-24 rounded bg-line" />
      </div>

      <div className="mt-4 h-11 w-32 rounded-md bg-line" />
    </article>
  );
}

function HotelCardSkeleton() {
  return (
    <article className="animate-pulse overflow-hidden rounded-md border border-line shadow-sm">
      <div className="aspect-16/10 w-full bg-line" />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="space-y-2">
          <div className="h-4 w-2/3 rounded bg-line" />
          <div className="h-3 w-1/3 rounded bg-line" />
          <div className="mt-4 h-3 w-1/4 rounded bg-line" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-24 rounded-md bg-line" />
          <div className="h-6 w-28 rounded-md bg-line" />
        </div>
        <div className="h-4 w-28 rounded bg-line" />
        <div className="h-11 w-32 rounded-md bg-line" />
      </div>
    </article>
  );
}

export function ResultsSkeleton({ type = "flights", count = 4 }) {
  return (
    <div
      className="grid gap-4"
      role="status"
      aria-busy="true"
      aria-label="Loading results"
    >
      <span className="sr-only">Loading results…</span>
      {Array.from({ length: count }, (_, index) =>
        type === "hotels" ? (
          <HotelCardSkeleton key={index} />
        ) : (
          <FlightCardSkeleton key={index} />
        ),
      )}
    </div>
  );
}
