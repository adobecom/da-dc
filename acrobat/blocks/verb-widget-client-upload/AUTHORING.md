# Verb Widget (Client Upload) — Authoring Guide

The **verb-widget-client-upload** block is a standalone upload widget for image-to-PDF conversion. It accepts the **same file types and sizes as the standard `verb-widget` block** for `image-to-pdf`, but routes them down two different paths:

- **jpg / jpeg / png (≤ 25 MB) → client-side.** The file is AES-GCM encrypted in the browser, stored in IndexedDB, and the user is redirected to the Acrobat Online tool with a reference to the stored file. No file bytes leave the browser during the upload step.
- **Every other supported type → Unity.** For any non-jpg/png type (`.pdf`, `.heic`, `.tif`, `.tiff`, `.bmp`, `.gif`, `.doc`, `.docx`, `.xml`, `.ppt`, `.pptx`, `.xls`, `.xlsx`, `.rtf`, `.txt`, `.text`, `.eml`, `.form`, up to 100 MB), the block loads the Unity SDK on demand and uploads through it, exactly like the standard `verb-widget` block. Unity performs the authoritative validation, upload, and redirect. (This set mirrors Unity's `image-to-pdf` `limits.json` — `allowed-filetypes-no-adobe-design` + `heic`.)

> **Single file:** the block is single-file only. The file picker offers all supported types; only jpg/png take the client-side path.

> **Currently supported verb:** `image-to-pdf` only. Do not use this block for other verbs.

> **No Unity block required:** Pages using this block do **not** need to author a `unity` block. The block injects one on demand the first time a non-jpg/png file is selected. Unity code is not loaded on page load — it is warmed on the first user interaction (click/drag) and fully initialized only when a non-jpg/png file is chosen, so the common jpg/png path keeps its fast, fully-client-side behavior.

---

## Block structure

Author the block as a table. The **first cell names the block with the verb in parentheses**:

```
verb-widget-client-upload (image-to-pdf)
```

| Row | Content | Required? |
| --- | --- | --- |
| **Row 1** | **Heading** — the main `<h1>` displayed at the top of the widget. Author as plain text or bold text. | Required |
| **Row 2** | **`{{verb-widget-legal}}`** — a documentation token. Author this exact string as a visual reminder that the block reads the `verb-widget-legal` placeholder. The rendered legal text always comes from the placeholder sheet, not from what is typed here. | Optional (documentation only) |

> **About `{{verb-widget-legal}}` in the block:** Milo resolves `{{verb-widget-legal}}` to the placeholder value before the block's JS runs, so authoring the token in Row 2 is a documentation aid for authors and editors — it makes the placeholder dependency visible directly in the DA table. The block removes all authored rows from the DOM during init.

> **Sub-copy:** The description line shown below the heading on the rendered widget is never authored in the block table — it is always supplied by the `verb-widget-image-to-pdf-description` placeholder.

### Sample table

| verb-widget-client-upload (image-to-pdf) |
| --- |
| **Photo to PDF** |
| `{{verb-widget-legal}}` |

> **Live example:** [acrobat/online/test/image-to-pdf-client-upload](https://da.live/edit#/adobecom/da-dc/acrobat/online/test/image-to-pdf-client-upload)

---

## New placeholder keys — author these

These keys are **unique to this block** and do not exist in the standard `verb-widget` placeholder sheet. Author them in the verb-widget placeholders sheet alongside the existing `verb-widget-*` keys.

### Content keys

| Placeholder key | What it controls | Required? |
| --- | --- | --- |
| `verb-widget-processing` | Label shown on the upload button while the file is being encrypted and stored in the browser (replaces the CTA label during processing). | Required |

### Error message keys

These keys provide the user-facing error strings shown in the inline error toast. The block pre-validates files client-side (so these can be triggered without a network call); on the Unity path, Unity may also surface validation/upload errors, which render in the same inline error toast.

| Placeholder key | When it appears | Required? |
| --- | --- | --- |
| `verb-widget-error-generic` | Catch-all error when encryption or IndexedDB storage fails. | Required |
| `verb-widget-error-only-accept-one-file` | User tries to drop or select more than one file at a time. | Required |
| `verb-widget-error-unsupported-type` | File extension/MIME type is outside the supported `image-to-pdf` set (also raised by Unity for the server-side path). | Required |
| `verb-widget-error-empty-file` | Selected file has a size of 0 bytes. | Required |
| `verb-widget-error-file-too-large` | A jpg/png exceeds 25 MB, or another supported type exceeds 100 MB. | Required |
| `verb-widget-error-duplicate-asset` | User selects a file with the same name as one already queued (reserved for future multi-file support). | Required |


### Sample placeholder values

| Key | Example value |
| --- | --- |
| `verb-widget-processing` | Processing… |
| `verb-widget-error-generic` | Unable to process the request. |
| `verb-widget-error-only-accept-one-file` | Only 1 file can be uploaded at a time. |
| `verb-widget-error-unsupported-type` | This file is in a format not supported for conversion to PDF. |
| `verb-widget-error-empty-file` | This file is empty. |
| `verb-widget-error-file-too-large` | This file is either too large or too complex to export. |
| `verb-widget-error-duplicate-asset` | Duplicate detected. Please rename file before uploading again. |

---

## Summary checklist

- First cell reads `verb-widget-client-upload (image-to-pdf)` — verb in parentheses.
- Row 1 contains the heading (required).
- Row 2 contains `{{verb-widget-legal}}` (documentation convention — optional but recommended for author visibility).
- Description text is **never authored in the block** — use the `verb-widget-image-to-pdf-description` placeholder.
- Do **not** add a `unity` block to the page.
- Author `verb-widget-processing` in the placeholders sheet (the only new key).
- Author all six `verb-widget-error-*` keys in the placeholders sheet.

---

## Reference — shared `verb-widget` keys (already authored, no action needed)

These keys begin with `verb-widget-` and are **already authored as part of the standard `verb-widget` block**. The client-upload block reads them using the same `window.mph` lookup. **Nothing needs to be re-authored** — they are listed here for awareness.

### Verb-specific content (image-to-pdf)

These keys are already authored for the existing `image-to-pdf` verb page and are reused here as-is.

| Placeholder key | What it controls |
| --- | --- |
| `verb-widget-image-to-pdf-description` | Description line shown below the heading on the rendered widget. Always comes from this placeholder — it is never authored in the block table. |
| `verb-widget-image-to-pdf-alt` | Alt text for the decorative verb image on the right side of the widget. |

### Upload button and legal footer

| Placeholder key | What it controls |
| --- | --- |
| `verb-widget-cta` | Upload button label (e.g. "Select a file"). Used as the initial CTA text before any upload starts. |
| `verb-widget-legal` | First legal text line displayed in the footer (e.g. "Files are secured with 256-bit SSL encryption."). |
| `verb-widget-legal-2` | Second legal text line — contains the terms and privacy copy with inline link words. |
| `verb-widget-terms-of-use` | Label word(s) inside `verb-widget-legal-2` that get hyperlinked to the Terms of Use URL. |
| `verb-widget-privacy-policy` | Label word(s) inside `verb-widget-legal-2` that get hyperlinked to the Privacy Policy URL. |
| `verb-widget-terms-of-use-url` | Terms of Use URL override (defaults to `/<locale>/legal/terms.html`). |
| `verb-widget-privacy-policy-url` | Privacy Policy URL override (defaults to `/<locale>/privacy/policy.html`). |
| `verb-widget-tool-tip` | Text for the info (ⓘ) tooltip next to the legal footer. |

### Upsell wall (limit-exhausted state)

These keys control the upsell panel shown to anonymous users who have exhausted their free conversion limit. They are shared across all verb pages.

| Placeholder key | What it controls |
| --- | --- |
| `verb-widget-upsell-headline` | Headline shown in the upsell panel (generic fallback). |
| `verb-widget-upsell-headline-image-to-pdf` | Verb-specific upsell headline override. |
| `verb-widget-upsell-headline-nopayment` | Continuation of the headline for users without a payment method. |
| `verb-widget-upsell-bullets-heading` | Heading above the feature bullet list. |
| `verb-widget-upsell-bullets` | Feature bullet list (one bullet per line). |
| `verb-widget-upsell-bullets-image-to-pdf` | Verb-specific bullet list override. |
