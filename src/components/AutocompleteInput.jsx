import { useEffect, useId, useRef, useState } from "react";
import { searchAirports } from "../api/skyScrapper";

export function AutocompleteInput({
  id,
  label,
  value,
  onChange,
  onSelect,
  error,
  placeholder,
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    const query = value.trim();
    if (!open || query.length < 2) return;

    const requestId = ++requestIdRef.current;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const raw = await searchAirports(query);
        if (requestId !== requestIdRef.current) return;
        setSuggestions(raw.slice(0, 8));
        setHighlight(0);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setSuggestions([]);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, open]);

  const query = value.trim();
  const visibleSuggestions = query.length < 2 ? [] : suggestions;
  const showLoading = query.length >= 2 && loading;

  const selectOption = (opt) => {
    onSelect(opt);
    setOpen(false);
  };

  const onKeyDown = (event) => {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((i) =>
        Math.min(i + 1, Math.max(visibleSuggestions.length - 1, 0)),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && open && visibleSuggestions[highlight]) {
      event.preventDefault();
      selectOption(visibleSuggestions[highlight]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={id}>
        <span className="text-sm font-medium text-muted">{label}</span>

        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={Boolean(error)}
          aria-autocomplete="list"
          value={value}
          placeholder={placeholder}
          className="mt-0.5 w-full rounded border-line shadow-sm sm:text-sm"
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
        />
      </label>

      {error ? (
        <p className="mt-1 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {open && (showLoading || visibleSuggestions.length > 0) ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-line bg-surface shadow-sm"
        >
          {showLoading && visibleSuggestions.length === 0 ? (
            <li className="space-y-2 px-3 py-2" aria-hidden>
              <div className="h-3 w-4/5 animate-pulse rounded bg-line" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-line" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-line" />
            </li>
          ) : (
            visibleSuggestions.map((opt, index) => {
              const entityId =
                opt.navigation?.relevantFlightParams?.entityId ||
                opt.navigation?.entityId;
              const title =
                opt.presentation?.suggestionTitle || opt.presentation?.title;
              const subtitle = opt.presentation?.subtitle;

              return (
                <li
                  key={entityId || title}
                  role="option"
                  aria-selected={index === highlight}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    index === highlight
                      ? "bg-brand-50 text-brand-700"
                      : "text-muted hover:bg-canvas"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(opt);
                  }}
                >
                  {title}
                  {subtitle ? `, ${subtitle}` : ""}
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
