/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
const { JSDOM } = require('jsdom');
const { BINARY_EXTS, DA_CONTENT_ORIGIN } = require('./constants.js');

const URL_ATTRS = ['href', 'src', 'srcset', 'alt'];
const URL_LIKE = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|\.{1,2}\/)/i;

// Page links leave the aem.* preview hosts and resolve against production.
const PAGE_ORIGIN = 'https://www.adobe.com';

// Page-level blocks that carry no meaning once the page becomes a fragment.
const DEFAULT_FRAGMENT_BLOCKS = ['breadcrumbs', 'verb-widget', 'unity', 'metadata'];

function instanceOrigins({ org, repo, ref = 'main' }) {
  return {
    content: `${DA_CONTENT_ORIGIN}/${org}/${repo}`,
    aemLive: `https://${ref}--${repo}--${org}.aem.live`,
    aemPage: `https://${ref}--${repo}--${org}.aem.page`,
  };
}

/** Origin pairs that are always rewritten source -> dest, plus any configured extras. */
function buildRewrites(source, dest, extras = []) {
  const from = instanceOrigins(source);
  const to = instanceOrigins(dest);
  return [
    { from: from.content, to: to.content },
    { from: from.aemLive, to: to.aemLive },
    { from: from.aemPage, to: to.aemPage },
    ...extras,
  ].filter((rule) => rule.from && rule.from !== rule.to);
}

function rewriteUrls(document, rewrites, pathMapper) {
  document.querySelectorAll(URL_ATTRS.map((attr) => `[${attr}]`).join(',')).forEach((el) => {
    URL_ATTRS.forEach((attr) => {
      const value = el.getAttribute(attr);
      if (!value) return;
      let next = rewrites.reduce((acc, rule) => acc.replaceAll(rule.from, rule.to), value);
      if (pathMapper && next.startsWith('/')) next = pathMapper(next);
      if (next !== value) el.setAttribute(attr, next);
    });
  });
}

function renameBlocks(document, renames) {
  const entries = Object.entries(renames);
  if (!entries.length) return;
  document.querySelectorAll('main > div > div[class]').forEach((block) => {
    entries.forEach(([from, to]) => {
      if (!block.classList.contains(from)) return;
      block.classList.remove(from);
      to.split(' ').filter(Boolean).forEach((cls) => block.classList.add(cls));
    });
  });
}

function removeBlocks(document, selectors) {
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => el.remove());
  });
}

// Block options are trailing classes (`unity workflow-prompt-upload ...`),
// so only the first class identifies the block.
function blockName(el) {
  return el.className.trim().split(/\s+/)[0];
}

/** Removes named blocks and prunes sections that only existed to host them. */
function removeNamedBlocks(document, names) {
  const wanted = new Set(names);
  const removed = [];
  document.querySelectorAll('main div[class]').forEach((el) => {
    const name = blockName(el);
    if (!wanted.has(name)) return;
    const section = el.parentElement;
    el.remove();
    removed.push(name);
    if (section && section.children.length === 0) section.remove();
  });
  return removed;
}

