import { Minus, Plus } from "@phosphor-icons/react";

export function Stepper({
  id,
  label,
  hint,
  value,
  min = 0,
  max = 9,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3">
      <span>
        <label htmlFor={id} className="block text-sm font-semibold text-ink">
          {label}
        </label>
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </span>

      <span className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`One fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="grid size-9 place-items-center rounded-lg border border-line text-lg leading-none text-ink transition hover:border-brand-400 hover:bg-brand-50 disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-transparent"
        >
          <Minus size={14} weight="bold" aria-hidden />
        </button>

        <output
          id={id}
          aria-live="polite"
          className="w-9 text-center text-base font-semibold text-ink tabular-nums"
        >
          {value}
        </output>

        <button
          type="button"
          aria-label={`One more ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="grid size-9 place-items-center rounded-lg border border-line text-ink transition hover:border-brand-400 hover:bg-brand-50 disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-transparent"
        >
          <Plus size={14} weight="bold" aria-hidden />
        </button>
      </span>
    </div>
  );
}
