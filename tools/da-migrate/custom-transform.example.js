/* eslint-disable no-console */
/**
 * Escape hatch for content updates the declarative config can't express.
 * Receives the already-transformed DA HTML and must return HTML.
 */
module.exports = async function customTransform(html, { destPath }) {
  if (!destPath.startsWith('/tools/')) return html;
  return html;
};
