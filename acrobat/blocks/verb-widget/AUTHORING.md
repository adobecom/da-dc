# verb-widget authoring

## Block structure

```
verb-widget (<verb>)
<heading>
<desktop copy>        (optional, positional; requires mobile copy too)
<mobile copy>         (optional, positional)
{{verb-widget-legal}}
```

The block class (`<verb>`) controls the flow, `LIMITS`, analytics, and placeholder keys. Reskin pages keep the same verb class as the original page. Example: `file-compressor` uses `verb-widget (compress-pdf)`.

## Optional in-block overrides (reskin pages)

Add an extra row to override a verb-keyed placeholder on one page only:

- First cell: the row key below (prefixed `dc-block-row-`).
- Second cell: the value.

```
dc-block-row-sub-copy | Drag and drop a PDF to start.
dc-block-row-demo-cta | [Try a sample PDF](https://acrobat.adobe.com/...)
```

| Row key | Overrides | Notes |
| --- | --- | --- |
| `dc-block-row-sub-copy` | `verb-widget-<verb>-sub-description` | Shows only for verbs with sub copy (for example `chat-pdf`, `pdf-ai`). |
| `dc-block-row-demo-cta` | `verb-widget-cta-demo` (text) and the default demo file link | Shows only for `chat-pdf` / `pdf-ai` verbs. Hyperlink: the link text is the button text and the URL is the demo link. Plain text: changes only the button text and keeps the default demo link. |

Notes:

- The block removes these rows before it renders. They do not count as positional desktop or mobile copy rows.
- A blank row works the same as a missing row. The block uses the placeholder value.
- Demo link analytics: the code adds `x_api_client_id` and `x_api_client_location` when the link does not have them.
  - `x_api_client_location` uses the `referrer-<name>` class on the `unity` block. Without a referrer, it uses the verb default (`chat_pdf` or `chat_pdf_pdf_ai`).
  - The same referrer rule applies to the default demo link.
  - Params that you put in the authored link stay as they are.
- The demo CTA click analytics label stays `Try with a demo file`.
- The Unity upload redirect does not change. Use the `referrer-<name>` class on the `unity` block for the reskin referrer.
