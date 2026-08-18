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

| Row | Content | Required? |
| --- | --- | --- |
| **Row 1 (optional background)** | A background image for the whole marquee. Omit this row if you do not want a background. | Optional |
| **Last row (foreground)** | Two cells: the **text cell** (heading + copy, see below) and the **media cell** (the foreground image). | Required |

If you include a background, it must be the **first** row; the **last** row is always treated as the foreground.

### Foreground — text cell

Put the heading and all copy lines in the **same cell**, each on its own line. The block reads them in this order (every line is optional — leave a line blank to fall back to its placeholder):

| Line | Content | Placeholder fallback |
| --- | --- | --- |
| **Heading** (`H1`–`H6`) | Main title shown at the top | *(none — always author this)* |
| **1. Desktop copy** | Supporting line shown on desktop (≥ 1200px) | `study-marquee-<verb>-copy` |
| **2. Mobile copy** | Supporting line shown on mobile/tablet (< 1200px) | `study-marquee-<verb>-mobile-copy` |
| **3. Desktop sub-copy** | Secondary line shown on desktop | `study-marquee-<verb>-sub-copy` |
| **4. Mobile sub-copy** | Secondary line shown on mobile/tablet | `study-marquee-<verb>-mobile-sub-copy` |
| **5. Legal** | Legal / consent line. Author any links directly in this line — they are kept as-is. | `study-marquee-legal-text` (links auto-inserted from `verb-widget-*` placeholders) |
| **6. Tooltip** | Text shown in the info-icon tooltip next to the legal line | `verb-widget-tool-tip` |

Notes:

- **Only the heading and the media image are separate cells.** Everything else lives as ordered paragraphs inside the text cell, so the block can tell them apart by position (there are no labels — the authoring sample text indicates which line is which).
- **Desktop vs mobile:** only one copy (and one sub-copy) is shown at a time based on the visitor's screen. If you author a desktop line but leave the mobile line blank, the desktop line is reused on mobile.
- **Legal links:** when you author the legal line yourself, include the `<a>` links you want and they render exactly as written. When the legal line is left blank, the block builds it from the `study-marquee-legal-text` placeholder and auto-links Terms of Use, Privacy Policy, and (for gen-AI verbs) the gen-AI guidelines.

### Foreground — media cell

Add the foreground image (a picture/image) in its own cell. It renders in the right column on desktop and below the text on mobile.

## Placeholder fallback behavior

- If you author every text line, **no placeholder file is loaded**.
- If any line is missing, the block loads the `study` and `verb-widget` placeholder sheets and fills only the blank values.
- Placeholder keys are shared with the original Study Marquee block, so existing authored placeholders continue to work unchanged.

## Themes

Add a theme class as a block option to control text color per breakpoint, e.g. `light`, `dark`, `mobile-light`, `tablet-dark`, `desktop-light`. When unset, the marquee text is white (dark theme).
