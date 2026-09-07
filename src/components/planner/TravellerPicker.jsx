import { useEffect, useRef, useState } from "react";
import { CaretDown, User } from "@phosphor-icons/react";
import { Stepper } from "../Stepper";
import { useTrip } from "../../context/useTrip";
import { pluralise } from "../../utils/format";

export function TravellerPicker() {
  const { adults, setAdults, childCount, setChildCount, travellers, errors } = useTrip();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const error = errors.adults || errors.travellers;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3.5 py-3 text-sm font-semibold whitespace-nowrap transition ${
          error
            ? "border-[#ff8f80]/60 text-[#ffb4a8]"
            : "border-white/20 text-white hover:border-white/40 hover:bg-white/5"
        }`}
      >
        <User size={16} className="shrink-0 opacity-70" aria-hidden />
        {pluralise(travellers, "traveller")}
        <CaretDown size={12} weight="bold" className="shrink-0 opacity-60" aria-hidden />
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 z-40 mb-2 w-[min(19rem,calc(100vw-2.5rem))] rounded-2xl border border-line bg-surface p-3 shadow-2xl shadow-black/40">
          <div className="space-y-2">
            <Stepper
              id="adults"
              label="Adults"
              hint="16 and over"
              value={adults}
              min={1}
              max={9}
              onChange={setAdults}
            />
            <Stepper
              id="children"
              label="Children"
              hint="Under 16"
              value={childCount}
              min={0}
              max={8}
              onChange={setChildCount}
            />
          </div>

          {error ? (
            <p className="mt-2 text-xs font-medium text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full rounded-xl bg-ink py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
}
