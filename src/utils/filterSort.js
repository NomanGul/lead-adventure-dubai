function getPrice(item, type) {
  return type === "flights" ? item.price : item.pricePerNight;
}

function getRating(item, type) {
  return type === "hotels" ? item.stars : item.rating;
}

export function applyFiltersAndSort(items, { filters, sort, type }) {
  return items
    .filter((item) => {
      const price = getPrice(item, type);
      const rating = getRating(item, type);

      if (price < filters.minPrice || price > filters.maxPrice) return false;
      if (rating < filters.minRating) return false;

      if (type === "flights" && filters.stops !== "any") {
        if (filters.stops === "direct" && item.stops !== 0) return false;
        if (filters.stops === "layover" && item.stops === 0) return false;
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
