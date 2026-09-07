import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  geoDistance,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
} from "d3-geo";
import {
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
} from "@phosphor-icons/react";
import { feature } from "topojson-client";
import landTopology from "world-atlas/land-110m.json";
import { DESTINATIONS } from "../data/world";

const SIZE = 400;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 184;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const LABEL_WIDTH = 440;

const LAND = feature(landTopology, landTopology.objects.land);
const GRATICULE = geoGraticule10();
const SPHERE = { type: "Sphere" };

function shortestLonDelta(from, to) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const clampZoom = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

export function Globe({ route = [], onPickCity, hint }) {
  const [center, setCenter] = useState({ lat: 22, lon: 50 });
  const [zoom, setZoom] = useState(1);
  const [hovered, setHovered] = useState(null);
  const [progress, setProgress] = useState(0);
  const [onScreen, setOnScreen] = useState(true);
  const [width, setWidth] = useState(0);
  const [focused, setFocused] = useState(false);

  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const targetRef = useRef(null);
  const routeRef = useRef(route);
  const centerRef = useRef(center);
  const zoomRef = useRef(zoom);

  useLayoutEffect(() => {
    routeRef.current = route;
    centerRef.current = center;
    zoomRef.current = zoom;
  });

  const routeKey = route.map((s) => `${s.lat},${s.lon}`).join("|");

  useEffect(() => {
    const stops = routeRef.current;
    if (stops.length === 0) return;

    const focus =
      stops.length === 1
        ? [stops[0].lon, stops[0].lat]
        : geoInterpolate(
            [stops[stops.length - 2].lon, stops[stops.length - 2].lat],
            [stops[stops.length - 1].lon, stops[stops.length - 1].lat],
          )(0.5);

    if (prefersReducedMotion()) {
      setCenter({ lat: focus[1], lon: focus[0] });
      return;
    }

    targetRef.current = { lat: focus[1], lon: focus[0] };
  }, [routeKey]);

  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;

    const resize = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    resize.observe(node);
    setWidth(node.getBoundingClientRect().width);

    const visible = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.05 },
    );
    visible.observe(node);

    return () => {
      resize.disconnect();
      visible.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!onScreen) return;

    const reduced = prefersReducedMotion();
    let frame;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(now - last, 64);
      last = now;

      const target = targetRef.current;

      if (target) {
        const from = centerRef.current;
        const step = Math.min(1, dt / 520) * 2.2;
        const nextLat = from.lat + (target.lat - from.lat) * step;
        const nextLon =
          from.lon + shortestLonDelta(from.lon, target.lon) * step;
        const settled =
          Math.abs(target.lat - nextLat) < 0.35 &&
          Math.abs(shortestLonDelta(nextLon, target.lon)) < 0.35;

        if (settled) {
          targetRef.current = null;
          setCenter({ lat: target.lat, lon: target.lon });
        } else {
          setCenter({ lat: nextLat, lon: nextLon });
        }
      } else if (route.length === 0 && !dragRef.current && !reduced) {
        setCenter((c) => ({ lat: c.lat, lon: c.lon + dt * 0.004 }));
      }

      if (!reduced && route.length > 1) {
        setProgress((p) => (p + dt / 3400) % 1);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [route.length, onScreen]);

  const projection = geoOrthographic()
    .translate([CX, CY])
    .scale(R * zoom)
    .rotate([-center.lon, -center.lat]);

  const path = geoPath(projection);

  const landPath = path(LAND);
  const graticulePath = path(GRATICULE);
  const spherePath = path(SPHERE);

  const visibleCities = (() => {
    const chosen = new Map(route.map((stop, index) => [stop.city, index]));

    return DESTINATIONS.flatMap((dest) => {
      const angle = geoDistance([dest.lon, dest.lat], [center.lon, center.lat]);
      if (angle > Math.PI / 2 - 0.03) return [];

      const [x, y] = projection([dest.lon, dest.lat]);
      if (x < 6 || x > SIZE - 6 || y < 6 || y > SIZE - 6) return [];

      return [{ dest, x, y, angle, order: chosen.get(dest.city) }];
    });
  })();

  const cityDots = visibleCities
    .filter((c) => c.order === undefined && c.dest.city !== hovered?.dest.city)
    .map((c) => `M${c.x.toFixed(1)} ${c.y.toFixed(1)}l0 0`)
    .join("");

  const arcs = route.slice(0, -1).map((from, i) => {
    const to = route[i + 1];
    return {
      key: `${from.city}-${to.city}-${i}`,
      d: path({
        type: "LineString",
        coordinates: [
          [from.lon, from.lat],
          [to.lon, to.lat],
        ],
      }),
      from: [from.lon, from.lat],
      to: [to.lon, to.lat],
    };
  });

  const planeDot = (() => {
    if (arcs.length === 0) return null;

    const arc = arcs[arcs.length - 1];
    const point = geoInterpolate(arc.from, arc.to)(progress);
    if (geoDistance(point, [center.lon, center.lat]) > Math.PI / 2) return null;

    const [x, y] = projection(point);
    return { x, y };
  })();

  const toDisc = (event) => {
    const rect = svgRef.current.getBoundingClientRect();
    const scale = SIZE / rect.width;
    return {
      x: (event.clientX - rect.left) * scale,
      y: (event.clientY - rect.top) * scale,
    };
  };

  const cityAt = (point) => {
    let best = null;
    let bestDist = Math.max(13, (24 * SIZE) / (width || SIZE));

    for (const city of visibleCities) {
      const dist = Math.hypot(city.x - point.x, city.y - point.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = city;
      }
    }

    return best;
  };

  const onPointerDown = (event) => {
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      center: centerRef.current,
      moved: false,
      city: cityAt(toDisc(event)),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag) {
      setHovered(cityAt(toDisc(event)));
      return;
    }

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;

    const perPixel =
      108 / (svgRef.current.getBoundingClientRect().width * zoomRef.current);

    targetRef.current = null;
    setCenter({
      lat: Math.max(-82, Math.min(82, drag.center.lat + dy * perPixel)),
      lon: drag.center.lon - dx * perPixel,
    });
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag && !drag.moved && drag.city) onPickCity?.(drag.city.dest);
  };

  const onWheel = (event) => {
    if (event.ctrlKey) return;
    event.preventDefault();
    setZoom((z) => clampZoom(z * (event.deltaY > 0 ? 0.9 : 1.1)));
  };

  const onKeyDown = (event) => {
    const nudge = {
      ArrowLeft: [0, -12],
      ArrowRight: [0, 12],
      ArrowUp: [10, 0],
      ArrowDown: [-10, 0],
    };

    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setZoom((z) => clampZoom(z * 1.25));
      return;
    }
    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      setZoom((z) => clampZoom(z / 1.25));
      return;
    }

    const delta = nudge[event.key];
    if (!delta) return;

    event.preventDefault();
    targetRef.current = null;
    setCenter((c) => ({
      lat: Math.max(-82, Math.min(82, c.lat + delta[0])),
      lon: c.lon + delta[1],
    }));
  };

  const chosen = visibleCities.filter((c) => c.order !== undefined);

  const labels = (() => {
    const shown = [...chosen];
    const taken = new Set(shown.map((c) => c.dest.city));

    if (hovered && !taken.has(hovered.dest.city)) {
      shown.push(hovered);
      taken.add(hovered.dest.city);
    }

    if (width >= LABEL_WIDTH) {
      const perUnit = width / SIZE;
      const gapX = 66 / perUnit;
      const gapY = 16 / perUnit;
      const clear = (candidate) =>
        shown.every((other) => {
          const band = other.quiet === undefined ? gapY * 2.4 : gapY;
          return (
            Math.abs(other.x - candidate.x) > gapX ||
            Math.abs(other.y - candidate.y) > band
          );
        });

      const budget = zoom > 1.4 ? 8 : 5;
      let room = budget;

      for (const city of [...visibleCities].sort((a, b) => a.angle - b.angle)) {
        if (room === 0) break;
        if (taken.has(city.dest.city) || !clear(city)) continue;
        shown.push({ ...city, quiet: true });
        taken.add(city.dest.city);
        room -= 1;
      }
    }

    return shown;
  })();

  const zoomButton =
    "grid size-8 place-items-center rounded-lg border border-white/15 bg-ink/60 text-white/80 backdrop-blur transition hover:border-white/35 hover:text-white disabled:opacity-30";

  return (
    <div className="relative select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full touch-none outline-none"
        role="application"
        aria-label="Interactive globe. Drag to spin, use arrow keys to rotate, plus and minus to zoom, or click a city to choose it."
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => setHovered(null)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        style={{ cursor: hovered ? "pointer" : "grab" }}
      >
        <defs>
          <radialGradient id="ocean" cx="35%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#1d4a58" />
            <stop offset="52%" stopColor="#0e2d39" />
            <stop offset="100%" stopColor="#04141c" />
          </radialGradient>
          <radialGradient id="halo" cx="50%" cy="50%" r="50%">
            <stop offset="74%" stopColor="#7cc9c2" stopOpacity="0" />
            <stop offset="93%" stopColor="#8fd6cd" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#8fd6cd" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="limb" cx="38%" cy="30%" r="72%">
            <stop offset="60%" stopColor="#04141c" stopOpacity="0" />
            <stop offset="100%" stopColor="#04141c" stopOpacity="0.62" />
          </radialGradient>
        </defs>

        <circle cx={CX} cy={CY} r={R * zoom + 16} fill="url(#halo)" />
        <path d={spherePath} fill="url(#ocean)" />

        <path
          d={graticulePath}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.07"
          strokeWidth="0.6"
        />

        <path
          d={landPath}
          fill="#2f8b83"
          fillOpacity="0.95"
          stroke="#7fd6c8"
          strokeWidth="0.5"
        />

        {arcs.map((arc) => (
          <g key={arc.key}>
            <path
              d={arc.d}
              fill="none"
              stroke="#f5b544"
              strokeOpacity="0.3"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <path
              d={arc.d}
              fill="none"
              stroke="#f9c76c"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
          </g>
        ))}

        {planeDot ? (
          <circle
            cx={planeDot.x}
            cy={planeDot.y}
            r="3.4"
            fill="#fff6e6"
            stroke="#f5b544"
            strokeWidth="1.2"
          />
        ) : null}

        <path
          d={spherePath}
          fill="url(#limb)"
          className="pointer-events-none"
        />
        <path
          d={spherePath}
          fill="none"
          stroke="#8fd6cd"
          strokeOpacity={focused ? 0.9 : 0.32}
          strokeWidth={focused ? 2.5 : 1}
        />

        <path
          d={cityDots}
          stroke="#e8f6f4"
          strokeOpacity="0.62"
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />

        {chosen.map((c) => (
          <g key={c.dest.city} className="pointer-events-none">
            <circle cx={c.x} cy={c.y} r="9" fill="#f5b544" fillOpacity="0.22" />
            <circle
              cx={c.x}
              cy={c.y}
              r="4.5"
              fill="#fff"
              stroke="#f5b544"
              strokeWidth="2"
            />
          </g>
        ))}

        {hovered && hovered.order === undefined ? (
          <circle
            cx={hovered.x}
            cy={hovered.y}
            r="5"
            fill="#fff"
            className="pointer-events-none"
          />
        ) : null}
      </svg>

      {labels.map((label) => (
        <div
          key={label.dest.city}
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(label.x / SIZE) * 100}%`,
            top: `${((label.y - 13) / SIZE) * 100}%`,
          }}
        >
          {label.quiet ? (
            <span className="block text-[10px] font-medium whitespace-nowrap text-white/55">
              {label.dest.city}
            </span>
          ) : (
            <span
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap shadow-lg ${
                label.order !== undefined
                  ? "bg-white text-ink"
                  : "bg-ink/90 text-white"
              }`}
            >
              {label.order !== undefined ? (
                <span className="grid size-4 place-items-center rounded-full bg-ink text-[10px] font-bold text-white">
                  {label.order + 1}
                </span>
              ) : null}
              {label.dest.city}
              <span
                className={`font-mono text-[10px] font-normal ${
                  label.order !== undefined ? "text-muted" : "text-white/60"
                }`}
              >
                {label.dest.iata}
              </span>
            </span>
          )}
        </div>
      ))}

      <div className="absolute right-2 bottom-2 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setZoom((z) => clampZoom(z * 1.25))}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className={zoomButton}
        >
          <MagnifyingGlassPlus size={16} weight="bold" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => clampZoom(z / 1.25))}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className={zoomButton}
        >
          <MagnifyingGlassMinus size={16} weight="bold" aria-hidden />
        </button>
      </div>

      {hint ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-white/60">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
