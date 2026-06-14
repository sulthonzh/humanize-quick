#!/usr/bin/env node
import { bytes, duration, relativeTime, ordinal, compactNumber, pluralize, list, percentage, pad, truncate, clock } from "./index.js";

const [cmd, ...args] = process.argv.slice(2);

function read() {
  return args.length ? args.join(" ") : null;
}

function stdin() {
  return new Promise((resolve) => {
    let d = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (d += c));
    process.stdin.on("end", () => resolve(d.trim()));
  });
}

const HELP = `humanize-quick — human-readable formatting

Usage: humanize <command> [args]

Commands:
  bytes <n>            Format bytes (e.g. 1500 → 1.5 KB)
  duration <ms>        Format duration (e.g. 65000 → 1m 5s)
  time <date>          Relative time (e.g. "3 hours ago")
  ordinal <n>          Ordinal (e.g. 22 → 22nd)
  compact <n>          Compact number (e.g. 1500 → 1.5K)
  plural <n> <word>    Pluralize (e.g. "2 cats")
  list <a> <b> <c>     Join list (e.g. "a, b, and c")
  percent <v> <total>  Percentage (e.g. 50.0%)
  pad <n> [len]        Zero-pad (e.g. 007)
  truncate <str> <len> Truncate with ellipsis
  clock <ms>           Short time format (e.g. 1.5s)

Options:
  --json     Output JSON
  --binary   Use 1024 base for bytes
  --help     Show this help`;

(async () => {
  if (!cmd || cmd === "--help" || cmd === "-h") {
    console.log(HELP);
    return;
  }

  const json = args.includes("--json");
  const cleanArgs = args.filter((a) => !a.startsWith("--"));

  switch (cmd) {
    case "bytes": {
      const n = Number(cleanArgs[0]);
      const binary = args.includes("--binary");
      console.log(json ? JSON.stringify({ input: n, output: bytes(n, { binary }) }) : bytes(n, { binary }));
      break;
    }
    case "duration": {
      const ms = Number(cleanArgs[0]);
      console.log(json ? JSON.stringify({ input: ms, output: duration(ms) }) : duration(ms));
      break;
    }
    case "time":
    case "relativetime": {
      const date = cleanArgs[0] || new Date().toISOString();
      console.log(json ? JSON.stringify({ input: date, output: relativeTime(date) }) : relativeTime(date));
      break;
    }
    case "ordinal": {
      const n = Number(cleanArgs[0]);
      console.log(json ? JSON.stringify({ input: n, output: ordinal(n) }) : ordinal(n));
      break;
    }
    case "compact":
    case "compactnumber": {
      const n = Number(cleanArgs[0]);
      console.log(json ? JSON.stringify({ input: n, output: compactNumber(n) }) : compactNumber(n));
      break;
    }
    case "plural":
    case "pluralize": {
      const n = Number(cleanArgs[0]);
      const word = cleanArgs[1] || "item";
      console.log(json ? JSON.stringify({ input: n, output: pluralize(n, word) }) : pluralize(n, word));
      break;
    }
    case "list": {
      console.log(json ? JSON.stringify({ output: list(cleanArgs) }) : list(cleanArgs));
      break;
    }
    case "percent":
    case "percentage": {
      const v = Number(cleanArgs[0]);
      const t = Number(cleanArgs[1]);
      console.log(json ? JSON.stringify({ value: v, total: t, output: percentage(v, t) }) : percentage(v, t));
      break;
    }
    case "pad": {
      const n = cleanArgs[0];
      const len = Number(cleanArgs[1]) || 2;
      console.log(json ? JSON.stringify({ input: n, output: pad(n, len) }) : pad(n, len));
      break;
    }
    case "truncate": {
      const str = cleanArgs[0] || "";
      const len = Number(cleanArgs[1]) || 80;
      console.log(json ? JSON.stringify({ input: str, output: truncate(str, len) }) : truncate(str, len));
      break;
    }
    case "clock": {
      const ms = Number(cleanArgs[0]);
      console.log(json ? JSON.stringify({ input: ms, output: clock(ms) }) : clock(ms));
      break;
    }
    default:
      console.error(`Unknown command: ${cmd}\nRun --help for usage.`);
      process.exit(1);
  }
})();
