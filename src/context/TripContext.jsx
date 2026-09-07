import { useMemo, useRef, useState } from "react";
import {
  searchAirports,
  searchFlights,
  searchHotelDestination,
  searchHotels,
} from "../api/skyScrapper";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { normalizeFlight, normalizeHotel } from "../utils/normalize";
import { EMPTY_FILTERS } from "../utils/filterSort";
import { addDaysISO, todayISO } from "../utils/format";
import { buildStays } from "../utils/tripPlan";
import { MAX_STOPS, TripContext } from "./trip-context";

let seq = 0;
const nextKey = (prefix) => `${prefix}-${(seq += 1)}`;

function makeStop(overrides = {}) {
  return { key: nextKey("stop"), label: "", place: null, ...overrides };
}

function makeHop(overrides = {}) {
  return { key: nextKey("hop"), departure: "", ...overrides };
}

const initialItinerary = {
  flights: [],
  hotels: [],
  plan: { legs: [], returnDate: "", adults: 1, children: 0 },
};

function flightParams(place) {
  return place?.navigation?.relevantFlightParams ?? {};
}

function hotelParams(place) {
  return place?.navigation?.relevantHotelParams ?? {};
}

function placeLabel(place) {
  return (
    place?.presentation?.title ||
    place?.navigation?.localizedName ||
    place?.presentation?.suggestionTitle ||
    ""
  );
}

