import { useState } from "react";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
import { geoDistance } from "d3-geo";
import { Globe } from "./Globe";
import { RouteStep } from "./planner/RouteStep";
import { WhenStep } from "./planner/WhenStep";
import { TravellerPicker } from "./planner/TravellerPicker";
import { MAX_STOPS } from "../context/trip-context";
import { useTrip } from "../context/useTrip";
import { findCity } from "../data/world";
import { formatDuration } from "../utils/format";

const STEP_LABELS = ["Route", "Dates"];
const HEADINGS = ["Where in the world?", "When are you travelling?"];
const EARTH_RADIUS_KM = 6371;

function questionFor(index) {
  if (index === 0) return "From";
  if (index === 1) return "To";
  return "Next stop";
}

export function Planner({ bottomInset = false, fill = false }) {
  const {
    step,
    setStep,
    search,
    isSearching,
    resolving,
    stops,
    addStop,
    resolveStop,
    hasSearched,
    setEditingSearch,
  } = useTrip();

  const [editing, setEditing] = useState(null);

  const frontier = stops.findIndex((stop) => !stop.place);
  let openIndex = null;
  if (step === 0) {
    if (editing !== null && editing < stops.length) openIndex = editing;
    else if (frontier !== -1) openIndex = frontier;
  }

  const routeStops = [];
  stops.forEach((stop) => {
    const city = findCity(stop.label);
    if (city && routeStops[routeStops.length - 1]?.city !== city.city) {
      routeStops.push(city);
    }
  });

  let routeStats = null;
  if (routeStops.length >= 2) {
    let km = 0;
    for (let i = 0; i < routeStops.length - 1; i += 1) {
      km +=
        geoDistance(
          [routeStops[i].lon, routeStops[i].lat],
          [routeStops[i + 1].lon, routeStops[i + 1].lat],
        ) * EARTH_RADIUS_KM;
    }
    routeStats = {
      km: Math.round(km),
      minutes: Math.round((km / 860) * 60 + 35 * (routeStops.length - 1)),
    };
  }

  const goTo = (index) => {
    setEditing(null);
    if (index !== step) setStep(index);
  };

  const onPickCity = (destination) => {
    if (step !== 0) return;

    if (openIndex !== null) {
      resolveStop(openIndex, destination.city);
      setEditing(null);
      return;
    }

    if (stops.length < MAX_STOPS) {
      addStop();
      resolveStop(stops.length, destination.city);
    }
  };

  let hint = "Drag to spin · scroll to zoom";
  if (step === 0) {
    if (openIndex !== null)
      hint = `Tap a city to set “${questionFor(openIndex)}”`;
    else if (stops.length < MAX_STOPS) hint = "Tap a city to add a stop";
    else hint = "Drag to spin";
  }

  const question = openIndex !== null ? questionFor(openIndex) : null;

  return (
    <section
      id="search"
      className={`relative isolate overflow-hidden bg-ink ${
        fill ? "lg:flex lg:min-h-dvh lg:items-center" : ""
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_78%_18%,rgba(78,173,165,0.18),transparent_70%)]"
      />

      <div
        className={`relative mx-auto grid w-full max-w-[1500px] items-center gap-8 px-4 py-6 sm:px-6 lg:gap-12 lg:px-8 lg:py-10 ${
          bottomInset ? "pb-28 lg:pb-28" : ""
        } ${
          step === 0
            ? "lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]"
            : "lg:grid-cols-[minmax(0,660px)_minmax(0,1fr)]"
        }`}
      >
        <div className="order-2 min-w-0 lg:order-1">
          <div className="flex items-center justify-between gap-4">
            <ol
              className="flex items-center gap-3"
              aria-label="Planner progress"
            >
              {STEP_LABELS.map((label, index) => (
                <li key={label} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-current={index === step ? "step" : undefined}
                    className={`text-[11px] font-semibold tracking-[0.14em] uppercase transition ${
                      index === step
                        ? "text-white"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {label}
                  </button>
                  {index < STEP_LABELS.length - 1 ? (
                    <span aria-hidden className="h-px w-8 bg-white/20" />
                  ) : null}
                </li>
              ))}
            </ol>

            {hasSearched ? (
              <button
                type="button"
                onClick={() => setEditingSearch(false)}
                className="rounded-lg text-xs font-semibold text-white/55 transition hover:text-white"
              >
                Close
              </button>
            ) : null}
          </div>

          <h2 className="mt-4 text-[26px] leading-tight font-semibold text-white sm:text-3xl">
            {HEADINGS[step]}
          </h2>

          <p aria-live="polite" className="sr-only">
            {step === 0
              ? question
                ? `Step 1 of 2. ${question}?`
                : "Step 1 of 2. Route complete."
              : "Step 2 of 2. Choose your dates."}
          </p>

          <div className="mt-6">
            {step === 0 ? (
              <RouteStep
                openIndex={openIndex}
                explicit={editing !== null && editing === openIndex}
                onOpen={(index) => setEditing(index)}
              />
            ) : (
              <WhenStep />
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
              >
                Back
              </button>
            ) : null}

            {step === 1 ? (
              <div className="w-full sm:w-44">
                <TravellerPicker />
              </div>
            ) : null}

            {step === 0 ? (
              <button
                type="button"
                onClick={() => goTo(1)}
                disabled={resolving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-white/90 focus-visible:ring-4 focus-visible:ring-white/25 focus-visible:outline-none disabled:opacity-60"
              >
                {resolving ? "Finding airports" : "Continue"}
                <ArrowRight size={16} weight="bold" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={search}
                disabled={isSearching || resolving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-400 px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-brand-300 focus-visible:ring-4 focus-visible:ring-brand-400/30 focus-visible:outline-none disabled:opacity-60"
              >
                {isSearching ? (
                  <>
                    <span
                      className="size-4 animate-spin rounded-full border-2 border-ink/25 border-t-ink motion-reduce:animate-none"
                      aria-hidden
                    />
                    Searching
                  </>
                ) : (
                  <>
                    <MagnifyingGlass size={16} weight="bold" aria-hidden />
                    Search flights, stays &amp; activities
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[min(62vw,300px)] sm:max-w-[380px] lg:order-2 lg:max-w-[min(72vh,780px)]">
          <Globe route={routeStops} onPickCity={onPickCity} hint={hint} />

          {routeStats ? (
            <p className="pointer-events-none absolute top-1 left-1 flex flex-wrap items-baseline gap-x-2 rounded-full bg-ink/55 px-3 py-1 text-xs text-white/60 backdrop-blur">
              <span className="font-semibold text-white/90 tabular-nums">
                {routeStats.km.toLocaleString("en-US")} km
              </span>
              roughly {formatDuration(routeStats.minutes)} in the air
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
