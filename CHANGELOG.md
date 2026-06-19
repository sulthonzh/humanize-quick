# Changelog

## v1.1.0 — 2026-06-19

### Fixed
- **IEC unit labels for binary mode**: `bytes(1024, { binary: true })` now correctly returns `"1 KiB"` instead of `"1 KB"`. Full IEC unit set: KiB, MiB, GiB, TiB, PiB, EiB, ZiB, YiB.
- **Byte rollover bug**: Values like `999500` bytes would display as `"1000 KB"` instead of rolling over to `"1 MB"`. Now bumps to the next unit when the value rounds up to ≥ base.
- **percentage() NaN/Infinity guard**: `percentage(NaN, 100)` previously returned `"NaN%"`. Now returns `"0%"` for any non-finite input.

### Added
- `--version` / `-V` CLI flag
- `exports` field in package.json for clean ESM imports
- `prepublishOnly` script (runs tests before publish)
- `files` field (smaller npm publish size)
- 43 new tests (80 → 123 total)

### Changed
- Binary byte units now use IEC names (KiB/MiB/GiB…) while decimal uses SI names (KB/MB/GB…)

## v1.0.0 — 2026-06-14

Initial release with bytes, duration, relativeTime, ordinal, compactNumber, pluralize, list, percentage, pad, truncate, and clock functions.
