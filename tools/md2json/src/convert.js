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
 *
 * 1.1.0 — added `blocks` (raw catch-all of every parsed block) and
 *         `linkReferences` (reference-style link/image definitions).
 * 1.0.0 — `howTo` / `faq` semantic keys.
 */
export const SCHEMA_VERSION = '1.1.0';

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

  // Semantic convenience keys (rendered, omit-when-absent).
  for (const { key, extract } of EXTRACTORS) {
    const value = extract(blocks, linkReferences);
    if (value !== undefined) data[key] = value;
  }

  // Raw catch-all: every parsed block in document order, verbatim (raw cell
  // Markdown, not rendered), tagged with its section index so nothing is lost
  // and consumers can map blocks we don't semantically model yet.
  data.blocks = sections.flatMap((section, sectionIndex) => section.blocks.map((b) => ({
    section: sectionIndex,
    name: b.name,
    variants: b.variants,
    rows: b.rows,
  })));

  // Reference-style link/image definitions (`[label]: url`) collected from the
  // whole file, so raw block rows using `![alt][label]` remain resolvable.
  data.linkReferences = Object.fromEntries(linkReferences);

  return { schemaVersion: SCHEMA_VERSION, verb, locale, warnings, data };
}
