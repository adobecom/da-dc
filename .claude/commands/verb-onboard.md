# /verb-onboard — Onboard a New Verb

Add a new verb to one of the three upload blocks, write unit tests, and open a PR.

## Inputs

If the user provided arguments, parse them:
- First arg: verb name (e.g. `essay-writer`)
- Second arg: block name (`verb-widget`, `study-marquee`, or `verb-marquee`)

If any required input is missing, gather them now using `AskUserQuestion` before doing anything else.

---

## Step 1 — Gather & Confirm Inputs

Ask the user to confirm the following. You may batch independent questions into one `AskUserQuestion` call.

### 1a. Block name

Options: `verb-widget`, `study-marquee`, `verb-marquee`

- **verb-widget** — Full-featured upload widget. Supports every verb type, mobile/tablet variants, upsell wall, SVG verb icon, redirect map. Use for most net-new verbs.
- **study-marquee** — Learning/study tools layout. All existing verbs share the `STUDY_GENAI` config (100-file multi-upload, study file types, GenAI terms). Use when the verb is a study/learning tool (quiz, flashcard, mindmap style).
- **verb-marquee** — Simplified marquee layout. Leaner than verb-widget; no upsell wall, no mobile-app variant. Use for conversion-focused landing pages.

### 1b. Verb name

Kebab-case string, e.g. `essay-writer`, `pdf-summarizer`. This becomes the CSS class on the block element and the key in `LIMITS`.

### 1c. File-limit configuration — prompt every field individually

Ask the user for **each field** using `AskUserQuestion`. You may batch independent questions into one call, but all fields must be explicitly confirmed. Do not silently assume a preset — the user's answers drive the final config object.

**Field 1 — `maxFileSize`** (single-select)
- 100 MB — `104857600` *(most common)*
- 250 MB — `262144000`
- 2 GB — `2147483648`
- Custom — ask user to type the exact byte value

**Field 2 — `acceptedFiles`** (multi-select)
- All types — `.pdf .doc .docx .xml .ppt .pptx .xls .xlsx .rtf .txt .text .ai .form .bmp .gif .indd .jpeg .jpg .png .psd .tif .tiff` (maps to `ALL_FILES`)
- PDF — `.pdf`
- Word — `.doc`, `.docx`
- PowerPoint — `.ppt`, `.pptx`
- Excel — `.xls`, `.xlsx`
- Images — `.bmp`, `.gif`, `.jpeg`, `.jpg`, `.png`, `.tif`, `.tiff`
- Text — `.txt`, `.text`, `.rtf`
- Study types — `.pdf .doc .docx .xls .xlsx .ppt .pptx .rtf .txt .text .vtt` (maps to `STUDENT_FILES`)

Build the `acceptedFiles` array from the chosen groups. If "All types" is selected alone, use the `ALL_FILES` constant reference in code instead of an inline array. If "Study types" is selected alone, use `STUDENT_FILES`. Otherwise build a custom inline array.

Also use this answer to set the `file-limit` placeholder value in Step 6 (e.g. `"PDF, Word, PPT, up to 100 MB"`).

**Field 3 — `maxNumFiles`** (single-select)
- 1 *(single-file verb)*
- 100
- Unlimited *(omit the field from the config object)*
- Custom — ask user to type the number

**Field 4 — `multipleFiles`** (single-select)
- false — single file only
- true — allow multiple files

**Field 5 — `uploadType`** (single-select)
- None *(omit field)*
- `multifile-only` — required for verbs that use the multi-file uploader UI

**Field 6 — `genAI`** (single-select)
- false *(omit field)*
- true — verb uses GenAI; adds terms-of-service acknowledgement to the UI

**Field 7 — Additional flags** *(verb-widget only — ask only when block is `verb-widget`)*

Ask as a multi-select, all optional:
- `mobileApp` — show app-store link on mobile instead of file picker
- `typeOneLanding` — keep type1 accounts on the landing page
- `level: 0` — trial mode (no file picker, shows pricing CTA)
- `subCopy` — show sub-description text from placeholders

**Field 8 — `noRedirectTimeout`** *(all blocks)*

- false *(omit field)* — after upload, `redirectReady` is dispatched after a 3-second timeout, giving Adobe Analytics time to fire its done callback first (default for most verbs)
- true — `redirectReady` is dispatched immediately on upload, skipping the 3-second wait (use when the verb handles its own redirect timing, e.g. `word-to-pdf`, `jpg-to-pdf`)

After collecting all answers, map them to the closest named constant if an exact match exists (e.g. `{ maxFileSize: MB100, acceptedFiles: PDF_ONLY, maxNumFiles: 1 }` → `SINGLE_PDF`) so the generated code stays readable. If no named constant matches, write the config inline.

