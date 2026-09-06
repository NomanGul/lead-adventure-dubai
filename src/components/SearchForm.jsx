import { useTrip } from "../context/TripContext";
import { AutocompleteInput } from "./AutocompleteInput";

export function SearchForm() {
  const {
    searchForm,
    updateForm,
    selectPlace,
    formErrors,
    search,
    isSearching,
  } = useTrip();

  const onSubmit = (event) => {
    event.preventDefault();
    search();
  };

  return (
    <section id="search">
      <form
        onSubmit={onSubmit}
        noValidate
        className="mx-auto space-y-4 rounded-lg border border-line bg-canvas p-6"
      >
        <h2 className="text-lg font-medium text-ink">
          Search flights & hotels
        </h2>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-ink">Locations</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <AutocompleteInput
              id="origin"
              label="Origin"
              value={searchForm.origin}
              onChange={(value) => updateForm("origin", value)}
              onSelect={(place) => selectPlace("origin", place)}
              error={formErrors.origin}
              placeholder="City or airport"
            />
            <AutocompleteInput
              id="destination"
              label="Destination"
              value={searchForm.destination}
              onChange={(value) => updateForm("destination", value)}
              onSelect={(place) => selectPlace("destination", place)}
              error={formErrors.destination}
              placeholder="City or airport"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-ink">Dates</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="departure">
                <span className="text-sm font-medium text-muted">
                  Departure
                </span>
                <input
                  id="departure"
                  type="date"
                  value={searchForm.departure}
                  aria-invalid={Boolean(formErrors.departure)}
                  className="mt-0.5 w-full rounded border-line shadow-sm sm:text-sm"
                  onChange={(e) => updateForm("departure", e.target.value)}
                />
              </label>
              {formErrors.departure ? (
                <p className="mt-1 text-sm text-danger" role="alert">
                  {formErrors.departure}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="returnDate">
                <span className="text-sm font-medium text-muted">Return</span>
                <input
                  id="returnDate"
                  type="date"
                  value={searchForm.returnDate}
                  aria-invalid={Boolean(formErrors.returnDate)}
                  className="mt-0.5 w-full rounded border-line shadow-sm sm:text-sm"
                  onChange={(e) => updateForm("returnDate", e.target.value)}
                />
              </label>
              {formErrors.returnDate ? (
                <p className="mt-1 text-sm text-danger" role="alert">
                  {formErrors.returnDate}
                </p>
              ) : null}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-ink">Guests</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="adults"
                className="text-sm font-medium text-muted"
              >
                Adults
              </label>
              <input
                id="adults"
                type="number"
                min={1}
                value={searchForm.adults}
                aria-invalid={Boolean(formErrors.adults)}
                className="mt-0.5 h-10 w-full rounded-sm border-line sm:text-sm"
                onChange={(e) => updateForm("adults", Number(e.target.value))}
              />
              {formErrors.adults ? (
                <p className="mt-1 text-sm text-danger" role="alert">
                  {formErrors.adults}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="children"
                className="text-sm font-medium text-muted"
              >
                Children
              </label>
              <input
                id="children"
                type="number"
                min={0}
                value={searchForm.children}
                className="mt-0.5 h-10 w-full rounded-sm border-line sm:text-sm"
                onChange={(e) => updateForm("children", Number(e.target.value))}
              />
            </div>
          </div>
        </fieldset>

        <button
          className="block w-full rounded-lg border border-brand-600 bg-brand-600 px-12 py-3 text-sm font-medium text-white transition-colors hover:bg-transparent hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSearching}
        >
          {isSearching ? "Searching…" : "Search"}
        </button>
      </form>
    </section>
  );
}
