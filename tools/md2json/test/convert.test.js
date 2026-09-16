import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { convert, SCHEMA_VERSION } from '../src/convert.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const sample = readFileSync(path.join(here, 'fixtures/word-to-pdf.md'), 'utf-8');

test('emits versioned combined document with verb/locale', () => {
  const { data } = convert(sample, { verb: 'word-to-pdf', locale: 'en-US' });
  assert.equal(data.schemaVersion, SCHEMA_VERSION);
  assert.equal(data.verb, 'word-to-pdf');
  assert.equal(data.locale, 'en-US');
});

test('extracts howTo heading, intro, steps and video', () => {
  const { data } = convert(sample, { verb: 'word-to-pdf', locale: 'en-US' });
  assert.equal(data.howTo.heading, 'How to convert Word to PDF');
  assert.ok(data.howTo.intro.length >= 1);
  assert.equal(data.howTo.steps.length, 4);
  assert.match(data.howTo.steps[0], /Select a file/);
  assert.match(data.howTo.video.fragmentUrl, /how-to-convert-word-to-pdf/);
  assert.match(data.howTo.video.posterUrl, /\.png/);
});

test('extracts faq items from the plain Accordion block only', () => {
  const { data } = convert(sample, { verb: 'word-to-pdf', locale: 'en-US' });
  assert.equal(data.faq.items.length, 5);
  assert.match(data.faq.items[0].q, /without losing the formatting/);
  // Answers keep block-level HTML (links inside <p>).
  assert.match(data.faq.items[0].a, /^<p>/);
});

test('omits absent keys entirely (absence convention)', () => {
  const noFaq = sample.replace(/\| Accordion +\|/, '| NotAccordion |');
  const { data } = convert(noFaq, { verb: 'word-to-pdf', locale: 'en-US' });
  assert.ok(!('faq' in data), 'faq key must be omitted, not null/empty');
});

test('raw catch-all keeps every block, not just howTo/faq', () => {
  const { data } = convert(sample, { verb: 'word-to-pdf', locale: 'en-US' });
  assert.ok(Array.isArray(data.blocks));
  const names = new Set(data.blocks.map((b) => b.name));
  for (const expected of ['Text', 'How To', 'Icon Block', 'Media', 'Columns', 'Accordion', 'Rnr', 'Section Metadata']) {
    assert.ok(names.has(expected), `blocks should include "${expected}"`);
  }
  // Blocks carry raw Markdown rows + a section index, and variants are parsed.
  const iconBlock = data.blocks.find((b) => b.name === 'Icon Block');
  assert.deepEqual(iconBlock.variants, ['vertical', 'small', 'xs spacing']);
  assert.equal(typeof iconBlock.section, 'number');
  assert.ok(iconBlock.rows[0][0].length > 0);
});

test('linkReferences map is exposed so ![alt][label] rows resolve', () => {
  const { data } = convert(sample, { verb: 'word-to-pdf', locale: 'en-US' });
  assert.match(data.linkReferences.image0, /\.png/);
});

test('warns when Rnr verb disagrees with requested verb', () => {
  const { warnings } = convert(sample, { verb: 'compress-pdf', locale: 'en-US' });
  assert.ok(warnings.some((w) => /word-to-pdf/.test(w)));
});
