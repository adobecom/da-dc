# Verb Widget — Authoring Guide

The **Verb Widget** is the PDF-tool block that appears on Acrobat online verb pages (e.g. Compress PDF, Word to PDF). It shows a heading, supporting copy, an upload button, and a verb image. This guide explains how to author each part.

**Live sample page:** https://www.stage.adobe.com/acrobat/online/test/unity/file-compressor.html — a working reference page that authors both the Verb Widget and Unity blocks exactly as described below.

---

## Block structure

Author the block as a table. The **first cell of the first row names the block, with the verb as an option in parentheses**:

```
verb-widget (<verb-name>)
```

For example: `verb-widget (compress-pdf)`, `verb-widget (word-to-pdf)`.

The `<verb-name>` tells the widget which tool to load and which default image to show.

---

## Rows

Add each piece of content as its own row (one row = one cell of text), in this order:

| Row | Content | Required? |
|-----|---------|-----------|
| **Row 1** | **Heading** — the main title shown above the widget | Required |
| **Row 2** | **Desktop copy** — the supporting text shown on desktop screens | Optional |
| **Row 3** | **Mobile copy** — the supporting text shown on mobile and tablet screens | Optional |

### Heading (Row 1)
The heading is always taken from the first row. Type the title you want shown at the top of the widget.

### Desktop & mobile copy (Rows 2 and 3)
These are the short descriptive lines shown under the heading.

- **Desktop copy (Row 2)** shows on desktop screens.
- **Mobile copy (Row 3)** shows on mobile and tablet screens.
- Only one is shown at a time, based on the visitor's device — so you can tailor a shorter line for mobile.

**Important — author both or neither:** To use custom copy, you must fill in **both Row 2 and Row 3** (three rows total: heading + desktop + mobile). If you provide only the heading, the widget uses the copy for that verb authored in the placeholder file. Providing just one copy row is not enough to override the defaults.

---

## Verb image (icon)

**Authoring an image is optional.** Each verb ships with a standard image, so you can leave it out entirely and the default svg mapped to that verb appears.

If a requirement calls for a **custom image**, add it inside the block using either:

1. **An inserted image** — insert/paste an image directly into the block (e.g. PNG/JPG). It is authored as an `<img>` and used as-is, **or**
2. **A link to an SVG file** — add a link whose address ends in `.svg`.

Both are supported. When a custom image is present, it replaces the default.

> ⚠️ **A custom image/SVG cannot be authored without the copy also being in the block.** The widget reads the desktop and mobile copy **positionally** — the first content row is the heading, the second is the desktop copy, the third is the mobile copy. As soon as the block has more than two content rows (which it does the moment you add an image or `.svg` row), the second and third rows are treated as the copy. So whenever you author a custom image or `.svg` link, you **must** also author **both** the desktop copy (Row 2) and the mobile copy (Row 3); otherwise the image row is misread as copy text and the widget breaks. Author order: heading → desktop copy → mobile copy → (optional legal) → image/SVG.

**Alt text is also optional** and only needed based on the requirement provided for authoring. If you author alt text same as the standard Milo SVG authoring pattern, it will add the alt text in the DOM.

---

## Quick examples

**Minimal — heading only (uses default copy and default image):**

| |
|---|
| verb-widget (compress-pdf) |
| Compress PDF files |

**Full — custom heading, desktop copy, mobile copy, and a custom image:**

| |
|---|
| verb-widget (compress-pdf) |
| File compressor |
| Quickly compress a large PDF to reduce its file size and makes it easier to manage, store and share (Desktop) |
| Quickly compress a large PDF to reduce its file size and makes it easier to manage, store and share (Mobile) |
| {{verb-widget-legal}} |
| https://main--da-dc--adobecom.aem.page/acrobat/online/test/unity/compress-pdf.svg\|file-compressor |

Notes on the full example:
- The custom image is authored as a **link to an `.svg`** — the text after `|` (`file-compressor`) is just the link label.
- `{{verb-widget-legal}}` is an optional row referencing a placeholder value; omit it and the standard legal copy is applied automatically.

---

## Summary checklist

- [ ] First cell reads `verb-widget (<verb-name>)`.
- [ ] Row 1 has the heading.
- [ ] For custom copy, **both** Row 2 (desktop) and Row 3 (mobile) are filled in.
- [ ] Authoring a custom image (inserted image or `.svg` link) is optional — only add one if a requirement calls for replacing the default.
- [ ] If you do author a custom image/SVG, **both** Row 2 (desktop copy) and Row 3 (mobile copy) must also be authored — an image/SVG cannot be authored without the copy.
- [ ] Alt text is optional — add it only when the authoring requirement calls for it.

---

# Unity Block — Authoring Guide

The **Unity** block loads the file-conversion backend that powers the verb flow. It works together with the Verb Widget on the same page. Authoring it is short.

## Block structure

The Unity block is a **single row**. The block name and all its options go in the **first (and only) cell**, with the options in parentheses, comma-separated:

```
unity (workflow-acrobat, referrer-<page-name>)
```

For example: `unity (workflow-acrobat, referrer-file-compressor)`.

### Workflow — `workflow-acrobat`
Always include `workflow-acrobat`. This tells the block which conversion workflow to run.

### Referrer — `referrer-<page-name>` (optional, but mandatory for reskin verbs)
Optionally add a `referrer-<page-name>` option, where `<page-name>` identifies the page or entry point (for example `referrer-file-compressor` or `referrer-home`).

- **Purpose:** the referrer value is passed as the `x_api_client_location` query parameter on the conversion request and is used for **analytics** — it lets reporting attribute usage to the page the flow started from.
- **Optional (default case):** if you do **not** author a referrer, the `x_api_client_location` parameter **defaults to the verb name** from the Verb Widget block on the page.
- **Mandatory for reskin verbs:** when the page is a **reskin of an existing verb** (it reuses another verb's flow), you **must** author a referrer. Because `x_api_client_location` otherwise defaults to the underlying verb name, a reskin would report under the original verb and its usage could not be told apart in analytics. Authoring a referrer gives the reskin its own distinct analytics value.

## Example

**Minimal — no referrer (x_api_client_location defaults to the verb name):**

| |
|---|
| unity (workflow-acrobat) |

**With a referrer for analytics:**

| |
|---|
| unity (workflow-acrobat, referrer-file-compressor) |

## Summary checklist

- [ ] The single cell reads `unity (workflow-acrobat, ...)`.
- [ ] `workflow-acrobat` is always present.
- [ ] Referrer is optional in general, **but mandatory for reskin verbs** — add `referrer-<page-name>` so a reskin reports under its own analytics value instead of the underlying verb name; otherwise it defaults to the verb name.
