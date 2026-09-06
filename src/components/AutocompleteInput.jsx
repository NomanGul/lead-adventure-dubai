import { useEffect, useId, useRef, useState } from "react";

export function AutocompleteInput({
  id,
  label,
  value,
  onChange,
  options,
  error,
  placeholder,
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef(null);

  const query = value.trim().toLowerCase();
  const suggestions = options
    .filter((opt) => {
      const labelText =
        `${opt.city} ${opt.airportCode} ${opt.country}`.toLowerCase();
      return query.length === 0 || labelText.includes(query);
    })
    .slice(0, 8);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const selectOption = (opt) => {
    onChange(`${opt.city} (${opt.airportCode})`);
    setOpen(false);
  };

  const onKeyDown = (event) => {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && open && suggestions[highlight]) {
      event.preventDefault();
      selectOption(suggestions[highlight]);
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

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-line bg-surface shadow-sm"
        >
          {suggestions.map((opt, index) => (
            <li
              key={opt.id}
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
              {opt.city} ({opt.airportCode}), {opt.country}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
