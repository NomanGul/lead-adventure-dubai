const UPSTREAM_HOST = "sky-scrapper.p.rapidapi.com";
const PREFIX = "/api/sky";

// Only the endpoints the app actually calls, so the proxy cannot be reused
// as a general relay for the rest of the RapidAPI surface.
const ALLOWED_PATHS = new Set([
  "/api/v1/flights/searchAirport",
  "/api/v2/flights/searchFlights",
  "/api/v2/flights/searchIncomplete",
  "/api/v1/hotels/searchDestinationOrHotel",
  "/api/v1/hotels/searchHotels",
]);

function problem(message, status) {
  return Response.json({ status: false, message }, { status });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith(`${PREFIX}/`)) {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== "GET") {
      return problem("Method not allowed", 405);
    }

    const path = url.pathname.slice(PREFIX.length);
    if (!ALLOWED_PATHS.has(path)) {
      return problem("Unknown endpoint", 404);
    }

    if (!env.RAPIDAPI_KEY) {
      return problem("RAPIDAPI_KEY is not configured on this Worker", 500);
    }

    const upstream = new URL(path + url.search, `https://${UPSTREAM_HOST}`);
    const response = await fetch(upstream, {
      headers: {
        "X-RapidAPI-Key": env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": UPSTREAM_HOST,
        accept: "application/json",
      },
    });

    // Rebuild the response so no upstream header travels back to the browser.
    return new Response(response.body, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  },
};