### 1d. Verb icon SVG *(verb-widget only)*

If the block is `verb-widget`, ask the user to provide the SVG for the verb icon. This is required — every verb in `acrobat/blocks/verb-widget/icons/` must have a matching `<verb>.svg` file.

Tell the user:
> "Please share the SVG for `<verb>`. You can either:
> - **Paste the SVG markup** directly into the chat, or
> - **Provide the file path** on your machine and I will read it."

Once received, validate it is well-formed SVG (starts with `<svg` and ends with `</svg>`). If the user provides a file path, read it with the Read tool.

**Once all inputs are confirmed, display a summary and ask for a final go-ahead before making any file changes.**

Summary format:
```
Block:         <block-name>
Verb:          <verb-name>
Config:        { maxFileSize: ..., acceptedFiles: [...], ... }
Accepted files: <list of chosen extensions, or "All types">
Files that will change:
  - acrobat/blocks/<block>/<block>.js                  (add LIMITS entry)
  - acrobat/blocks/verb-widget/icons/<verb>.svg         (new file — verb-widget only)
  - test/blocks/<block>/mocks/body-<verb>.html          (new file)
  - test/blocks/<block>/<block>.test.js                 (add test cases)
  - test/blocks/<block>/mocks/placeholders.json         (add placeholder keys)
```

---

## Step 2 — Write the verb icon SVG *(verb-widget only)*

Skip this step entirely for `study-marquee` and `verb-marquee`.

Write the SVG content provided in Step 1d to:

```
acrobat/blocks/verb-widget/icons/<verb>.svg
```

Use the Write tool. Do not wrap it in any other tags or add anything to the file — the raw SVG markup only.

Verify the file exists with a quick `ls acrobat/blocks/verb-widget/icons/<verb>.svg` before moving on.

---

## Step 3 — Update LIMITS in the block JS

Read the block JS file first, then apply the correct edit.

### verb-widget — `acrobat/blocks/verb-widget/verb-widget.js`

The LIMITS object spans roughly lines 72–101. Add the new verb entry inside it.

**If using a named preset constant** (SINGLE_PDF, MULTI_PDF, MULTI_ALL, GENAI_MULTI):
```js
// single entry
'<verb>': SINGLE_PDF,

// with extra flags
'<verb>': { ...SINGLE_PDF, mobileApp: true },

// grouped with other verbs that share the same config
...group(['existing-verb', '<verb>'], MULTI_PDF),
```

**If custom config:**
```js
'<verb>': { maxFileSize: <bytes>, acceptedFiles: ['.pdf', ...], maxNumFiles: <n>, ... },
```

Check whether an existing `group()` call uses the same config — if so, add the new verb to that array instead of creating a new entry.

If `noRedirectTimeout` is true, spread it into the config:
```js
'<verb>': { ...MULTI_ALL, noRedirectTimeout: true },
```

### study-marquee — `acrobat/blocks/study-marquee/study-marquee.js`

Line 35. Add the new verb name to the existing array:
```js
// Before
export const LIMITS = { ...group(['quiz-maker', 'flashcard-maker', 'mindmap-maker'], STUDY_GENAI) };

// After (example adding 'essay-writer')
export const LIMITS = { ...group(['quiz-maker', 'flashcard-maker', 'mindmap-maker', '<verb>'], STUDY_GENAI) };
```

If the new verb needs a **different** config from STUDY_GENAI, spread the new entry alongside:
```js
export const LIMITS = {
  ...group(['quiz-maker', 'flashcard-maker', 'mindmap-maker'], STUDY_GENAI),
  '<verb>': { <custom config> },
};
```

### verb-marquee — `acrobat/blocks/verb-marquee/verb-marquee.js`

The LIMITS object is at lines 10–14. Same pattern as verb-widget:
```js
export const LIMITS = {
  fillsign: { ...SINGLE_PDF, mobileApp: true },
  'summarize-pdf': { maxFileSize: MB100, acceptedFiles: ALL_FILES, maxNumFiles: 1, genAI: true },
  ...group(['word-to-pdf', 'jpg-to-pdf'], { ...MULTI_ALL, noRedirectTimeout: true }),
  '<verb>': <config>,   // ← add here
};
```

If `noRedirectTimeout` is true for the new verb, spread it into the config object. If the new verb shares a `group()` call with existing verbs that also have `noRedirectTimeout: true`, add it to that group array. Otherwise create a new entry or group with the flag included:
```js
'<verb>': { ...MULTI_ALL, noRedirectTimeout: true },
// or
...group(['existing-verb', '<verb>'], { ...MULTI_ALL, noRedirectTimeout: true }),
```

