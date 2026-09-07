import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { Calendar } from "../Calendar";
import { useTrip } from "../../context/useTrip";
import { addDaysISO, formatDateLong, pluralise, todayISO } from "../../utils/format";

const TRIP_TYPES = [
  { id: "return", label: "Return" },
  { id: "oneway", label: "One-way" },
];

export function WhenStep() {
  const {
    stops,
    hops,
    tripType,
    setTripType,
    isRoundTrip,
    endDate,
    setEndDate,
    setDeparture,
    errors,
    stays,
  } = useTrip();

  const [active, setActive] = useState({ kind: "hop", index: 0 });

  const lastDeparture = hops[hops.length - 1]?.departure;
  const lastStop = stops[stops.length - 1]?.label;

  const endLabel = isRoundTrip ? "Flying home" : hops.length > 1 ? "Trip ends" : "Checking out";
  const endSub = isRoundTrip
    ? `Back to ${stops[0]?.label || "where you started"}`
    : `Last night in ${lastStop || "your final stop"}`;

  const slots = [
    ...hops.map((hop, index) => ({
      kind: "hop",
      index,
      label: hops.length > 1 ? `Hop ${index + 1} departs` : "Departing",
      sub: `${stops[index]?.label || "?"} to ${stops[index + 1]?.label || "?"}`,
      value: hop.departure,
      error: errors[`departure-${index}`],
      optional: false,
    })),
    {
      kind: "end",
      index: 0,
      label: endLabel,
      sub: endSub,
      value: endDate,
      error: errors.endDate,
      optional: !isRoundTrip,
    },
  ];

  const activeSlot =
    slots.find((slot) => slot.kind === active.kind && slot.index === active.index) ?? slots[0];

  const anchor = activeSlot.value || hops[0]?.departure || todayISO();
  const [view, setView] = useState(() => ({
    year: Number(anchor.slice(0, 4)),
    month: Number(anchor.slice(5, 7)) - 1,
  }));

  const aimAt = (slot) => {
    setActive({ kind: slot.kind, index: slot.index });
    if (slot.value) {
      setView({
        year: Number(slot.value.slice(0, 4)),
        month: Number(slot.value.slice(5, 7)) - 1,
      });
    }
  };

  const previous =
    activeSlot.kind === "end"
      ? lastDeparture
      : hops[activeSlot.index - 1]?.departure;
  const minDate = previous ? addDaysISO(previous, 1) : todayISO();

  const marks = {};
  hops.forEach((hop, index) => {
    if (hop.departure) {
      marks[hop.departure] = { label: hops.length > 1 ? `hop ${index + 1} departs` : "departing" };
    }
  });
  if (endDate) marks[endDate] = { label: endLabel.toLowerCase() };

  const select = (date) => {
    if (activeSlot.kind === "end") {
      setEndDate(date);
      return;
    }

    setDeparture(activeSlot.index, date);

    const nextSlot = slots[activeSlot.index + 1];
    if (nextSlot) setActive({ kind: nextSlot.kind, index: nextSlot.index });
  };

  const slotButton = (slot) => {
    const isActive = slot === activeSlot;
    const missing = !slot.value;

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => aimAt(slot)}
          aria-pressed={isActive}
          className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${
            isActive
              ? "border-brand-400 bg-white/10"
              : slot.error
                ? "border-[#ff8f80]/60 bg-white/5"
                : "border-white/12 bg-white/[0.03] hover:border-white/30"
          }`}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold tracking-wide text-white/50 uppercase">
              {slot.label}
              {slot.optional ? (
                <span className="ml-1.5 normal-case opacity-70"> · optional</span>
              ) : null}
            </span>
            <span
              className={`block truncate text-sm font-semibold ${
                missing ? "text-white/45" : "text-white"
              }`}
            >
              {slot.value ? formatDateLong(slot.value) : "Pick a date"}
            </span>
            <span className="block truncate text-xs text-white/45">{slot.sub}</span>
          </span>
        </button>

        <span className="grid size-7 shrink-0 place-items-center">
          {slot.optional && slot.value ? (
            <button
              type="button"
              onClick={() => setEndDate("")}
              aria-label={`Clear ${slot.label.toLowerCase()}`}
              className="grid size-7 place-items-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
            >
              <X size={14} weight="bold" aria-hidden />
            </button>
          ) : null}
        </span>
      </div>
    );
  };

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,264px)] md:items-start">
      <div className="space-y-2">
        {hops.length === 1 ? (
          <div role="group" aria-label="Trip type" className="mb-3 flex gap-1 rounded-xl bg-white/[0.06] p-1">
            {TRIP_TYPES.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={tripType === option.id}
                onClick={() => setTripType(option.id)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  tripType === option.id
                    ? "bg-white text-ink shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}

        {slots.map((slot, index) => {
          const stay = slot.kind === "hop" ? stays[slot.index] : null;

          return (
            <div key={`${slot.kind}-${slot.index}`}>
              {slotButton(slot)}

              {slot.error ? (
                <p className="mt-1 pl-1 text-xs font-medium text-[#ffb4a8]" role="alert">
                  {slot.error}
                </p>
              ) : null}

              {stay && index < slots.length - 1 ? (
                <p className="flex items-center gap-2 py-1.5 pl-4 text-xs text-white/50">
                  <span aria-hidden className="h-4 w-px bg-white/15" />
                  {stay.nights > 0
                    ? `${pluralise(stay.nights, "night")} in ${stay.city || "your stop"}`
                    : `No nights in ${stay.city || "your stop"} yet`}
                </p>
              ) : null}
            </div>
          );
        })}

        {!isRoundTrip && !endDate && lastStop ? (
          <p className="pt-1 pl-1 text-xs text-white/45">
            {hops.length > 1
              ? `Earlier stays are priced by the next hop. Add a date to include ${lastStop}.`
              : `Add a checkout date to see stays in ${lastStop}.`}
          </p>
        ) : null}
      </div>

      <Calendar
        year={view.year}
        month={view.month}
        onMonthChange={(year, month) => setView({ year, month })}
        min={minDate}
        marks={marks}
        ranges={[{ from: hops[0]?.departure, to: endDate }]}
        onSelect={select}
      />
    </div>
  );
}
