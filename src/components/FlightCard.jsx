import { CaretDown } from "@phosphor-icons/react";
import { useState } from "react";
import { CarrierLogo } from "./CarrierLogo";
import { FlightLeg } from "./FlightLeg";
import { SaveButton } from "./SaveButton";
import { useTrip } from "../context/useTrip";
import { formatMoney } from "../utils/format";

const TAGS = {
  cheapest: { label: "Cheapest", tone: "price" },
  second_cheapest: { label: "2nd cheapest", tone: "price" },
  third_cheapest: { label: "3rd cheapest", tone: "price" },
  shortest: { label: "Fastest", tone: "time" },
  second_shortest: { label: "2nd fastest", tone: "time" },
  third_shortest: { label: "3rd fastest", tone: "time" },
};

function Badge({ tone, children }) {
  const tones = {
    price: "bg-brand-600 text-white",
    time: "bg-brand-100 text-brand-800",
    eco: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 ring-inset",
    warn: "bg-amber-50 text-amber-800 ring-1 ring-amber-200 ring-inset",
    plain: "bg-canvas text-muted",
  };

  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function FlightCard({ flight }) {
  const { isSaved, toggleSaved, travellers } = useTrip();
  const [showDetail, setShowDetail] = useState(false);
  const saved = isSaved("flights", flight.id);

  const badges = flight.tags
    .map((tag) => TAGS[tag])
    .filter(Boolean)
    .slice(0, 2);
  const total = flight.price * travellers;
  const isCheapest = flight.tags.includes("cheapest");

  return (
    <article
      className={`rounded-2xl border bg-surface p-4 transition sm:p-5 ${
        saved
          ? "border-brand-400 ring-1 ring-brand-400/40"
          : "border-line hover:border-brand-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <CarrierLogo
            src={flight.outbound?.carrierLogo}
            name={flight.outbound?.carrierName}
          />

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink">
              {flight.outbound?.carrierName}
            </h3>
            <p className="font-mono text-[11px] text-muted">
              {flight.outbound?.flightCode}
              {flight.isRoundTrip ? " · round trip" : " · one way"}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={`text-xl font-bold tabular-nums ${
              isCheapest ? "text-brand-700" : "text-ink"
            }`}
          >
            {flight.priceLabel || formatMoney(flight.price)}
          </p>
          <p className="text-[11px] text-muted">per person</p>
        </div>
      </div>

      {badges.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <Badge key={badge.label} tone={badge.tone}>
              {badge.label}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {flight.outbound ? <FlightLeg leg={flight.outbound} /> : null}

        {flight.inbound ? (
          <>
            <div className="flex items-center gap-2">
              <span className="h-px flex-1 bg-line" />
              <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                Return
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <FlightLeg leg={flight.inbound} />
          </>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
        {flight.ecoDelta > 0 ? (
          <Badge tone="eco">{Math.round(flight.ecoDelta)}% less CO₂</Badge>
        ) : null}
        {flight.isSelfTransfer ? (
          <Badge tone="warn">Self-transfer</Badge>
        ) : null}
        <Badge tone="plain">
          {flight.refundable ? "Refundable" : "Non-refundable"}
        </Badge>
        {flight.changeable ? <Badge tone="plain">Changeable</Badge> : null}

        <div className="ml-auto flex items-center gap-3">
          {travellers > 1 ? (
            <p className="text-right text-xs">
              <span className="font-semibold text-ink tabular-nums">
                {formatMoney(total)}
              </span>
              <span className="text-muted"> total</span>
            </p>
          ) : null}
          <SaveButton
            saved={saved}
            onClick={() => toggleSaved("flights", flight)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowDetail((v) => !v)}
        aria-expanded={showDetail}
        className="mt-2 flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-ink"
      >
        {showDetail ? "Hide" : "Show"} flight details
        <CaretDown
          size={12}
          weight="bold"
          aria-hidden
          className={`transition-transform ${showDetail ? "rotate-180" : ""}`}
        />
      </button>

      {showDetail ? (
        <dl className="mt-2 space-y-1.5 rounded-xl bg-canvas p-3 text-xs">
          {flight.legs.map((leg, index) => (
            <div key={leg.id} className="flex justify-between gap-3">
              <dt className="text-muted">
                {index === 0 ? "Outbound" : "Return"} ·{" "}
                {leg.originCity || leg.originCode}–
                {leg.destinationCity || leg.destinationCode}
              </dt>
              <dd className="text-right font-medium text-ink">
                {leg.carrierName}
                {leg.layovers.length > 0
                  ? ` via ${leg.layovers.map((s) => s.city || s.code).join(", ")}`
                  : " · nonstop"}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}
