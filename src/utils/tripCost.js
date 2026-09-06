export function getNights(departure, returnDate) {
  if (!departure || !returnDate) return 0;

  const start = new Date(departure);
  const end = new Date(returnDate);
  const diffMs = end.getTime() - start.getTime();
  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, nights);
}

export function getTripTotal(itinerary, nights, guests = 1) {
  const travelers = Math.max(1, guests);
  const flightsTotal = itinerary.flights.reduce(
    (sum, f) => sum + f.price * travelers,
    0,
  );
  const hotelsTotal = itinerary.hotels.reduce(
    (sum, h) => sum + h.pricePerNight * nights,
    0,
  );

  return {
    flightsTotal,
    hotelsTotal,
    nights,
    travelers,
    grandTotal: flightsTotal + hotelsTotal,
  };
}
