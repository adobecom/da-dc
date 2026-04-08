# verb-marquee — Authoring Guide

The verb-marquee block is a full-width hero used on Acrobat tool pages. It displays the Adobe Acrobat branding, a headline, body copy, a file-upload area, a preview image, and legal text. Most of the copy is pulled automatically from the **placeholders file** — authors only need to provide the heading, media image, and background.

---

## Block name

When inserting the block, the name tells the system which verb the hero is for and what color scheme to use.

**Format:** `verb-marquee (verb-name, color-variant)`

| Part | Required | Options |
|---|---|---|
| Verb name | Yes | `word-to-pdf` · `jpg-to-pdf` · `fillsign` · `summarize-pdf` |
| Color variant | No | `light` (black text on light background). Leave blank for dark (white text) |

**Examples**

| Block name | What it produces |
|---|---|
| `verb-marquee (word-to-pdf, light)` | Word to PDF hero, light color scheme |
| `verb-marquee (jpg-to-pdf)` | JPG to PDF hero, dark color scheme |
| `verb-marquee (fillsign)` | Fill & Sign hero, dark color scheme |

---

## Authoring rows

The block has **two rows**.

```
┌──────────────────────────────────────────────────┐
│  Row 1 — Background (optional)                   │
├────────────────────────┬─────────────────────────┤
│  Row 2 — Heading       │  Row 2 — Media image    │
└────────────────────────┴─────────────────────────┘
```

### Row 1 — Background

This row sets the visual background of the entire hero. It is optional — leave it empty if no background is needed.

The background can be a **color**, a **gradient**, or an **image**. See §Background options below for how to author each type.

### Row 2 — Heading (left cell)

Type the main headline for the page here using a Heading style (e.g. Heading 1). This is the only copy you need to author directly — everything else (body text, button labels, legal text) is pulled from the placeholders file automatically.

### Row 2 — Media image (right cell)

Insert the preview or illustration image that appears on the right side of the hero. On smaller screens this image is hidden or stacked below the content.

---

## Background options

### Solid color

Enter a hex color code in the background cell.

**Example:** `#F3F3F3`

### Gradient

Enter a CSS gradient value directly in the background cell. You can generate gradients using any online gradient tool and paste the result here.

**Example:**
```
linear-gradient(77deg, rgba(255,255,255,1) 38%, rgba(217,35,97,0.08) 66%, rgba(113,85,250,0.07) 100%)
```

### Image

Insert an image from the DAM into the background cell. The image will automatically fill the full width and height of the hero.

### Different background per screen size

To use a different background at different screen sizes, add **multiple items** in the background cell — one for each breakpoint, in this order:

| Position in cell | Applies to |
|---|---|
| First | Mobile |
| Second | Tablet |
| Third | Desktop |

Each item can be a color, gradient, or image independently. For example: a gradient on mobile, a photo on desktop.

---

## Placeholder keys

The following text content is **not authored in the document** — it is stored in the project's placeholders file and pulled in automatically at render time. Each key must be present in the placeholders file for every locale where the page will be published.

Replace `{verb}` with the verb name used in the block name (e.g. `word-to-pdf`).

### Body copy

| Key | Where it appears |
|---|---|
| `verb-marquee-{verb}-copy` | Main body paragraph below the heading (desktop and tablet) |
| `verb-marquee-{verb}-mobile-copy` | Body paragraph on mobile. Falls back to the key above if not set |
| `verb-marquee-{verb}-sub-copy` | A secondary line with a checkmark icon. Only shown if the key is populated |
| `verb-marquee-{verb}-mobile-sub-copy` | Mobile version of the sub-copy line. Falls back to the key above if not set |

### Upload area

| Key | Where it appears |
|---|---|
| `verb-widget-cta` | Label on the main upload button |
| `verb-widget-{verb}-dragndrop-text` | "or drag and drop here" instruction below the button |
| `verb-widget-{verb}-file-limit` | Accepted file types and size limit description |

### Legal text

| Key | Where it appears |
|---|---|
| `verb-marquee-legal` | Main legal paragraph. Contains links to Terms of Use and Privacy Policy |
| `verb-marquee-legal-2` | Secondary legal sentence (non-AI verbs only) |
| `verb-marquee-legal-2-ai` | Secondary legal sentence for AI verbs (e.g. summarize-pdf) |

The following keys are reused from the verb-widget block — **no new placeholder entries needed** for these:

| Key | Where it appears |
|---|---|
| `verb-widget-terms-of-use-url` | URL inserted into the legal paragraph for the Terms of Use link |
| `verb-widget-privacy-policy-url` | URL inserted into the legal paragraph for the Privacy Policy link |
| `verb-widget-genai-guidelines` | URL for AI guidelines link (AI verbs only) |
| `verb-widget-tool-tip` | Text shown when the user clicks the info icon next to the legal text |

---

## Sample page

For a live authoring example, see: https://main--da-dc--adobecom.aem.page/acrobat/online/test/unity/target-test/jpg-to-pdf

---

## Quick checklist for authors

- [ ] Block name includes the correct **verb name**
- [ ] **Color variant** (`light` or blank) matches the brightness of your background
- [ ] Background cell is filled with a color, gradient, or image — or left empty intentionally
- [ ] A **heading** is set in the left cell of Row 2
- [ ] A **media image** is inserted in the right cell of Row 2
- [ ] All placeholder keys for the verb are populated in the placeholders file for every locale
