import { CheckCircle } from "@phosphor-icons/react";
import { useTrip } from "../context/useTrip";

export function Toast() {
  const { notice } = useTrip();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 top-4 z-60 flex justify-center px-4"
    >
      {notice ? (
        <p
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-xl ring-1 motion-safe:animate-[toast_240ms_ease-out] ${
            notice.tone === "success"
              ? "bg-ink text-white ring-ink/10"
              : "bg-surface text-ink ring-line"
          }`}
        >
          {notice.tone === "success" ? (
            <CheckCircle size={16} weight="fill" className="text-brand-300" aria-hidden />
          ) : null}
          {notice.text}
        </p>
      ) : null}
    </div>
  );
}
