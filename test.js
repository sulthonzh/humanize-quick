import assert from "node:assert/strict";
import {
  bytes, duration, relativeTime, ordinal, compactNumber,
  pluralize, list, percentage, pad, truncate, clock,
} from "./index.js";

let passed = 0;
const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

// ── bytes ──────────────────────────────────────
test("bytes: 0", () => assert.equal(bytes(0), "0 B"));
test("bytes: 500", () => assert.equal(bytes(500), "500 B"));
test("bytes: 1000 → 1 KB", () => assert.equal(bytes(1000), "1 KB"));
test("bytes: 1500 → 1.5 KB", () => assert.equal(bytes(1500), "1.5 KB"));
test("bytes: 1048576 → 1 MB", () => assert.equal(bytes(1048576), "1 MB"));
test("bytes: binary mode uses IEC units", () => assert.equal(bytes(1024, { binary: true }), "1 KiB"));
test("bytes: negative", () => assert.equal(bytes(-1500), "-1.5 KB"));
test("bytes: large number", () => assert.equal(bytes(1e12), "1 TB"));
test("bytes: decimals=2", () => assert.equal(bytes(1234, { decimals: 2 }), "1.23 KB"));
test("bytes: rollover 999500 → ~1 MB", () => assert.equal(bytes(999500), "1 MB"));

// ── duration ───────────────────────────────────
test("duration: 0ms", () => assert.equal(duration(0), "0ms"));
test("duration: 500ms", () => assert.equal(duration(500), "500ms"));
test("duration: 1000ms → 1s", () => assert.equal(duration(1000), "1s"));
test("duration: 65000ms → 1m 5s", () => assert.equal(duration(65000), "1m 5s"));
test("duration: 3661000ms → 1h 1m", () => assert.equal(duration(3661000), "1h 1m"));
test("duration: 90061000ms → 1d 1h", () => assert.equal(duration(90061000), "1d 1h"));
test("duration: maxParts=3", () => assert.equal(duration(90061000, { maxParts: 3 }), "1d 1h 1m"));
test("duration: negative", () => assert.equal(duration(-65000), "-1m 5s"));
test("duration: full week", () => assert.equal(duration(7 * 24 * 60 * 60 * 1000, { maxParts: 1 }), "7d"));
test("duration: non-compact mode", () => assert.equal(duration(65000, { compact: false }), "1m, 5s"));

// ── relativeTime ───────────────────────────────
const NOW = new Date("2026-06-14T01:47:00Z").getTime();

test("relativeTime: 0 diff → just now", () => {
  assert.equal(relativeTime(new Date(NOW), { now: NOW }), "just now");
});
test("relativeTime: 5 seconds ago", () => {
  assert.equal(relativeTime(new Date(NOW - 5000), { now: NOW }), "5 seconds ago");
});
test("relativeTime: 5 minutes ago", () => {
  assert.equal(relativeTime(new Date(NOW - 5 * 60 * 1000), { now: NOW }), "5 minutes ago");
});
test("relativeTime: 1 minute ago", () => {
  assert.equal(relativeTime(new Date(NOW - 60 * 1000), { now: NOW }), "1 minute ago");
});
test("relativeTime: 3 hours ago", () => {
  assert.equal(relativeTime(new Date(NOW - 3 * 60 * 60 * 1000), { now: NOW }), "3 hours ago");
});
test("relativeTime: 1 hour ago", () => {
  assert.equal(relativeTime(new Date(NOW - 60 * 60 * 1000), { now: NOW }), "1 hour ago");
});
test("relativeTime: 2 days ago", () => {
  assert.equal(relativeTime(new Date(NOW - 2 * 24 * 60 * 60 * 1000), { now: NOW }), "2 days ago");
});
test("relativeTime: 1 day ago", () => {
  assert.equal(relativeTime(new Date(NOW - 24 * 60 * 60 * 1000), { now: NOW }), "1 day ago");
});
test("relativeTime: in 5 minutes", () => {
  assert.equal(relativeTime(new Date(NOW + 5 * 60 * 1000), { now: NOW }), "in 5 minutes");
});
test("relativeTime: in 1 month", () => {
  assert.equal(relativeTime(new Date(NOW + 30 * 24 * 60 * 60 * 1000), { now: NOW }), "in 1 month");
});
test("relativeTime: 2 months ago", () => {
  assert.equal(relativeTime(new Date(NOW - 60 * 24 * 60 * 60 * 1000), { now: NOW }), "2 months ago");
});
test("relativeTime: 1 year ago", () => {
  assert.equal(relativeTime(new Date(NOW - 365 * 24 * 60 * 60 * 1000), { now: NOW }), "1 year ago");
});

