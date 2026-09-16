#!/usr/bin/env node
/**
 * md2json — convert a DA/AEM verb-page `.md` (grid-table Markdown) into the
 * combined, versioned verb-content JSON the agentic-seo loader consumes.
 *
 *   node tools/md2json/md2json.js <input.md | https://…/verb.md> [options]
 *
 * Options:
 *   --verb <name>     Verb id. Default: input filename without `.md`.
 *   --locale <code>   Locale id. Default: en-US.
 *   --out <file>      Write JSON here. Default: stdout.
 *   --minify          Compact JSON. Default: pretty-printed (2-space).
 *   --no-validate     Skip authoring-grammar enum checks (on by default).
 *   --strict          Exit non-zero if any grammar warning is emitted (CI).
 *
 * Requires `npm install` inside tools/md2json first (remark/rehype deps).
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

async function main() {
  const argv = process.argv.slice(2);
  const positional = [];
  const opts = { minify: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--minify') opts.minify = true;
    else if (arg === '--no-validate') opts.noValidate = true;
    else if (arg === '--strict') opts.strict = true;
    else if (arg === '--verb') opts.verb = argv[(i += 1)];
    else if (arg === '--locale') opts.locale = argv[(i += 1)];
    else if (arg === '--out') opts.out = argv[(i += 1)];
    else if (arg === '-h' || arg === '--help') return usage(0);
    else if (arg.startsWith('-')) return fail(`Unknown option: ${arg}`);
    else positional.push(arg);
  }

  const input = positional[0];
  if (!input) return usage(1);

  const isUrl = /^https?:\/\//i.test(input);
  const raw = isUrl ? await fetchText(input) : await fs.readFile(input, 'utf-8');

  const basename = path.basename(isUrl ? new URL(input).pathname : input).replace(/\.md$/i, '');
  const verb = opts.verb ?? basename;
  const locale = opts.locale ?? 'en-US';

  // Imported after arg parsing so `--help` works without installed deps.
  const { convert } = await import('./src/convert.js');
  const { data, warnings } = convert(raw, { verb, locale, validate: !opts.noValidate });

  for (const w of warnings) process.stderr.write(`warning: ${w}\n`);

  const json = JSON.stringify(data, null, opts.minify ? 0 : 2);
  if (opts.out) {
    await fs.writeFile(opts.out, `${json}\n`, 'utf-8');
    process.stderr.write(`wrote ${opts.out} (${verb}/${locale})\n`);
  } else {
    process.stdout.write(`${json}\n`);
  }

  // Gate last so the JSON is still emitted for CI logs before we fail.
  if (opts.strict && warnings.length) {
    process.stderr.write(`error: --strict: ${warnings.length} grammar warning(s)\n`);
    process.exit(2);
  }
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status} ${res.statusText}`);
  return res.text();
}

function usage(code) {
  process[code ? 'stderr' : 'stdout'].write(
    'Usage: node tools/md2json/md2json.js <input.md | url> '
    + '[--verb name] [--locale code] [--out file.json] [--minify]\n',
  );
  process.exit(code);
}

function fail(msg) {
  process.stderr.write(`error: ${msg}\n`);
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`error: ${err.message}\n`);
  process.exit(1);
});
