import { useTrip } from "../context/TripContext";

export function FiltersSidebar() {
  const { filters, setFilters, clearFilters, activeTab } = useTrip();

  const update = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <aside>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-ink">Filters</h2>
        <button
          type="button"
          className="text-sm text-muted underline transition-colors hover:text-ink"
          onClick={clearFilters}
        >
          Clear filters
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <label htmlFor="minPrice" className="flex-1">
            <span className="text-sm font-medium text-muted">Min budget</span>
            <input
              type="number"
              id="minPrice"
              min={0}
              value={filters.minPrice}
              className="mt-0.5 w-full rounded border-line shadow-sm sm:text-sm"
              onChange={(e) => update("minPrice", Number(e.target.value))}
            />
          </label>
          <label htmlFor="maxPrice" className="flex-1">
            <span className="text-sm font-medium text-muted">Max budget</span>
            <input
              type="number"
              id="maxPrice"
              min={0}
              value={filters.maxPrice}
              className="mt-0.5 w-full rounded border-line shadow-sm sm:text-sm"
              onChange={(e) => update("maxPrice", Number(e.target.value))}
            />
          </label>
        </div>

        <label htmlFor="minRating" className="block">
          <span className="text-sm font-medium text-muted">Rating</span>
          <select
            id="minRating"
            value={filters.minRating}
            className="mt-0.5 w-full rounded border-line shadow-sm sm:text-sm"
            onChange={(e) => update("minRating", Number(e.target.value))}
          >
            <option value={0}>Any</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={5}>5</option>
          </select>
        </label>

        {activeTab === "flights" ? (
          <label htmlFor="stops" className="block">
            <span className="text-sm font-medium text-muted">Stops</span>
            <select
              id="stops"
              value={filters.stops}
              className="mt-0.5 w-full rounded border-line shadow-sm sm:text-sm"
              onChange={(e) => update("stops", e.target.value)}
            >
              <option value="any">Any</option>
              <option value="direct">Direct</option>
              <option value="layover">Layover</option>
            </select>
          </label>
        ) : null}
      </div>
    </aside>
  );
}
