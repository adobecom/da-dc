import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOCK_GRAMMAR, KNOWN_BLOCK_TYPES, SECTION_METADATA } from '../src/extractors.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const grammar = JSON.parse(readFileSync(path.join(here, '../grammar.json'), 'utf-8'));

test('grammar.json blockTypes match BLOCK_GRAMMAR (no drift)', () => {
  assert.deepEqual(grammar.blockTypes, BLOCK_GRAMMAR);
});

test('grammar.json sectionMetadata matches SECTION_METADATA (no drift)', () => {
  assert.deepEqual(grammar.sectionMetadata, SECTION_METADATA);
});

test('KNOWN_BLOCK_TYPES is derived from the grammar', () => {
  assert.deepEqual(KNOWN_BLOCK_TYPES, grammar.blockTypes.map((b) => b.name));
});

test('every mapsTo target is a real semantic key or null', () => {
  const allowed = new Set([null, 'howTo', 'faq']);
  for (const b of grammar.blockTypes) {
    assert.ok(allowed.has(b.mapsTo), `unexpected mapsTo "${b.mapsTo}" on ${b.name}`);
  }
});
