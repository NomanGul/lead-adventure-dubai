const ACTIVITY_CATALOG = [
  {
    title: "Desert Safari",
    category: "Adventure",
    image:
      "https://images.unsplash.com/photo-1788714300675-543545418003?w=800&q=80",
    tags: ["Pickup included", "BBQ dinner", "Photo stop"],
    durations: [240, 300, 360],
  },
  {
    title: "Dune Buggy Adventure",
    category: "Adventure",
    image:
      "https://images.unsplash.com/photo-1519021228607-ef6e4c22d821?w=800&q=80",
    tags: ["Pickup included", "Small group", "Photo stop"],
    durations: [60, 90, 120],
  },
  {
    title: "Camel Ride at Sunset",
    category: "Adventure",
    image:
      "https://images.unsplash.com/photo-1709620220232-12ecd7ca33a8?w=800&q=80",
    tags: ["Hotel transfer", "Photo stop", "Sunrise start"],
    durations: [60, 90, 120],
  },
  {
    title: "Hot Air Balloon Ride",
    category: "Adventure",
    image:
      "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=800&q=80",
    tags: ["Hotel transfer", "Sunrise start", "Photo stop"],
    durations: [180, 240, 300],
  },
  {
    title: "Quad Bike Tour",
    category: "Adventure",
    image:
      "https://images.unsplash.com/photo-1769450290445-3daed0c8fe63?w=800&q=80",
    tags: ["Pickup included", "Small group"],
    durations: [60, 90, 120],
  },
  {
    title: "Helicopter Tour",
    category: "Adventure",
    image:
      "https://images.unsplash.com/photo-1568518988484-a4cd9667bd80?w=800&q=80",
    tags: ["Skip the line", "Photo stop", "Private option"],
    durations: [30, 45, 60],
  },
  {
    title: "Wildlife Safari",
    category: "Adventure",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
    tags: ["Pickup included", "Live guide", "Family friendly"],
    durations: [180, 240, 300],
  },
  {
    title: "City Walking Tour",
    category: "Culture",
    image:
      "https://images.unsplash.com/photo-1757955431527-23c8d9b03359?w=800&q=80",
    tags: ["Live guide", "Small group", "Photo stop"],
    durations: [120, 150, 180],
  },
  {
    title: "Museum Pass",
    category: "Culture",
    image:
      "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&q=80",
    tags: ["Skip the line", "Family friendly"],
    durations: [120, 180, 240],
  },
  {
    title: "Old Town Heritage Walk",
    category: "Culture",
    image:
      "https://images.unsplash.com/photo-1758980857258-e3323148e194?w=800&q=80",
    tags: ["Live guide", "Small group", "Photo stop"],
    durations: [120, 150, 180],
  },
  {
    title: "Street Art Bike Tour",
    category: "Culture",
    image:
      "https://images.unsplash.com/photo-1601913463731-cfba9fd31ed3?w=800&q=80",
    tags: ["Small group", "Live guide", "Photo stop"],
    durations: [120, 150, 180],
  },
  {
    title: "Skyline Observation Deck",
    category: "Culture",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    tags: ["Skip the line", "Photo stop", "Family friendly"],
    durations: [60, 90, 120],
  },
  {
    title: "Food Tasting Walk",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1758369908837-38166bca7e1e?w=800&q=80",
    tags: ["Small group", "Live guide"],
    durations: [150, 180, 210],
  },
  {
    title: "Dhow Cruise Dinner",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1642874840401-49d3f8095584?w=800&q=80",
    tags: ["Hotel transfer", "BBQ dinner", "Live guide"],
    durations: [120, 150, 180],
  },
  {
    title: "Night Market Hop",
    category: "Nightlife",
    image:
      "https://images.unsplash.com/photo-1616658589225-aa7e64e59c13?w=800&q=80",
    tags: ["Live guide", "Small group"],
    durations: [120, 150, 180],
  },
  {
    title: "Yacht Sunset Cruise",
    category: "Nightlife",
    image:
      "https://images.unsplash.com/photo-1674606867042-2aa3581c1bb5?w=800&q=80",
    tags: ["Private option", "Hotel transfer", "Photo stop"],
    durations: [120, 150, 180],
  },
  {
    title: "Snorkeling Excursion",
    category: "Water",
    image:
      "https://images.unsplash.com/photo-1664922114319-4700c0ef74b1?w=800&q=80",
    tags: ["Pickup included", "Small group", "Family friendly"],
    durations: [180, 240, 300],
  },
  {
    title: "Jet Ski Experience",
    category: "Water",
    image:
      "https://images.unsplash.com/photo-1688219039942-5f4bc1462664?w=800&q=80",
    tags: ["Photo stop", "Private option"],
    durations: [30, 45, 60],
  },
  {
    title: "Spa & Hammam Escape",
    category: "Culture",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
    tags: ["Private option", "Hotel transfer"],
    durations: [90, 120, 150],
  },
  {
    title: "Theme Park Day Pass",
    category: "Family",
    image:
      "https://images.unsplash.com/photo-1505731110654-99d7f7f8e39c?w=800&q=80",
    tags: ["Family friendly", "Skip the line"],
    durations: [360, 420, 480],
  },
];

