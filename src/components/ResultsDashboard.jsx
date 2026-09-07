import { useMemo, useState } from "react";
import { Funnel, MagnifyingGlass, X } from "@phosphor-icons/react";
import { FiltersPanel } from "./FiltersPanel";
import { FilterChips } from "./FilterChips";
import { FlightCard } from "./FlightCard";
import { HotelCard } from "./HotelCard";
import { ResultsSkeleton } from "./ResultsSkeleton";
import { useTrip } from "../context/useTrip";
import {
  SORTS,
  applyFilters,
  countActiveFilters,
  facetCounts,
  priceBounds,
  sortItems,
} from "../utils/filterSort";
import { pluralise } from "../utils/format";

const TABS = [
  { id: "flights", label: "Flights" },
  { id: "hotels", label: "Stays" },
];

export function ResultsDashboard() {
  const {
    activeTab,
    setActiveTab,
    results,
    filters,
    sort,
    setSort,
    clearFilters,
    loadingFlights,
    loadingHotels,
    searchError,
    plainLegs,
    stays,
  } = useTrip();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [hop, setHop] = useState(0);

  const raw = results[activeTab];
  const loading = activeTab === "flights" ? loadingFlights : loadingHotels;

  const bounds = useMemo(() => priceBounds(raw), [raw]);
  const facets = useMemo(() => facetCounts(raw, filters, activeTab), [raw, filters, activeTab]);
  const visible = useMemo(
    () => sortItems(applyFilters(raw, filters, activeTab), sort),
    [raw, filters, activeTab, sort],
  );

  const activeCount = countActiveFilters(filters, activeTab);
  const multiLeg = plainLegs.length > 1;

  const hopTabs = useMemo(() => {
    if (!multiLeg) return [];

    return plainLegs
      .map((leg, index) => ({
        index,
        label: activeTab === "flights" ? `${leg.origin} → ${leg.destination}` : leg.destination,
        sub:
          activeTab === "hotels"
            ? pluralise(stays[index]?.nights ?? 0, "night")
            : null,
        total: raw.filter((item) => item.legIndex === index).length,
        count: visible.filter((item) => item.legIndex === index).length,
      }))
      .filter((tab) => tab.total > 0);
  }, [multiLeg, plainLegs, activeTab, stays, raw, visible]);

  const currentHop = hopTabs.some((tab) => tab.index === hop) ? hop : (hopTabs[0]?.index ?? 0);
  const shown = multiLeg
    ? visible.filter((item) => item.legIndex === currentHop)
    : visible;

  const hopLabel = hopTabs.find((tab) => tab.index === currentHop)?.label;
  const noun = activeTab === "flights" ? "flights" : "stays";
  const counts = {
    flights: results.flights.length,
    hotels: results.hotels.length,
  };

  return (
    <section aria-labelledby="results-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div role="tablist" aria-label="Result type" className="flex gap-1 rounded-xl bg-canvas p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSheetOpen(false);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs font-medium text-muted tabular-nums">
                {(tab.id === "flights" ? loadingFlights : loadingHotels) ? "…" : counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition hover:border-brand-400 lg:hidden"
          >
            <Funnel size={14} weight="bold" aria-hidden />
            Filters
            {activeCount > 0 ? (
              <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                {activeCount}
              </span>
            ) : null}
          </button>

          <div
            role="group"
            aria-label="Sort results"
            className="flex gap-0.5 rounded-xl bg-canvas p-1"
          >
            {SORTS[activeTab].map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={sort === option.id}
                onClick={() => setSort(option.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  sort === option.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {hopTabs.length > 1 ? (
        <div
          role="tablist"
          aria-label={activeTab === "flights" ? "Trip hop" : "Trip stop"}
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
        >
          {hopTabs.map((tab) => {
            const selected = tab.index === currentHop;

            return (
              <button
                key={tab.index}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setHop(tab.index)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
                  selected
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-400/40"
                    : "border-line bg-surface hover:border-brand-300"
                }`}
              >
                <span
                  aria-hidden
                  className={`grid size-5 shrink-0 place-items-center rounded-md text-[10px] font-bold ${
                    selected ? "bg-brand-600 text-white" : "bg-canvas text-muted"
                  }`}
                >
                  {tab.index + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block truncate text-xs font-semibold ${
                      selected ? "text-brand-900" : "text-ink"
                    }`}
                  >
                    {tab.label}
                  </span>
                  <span className="block truncate text-[11px] text-muted tabular-nums">
                    {tab.sub ? `${tab.sub} · ` : ""}
                    {tab.count === tab.total
                      ? pluralise(tab.total, activeTab === "flights" ? "flight" : "stay")
                      : `${tab.count} of ${tab.total}`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-5 grid gap-6 lg:grid-cols-[236px_minmax(0,1fr)]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-line bg-surface p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Filters</h2>
              {activeCount > 0 ? (
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-800">
                  {activeCount}
                </span>
              ) : null}
            </div>
            <FiltersPanel facets={facets} bounds={bounds} />
          </div>
        </aside>

        <div>
          <div className="mb-4 space-y-3">
            <h2 id="results-heading" className="text-sm font-semibold text-ink" aria-live="polite">
              {loading
                ? `Searching for ${noun}…`
                : `${shown.length} ${noun}`}
              {!loading && hopLabel ? (
                <span className="font-normal text-muted"> · {hopLabel}</span>
              ) : null}
              {!loading && !hopLabel && shown.length !== raw.length ? (
                <span className="font-normal text-muted"> of {raw.length} match your filters</span>
              ) : null}
            </h2>
            <FilterChips />
          </div>

          {searchError && raw.length === 0 && !loading ? (
            <p className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger" role="alert">
              {searchError}
            </p>
          ) : null}

          {loading && raw.length === 0 ? (
            <ResultsSkeleton type={activeTab} />
          ) : shown.length === 0 && !loading ? (
            <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
              <p className="text-sm font-semibold text-ink">
                {raw.length === 0
                  ? `No ${noun} came back for this trip.`
                  : `No ${noun} match your filters.`}
              </p>
              <p className="mt-1 text-sm text-muted">
                {raw.length === 0
                  ? "Try different dates or a nearby city."
                  : `All ${raw.length} results were filtered out.`}
              </p>
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Clear all filters
                </button>
              ) : null}
            </div>
          ) : (
            <div role="tabpanel" className="space-y-3">
              {shown.map((item) =>
                activeTab === "flights" ? (
                  <FlightCard key={item.id} flight={item} />
                ) : (
                  <HotelCard
                    key={item.id}
                    hotel={item}
                    nights={stays[item.legIndex]?.nights ?? 0}
                  />
                ),
              )}

              {loading ? <ResultsSkeleton type={activeTab} count={2} /> : null}
            </div>
          )}
        </div>
      </div>

      {sheetOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-ink/45"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-surface p-5 shadow-2xl motion-safe:animate-[sheet_260ms_ease-out]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="grid size-8 place-items-center rounded-lg border border-line text-muted"
                aria-label="Close filters"
              >
                <X size={14} weight="bold" aria-hidden />
              </button>
            </div>

            <FiltersPanel facets={facets} bounds={bounds} />

            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-semibold text-white"
            >
              <MagnifyingGlass size={14} weight="bold" aria-hidden />
              Show {shown.length} result{shown.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
