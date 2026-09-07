import { RangeSlider } from "./RangeSlider";
import { useTrip } from "../context/useTrip";
import { STOP_OPTIONS, TIME_WINDOWS } from "../utils/filterSort";

function Section({ title, children }) {
  return (
    <fieldset className="border-t border-line pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-2.5 text-xs font-semibold tracking-wide text-muted uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function CheckRow({ label, count, checked, onChange }) {
  const empty = count === 0 && !checked;

  return (
    <label
      className={`flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm transition ${
        empty ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-canvas"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={empty}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 shrink-0 rounded border-line text-brand-600 focus:ring-2 focus:ring-brand-500/30"
      />
      <span className="min-w-0 flex-1 truncate font-medium text-ink">{label}</span>
      <span className="shrink-0 text-xs text-muted tabular-nums">{count}</span>
    </label>
  );
}

export function FiltersPanel({ facets, bounds }) {
  const { filters, setFilters, clearFilters, activeTab } = useTrip();

  const toggleIn = (key, value) => {
    setFilters((prev) => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  };

  const set = (patch) => setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <div className="space-y-4">
      <Section title="Budget">
        <RangeSlider
          min={bounds.min}
          max={bounds.max}
          from={filters.minPrice}
          to={filters.maxPrice}
          onChange={({ from, to }) =>
            set({
              minPrice: from <= bounds.min ? null : from,
              maxPrice: to >= bounds.max ? null : to,
            })
          }
        />
        <p className="text-[11px] text-muted">
          {activeTab === "flights"
            ? "Per person, round trip"
            : activeTab === "activities"
              ? "Per person"
              : "Per night"}
        </p>
      </Section>

      {activeTab === "flights" ? (
        <>
          <Section title="Stops">
            {STOP_OPTIONS.map((option) => (
              <CheckRow
                key={option.id}
                label={option.label}
                count={facets.stops?.[option.id] ?? 0}
                checked={filters.stops.includes(option.id)}
                onChange={() => toggleIn("stops", option.id)}
              />
            ))}
          </Section>

          <Section title="Departure time">
            {TIME_WINDOWS.map((window) => (
              <CheckRow
                key={window.id}
                label={window.label}
                count={facets.windows?.[window.id] ?? 0}
                checked={filters.windows.includes(window.id)}
                onChange={() => toggleIn("windows", window.id)}
              />
            ))}
          </Section>

          {Object.keys(facets.airlines ?? {}).length > 0 ? (
            <Section title="Airlines">
              <div className="max-h-52 space-y-0.5 overflow-y-auto">
                {Object.entries(facets.airlines).map(([name, count]) => (
                  <CheckRow
                    key={name}
                    label={name}
                    count={count}
                    checked={filters.airlines.includes(name)}
                    onChange={() => toggleIn("airlines", name)}
                  />
                ))}
              </div>
            </Section>
          ) : null}
        </>
      ) : activeTab === "activities" ? (
        <>
          {Object.keys(facets.categories ?? {}).length > 0 ? (
            <Section title="Category">
              <div className="max-h-52 space-y-0.5 overflow-y-auto">
                {Object.entries(facets.categories).map(([name, count]) => (
                  <CheckRow
                    key={name}
                    label={name}
                    count={count}
                    checked={filters.categories.includes(name)}
                    onChange={() => toggleIn("categories", name)}
                  />
                ))}
              </div>
            </Section>
          ) : null}

          <Section title="Guest score">
            {[
              { value: 9, label: "Excellent 9+" },
              { value: 8, label: "Very good 8+" },
              { value: 7, label: "Good 7+" },
            ].map((option) => (
              <CheckRow
                key={option.value}
                label={option.label}
                count={facets.score?.[option.value] ?? 0}
                checked={filters.minScore === option.value}
                onChange={(on) => set({ minScore: on ? option.value : 0 })}
              />
            ))}
          </Section>

          <Section title="Booking options">
            <CheckRow
              label="Free cancellation"
              count={facets.freeCancellation ?? 0}
              checked={filters.freeCancellation}
              onChange={(on) => set({ freeCancellation: on })}
            />
          </Section>
        </>
      ) : (
        <>
          <Section title="Star rating">
            {[3, 4, 5].map((stars) => (
              <CheckRow
                key={stars}
                label={stars === 5 ? "5 stars" : `${stars}+ stars`}
                count={facets.stars?.[stars] ?? 0}
                checked={filters.minStars === stars}
                onChange={(on) => set({ minStars: on ? stars : 0 })}
              />
            ))}
          </Section>

          <Section title="Guest score">
            {[
              { value: 9, label: "Excellent 9+" },
              { value: 8, label: "Very good 8+" },
              { value: 7, label: "Good 7+" },
            ].map((option) => (
              <CheckRow
                key={option.value}
                label={option.label}
                count={facets.score?.[option.value] ?? 0}
                checked={filters.minScore === option.value}
                onChange={(on) => set({ minScore: on ? option.value : 0 })}
              />
            ))}
          </Section>

          <Section title="Booking options">
            <CheckRow
              label="Free cancellation"
              count={facets.freeCancellation ?? 0}
              checked={filters.freeCancellation}
              onChange={(on) => set({ freeCancellation: on })}
            />
          </Section>
        </>
      )}

      <button
        type="button"
        onClick={clearFilters}
        className="w-full rounded-xl border border-line py-2.5 text-sm font-semibold text-ink transition hover:border-brand-400 hover:bg-canvas"
      >
        Clear all filters
      </button>
    </div>
  );
}
