export const TIME_WINDOWS = [
  { id: "early", label: "Before 6 AM", from: 0, to: 6 },
  { id: "morning", label: "6 AM – 12 PM", from: 6, to: 12 },
  { id: "afternoon", label: "12 PM – 6 PM", from: 12, to: 18 },
  { id: "evening", label: "After 6 PM", from: 18, to: 24 },
];

export const STOP_OPTIONS = [
  { id: "direct", label: "Direct" },
  { id: "one", label: "1 stop" },
  { id: "twoPlus", label: "2+ stops" },
];

export const EMPTY_FILTERS = {
  minPrice: null,
  maxPrice: null,
  stops: [],
  airlines: [],
  windows: [],
  categories: [],
  minScore: 0,
  minStars: 0,
  freeCancellation: false,
};

export const SORTS = {
  flights: [
    { id: "best", label: "Best" },
    { id: "cheapest", label: "Cheapest" },
    { id: "fastest", label: "Fastest" },
  ],
  hotels: [
    { id: "best", label: "Best" },
    { id: "cheapest", label: "Cheapest" },
    { id: "rated", label: "Top rated" },
  ],
  activities: [
    { id: "best", label: "Best" },
    { id: "cheapest", label: "Cheapest" },
    { id: "fastest", label: "Shortest" },
  ],
};

function departureHour(item) {
  const match = /T(\d{2}):/.exec(item.outbound?.departure ?? "");
  return match ? Number(match[1]) : null;
}

function stopBucket(stops) {
  if (stops === 0) return "direct";
  if (stops === 1) return "one";
  return "twoPlus";
}

const PREDICATES = {
  price: (item, f) =>
    (f.minPrice === null || priceOf(item) >= f.minPrice) &&
    (f.maxPrice === null || priceOf(item) <= f.maxPrice),
  stops: (item, f) =>
    f.stops.length === 0 || f.stops.includes(stopBucket(item.stops ?? 0)),
  airlines: (item, f) =>
    f.airlines.length === 0 ||
    (item.airlines ?? []).some((name) => f.airlines.includes(name)),
  windows: (item, f) => {
    if (f.windows.length === 0) return true;
    const hour = departureHour(item);
    if (hour === null) return false;
    return f.windows.some((id) => {
      const w = TIME_WINDOWS.find((x) => x.id === id);
      return w && hour >= w.from && hour < w.to;
    });
  },
  score: (item, f) => f.minScore === 0 || (item.score ?? 0) >= f.minScore,
  stars: (item, f) => f.minStars === 0 || (item.stars ?? 0) >= f.minStars,
  freeCancellation: (item, f) =>
    !f.freeCancellation ||
    item.freeCancellation ||
    (item.features ?? []).some((t) => /free cancellation/i.test(t)),
  categories: (item, f) =>
    f.categories.length === 0 || f.categories.includes(item.category),
};

const ACTIVE_KEYS = {
  flights: ["price", "stops", "airlines", "windows"],
  hotels: ["price", "score", "stars", "freeCancellation"],
  activities: ["price", "score", "categories", "freeCancellation"],
};

function priceOf(item) {
  if (item.kind === "hotel") return item.perNight;
  return item.price;
}

function passes(item, filters, type, skipKey) {
  return ACTIVE_KEYS[type].every(
    (key) => key === skipKey || PREDICATES[key](item, filters),
  );
}

export function applyFilters(items, filters, type) {
  return items.filter((item) => passes(item, filters, type, null));
}

export function sortItems(items, sort) {
  const list = [...items];

  if (sort === "cheapest") return list.sort((a, b) => priceOf(a) - priceOf(b));
  if (sort === "fastest")
    return list.sort((a, b) => a.durationMinutes - b.durationMinutes);
  if (sort === "rated") return list.sort((a, b) => b.score - a.score);

  return list.sort((a, b) => b.score - a.score || priceOf(a) - priceOf(b));
}

export function priceBounds(items) {
  if (items.length === 0) return { min: 0, max: 0 };
  const prices = items.map(priceOf);
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}

export function facetCounts(items, filters, type) {
  const count = (skipKey, predicate) =>
    items.filter(
      (item) => passes(item, filters, type, skipKey) && predicate(item),
    ).length;

  if (type === "flights") {
    return {
      stops: Object.fromEntries(
        STOP_OPTIONS.map((o) => [
          o.id,
          count("stops", (i) => stopBucket(i.stops ?? 0) === o.id),
        ]),
      ),
      airlines: Object.fromEntries(
        [...new Set(items.flatMap((i) => i.airlines ?? []))]
          .sort()
          .map((name) => [
            name,
            count("airlines", (i) => (i.airlines ?? []).includes(name)),
          ]),
      ),
      windows: Object.fromEntries(
        TIME_WINDOWS.map((w) => [
          w.id,
          count("windows", (i) => {
            const hour = departureHour(i);
            return hour !== null && hour >= w.from && hour < w.to;
          }),
        ]),
      ),
    };
  }

  if (type === "activities") {
    return {
      categories: Object.fromEntries(
        [...new Set(items.map((i) => i.category).filter(Boolean))]
          .sort()
          .map((name) => [
            name,
            count("categories", (i) => i.category === name),
          ]),
      ),
      score: Object.fromEntries(
        [7, 8, 9].map((s) => [s, count("score", (i) => (i.score ?? 0) >= s)]),
      ),
      freeCancellation: count(
        "freeCancellation",
        (i) =>
          i.freeCancellation ||
          (i.features ?? []).some((t) => /free cancellation/i.test(t)),
      ),
    };
  }

  return {
    stars: Object.fromEntries(
      [3, 4, 5].map((s) => [s, count("stars", (i) => (i.stars ?? 0) >= s)]),
    ),
    score: Object.fromEntries(
      [7, 8, 9].map((s) => [s, count("score", (i) => (i.score ?? 0) >= s)]),
    ),
    freeCancellation: count("freeCancellation", (i) =>
      (i.features ?? []).some((t) => /free cancellation/i.test(t)),
    ),
  };
}

export function countActiveFilters(filters, type) {
  let n = 0;
  if (filters.minPrice !== null || filters.maxPrice !== null) n += 1;
  if (type === "flights") {
    n += filters.stops.length ? 1 : 0;
    n += filters.airlines.length ? 1 : 0;
    n += filters.windows.length ? 1 : 0;
  } else if (type === "activities") {
    n += filters.categories.length ? 1 : 0;
    n += filters.minScore ? 1 : 0;
    n += filters.freeCancellation ? 1 : 0;
  } else {
    n += filters.minStars ? 1 : 0;
    n += filters.minScore ? 1 : 0;
    n += filters.freeCancellation ? 1 : 0;
  }
  return n;
}
