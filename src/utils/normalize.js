function layoversFrom(segments) {
  const stops = [];

  for (let i = 0; i < segments.length - 1; i += 1) {
    const arrive = segments[i];
    const depart = segments[i + 1];
    const minutes = Math.round(
      (new Date(depart.departure) - new Date(arrive.arrival)) / 60000,
    );

    stops.push({
      code: arrive.destination?.displayCode ?? "",
      city: arrive.destination?.parent?.name ?? arrive.destination?.name ?? "",
      minutes: Number.isFinite(minutes) ? minutes : 0,
    });
  }

  return stops;
}

function normalizeLeg(leg) {
  const carriers = leg.carriers?.marketing ?? [];
  const segments = leg.segments ?? [];
  const first = segments[0];

  return {
    id: leg.id,
    originCode: leg.origin?.displayCode ?? "",
    originCity:
      leg.origin?.city ?? leg.origin?.parent?.name ?? leg.origin?.name ?? "",
    destinationCode: leg.destination?.displayCode ?? "",
    destinationCity:
      leg.destination?.city ??
      leg.destination?.parent?.name ??
      leg.destination?.name ??
      "",
    departure: leg.departure ?? "",
    arrival: leg.arrival ?? "",
    durationMinutes: Number(leg.durationInMinutes) || 0,
    stops: Number(leg.stopCount) || 0,
    carrierName: carriers[0]?.name ?? "Multiple airlines",
    carrierLogo: carriers[0]?.logoUrl ?? "",
    carrierNames: carriers.map((c) => c.name).filter(Boolean),
    flightCode: first
      ? `${first.marketingCarrier?.displayCode ?? ""}${first.flightNumber ?? ""}`.trim()
      : "",
    layovers: layoversFrom(segments),
  };
}

export function normalizeFlight(raw) {
  const legs = (raw.legs ?? []).map(normalizeLeg);
  const fare = raw.farePolicy ?? {};

  return {
    id: raw.id,
    kind: "flight",
    price: Number(raw.price?.raw) || 0,
    priceLabel: raw.price?.formatted ?? "",
    score: Number(raw.score) || 0,
    tags: raw.tags ?? [],
    ecoDelta: Number(raw.eco?.ecoContenderDelta) || 0,
    isSelfTransfer: Boolean(raw.isSelfTransfer),
    refundable: Boolean(fare.isCancellationAllowed || fare.isPartiallyRefundable),
    changeable: Boolean(fare.isChangeAllowed || fare.isPartiallyChangeable),
    legs,
    outbound: legs[0] ?? null,
    inbound: legs[1] ?? null,
    isRoundTrip: legs.length > 1,
    durationMinutes: legs.reduce((sum, leg) => sum + leg.durationMinutes, 0),
    stops: legs[0]?.stops ?? 0,
    airlines: [...new Set(legs.flatMap((leg) => leg.carrierNames))],
  };
}

export function normalizeHotel(raw) {
  const images = (raw.images?.length ? raw.images : [raw.heroImage]).filter(Boolean);

  return {
    id: String(raw.hotelId),
    kind: "hotel",
    name: raw.name ?? "Unnamed property",
    images,
    stars: Number(raw.stars) || 0,
    score: Number(raw.rating?.value) || 0,
    scoreLabel: raw.rating?.description ?? "",
    reviewCount: Number(raw.reviewSummary?.count ?? raw.rating?.count) || 0,
    reviewCountLabel:
      raw.reviewSummary?.formatCount ??
      String(raw.reviewSummary?.count ?? raw.rating?.count ?? ""),
    perNight: Number(raw.rawPrice) || 0,
    perNightLabel: raw.price ?? "",
    stayTotalLabel: raw.priceDescription ?? "",
    taxNote: raw.taxPolicy ?? "",
    discount: raw.cug?.discount ?? null,
    listPrice: raw.cug?.priceWithoutDiscount ?? null,
    features: (raw.rateFeatures ?? []).map((f) => f.text).filter(Boolean),
    distance: raw.distance ?? "",
  };
}
