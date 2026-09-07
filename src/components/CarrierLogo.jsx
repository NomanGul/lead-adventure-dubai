import { useState } from "react";

export function CarrierLogo({ src, name, size = 36 }) {
  const [loaded, setLoaded] = useState(false);
  const initials = (name ?? "?").slice(0, 2).toUpperCase();

  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-lg bg-canvas text-xs font-bold text-muted"
    >
      {loaded ? null : initials}

      {src ? (
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 size-full object-contain ${loaded ? "" : "opacity-0"}`}
        />
      ) : null}
    </span>
  );
}
