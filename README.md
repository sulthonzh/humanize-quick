# humanize-quick

**Format numbers, bytes, durations, and dates the way humans actually read them.** One tiny zero-dependency package replaces every formatting helper you've copy-pasted into projects.

```bash
npm install humanize-quick
```

## Why humanize-quick

Every project has a `formatBytes` function buried somewhere, copy-pasted from Stack Overflow, slightly wrong for edge cases. humanize-quick ships 11 battle-tested formatters — **0 dependencies**, full ESM, 123 tests covering every edge case from negative numbers to IEC binary units.

## Usage

```js
import { bytes, duration, relativeTime, ordinal, compactNumber, pluralize, list, percentage, pad, truncate, clock } from "humanize-quick";

bytes(1500);                     // "1.5 KB"
bytes(1048576, { binary: true }); // "1 MiB"  (IEC units in binary mode)

duration(65000);                  // "1m 5s"
duration(90122000, { maxParts: 3 }); // "1d 1h 2m"

relativeTime(new Date("2024-01-01")); // "1 year ago"
ordinal(22);                      // "22nd"
compactNumber(2500000);          // "2.5M"
pluralize(2, "person", "people"); // "2 people"
list(["apple", "banana", "cherry"]); // "apple, banana, and cherry"
percentage(1, 3, { decimals: 2 }); // "33.33%"
pad(7, 3);                        // "007"
truncate("hello world", 8);       // "hello w…"
clock(65000);                     // "1m 5s"
```

## Real-World Examples

### 1. File Download Progress (browser/CLI)

```js
import { bytes, percentage, clock } from "humanize-quick";

function progressLabel(downloaded, total, startTime) {
  const elapsed = Date.now() - startTime;
  const speed = downloaded / (elapsed / 1000);
  return `${bytes(downloaded)} / ${bytes(total)} (${percentage(downloaded, total)}) — ${bytes(speed)}/s, ${clock(elapsed)} elapsed`;
}

progressLabel(524288000, 1073741824, Date.now() - 30000);
// "500 MiB / 1 GiB (48.8%) — 16.7 MiB/s, 30.0s elapsed"
```

### 2. Dashboard Metrics (admin panel)

```js
import { compactNumber, relativeTime, pluralize, ordinal } from "humanize-quick";

function userStats({ users, newToday, lastSignup, rank }) {
  return [
    `${compactNumber(users)} total users`,
    `${pluralize(newToday, "signup")} today`,
    `Newest: ${relativeTime(lastSignup)}`,
    `You are the ${ordinal(rank)} member`,
  ].join(" • ");
}

userStats({ users: 1250000, newToday: 347, lastSignup: new Date(Date.now() - 3 * 3600 * 1000), rank: 1 });
// "1.25M total users • 347 signups today • Newest: 3 hours ago • You are the 1st member"
```

### 3. CI/CD Pipeline Step Timing

```js
import { duration, list, clock } from "humanize-quick";

function stepSummary(steps) {
  const total = steps.reduce((sum, s) => sum + s.ms, 0);
  const slowest = steps.reduce((a, b) => b.ms > a.ms ? b : a);
  const names = list(steps.map(s => s.name), { conjunction: "then" });
  return `Pipeline: ${names} — total ${duration(total, { maxParts: 3 })}, slowest ${slowest.name} at ${clock(slowest.ms)}`;
}

stepSummary([
  { name: "install", ms: 45000 },
  { name: "lint", ms: 8000 },
  { name: "test", ms: 120000 },
  { name: "build", ms: 90000 },
]);
// "Pipeline: install, lint, test, then build — total 4m 23s, slowest test at 2m 0s"
```

## How It Compares

| Feature | humanize-quick | pretty-bytes | humanize-duration | day.js+relTime | d3-format |
|---------|:-:|:-:|:-:|:-:|:-:|
| Zero dependencies | ✅ | ✅ | ✅ | ❌ (58KB) | ❌ |
| Bundle size | ~3 KB | ~3 KB | ~5 KB | ~58 KB | ~50 KB |
| Bytes formatting | ✅ | ✅ | ❌ | ❌ | ❌ |
| IEC binary units (KiB/MiB) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Duration formatting | ✅ | ❌ | ✅ | ❌ | ❌ |
| Relative time | ✅ | ❌ | ❌ | ✅ | ❌ |
| Ordinals | ✅ | ❌ | ❌ | ❌ | ❌ |
| Compact numbers | ✅ | ❌ | ❌ | ❌ | ✅ |
| Pluralization | ✅ | ❌ | ❌ | ❌ | ❌ |
| List joining | ✅ | ❌ | ❌ | ❌ | ❌ |
| Percentage | ✅ | ❌ | ❌ | ❌ | ❌ |
| CLI included | ✅ | ❌ | ❌ | ❌ | ❌ |

## API

### `bytes(n, opts?)`
Format a byte count. `opts.binary` (default `false`) uses 1024 base with IEC units (KiB/MiB/GiB). `opts.decimals` (default `1`).

### `duration(ms, opts?)`
Format milliseconds into human-readable durations. `opts.maxParts` (default `2`). `opts.compact` (default `true`, joins with space; `false` joins with `", "`).

### `relativeTime(date, opts?)`
Returns "3 hours ago" or "in 2 days" style strings. Accepts Date objects, timestamps, or date strings. `opts.now` for testing.

### `ordinal(n)`
Returns ordinal suffix: `1st`, `2nd`, `3rd`, `11th`, `21st`, `113th`.

### `compactNumber(n, opts?)`
Compact large numbers: `1500` → `1.5K`, `2.5M`, `3B`, `1T`, `1Q`. `opts.decimals` (default `1`).

### `pluralize(n, singular, plural?)`
Returns `n word(s)`. Auto-pluralizes with `+s` if no custom plural given.

### `list(items, opts?)`
Join array into natural language list. `opts.conjunction` (default `"and"`). `opts.oxfordComma` (default `true`).

### `percentage(value, total, opts?)`
Calculate and format percentage. Returns `"0%"` for non-finite inputs or zero total. `opts.decimals` (default `1`).

### `pad(n, len?, char?)`
Zero-pad numbers: `pad(7, 3)` → `"007"`.

### `truncate(str, len, suffix?)`
Truncate strings with ellipsis or custom suffix.

### `clock(ms)`
Short elapsed time format: `500ms`, `1.5s`, `1m 5s`.

## CLI

```bash
humanize bytes 1500              # 1.5 KB
humanize bytes 1048576 --binary  # 1 MiB
humanize duration 65000          # 1m 5s
humanize time 2024-01-01         # 1 year ago
humanize ordinal 22              # 22nd
humanize compact 1500000         # 1.5M
humanize plural 2 cat            # 2 cats
humanize list apple banana cherry # apple, banana, and cherry
humanize percent 45 100          # 45.0%
humanize pad 7 3                 # 007
humanize clock 65000             # 1m 5s
humanize --version               # 1.1.0
```

Add `--json` to any command for JSON output.

## License

MIT
