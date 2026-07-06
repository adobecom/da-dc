# /pr-eval — Pre-PR Evaluation Workflow

Run this command after making any code change to verify it's ready to raise as a PR.

## What this does

1. **Identifies** what changed vs the base branch
2. **Checks** that unit tests exist in `test/` for every changed source file
3. **Checks** that nala (e2e) tests exist in `nala/` for every changed block or feature
4. **Writes missing tests** if they don't exist yet
5. **Runs lint** on changed files
6. **Runs targeted unit tests** for the changed code (validates the fix)
7. **Runs full unit regression** to ensure nothing else is broken
8. **Reports** a clear pass/fail with a to-do list for anything blocking the PR

---

## Workflow

Follow these steps in order. Do not skip steps or report success until all pass.

### Step 1 — Run the eval tool (dry run)

```bash
node tools/pr-eval.js --dry-run
```

Review the output:
- Which source files changed?
- Which unit test directories are mapped?
- Which nala test directories are mapped?
- Are any test directories missing?

### Step 2 — Write missing unit tests

For every source file flagged as "MISSING UNIT TESTS":

- Locate the corresponding test directory: `test/blocks/<name>/`, `test/features/<name>/`, `test/utils/`, or `test/scripts/`
- Write a `<name>.test.js` file that tests the changed functionality
- Tests must use the existing test patterns in this repo (Chai with `@esm-bundle/chai`, WTR fixture helpers)
- Cover: the specific fix/feature introduced, edge cases, and any regressions related to the change
- Do NOT write tests for code that wasn't changed

Example: if `libs/blocks/marquee/marquee.js` changed, write tests in `test/blocks/marquee/marquee.test.js`.

### Step 3 — Write missing nala tests

For every block or feature flagged as "MISSING NALA TESTS":

- Locate the nala test directory: `nala/blocks/<name>/` or `nala/features/<name>/`
- Write a `<name>.spec.js` Playwright test file that covers the user-facing behavior
- Follow existing nala test patterns in this repo (Playwright test helper, `test.describe`, `test.step`)
- Cover: the key user interaction or visual outcome the fix/feature produces
- Do NOT write nala tests for utility/scripts changes

Example: if `libs/blocks/marquee/marquee.js` changed, write a spec in `nala/blocks/marquee/marquee.spec.js`.

### Step 4 — Run lint

```bash
npx eslint <changed-js-files>
```

Fix any lint errors before proceeding.

### Step 5 — Run targeted unit tests

```bash
node tools/pr-eval.js --skip-regression
```

This runs only the unit tests for the changed files. All tests must pass.

If tests fail:
- Read the failure output carefully
- Fix either the source code or the test (whichever is wrong)
- Re-run until clean

### Step 6 — Run full regression

```bash
node tools/pr-eval.js
```

This runs the complete unit test suite. All pre-existing tests must still pass.

If regressions appear:
- Identify which existing tests broke
- Determine if the code change was too broad or introduced a side effect
- Fix the source code so the existing tests pass without weakening them

### Step 7 — Final report

```bash
node tools/pr-eval.js
```

Confirm the output shows:
```
✓  PASS — All checks passed. Ready to raise PR.
```

Report to the user:
- What changed (files)
- What tests were written (unit + nala)
- Lint result
- Targeted test result (pass/fail, test count)
- Regression result (pass/fail, test count)
- Nala test files created (remind user to run manually against preview URL)

---

## Standard test patterns in this repo

### Unit test (WTR / Chai)

```javascript
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setConfig } from '../../../libs/utils/utils.js';

// Use actual fixture files in the same directory
const body = await readFile({ path: './mocks/body.html' });

describe('My Block', () => {
  before(() => {
    document.body.innerHTML = body;
    setConfig({ codeRoot: '/libs' });
  });

  it('renders correctly', () => {
    const el = document.querySelector('.my-block');
    expect(el).to.exist;
  });
});
```

### Nala test (Playwright)

```javascript
import { test, expect } from '@playwright/test';
import { WebUtil } from '../../libs/webutil.js';

test.describe('My Block', () => {
  test('renders with correct layout', async ({ page }) => {
    await test.step('Load page with block', async () => {
      await page.goto(`${process.env.BASE_URL}/drafts/nala/blocks/my-block`);
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify block is visible', async () => {
      const block = page.locator('.my-block');
      await expect(block).toBeVisible();
    });
  });
});
```

---

## Rules

- Never report success if `node tools/pr-eval.js` exits with a non-zero code
- Never skip writing tests because the change is "small" — every source change needs a test
- Never weaken existing tests to make them pass
- Always fix the root cause; do not work around failures with try/catch or conditional skips
- Nala tests cannot be run automatically (they require a live URL) — always remind the user to run them manually against their preview branch URL