function cityName(place) {
  return place?.presentation?.title || place?.navigation?.localizedName || "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function TripProvider({ children }) {
  const [stops, setStops] = useState(() => [makeStop(), makeStop()]);
  const [hops, setHops] = useState(() => [
    makeHop({ departure: addDaysISO(todayISO(), 21) }),
  ]);
  const [tripType, setTripType] = useState("return");
  const [endDate, setEndDate] = useState(addDaysISO(todayISO(), 28));
  const [adults, setAdults] = useState(1);
  const [childCount, setChildCount] = useState(0);

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});

  const [hasSearched, setHasSearched] = useState(false);
  const [editingSearch, setEditingSearch] = useState(false);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [notice, setNotice] = useState(null);
  const [resolving, setResolving] = useState(0);
  const [tripOpen, setTripOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("flights");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState("best");
  const [results, setResults] = useState({ flights: [], hotels: [] });

  const [storedItinerary, setItinerary] = useLocalStorage("myCustomTrip", initialItinerary);
  const noticeTimer = useRef(null);

  const itinerary = useMemo(
    () => ({ ...initialItinerary, ...storedItinerary }),
    [storedItinerary],
  );

  const isSearching = loadingFlights || loadingHotels;

  const legs = useMemo(
    () =>
      stops.slice(0, -1).map((from, index) => {
        const to = stops[index + 1];
        return {
          key: hops[index]?.key ?? `hop-${index}`,
          origin: from.label,
          originPlace: from.place,
          destination: to.label,
          destinationPlace: to.place,
          departure: hops[index]?.departure ?? "",
        };
      }),
    [stops, hops],
  );

  const plainLegs = useMemo(
    () =>
      legs.map((leg) => ({
        origin: cityName(leg.originPlace) || leg.origin,
        destination: cityName(leg.destinationPlace) || leg.destination,
        departure: leg.departure,
      })),
    [legs],
  );

  const isRoundTrip = tripType === "return" && legs.length === 1;

  const stays = useMemo(() => buildStays(plainLegs, endDate), [plainLegs, endDate]);

  const savedStays = useMemo(() => {
    const plan = itinerary.plan;
    if (plan.legs?.length) return buildStays(plan.legs, plan.returnDate);
    return stays;
  }, [itinerary.plan, stays]);

  const flash = (message) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3200);
  };

  const patchStop = (index, patch) => {
    setStops((prev) => prev.map((stop, i) => (i === index ? { ...stop, ...patch } : stop)));
    setErrors({});
  };

  const updateStop = (index, label) => patchStop(index, { label, place: null });

  const selectStop = (index, place) =>
    patchStop(index, { label: placeLabel(place), place });

  const resolveStop = async (index, city) => {
    patchStop(index, { label: city, place: null });
    setResolving((n) => n + 1);

    try {
      const matches = await searchAirports(city);
      const place = matches.find((m) => m.navigation?.entityType === "CITY") ?? matches[0];

      if (place) selectStop(index, place);
      else {
        setErrors((prev) => ({
          ...prev,
          [`stop-${index}`]: `Could not find an airport for ${city}.`,
        }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        [`stop-${index}`]: "Lookup failed. Type the city instead.",
      }));
    } finally {
      setResolving((n) => n - 1);
    }
  };

  const addStop = () => {
    if (stops.length >= MAX_STOPS) return;

    setStops((prev) => [...prev, makeStop()]);
    setHops((prev) => {
      const last = prev[prev.length - 1];
      return [
        ...prev,
        makeHop({ departure: last?.departure ? addDaysISO(last.departure, 3) : "" }),
      ];
    });

    setTripType("oneway");
    setErrors({});
  };

  const removeStop = (index) => {
    setStops((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)));
    setHops((prev) => {
      if (prev.length <= 1) return prev;
      const drop = Math.min(index, prev.length - 1);
      return prev.filter((_, i) => i !== drop);
    });
    setErrors({});
  };

  const setDeparture = (index, date) => {
    setHops((prev) => {
      const next = prev.map((hop, i) => (i === index ? { ...hop, departure: date } : hop));

      return next.map((hop, i) => {
        if (i <= index || !hop.departure || hop.departure > date) return hop;
        return { ...hop, departure: addDaysISO(date, (i - index) * 3) };
      });
    });

    setEndDate((prev) => (prev && prev <= date ? addDaysISO(date, 7) : prev));
    setErrors({});
  };

  const changeEndDate = (date) => {
    setEndDate(date);
    setErrors({});
  };

  const changeTripType = (value) => {
    setTripType(value);
    if (value === "return" && !endDate) {
      const last = hops[hops.length - 1]?.departure;
      setEndDate(addDaysISO(last || todayISO(), 7));
    }
    setErrors({});
  };

  const validateStep = (which) => {
    const found = {};
    const today = todayISO();

    if (which === 0) {
      stops.forEach((stop, i) => {
        if (!stop.label.trim()) {
          found[`stop-${i}`] = i === 0 ? "Choose where you are flying from." : "Choose where you are going.";
        } else if (!stop.place) {
          found[`stop-${i}`] = "Pick a city from the list or the globe.";
        }
      });

      stops.forEach((stop, i) => {
        const previous = stops[i - 1];
        if (!previous) return;
        const a = flightParams(previous.place).entityId;
        const b = flightParams(stop.place).entityId;
        if (a && b && a === b) found[`stop-${i}`] = "This is the same city as the stop before it.";
      });
    }

    if (which === 1) {
      hops.forEach((hop, i) => {
        if (!hop.departure) {
          found[`departure-${i}`] = "Pick a departure date.";
          return;
        }
        if (hop.departure < today) {
          found[`departure-${i}`] = "That date has passed.";
          return;
        }
        const previous = hops[i - 1];
        if (previous?.departure && hop.departure <= previous.departure) {
          found[`departure-${i}`] = "Each hop must leave after the one before it.";
        }
      });

      const lastDeparture = hops[hops.length - 1]?.departure;

      if (isRoundTrip && !endDate) found.endDate = "Pick a date to fly home.";
      else if (endDate && lastDeparture && endDate <= lastDeparture) {
        found.endDate = "The trip must end after the final departure.";
      }
    }

    return found;
  };

  const goToStep = (target) => {
    if (target <= step) {
      setStep(target);
      return;
    }

    for (let i = step; i < target; i += 1) {
      const found = validateStep(i);
      if (Object.keys(found).length > 0) {
        setErrors(found);
        setStep(i);
        return;
      }
    }

    setErrors({});
    setStep(target);
  };

  const search = async () => {
    const all = { ...validateStep(0), ...validateStep(1) };
    if (adults < 1) all.adults = "At least one adult.";
    if (adults + childCount > 9) all.travellers = "Nine travellers maximum per booking.";

    if (Object.keys(all).length > 0) {
      setErrors(all);
      const firstBroken = [0, 1].find((i) => Object.keys(validateStep(i)).length > 0);
      setStep(firstBroken ?? 0);
      return;
    }

    setErrors({});
    setHasSearched(true);
    setEditingSearch(false);
    setSearchError("");
    setResults({ flights: [], hotels: [] });
    setFilters(EMPTY_FILTERS);
    setLoadingFlights(true);
    setLoadingHotels(true);

    const loadFlights = async () => {
      const collected = [];

      for (let i = 0; i < legs.length; i += 1) {
        const leg = legs[i];
        const from = flightParams(leg.originPlace);
        const to = flightParams(leg.destinationPlace);

        try {
          const itineraries = await searchFlights({
            originSkyId: from.skyId,
            originEntityId: from.entityId,
            destinationSkyId: to.skyId,
            destinationEntityId: to.entityId,
            date: leg.departure,
            returnDate: isRoundTrip ? endDate : undefined,
            adults,
            children: childCount,
          });

          collected.push(
            ...itineraries.map((raw) => ({ ...normalizeFlight(raw), legIndex: i })),
          );
        } catch (error) {
          setSearchError((prev) => prev || error.message || "Flight search failed.");
        }

        setResults((prev) => ({ ...prev, flights: [...collected] }));
        if (i < legs.length - 1) await sleep(350);
      }

      setLoadingFlights(false);
    };

    const loadHotels = async () => {
      const collected = [];

      for (let i = 0; i < legs.length; i += 1) {
        const leg = legs[i];
        const stay = stays[i];
        if (!stay || stay.nights === 0) continue;

        try {
          const entityId =
            hotelParams(leg.destinationPlace).entityId ||
            (await searchHotelDestination(cityName(leg.destinationPlace)))?.entityId;

          if (entityId) {
            const hotels = await searchHotels({
              entityId,
              checkin: stay.checkIn,
              checkout: stay.checkOut,
              adults,
            });
            collected.push(
              ...hotels.map((raw) => ({ ...normalizeHotel(raw), legIndex: i })),
            );
          }
        } catch (error) {
          setSearchError((prev) => prev || error.message || "Hotel search failed.");
        }

        setResults((prev) => ({ ...prev, hotels: [...collected] }));
        if (i < legs.length - 1) await sleep(350);
      }

      setLoadingHotels(false);
    };

    await Promise.all([loadFlights(), loadHotels()]);
  };

  const planSnapshot = () => ({
    legs: plainLegs,
    returnDate: endDate,
    adults,
    children: childCount,
  });

  const isSaved = (type, id) => (itinerary[type] ?? []).some((item) => item.id === id);

  const toggleSaved = (type, item) => {
    const alreadyThere = isSaved(type, item.id);

    setItinerary((prev) => {
      const base = { ...initialItinerary, ...prev };
      const list = base[type] ?? [];

      if (alreadyThere) {
        const next = { ...base, [type]: list.filter((x) => x.id !== item.id) };
        const empty = next.flights.length === 0 && next.hotels.length === 0;
        return empty ? { ...initialItinerary } : next;
      }

      return { ...base, [type]: [...list, item], plan: planSnapshot() };
    });

    flash(
      alreadyThere
        ? { tone: "info", text: "Removed from your trip." }
        : {
            tone: "success",
            text:
              type === "flights"
                ? `${item.outbound?.carrierName ?? "Flight"} added to your trip.`
                : `${item.name} added to your trip.`,
          },
    );
  };

  const clearItinerary = () => {
    setItinerary({ ...initialItinerary });
    flash({ tone: "info", text: "Trip cleared." });
  };

  const applyRoute = async (from, to) => {
    setStops([makeStop(), makeStop()]);
    setHops([makeHop({ departure: addDaysISO(todayISO(), 21) })]);
    setStep(0);
    await Promise.all([resolveStop(0, from), resolveStop(1, to)]);
  };

  const value = {
    stops,
    hops,
    legs,
    plainLegs,
    stays,
    savedStays,
    tripType,
    setTripType: changeTripType,
    isRoundTrip,
    endDate,
    setEndDate: changeEndDate,
    adults,
    setAdults,
    childCount,
    setChildCount,
    travellers: adults + childCount,

    step,
    setStep: goToStep,
    errors,

    updateStop,
    selectStop,
    resolveStop,
    addStop,
    removeStop,
    setDeparture,

    resolving: resolving > 0,
    hasSearched,
    editingSearch,
    setEditingSearch,
    isSearching,
    loadingFlights,
    loadingHotels,
    searchError,
    notice,

    activeTab,
    setActiveTab,
    filters,
    setFilters,
    clearFilters: () => setFilters(EMPTY_FILTERS),
    sort,
    setSort,
    results,

    itinerary,
    tripOpen,
    setTripOpen,
    isSaved,
    toggleSaved,
    clearItinerary,
    search,
    applyRoute,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}
