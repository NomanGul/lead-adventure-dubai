export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatMoney(amount) {
  const value = Math.round(Number(amount) || 0);
  return `$${value.toLocaleString("en-US")}`;
}

// The API returns naive local timestamps ("2026-10-03T03:05:00"). Reading the
// clock straight off the string avoids shifting times into the viewer's zone.
export function formatTime(iso) {
  const match = /T(\d{2}):(\d{2})/.exec(iso ?? "");
  if (!match) return "--:--";

  const hours = Number(match[1]);
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${match[2]} ${hours < 12 ? "AM" : "PM"}`;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "");
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function formatDate(value) {
  const date = parseISODate(value);
  if (!date) return "";
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatDateLong(value) {
  const date = parseISODate(value);
  if (!date) return "";
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatRange(from, to) {
  if (!from) return "Dates not set";
  if (!to) return formatDate(from);
  return `${formatDate(from)} – ${formatDate(to)}`;
}

export function pluralise(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function addDaysISO(value, days) {
  const date = parseISODate(value) ?? new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function nightsBetween(from, to) {
  const a = parseISODate(from);
  const b = parseISODate(to);
  if (!a || !b) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
}
