# Student Space Marquee — Authoring Guide

The **Student Space Marquee** is a display-only variation of the Study Marquee. It renders the Acrobat header (icon + "Adobe Acrobat"), a heading, supporting copy, a legal line, an info tooltip, and a media image — **without the file upload zone**. There is no drag-and-drop, file picker, or error handling; the block is purely presentational.

All text shown in the block is read from the authored DOM first. Placeholders are used **only as a fallback** for values you do not author — and the placeholder file is loaded only when at least one value is missing.

## Block structure

Author the block as a table. The **first cell of the first row names the block, with the verb as an option in parentheses**:

```
student-space-marquee (<verb-name>)
```

For example: `student-space-marquee (quiz-maker)`, `student-space-marquee (flashcard-maker)`, `student-space-marquee (mindmap-maker)`.

The `<verb-name>` determines which placeholder copy is used as a fallback and which legal links are shown (gen-AI verbs get an extra guidelines link).

## Rows

The block is authored in two parts: a small **layout section** (background + the heading/media row) followed by any number of **labeled key/value rows** that carry the text.

| Row | Content | Required? |
| --- | --- | --- |
| **Background** | One cell holding a background color (e.g. `#F0F0F0`) or a background image for the whole marquee. Omit this row if you do not want a background. | Optional |
| **Heading + media** | Two cells: the **heading cell** (`H1`–`H6`) and the **media cell** (the foreground image). | Required |
| **Labeled rows** | Any of the `con-block-row-*` rows below, each a two-cell row: the label in the first cell, the value in the second. Add only the rows you need, in any order. | Optional |

If you include a background it must come **before** the heading/media row; the heading/media row is identified by the row that contains the heading.

### Labeled text rows

Each text value is authored as its own row: the first cell is the fixed label, the second cell is the value. **Only add the rows you want** — an omitted row (or a row with an empty value cell) is treated as "not authored".

| Row label | Content | If not authored |
| --- | --- | --- |
| `con-block-row-desktop-copy` | Supporting line shown on desktop (≥ 1200px) | Falls back to `study-marquee-<verb>-copy` |
| `con-block-row-mobile-copy` | Supporting line shown on mobile/tablet (< 1200px) | Falls back to `study-marquee-<verb>-mobile-copy` (then desktop copy) |
| `con-block-row-desktop-sub-copy` | Secondary line shown on desktop | **Omitted entirely — no placeholder fallback** |
| `con-block-row-mobile-sub-copy` | Secondary line shown on mobile/tablet | **Omitted entirely — no placeholder fallback** |
| `con-block-row-legal` | Legal / consent line. Author any links directly in the value cell — they are kept as-is. | Falls back to `study-marquee-legal-text` (links auto-inserted from `verb-widget-*` placeholders) |
| `con-block-row-tooltip` | Text shown in the info-icon tooltip next to the legal line | Falls back to `verb-widget-tool-tip` |

Notes:

- **Sub-copy is optional and has no placeholder fallback.** If you do not author the desktop/mobile sub-copy row (or leave its value blank), the sub-copy line is simply not rendered — you do **not** need to include an empty sub-copy row.
- **Desktop vs mobile:** only one copy (and one sub-copy) is shown at a time based on the visitor's screen. If you author the desktop copy but leave the mobile copy blank, the desktop copy is reused on mobile.
- **Legal links:** when you author the legal value yourself, include the `<a>` links you want and they render exactly as written. When the legal row is omitted, the block builds the line from the `study-marquee-legal-text` placeholder and auto-links Terms of Use, Privacy Policy, and (for gen-AI verbs) the gen-AI guidelines.

### Media cell

Add the foreground image (a picture/image) in the second cell of the heading/media row. It renders in the right column on desktop and below the text on mobile.

## Placeholder fallback behavior

- Sub-copy never triggers a placeholder load — it is optional and simply omitted when absent.
- The `study` and `verb-widget` placeholder sheets are loaded **only** when the copy, legal, **or** tooltip value is missing; if all three are authored, no placeholder file is loaded.
- Placeholder keys are shared with the original Study Marquee block, so existing authored placeholders continue to work unchanged.

## Themes

Add a theme class as a block option to control text color per breakpoint, e.g. `light`, `dark`, `mobile-light`, `tablet-dark`, `desktop-light`. When unset, the marquee text is white (dark theme).