---

## Step 4 — Create the test mock HTML file

Create `test/blocks/<block>/mocks/body-<verb>.html`.

Use the matching pattern for the block:

### verb-widget mock
```html
<main>
  <div>
    <div class="verb-widget <verb>">
      <div>
        <div>
          <h1 id="<verb>"><Verb human-readable title></h1>
        </div>
      </div>
      <div>
        <div>{{verb-widget-legal}}</div>
      </div>
    </div>
    <div class="unity workflow-acrobat"></div>
  </div>
</main>
```

### study-marquee mock
```html
<main>
  <div>
    <div class="study-marquee <verb>">
      <div>
        <picture>
          <source type="image/webp" srcset="./media_background.png" media="(min-width: 600px)">
          <source type="image/webp" srcset="./media_background_mobile.png">
          <img loading="lazy" alt="" src="./media_background.png" width="2000" height="1200">
        </picture>
      </div>
      <div>
        <div>
          <h1 id="<verb>"><Verb human-readable title></h1>
        </div>
        <div>
          <picture>
            <source type="image/webp" srcset="./media_foreground.png" media="(min-width: 600px)">
            <source type="image/webp" srcset="./media_foreground_mobile.png">
            <img loading="lazy" alt="" src="./media_foreground.png" width="800" height="600">
          </picture>
        </div>
      </div>
    </div>
    <div class="unity workflow-acrobat"></div>
  </div>
</main>
```

### verb-marquee mock
```html
<main>
  <div>
    <div class="verb-marquee <verb>">
      <div>
        <div>
          <h1><Verb human-readable title></h1>
        </div>
      </div>
    </div>
    <div class="unity workflow-acrobat"></div>
  </div>
</main>
```

---

## Step 5 — Add test cases to the test file

Read the existing test file first. Add the new test cases **before the closing `});`** of the `describe` block.

### verb-widget — `test/blocks/verb-widget/verb-widget.test.js`

Add one test that initialises the new verb. The `beforeEach` already loads `body-sign-pdf.html`; override with the new mock inside the test:

```js
it('init <verb> block', async () => {
  document.body.innerHTML = await readFile({ path: './mocks/body-<verb>.html' });
  const conf = getConfig();
  setConfig({ ...conf, locale: { prefix: '' } });
  const block = document.body.querySelector('.verb-widget');
  await init(block);
  expect(block.classList.contains('<verb>')).to.be.true;
  expect(document.querySelector('.verb-widget .acrobat-icon svg')).to.exist;
  expect(document.querySelector('.verb-widget #file-upload')).to.exist;
});
```

Also verify the LIMITS export. Add **once** at the top of the describe block if a LIMITS export test does not already exist, otherwise append to the existing one:

```js
it('exports LIMITS for <verb>', () => {
  const { LIMITS: l } = await import('../../../acrobat/blocks/verb-widget/verb-widget.js');
  expect(l).to.have.property('<verb>');
  expect(l['<verb>'].acceptedFiles).to.be.an('array');
  expect(l['<verb>'].maxFileSize).to.equal(<maxFileSizeBytes>);
});
```

> Note: verb-widget's test file imports only `default: init`, not LIMITS. Add `LIMITS` to the destructured import at the top if it's not already there.

### study-marquee — `test/blocks/study-marquee/study-marquee.test.js`

1. **Extend the existing LIMITS test** — add the new verb to the existing `'exports LIMITS ...'` test:
```js
expect(LIMITS).to.have.property('<verb>');
expect(LIMITS['<verb>'].acceptedFiles).to.be.an('array');
expect(LIMITS['<verb>'].maxFileSize).to.equal(104857600);
expect(LIMITS['<verb>'].multipleFiles).to.be.true;
```

2. **Add an init test** that loads the new mock:
```js
it('init <verb> block', async () => {
  document.body.innerHTML = await readFile({ path: './mocks/body-<verb>.html' });
  const block = document.body.querySelector('.study-marquee');
  const conf = getConfig();
  setConfig({ ...conf, locale: { prefix: '' } });
  await init(block);
  expect(block.classList.contains('<verb>')).to.be.true;
  expect(document.querySelector('.study-marquee .study-marquee-dropzone')).to.exist;
});
```

### verb-marquee — `test/blocks/verb-marquee/verb-marquee.test.js`

The `beforeEach` loads `body-word-to-pdf.html`. Add a new test overriding with the verb's mock:

