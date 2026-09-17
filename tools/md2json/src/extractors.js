/**
 * Semantic extractors: DA blocks → the shape the agentic-seo `verbContent`
 * collection consumes. Each extractor pulls one optional top-level key out of a
 * page's flattened block list and returns `undefined` when the page has no such
 * component — the caller then OMITS the key entirely (see convert.js), so the
 * output maps cleanly onto the consumer's `.optional()` zod fields.
 *
 * To support a new component, add an extractor to EXTRACTORS and document the
 * block → key mapping in README.md + verb-content.schema.json.
 */

import { renderInline, renderBlock } from './markdown.js';

/**
 * The DA/AEM authoring grammar for verb pages: the fixed set of block types,
 * their known variant options (enum surface), and which output key each maps
 * to. This is the canonical source for the machine-readable `grammar.json`
 * (kept in sync by a test) and the README block table.
 *
 * `variants` is the KNOWN enum surface, not an enforced constraint — the
 * converter passes unknown variants through into the raw `blocks[]` catch-all
 * rather than rejecting them. `mapsTo` is the semantic output key (or `null`
 * for blocks that are styling/markers/not-yet-modelled).
 *
 * Values are stored in a canonical readable form. Validation compares
 * case-insensitively AND treats hyphens/spaces as equivalent (see validate.js),
 * so authoring both `l spacing` and `l-spacing`, or `three-up` and `Three up`,
 * matches the same entry. Derived from a survey of the drafts/ruchika fragments
 * and the /acrobat/online verb pages.
 */
export const BLOCK_GRAMMAR = [
  {
    name: 'How To',
    variants: ['large image', 'large media', 'seo', 'container', 'xlarge'],
    mapsTo: 'howTo',
    notes: 'Row 0 = heading + intro + optional video line; row 1 = "-" bulleted steps.',
  },
  {
    name: 'Accordion',
    variants: ['verb subfooter mobile', 'seo'],
    mapsTo: 'faq',
    notes: 'Only the UN-varianted Accordion becomes `faq` (alternating Q/A rows). Variants like "verb subfooter mobile" (related-tools mobile nav) and "seo" are ignored by the faq extractor.',
  },
  {
    name: 'Rnr',
    variants: [],
    mapsTo: null,
    notes: 'The `Verb` row declares the verb id; used to cross-check the filename, not emitted as a component.',
  },
  {
    name: 'Section Metadata',
    variants: [],
    mapsTo: null,
    notes: 'Per-section styling; see `sectionMetadata` enums for `style` / `background` values.',
  },
  {
    name: 'Text',
    variants: ['l body', 'xs body', 'medium', 'large', 'center', 'contained', 'l spacing top', 'l spacing bottom', 's spacing', 's spacing top', 'xl spacing', 'xl spacing top', 'xs spacing bottom'],
    mapsTo: null,
    notes: 'Marketing copy / section headings. Present in raw `blocks[]` only.',
  },
  {
    name: 'Icon Block',
    variants: ['vertical', 'small', 'center', 'xs spacing'],
    mapsTo: null,
    notes: 'SEO feature card: icon + heading + body. Present in raw `blocks[]` only.',
  },
  {
    name: 'Media',
    variants: ['large'],
    mapsTo: null,
    notes: 'Image + copy + CTA links. Present in raw `blocks[]` only.',
  },
  {
    name: 'Columns',
    variants: ['verb subfooter', 'container'],
    mapsTo: null,
    notes: 'Related-tools footer grid. Present in raw `blocks[]` only.',
  },
  {
    name: 'Breadcrumbs',
    variants: [],
    mapsTo: null,
    notes: 'Breadcrumb navigation. Present in raw `blocks[]` only.',
  },
  {
    name: 'Editorial Card',
    variants: ['no border', 'xs body', 'xs heading'],
    mapsTo: null,
    notes: 'Editorial/promo card. Present in raw `blocks[]` only.',
  },
  {
    name: 'Metadata',
    variants: [],
    mapsTo: null,
    notes: 'Page-level metadata (title, description, etc.). Present in raw `blocks[]` only.',
  },
  {
    name: 'Unity',
    variants: ['workflow acrobat'],
    mapsTo: null,
    notes: 'Loads the Unity SDK and wires the verb → DC Hosted bridge. Present in raw `blocks[]` only.',
  },
  {
    name: 'Verb Widget',
    variants: ['combine pdf', 'compress pdf', 'crop pages', 'jpg to pdf', 'pdf to image', 'pdf to word', 'rotate pages', 'split pdf'],
    mapsTo: null,
    notes: 'Newer lightweight verb widget; the variant selects the verb/workflow. Present in raw `blocks[]` only.',
  },
];

