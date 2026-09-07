import { AirplaneTilt } from "@phosphor-icons/react";
import { formatDuration, formatTime } from "../utils/format";

export function FlightLeg({ leg }) {
  const stopDots = Array.from({ length: Math.min(leg.stops, 3) }, (_, i) => i);

  const origin = leg.originCity || leg.originCode;
  const destination = leg.destinationCity || leg.destinationCode;

  let stopLabel = "Direct";
  if (leg.stops > 0) {
    const count = `${leg.stops} stop${leg.stops === 1 ? "" : "s"}`;
    stopLabel =
      leg.layovers.length > 0
        ? `${count} · ${leg.layovers
            .map((stop) => `${formatDuration(stop.minutes)} ${stop.city || stop.code}`)
            .join(" · ")}`
        : count;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-semibold text-ink tabular-nums">{formatTime(leg.departure)}</p>
        <p className="truncate text-[11px] text-muted" title={origin}>
          {origin}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-center text-[11px] font-medium text-muted">{formatDuration(leg.durationMinutes)}</p>

        <div className="relative my-1.5 flex items-center" aria-hidden>
          <span className="size-1.5 shrink-0 rounded-full bg-brand-500" />
          <span className="relative h-px flex-1 bg-line">
            {stopDots.map((i) => (
              <span
                key={i}
                className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-surface ring-1 ring-muted/50"
                style={{ left: `${((i + 1) / (stopDots.length + 1)) * 100}%` }}
              />
            ))}
          </span>
          <AirplaneTilt size={12} weight="fill" className="shrink-0 text-brand-600" aria-hidden />
        </div>

        <p
          className={`truncate text-center text-[11px] font-medium ${
            leg.stops === 0 ? "text-brand-700" : "text-muted"
          }`}
        >
          {stopLabel}
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink tabular-nums">{formatTime(leg.arrival)}</p>
        <p className="truncate text-[11px] text-muted" title={destination}>
          {destination}
        </p>
      </div>
    </div>
  );
}
