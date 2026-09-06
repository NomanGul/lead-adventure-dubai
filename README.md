# Lead Adventure Travel

Flight and hotel booking dashboard. Search a route, filter results, and build a custom itinerary.

**Live demo:** [lead-adventure-dubai.nomangul2001.workers.dev](https://lead-adventure-dubai.nomangul2001.workers.dev/)

## Run locally

```bash
pnpm install
pnpm dev
```

App opens at `http://localhost:5173`.

## Data source

Local mock dataset in `src/data/mock.json` (destinations, flights, hotels).

## State

`TripContext` holds trip state. `useTrip()` reads and updates it. The itinerary persists in localStorage.
