import { nightsBetween, pluralise } from "./format";

export function buildStays(legs, returnDate) {
  return legs.map((leg, index) => {
    const next = legs[index + 1];
    const checkOut = next?.departure || returnDate || "";

    return {
      legIndex: index,
      city: leg.destination || "",
      checkIn: leg.departure || "",
      checkOut,
      nights: nightsBetween(leg.departure, checkOut),
    };
  });
}

export function tripTotals(itinerary, stays, travelers) {
  const heads = Math.max(1, travelers);

  const flightsTotal = itinerary.flights.reduce(
    (sum, flight) => sum + flight.price * heads,
    0,
  );

  let bookedNights = 0;
  const hotelsTotal = itinerary.hotels.reduce((sum, hotel) => {
    const nights = stays[hotel.legIndex]?.nights ?? 0;
    bookedNights += nights;
    return sum + hotel.perNight * nights;
  }, 0);

  const activitiesTotal = itinerary.activities.reduce(
    (sum, activity) => sum + activity.price * heads,
    0,
  );

  return {
    flightsTotal,
    hotelsTotal,
    activitiesTotal,
    travelers: heads,
    grandTotal: flightsTotal + hotelsTotal + activitiesTotal,
    nights: stays.reduce((sum, stay) => sum + stay.nights, 0),
    bookedNights,
  };
}

export function auditTrip(itinerary, legs, stays) {
  const issues = [];
  const activities = itinerary.activities;

  legs.forEach((leg, index) => {
    if (!leg.origin || !leg.destination) return;

    const hasFlight = itinerary.flights.some((f) => f.legIndex === index);
    if (!hasFlight) {
      issues.push({
        id: `flight-${index}`,
        tone: "warn",
        text: `No flight saved for ${leg.origin} to ${leg.destination}.`,
      });
    }

    const stay = stays[index];
    const hotels = itinerary.hotels.filter((h) => h.legIndex === index);
    const stopActivities = activities.filter((a) => a.legIndex === index);

    if (stay.nights > 0 && hotels.length === 0) {
      issues.push({
        id: `stay-${index}`,
        tone: "warn",
        text: `${pluralise(stay.nights, "night")} in ${leg.destination} with nowhere to stay.`,
      });
    }

    if (hotels.length > 1) {
      issues.push({
        id: `overlap-${index}`,
        tone: "warn",
        text: `${hotels.length} hotels booked in ${leg.destination} for the same nights.`,
      });
    }

    if (hotels.length > 0 && stay.nights === 0) {
      issues.push({
        id: `nonights-${index}`,
        tone: "warn",
        text: `Stay in ${leg.destination} has no nights. Set a later date to price it.`,
      });
    }

    if (stay.nights > 0 && stopActivities.length === 0) {
      issues.push({
        id: `activity-${index}`,
        tone: "warn",
        text: `${pluralise(stay.nights, "night")} in ${leg.destination} with no activities saved.`,
      });
    }
  });

  itinerary.flights.forEach((flight) => {
    const leg = legs[flight.legIndex];
    const arrivalCity = flight.outbound?.destinationCity;
    if (!leg?.destination || !arrivalCity) return;

    if (!sameCity(arrivalCity, leg.destination)) {
      issues.push({
        id: `mismatch-${flight.id}`,
        tone: "error",
        text: `A saved flight lands in ${arrivalCity}, but this leg goes to ${leg.destination}.`,
      });
    }
  });

  activities.forEach((activity) => {
    const leg = legs[activity.legIndex];
    if (!leg) {
      issues.push({
        id: `activity-leg-${activity.id}`,
        tone: "error",
        text: `${activity.name} is saved on a stop that is no longer in this trip.`,
      });
      return;
    }

    if (activity.city && leg.destination && !sameCity(activity.city, leg.destination)) {
      issues.push({
        id: `activity-city-${activity.id}`,
        tone: "error",
        text: `${activity.name} is for ${activity.city}, but this stop is ${leg.destination}.`,
      });
    }
  });

  return issues;
}

function sameCity(a, b) {
  const norm = (v) => v.toLowerCase().replace(/[^a-z]/g, "");
  return norm(a).includes(norm(b)) || norm(b).includes(norm(a));
}

export function buildTimeline(itinerary, legs, stays) {
  const events = [];

  itinerary.flights.forEach((flight) => {
    const leg = flight.outbound;
    if (!leg) return;
    events.push({
      id: `f-${flight.id}`,
      date: leg.departure.slice(0, 10),
      type: "flight",
      item: flight,
      leg,
    });

    if (flight.inbound) {
      events.push({
        id: `r-${flight.id}`,
        date: flight.inbound.departure.slice(0, 10),
        type: "flight",
        item: flight,
        leg: flight.inbound,
        isReturn: true,
      });
    }
  });

  itinerary.hotels.forEach((hotel) => {
    const stay = stays[hotel.legIndex];
    events.push({
      id: `h-${hotel.id}`,
      date: stay?.checkIn ?? "",
      type: "hotel",
      item: hotel,
      stay,
      city: legs[hotel.legIndex]?.destination ?? "",
    });
  });

  itinerary.activities.forEach((activity) => {
    const stay = stays[activity.legIndex];
    events.push({
      id: `a-${activity.id}`,
      date: stay?.checkIn ?? legs[activity.legIndex]?.departure ?? "",
      type: "activity",
      item: activity,
      stay,
      city: activity.city || legs[activity.legIndex]?.destination || "",
    });
  });

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
