/**
 * Orchestrates DA grid-table Markdown → the combined, versioned verb-content
 * JSON that agentic-seo consumes. One object per verb per locale; optional
 * component keys are omitted (never null / empty) when the page lacks them.
 */

import { parseBlockMarkdown } from './gridTable.js';
import { EXTRACTORS, extractVerb } from './extractors.js';

/**
 * Bump the MAJOR when the shape changes in a way that would break an existing
 * loader (renamed/removed key, changed value type); MINOR for additive keys;
 * PATCH for non-structural fixes. Consumers branch on `schemaVersion`.
 */
export const SCHEMA_VERSION = '1.0.0';

/**
 * @param {string} raw  Raw DA `.md` content.
 * @param {{ verb: string, locale: string }} meta
 * @returns {{ schemaVersion: string, verb: string, locale: string, warnings: string[], data: object }}
 *   `data` is the document to publish; `warnings` are non-fatal authoring
 *   mismatches for the caller to surface (not part of the published JSON).
 */
export function convert(raw, { verb, locale }) {
  const { sections, linkReferences } = parseBlockMarkdown(raw);
  const blocks = sections.flatMap((s) => s.blocks);
  const warnings = [];

  const declaredVerb = extractVerb(blocks);
  if (declaredVerb && declaredVerb !== verb) {
    warnings.push(`Rnr block declares verb "${declaredVerb}" but conversion was requested for "${verb}".`);
  }

  // Insertion order defines key order in the emitted JSON.
  const data = { schemaVersion: SCHEMA_VERSION, verb, locale };
  for (const { key, extract } of EXTRACTORS) {
    const value = extract(blocks, linkReferences);
    if (value !== undefined) data[key] = value; // omit-when-absent
  }

  return { schemaVersion: SCHEMA_VERSION, verb, locale, warnings, data };
}