/**
 * Block names recognised by the DA/AEM authoring grammar for verb pages. Names
 * not listed here are still parsed structurally but carry no semantic key.
 */
export const KNOWN_BLOCK_TYPES = BLOCK_GRAMMAR.map((b) => b.name);

/**
 * Section Metadata is a key/value block. These are the values authored across
 * the surveyed verb pages, in canonical form (validation is case- and
 * hyphen/space-insensitive, so `Xxl-spacing` matches `xxl spacing`).
 */
export const SECTION_METADATA = {
  keys: ['style', 'background'],
  // `style` is a comma-separated list of (possibly multi-word) tokens.
  styleTokens: [
    'l spacing',
    'l spacing top',
    's spacing',
    'xl spacing',
    'xs spacing',
    'xxl spacing',
    'xxl spacing bottom',
    'divider',
    'center',
    'three up',
    'four up',
    'grid width 10',
  ],
  // `background` is a named colour or a hex value.
  backgrounds: ['white', '#fbfbfb', '#f8f8f8', '#fff'],
};

// `![<fragment-url> \| <caption> \| <icon-hint>][<poster-ref-label>]` — the alt
// text is overloaded by Milo's block-decoration convention to carry the video
// embed target and caption; the reference label points at the poster.
const VIDEO_IMAGE_RE = /^!\[([^\]]*)\]\[([^\]]+)\]$/;

function parseVideoLine(line, linkReferences) {
  const match = line.match(VIDEO_IMAGE_RE);
  if (!match) return undefined;
  const [, altText, label] = match;
  const [fragmentUrl, title] = altText.split(/\s*\\\|\s*/);
  if (!fragmentUrl) return undefined;
  return {
    title: (title ?? '').trim(),
    fragmentUrl: fragmentUrl.trim(),
    posterUrl: linkReferences.get(label),
  };
}

/** How To (large image, ...) block → `howTo`. */
export function extractHowTo(blocks, linkReferences) {
  const block = blocks.find((b) => b.name === 'How To');
  if (!block || block.rows.length === 0) return undefined;

  const introCell = block.rows[0]?.[0] ?? '';
  let heading = '';
  const intro = [];
  let video;

  for (const line of introCell.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) {
      heading = renderInline(trimmed.replace(/^#+\s*/, ''), linkReferences);
      continue;
    }
    const parsedVideo = parseVideoLine(trimmed, linkReferences);
    if (parsedVideo) {
      video = parsedVideo;
      continue;
    }
    intro.push(renderInline(trimmed, linkReferences));
  }

  const stepsCell = block.rows[1]?.[0] ?? '';
  const steps = stepsCell
    .split('\n')
    .filter((line) => line.trim().startsWith('-'))
    .map((line) => renderInline(line.trim().replace(/^-\s*/, ''), linkReferences));

  const howTo = { heading, intro, steps };
  // Omit `video` when the block carries no video line, per the absence rule.
  if (video) howTo.video = video;
  return howTo;
}

/** Plain Accordion block (no variant) → `faq`. */
export function extractFaq(blocks, linkReferences) {
  // Only the plain "Accordion" block is the on-page FAQ — the same block name
  // is reused with a "verb subfooter mobile" variant for the unrelated
  // related-tools mobile nav, which we don't want to pull in here.
  const block = blocks.find((b) => b.name === 'Accordion' && b.variants.length === 0);
  if (!block) return undefined;

  const items = [];
  for (let i = 0; i + 1 < block.rows.length; i += 2) {
    const q = block.rows[i]?.[0];
    const a = block.rows[i + 1]?.[0];
    if (!q || !a) continue;
    items.push({
      q: renderInline(q, linkReferences),
      a: renderBlock(a, linkReferences),
    });
  }
  return items.length ? { items } : undefined;
}

/** Rnr block → the declared verb string (used to cross-check the filename). */
export function extractVerb(blocks) {
  const block = blocks.find((b) => b.name === 'Rnr');
  const row = block?.rows.find((r) => r[0]?.toLowerCase() === 'verb');
  return row?.[1];
}

/**
 * Ordered registry of optional top-level content keys. `convert` runs each and
 * only writes the key when the extractor returns a defined value.
 */
export const EXTRACTORS = [
  { key: 'howTo', extract: (blocks, refs) => extractHowTo(blocks, refs) },
  { key: 'faq', extract: (blocks, refs) => extractFaq(blocks, refs) },
];
