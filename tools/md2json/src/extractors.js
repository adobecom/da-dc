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
 * Block names recognised by the DA/AEM authoring grammar for verb pages. Names
 * not listed here are still parsed structurally but carry no semantic key.
 */
export const KNOWN_BLOCK_TYPES = [
  'Text',
  'How To',
  'Icon Block',
  'Media',
  'Columns',
  'Accordion',
  'Rnr',
  'Section Metadata',
];

/**
 * Section Metadata is a key/value block. These are the values seen in authored
 * verb pages; treat them as the current enum surface, not a hard constraint.
 */
export const SECTION_METADATA = {
  keys: ['style', 'background'],
  // `style` is a space/comma-separated list of tokens; these are the tokens.
  styleTokens: [
    'l spacing',
    's spacing',
    'xl spacing',
    'xxl-spacing',
    'divider',
    'center',
    'three-up',
  ],
  // `background` is a named colour or a hex value.
  backgrounds: ['white', '#fbfbfb'],
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
