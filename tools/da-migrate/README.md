# DA → DA migration tool

Copies a set of pages from one Document Authoring instance to another, turning
them into content fragments on the way: page-level blocks are stripped, links
are repointed at the destination origin, and every rewritten link is verified
against `aem.live` so you get a fix-list of anything that no longer resolves.

This is the DA-to-DA counterpart of milo's SharePoint-to-DA rolling import
(`.github/workflows/track-dc-publishes-for-da.yaml`). Because both ends are DA,
there is no markdown → DOM conversion step: pages are read as DA HTML,
transformed, and written back through `admin.da.live`.

---

## 1. What the tool does

```
read source page (admin.da.live)
   ↓
rewrite origins        aem.page / aem.live  →  destination origin
   ↓
strip page blocks      breadcrumbs, verb-widget, unity, metadata
   ↓
write to destination   POST admin.da.live/source/<org>/<repo>/<path>.html
   ↓
check rewritten links  HEAD against aem.live (aem.page normalised to aem.live)
   ↓
broken-links.json + broken-links.csv
```

Two properties worth knowing up front:

- **The write always happens.** Link checking is reporting only and never blocks
  a page from migrating. Broken links land in the report so they can be fixed
  afterwards.
- **Nothing is published by default.** `publish` defaults to `none`, so the tool
  creates DA source documents and stops. Preview/live are opt-in per run.

---

## 2. Prerequisites

