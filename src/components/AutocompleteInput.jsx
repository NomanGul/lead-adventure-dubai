import { MapPin, WarningCircle, X } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
import { searchAirports } from "../api/skyScrapper";
import { DESTINATIONS } from "../data/world";

const POPULAR_CITIES = ["Dubai", "London", "Istanbul", "Singapore", "Paris", "New York"]
  .map((city) => DESTINATIONS.find((d) => d.city === city))
  .filter(Boolean);

export function AutocompleteInput({
  id,
  label,
  value,
  onChange,
  onSelect,
  onPickCity,
  onResolveText,
  resolved,
  error,
  placeholder,
  autoFocus,
  dark = false,
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [result, setResult] = useState({ query: "", items: [] });
  const [loading, setLoading] = useState(false);
  const rootRef = useRef(null);
  const requestRef = useRef(0);

  useEffect(() => {
    const onDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const query = value.trim();

  useEffect(() => {
    if (!open || query.length < 2) return;

    const request = (requestRef.current += 1);
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await searchAirports(query);
        if (request !== requestRef.current) return;
        setResult({ query, items: found.slice(0, 7) });
        setHighlight(0);
      } catch {
        if (request !== requestRef.current) return;
        setResult({ query, items: [] });
      } finally {
        if (request === requestRef.current) setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, open]);

  const browsing = query.length < 2;
  const searched = result.query === query;
  const places = searched ? result.items : [];
  const options = browsing
    ? POPULAR_CITIES.map((d) => ({ kind: "city", city: d, key: d.city }))
    : places.map((p) => ({ kind: "place", place: p, key: p.navigation?.entityId ?? p.presentation?.title }));

  const choose = (option) => {
    if (option.kind === "city") onPickCity?.(option.city.city);
    else onSelect?.(option.place);
    setOpen(false);
  };

  const onKeyDown = (event) => {
    if (!open && ["ArrowDown", "ArrowUp"].includes(event.key)) {
      setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((i) => (options.length ? (i + 1) % options.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((i) => (options.length ? (i - 1 + options.length) % options.length : 0));
    } else if (event.key === "Enter" && open && options[highlight]) {
      event.preventDefault();
      choose(options[highlight]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const errorId = error ? `${id}-error` : undefined;
  const showPanel = open && (loading || options.length > 0 || (searched && !loading));

  return (
    <div ref={rootRef} className="relative">
      <label
        htmlFor={id}
        className={`block text-xs font-semibold tracking-wide uppercase ${
          dark ? "text-white/55" : "text-muted"
        }`}
      >
        {label}
      </label>

      <div className="relative mt-1.5">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          aria-activedescendant={open && options[highlight] ? `${listId}-${highlight}` : undefined}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          className={`w-full rounded-xl border bg-surface px-3.5 py-3 pr-9 text-sm font-medium text-ink shadow-sm transition outline-none placeholder:font-normal placeholder:text-muted/70 focus:ring-4 ${
            error
              ? "border-danger focus:border-danger focus:ring-danger/15"
              : "border-line focus:border-brand-500 focus:ring-brand-500/15"
          }`}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            if (!resolved && query.length >= 2) onResolveText?.(query);
          }}
          onKeyDown={onKeyDown}
        />

        {loading ? (
          <span
            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-line border-t-brand-500 motion-reduce:animate-none"
            aria-hidden
          />
        ) : value ? (
          <button
            type="button"
            aria-label={`Clear ${label.toLowerCase()}`}
            className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-canvas hover:text-ink"
            onClick={() => {
              onChange("");
              setOpen(true);
            }}
          >
            <X size={14} weight="bold" aria-hidden />
          </button>
        ) : null}
      </div>

      {error ? (
        <p
          id={errorId}
          className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
            dark ? "text-[#ffb4a8]" : "text-danger"
          }`}
          role="alert"
        >
          <WarningCircle size={14} className="shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}

      {showPanel ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute z-30 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface p-1 shadow-xl shadow-ink/5"
        >
          {browsing ? (
            <li className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
              Popular
            </li>
          ) : null}

          {options.map((option, index) => {
            const title =
              option.kind === "city"
                ? option.city.city
                : option.place.presentation?.suggestionTitle || option.place.presentation?.title;
            const subtitle =
              option.kind === "city"
                ? option.city.country
                : option.place.presentation?.subtitle;
            const code = option.kind === "city" ? option.city.iata : null;

            return (
              <li
                key={option.key}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === highlight}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${
                  index === highlight ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-canvas"
                }`}
                onMouseEnter={() => setHighlight(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(option);
                }}
              >
                <MapPin size={16} className="shrink-0 text-muted" aria-hidden />
                <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
                {code ? (
                  <span className="shrink-0 rounded bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-muted">
                    {code}
                  </span>
                ) : null}
                {subtitle && !code ? (
                  <span className="shrink-0 truncate text-xs text-muted">{subtitle}</span>
                ) : null}
              </li>
            );
          })}

          {!loading && !browsing && options.length === 0 ? (
            <li className="px-2.5 py-3 text-sm text-muted">
              Nothing matches &ldquo;{query}&rdquo;. Try a city name.
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
