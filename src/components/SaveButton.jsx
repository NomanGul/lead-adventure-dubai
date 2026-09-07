import { Check, Plus, X } from "@phosphor-icons/react";

export function SaveButton({ saved, onClick, addLabel = "Add to trip" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      className={`group inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition focus-visible:ring-4 focus-visible:outline-none ${
        saved
          ? "border-brand-600 bg-brand-50 text-brand-700 hover:border-danger hover:bg-danger/5 hover:text-danger focus-visible:ring-brand-500/20"
          : "border-brand-600 bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500/25"
      }`}
    >
      {saved ? (
        <>
          <Check
            size={14}
            weight="bold"
            className="group-hover:hidden"
            aria-hidden
          />
          <X
            size={14}
            weight="bold"
            className="hidden group-hover:block"
            aria-hidden
          />
          <span className="group-hover:hidden">Saved</span>
          <span className="hidden group-hover:inline">Remove</span>
        </>
      ) : (
        <>
          <Plus size={14} weight="bold" aria-hidden />
          {addLabel}
        </>
      )}
    </button>
  );
}
