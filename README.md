# DC x Milo

[![codecov](https://codecov.io/github/adobecom/dc/graph/badge.svg)](https://codecov.io/github/adobecom/dc)

## Developing
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `sudo npm install -g @adobe/aem-cli`
1. Run `aem up` this repo's folder. (opens your browser at `http://localhost:3000`)
1. Open this repo's folder in your favorite editor and start coding.

## Testing

Run both Web Test Runner and Jest unit tests
```
npm run test
```
Run Web Test Runner unit tests
```
npm run wtr
```
Run Jest unit tests
```
npm run jest
```
Debug Web Test Runner unit tests
```
npm run wtr:watch
```
Debug Jest unit tests
```
npm run jest:watch
```
To run E2E tests, see [README](./test/e2e/README.md) in `/test/e2e`

### Nala (Playwright) tests

Nala lives under `nala/` and is invoked with `npm run nala` (see `nala/utils/nala.run.js`). One-time setup:

```bash
npm install
npx playwright install
```

The first argument is the **environment** (base URL). Tests use Playwright’s `baseURL` and paths such as `/acrobat/online/...`, so the host must **not** end with `/` (the runner normalizes this).

| Environment | Command | Base URL (this repo) |
|---------------|---------|----------------------|
| **prod** | `npm run nala prod` | `https://www.adobe.com` |
| **stage** | `npm run nala stage` | `https://www.stage.adobe.com` |
| **main** (AEM preview) | `npm run nala main` | `https://main--da-dc--adobecom.aem.live` |
| **local** | `npm run nala local` | `http://localhost:3000` (run `aem up` first) |
| **Feature branch** (AEM preview) | `npm run nala <branch>` | `https://<branch>--da-dc--adobecom.aem.live` |

Examples:

```bash
# All Nala tests on production (default project: da-dc-live-chromium)
npm run nala prod

# Stage
npm run nala stage

# AEM preview for branch `automation-testing` (hostname uses the same string)
npm run nala automation-testing

# Fork or different GitHub org (repo slug still da-dc unless you pass repo=)
npm run nala my-feature owner=otherorg

# One file, headed browser (UI mode), Firefox project
npm run nala stage nala/verbs/word-pdf/word-to-pdf.test.js mode=ui browser=firefox

# Filter by Playwright tag / annotation
npm run nala main -g=@smoke
```

Optional environment variables:

- **`LOCAL_TEST_LIVE_URL`** — Overrides the resolved base URL when set (useful for a one-off URL). Do not add a trailing slash.
- **`UNITY_LIBS`** — Appended to navigations in Unity verb tests (e.g. `?unitylibs=...`). Leave unset if you do not need it.

More options: `npm run nala help`.

