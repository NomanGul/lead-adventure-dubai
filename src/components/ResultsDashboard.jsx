import { useEffect, useRef } from "react";
import { useTrip } from "../context/TripContext";
import { applyFiltersAndSort } from "../utils/filterSort";
import { FiltersSidebar } from "./FiltersSidebar";
import { FlightCard } from "./FlightCard";
import { HotelCard } from "./HotelCard";
import { SortControls } from "./SortControls";

function tabClass(active) {
  return active
    ? "border-b-2 border-brand-600 px-4 py-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
    : "border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink";
}

export function ResultsDashboard() {
  const { hasSearched, activeTab, setActiveTab, results, filters, sort } =
    useTrip();
  const resultsRef = useRef(null);
  const prevResultsRef = useRef(results);

  useEffect(() => {
    if (!hasSearched) return;
    if (prevResultsRef.current === results) return;
    prevResultsRef.current = results;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hasSearched, results]);

  if (!hasSearched) {
    return (
      <section
        id="results"
        ref={resultsRef}
        className="mt-8 rounded-lg border border-line bg-surface p-6 text-center"
      >
        <p className="text-muted">No search yet.</p>
      </section>
    );
  }

  const flights = applyFiltersAndSort(results.flights, {
    filters,
    sort,
    type: "flights",
  });
  const hotels = applyFiltersAndSort(results.hotels, {
    filters,
    sort,
    type: "hotels",
  });
  const list = activeTab === "flights" ? flights : hotels;

  return (
    <section id="results" ref={resultsRef} className="mt-8">
      <h2 className="text-lg font-medium text-ink">Search results</h2>

      <div className="-mb-px mt-4 border-b border-line">
        <div role="tablist" aria-label="Result type" className="flex gap-1">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "flights"}
            className={tabClass(activeTab === "flights")}
            onClick={() => setActiveTab("flights")}
          >
            Flights ({flights.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "hotels"}
            className={tabClass(activeTab === "hotels")}
            onClick={() => setActiveTab("hotels")}
          >
            Hotels ({hotels.length})
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <FiltersSidebar />

        <div>
          <div className="mb-4 max-w-xs">
            <SortControls />
          </div>

          {list.length === 0 ? (
            <p className="text-muted">Nothing matches.</p>
          ) : (
            <div role="tabpanel" className="grid gap-4">
              {activeTab === "flights"
                ? flights.map((flight) => (
                    <FlightCard key={flight.id} flight={flight} />
                  ))
                : hotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
