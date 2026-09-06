// Same-origin proxy served by the Worker in worker/index.js. The RapidAPI key
// lives in the Worker secret RAPIDAPI_KEY and never reaches the browser.
const BASE = "/api/sky";

const DEFAULTS = {
  locale: "en-US",
  market: "en-US",
  countryCode: "US",
  currency: "USD",
};

async function get(path, params = {}) {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: { accept: "application/json" },
  });

  if (response.status === 429) {
    throw new Error("Rate limit reached. Try again in a moment.");
  }

  if (!response.ok) {
    throw new Error(`Sky Scrapper request failed (${response.status})`);
  }

  const json = await response.json();
  if (json?.status === false) {
    throw new Error(json.message || "Sky Scrapper returned an error");
  }

  return json;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function itinerariesFrom(payload) {
  return Array.isArray(payload?.itineraries) ? payload.itineraries : [];
}

export async function searchAirports(query) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const json = await get("/api/v1/flights/searchAirport", {
    query: trimmed,
    locale: DEFAULTS.locale,
  });

  return Array.isArray(json.data) ? json.data : [];
}

export async function searchFlights({
  originSkyId,
  originEntityId,
  destinationSkyId,
  destinationEntityId,
  date,
  returnDate,
  adults = 1,
  children = 0,
  limit = 15,
}) {
  const json = await get("/api/v2/flights/searchFlights", {
    originSkyId,
    originEntityId,
    destinationSkyId,
    destinationEntityId,
    date,
    returnDate,
    adults,
    childrens: children,
    cabinClass: "economy",
    sortBy: "best",
    currency: DEFAULTS.currency,
    market: DEFAULTS.market,
    countryCode: DEFAULTS.countryCode,
    limit,
  });

  const payload = json.data ?? {};
  const first = itinerariesFrom(payload);
  if (first.length > 0) return first;

  const sessionId = payload.context?.sessionId;
  if (!sessionId) return first;

  await sleep(400);
  const next = await get("/api/v2/flights/searchIncomplete", {
    sessionId,
    currency: DEFAULTS.currency,
    market: DEFAULTS.market,
    countryCode: DEFAULTS.countryCode,
    limit: String(limit),
  });

  return itinerariesFrom(next.data);
}

export async function searchHotelDestination(query) {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const json = await get("/api/v1/hotels/searchDestinationOrHotel", {
    query: trimmed,
  });

  const places = Array.isArray(json.data) ? json.data : [];
  return (
    places.find((place) => String(place.entityType).toLowerCase() === "city") ??
    places[0] ??
    null
  );
}

export async function searchHotels({
  entityId,
  checkin,
  checkout,
  adults = 1,
  rooms = 1,
  limit = 15,
}) {
  const json = await get("/api/v1/hotels/searchHotels", {
    entityId,
    checkin,
    checkout,
    adults,
    rooms,
    limit,
    currency: DEFAULTS.currency,
    market: DEFAULTS.market,
    countryCode: DEFAULTS.countryCode,
  });

  return Array.isArray(json.data?.hotels) ? json.data.hotels : [];
}
