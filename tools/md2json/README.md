# md2json — DA verb-page Markdown → verb-content JSON

Converts a DA/AEM verb-page `.md` (the Pandoc-style "grid table" Markdown that
`main--da-dc--adobecom.aem.live/.../*.md` serves) into a **single, versioned,
semantic JSON document per verb per locale** — the shape downstream loaders
(agentic-seo's `verbContent` collection) consume directly, with **no grid-table
or block parsing on the consumer side**.

- **Combined, not split by block type** — one file per verb/locale carries every
  supported component (`howTo`, `faq`, …).
- **Versioned** — every document carries `schemaVersion` (SemVer). Branch on the
  MAJOR; never silently misparse a newer shape.
- **Omit-when-absent** — a component the page doesn't have is left out entirely
  (never `null`, never `[]`), so it maps 1:1 onto the consumer's `.optional()`
  fields.
- **HTML-ready values** — rich text is pre-rendered to HTML with the same
  remark/rehype stack the consumer uses today, so strings drop straight into
  `set:html`.

## Install & run

The tool is a self-contained package (its remark/rehype deps stay out of the
`da-dc` root tree). Install once:

```bash
cd tools/md2json
npm install
```

Then convert a local file or a live URL:

```bash
# From the published DA Markdown, to stdout:
node md2json.js https://main--da-dc--adobecom.aem.live/drafts/ruchika/fragments/word-to-pdf.md

# From a local file, writing the artifact:
node md2json.js ./word-to-pdf.md --verb word-to-pdf --locale en-US --out word-to-pdf.en-US.json
```

| Option | Default | Meaning |
| --- | --- | --- |
| `--verb <name>` | input filename without `.md` | Verb id; cross-checked against the page's `Rnr` block (mismatch → stderr warning). |
| `--locale <code>` | `en-US` | Locale id (the DA source URL carries no locale). |
| `--out <file>` | stdout | Where to write the JSON. |
| `--minify` | off | Compact output instead of 2-space pretty. |
| `--no-validate` | validation on | Skip the authoring-grammar enum checks. |
| `--strict` | off | Exit non-zero (code 2) if any grammar warning is emitted — the JSON is still written first. For CI. |

Programmatic use:

```js
import { convert, SCHEMA_VERSION } from './src/convert.js';
const { data, warnings } = convert(rawMarkdown, { verb: 'word-to-pdf', locale: 'en-US' });
```

## UI / DA tool

A browser UI lives at [`tools/ms-apps/md2json.html`](../ms-apps/md2json.html). It
reuses this package's `src/` converter (via a CDN import map for the remark
deps), so its output is identical to the CLI — no build step.

- **Standalone:** run `aem up` and open
  `http://localhost:3000/tools/ms-apps/md2json.html`. Fetch a URL or paste raw
  Markdown, Convert, then Copy/Download.
- **As a DA tool:** register the hosted URL in DA
  (`https://main--da-dc--adobecom.aem.live/tools/ms-apps/md2json.html`). When
  opened from a document, it reads the current doc's context via `DA_SDK`,
  builds that page's `.md` URL, and auto-converts. Hosting on the same site
  keeps that fetch same-origin (no CORS).

## Output schema (v1.1.0)

Machine-readable JSON Schema: [`verb-content.schema.json`](./verb-content.schema.json).

The document has two layers: **semantic convenience keys** (`howTo`, `faq`) that
are pre-rendered and omitted when absent, and a **raw catch-all** (`blocks`,
`linkReferences`) that carries the full document verbatim so nothing is ever
dropped — including blocks with no semantic mapping yet.

```jsonc
{
  "schemaVersion": "1.1.0",   // always present
  "verb": "word-to-pdf",      // always present
  "locale": "en-US",          // always present

  "howTo": {                  // OMITTED if the page has no "How To" block
    "heading": "How to convert Word to PDF",   // inline HTML
    "intro":  ["Follow these easy steps …"],    // inline HTML, in order
    "steps":  ["Click the <strong>Select a file</strong> …", "…"], // inline HTML, ordered
    "video": {                // OMITTED if the block carries no video line
      "title": "Play video: How to convert Word to PDF",
      "fragmentUrl": "https://…#video",         // lightbox/embed target
      "posterUrl":  "https://…/media_….png#…"   // resolved poster image
    }
  },

  "faq": {                    // OMITTED if the page has no plain Accordion block
    "items": [                // always ≥ 1 when present
      { "q": "…?", "a": "<p>…</p>" }  // q: inline HTML, a: block-level HTML
    ]
  },

  "blocks": [                 // ALWAYS present — every block, document order
    {
      "section": 0,           // 0-based index of the `---`-delimited section
      "name": "Icon Block",
      "variants": ["vertical", "small", "xs spacing"],
      "rows": [["…raw Markdown cell…"]]  // header row excluded; RAW, not HTML
    }
    // … Text, How To, Media, Columns, Accordion, Rnr, Section Metadata, …
  ],

  "linkReferences": {         // ALWAYS present ({} when none)
    "image0": "https://…/media_….png#width=912&height=642"
  }
}
```

`blocks` cell content is **raw Markdown** (not rendered) — it's the fidelity
layer. The semantic keys are where rendered HTML lives. Reference-style images
in raw rows (`![alt][image0]`) resolve via `linkReferences`.

### `schemaVersion` policy

`schemaVersion` is the SemVer of **this schema**, independent of the tool version:

- **MAJOR** — breaking shape change (key renamed/removed, value type changed).
  Loaders should switch on the MAJOR and refuse/branch on unknown majors.
- **MINOR** — additive: a new optional key. Old loaders keep working (they
  ignore it).
- **PATCH** — non-structural fix (e.g. rendering correction).

### Absence convention

