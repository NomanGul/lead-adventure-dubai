import { GlobeHemisphereWest, PencilSimple } from "@phosphor-icons/react";
import { useTrip } from "../context/useTrip";
import { formatRange, pluralise } from "../utils/format";

export function TripSummaryBar() {
  const { plainLegs, endDate, isRoundTrip, travellers, stays, setEditingSearch, setStep } =
    useTrip();

  const route = plainLegs
    .map((leg) => leg.origin)
    .concat(plainLegs[plainLegs.length - 1]?.destination)
    .filter(Boolean);
  const nights = stays.reduce((sum, stay) => sum + stay.nights, 0);

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-surface px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink text-white">
            <GlobeHemisphereWest size={18} aria-hidden />
          </span>

          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-ink">
              {route.map((city, index) => (
                <span key={`${city}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 ? <span aria-hidden className="text-muted">→</span> : null}
                  {city}
                </span>
              ))}
            </p>
            <p className="truncate text-xs text-muted">
              {formatRange(plainLegs[0]?.departure, endDate)}
              {isRoundTrip ? " · return" : endDate ? "" : " · one-way"}
              {nights > 0 ? ` · ${pluralise(nights, "night")}` : ""} ·{" "}
              {pluralise(travellers, "traveller")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setStep(0);
            setEditingSearch(true);
          }}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition hover:border-brand-400 hover:bg-canvas"
        >
          <PencilSimple size={14} aria-hidden />
          Edit search
        </button>
      </div>
    </div>
  );
}
