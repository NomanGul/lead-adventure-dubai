function getPrice(item, type) {
  return type === "flights"
    ? Number(item.price?.raw) || 0
    : Number(item.rawPrice) || 0;
}

function getRating(item, type) {
  if (type === "hotels") return Number(item.stars) || 0;
  const score = Number(item.score);
  return Number.isFinite(score) ? score * 5 : 0;
}

function getStops(item) {
  return Number(item.legs?.[0]?.stopCount) || 0;
}

export function applyFiltersAndSort(items, { filters, sort, type }) {
  return items
    .filter((item) => {
      const price = getPrice(item, type);
      const rating = getRating(item, type);

      if (price < filters.minPrice || price > filters.maxPrice) return false;
      if (rating < filters.minRating) return false;

      if (type === "flights" && filters.stops !== "any") {
        const stops = getStops(item);
        if (filters.stops === "direct" && stops !== 0) return false;
        if (filters.stops === "layover" && stops === 0) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sort === "cheapest") {
        return getPrice(a, type) - getPrice(b, type);
      }
      return getRating(b, type) - getRating(a, type);
    });
}
