import { createContext, useContext, useState } from "react";
import mock from "../data/mock.json";
import { useLocalStorage } from "../hooks/useLocalStorage";

const TripContext = createContext(null);

const initialForm = {
  origin: "London (LHR)",
  destination: "Dubai (DXB)",
  departure: "2026-10-15",
  returnDate: "2026-10-22",
  adults: 2,
  children: 1,
};

const INITIAL_FILTERS = {
  minPrice: 0,
  maxPrice: 2000,
  minRating: 0,
  stops: "any",
};

const initialItinerary = {
  flights: [],
  hotels: [],
  departure: "",
  returnDate: "",
  adults: 1,
  children: 0,
};

const tripMetaFields = new Set(["departure", "returnDate", "adults", "children"]);

function tripMetaFromForm(form) {
  return {
    departure: form.departure,
    returnDate: form.returnDate,
    adults: form.adults,
    children: form.children,
  };
}

export function TripProvider({ children }) {
  const [searchForm, setSearchForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState("flights");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sort, setSort] = useState("cheapest");
  const [results, setResults] = useState({ flights: [], hotels: [] });
  const [storedItinerary, setItinerary] = useLocalStorage("myCustomTrip", initialItinerary);
  const itinerary = { ...initialItinerary, ...storedItinerary };

  const matchDestination = (value) => {
    const query = value.trim().toLowerCase();
    return mock.destinations.find(
      (destination) =>
        destination.city.toLowerCase() === query ||
        destination.airportCode.toLowerCase() === query ||
        `${destination.city} (${destination.airportCode})`.toLowerCase() === query,
    );
  };

  const updateForm = (field, value) => {
    setSearchForm((prev) => ({ ...prev, [field]: value }));

    if (tripMetaFields.has(field)) {
      setItinerary((prev) => {
        if ((prev.flights?.length ?? 0) === 0 && (prev.hotels?.length ?? 0) === 0) {
          return prev;
        }
        return { ...prev, [field]: value };
      });
    }

    setFormErrors((prev) => {
      const clearSameCity =
        (field === "origin" || field === "destination") && prev.destination === "Destination must differ from origin";
      if (!prev[field] && !clearSameCity) return prev;
      const next = { ...prev };
      delete next[field];
      if (clearSameCity) delete next.destination;
      return next;
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!searchForm.origin.trim()) errors.origin = "Origin is required";
    if (!searchForm.destination.trim()) errors.destination = "Destination is required";
    if (!searchForm.departure) errors.departure = "Departure date is required";
    if (!searchForm.returnDate) errors.returnDate = "Return date is required";

    if (searchForm.departure && searchForm.returnDate && searchForm.returnDate <= searchForm.departure) {
      errors.returnDate = "Return date must be after departure";
    }

    if (searchForm.adults < 1) errors.adults = "At least 1 adult is required";

    const originMatch = searchForm.origin.trim() ? matchDestination(searchForm.origin) : null;
    const destMatch = searchForm.destination.trim() ? matchDestination(searchForm.destination) : null;

    if (searchForm.origin.trim() && !originMatch) {
      errors.origin = "Select a city from the suggestions";
    }
    if (searchForm.destination.trim() && !destMatch) {
      errors.destination = "Select a city from the suggestions";
    }
    if (originMatch && destMatch && originMatch.airportCode === destMatch.airportCode) {
      errors.destination = "Destination must differ from origin";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const search = () => {
    if (!validateForm()) return;

    setHasSearched(true);

    const originMatch = matchDestination(searchForm.origin);
    const destMatch = matchDestination(searchForm.destination);

    const originCode = originMatch.airportCode.toLowerCase();
    const destCode = destMatch.airportCode.toLowerCase();
    const destCity = destMatch.city.toLowerCase();

    const flights = mock.flights.filter(
      (flight) => flight.origin.toLowerCase() === originCode && flight.destination.toLowerCase() === destCode,
    );

    const hotels = mock.hotels.filter((hotel) => hotel.city.toLowerCase() === destCity);

    setResults({ flights, hotels });
  };

  const addToTrip = (type, item) => {
    setItinerary((prev) => {
      const list = prev[type] ?? [];
      if (list.some((existing) => existing.id === item.id)) return prev;
      return {
        ...prev,
        [type]: [...list, item],
        ...tripMetaFromForm(searchForm),
      };
    });
  };

  const removeFromTrip = (type, id) => {
    setItinerary((prev) => {
      const next = {
        ...prev,
        [type]: (prev[type] ?? []).filter((item) => item.id !== id),
      };
      if ((next.flights?.length ?? 0) > 0 || (next.hotels?.length ?? 0) > 0) {
        return next;
      }
      return { ...initialItinerary };
    });
  };

  const value = {
    destinations: mock.destinations,
    searchForm,
    updateForm,
    formErrors,
    hasSearched,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    clearFilters: () => setFilters(INITIAL_FILTERS),
    sort,
    setSort,
    results,
    itinerary,
    search,
    addToTrip,
    removeFromTrip,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  return useContext(TripContext);
}
