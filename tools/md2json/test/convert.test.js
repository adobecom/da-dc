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

test('warns when Rnr verb disagrees with requested verb', () => {
  const { warnings } = convert(sample, { verb: 'compress-pdf', locale: 'en-US' });
  assert.ok(warnings.some((w) => /word-to-pdf/.test(w)));
});