If a page lacks a component, its key is **absent** — not `null`, not `{}`, not
`[]`. This is what lets a consumer write `faq: FaqSchema.optional()` and have
`"faq" in data` be a reliable "does this page have an FAQ" test. The same rule
applies one level down: `howTo.video` is omitted when there's no video, and
`video.fragmentUrl` / `video.posterUrl` are omitted when the source lacks them.

This rule covers the **semantic** keys only. The raw layer (`blocks`,
`linkReferences`) is *always* present — `blocks` is `[]` and `linkReferences` is
`{}` for an empty document rather than being omitted.

## Authoring grammar (source side)

The converter reads a fixed grammar of DA blocks. A block is a grid table whose
header row is `Block Name (variant, variant, …)`. Sections are separated by a
bare `---`.

> **Machine-readable version:** [`grammar.json`](./grammar.json) is the canonical,
> fetchable form of everything in this section — the fixed block-type set, each
> block's variant enum, its `mapsTo` output key, and the `Section Metadata`
> `style`/`background` enums. It's kept in lock-step with the code constants in
> [`src/extractors.js`](./src/extractors.js) (`BLOCK_GRAMMAR`, `SECTION_METADATA`)
> by a sync test, so the table below and `grammar.json` can never drift. Note:
> variant lists are the **known enum surface**, not enforced — an unknown variant
> passes through into raw `blocks[]` rather than being rejected.

### Block types

| Block name | Variants seen in the wild | Maps to output key | Notes |
| --- | --- | --- | --- |
| `How To` | `large image`, `seo`, `container` | `howTo` | Row 0 = heading + intro + optional video line; row 1 = `-` bulleted steps. |
| `Accordion` | *(none)* | `faq` | Alternating question / answer rows. **Only the un-varianted block** is the FAQ. |
| `Accordion` | `verb subfooter mobile` | *(ignored)* | Related-tools mobile nav — deliberately not pulled in. |
| `Rnr` | *(none)* | `verb` (cross-check only) | `Verb` row declares the verb id. |
| `Section Metadata` | *(none)* | *(styling only)* | Per-section `style` / `background`; see enums below. |
| `Text` | `l body`, `xs body`, `large`, `center`, `contained`, `xl spacing top`, `s spacing top`, `xs spacing bottom` | *(not consumed yet)* | Marketing copy sections. |
| `Icon Block` | `vertical`, `small`, `xs spacing` | *(not consumed yet)* | SEO icon + heading + body. |
| `Media` | `large` | *(not consumed yet)* | Image + copy + CTAs. |
| `Columns` | `verb subfooter`, `container` | *(not consumed yet)* | Related-tools grid. |

Blocks under "not consumed yet" have no *dedicated semantic key*, but they are
still fully present in the raw `blocks[]` catch-all (name, variants, raw rows,
section index) — nothing is dropped. Promoting one to its own rendered semantic
key is a **MINOR** bump — see *Extending* below.

### `Section Metadata` enums

`Section Metadata` is a key/value block. Recognised keys and value surface:

- **`style`** — a comma/space-separated list of these tokens:
  `l spacing`, `s spacing`, `xl spacing`, `xxl-spacing`, `divider`, `center`,
  `three-up`.
- **`background`** — a named colour or hex: `white`, `#fbfbfb`.

These reflect the values authored across current verb pages. The canonical list
lives in [`src/extractors.js`](./src/extractors.js) (`SECTION_METADATA`) so code
and docs stay in sync.

### Grammar validation (enum enforcement)

The converter validates every authored block against the grammar's enum surface
and emits a **warning** for anything outside it:

- an **unknown block type** (name not in `grammar.json`),
- a **variant** not in that block's enum,
- a **Section Metadata** `style` token or `background` value not in its enum
  (or an unknown metadata key).

Comparison is case-insensitive and tolerant of authoring Markdown (`**bold**`,
escaped `\#`), so it flags real drift/typos — not cosmetic differences. These
are warnings, **not** errors: the block is still emitted into raw `blocks[]`
(nothing is dropped). Warnings surface on the CLI (stderr) and in the UI's
warnings panel.

- On by default; disable with `--no-validate` (CLI) or `convert(raw, { …, validate: false })`.
- `--strict` turns any warning into a non-zero exit (code 2) for CI gating.
- Implementation: [`src/validate.js`](./src/validate.js). When a new variant/token
  becomes legitimate, add it to `BLOCK_GRAMMAR` / `SECTION_METADATA` in
  [`src/extractors.js`](./src/extractors.js) (and `grammar.json` follows via the
  sync test).

## Extending (add a new component)

1. Add an extractor to `EXTRACTORS` in [`src/extractors.js`](./src/extractors.js)
   returning `undefined` when the block is absent.
2. Add the optional key to [`verb-content.schema.json`](./verb-content.schema.json)
   and the table above.
3. Bump `SCHEMA_VERSION` in [`src/convert.js`](./src/convert.js): **MINOR** for a
   new optional key, **MAJOR** if you change/remove an existing one.
4. Add a fixture-backed test in [`test/convert.test.js`](./test/convert.test.js).

## Layout

```
tools/md2json/
  md2json.js               CLI entry (file or URL → JSON)
  verb-content.schema.json JSON Schema of the output (draft-07)
  src/
    gridTable.js           DA grid-table parser (dependency-free)
    markdown.js            cell Markdown → HTML (remark/rehype)
    extractors.js          block → semantic key, plus block/enum constants
    convert.js             orchestration, schemaVersion, omit-when-absent
  test/
    convert.test.js        node:test suite
    fixtures/word-to-pdf.md
```

The parser and renderer are faithful ports of the agentic-seo reference
implementation; keep them in sync when the DA export format changes.
