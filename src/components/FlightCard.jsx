import { useTrip } from "../context/TripContext";
import { formatDuration, formatMoney } from "../utils/format";

export function FlightCard({ flight }) {
  const { itinerary, addToTrip } = useTrip();
  const alreadyAdded = itinerary.flights.some((f) => f.id === flight.id);

  const leg = flight.legs?.[0] ?? {};
  const carrier = leg.carriers?.marketing?.[0] ?? {};
  const stops = Number(leg.stopCount) || 0;
  const stopsLabel = stops === 0 ? "Direct" : `Layover (${stops})`;
  const score = Number(flight.score);
  const rating = Number.isFinite(score) ? (score * 5).toFixed(1) : "—";
  const priceLabel =
    flight.price?.formatted ||
    formatMoney(Math.round(Number(flight.price?.raw) || 0));

  return (
    <article className="rounded-md border border-line p-4 shadow-sm sm:p-6">
      <div className="flex min-w-0 gap-3">
        {carrier.logoUrl ? (
          <img
            src={carrier.logoUrl}
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 object-contain"
          />
        ) : (
          <div className="size-10 shrink-0 rounded-sm bg-canvas" aria-hidden />
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-medium text-pretty text-ink">
            {carrier.name || "Unknown airline"}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {leg.origin?.displayCode} to {leg.destination?.displayCode}
          </p>
          <p className="mt-4 text-sm text-muted">
            Duration {formatDuration(Number(leg.durationInMinutes) || 0)} -
            Rating {rating}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <span className="rounded-md bg-brand-100 px-2.5 py-0.5 text-sm text-brand-700">
          {stopsLabel}
        </span>
        <p className="text-sm font-medium text-ink">
          {priceLabel}
          <span className="font-normal text-muted"> / person</span>
        </p>
      </div>

      <button
        type="button"
        disabled={alreadyAdded}
        className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-600 bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:ring-4 focus-visible:ring-brand-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => addToTrip("flights", flight)}
      >
        {alreadyAdded ? "Added" : "Add to trip"}
      </button>
    </article>
  );
}