- Node 20+ (the repo's `npm ci` is enough; no extra install step).
- Write access to the **destination** DA org — see
  [Credentials](#3-credentials) below.
- Read access to the **source** DA org.

---

## 3. Credentials

### Which tokens are actually needed

| Operation | Endpoint | Token required |
| --- | --- | --- |
| Read source document | `admin.da.live/source/...` | **Yes** — `DA_SOURCE_TOKEN` |
| Write destination document | `admin.da.live/source/...` | **Yes** — `DA_DEST_TOKEN` |
| Link check | `*.aem.live` | No — public |
| Preview / publish | `admin.hlx.page` | Only if the destination repo is auth-protected (`AEM_ADMIN_TOKEN`) |

There is **no anonymous write path** to DA. A destination token is mandatory;
without it every write returns `401`.

### Getting a token (interactive, recommended for one-off runs)

DA authenticates with IMS. The quickest route is to reuse a signed-in browser
session:

1. Sign in at <https://da.live>.
2. Open DevTools → **Application → Local Storage → `https://da.live`**.
3. Find the key containing `adobeid_ims_access_token`. The value is JSON; the
   bearer is its `access_token` (or `tokenValue`) field.

Or copy it straight to the clipboard from the DevTools console on `da.live`:

```js
copy(Object.keys(localStorage)
  .filter((k) => k.includes('adobeid_ims_access_token'))
  .map((k) => JSON.parse(localStorage.getItem(k)))
  .map((v) => v.tokenValue || v.access_token)
  .find(Boolean));
```

Alternatively, grab it from a live request: DevTools → **Network**, filter
`admin.da.live`, pick any request → **Request Headers → `Authorization: Bearer …`**.

These tokens expire in roughly 24 hours, which is fine for a migration run.

### Getting a token (service credentials, for CI or repeat runs)

Create an **OAuth Server-to-Server** credential in the Adobe Developer Console
and let the tool mint tokens itself. When no explicit token is set,
`da-client.js` calls IMS using these variables:

| Variable | Example |
| --- | --- |
| `DA_IMS_URL` | `https://ims-na1.adobelogin.com/ims/token/v3` |
| `DA_IMS_CLIENT_ID` | client id from Developer Console |
| `DA_IMS_CLIENT_SECRET` | client secret |
| `DA_IMS_GRANT_TYPE` | `client_credentials` (default) |
| `DA_IMS_CODE` | only for authorization-code grants |

### Passing the token to the tool

**Never put a token in a config file or in source.** The tool reads it from the
environment only.

Option A — shell export (nothing to clean up afterwards):

```bash
export DA_DEST_TOKEN='eyJhbGciOiJSUzI1NiIs...'
npm run da-migrate -- --config tools/da-migrate/config.json
```

Option B — a git-ignored `.env` file, if you want it to survive between runs:

```bash
# tools/da-migrate/.env
DA_SOURCE_TOKEN=eyJhbGciOi...
DA_DEST_TOKEN=eyJhbGciOi...
```

Confirm it is ignored before you create it:

```bash
git check-ignore -v tools/da-migrate/.env
```

### All supported variables

| Variable | Purpose |
| --- | --- |
| `DA_TOKEN` | Bearer token used for **both** instances |
| `DA_SOURCE_TOKEN` | Source-instance override (takes precedence over `DA_TOKEN`) |
| `DA_DEST_TOKEN` | Destination-instance override (takes precedence over `DA_TOKEN`) |
| `DA_IMS_URL`, `DA_IMS_CLIENT_ID`, `DA_IMS_CLIENT_SECRET`, `DA_IMS_CODE`, `DA_IMS_GRANT_TYPE` | Mint a token when no explicit token is set |
| `AEM_ADMIN_TOKEN` | AEM admin token for `preview` / `live` on the destination |

### Verifying the token before a long run

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -H "Authorization: Bearer $DA_DEST_TOKEN" \
  "https://admin.da.live/list/adobecom/dc-frictionless/"
```

| Status | Meaning |
| --- | --- |
| `200` | Good to go |
| `401` | Token missing, malformed, or expired — get a fresh one |
| `403` | Token is valid but the identity is not a member of the destination org. Add the user (or the service technical account) in DA admin; a new token will not help |

---

## 4. Configure

Copy the example and edit it:

```bash
cp tools/da-migrate/config.example.json tools/da-migrate/config.json
```

```jsonc
{
  "source": { "org": "adobecom", "repo": "da-dc", "ref": "main" },
  "dest": {
    "org": "adobecom",
    "repo": "dc-frictionless",
    "ref": "main",
    "contentRoot": "/dc-shared/tools/content"
  },
  "paths": ["/acrobat/online"],      // files or folders; folders walk recursively
  "exclude": ["\\.json$", "/drafts/"],
  "pathMap": [{ "from": "^/acrobat/online/", "to": "/tools/" }],
  "copyMedia": true,
  "publish": "none",                 // none | preview | live
  "linkCheck": {
    "enabled": true,
    "concurrency": 8,
    "timeoutMs": 15000,
    "reportPath": "./.da-migrate-output/broken-links.json"
  },
  "transforms": {
    "rewriteOrigin": {
      "target": "https://main--dc-frictionless--adobecom.aem.live",
      "matchHosts": ["aem.page", "aem.live"]
    },
    "removeNamedBlocks": ["breadcrumbs", "verb-widget", "unity", "metadata"]
  }
}
```

### Key reference

| Key | Description |
| --- | --- |
| `source` / `dest` | `{ org, repo, ref }` of each DA instance |
| `dest.contentRoot` | Folder every page is flattened into (default `/dc-shared/tools/content`) |
| `paths` | Files or folders to migrate, relative to the repo root |
| `exclude` | Regexes tested against the source path || `pathMap` | Ordered `{ from (regex), to }` rules applied to root-relative links inside the page, and to non-page assets |
| `copyMedia` | Copy referenced `content.da.live` assets to the destination (default `true`) |
| `publish` | `none` (default) \| `preview` \| `live`. `--publish` overrides per run |
| `linkCheck` | See [Link checking](#6-link-checking-and-the-report) |
| `customTransform` | Module exporting `(html, ctx) => html`, resolved relative to the config file |

### Input paths

`paths` and `--paths` accept either form:

| Input | Treated as |
| --- | --- |
| `https://main--da-dc--adobecom.aem.live/acrobat/online/word-to-pdf` | A single page |
| `https://main--da-dc--adobecom.aem.page/fr/acrobat/online/word-to-pdf` | A single page |
| `/acrobat/online/word-to-pdf.html` | A single page |
| `/acrobat/online` | A folder, walked recursively |

For a batch of 20–30 pages, put them in a text file instead of repeating
`--paths`. One entry per line; blank lines and `#` comments are ignored:

```
# tools/da-migrate/pages.txt
https://main--da-dc--adobecom.aem.live/acrobat/online/word-to-pdf
https://main--da-dc--adobecom.aem.live/acrobat/online/compress-pdf

# locale pages
https://main--da-dc--adobecom.aem.live/fr/acrobat/online/word-to-pdf
```

```bash
npm run da-migrate -- -c tools/da-migrate/config.json -f tools/da-migrate/pages.txt
```

See [pages.example.txt](pages.example.txt). Precedence is `--paths` →
`--paths-file` / config `pathsFile` → config `paths`.

A full AEM URL **always** means one page, so a page URL is never mistaken for a
folder. The `<ref>--<repo>--<org>` host is parsed and checked against
`config.source`; a mismatched org/repo aborts the run, and a mismatched ref warns
(DA source has no per-branch content). A URL ending in `/` resolves to that
folder's `index`.

Content is still read from DA source via `admin.da.live` — the URL only
identifies *which* document to read, so a source token is required either way.

### Destination paths

Pages are **flattened**: folder structure is discarded and the leaf name becomes
the file name under `contentRoot`. A leading locale segment is preserved.

| Source URL | Destination document |
| --- | --- |
| `/acrobat/online/word-to-pdf` | `/dc-shared/tools/content/word-to-pdf` |
| `/fr/acrobat/online/word-to-pdf` | `/fr/dc-shared/tools/content/word-to-pdf` |
| `/id_id/acrobat/online/word-to-pdf` | `/id_id/dc-shared/tools/content/word-to-pdf` |
| `/africa/acrobat/online/word-to-pdf` | `/dc-shared/tools/content/word-to-pdf` |

A first segment counts as a locale only if it is in the list shared with the
EdgeWorker (`ACROBAT_LOCALES` in `constants.js`). Anything else — `africa` above
— is treated as a section and dropped along with the rest of the folder path.

Because folders are discarded, two source pages can claim the same destination
(`/acrobat/online/word-to-pdf` and `/acrobat/business/word-to-pdf`). The run
**aborts before writing anything** and lists the conflicts, so nothing is
silently overwritten. Resolve with `exclude`.

Non-page assets are not flattened; they keep their own path, with `pathMap`
applied.

---

## 5. Content transforms

Applied in this order:

1. **Origin rewrites** (automatic) — `content.da.live/<srcOrg>/<srcRepo>`,
   `<ref>--<srcRepo>--<srcOrg>.aem.live` and `.aem.page` are retargeted at the
   destination instance.
2. **`rewriteOrigin`** — forces *every* `aem.page` / `aem.live` URL onto a single
   target origin, preserving path, query and hash. The rewritten URLs are
   collected for link checking. Note this flattens branch-specific hosts:
   `stage--da-dc--adobecom.aem.live` becomes the target origin too.
3. `linkRewrites` — extra `{ from, to }` string replacements on `href`, `src`,
   `srcset`, and `alt`.
4. `pathMap` — applied to root-relative links so internal links follow the moved
   pages.
5. `blockRenames` — `{ "old-block": "new-block options" }` class swaps.
6. **`removeNamedBlocks`** — removes blocks by name and prunes any section left
   empty. Matching uses the **first** class only, so
   `unity workflow-prompt-upload product-acrobat` matches `unity` while option
   classes are ignored. Defaults to `breadcrumbs`, `verb-widget`, `unity`,
   `metadata`.
7. `removeBlocks` — CSS selectors to delete, for anything name matching can't
   express.
8. `metadata` — `{ set, remove }` on the `.metadata` block. Mostly redundant when
   `metadata` is in `removeNamedBlocks`.
9. `textReplacements` — `{ pattern, flags, replacement }` regexes on the
   serialized HTML.
10. `customTransform` — your own module, last.

### Why `metadata` is removed

Fragments never render their own `<head>`; the consuming page owns `title`,
`description` and `og:*`. The block's values are still captured into the run
report (`metadata` field per page) before deletion, so nothing is lost.

`section-metadata` is **not** removed — it is block-scoped and still controls
section background and layout once the fragment is inlined.

### Empty fragments

If a page's content lived entirely inside removed blocks, the result would be an
empty `<main>`. Those pages are skipped with status `empty` and logged, rather
than written as blank documents.

### Ordering trap

`blockRenames` runs **before** `removeNamedBlocks`. Renaming a block to a name
not in the removal list will prevent its removal — don't configure both for the
same block.

---

## 6. Link checking and the report

After each page is written, every URL that `rewriteOrigin` touched is probed:

- `aem.page` hosts are normalised to `aem.live` first, since preview is not a
  reliable availability signal.
- `HEAD` is used, falling back to a ranged `GET` for origins that reject it.
- Redirects are followed; only the final status counts.
- Results are cached per URL across the whole run, so a nav link repeated on 200
  pages is fetched once.

Two files are written at the end of the run, covering all pages:

`broken-links.json`

```json
{
  "generatedAt": "2026-10-07T12:00:00.000Z",
  "totals": { "pagesExported": 142, "pagesWithBrokenLinks": 9, "brokenLinks": 23 },
  "pages": [
    {
      "sourcePath": "/acrobat/online/compress-pdf.html",
      "destPath": "/dc-shared/tools/content/compress-pdf.html",
      "destUrl": "https://main--dc-frictionless--adobecom.aem.live/dc-shared/tools/content/compress-pdf",
      "brokenLinks": [
        {
          "authored": "https://main--dc-frictionless--adobecom.aem.live/tools/x",
          "checked": "https://main--dc-frictionless--adobecom.aem.live/tools/x",
          "status": 404,
          "ok": false
        }
      ]
    }
  ]
}
```

`broken-links.csv` — one row per broken link, for sorting in a spreadsheet.
Usually the fastest way to spot that many pages point at the same missing
target, collapsing a long list into one fix.

Pages with no failures are omitted entirely, so the file length tracks your
fix-list rather than the size of the migration.

| Status | Meaning |
| --- | --- |
| `404` | Target genuinely missing on the destination — fix the link or publish the target |
| `0` | Timeout or network error, not a missing page. Re-check before acting |

---

## 7. Run it

### Step 1 — dry run

Always start here. Transformed HTML is written to `.da-migrate-output/pages/`
and the full link report is produced, but **nothing is sent to the destination**.

```bash
export DA_SOURCE_TOKEN='...'
export DA_DEST_TOKEN='...'

npm run da-migrate -- --config tools/da-migrate/config.json --dry-run
```

Inspect a couple of fragments before continuing:

```bash
ls .da-migrate-output/pages/
head -40 .da-migrate-output/broken-links.json
```

### Step 2 — migrate a small slice

Prove the config on two pages before the full set:

```bash
npm run da-migrate -- --config tools/da-migrate/config.json \
  --paths /acrobat/online/compress-pdf \
  --paths /acrobat/online/pdf-to-word
```

Writes are idempotent — `POST` overwrites — so re-running after a transform fix
is safe.

### Step 3 — full run

```bash
npm run da-migrate -- --config tools/da-migrate/config.json
```

Documents are created in DA source only. Review them in da.live.

### Step 4 — publish, when you're ready

```bash
npm run da-migrate -- --config tools/da-migrate/config.json --publish preview
npm run da-migrate -- --config tools/da-migrate/config.json --publish live
```

Preview is required before live; publishing an unpreviewed path returns `404`.

### CLI flags

| Flag | Default | Description |
| --- | --- | --- |
| `--config`, `-c` | — | Migration config JSON (required) |
| `--paths`, `-p` | config `paths` | Paths to migrate; repeatable; folders walked recursively |
| `--paths-file`, `-f` | config `pathsFile` | Text file with one path or URL per line |
| `--dry-run`, `-d` | `false` | Transform only; nothing written to the destination |
| `--out`, `-o` | `./.da-migrate-output` | Dry-run output and `report.json` location |
| `--concurrency` | `4` | Pages processed in parallel |
| `--publish` | config `publish` (`none`) | `none`, `preview`, or `live` |

### Output files

| File | Contents |
| --- | --- |
| `.da-migrate-output/report.json` | Full per-page result: status, removed blocks, captured metadata, media copied |
| `.da-migrate-output/broken-links.json` | Pages with links that failed validation |
| `.da-migrate-output/broken-links.csv` | Same data, flat, one row per broken link |
| `.da-migrate-output/pages/**` | Transformed HTML (dry run only) |

### Page statuses

| Status | Meaning |
| --- | --- |
| `imported` | Written to the destination |
| `dry-run` | Transformed and written to `--out` only |
| `copied` | Binary asset copied as-is |
| `empty` | Skipped: nothing left after block removal |
| `missing` | Source document not found |
| `failed` | Error; sets a non-zero exit code |

---

## 8. GitHub Actions

`DA Migrate` (`.github/workflows/da-migrate.yml`) runs the same script from a
`workflow_dispatch`, with `dry_run` defaulting to `true` and `publish` defaulting
to `none`. The report directory is uploaded as the `da-migrate-report` artifact.

Required secrets:

| Secret | Purpose |
| --- | --- |
| `DA_SOURCE_TOKEN`, `DA_DEST_TOKEN` | Per-instance bearer tokens |
| `ROLLING_IMPORT_IMS_URL`, `ROLLING_IMPORT_CLIENT_ID`, `ROLLING_IMPORT_CLIENT_SECRET`, `ROLLING_IMPORT_CODE`, `ROLLING_IMPORT_GRANT_TYPE` | IMS S2S fallback |
| `AEM_LIVE_ADMIN_TOKEN_DC` | AEM admin token for preview/live |

Prefer the IMS service credentials for scheduled or repeated runs — a
browser-copied token expires within a day and will break the job.

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `401` on every write | Token missing or expired | Re-copy from da.live, or set the IMS S2S variables |
| `403` on every write | Identity not in the destination org | Add the user/technical account in DA admin |
| `429` during a large run | DA write throttling | Lower `--concurrency` |
| Page opens in DA as one unparsed blob | Body wrapper missing | The document must be `<body><header></header><main>…</main><footer></footer></body>` |
| Everything reports status `0` | Network or proxy blocking outbound requests | Check `curl https://main--dc-frictionless--adobecom.aem.live/` works |
| A block wasn't removed | `blockRenames` renamed it first, or it isn't the first class | See the ordering trap in [Content transforms](#5-content-transforms) |
| Page skipped as `empty` | All content was inside removed blocks | Expected; confirm the source page had other content |
