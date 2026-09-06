import { useTrip } from "../context/TripContext";
import { formatMoney } from "../utils/format";

const HOTEL_PLACEHOLDER =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60";

export function HotelCard({ hotel }) {
  const { itinerary, addToTrip, searchForm } = useTrip();
  const alreadyAdded = itinerary.hotels.some(
    (h) => h.hotelId === hotel.hotelId,
  );
  const image = hotel.heroImage || hotel.images?.[0] || HOTEL_PLACEHOLDER;
  const review = hotel.reviewSummary?.value ?? hotel.rating?.value ?? "—";
  const features = (hotel.rateFeatures ?? [])
    .map((f) => f.text)
    .filter(Boolean);
  const priceLabel =
    hotel.price || formatMoney(Math.round(Number(hotel.rawPrice) || 0));
  const city =
    searchForm.destinationPlace?.presentation?.title || searchForm.destination;

  return (
    <article className="overflow-hidden rounded-md border border-line shadow-sm">
      <img
        src={image}
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
          {hotel.stars || 0}★ - Rating {review}
        </p>
        <p className="mt-4 text-sm text-muted">{city || hotel.distance}</p>

        {features.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {features.slice(0, 4).map((feature) => (
              <span
                key={feature}
                className="rounded-md border border-brand-500 px-2.5 py-0.5 text-sm text-brand-700"
              >
                {feature}
              </span>
            ))}
          </div>
        ) : null}

        <p className="mt-6 text-sm font-medium text-ink">
          {priceLabel} / night
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
