import { X } from "@phosphor-icons/react";
import { useTrip } from "../context/useTrip";
import { STOP_OPTIONS, TIME_WINDOWS } from "../utils/filterSort";
import { formatMoney } from "../utils/format";

export function FilterChips() {
  const { filters, setFilters, clearFilters, activeTab } = useTrip();

  const chips = [];
  const set = (patch) => setFilters((prev) => ({ ...prev, ...patch }));
  const drop = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: prev[key].filter((v) => v !== value) }));

  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const from = filters.minPrice === null ? "" : formatMoney(filters.minPrice);
    const to = filters.maxPrice === null ? "" : formatMoney(filters.maxPrice);
    chips.push({
      key: "price",
      label: from && to ? `${from} – ${to}` : from ? `Over ${from}` : `Under ${to}`,
      clear: () => set({ minPrice: null, maxPrice: null }),
    });
  }

  if (activeTab === "flights") {
    filters.stops.forEach((id) =>
      chips.push({
        key: `stops-${id}`,
        label: STOP_OPTIONS.find((o) => o.id === id)?.label ?? id,
        clear: () => drop("stops", id),
      }),
    );
    filters.windows.forEach((id) =>
      chips.push({
        key: `window-${id}`,
        label: `Departs ${TIME_WINDOWS.find((w) => w.id === id)?.label ?? id}`,
        clear: () => drop("windows", id),
      }),
    );
    filters.airlines.forEach((name) =>
      chips.push({ key: `airline-${name}`, label: name, clear: () => drop("airlines", name) }),
    );
  } else if (activeTab === "activities") {
    filters.categories.forEach((name) =>
      chips.push({
        key: `category-${name}`,
        label: name,
        clear: () => drop("categories", name),
      }),
    );
    if (filters.minScore) {
      chips.push({
        key: "score",
        label: `Scores ${filters.minScore}+`,
        clear: () => set({ minScore: 0 }),
      });
    }
    if (filters.freeCancellation) {
      chips.push({
        key: "cancel",
        label: "Free cancellation",
        clear: () => set({ freeCancellation: false }),
      });
    }
  } else {
    if (filters.minStars) {
      chips.push({
        key: "stars",
        label: `${filters.minStars}+ stars`,
        clear: () => set({ minStars: 0 }),
      });
    }
    if (filters.minScore) {
      chips.push({
        key: "score",
        label: `Scores ${filters.minScore}+`,
        clear: () => set({ minScore: 0 }),
      });
    }
    if (filters.freeCancellation) {
      chips.push({
        key: "cancel",
        label: "Free cancellation",
        clear: () => set({ freeCancellation: false }),
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={chip.clear}
            className="flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pr-2 pl-3 text-xs font-semibold text-brand-800 ring-1 ring-brand-200 ring-inset transition hover:bg-brand-100"
          >
            {chip.label}
            <span aria-hidden className="grid size-4 place-items-center rounded-full bg-brand-200/70">
              <X size={10} weight="bold" aria-hidden />
            </span>
            <span className="sr-only">Remove filter</span>
          </button>
        </li>
      ))}

      <li>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-lg px-1.5 text-xs font-semibold text-muted underline decoration-line transition hover:text-ink"
        >
          Clear all
        </button>
      </li>
    </ul>
  );
}