```js
it('init <verb> block', async () => {
  document.body.innerHTML = await readFile({ path: './mocks/body-<verb>.html' });
  const conf = getConfig();
  setConfig({ ...conf, locale: { prefix: '' } });
  const block = document.body.querySelector('.verb-marquee');
  await init(block);
  expect(block.classList.contains('<verb>')).to.be.true;
  expect(document.querySelector('.verb-marquee .acrobat-icon svg')).to.exist;
  expect(document.querySelector('.verb-marquee .verb-marquee-cta')).to.exist;
  expect(document.querySelector('.verb-marquee .verb-marquee-dropzone')).to.exist;
});
```

---

## Step 6 — Update test placeholders.json

Read the existing `test/blocks/<block>/mocks/placeholders.json`. Append the verb-specific placeholder keys to the `data` array and increment `total` accordingly.

### verb-widget placeholder keys
```json
{ "key": "verb-widget-<verb>-description", "value": "<Human-readable description>" },
{ "key": "verb-widget-<verb>-mobile-description", "value": "<Mobile description>" },
{ "key": "verb-widget-<verb>-alt", "value": "<Alt text for verb icon>" }
```
If the config has `subCopy: true`, also add:
```json
{ "key": "verb-widget-<verb>-sub-description", "value": "<Sub-description text>" }
```

### study-marquee placeholder keys
```json
{ "key": "study-marquee-<verb>-copy", "value": "<Body copy text>" },
{ "key": "study-marquee-<verb>-mobile-copy", "value": "<Mobile copy text>" },
{ "key": "study-marquee-<verb>-sub-copy", "value": "<Sub copy text>" },
{ "key": "study-widget-<verb>-dragndrop-text", "value": "or drag and drop files" },
{ "key": "study-widget-<verb>-file-limit", "value": "PDF, Word, PPT, XLS, TXT, up to 100 MB" }
```

### verb-marquee placeholder keys
```json
{ "key": "verb-marquee-<verb>-copy", "value": "<Body copy text>" },
{ "key": "verb-marquee-<verb>-mobile-copy", "value": "<Mobile copy text>" },
{ "key": "verb-marquee-<verb>-sub-copy", "value": "<Sub copy text>" },
{ "key": "verb-widget-<verb>-dragndrop-text", "value": "or drag and drop a file" },
{ "key": "verb-widget-<verb>-file-limit", "value": "PDF, up to 100 MB" }
```

Use sensible placeholder values derived from the verb name (e.g. `essay-writer` → `"Write better essays with AI"`). Ask the user if they want to provide specific copy, otherwise generate reasonable defaults.

---

## Step 7 — Run the targeted tests

```bash
npx wtr "test/blocks/<block>/<block>.test.js" --node-resolve --port=2000
```

Fix any failures before proceeding. Common issues:
- `LIMITS` not exported from the import statement at the top of the test → add it
- Placeholder key missing → add to placeholders.json
- HTML mock has wrong class name → verify `class="<block> <verb>"`

---

## Step 8 — Run the full test suite

```bash
npm test
```

All tests must be green before creating the PR. Fix any regressions.

---

## Step 9 — Create the PR

If not already provided, ask the user for the **Jira ticket number** (e.g. `194527` from `MWPW-194527`).

The feature branch name follows the pattern **`MWPW-<number>`** (e.g. `MWPW-194527`).

```bash
# Create and switch to the feature branch
git checkout -b MWPW-<number>

# Stage only the files changed for this verb
# (include the SVG line only when block is verb-widget)
git add acrobat/blocks/<block>/<block>.js \
        acrobat/blocks/verb-widget/icons/<verb>.svg \   # verb-widget only
        test/blocks/<block>/<block>.test.js \
        test/blocks/<block>/mocks/body-<verb>.html \
        test/blocks/<block>/mocks/placeholders.json

git commit -m "$(cat <<'EOF'
[Verb Onboard] Add <verb> to <block>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

Then push and open the PR against `stage`:

```bash
gh pr create \
  --base stage \
  --title "Add <verb> verb to <block>" \
  --body "$(cat <<'EOF'
## Summary
- Adds \`<verb>\` to the \`LIMITS\` object in \`acrobat/blocks/<block>/<block>.js\`
- Config: \`<config summary>\`
- Adds verb icon SVG at \`acrobat/blocks/verb-widget/icons/<verb>.svg\` *(verb-widget only)*
- Includes unit test mock HTML and test cases in \`test/blocks/<block>/\`

## Test plan
- [ ] \`npx wtr "test/blocks/<block>/<block>.test.js" --node-resolve --port=2000\` passes
- [ ] \`npm test\` full suite passes
- [ ] Block renders on a local dev page with class \`.<block> .<verb>\`
- [ ] File picker accepts the configured file types and size limits

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Return the PR URL to the user.
