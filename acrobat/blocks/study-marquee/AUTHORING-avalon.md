# Study Marquee (Avalon) — Authoring Guide

The **Study Marquee** block is the split hero used on the AI study/creation verb pages (Stylize, Gen Presentation, Interactive Report, and the study makers). The **avalon** variant renders a two-column desktop layout — content on the left, a full-height cover image on the right — following Milo's `hero-marquee` `media-cover` pattern.

> **Desktop-only variation:** The avalon **variation** is **desktop-specific — its styles apply only at ≥1200px** (see the block CSS). Designs were provided for desktop only, so this guide documents the desktop layout. It is not a separate block; below 1200px the study-marquee block falls back to its base responsive layout.

> **Key concept:** Almost all the on-screen text is **not authored in the block**. The heading and the cover image are authored in the block; everything else (supporting copy, sub copy, upload button label, drag-and-drop text, file-size line, legal text, tooltip) is pulled from **placeholder keys** keyed by the verb. This guide lists every key you need to author in the placeholders sheet.

## Block structure

Author the block as a table. The **first cell names the block plus its options in parentheses**, in this order:

```
study-marquee (avalon, <verb-name>, <theme>)
```

- `avalon` — selects the avalon (split hero / media-cover) variant. Must come first.
- `<verb-name>` — the verb, immediately after `avalon`. This determines which placeholder keys are read (e.g. `stylize`, `gen-presentation-v2`, `interactive-report`).
- `<theme>` — optional theme that sets the text/link colors for a light or dark background: **`light`** or **`dark`**. Use `light` when the background is light (as in the sample).

Example: `study-marquee (avalon, stylize, light)`

## Rows

| Row | Content | Required? |
| --- | --- | --- |
| **Row 1** | **Background** — a single cell with either a hex color (e.g. `#F0F0F0`) or a background image. | Optional |
| **Row 2** | **Foreground** — two cells:<br>• _Left cell_: the **heading** (author as a heading, H1–H6) — and optionally the legal placeholder reference for documentation.<br>• _Right cell_: the **cover image** (media). | Required |

> **How rows are detected:** the block treats the **last row** as the foreground and, when there is more than one row and the first row has content, the **first row** as the background. If you author a background, the foreground must be the second row.

### Heading (foreground left cell)

Author the title as a heading (H1–H6) directly in the block. This is the only body text authored in the block — the rest comes from placeholders below.

### Cover image (foreground right cell)

Add the image in the second cell of the foreground row. On desktop the avalon variant renders it as a full-height cover occupying the right half of the viewport; on smaller screens it stacks per the block's responsive rules.

---

## Placeholder keys

Author these in the `study` placeholders sheet. Replace `<verb>` with the verb used in the block, e.g. `stylize`.

> **Author all of these for each avalon verb.** The only optional ones are the verb **sub copy** and the **verb-specific legal** override — everything else must be authored.

### Keys to author (per verb)

| Placeholder key | What it controls | Required? |
| --- | --- | --- |
| `study-marquee-<verb>-copy` | Supporting copy shown under the heading. | Required |
| `study-marquee-<verb>-sub-copy` | Second line of copy under the main copy. Only renders if authored. | Optional |
| `study-marquee-<verb>-upload-cta` | Upload button label. | Required |
| `study-widget-<verb>-dragndrop-text` | The "or drag and drop here" line under the button. | Required |
| `study-widget-<verb>-file-limit` | The accepted-file-types / size line (e.g. "PDF, up to 100 MB"). | Required |

### Legal text (avalon)

| Placeholder key | What it controls | Required? |
| --- | --- | --- |
| `study-marquee-avalon-legal` | Legal text shared across all avalon pages. | Required |
| `study-marquee-avalon-<verb>-legal` | Optional per-verb override of the avalon legal text. | Optional |

The block uses the first one that is authored: `study-marquee-avalon-<verb>-legal` → `study-marquee-avalon-legal` → the base `study-marquee-legal-text`. The legal text is automatically hyperlinked (Terms of Use, Privacy Policy, Gen AI Guidelines) using the shared keys listed in the reference section below — author your legal copy so those label words appear in it.

---

## Sample authoring

Matching the reference block `study-marquee (avalon, stylize, light)`:

| study-marquee (avalon, stylize, light) ||
| --- | --- |
| #F0F0F0 ||
| **Plain PDFs to polished docs. In minutes.**<br>`{{study-marquee-avalon-legal}}` | [cover image] |

> **About `{{study-marquee-avalon-legal}}` in the block:** the legal text is resolved from the placeholder sheet (see the fallback order above), so authoring the token in the left cell is a documentation aid — the rendered legal always comes from the placeholder value, not from text typed into the block.

### Corresponding placeholder values for the sample (verb = `stylize`)

| Key | Example value |
| --- | --- |
| `study-marquee-stylize-copy` | Restyle and refresh your PDF with AI. |
| `study-marquee-stylize-sub-copy` | Upload your PDF to get started. |
| `study-marquee-stylize-upload-cta` | Select a file |
| `study-widget-stylize-dragndrop-text` | or drag and drop a file |
| `study-widget-stylize-file-limit` | PDF, up to 100 MB |
| `study-marquee-avalon-legal` | By using this service, you agree to the Adobe Terms of Use, Generative AI User Guidelines, and acknowledge the Privacy Policy. |

## Summary checklist

- First cell reads `study-marquee (avalon, <verb>, light)` — `avalon` first, verb second.
- Optional background row (hex color or image) before the foreground row.
- Foreground row: heading in the left cell, cover image in the right cell.
- Author the per-verb keys — `copy`, `upload-cta`, `study-widget-<verb>-dragndrop-text`, `study-widget-<verb>-file-limit`, and `study-marquee-avalon-legal` are **required**; `sub-copy` and `study-marquee-avalon-<verb>-legal` are optional.

---

## Reference — shared `verb-widget` keys (already authored, no action needed)

These keys begin with `verb-widget-` and are **already authored as part of the verb-widget block**. They are shared across verb pages (not verb-specific) and are reused by study-marquee. **Nothing needs to be done here for avalon verbs** — they are listed for reference only.

| Placeholder key | What it controls |
| --- | --- |
| `verb-widget-cta`, `verb-widget-cta-<uploadType>` | Fallback upload button labels used if `study-marquee-<verb>-upload-cta` is not authored. |
| `verb-widget-terms-of-use` | Label linked to the Terms of Use URL inside the legal text. |
| `verb-widget-privacy-policy` | Label linked to the Privacy Policy URL inside the legal text. |
| `verb-widget-genai-guidelines` | Label linked to the Gen AI Guidelines URL (gen-AI verbs only). |
| `verb-widget-terms-of-use-url` | Terms of Use URL (defaults to the locale's `/legal/terms.html`). |
| `verb-widget-privacy-policy-url` | Privacy Policy URL (defaults to the locale's `/privacy/policy.html`). |
| `verb-widget-genai-terms-url` | Gen AI Guidelines URL (defaults to the locale's Adobe Gen AI guidelines page). |
| `verb-widget-tool-tip` | Text for the info (ⓘ) tooltip next to the legal text. |