function isMatchingHost(hostname, hosts) {
  return hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

/**
 * Repoints aem.page / aem.live URLs and returns the rewritten absolute URLs for
 * downstream validation. Assets and anything copied to the destination follow
 * the content to `target`; page links point back at production as `.html`.
 */
function forceOrigin(document, {
  target,
  matchHosts = ['aem.page', 'aem.live'],
  pageOrigin = PAGE_ORIGIN,
  keepOnTarget = [],
  ownHosts = [],
}) {
  const targetUrl = new URL(target);
  const pageUrl = new URL(pageOrigin);
  const touched = [];

  document.querySelectorAll(URL_ATTRS.map((attr) => `[${attr}]`).join(',')).forEach((el) => {
    URL_ATTRS.forEach((attr) => {
      const value = el.getAttribute(attr);
      if (!value || value.startsWith('#') || value.startsWith('data:')) return;
      // `alt` is in URL_ATTRS for Milo's modal links, so prose must not be resolved as a URL.
      if (!URL_LIKE.test(value)) return;
      // Milo encodes modal links as `url | link text | icon`; only the URL may be re-encoded.
      const [, head, tail] = attr === 'alt'
        ? value.trim().match(/^(\S+)([\s\S]*)$/)
        : [null, value, ''];
      let url;
      try {
        url = new URL(head, targetUrl);
      } catch {
        return;
      }
      if (!isMatchingHost(url.hostname, matchHosts)) return;

      const ext = url.pathname.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
      const isAsset = Boolean(ext && BINARY_EXTS.includes(ext));
      const isCopied = keepOnTarget.some((prefix) => url.pathname.startsWith(prefix));

      if (isCopied) {
        // Shared content is mirrored on the source repo, so it moves whatever host it names.
        url.protocol = targetUrl.protocol;
        url.host = targetUrl.host;
      } else if (isAsset) {
        // Other repos serve their own assets, so only ours are repointed.
        if (ownHosts.length && !ownHosts.includes(url.hostname)) return;
        url.protocol = targetUrl.protocol;
        url.host = targetUrl.host;
      } else {
        url.protocol = pageUrl.protocol;
        url.host = pageUrl.host;
        if (!ext) url.pathname = `${url.pathname.replace(/\/$/, '')}.html`;
      }
      el.setAttribute(attr, `${url.toString()}${tail}`);
      touched.push(url.toString());
    });
  });

  return [...new Set(touched)];
}

/**
 * Links are often authored with the URL as their visible text. Rewriting only the
 * href would leave the old origin on screen, so matching text is updated too.
 */
function rewriteLinkText(document, { target, matchHosts = ['aem.page', 'aem.live'] }) {
  const { origin } = new URL(target);
  const hosts = matchHosts.map((host) => host.replace(/\./g, '\\.')).join('|');
  const pattern = new RegExp(`https?://[\\w.-]*(?:${hosts})\\S*`, 'g');
  const updated = [];

  document.querySelectorAll('a').forEach((anchor) => {
    // The href is already rewritten, so the visible URL mirrors it exactly.
    const href = anchor.getAttribute('href') || origin;
    [...anchor.childNodes]
      .filter((node) => node.nodeType === 3)
      .forEach((node) => {
        const next = node.nodeValue.replace(pattern, href);
        if (next === node.nodeValue) return;
        node.nodeValue = next;
        updated.push(next.trim());
      });
  });

  return updated;
}

function metadataRows(block) {
  return [...block.querySelectorAll(':scope > div')].map((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    return { row, key: cells[0]?.textContent.trim().toLowerCase(), value: cells[1] };
  });
}

/**
 * Removes an entire section when it contains a link matching one of the prefixes.
 * Used for CaaS collections, which are authored as a bare link in their own section.
 */
function removeSectionsByLink(document, prefixes = []) {
  const removed = [];
  if (!prefixes.length) return removed;

  document.querySelectorAll('main > div').forEach((section) => {
    const match = [...section.querySelectorAll('a[href]')].find((anchor) => prefixes
      .some((prefix) => anchor.getAttribute('href').startsWith(prefix)));
    if (!match) return;
    section.remove();
    removed.push(match.getAttribute('href'));
  });

  return removed;
}

/** Drops the whole section a block sits in, not just the block. */
function removeSectionsWithBlock(document, names = []) {
  const removed = [];
  if (!names.length) return removed;
  const wanted = new Set(names);

  document.querySelectorAll('main > div').forEach((section) => {
    const match = [...section.querySelectorAll('div[class]')]
      .find((el) => wanted.has(blockName(el)));
    if (!match) return;
    section.remove();
    removed.push(blockName(match));
  });

  return removed;
}

/**
 * Finds linked documents/assets that must also exist on the destination for a
 * page to work, e.g. the video modal fragment referenced by a how-to block.
 * Scoped to `blocks` when given, so unrelated links are not dragged along.
 */
function collectDependencies(document, { blocks = [], pathPrefixes = [] } = {}) {
  if (!pathPrefixes.length) return [];

  const scopes = blocks.length
    ? [...document.querySelectorAll('main div[class]')].filter((el) => blocks.includes(blockName(el)))
    : [document];

  const selector = URL_ATTRS.map((attr) => `[${attr}]`).join(',');
  const paths = scopes.flatMap((scope) => [...scope.querySelectorAll(selector)]
    // Milo encodes video modal links in an image `alt`, so every URL attr counts.
    .flatMap((el) => URL_ATTRS.map((attr) => el.getAttribute(attr)))
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value.trim().split(/\s+/)[0], 'https://placeholder.invalid').pathname;
      } catch {
        return null;
      }
    })
    .filter((p) => p && pathPrefixes.some((prefix) => p.startsWith(prefix))));

  return [...new Set(paths)];
}

/** Captures the metadata block before it is dropped so values survive in the report. */
function extractMetadata(document) {
  const block = [...document.querySelectorAll('main div[class]')]
    .find((el) => blockName(el) === 'metadata');
  if (!block) return {};
  return Object.fromEntries(metadataRows(block)
    .filter((entry) => entry.key)
    .map((entry) => [entry.key, entry.value?.textContent.trim() || '']));
}

