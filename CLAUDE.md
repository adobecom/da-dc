# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **DC x Milo** — Adobe Document Cloud's web front-end built on [Milo](https://github.com/adobecom/milo), Adobe's content framework. The site is authored in AEM (Adobe Experience Manager) via Document Authoring (DA) and rendered using the Edge Delivery Services (EDS/Helix) model. All page content is driven by document-authored HTML; JavaScript blocks enhance that content on the client side.

## Development

```bash
# Install AEM CLI globally (one-time)
sudo npm install -g @adobe/aem-cli

# Start local dev server at http://localhost:3000
aem up
```

Use `?milolibs=local` in the URL to point to a locally-running Milo instance instead of the CDN.

## Testing

```bash
npm run test           # Run all (WTR + Jest)
npm run wtr            # Web Test Runner unit tests
npm run jest           # Jest unit tests (*.jest.js files)
npm run wtr:watch      # WTR in watch mode
npm run jest:watch     # Jest in watch mode
npm run lint           # JS + CSS lint

# Run a single WTR test file
npm run wtr:file -- ./test/blocks/dc-converter-widget/dc-converter-widget.test.js

# Run a single Jest test file
npm run jest:file -- test/scripts/scripts.jest.js
```

WTR tests use `*.test.js` / `*.test.html` filenames; Jest tests use `*.jest.js`. Both live under `test/`.

### Nala (Playwright E2E)

```bash
npx playwright install          # One-time setup

npm run nala local              # All tests against localhost:3000
npm run nala stage              # Against www.stage.adobe.com
npm run nala main               # Against main--da-dc--adobecom.aem.live
npm run nala <branch>           # Against <branch>--da-dc--adobecom.aem.live

# Filter by tag, browser, or specific file
npm run nala stage nala/verbs/word-pdf/word-to-pdf.test.js mode=ui browser=firefox
npm run nala main -g=@smoke
```

Nala tests live under `nala/verbs/` (per-verb flows) and `nala/features/` (site-wide features).

## Architecture

### Block system (Milo pattern)

Each block in `acrobat/blocks/<block-name>/` exports a default `init(block)` function called by Milo's `loadArea`. The block's CSS lives alongside the JS.

**Key blocks:**
- `dc-converter-widget` — The primary PDF-tool widget. On pages that include it, `scripts.js` detects it early, fast-tracks its load before Milo, and preloads a cached HTML snippet from `dc-generate-cache`. The widget calls into `dc_hosted` (injected by the Unity SDK at runtime).
- `verb-widget` — A newer, lighter wrapper around the same verb flow, used on AI-tool pages.
- `unity` — Loads the Unity SDK (Adobe's file-conversion backend) and wires the verb → DC Hosted bridge.
- `mobile-widget` — Variant of `dc-converter-widget` used on mobile when `meta[name="mobile-widget"]` is `true`.

### `acrobat/scripts/scripts.js`

Page bootstrapper. Runs before Milo loads. Responsibilities:
1. Detects `dc-converter-widget` / `mobile-widget` and fast-tracks them.
2. Resolves which Milo libs URL to use (`setLibs`) — supports `?milolibs=` override.
3. Sets the Milo `CONFIG` (locales, IMS client ID, PDF viewer client IDs per environment, CSP, Jarvis, etc.).
4. Loads IMS, sets up SUSI auth callbacks, loads Lana logging, then calls `loadArea`.

**Do not modify `imsScope` without reading the IMS Scope Update Guide** (linked in a prominent warning comment in the file).

### `acrobat/scripts/utils.js`

Shared utilities for blocks: `setLibs`/`getLibs` (singleton), `getEnv` (prod/stage/dev detection), `isOldBrowser`.

### Milo dependency resolution

Blocks and scripts import from Milo dynamically at runtime via the resolved `miloLibs` URL (e.g. `https://main--milo--adobecom.aem.live/libs`). Jest module name mappings in `package.json` redirect these URLs to `test/mocks/milo/libs/` for unit testing.

### Edgeworkers

`edgeworkers/Acrobat_DC_web_prod/` contains Akamai EdgeWorker code (runs at the CDN edge). It is built/deployed separately via `npm run ewbuild` / `npm run ewprod2stg`. Tests are in `test/edgeworkers/` and run with `npm run ewtest`.

### Nala test structure

Each Nala verb test has three files:
- `*.page.js` — Page Object Model (locators, actions)
- `*.spec.js` — Shared test spec definitions  
- `*.test.js` — Playwright test file that composes specs with page objects

## Branch & PR conventions

- Branch names must match the Jira ticket: `MWPW-{number}` (e.g. `MWPW-12345`)
- PR descriptions must include `Resolves: [MWPW-XXXXXX](https://jira.corp.adobe.com/browse/MWPW-XXXXXX)` and test URLs for both `main` and the feature branch:
  - `https://main--da-dc--adobecom.aem.live/acrobat/online/compress-pdf`
  - `https://mwpw-XXXXXX--da-dc--adobecom.aem.live/acrobat/online/compress-pdf`
