/**
 * Markdown → HTML rendering for cell content, using the same
 * unified/remark/rehype stack the agentic-seo consumer uses today. Emitting
 * HTML here (rather than raw Markdown) is deliberate: it lets the consumer drop
 * its own Markdown pipeline entirely and feed these strings straight into
 * `set:html`, byte-for-byte identical to what it produces now.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

function withReferences(markdown, linkReferences) {
  if (linkReferences.size === 0) return markdown;
  const defs = [...linkReferences.entries()].map(([label, url]) => `[${label}]: ${url}`).join('\n');
  return `${markdown}\n\n${defs}`;
}

/**
 * Render a single short passage (an FAQ question, a step, a heading) as inline
 * HTML — unwraps the paragraph tag remark always produces.
 * @param {string} markdown
 * @param {Map<string, string>} linkReferences
 * @returns {string}
 */
export function renderInline(markdown, linkReferences) {
  const html = String(processor.processSync(withReferences(markdown, linkReferences)));
  const match = html.match(/^<p>([\s\S]*)<\/p>\n?$/);
  return match ? match[1] : html.trim();
}

/**
 * Render a passage that may contain multiple paragraphs/lists, keeping the
 * block-level HTML tags (used for FAQ answers).
 * @param {string} markdown
 * @param {Map<string, string>} linkReferences
 * @returns {string}
 */
export function renderBlock(markdown, linkReferences) {
  return String(processor.processSync(withReferences(markdown, linkReferences))).trim();
}
