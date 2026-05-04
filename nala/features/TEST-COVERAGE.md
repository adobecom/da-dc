# Nala `features/` test coverage

This folder holds Playwright smoke tests for Acrobat marketing and product-surface pages. Each feature area typically has:

- `*.spec.js` — feature metadata: `FeatureName`, `features[]` with `path`, `name`, `tags`, `tcid`
- `*.test.js` — Playwright `test.describe` / `test()` bodies that drive the page object

Use the **test name** (from `feature.name` + `feature.tags`) when filtering in CI or locally.

---

## `acrobat/`

| File | URL (from spec) | What the test exercises |
|------|-----------------|-------------------------|
| `acrobat.spec.js` | `/acrobat` | Data only (`@acrobat-full-smoke`, `@acrobat @smoke @live`, hero title expectation in spec). |
| `acrobat.test.js` | same | **Full homepage smoke:** global nav (`verifyGnavSmoke`), hero marquee (`verifyHeroMarqueeSmoke`), carousel, merch card plans, FAQ accordion, “questions about” section (fragment `/dc-shared/fragments/acrobat/get-acrobat-support`), footer, **all checkout links**. Includes a short `waitForTimeout(1000)` before carousel. `verifyPromoSticky` is commented out. |

---

## `acrobat-pro/`

| File | URL | Coverage |
|------|-----|----------|
| `acrobat-pro.spec.js` | `/acrobat/acrobat-pro` | `@acrobat-pro-smoke`, `@acrobat-pro @smoke @live`. |
| `acrobat-pro.test.js` | same | Global nav smoke, hero marquee, a CTA link to `/go/EditOrganizeDiscover`, merch card plans (tabs), FAQ accordion, questions-about fragment, footer, all checkout links. |

---

## `acrobat-standard/`

| File | URL | Coverage |
|------|-----|----------|
| `acrobat-standard.spec.js` | `/acrobat/acrobat-standard` | `@acrobat-standard-smoke`, `@acrobat-standard @smoke @live`. |
| `acrobat-standard.test.js` | same | Global nav, hero marquee, **merch compare tabs:** Individuals → standard individual cards, Business → business cards, Students & Teachers → those cards; FAQ accordion; questions-about; footer; all checkout links. |

---

## `acrobat-features/`

| File | URL | Coverage |
|------|-----|----------|
| `acrobat-features.spec.js` | Three entries: `/acrobat/features`, `/acrobat/features/modify-pdfs`, `/acrobat/features/export-pdf` | Tags `@features`, `@modify-pdfs`, `@export-pdf`, `@smoke`, `@live`. |
| `acrobat-features.test.js` | **Test 0** — `/acrobat/features` | Gnav smoke; hero links (checkout vs pricing `/acrobat/pricing`); **5 tabs** (`verifyTabs(5)`); merch card plans; questions-about; footer; all checkout links. |
| | **Test 1** — `/acrobat/features/modify-pdfs` | Gnav; merch plans; **students & teachers** merch cards; questions-about; footer; checkout links. |
| | **Test 2** — `/acrobat/features/export-pdf` | Gnav; merch plans; cycles Individuals / Business / Students & Teachers tabs with matching `verify*MerchCards` helpers; questions-about; footer; checkout links. (`verifyThreeUpEditorialCards` commented out.) |

---

## `ai-pdf/`

| File | URL | Coverage |
|------|-----|----------|
| `ai-pdf.spec.js` | `/acrobat/generative-ai-pdf`, `/acrobat/generative-ai-pdf/students` | `@ai-pdf`, `@students`, `@smoke`, `@live`. |
| `ai-pdf.test.js` | **Both URLs** (via `features.forEach`) | **Light smoke per URL:** `expect` hero title, global nav, first footer block visible; `verifyAllCheckoutLinks`. No FAQ/merch/tab deep checks. |

---

## `business/`

| File | URL | Coverage |
|------|-----|----------|
| `business.spec.js` | `/acrobat/business`, `/acrobat/business/sign`, `/acrobat/business/pricing-plans` | `@business`, `@sign`, `@pricing-plans`, `@smoke`, `@live`. |
| `business.test.js` | **`/acrobat/business`** | Business comparison table; footer; all checkout links. (Full gnav check commented out.) |
| | **`/acrobat/business/sign`** | Business “sign” merch cards; all checkout links. |
| | **`/acrobat/business/pricing-plans`** | `waitForTimeout(10000)` then **multiple** comparison tables; footer; all checkout links. |

---

## `campaign/`

| File | URL | Coverage |
|------|-----|----------|
| `campaign.spec.js` | `/acrobat/campaign/acrobats-got-it` | `@campaign`, `@acrobats-got-it`, `@smoke`, `@live`. |
| `campaign.test.js` | same | **Campaign merch:** exactly **2** cards; Acrobat Pro card, price, free trial + **Buy now** visibility, enabled state, and **specific `data-wcs-osi` attributes**; Acrobat Pro **Teams** card, price, free trial, pricing link (href matches `pricing/business`); `verifyAllCheckoutLinks`. |

---

## `free-trial/`

