import { ArrowRight, PencilSimple, Plus, X } from "@phosphor-icons/react";
import { AutocompleteInput } from "../AutocompleteInput";
import { MAX_STOPS } from "../../context/trip-context";
import { useTrip } from "../../context/useTrip";
import { POPULAR_ROUTES } from "../../data/world";

function questionFor(index) {
  if (index === 0) return "Flying from";
  if (index === 1) return "Where to";
  return "Then where";
}

export function RouteStep({ openIndex, explicit, onOpen }) {
  const {
    stops,
    errors,
    updateStop,
    selectStop,
    resolveStop,
    addStop,
    removeStop,
    applyRoute,
    resolving,
  } = useTrip();

  const complete = openIndex === null;
  const blank = stops.length === 2 && stops.every((stop) => !stop.label);

  const pick = (index, city) => {
    resolveStop(index, city);
    onOpen(null);
  };

  const choose = (index, place) => {
    selectStop(index, place);
    onOpen(null);
  };

  return (
    <div>
      <ol className="space-y-1">
        {stops.map((stop, index) => {
          const open = index === openIndex;
          const error = errors[`stop-${index}`];
          const last = index === stops.length - 1;

          return (
            <li key={stop.key} className="relative flex gap-3">
              {!last ? (
                <span
                  aria-hidden
                  className="absolute top-[34px] left-[13px] w-px bg-white/20"
                  style={{ bottom: "-0.25rem" }}
                />
              ) : null}

              <span
                aria-hidden
                className={`relative z-10 mt-1.5 grid size-[27px] shrink-0 place-items-center rounded-full text-[11px] font-bold transition ${
                  open
                    ? "bg-brand-400 text-ink"
                    : stop.place
                      ? "bg-white text-ink"
                      : "bg-white/10 text-white/50 ring-1 ring-white/15 ring-inset"
                }`}
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1 pb-2">
                {open ? (
                  <AutocompleteInput
                    id={`stop-${index}`}
                    label={questionFor(index)}
                    placeholder="City or airport"
                    value={stop.label}
                    error={error}
                    autoFocus={(!blank || index > 0) && (!stop.label || explicit)}
                    onChange={(value) => updateStop(index, value)}
                    onSelect={(place) => choose(index, place)}
                    onPickCity={(city) => pick(index, city)}
                    onResolveText={(text) => pick(index, text)}
                    resolved={Boolean(stop.place)}
                    dark
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpen(index)}
                      className="group flex min-w-0 flex-1 items-baseline gap-2 rounded-lg px-1 py-1.5 text-left transition hover:bg-white/5"
                    >
                      <span
                        className={`truncate text-[15px] ${
                          stop.label ? "font-semibold text-white" : "font-medium text-white/45"
                        }`}
                      >
                        {stop.label || questionFor(index)}
                      </span>
                      {stop.label ? (
                        <>
                          <PencilSimple
                            size={12}
                            aria-hidden
                            className="shrink-0 text-white/0 transition group-hover:text-white/45"
                          />
                          <span className="sr-only">— change</span>
                        </>
                      ) : (
                        <span className="sr-only">— not set yet</span>
                      )}
                    </button>

                    {stops.length > 2 ? (
                      <button
                        type="button"
                        onClick={() => removeStop(index)}
                        aria-label={`Remove ${stop.label || `stop ${index + 1}`}`}
                        className="grid size-7 shrink-0 place-items-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
                      >
                        <X size={14} weight="bold" aria-hidden />
                      </button>
                    ) : null}
                  </div>
                )}

                {!open && error ? (
                  <p className="px-1 text-xs font-medium text-[#ffb4a8]" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {blank ? (
        <div className="mt-4">
          <p className="text-[11px] font-semibold tracking-wide text-white/45 uppercase">
            Or start from a popular route
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {POPULAR_ROUTES.map((route) => (
              <li key={`${route.from}-${route.to}`}>
                <button
                  type="button"
                  disabled={resolving}
                  aria-label={`${route.from} to ${route.to}`}
                  onClick={() => {
                    applyRoute(route.from, route.to);
                    onOpen(null);
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 py-1.5 pr-3 pl-2.5 text-xs font-semibold text-white/85 transition hover:border-white/40 hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  {route.from}
                  <ArrowRight size={12} weight="bold" className="text-brand-300" aria-hidden />
                  {route.to}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {complete && stops.length < MAX_STOPS ? (
        <button
          type="button"
          onClick={() => {
            addStop();
            onOpen(null);
          }}
          className="mt-1 flex items-center gap-2 rounded-lg px-1 py-1.5 text-sm font-semibold text-brand-300 transition hover:text-brand-200"
        >
          <span aria-hidden className="grid size-[27px] place-items-center rounded-full border border-dashed border-white/25">
            <Plus size={12} weight="bold" aria-hidden />
          </span>
          Add another stop
        </button>
      ) : null}

      {complete && stops.length >= MAX_STOPS ? (
        <p className="mt-1 px-1 text-xs text-white/45">
          {MAX_STOPS} stops is the most we can plan in one go.
        </p>
      ) : null}
    </div>
  );
}