// ── ordinal ────────────────────────────────────
test("ordinal: 1st", () => assert.equal(ordinal(1), "1st"));
test("ordinal: 2nd", () => assert.equal(ordinal(2), "2nd"));
test("ordinal: 3rd", () => assert.equal(ordinal(3), "3rd"));
test("ordinal: 4th", () => assert.equal(ordinal(4), "4th"));
test("ordinal: 11th", () => assert.equal(ordinal(11), "11th"));
test("ordinal: 12th", () => assert.equal(ordinal(12), "12th"));
test("ordinal: 13th", () => assert.equal(ordinal(13), "13th"));
test("ordinal: 21st", () => assert.equal(ordinal(21), "21st"));
test("ordinal: 22nd", () => assert.equal(ordinal(22), "22nd"));
test("ordinal: 23rd", () => assert.equal(ordinal(23), "23rd"));
test("ordinal: 101st", () => assert.equal(ordinal(101), "101st"));
test("ordinal: 111th", () => assert.equal(ordinal(111), "111th"));
test("ordinal: negative", () => assert.equal(ordinal(-2), "-2nd"));

// ── compactNumber ──────────────────────────────
test("compactNumber: 999", () => assert.equal(compactNumber(999), "999"));
test("compactNumber: 1000 → 1K", () => assert.equal(compactNumber(1000), "1K"));
test("compactNumber: 1500 → 1.5K", () => assert.equal(compactNumber(1500), "1.5K"));
test("compactNumber: 1e6 → 1M", () => assert.equal(compactNumber(1e6), "1M"));
test("compactNumber: 2500000 → 2.5M", () => assert.equal(compactNumber(2500000), "2.5M"));
test("compactNumber: 1e9 → 1B", () => assert.equal(compactNumber(1e9), "1B"));
test("compactNumber: 1e12 → 1T", () => assert.equal(compactNumber(1e12), "1T"));
test("compactNumber: negative", () => assert.equal(compactNumber(-1500), "-1.5K"));
test("compactNumber: decimals=2", () => assert.equal(compactNumber(1234, { decimals: 2 }), "1.23K"));

// ── pluralize ──────────────────────────────────
test("pluralize: 1 cat", () => assert.equal(pluralize(1, "cat"), "1 cat"));
test("pluralize: 2 cats", () => assert.equal(pluralize(2, "cat"), "2 cats"));
test("pluralize: 0 cats", () => assert.equal(pluralize(0, "cat"), "0 cats"));
test("pluralize: custom plural", () => assert.equal(pluralize(2, "person", "people"), "2 people"));
test("pluralize: 1 child/children", () => assert.equal(pluralize(1, "child", "children"), "1 child"));

// ── list ───────────────────────────────────────
test("list: empty", () => assert.equal(list([]), ""));
test("list: one", () => assert.equal(list(["apple"]), "apple"));
test("list: two", () => assert.equal(list(["apple", "banana"]), "apple and banana"));
test("list: three with oxford comma", () => assert.equal(list(["a", "b", "c"]), "a, b, and c"));
test("list: three without oxford comma", () => assert.equal(list(["a", "b", "c"], { oxfordComma: false }), "a, b and c"));
test("list: custom conjunction", () => assert.equal(list(["a", "b", "c"], { conjunction: "or" }), "a, b, or c"));

// ── percentage ─────────────────────────────────
test("percentage: 50/100", () => assert.equal(percentage(50, 100), "50.0%"));
test("percentage: 1/3", () => assert.equal(percentage(1, 3), "33.3%"));
test("percentage: 0 total", () => assert.equal(percentage(5, 0), "0%"));
test("percentage: 2/3 decimals=2", () => assert.equal(percentage(2, 3, { decimals: 2 }), "66.67%"));

// ── pad ────────────────────────────────────────
test("pad: 7 len 2", () => assert.equal(pad(7), "07"));
test("pad: 7 len 3", () => assert.equal(pad(7, 3), "007"));
test("pad: 100 len 2", () => assert.equal(pad(100), "100"));
test("pad: custom char", () => assert.equal(pad(5, 4, "*"), "***5"));

// ── truncate ───────────────────────────────────
test("truncate: short enough", () => assert.equal(truncate("hello", 10), "hello"));
test("truncate: too long", () => assert.equal(truncate("hello world", 8), "hello w…"));
test("truncate: custom suffix", () => assert.equal(truncate("hello world", 8, "..."), "hello..."));

// ── clock ──────────────────────────────────────
test("clock: 500ms", () => assert.equal(clock(500), "500ms"));
test("clock: 1500ms", () => assert.equal(clock(1500), "1.5s"));
test("clock: 65000ms", () => assert.equal(clock(65000), "1m 5s"));
test("clock: 3700000ms", () => assert.equal(clock(3700000), "61m 40s"));

// ── bytes: extra coverage ──────────────────────
test("bytes: binary 1048576 → 1 MiB", () => assert.equal(bytes(1048576, { binary: true }), "1 MiB"));
test("bytes: rollover 999950 → ~1 MB", () => assert.equal(bytes(999950), "1 MB"));
test("bytes: very large 1e15 → 1 PB", () => assert.equal(bytes(1e15), "1 PB"));
test("bytes: NaN returns string", () => assert.equal(bytes(NaN), "NaN"));
test("bytes: Infinity returns string", () => assert.equal(bytes(Infinity), "Infinity"));
test("bytes: binary rollover", () => assert.equal(bytes(1073741824, { binary: true }), "1 GiB"));

