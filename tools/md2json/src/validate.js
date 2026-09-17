/**
 * Grammar validation: check authored blocks against the enum surface declared
 * in the grammar (BLOCK_GRAMMAR / SECTION_METADATA) and return human-readable
 * warnings for anything outside it — an unknown block type, a variant not in a
 * block's enum, or a Section Metadata style/background value not in its enum.
 *
 * These are WARNINGS, not errors: the converter still emits the block into the
 * raw `blocks[]` catch-all (nothing is dropped). Comparison is case-insensitive
 * and tolerant of Markdown noise (`**bold**`, escaped `\#`) so it flags real
 * drift/typos rather than cosmetic differences. Use the CLI `--strict` flag to
 * turn any warning into a non-zero exit for CI.
 */

import { BLOCK_GRAMMAR, SECTION_METADATA } from './extractors.js';

/** Strip authoring Markdown noise so enum comparisons see the bare value. */
const clean = (s) => (s ?? '').replace(/\*\*/g, '').replace(/\\/g, '').trim();

/**
 * Normalise for enum comparison: case-insensitive AND hyphen/space-insensitive,
 * so authors may write `l spacing` or `l-spacing`, `three-up` or `Three up`.
 */
const norm = (s) => clean(s).toLowerCase().replace(/[-\s]+/g, ' ').trim();

const BY_NAME = new Map(BLOCK_GRAMMAR.map((b) => [b.name, b]));
const STYLE_TOKENS = new Set(SECTION_METADATA.styleTokens.map(norm));
const BACKGROUNDS = new Set(SECTION_METADATA.backgrounds.map(norm));
const META_KEYS = new Set(SECTION_METADATA.keys.map((k) => k.toLowerCase()));

function validateSectionMetadata(block) {
  const warnings = [];
  for (const row of block.rows) {
    const key = clean(row[0]).toLowerCase();
    const value = clean(row[1]);
    if (!key) continue;
    if (!META_KEYS.has(key)) {
      warnings.push(`Section Metadata: unknown key "${key}" (known: ${SECTION_METADATA.keys.join(', ')}).`);
      continue;
    }
    if (!value) continue;
    if (key === 'style') {
      // `style` is a comma-separated list of (possibly multi-word) tokens.
      for (const token of value.split(/[,\n]/).map((t) => t.trim()).filter(Boolean)) {
        if (!STYLE_TOKENS.has(norm(token))) {
          warnings.push(`Section Metadata style token "${token}" is not in the grammar (known: ${SECTION_METADATA.styleTokens.join(', ')}).`);
        }
      }
    } else if (key === 'background' && !BACKGROUNDS.has(norm(value))) {
      warnings.push(`Section Metadata background "${value}" is not in the grammar (known: ${SECTION_METADATA.backgrounds.join(', ')}).`);
    }
  }
  return warnings;
}

/**
 * @param {{ name: string, variants: string[], rows: string[][] }[]} blocks
 * @returns {string[]} de-duplicated warnings, empty when everything is in-grammar.
 */
export function validateBlocks(blocks) {
  const warnings = [];
  for (const block of blocks) {
    const grammar = BY_NAME.get(block.name);
    if (!grammar) {
      warnings.push(`Unknown block type "${block.name}" — not in the authoring grammar (grammar.json).`);
      continue;
    }
    const known = new Set(grammar.variants.map(norm));
    for (const variant of block.variants) {
      if (!known.has(norm(variant))) {
        warnings.push(`Unknown variant "${variant}" on "${block.name}" block (known: ${grammar.variants.join(', ') || 'none'}).`);
      }
    }
    if (block.name === 'Section Metadata') warnings.push(...validateSectionMetadata(block));
  }
  return [...new Set(warnings)];
}
