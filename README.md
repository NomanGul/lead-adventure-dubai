# Lead Adventure Travel

Flight and hotel booking dashboard. Search a route, filter results, and build a custom itinerary.

**Live demo:** [lead-adventure-dubai.nomangul2001.workers.dev](https://lead-adventure-dubai.nomangul2001.workers.dev/)

## Run locally

1. Copy `.env.example` to `.env` and set your RapidAPI key for [Sky Scrapper](https://rapidapi.com/apiheya/api/sky-scrapper).
2. Install and start:

```bash
pnpm install
pnpm dev
```

App opens at `http://localhost:5173`.

## Data source

Live [Sky Scrapper](https://rapidapi.com/apiheya/api/sky-scrapper) data via RapidAPI:

- `GET /api/v1/flights/searchAirport` — origin/destination autocomplete
- `GET /api/v2/flights/searchFlights` (+ `searchIncomplete` when needed) — flights
- `GET /api/v1/hotels/searchDestinationOrHotel` — hotel destination entity
- `GET /api/v1/hotels/searchHotels` — hotels

Set `VITE_RAPIDAPI_KEY` in `.env`.

## State

`TripContext` holds trip state. `useTrip()` reads and updates it. The itinerary persists in localStorage.
