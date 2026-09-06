import { useTrip } from "../context/TripContext";

export function SortControls() {
  const { sort, setSort } = useTrip();

  return (
    <label htmlFor="sort">
      <span className="text-sm font-medium text-muted">Sort by</span>
      <select
        id="sort"
        value={sort}
        className="mt-0.5 w-full rounded border-line shadow-sm sm:text-sm"
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="cheapest">Cheapest first</option>
        <option value="highestRated">Highest rated first</option>
      </select>
    </label>
  );
}
