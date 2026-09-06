import { createContext, useContext, useState } from "react";
import {
  searchFlights,
  searchHotelDestination,
  searchHotels,
} from "../api/skyScrapper";
import { useLocalStorage } from "../hooks/useLocalStorage";

const TripContext = createContext(null);

const initialForm = {
  origin: "",
  destination: "",
  originPlace: null,
  destinationPlace: null,
  departure: "",
  returnDate: "",
  adults: 1,
  children: 0,
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

const tripMetaFields = new Set([
  "departure",
  "returnDate",
  "adults",
  "children",
]);

function tripMetaFromForm(form) {
  return {
    departure: form.departure,
    returnDate: form.returnDate,
    adults: form.adults,
    children: form.children,
  };
}

function placeLabel(place) {
  return (
    place?.presentation?.suggestionTitle ||
    place?.presentation?.title ||
    place?.navigation?.localizedName ||
    ""
  );
}

function flightParams(place) {
  return place?.navigation?.relevantFlightParams ?? {};
}

function hotelParams(place) {
  return place?.navigation?.relevantHotelParams ?? {};
}

function itemId(type, item) {
  return type === "flights" ? item.id : item.hotelId;
}

export function TripProvider({ children }) {
  const [searchForm, setSearchForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [activeTab, setActiveTab] = useState("flights");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sort, setSort] = useState("cheapest");
  const [results, setResults] = useState({ flights: [], hotels: [] });
  const [storedItinerary, setItinerary] = useLocalStorage(
    "myCustomTrip",
    initialItinerary,
  );
  const itinerary = { ...initialItinerary, ...storedItinerary };
  const isSearching = loadingFlights || loadingHotels;

  const updateForm = (field, value) => {
    setSearchForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "origin") next.originPlace = null;
      if (field === "destination") next.destinationPlace = null;
      return next;
    });

    if (tripMetaFields.has(field)) {
      setItinerary((prev) => {
        if (
          (prev.flights?.length ?? 0) === 0 &&
          (prev.hotels?.length ?? 0) === 0
        ) {
          return prev;
        }
        return { ...prev, [field]: value };
      });
    }

    setFormErrors((prev) => {
      const clearSameCity =
        (field === "origin" || field === "destination") &&
        prev.destination === "Destination must differ from origin";
      if (!prev[field] && !clearSameCity) return prev;
      const next = { ...prev };
      delete next[field];
      if (clearSameCity) delete next.destination;
      return next;
    });
  };

  const selectPlace = (field, place) => {
    setSearchForm((prev) => ({
      ...prev,
      [field]: placeLabel(place),
      [`${field}Place`]: place,
    }));
    setFormErrors((prev) => {
      if (!prev[field] && !prev.destination) return prev;
      const next = { ...prev };
      delete next[field];
      delete next.destination;
      return next;
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!searchForm.origin.trim()) errors.origin = "Origin is required";
    if (!searchForm.destination.trim())
      errors.destination = "Destination is required";
    if (!searchForm.departure) errors.departure = "Departure date is required";
    if (!searchForm.returnDate) errors.returnDate = "Return date is required";

    if (
      searchForm.departure &&
      searchForm.returnDate &&
      searchForm.returnDate <= searchForm.departure
    ) {
      errors.returnDate = "Return date must be after departure";
    }

    if (searchForm.adults < 1) errors.adults = "At least 1 adult is required";

    const originPlace = searchForm.originPlace;
    const destPlace = searchForm.destinationPlace;
    const originId = flightParams(originPlace).entityId;
    const destId = flightParams(destPlace).entityId;

    if (searchForm.origin.trim() && !originPlace) {
      errors.origin = "Select a city from the suggestions";
    }
    if (searchForm.destination.trim() && !destPlace) {
      errors.destination = "Select a city from the suggestions";
    }
    if (originId && destId && originId === destId) {
      errors.destination = "Destination must differ from origin";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const search = async () => {
    if (!validateForm()) return;

    const origin = flightParams(searchForm.originPlace);
    const dest = flightParams(searchForm.destinationPlace);
    const destHotel = hotelParams(searchForm.destinationPlace);

    setHasSearched(true);
    setSearchError("");
    setResults({ flights: [], hotels: [] });
    setLoadingFlights(true);
    setLoadingHotels(true);

    const loadFlights = async () => {
      try {
        const itineraries = await searchFlights({
          originSkyId: origin.skyId,
          originEntityId: origin.entityId,
          destinationSkyId: dest.skyId,
          destinationEntityId: dest.entityId,
          date: searchForm.departure,
          returnDate: searchForm.returnDate,
          adults: searchForm.adults,
          children: searchForm.children,
        });
        setResults((prev) => ({ ...prev, flights: itineraries }));
      } catch (error) {
        setSearchError(
          (prev) => prev || error.message || "Flight search failed",
        );
        setResults((prev) => ({ ...prev, flights: [] }));
      } finally {
        setLoadingFlights(false);
      }
    };

    const loadHotels = async () => {
      try {
        const hotelEntityId =
          destHotel.entityId ||
          (
            await searchHotelDestination(
              searchForm.destinationPlace?.presentation?.title ||
                searchForm.destination,
            )
          )?.entityId;

        const hotels = hotelEntityId
          ? await searchHotels({
              entityId: hotelEntityId,
              checkin: searchForm.departure,
              checkout: searchForm.returnDate,
              adults: searchForm.adults,
            })
          : [];

        setResults((prev) => ({ ...prev, hotels }));
      } catch (error) {
        setSearchError(
          (prev) => prev || error.message || "Hotel search failed",
        );
        setResults((prev) => ({ ...prev, hotels: [] }));
      } finally {
        setLoadingHotels(false);
      }
    };

    await Promise.all([loadFlights(), loadHotels()]);
  };

  const addToTrip = (type, item) => {
    const id = itemId(type, item);
    setItinerary((prev) => {
      const list = prev[type] ?? [];
      if (list.some((existing) => itemId(type, existing) === id)) return prev;
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
        [type]: (prev[type] ?? []).filter((item) => itemId(type, item) !== id),
      };
      if ((next.flights?.length ?? 0) > 0 || (next.hotels?.length ?? 0) > 0) {
        return next;
      }
      return { ...initialItinerary };
    });
  };

  const value = {
    searchForm,
    updateForm,
    selectPlace,
    formErrors,
    hasSearched,
    isSearching,
    loadingFlights,
    loadingHotels,
    searchError,
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