// ── duration: edge cases ───────────────────────
test("duration: sub-ms rounds to 0ms", () => assert.equal(duration(0.5), "0ms"));
test("duration: 1 year", () => assert.equal(duration(365 * 24 * 60 * 60 * 1000, { maxParts: 1 }), "1y"));
test("duration: 1 month", () => assert.equal(duration(30 * 24 * 60 * 60 * 1000, { maxParts: 1 }), "1mo"));
test("duration: complex maxParts=4", () => assert.equal(duration(90122000, { maxParts: 4 }), "1d 1h 2m 2s"));
test("duration: NaN returns string", () => assert.equal(duration(NaN), "NaN"));
test("duration: Infinity returns string", () => assert.equal(duration(Infinity), "Infinity"));

// ── relativeTime: future + edge ────────────────
test("relativeTime: in 1 hour", () => {
  assert.equal(relativeTime(new Date(NOW + 60 * 60 * 1000), { now: NOW }), "in 1 hour");
});
test("relativeTime: in 2 days", () => {
  assert.equal(relativeTime(new Date(NOW + 2 * 24 * 60 * 60 * 1000), { now: NOW }), "in 2 days");
});
test("relativeTime: in 1 year", () => {
  assert.equal(relativeTime(new Date(NOW + 365 * 24 * 60 * 60 * 1000), { now: NOW }), "in 1 year");
});
test("relativeTime: string date input", () => {
  const d = new Date(NOW - 3 * 60 * 60 * 1000);
  assert.equal(relativeTime(d.toISOString(), { now: NOW }), "3 hours ago");
});
test("relativeTime: timestamp input", () => {
  assert.equal(relativeTime(NOW - 5 * 60 * 1000, { now: NOW }), "5 minutes ago");
});

// ── ordinal: extra ─────────────────────────────
test("ordinal: 0th", () => assert.equal(ordinal(0), "0th"));
test("ordinal: 100th", () => assert.equal(ordinal(100), "100th"));
test("ordinal: 112th", () => assert.equal(ordinal(112), "112th"));
test("ordinal: 213th", () => assert.equal(ordinal(213), "213th"));

// ── compactNumber: edge cases ──────────────────
test("compactNumber: 0", () => assert.equal(compactNumber(0), "0"));
test("compactNumber: 1e15 → 1Q", () => assert.equal(compactNumber(1e15), "1Q"));
test("compactNumber: NaN", () => assert.equal(compactNumber(NaN), "NaN"));
test("compactNumber: Infinity", () => assert.equal(compactNumber(Infinity), "Infinity"));

// ── percentage: edge cases ─────────────────────
test("percentage: NaN value → 0%", () => assert.equal(percentage(NaN, 100), "0%"));
test("percentage: Infinity total → 0%", () => assert.equal(percentage(50, Infinity), "0%"));
test("percentage: 100/100", () => assert.equal(percentage(100, 100), "100.0%"));
test("percentage: negative value", () => assert.equal(percentage(-10, 100), "-10.0%"));
test("percentage: decimals=0", () => assert.equal(percentage(1, 3, { decimals: 0 }), "33%"));

// ── pluralize: extra ───────────────────────────
test("pluralize: 0 with custom", () => assert.equal(pluralize(0, "child", "children"), "0 children"));
test("pluralize: negative", () => assert.equal(pluralize(-1, "item"), "-1 items"));

// ── list: extra ────────────────────────────────
test("list: four items with oxford", () => assert.equal(list(["a", "b", "c", "d"]), "a, b, c, and d"));
test("list: non-array input", () => assert.equal(list("hello"), "hello"));
test("list: two items custom conj", () => assert.equal(list(["x", "y"], { conjunction: "or" }), "x or y"));

// ── pad: extra ─────────────────────────────────
test("pad: negative number", () => assert.equal(pad(-5, 4), "00-5"));
test("pad: already long enough", () => assert.equal(pad(12345, 3), "12345"));

// ── truncate: extra ────────────────────────────
test("truncate: exact length", () => assert.equal(truncate("hello", 5), "hello"));
test("truncate: empty string", () => assert.equal(truncate("", 5), ""));
test("truncate: multi-byte unicode", () => {
  // 4 chars + ellipsis
  assert.equal(truncate("héllo wörld", 8), "héllo w…");
});

// ── clock: extra ───────────────────────────────
test("clock: 0ms", () => assert.equal(clock(0), "0ms"));
test("clock: exactly 1000ms", () => assert.equal(clock(1000), "1.0s"));
test("clock: 3599999ms", () => assert.equal(clock(3599999), "59m 60s"));

// ── run ────────────────────────────────

// ── version check ─────────────────────────────
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_VERSION = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8")).version;
test("version is valid semver", () => {
  assert.match(PKG_VERSION, /^\d+\.\d+\.\d+$/, "package.json version must be valid semver");
});

// ── run ────────────────────────────────────────────────
for (const { name, fn } of tests) {
  try {
    fn();
    passed++;
  } catch (err) {
    console.error(`✗ ${name}: ${err.message}`);
  }
}

console.log(`\n${passed}/${tests.length} passed`);
if (passed < tests.length) process.exit(1);