const SCORE_LABELS = [
  [9.2, "Excellent"],
  [8.5, "Very good"],
  [7.8, "Good"],
  [7.0, "Pleasant"],
];

function hashSeed(city, legIndex = 0) {
  const input = `${String(city).toLowerCase().trim()}::${legIndex}`;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function shuffle(rng, list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickUnique(rng, list, count) {
  return shuffle(rng, list).slice(0, Math.min(count, list.length));
}

function scoreLabel(score) {
  for (const [min, label] of SCORE_LABELS) {
    if (score >= min) return label;
  }
  return "Okay";
}

function formatReviewCount(count) {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(count);
}

function priceFor(rng, category) {
  const ranges = {
    Adventure: [80, 320],
    Culture: [40, 160],
    Food: [55, 180],
    Water: [70, 250],
    Nightlife: [90, 280],
    Family: [50, 220],
  };
  const [min, max] = ranges[category] ?? [35, 200];
  return Math.round(min + rng() * (max - min));
}

function generateActivity(rng, { city, index, legIndex = 0, template }) {
  const entry = template ?? pick(rng, ACTIVITY_CATALOG);
  const durationMinutes = pick(rng, entry.durations);
  const price = priceFor(rng, entry.category);
  const score = Math.round((7 + rng() * 2.8) * 10) / 10;
  const reviewCount = Math.floor(40 + rng() * 12000);
  const freeCancellation = rng() > 0.35;
  const tags = pickUnique(
    rng,
    entry.tags,
    1 + Math.floor(rng() * Math.min(3, entry.tags.length)),
  );
  const slug =
    city
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "city";

  return {
    id: `act-${slug}-l${legIndex}-${index}`,
    kind: "activity",
    name: `${entry.title} in ${city}`,
    city,
    category: entry.category,
    price,
    durationMinutes,
    score,
    scoreLabel: scoreLabel(score),
    reviewCount,
    reviewCountLabel: formatReviewCount(reviewCount),
    image: entry.image,
    freeCancellation,
    features: freeCancellation ? ["Free cancellation", ...tags] : tags,
  };
}

export function generateActivities({
  city,
  count = 24,
  seed,
  legIndex = 0,
} = {}) {
  const place = String(city ?? "").trim() || "Your stop";
  const rng = mulberry32(seed ?? hashSeed(place, legIndex));
  const order = shuffle(rng, ACTIVITY_CATALOG);

  return Array.from({ length: count }, (_, index) =>
    generateActivity(rng, {
      city: place,
      index,
      legIndex,
      template: order[index % order.length],
    }),
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function searchActivities({
  city,
  legIndex = 0,
  limit = 24,
} = {}) {
  await sleep(280 + Math.floor(Math.random() * 220));
  return generateActivities({ city, count: limit, legIndex });
}