function updateMetadata(document, { set = {}, remove = [] } = {}, selector = '.metadata') {
  const setEntries = Object.entries(set);
  if (!setEntries.length && !remove.length) return;

  let block = document.querySelector(selector);
  if (!block && setEntries.length) {
    const section = document.querySelector('main > div:last-child') || document.querySelector('main');
    if (!section) return;
    block = document.createElement('div');
    block.className = selector.replace(/^\./, '').replaceAll('.', ' ');
    section.append(block);
  }
  if (!block) return;

  const removeKeys = remove.map((key) => key.toLowerCase());
  metadataRows(block).forEach(({ row, key }) => {
    if (removeKeys.includes(key)) row.remove();
  });

  setEntries.forEach(([key, value]) => {
    const existing = metadataRows(block).find((entry) => entry.key === key.toLowerCase());
    if (existing?.value) {
      existing.value.textContent = value;
      return;
    }
    const row = document.createElement('div');
    const keyCell = document.createElement('div');
    const valueCell = document.createElement('div');
    keyCell.textContent = key;
    valueCell.textContent = value;
    row.append(keyCell, valueCell);
    block.append(row);
  });
}

function applyTextReplacements(html, replacements) {
  return replacements.reduce((acc, rule) => {
    const pattern = new RegExp(rule.pattern, rule.flags || 'g');
    return acc.replace(pattern, rule.replacement ?? '');
  }, html);
}

/** Finds assets on the source DA instance that the page references. */
function collectSourceMedia(html, source) {
  const { content } = instanceOrigins(source);
  // `)` is allowed so filenames like `banner (1).png` survive, then trimmed when unbalanced.
  const trimUnbalanced = (url) => url.replace(/\)+$/, (tail) => {
    const open = (url.match(/\(/g) || []).length;
    const close = (url.match(/\)/g) || []).length;
    return tail.slice(0, Math.max(0, tail.length - (close - open)));
  });
  const matches = html.match(new RegExp(`${content}/[^"'\\s]+`, 'g')) || [];
  const fromContent = matches.map((url) => trimUnbalanced(url).slice(content.length));
  // DA media is usually authored against the aem.* hosts or root-relative.
  const media = (html.match(/\/media_[^"'\s]+/g) || []).map(trimUnbalanced);
  return [...new Set([...fromContent, ...media].map((p) => p.split(/[?#]/)[0]))];
}

/**
 * Applies every configured content update to a page's DA HTML.
 * `ctx` = { source, dest, sourcePath, destPath, config, pathMapper, customTransform }.
 * Returns the HTML plus what was stripped/rewritten so the caller can report on it.
 */
async function transformHtml(html, ctx) {
  const {
    source, dest, config, pathMapper, customTransform,
  } = ctx;
  const transforms = config.transforms || {};

  const dom = new JSDOM(html);
  const { document } = dom.window;

  rewriteUrls(document, buildRewrites(source, dest, transforms.linkRewrites), pathMapper);
  // rewriteUrls has already moved source URLs onto the dest host, so both count as ours.
  const ownHosts = [source, dest]
    .flatMap((instance) => {
      const { aemLive, aemPage } = instanceOrigins(instance);
      return [new URL(aemLive).hostname, new URL(aemPage).hostname];
    });
  const rewrittenLinks = transforms.rewriteOrigin
    ? forceOrigin(document, {
      keepOnTarget: config.copyDependencies?.pathPrefixes || [],
      ownHosts,
      ...transforms.rewriteOrigin,
    })
    : [];
  const rewrittenLinkText = transforms.rewriteOrigin
    && transforms.rewriteOrigin.updateLinkText !== false
    ? rewriteLinkText(document, transforms.rewriteOrigin)
    : [];
  renameBlocks(document, transforms.blockRenames || {});

  const metadata = extractMetadata(document);
  const removedSections = [
    ...removeSectionsByLink(document, transforms.removeSectionsWithLink),
    ...removeSectionsWithBlock(document, transforms.removeSectionsWithBlock),
  ];
  const removedBlocks = removeNamedBlocks(
    document,
    transforms.removeNamedBlocks || DEFAULT_FRAGMENT_BLOCKS,
  );
  removeBlocks(document, transforms.removeBlocks || []);
  updateMetadata(document, transforms.metadata, transforms.metadataSelector || '.metadata');
  // Collected after removals so assets inside dropped blocks are not copied.
  const dependencies = collectDependencies(document, config.copyDependencies);

  const main = document.querySelector('main');
  const empty = !main || main.children.length === 0;

  let output = document.body.outerHTML;
  output = applyTextReplacements(output, transforms.textReplacements || []);
  if (customTransform) output = await customTransform(output, ctx);
  return {
    html: output,
    dependencies,
    metadata,
    removedBlocks,
    removedSections,
    rewrittenLinks,
    rewrittenLinkText,
    empty,
  };
}

module.exports = {
  collectDependencies,
  collectSourceMedia,
  extractMetadata,
  forceOrigin,
  instanceOrigins,
  removeNamedBlocks,
  removeSectionsByLink,
  removeSectionsWithBlock,
  rewriteLinkText,
  transformHtml,
};
