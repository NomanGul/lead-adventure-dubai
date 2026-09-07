import { CaretLeft, CaretRight, Check, ImageSquare, Star } from "@phosphor-icons/react";
import { useState } from "react";
import { SaveButton } from "./SaveButton";
import { useTrip } from "../context/useTrip";
import { formatMoney, pluralise } from "../utils/format";

function Stars({ count }) {
  if (!count) return null;

  return (
    <span className="flex items-center gap-0.5" aria-label={`${count} star hotel`}>
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} size={12} weight="fill" className="text-amber-500" aria-hidden />
      ))}
    </span>
  );
}

export function HotelCard({ hotel, nights }) {
  const { isSaved, toggleSaved } = useTrip();
  const [frame, setFrame] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const saved = isSaved("hotels", hotel.id);

  const images = hotel.images;
  const stayTotal = nights > 0 ? hotel.perNight * nights : 0;

  const move = (delta) => {
    setFrame((current) => (current + delta + images.length) % images.length);
  };

  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-surface transition ${
        saved ? "border-brand-400 ring-1 ring-brand-400/40" : "border-line hover:border-brand-300 hover:shadow-md"
      }`}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-canvas sm:aspect-21/9">
        {images.length > 0 && !imageFailed ? (
          <img
            key={images[frame]}
            src={images[frame]}
            alt={hotel.name}
            onError={() => setImageFailed(true)}
            className="size-full object-cover motion-safe:animate-[fade_320ms_ease-out]"
            loading="lazy"
          />
        ) : (
          <div className="grid size-full place-items-center gap-1 text-xs text-muted">
            <ImageSquare size={24} className="mx-auto" aria-hidden />
            No photo available
          </div>
        )}

        {hotel.discount ? (
          <span className="absolute top-3 left-3 rounded-md bg-danger px-2 py-1 text-[11px] font-bold text-white shadow">
            {hotel.discount}
          </span>
        ) : null}

        {images.length > 1 && !imageFailed ? (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => move(-1)}
              className="absolute top-1/2 left-2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
            >
              <CaretLeft size={14} weight="bold" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => move(1)}
              className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
            >
              <CaretRight size={14} weight="bold" aria-hidden />
            </button>

            <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
              {images.map((src, i) => (
                <span
                  key={src}
                  className={`h-1.5 rounded-full transition-all ${
                    i === frame ? "w-4 bg-white" : "w-1.5 bg-white/55"
                  }`}
                />
              ))}
            </span>
          </>
        ) : null}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-pretty text-ink">{hotel.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <Stars count={hotel.stars} />
              {hotel.distance ? (
                <span className="text-xs text-muted">{hotel.distance}</span>
              ) : null}
            </div>
          </div>

          {hotel.score > 0 ? (
            <div className="flex shrink-0 items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-semibold text-ink">{hotel.scoreLabel}</p>
                <p className="text-[11px] text-muted">
                  {hotel.reviewCountLabel} review{hotel.reviewCount === 1 ? "" : "s"}
                </p>
              </div>
              <p className="grid size-9 shrink-0 place-items-center rounded-lg rounded-tr-none bg-brand-700 text-sm font-bold text-white tabular-nums">
                {hotel.score.toFixed(1)}
              </p>
            </div>
          ) : null}
        </div>

        {hotel.features.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hotel.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-800"
              >
                <Check size={12} weight="bold" aria-hidden />
                {feature}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
          <div>
            <p className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-ink tabular-nums">
                {hotel.perNightLabel || formatMoney(hotel.perNight)}
              </span>
              <span className="text-xs text-muted">per night</span>
              {hotel.listPrice ? (
                <span className="text-xs text-muted line-through">{hotel.listPrice}</span>
              ) : null}
            </p>

            <p className="text-xs font-medium text-ink">
              {hotel.stayTotalLabel ||
                (stayTotal > 0 ? `${formatMoney(stayTotal)} for ${pluralise(nights, "night")}` : "")}
            </p>
            {hotel.taxNote ? (
              <p className="mt-0.5 text-[11px] text-muted">Taxes and fees included</p>
            ) : null}
          </div>

          <SaveButton saved={saved} onClick={() => toggleSaved("hotels", hotel)} />
        </div>
      </div>
    </article>
  );
}
