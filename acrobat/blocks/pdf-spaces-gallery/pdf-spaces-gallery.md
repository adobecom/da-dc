# PDF Spaces Gallery

Dynamic gallery that renders the curated list of PDF Spaces on
`adobe.com/acrobat/generative-ai-pdf/pdf-spaces.html`, pulling from the same
in-product source of truth as `acrobat.adobe.com/curatedpdfspaces`.

**Ticket:** [MWPW-189601](https://jira.corp.adobe.com/browse/MWPW-189601)

Replaces the four hand-authored DA fragments (Featured / Productivity /
Lifestyle / All) with a single block that fetches the curated list at runtime,
so a.com stays in sync with the in-product list automatically.

## Authoring

- Add one block per tab with a variant class:
  `pdf-spaces-gallery (featured | productivity | lifestyle | all)`.
  `(all)` shows everything; no variant → `featured`. No other rows needed.
- **Required:** add `ims-cid = acrobatmiloguest` and `ims-guest = TRUE` to the
  page **metadata** block. Without it the block silently removes itself (no
  visible error for authors).
- CTA text defaults to "Explore now"; override with a `pdf-spaces-cta` key in
  the locale's `placeholders.json`.
- The API assigns one category per space, so a space may appear in only one tab.
- If the API is unavailable the block hides itself (no fallback content yet).

## Data flow

```
1. Discovery API      GET https://dc-api.adobe.io/discovery          (prod)
                       or https://dc-api-stage.adobe.io/discovery    (stage/branch)
                      → returns { expiry, templates.kwcollection_uri }

2. Curated Collections GET .../dckwcs/{expiry}/kwcollections/curated
                      → returns { children: [ { id, name, description,
                                                category, acpc_links, ... } ] }

3. Rendition CDN      GET .../rendition/id/{asset_id}?size=400&type=image/png
                      → thumbnail PNG (lazy-loaded per card as an auth'd blob)

4. Destination link   https://acrobat.adobe.com/link/spaces/{asset_id}/
```

All block instances on a page share one Discovery + Collections fetch (deduped
via a module-level promise).

## Key details

- **Client-id header differs per endpoint:** Discovery uses `x-api-key`,
  Curated Collections uses `x-api-client-id`. The wrong one returns a generic
  `403 ErrInvalidAPIKey` that looks like a missing subscription.
- **Token env must match Discovery env:** branch/stage domains mint stage IMS
  tokens, so the block calls `dc-api-stage.adobe.io` vs `dc-api.adobe.io`
  accordingly (prod rejects stage tokens with `401`).
- **Rendition `type` is a MIME type** (`image/png`) — not a file extension or a
  page/root rendition type. `png`/`jpg` return `400 Rendition Type … not supported`.
- **Thumbnails are fetched as authenticated blobs** — the Rendition CDN needs
  `Authorization` + `X-Api-Key` headers that a plain `<img src>` can't send.
- **Guest-token flows only work on deployed `--aem.page`/`--aem.live` URLs**,
  not local (local IMS doesn't mint `acrobatmiloguest` tokens).

## Adobe I/O subscriptions

`acrobatmiloguest` needs to subscribe to the following services in Adobe IO (stage + prod):

- **dc-kwcollection** — curated collections API
- **Rendition Service** (`acp-cs-rendition`, ACP: Content Services FrontEnd) —
  thumbnail rendition URLs

Key ownership was traced via
[EON-73293](https://jira.corp.adobe.com/browse/EON-73293).

## Layout

Cards are `editorial-card`s decorated via `loadBlock` (inheriting Milo's card
visuals). The carousel layout is **custom CSS** — Milo's `carousel` is
section-level and can't be driven from a block — mirroring the authored
`carousel show-4` + `editorial-card` (4-up, single card below 900px, image
height capped at `--card-height-default`). No infinite loop / arrows yet.
