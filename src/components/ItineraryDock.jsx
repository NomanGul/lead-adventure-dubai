import { CaretRight, X } from "@phosphor-icons/react";
import { useEffect } from "react";
import { ItineraryPanel } from "./ItineraryPanel";
import { useTrip } from "../context/useTrip";
import { formatMoney, pluralise } from "../utils/format";
import { tripTotals } from "../utils/tripPlan";

export function ItineraryDock({ desktop = false }) {
  const { itinerary, savedStays, travellers, tripOpen, setTripOpen } =
    useTrip();

  useEffect(() => {
    if (!tripOpen) return;

    const onKey = (event) => {
      if (event.key === "Escape") setTripOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [tripOpen, setTripOpen]);

  const plan = itinerary.plan;
  const heads = plan.legs?.length
    ? (plan.adults ?? 1) + (plan.children ?? 0)
    : travellers;
  const totals = tripTotals(itinerary, savedStays, heads);
  const count =
    itinerary.flights.length +
    itinerary.hotels.length +
    itinerary.activities.length;

  if (count === 0) return null;

  const hideOnDesktop = desktop ? "" : " lg:hidden";

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-4 py-3${hideOnDesktop}`}
      >
        <button
          type="button"
          onClick={() => setTripOpen(true)}
          className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 rounded-xl bg-ink px-4 py-3 text-left"
        >
          <span>
            <span className="block text-xs text-white/60">
              {pluralise(count, "item")} saved
            </span>
            <span className="block text-base font-bold text-white tabular-nums">
              {formatMoney(totals.grandTotal)}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
            View trip
            <CaretRight size={14} weight="bold" aria-hidden />
          </span>
        </button>
      </div>

      {tripOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close trip"
            onClick={() => setTripOpen(false)}
            className="absolute inset-0 bg-ink/45"
          />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[88vh] max-w-2xl overflow-y-auto rounded-t-3xl bg-canvas p-4 shadow-2xl motion-safe:animate-[sheet_260ms_ease-out]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Your trip</h2>
              <button
                type="button"
                onClick={() => setTripOpen(false)}
                aria-label="Close trip"
                className="grid size-8 place-items-center rounded-lg border border-line bg-surface text-muted"
              >
                <X size={14} weight="bold" aria-hidden />
              </button>
            </div>
            <ItineraryPanel />
          </div>
        </div>
      ) : null}
    </>
  );
}
