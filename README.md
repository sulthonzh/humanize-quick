# humanize-quick

Zero-dependency human-readable formatting for JavaScript. Format bytes, durations, relative time, ordinals, compact numbers, pluralized words, and lists — all in one tiny package.

## Why

Every project reinvents these little formatting helpers. `humanize-quick` gives you battle-tested versions with zero dependencies, clean APIs, and full ESM support.

## Install

```bash
npm install humanize-quick
```

## Usage

```js
import { bytes, duration, relativeTime, ordinal, compactNumber, pluralize, list } from "humanize-quick";

bytes(1500);              // "1.5 KB"
bytes(1048576);           // "1 MB"
bytes(1024, { binary: true }); // "1 KB"

duration(65000);          // "1m 5s"
duration(90061000);       // "1d 1h"
duration(65000, { maxParts: 3 }); // "1m 5s"

relativeTime(new Date("2020-01-01")); // "6 years ago"
ordinal(22);              // "22nd"
ordinal(113);             // "113th"

compactNumber(1500000);   // "1.5M"
pluralize(2, "cat");      // "2 cats"
pluralize(1, "person", "people"); // "1 person"

list(["apple", "banana", "cherry"]); // "apple, banana, and cherry"
```

## API

### `bytes(n, opts?)`
Format a byte count. `opts.binary` (default `false`) uses 1024 base. `opts.decimals` (default `1`).

### `duration(ms, opts?)`
Format milliseconds into human-readable durations. `opts.maxParts` (default `2`). `opts.compact` (default `true`).

### `relativeTime(date, opts?)`
Returns "3 hours ago" or "in 2 days" style strings. Accepts Date objects, timestamps, or date strings. `opts.now` for testing.

### `ordinal(n)`
Returns ordinal suffix: `1st`, `2nd`, `3rd`, `11th`, `21st`, `113th`.

### `compactNumber(n, opts?)`
Compact large numbers: `1500` → `1.5K`, `2.5M`, `3B`, `1T`. `opts.decimals` (default `1`).

### `pluralize(n, singular, plural?)`
Returns `n word(s)`. Auto-pluralizes with `+s` if no custom plural given.

### `list(items, opts?)`
Join array into natural language list. `opts.conjunction` (default `"and"`). `opts.oxfordComma` (default `true`).

### `percentage(value, total, opts?)`
Calculate and format percentage. `opts.decimals` (default `1`).

### `pad(n, len?, char?)`
Zero-pad numbers: `pad(7, 3)` → `"007"`.

### `truncate(str, len, suffix?)`
Truncate strings with ellipsis or custom suffix.

### `clock(ms)`
Short elapsed time format: `500ms`, `1.5s`, `1m 5s`.

## CLI

```bash
humanize bytes 1500              # 1.5 KB
humanize duration 65000          # 1m 5s
humanize time 2020-01-01         # 6 years ago
humanize ordinal 22              # 22nd
humanize compact 1500000         # 1.5M
humanize plural 2 cat            # 2 cats
humanize list apple banana cherry # apple, banana, and cherry
humanize percent 45 100          # 45.0%
humanize pad 7 3                 # 007
humanize clock 65000             # 1m 5s
```

Add `--json` to any command for JSON output.

## License

MIT
