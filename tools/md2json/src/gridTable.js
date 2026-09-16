/**
 * Parser for the Pandoc-style "grid table" Markdown that Adobe's DA/AEM
 * authoring pipeline exports (e.g. https://main--da-dc--adobecom.aem.live/.../*.md).
 *
 * Document shape:
 *   - Sections are separated by a bare `---` line.
 *   - Each section holds one or more blocks, each a grid table:
 *       +------------------+
 *       | Block Name (var) |   <- header row, always a single column
 *       +------------------+
 *       | cell content ... |   <- data rows, column count can differ
 *       +------------------+      per divider-delimited row
 *   - Blocks are separated from each other (and from any loose, non-table
 *     content) by one or more blank lines.
 *   - Reference-style link/image definitions (`[label]: url`) can appear
 *     anywhere in the file and are collected separately so cell Markdown
 *     using `![alt][label]` can be resolved later.
 *
 * This is a dependency-free JS port of the reference TypeScript parser used by
 * the agentic-seo consumer; keep the two in sync when the DA export changes.
 *
 * @typedef {Object} Block
 * @property {string} name    Block name (header row, parenthetical stripped).
 * @property {string[]} variants  Comma-separated modifiers from the header's `(...)`.
 * @property {string[][]} rows  Data rows only (header row consumed into name/variants).
 *
 * @typedef {Object} Section
 * @property {Block[]} blocks
 *
 * @typedef {Object} ParsedDocument
 * @property {Section[]} sections
 * @property {Map<string, string>} linkReferences
 */

const isDivider = (line) => /^\+[-=+]+\+$/.test(line.trim());

const isTableLine = (line) => {
  const t = line.trim();
  return t.length >= 2 && t.startsWith('|') && t.endsWith('|');
};

/** Split a table content line into raw column fragments on unescaped `|`. */
function splitCells(line) {
  const t = line.trim();
  const inner = t.slice(1, -1);
  return inner.split(/(?<!\\)\|/).map((c) => c.trim());
}

function parseHeader(text) {
  const match = text.match(/^(.*?)(?:\s*\(([^)]*)\))?$/);
  const name = (match?.[1] ?? text).trim();
  const variants = (match?.[2] ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  return { name, variants };
}

function parseBlock(lines) {
  let i = 0;
  if (isDivider(lines[i])) i += 1;

  const rows = [];
  while (i < lines.length) {
    const batch = [];
    while (i < lines.length && isTableLine(lines[i])) {
      batch.push(lines[i]);
      i += 1;
    }
    if (batch.length) {
      const splitLines = batch.map(splitCells);
      const numCols = splitLines[0].length;
      const row = [];
      for (let c = 0; c < numCols; c += 1) {
        row.push(splitLines.map((cols) => cols[c] ?? '').join('\n').trim());
      }
      rows.push(row);
    }
    if (i < lines.length && isDivider(lines[i])) i += 1;
    else if (batch.length === 0) i += 1; // safety net against malformed input
  }

  const [headerRow, ...dataRows] = rows;
  const { name, variants } = parseHeader(headerRow?.[0] ?? '');
  return { name, variants, rows: dataRows };
}

function splitChunks(lines) {
  const chunks = [];
  let current = [];
  for (const line of lines) {
    if (line.trim() === '') {
      if (current.length) chunks.push(current);
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length) chunks.push(current);
  return chunks;
}

const LINK_REFERENCE_RE = /^\[([^\]]+)\]:\s*(\S+)\s*$/gm;

/**
 * @param {string} raw
 * @returns {ParsedDocument}
 */
export function parseBlockMarkdown(raw) {
  const linkReferences = new Map();
  for (const m of raw.matchAll(LINK_REFERENCE_RE)) {
    linkReferences.set(m[1], m[2]);
  }

  const lines = raw.split('\n');
  const sections = [];
  let sectionLines = [];

  const flushSection = () => {
    // Loose, non-table content (bare links, stray reference defs) isn't
    // modeled as a block — only table blocks carry component data today.
    const chunks = splitChunks(sectionLines).filter((chunk) => isDivider(chunk[0]));
    sections.push({ blocks: chunks.map(parseBlock) });
    sectionLines = [];
  };

  for (const line of lines) {
    if (line.trim() === '---') flushSection();
    else sectionLines.push(line);
  }
  flushSection();

  return { sections, linkReferences };
}
