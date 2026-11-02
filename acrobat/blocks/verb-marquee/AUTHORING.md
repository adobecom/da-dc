# Verb Marquee – authoring

Block name: `verb-marquee (<verb-name>)`, e.g. `verb-marquee (resume-builder)`.

The heading (and optional title SVG / media) are authored in the foreground row. Copy, sub copy, upload button label, drag-and-drop text, file-size line, legal text and tooltip default to **placeholder keys** keyed by the verb. Any of them can instead be **authored directly in the block** via a `dc-block-row-<key>` row: first cell is the literal key, second cell is the value. This lets a new verb variant launch without touching the placeholders sheet.

```
dc-block-row-copy | Build a standout resume with AI.
```

| Row key | Overrides | Notes |
| --- | --- | --- |
| `dc-block-row-copy` | `verb-marquee-<verb>-copy` | |
| `dc-block-row-mobile-copy` | `verb-marquee-<verb>-mobile-copy` | Used at <1200px; falls back to `copy` if absent. |
| `dc-block-row-sub-copy` | `verb-marquee-<verb>-sub-copy` | |
| `dc-block-row-sub-copy-2` | `verb-marquee-<verb>-sub-copy-2` | |
| `dc-block-row-mobile-sub-copy` / `-mobile-sub-copy-2` | `verb-marquee-<verb>-mobile-sub-copy[-2]` | Used at <1200px; falls back to the non-mobile row. |
| `dc-block-row-upload-cta` | `verb-marquee-<verb>-upload-cta` / `verb-widget-cta` | |
| `dc-block-row-dragndrop-text` | `verb-widget-<verb>-dragndrop-text` | |
| `dc-block-row-file-limit` | `verb-widget-<verb>-file-limit` | |
| `dc-block-row-tool-tip` | `verb-widget-tool-tip` | |
| `dc-block-row-legal-text` | The full legal paragraph | Authored HTML is used as-is; automatic Terms/Privacy/Gen AI link decoration is skipped, so include your own links. |

Override rows are removed from the DOM before rendering. A blank row is treated as absent and falls back to the placeholder chain. Placeholders remain loaded as a fallback, so existing pages keep working unchanged.
