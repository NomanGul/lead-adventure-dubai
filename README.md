# Lead Adventure Travel

Multi-destination flight and hotel planner. Plot a route on the globe, search live results, and build a costed itinerary.

**Live demo:** [lead-adventure-dubai.nomangul2001.workers.dev](https://lead-adventure-dubai.nomangul2001.workers.dev/)

## Run locally

1. Copy `.env.example` to `.env` and set `RAPIDAPI_KEY` to your RapidAPI key for [Sky Scrapper](https://rapidapi.com/apiheya/api/sky-scrapper).
2. Install and start:

```bash
pnpm install
pnpm dev
```

App opens at `http://localhost:5173`.

To run the Worker + built assets instead: `pnpm build && npx wrangler dev`.

## Data source

Live [Sky Scrapper](https://rapidapi.com/apiheya/api/sky-scrapper) data via RapidAPI:

- `GET /api/v1/flights/searchAirport` — origin/destination autocomplete
- `GET /api/v2/flights/searchFlights` (+ `searchIncomplete` when needed) — flights
- `GET /api/v1/hotels/searchDestinationOrHotel` — hotel destination entity
- `GET /api/v1/hotels/searchHotels` — hotels

The key never reaches the browser. Requests go to `/api/sky/*`, which `worker/index.js` forwards to RapidAPI:

- Production: Cloudflare Worker secret `RAPIDAPI_KEY` (`wrangler secret put RAPIDAPI_KEY`)
- `pnpm dev`: Vite proxy in `vite.config.js`, key from `.env`
- `wrangler dev`: key from `.dev.vars`

## State

`TripContext` holds trip state; `useTrip()` reads and updates it. Routes are a chain of stops with hop dates; legs and stays are derived. The itinerary persists in `localStorage` under `myCustomTrip`, including a plan snapshot so saved items still price after a refresh.
