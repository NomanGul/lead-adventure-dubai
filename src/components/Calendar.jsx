import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function iso(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function leadingBlanks(year, month) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

export function Calendar({ year, month, onMonthChange, min, marks = {}, ranges = [], onSelect }) {
  const days = Array.from(
    { length: new Date(year, month + 1, 0).getDate() },
    (_, i) => i + 1,
  );

  const inRange = (date) =>
    ranges.some((r) => r.from && r.to && date > r.from && date < r.to);

  const step = (delta) => {
    const next = new Date(year, month + delta, 1);
    onMonthChange(next.getFullYear(), next.getMonth());
  };

  const atMin = min && iso(year, month, days.length) < min;

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={Boolean(atMin)}
          aria-label="Previous month"
          className="grid size-8 place-items-center rounded-lg border border-line text-muted transition hover:border-brand-300 hover:text-ink disabled:opacity-35 disabled:hover:border-line"
        >
          <CaretLeft size={14} weight="bold" aria-hidden />
        </button>

        <p aria-live="polite" className="text-sm font-semibold text-ink">
          {MONTHS[month]} {year}
        </p>

        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next month"
          className="grid size-8 place-items-center rounded-lg border border-line text-muted transition hover:border-brand-300 hover:text-ink"
        >
          <CaretRight size={14} weight="bold" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((day, i) => (
          <div key={i} className="pb-1 text-center text-[11px] font-semibold text-muted" aria-hidden>
            {day}
          </div>
        ))}

        {Array.from({ length: leadingBlanks(year, month) }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const date = iso(year, month, day);
          const mark = marks[date];
          const disabled = Boolean(min && date < min);
          const between = inRange(date);

          return (
            <button
              key={date}
              type="button"
              disabled={disabled}
              aria-label={`${day} ${MONTHS[month]} ${year}${mark ? `, ${mark.label}` : ""}`}
              aria-pressed={Boolean(mark)}
              onClick={() => onSelect(date)}
              className={`relative grid aspect-square place-items-center text-[13px] font-medium transition ${
                between ? "bg-brand-50" : ""
              } ${
                mark
                  ? "z-10 rounded-lg bg-brand-600 text-white shadow-sm"
                  : disabled
                    ? "text-muted/30"
                    : "rounded-lg text-ink hover:bg-canvas"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
