import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateBlocks } from '../src/validate.js';
import { convert } from '../src/convert.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const sample = readFileSync(path.join(here, 'fixtures/word-to-pdf.md'), 'utf-8');

test('in-grammar blocks produce no warnings (case/Markdown tolerant)', () => {
  const blocks = [
    { name: 'Text', variants: ['l body', 'Center'], rows: [['hi']] },
    { name: 'How To', variants: ['large image', 'seo', 'container'], rows: [['## h'], ['- step']] },
    { name: 'Section Metadata', variants: [], rows: [['style', '**l spacing**, Center'], ['background', '\\#fbfbfb']] },
  ];
  assert.deepEqual(validateBlocks(blocks), []);
});

test('matching is hyphen/space and case insensitive', () => {
  const blocks = [
    // canonical grammar has "l spacing", "three up", "xxl spacing"
    { name: 'Section Metadata', variants: [], rows: [['style', 'l-spacing, Three-Up, Xxl-Spacing']] },
    // grammar has "no border" / "xs heading" for Editorial Card
    { name: 'Editorial Card', variants: ['No-Border', 'XS Heading'], rows: [] },
  ];
  assert.deepEqual(validateBlocks(blocks), []);
});

test('recognises the newly surveyed block types (Verb Widget, Unity, etc.)', () => {
  const blocks = [
    { name: 'Verb Widget', variants: ['jpg to pdf'], rows: [] },
    { name: 'Unity', variants: ['workflow acrobat'], rows: [] },
    { name: 'Breadcrumbs', variants: [], rows: [] },
    { name: 'Metadata', variants: [], rows: [] },
  ];
  assert.deepEqual(validateBlocks(blocks), []);
});

test('flags unknown block, unknown variant, and bad Section Metadata values', () => {
  const blocks = [
    { name: 'Bogus', variants: [], rows: [] },
    { name: 'Icon Block', variants: ['wat'], rows: [] },
    { name: 'Section Metadata', variants: [], rows: [['style', 'nope'], ['background', 'pink'], ['weirdkey', 'x']] },
  ];
  const w = validateBlocks(blocks);
  assert.ok(w.some((x) => /Unknown block type "Bogus"/.test(x)));
  assert.ok(w.some((x) => /Unknown variant "wat" on "Icon Block"/.test(x)));
  assert.ok(w.some((x) => /style token "nope"/.test(x)));
  assert.ok(w.some((x) => /background "pink"/.test(x)));
  assert.ok(w.some((x) => /unknown key "weirdkey"/.test(x)));
});

test('warnings are de-duplicated', () => {
  const blocks = [
    { name: 'Icon Block', variants: ['wat'], rows: [] },
    { name: 'Icon Block', variants: ['wat'], rows: [] },
  ];
  assert.equal(validateBlocks(blocks).length, 1);
});

test('validation runs by default in convert() and can be disabled', () => {
  const on = convert(sample, { verb: 'word-to-pdf', locale: 'en-US' });
  const off = convert(sample, { verb: 'word-to-pdf', locale: 'en-US', validate: false });
  assert.ok(on.warnings.length > off.warnings.length);
});

test('validation surfaces the real "verb subfooter moblie" typo in the sample', () => {
  // The authored fixture misspells the mobile-nav Accordion variant; the enum
  // catches it. (Functionality is unaffected — that block is ignored anyway.)
  const { warnings } = convert(sample, { verb: 'word-to-pdf', locale: 'en-US' });
  assert.ok(warnings.some((w) => /moblie/.test(w)), 'expected a warning about the "moblie" typo');
});
