import { Check, Clock, ImageSquare } from "@phosphor-icons/react";
import { useState } from "react";
import { SaveButton } from "./SaveButton";
import { useTrip } from "../context/useTrip";
import { formatDuration, formatMoney } from "../utils/format";

export function ActivityCard({ activity }) {
  const { isSaved, toggleSaved, travellers } = useTrip();
  const [imageFailed, setImageFailed] = useState(false);
  const saved = isSaved("activities", activity.id);
  const total = activity.price * travellers;

  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-surface transition ${
        saved
          ? "border-brand-400 ring-1 ring-brand-400/40"
          : "border-line hover:border-brand-300 hover:shadow-md"
      }`}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-canvas sm:aspect-21/9">
        {activity.image && !imageFailed ? (
          <img
            src={activity.image}
            alt={activity.name}
            onError={() => setImageFailed(true)}
            className="size-full object-cover motion-safe:animate-[fade_320ms_ease-out]"
            loading="lazy"
          />
        ) : (
          <div className="grid size-full place-items-center gap-1 text-xs text-muted">
            <ImageSquare size={24} className="mx-auto" aria-hidden />
            No photo available
          </div>
        )}

        {activity.category ? (
          <span className="absolute top-3 left-3 rounded-md bg-ink/80 px-2 py-1 text-[11px] font-bold text-white shadow">
            {activity.category}
          </span>
        ) : null}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-pretty text-ink">
              {activity.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <Clock size={12} weight="bold" aria-hidden />
                {formatDuration(activity.durationMinutes)}
              </span>
              {activity.city ? <span>{activity.city}</span> : null}
            </div>
          </div>

          {activity.score > 0 ? (
            <div className="flex shrink-0 items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-semibold text-ink">
                  {activity.scoreLabel}
                </p>
                <p className="text-[11px] text-muted">
                  {activity.reviewCountLabel} review
                  {activity.reviewCount === 1 ? "" : "s"}
                </p>
              </div>
              <p className="grid size-9 shrink-0 place-items-center rounded-lg rounded-tr-none bg-brand-700 text-sm font-bold text-white tabular-nums">
                {activity.score.toFixed(1)}
              </p>
            </div>
          ) : null}
        </div>

        {activity.features.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activity.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-800"
              >
                <Check size={12} weight="bold" aria-hidden />
                {feature}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
          <div>
            <p className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-ink tabular-nums">
                {formatMoney(activity.price)}
              </span>
              <span className="text-xs text-muted">per person</span>
            </p>
            {travellers > 1 ? (
              <p className="text-xs font-medium text-ink">
                {formatMoney(total)} for {travellers} travellers
              </p>
            ) : null}
          </div>

          <SaveButton
            saved={saved}
            onClick={() => toggleSaved("activities", activity)}
          />
        </div>
      </div>
    </article>
  );
}
