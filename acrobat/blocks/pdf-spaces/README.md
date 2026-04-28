# pdf-spaces

Dynamic block that renders curated PDF Spaces as cards. Replaces manually authored `editorial` cards inside an existing `tab` / `carousel` layout. Each card visually mirrors Milo's `editorial-card` and links to a PDF Space on `acrobat.adobe.com`.

## Authoring

Author the block **inside an existing `.carousel` or `.tabs`**. Each generated card becomes a sibling of the block (the block then removes itself), so the carousel/tab treats each card as a real slide.

### Minimal usage

| pdf-spaces |
| ---------- |
|            |

With no config rows, the block uses defaults: `publicId = kwc_curated`, `country` / `language` from the page locale, `eyebrow = FEATURED`, `button = Explore now`, no card limit.

### Configurable rows

All rows are optional. Use any subset.

| pdf-spaces |              |
| ---------- | ------------ |
| publicId   | kwc_curated  |
| country    | US           |
| language   | en-US        |
| eyebrow    | FEATURED     |
| button     | Explore now  |
| limit      | 4            |
| background | #f5f5f5      |

| Key          | Default                                  | Notes                                                         |
| ------------ | ---------------------------------------- | ------------------------------------------------------------- |
| `publicId`   | `kwc_curated`                            | Will vary per category once additional public IDs ship.       |
| `country`    | Derived from Milo locale, fallback `US`  | Forwarded to the curated-collections API.                     |
| `language`   | Derived from Milo locale, fallback `en-US` | BCP-47 (e.g. `en-US`, `de-DE`).                              |
| `eyebrow`    | `FEATURED`                               | Small uppercase label above the title.                        |
| `button`     | `Explore now`                            | CTA label.                                                    |
| `limit`      | (no limit)                               | Cap on number of cards rendered.                              |
| `background` | (none — `no-bg` applied)                 | Hex (`#f5f5f5`), CSS color name (`red`), or image URL. URLs render via a `<div class="background">` (mirrors `editorial-card`); colors are applied as `background-color`. |

### Variations

Any class added to the `pdf-spaces` block element is forwarded to every generated card, so editorial-card variations work out of the box. Examples:

| Class on `pdf-spaces` block          | Effect on each card                                              |
| ------------------------------------ | ---------------------------------------------------------------- |
| `rounded-corners`                    | Applies rounded-corner styling (Milo's `rounded-corners.css` is loaded automatically). |
| `media-square` / `media-wide` / `media-standard` / `media-tall` | Sets the media aspect ratio.                |
| `s-lockup` / `m-lockup` / `l-lockup` | Picks the lockup size. Defaults to `m-lockup` if none specified. |
| `dark` / `light`                     | Theme override.                                                  |
| `click`                              | Whole card becomes clickable (uses the CTA's href).              |
| `hover-scale`                        | Card scales slightly on hover.                                   |
| `equal-height`                       | Forces equal-height cards.                                       |
| `center` / `footer-align-left` / `footer-align-center` | Alignment helpers.                              |
| `open`                               | Adds the editorial-card "open" treatment (`l-rounded-corners-image`, `static-links-copy`, `no-border`). |

When no `background` row is authored, `no-bg` is applied (matches `editorial-card`'s default). Authoring a `background` value drops `no-bg` and applies the color or image.

### Page structure

Authored example for one tab containing four featured cards:

```
section
└─ tabs
   └─ tab-content
      └─ carousel
         └─ pdf-spaces (publicId=kwc_curated, eyebrow=FEATURED)
```

For category tabs, repeat with different `publicId` (or other config) per tab.

## Technical details

### Files
- `pdf-spaces.js` — block entry point.
- `pdf-spaces.css` — card visuals, layered on top of `editorial-card`'s base styles.

### Rendering flow
1. Read config rows from the block element.
2. Resolve a guest IMS token (see below).
3. Fetch `https://dc-api.adobe.io/discovery` once per page; locate the curated-listing endpoint via `links['kwcollection.curated_listing']` (with several fallback keys). Endpoint URL is cached in module scope.
4. Expand the endpoint with `publicId`, `country`, `language` (RFC-6570 `{var}` substitution; falls back to query params if the template has no placeholders).
5. Fetch the curated collection list. Response is cached in a `Map` keyed by `publicId|country|language`.
6. For each collection, build a card with base classes `pdf-spaces-card editorial-card con-block no-bg` plus any variation classes forwarded from the block element (defaulting to `m-lockup` if no `*-lockup` was specified). Milo's `editorial-card` CSS handles variations; `pdf-spaces-card` overrides layer the screenshot-specific look.
7. Insert the cards as siblings of the block element inside the parent `.carousel` / `.tabs`, then remove the block element. If the parent is neither, cards are rendered as children of the block.

### Guest token

The block authenticates API calls with an IMS guest access token:

- Use `window.adobeIMS.getAccessToken()` if present and not expiring within 5 minutes.
- Otherwise call `window.adobeIMS.refreshToken()`. On `invalid_credentials` the IMS lib already returns a guest token.
- One retry after 2 seconds on failure.
- Result is sent as `Authorization: Bearer <token>`. If IMS is unavailable, the literal string `Guest Token` is sent (matches the page's logged-out behavior).

### Caching
- Discovery endpoint: cached in module-scope `cachedDiscoveryEndpoint`. One discovery call per page.
- Curated collections: cached in module-scope `apiCache` (`Map<cacheKey, Promise>`). Multiple `pdf-spaces` blocks sharing the same `publicId|country|language` issue a single API call. Failed promises are evicted so subsequent blocks can retry.

### Error handling
- Network or parse failure: logged via `window.lana.log` with tag `pdf-spaces`, and the block element gets the `pdf-spaces--error` class which hides it (`display: none`).
- Empty collections list: same hide-on-error behavior.

### Card field mapping

The API field names below haven't been verified against a live response — accepted aliases are listed so the block degrades gracefully until field names are pinned down.

| Card region | Source fields (first non-empty wins) |
| ----------- | ------------------------------------ |
| Image       | `thumbnail`, `thumbnail_url`, `image`, `image_url`, `cover_image`, `banner`, `images[0].url` |
| Title       | `title`, `name`, `display_name` |
| Description | `description`, `subtitle`, `summary` |
| Link id     | `id`, `urn`, `collection_id` |

CTA `href` is built as:

```
https://acrobat.adobe.com/link/spaces/<id>/?x_api_client_id=pdf_spaces&x_api_client_location=adobe
```

### Carousel / tab timing

The block fetches asynchronously, so cards arrive after the parent carousel/tabs block has run. If the parent block snapshots its children at decoration time (rather than observing DOM mutations), the injected cards may not be wrapped as slides. Verify in-browser; if needed, the parent's slide-init hook can be invoked after `pdf-spaces` finishes.