| File | URL | Coverage |
|------|-----|----------|
| `free-trial.spec.js` | `/acrobat/free-trial-download` | `@free-trial`, `@smoke`, `@live`. |
| `free-trial.test.js` | same | Gnav smoke; priced SKU strip for combined OSIs; **two** Acrobat Pro free-trial checkout locators (first + nth(1)) visible/enabled; Buy Now link scrolled into view, visible/enabled; footer; all checkout links. |

---

## `generative-ai/`

| File | URL | Coverage |
|------|-----|----------|
| `generative-ai.spec.js` | `/acrobat/generative-ai-pdf`, `/acrobat/generative-ai-pdf/students` | `@generative-ai`, `@students`, `@smoke`, `@live`. |
| `generative-ai.test.js` | **Main** | Gnav; resolves a specific checkout link by OSI; merch card plans; FAQ accordion; footer; all checkout links. |
| | **Students** | Gnav; students “buy now” checkout link visible/enabled; **`verifyGenAiStudentsPromptTabs`**; FAQ; footer; all checkout links. |

*Note:* `ai-pdf` and `generative-ai` target the same base paths but **`generative-ai.test.js` is deeper** (merch, FAQ, students tabs); **`ai-pdf.test.js` is a thinner shell check** (hero + gnav + footer + checkouts).

---

## `online/`

| File | URL | Coverage |
|------|-----|----------|
| `online.spec.js` | `/acrobat/online` | `@online`, `@smoke`, `@live`. |
| `online.test.js` | same (forEach over features; currently one) | **Light smoke:** hero title, gnav, footer, `verifyAllCheckoutLinks`. Uses default `page.goto` (no `waitUntil` override). |

---

## `pdf-reader/`

| File | URL | Coverage |
|------|-----|----------|
| `pdf-reader.spec.js` | `/acrobat/pdf-reader` | `@pdf-reader`, `@smoke`, `@live`. |
| `pdf-reader.test.js` | same | Gnav smoke; merch card plans; tab cycle Individuals / Business / Students & Teachers with matching merch verifiers; **FAQ accordion call commented out**; questions-about (`get-acrobat-support`); footer; all checkout links. |

---

## `pdf-solution/`

| File | URL | Coverage |
|------|-----|----------|
| `pdf-solution.spec.js` | `/acrobat/complete-pdf-solution`, same with `?ttid=edit-pdf` | `@pdf-solution`, `@edit-pdf`, `@smoke`, `@live`. |
| `pdf-solution.test.js` | **Default page** | Acrobat Pro+AI **price** visible; free trial and buy-now checkout groups (first/last) visible/enabled; **plans & pricing tabs** for PDF solution; FAQ accordion; questions-about (`acrobat-here-to-help-blade`); **`verifyFooterOptions`** (not generic footer); all checkout links. |
| | **`?ttid=edit-pdf`** | Same checkout free-trial assertions; plans/pricing tabs; FAQ; questions-about; footer options; all checkout links (no price assertion block at start). |

---

## `pricing/`

| File | URL | Coverage |
|------|-----|----------|
| `pricing.spec.js` | `/acrobat/pricing`, `/acrobat/pricing/students`, `/acrobat/pricing/compare-versions`, `/acrobat/pricing/business` | `@pricing`, `@students`, `@compare`, `@business`, `@smoke`, `@live`. |
| `pricing.test.js` | **Individuals** | Pricing merch cards; comparison table; section toggle; compare link; FAQ; questions-about (`acrobat-here-to-help-blade`); footer options; all checkout links. |
| | **Students** | Students pricing merch cards; checkout link in editorial card; **table basics**; legal text block visible; questions-about; footer options; checkouts. |
| | **Compare versions** | Gnav smoke; compare-versions table; one specific checkout OSI visible/enabled; FAQ; **standard** `verifyFooter` (not footer options); checkouts. |
| | **Business** | Business pricing merch cards; business comparison table; comparison section toggle; FAQ; questions-about; footer options; checkouts. |

---

## How to extend

1. Add or edit a row in the feature’s `*.spec.js` (`path`, `name`, `tags`).
2. Add a matching `test()` (or extend `features.forEach`) in `*.test.js`.
3. Implement or reuse selectors/assertions on the co-located `*.page.js` page object.

---

## Quick reference: spec → primary user-facing path

| Folder | Primary paths |
|--------|----------------|
| `acrobat` | `/acrobat` |
| `acrobat-pro` | `/acrobat/acrobat-pro` |
| `acrobat-standard` | `/acrobat/acrobat-standard` |
| `acrobat-features` | `/acrobat/features`, `.../modify-pdfs`, `.../export-pdf` |
| `ai-pdf` | `/acrobat/generative-ai-pdf` (+ `/students`) |
| `business` | `/acrobat/business`, `.../sign`, `.../pricing-plans` |
| `campaign` | `/acrobat/campaign/acrobats-got-it` |
| `free-trial` | `/acrobat/free-trial-download` |
| `generative-ai` | `/acrobat/generative-ai-pdf` (+ `/students`) |
| `online` | `/acrobat/online` |
| `pdf-reader` | `/acrobat/pdf-reader` |
| `pdf-solution` | `/acrobat/complete-pdf-solution` (+ `?ttid=edit-pdf`) |
| `pricing` | `/acrobat/pricing`, `.../students`, `.../compare-versions`, `.../business` |
