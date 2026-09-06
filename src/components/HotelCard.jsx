import { useTrip } from "../context/TripContext";
import { formatMoney } from "../utils/format";

export function HotelCard({ hotel }) {
  const { itinerary, addToTrip } = useTrip();
  const alreadyAdded = itinerary.hotels.some((h) => h.id === hotel.id);

  return (
    <article className="overflow-hidden rounded-md border border-line shadow-sm">
      <img
        src={hotel.image}
        alt=""
        width={800}
        height={500}
        className="aspect-16/10 w-full object-cover"
        loading="lazy"
      />

      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-medium text-pretty text-ink">
          {hotel.name}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {hotel.stars}★ - Rating {hotel.rating}
        </p>
        <p className="mt-4 text-sm text-muted">{hotel.city}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {hotel.amenities.map((amenity) => (
            <span
              key={amenity}
              className="rounded-md border border-brand-500 px-2.5 py-0.5 text-sm text-brand-700"
            >
              {amenity}
            </span>
          ))}
        </div>

        <p className="mt-6 text-sm font-medium text-ink">
          {formatMoney(hotel.pricePerNight)} / night
        </p>

        <button
          type="button"
          disabled={alreadyAdded}
          className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-600 bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:ring-4 focus-visible:ring-brand-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => addToTrip("hotels", hotel)}
        >
          {alreadyAdded ? "Added" : "Add to trip"}
        </button>
      </div>
    </article>
  );
}
