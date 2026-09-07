import { formatMoney } from "../utils/format";

const THUMB =
  "pointer-events-none absolute inset-x-0 top-1/2 h-9 w-full -translate-y-1/2 appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-600 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-600 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow";

export function RangeSlider({ min, max, from, to, onChange }) {
  const span = Math.max(1, max - min);
  const low = from ?? min;
  const high = to ?? max;
  const leftPct = ((low - min) / span) * 100;
  const rightPct = ((high - min) / span) * 100;

  const setLow = (value) => onChange({ from: Math.min(value, high), to: high });
  const setHigh = (value) => onChange({ from: low, to: Math.max(value, low) });

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink tabular-nums">{formatMoney(low)}</span>
        <span className="text-sm font-semibold text-ink tabular-nums">
          {formatMoney(high)}
          {high >= max ? "+" : ""}
        </span>
      </div>

      <div className="relative h-9">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />

        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          value={low}
          onChange={(event) => setLow(Number(event.target.value))}
          className={THUMB}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          value={high}
          onChange={(event) => setHigh(Number(event.target.value))}
          className={THUMB}
        />
      </div>
    </div>
  );
}
