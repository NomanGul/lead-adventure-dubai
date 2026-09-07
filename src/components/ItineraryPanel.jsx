import { AirplaneTilt, Bed, SuitcaseRolling, Trash, Warning } from "@phosphor-icons/react";
import { useTrip } from "../context/useTrip";
import { formatDateLong, formatMoney, formatTime, pluralise } from "../utils/format";
import { auditTrip, buildTimeline, tripTotals } from "../utils/tripPlan";

function groupByDate(events) {
  const days = new Map();

  events.forEach((event) => {
    if (!days.has(event.date)) days.set(event.date, []);
    days.get(event.date).push(event);
  });

  return [...days.entries()];
}

export function ItineraryPanel() {
  const { itinerary, savedStays, toggleSaved, clearItinerary, plainLegs, travellers } = useTrip();

  const plan = itinerary.plan;
  const legs = plan.legs?.length ? plan.legs : plainLegs;
  const heads = plan.legs?.length ? (plan.adults ?? 1) + (plan.children ?? 0) : travellers;

  const totals = tripTotals(itinerary, savedStays, heads);
  const issues = auditTrip(itinerary, legs, savedStays);
  const timeline = buildTimeline(itinerary, legs, savedStays);
  const days = groupByDate(timeline);

  const itemCount = itinerary.flights.length + itinerary.hotels.length;

  if (itemCount === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center">
        <span aria-hidden className="mx-auto grid size-11 place-items-center rounded-xl bg-canvas text-muted">
          <SuitcaseRolling size={22} aria-hidden />
        </span>
        <h2 className="mt-3 text-sm font-semibold text-ink">Your trip is empty</h2>
        <p className="mt-1 text-xs text-muted">
          Save a flight or a stay and it will show up here as a day-by-day plan.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface">
      <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-3.5">
        <h2 className="text-sm font-semibold text-ink">
          My trip
          <span className="ml-1.5 rounded-full bg-canvas px-2 py-0.5 text-[11px] font-bold text-muted">
            {itemCount}
          </span>
        </h2>
        <button
          type="button"
          onClick={clearItinerary}
          className="rounded text-xs font-semibold text-muted underline decoration-line transition hover:text-danger"
        >
          Clear
        </button>
      </header>

      {issues.length > 0 ? (
        <ul className="space-y-1.5 border-b border-line bg-amber-50/60 px-4 py-3" aria-label="Trip warnings">
          {issues.slice(0, 4).map((issue) => (
            <li key={issue.id} className="flex gap-2 text-xs text-amber-900">
              <Warning size={14} className="mt-px shrink-0 text-amber-600" aria-hidden />
              {issue.text}
            </li>
          ))}
        </ul>
      ) : null}

      <ol className="space-y-4 px-4 py-4">
        {days.map(([date, events]) => (
          <li key={date}>
            <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
              {formatDateLong(date) || "Date not set"}
            </p>

            <ul className="space-y-2 border-l border-line pl-3.5">
              {events.map((event) => (
                <li key={event.id} className="relative">
                  <span
                    aria-hidden
                    className={`absolute top-2 -left-[calc(0.875rem+0.5px)] grid size-4 -translate-x-1/2 place-items-center rounded-full ring-2 ring-surface ${
                      event.type === "flight" ? "bg-brand-600" : "bg-amber-500"
                    }`}
                  >
                    {event.type === "flight" ? (
                      <AirplaneTilt size={10} weight="fill" className="text-white" aria-hidden />
                    ) : (
                      <Bed size={10} weight="fill" className="text-white" aria-hidden />
                    )}
                  </span>

                  <div className="group flex items-start gap-2 rounded-lg px-2 py-1.5 transition hover:bg-canvas">
                    <div className="min-w-0 flex-1">
                      {event.type === "flight" ? (
                        <>
                          <p className="truncate text-xs font-semibold text-ink">
                            {event.isReturn ? "Return · " : ""}
                            {event.leg.carrierName}
                          </p>
                          <p className="text-[11px] text-muted">
                            {event.leg.originCity || event.leg.originCode} →{" "}
                            {event.leg.destinationCity || event.leg.destinationCode} ·{" "}
                            {formatTime(event.leg.departure)}–{formatTime(event.leg.arrival)}
                          </p>
                          {!event.isReturn ? (
                            <p className="text-[11px] text-muted">
                              {formatMoney(event.item.price)} × {pluralise(heads, "traveller")}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <p className="truncate text-xs font-semibold text-ink">{event.item.name}</p>
                          <p className="text-[11px] text-muted">
                            {event.city}
                            {event.stay?.nights ? ` · ${pluralise(event.stay.nights, "night")}` : ""}
                          </p>
                          <p className="text-[11px] text-muted">
                            {event.item.perNightLabel || formatMoney(event.item.perNight)} per night
                          </p>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toggleSaved(event.type === "flight" ? "flights" : "hotels", event.item)
                      }
                      aria-label={`Remove ${
                        event.type === "flight" ? event.leg.carrierName : event.item.name
                      } from trip`}
                      title="Remove from trip"
                      className="grid size-7 shrink-0 place-items-center rounded-md text-muted/70 transition hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash size={14} aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <dl className="space-y-1.5 border-t border-line px-4 py-3.5 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">
            Flights
            {heads > 1 ? ` × ${heads}` : ""}
          </dt>
          <dd className="font-semibold text-ink tabular-nums">{formatMoney(totals.flightsTotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">
            {totals.bookedNights > 0 ? `Stays · ${pluralise(totals.bookedNights, "night")}` : "Stays"}
          </dt>
          <dd className="font-semibold text-ink tabular-nums">{formatMoney(totals.hotelsTotal)}</dd>
        </div>
      </dl>

      <div
        className="flex items-baseline justify-between gap-3 rounded-b-2xl bg-ink px-4 py-3.5"
        aria-live="polite"
      >
        <span className="text-xs font-semibold tracking-wide text-white/60 uppercase">
          Trip total
        </span>
        <span className="text-lg font-bold text-white tabular-nums">
          {formatMoney(totals.grandTotal)}
        </span>
      </div>
    </div>
  );
}
