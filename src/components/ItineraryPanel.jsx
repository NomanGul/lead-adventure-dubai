import { useTrip } from "../context/TripContext";
import { formatDuration, formatMoney } from "../utils/format";
import { getNights, getTripTotal } from "../utils/tripCost";

export function ItineraryPanel() {
  const { itinerary, removeFromTrip } = useTrip();
  const nights = getNights(itinerary.departure, itinerary.returnDate);
  const guests = Math.max(1, itinerary.adults + itinerary.children);
  const totals = getTripTotal(itinerary, nights, guests);
  const isEmpty =
    itinerary.flights.length === 0 && itinerary.hotels.length === 0;
  const itemCount = itinerary.flights.length + itinerary.hotels.length;

  return (
    <aside
      id="itinerary"
      className="w-full max-w-sm border border-line bg-canvas p-6"
      aria-label="Itinerary"
    >
      <h2 className="text-lg font-medium text-ink">Itinerary</h2>

      <div className="mt-4 space-y-6">
        {isEmpty ? (
          <p className="text-sm text-muted">No items yet.</p>
        ) : (
          <ul className="space-y-4">
            {itinerary.flights.map((flight) => (
              <li key={flight.id} className="flex items-center gap-4">
                <img
                  src={flight.logo}
                  alt=""
                  width={64}
                  height={64}
                  className="size-16 shrink-0 rounded-sm bg-surface object-contain p-2"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm text-ink">{flight.airline}</h3>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {flight.origin} to {flight.destination}
                  </p>
                  <p className="text-[10px] text-muted">
                    {formatDuration(flight.durationMinutes)}
                  </p>
                  <p className="text-[10px] text-muted">
                    {formatMoney(flight.price)}
                    {totals.travelers > 1
                      ? ` × ${totals.travelers}`
                      : " / person"}
                  </p>
                </div>

                <button
                  type="button"
                  className="shrink-0 text-sm text-muted underline transition hover:text-danger"
                  onClick={() => removeFromTrip("flights", flight.id)}
                >
                  Remove
                </button>
              </li>
            ))}

            {itinerary.hotels.map((hotel) => (
              <li key={hotel.id} className="flex items-center gap-4">
                <img
                  src={hotel.image}
                  alt=""
                  width={64}
                  height={64}
                  className="size-16 shrink-0 rounded-sm object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm text-ink">{hotel.name}</h3>
                  <p className="mt-0.5 text-[10px] text-muted">{hotel.city}</p>
                  <p className="text-[10px] text-muted">
                    {formatMoney(hotel.pricePerNight)} / night
                  </p>
                </div>

                <button
                  type="button"
                  className="shrink-0 text-sm text-muted underline transition hover:text-danger"
                  onClick={() => removeFromTrip("hotels", hotel.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-4 text-center">
          <div className="rounded-sm border border-line bg-surface px-5 py-3 text-sm text-muted">
            <p>Items ({itemCount})</p>
            <p>
              Flights
              {totals.travelers > 1 ? ` × ${totals.travelers}` : ""}:{" "}
              {formatMoney(totals.flightsTotal)}
            </p>
            <p>
              {totals.nights > 0
                ? `Hotels × ${totals.nights} night${totals.nights === 1 ? "" : "s"}`
                : "Hotels (set travel dates)"}
              : {formatMoney(totals.hotelsTotal)}
            </p>
          </div>

          <div
            className="rounded-sm border border-line bg-canvas px-5 py-3 text-sm font-semibold text-ink"
            aria-live="polite"
          >
            Total: {formatMoney(totals.grandTotal)}
          </div>
        </div>
      </div>
    </aside>
  );
}
