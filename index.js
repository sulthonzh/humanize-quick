/**
 * humanize-quick — Zero-dependency human-readable formatting.
 *
 * Functions: bytes, duration, relativeTime, ordinal, compactNumber,
 *            pluralize, list, percentage, pad
 */

// ─── bytes(n, [opts]) ──────────────────────────────────────────
const BYTE_UNITS_SI = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
const BYTE_UNITS_IEC = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

export function bytes(n, opts = {}) {
  if (typeof n !== "number" || !isFinite(n)) return String(n);
  if (n < 0) return "-" + bytes(-n, opts);
  if (n === 0) return "0 B";
  const base = opts.binary ? 1024 : 1000;
  const decimals = opts.decimals ?? 1;
  const units = opts.binary ? BYTE_UNITS_IEC : BYTE_UNITS_SI;
  let i = Math.min(
    Math.floor(Math.log(n) / Math.log(base)),
    units.length - 1
  );
  let val = n / Math.pow(base, i);
  // Rollover: if value rounds up to >= base, bump to next unit
  if (i < units.length - 1 && Math.round(val) >= base) {
    i++;
    val = n / Math.pow(base, i);
  }
  let fixed = val >= 100 || i === 0 ? String(Math.round(val)) : val.toFixed(decimals);
  fixed = fixed.replace(/\.0$/, '');
  return `${fixed} ${units[i]}`;
}

// ─── duration(ms, [opts]) ──────────────────────────────────────
const DUR_PARTS = [
  ["y", 365 * 24 * 60 * 60 * 1000],
  ["mo", 30 * 24 * 60 * 60 * 1000],
  ["d", 24 * 60 * 60 * 1000],
  ["h", 60 * 60 * 1000],
  ["m", 60 * 1000],
  ["s", 1000],
  ["ms", 1],
];

export function duration(ms, opts = {}) {
  if (typeof ms !== "number" || !isFinite(ms)) return String(ms);
  if (ms < 0) return "-" + duration(-ms, opts);
  if (ms === 0) return "0ms";
  const maxParts = opts.maxParts ?? 2;
  const compact = opts.compact ?? true;
  const parts = [];
  let remaining = ms;
  for (const [label, size] of DUR_PARTS) {
    const count = Math.floor(remaining / size);
    if (count > 0) {
      parts.push(`${count}${label}`);
      remaining -= count * size;
      if (parts.length >= maxParts) break;
    }
  }
  if (parts.length === 0) return "0ms";
  return compact ? parts.join(" ") : parts.join(", ");
}

// ─── relativeTime(date, [opts]) ────────────────────────────────
const RT_THRESHOLDS = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
  ["second", 1000],
];

const RT_IRREGULAR = {
  month: "months",
};

function pluralUnit(value, unit) {
  const plural = RT_IRREGULAR[unit] || unit + "s";
  return value === 1 ? `${value} ${unit}` : `${value} ${plural}`;
}

export function relativeTime(date, opts = {}) {
  const ref = opts.now ? new Date(opts.now) : new Date();
  const target = date instanceof Date ? date : new Date(date);
  const diff = target.getTime() - ref.getTime();
  const absDiff = Math.abs(diff);
  const past = diff < 0;

  if (absDiff < 1000) return "just now";
  if (absDiff < 60 * 1000) return past ? `${Math.floor(absDiff / 1000)} seconds ago` : `in ${Math.floor(absDiff / 1000)} seconds`;

  for (const [unit, size] of RT_THRESHOLDS) {
    if (absDiff >= size || unit === "second") {
      const value = Math.floor(absDiff / size);
      const human = pluralUnit(value, unit);
      return past ? `${human} ago` : `in ${human}`;
    }
  }
  return "just now";
}

// ─── ordinal(n) ────────────────────────────────────────────────
export function ordinal(n) {
  if (typeof n !== "number") n = parseInt(n, 10);
  if (!isFinite(n)) return String(n);
  const abs = Math.abs(n);
  const lastTwo = abs % 100;
  const teen = lastTwo >= 11 && lastTwo <= 13;
  const last = abs % 10;
  const suffix = teen || last > 3 || last === 0 ? "th" : last === 1 ? "st" : last === 2 ? "nd" : "rd";
  return `${n}${suffix}`;
}

// ─── compactNumber(n, [opts]) ──────────────────────────────────
const CN_SYMBOLS = [
  { v: 1e15, s: "Q" },
  { v: 1e12, s: "T" },
  { v: 1e9, s: "B" },
  { v: 1e6, s: "M" },
  { v: 1e3, s: "K" },
];

export function compactNumber(n, opts = {}) {
  if (typeof n !== "number" || !isFinite(n)) return String(n);
  if (n < 0) return "-" + compactNumber(-n, opts);
  const decimals = opts.decimals ?? 1;
  for (const { v, s } of CN_SYMBOLS) {
    if (n >= v) {
      const val = n / v;
      let fixed = val >= 100 ? String(Math.round(val)) : val.toFixed(decimals);
      fixed = fixed.replace(/\.0$/, '');
      return `${fixed}${s}`;
    }
  }
  return String(Math.round(n));
}

// ─── pluralize(n, singular, [plural]) ──────────────────────────
export function pluralize(n, singular, plural) {
  if (typeof n !== "number") n = parseInt(n, 10);
  const word = n === 1 ? singular : plural || singular + "s";
  return `${n} ${word}`;
}

// ─── list(items, [opts]) ───────────────────────────────────────
export function list(items, opts = {}) {
  if (!Array.isArray(items)) return String(items);
  const { conjunction = "and", oxfordComma = true } = opts;
  const n = items.length;
  if (n === 0) return "";
  if (n === 1) return String(items[0]);
  if (n === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  const head = items.slice(0, -1).join(", ");
  const sep = oxfordComma ? `, ${conjunction} ` : ` ${conjunction} `;
  return head + sep + items[n - 1];
}

// ─── percentage(value, total, [opts]) ──────────────────────────
export function percentage(value, total, opts = {}) {
  if (typeof value !== "number" || typeof total !== "number" || !isFinite(value) || !isFinite(total) || total === 0) return "0%";
  const decimals = opts.decimals ?? 1;
  const pct = (value / total) * 100;
  return `${pct.toFixed(decimals)}%`;
}

// ─── pad(n, len, [char]) ───────────────────────────────────────
export function pad(n, len = 2, char = "0") {
  return String(n).padStart(len, char);
}

// ─── truncate(str, len, [suffix]) ──────────────────────────────
export function truncate(str, len, suffix = "…") {
  if (typeof str !== "string") str = String(str);
  if (str.length <= len) return str;
  return str.slice(0, len - suffix.length) + suffix;
}

// ─── throttle string for memory/time ───────────────────────────
export function clock(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60000);
  const s = Math.round((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

export default {
  bytes,
  duration,
  relativeTime,
  ordinal,
  compactNumber,
  pluralize,
  list,
  percentage,
  pad,
  truncate,
  clock,
};
