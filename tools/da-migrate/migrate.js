/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const yargs = require('yargs');
// eslint-disable-next-line import/no-extraneous-dependencies
const { hideBin } = require('yargs/helpers');

const {
  aemAction, getSource, putSource, walkFolder,
} = require('./da-client.js');
const { collectSourceMedia, transformHtml } = require('./transforms.js');
const { checkLinks } = require('./link-check.js');
const { writeLinkReport, writeMediaReport } = require('./report.js');
const { BINARY_EXTS, ACROBAT_LOCALES, CONTENT_ROOT } = require('./constants.js');

const { argv } = yargs(hideBin(process.argv))
  .usage('Usage: $0 --config <file> [options]')
  .option('config', {
    alias: 'c',
    describe: 'Path to the migration config JSON',
    demandOption: true,
    type: 'string',
  })
  .option('paths', {
    alias: 'p',
    describe: 'Override the config paths (repeatable)',
    type: 'array',
  })
  .option('paths-file', {
    alias: 'f',
    describe: 'Text file with one path or URL per line (# comments allowed)',
    type: 'string',
  })
  .option('dry-run', {
    alias: 'd',
    describe: 'Transform and write results to disk without touching the destination',
    type: 'boolean',
    default: false,
  })
  .option('out', {
    alias: 'o',
    describe: 'Directory for dry-run output and the run report',
    type: 'string',
    default: './.da-migrate-output',
  })
  .option('concurrency', {
    describe: 'Number of pages processed in parallel',
    type: 'number',
    default: 4,
  })
  .option('publish', {
    describe: 'Destination AEM action after import (defaults to none: source is written only)',
    choices: ['none', 'preview', 'live'],
  })
  .help();

function loadConfig(configPath) {
  const resolved = path.resolve(configPath);
  const config = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  if (!config.source?.org || !config.source?.repo) throw new Error('config.source.org and config.source.repo are required.');
  if (!config.dest?.org || !config.dest?.repo) throw new Error('config.dest.org and config.dest.repo are required.');
  config.customTransform = config.customTransform
    // eslint-disable-next-line global-require, import/no-dynamic-require
    ? require(path.resolve(path.dirname(resolved), config.customTransform))
    : null;
  return config;
}

function makePathMapper({ pathMap = [] } = {}) {
  const rules = pathMap.map((rule) => ({ from: new RegExp(rule.from), to: rule.to }));
  return (p) => rules.reduce((acc, rule) => acc.replace(rule.from, rule.to), p);
}

/**
 * Flattens a page path to its leaf name under the shared content root, keeping a
 * leading locale segment: /fr/acrobat/online/word-to-pdf -> /fr/dc-shared/tools/content/word-to-pdf
 */
function makeDestPath({ contentRoot = CONTENT_ROOT, locales = ACROBAT_LOCALES } = {}) {
  const root = `/${contentRoot.replace(/^\/|\/$/g, '')}`;
  return (sourcePath) => {
    const ext = sourcePath.match(/\.[a-z0-9]+$/i)?.[0] || '';
    const segments = sourcePath.slice(0, sourcePath.length - ext.length).split('/').filter(Boolean);
    const name = segments[segments.length - 1];
    const locale = segments.length > 1 && locales.has(segments[0]) ? `/${segments[0]}` : '';
    return `${locale}${root}/${name}${ext}`;
  };
}

function makeExcluder(exclude = []) {
  const patterns = exclude.map((pattern) => new RegExp(pattern));
  return (p) => patterns.some((pattern) => pattern.test(p));
}

/** One path or URL per line; blank lines and `#` comments are ignored. */
function readPathsFile(filePath) {
  const resolved = path.resolve(filePath);
  const lines = fs.readFileSync(resolved, 'utf8')
    .split('\n')
    .map((line) => line.replace(/#.*$/, '').trim())
    .filter(Boolean);
  if (!lines.length) throw new Error(`No paths found in ${resolved}`);
  return lines;
}

/**
 * Accepts either a bare DA path or a full aem.live/aem.page URL. A URL always
 * denotes a single page; a bare path without an extension is walked as a folder.
 */
function parseEntry(entry, source) {
  if (!/^https?:\/\//i.test(entry)) {
    return { path: entry.replace(/\/$/, ''), isPage: /\.[a-z0-9]+$/i.test(entry) };
  }

  const url = new URL(entry);
  const [subdomain] = url.hostname.split('.');
  const parts = subdomain.split('--');
  if (parts.length !== 3 || !/\.aem\.(live|page)$/.test(url.hostname)) {
    throw new Error(`Not an AEM URL: ${entry}`);
  }

  const [ref, repo, org] = parts;
  if (org !== source.org || repo !== source.repo) {
    throw new Error(`${entry} is ${org}/${repo}, but config.source is ${source.org}/${source.repo}`);
  }
  if (ref !== (source.ref || 'main')) {
    console.warn(`  ! ${entry} is ref "${ref}"; reading DA source for "${source.ref || 'main'}"`);
  }

  const pagePath = url.pathname.endsWith('/') ? `${url.pathname}index` : url.pathname;
  return { path: pagePath, isPage: true };
}

async function resolveFiles(source, paths, isExcluded) {
  const files = [];
  const seen = new Set();
  for (const entry of paths) {
    const { path: entryPath, isPage } = parseEntry(entry, source);
    let found;
    if (isPage) {
      const ext = entryPath.match(/\.([a-z0-9]+)$/i)?.[1] || 'html';
      found = [{ path: entryPath.replace(/\.[^.]+$/, ''), ext }];
    } else {
      found = await walkFolder(source, entryPath);
    }
    found.forEach((file) => {
      const key = `${file.path}.${file.ext}`;
      if (seen.has(key) || isExcluded(key)) return;
      seen.add(key);
      files.push(file);
    });
  }
  return files;
}

async function copyMedia(html, { source, dest, dryRun }) {
  const mediaPaths = collectSourceMedia(html, source);
  const copied = [];
  const missing = [];
  for (const mediaPath of mediaPaths) {
    if (dryRun) {
      copied.push(mediaPath);
      // eslint-disable-next-line no-continue
      continue;
    }
    const blob = await getSource(source, mediaPath, { binary: true });
    if (!blob) {
      console.warn(`  ! media missing on source: ${mediaPath}`);
      missing.push(mediaPath);
      // eslint-disable-next-line no-continue
      continue;
    }
    await putSource(dest, mediaPath, blob, mediaPath.split('.').pop());
    try {
      await aemAction(dest, mediaPath, 'preview');
      await aemAction(dest, mediaPath, 'live');
    } catch (e) {
      console.warn(`  ! media publish failed: ${mediaPath} (${e.message})`);
    }
    copied.push(mediaPath);
  }
  return { copied, missing };
}

function writeDryRun(outDir, destPath, html) {
  const target = path.join(outDir, 'pages', destPath.replace(/^\//, ''));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
  return target;
}

// Shared across pages so a fragment referenced by many pages is copied once.
const copiedDependencies = new Map();

/**
 * Copies a linked document or asset to the destination at the same path and
 * previews it, so the rewritten link resolves instead of 404ing.
 * Existing destination content is left as-is.
 */
async function copyDependency(depPath, ctx) {
  const { source, dest, config, dryRun } = ctx;
  if (copiedDependencies.has(depPath)) return copiedDependencies.get(depPath);

  const ext = depPath.match(/\.([a-z0-9]+)$/i)?.[1];
  const binary = Boolean(ext && BINARY_EXTS.includes(ext));
  const srcPath = binary ? depPath : `${depPath}.html`;

  const run = (async () => {
    if (dryRun) return { path: srcPath, status: 'dry-run' };
    if (await getSource(dest, srcPath, { binary }) !== null) {
      return { path: srcPath, status: 'exists' };
    }
    const body = await getSource(source, srcPath, { binary });
    if (body === null) return { path: srcPath, status: 'missing' };
    await putSource(dest, srcPath, body, binary ? ext : 'html');
    // Assets and video fragments are previewed and published so the links
    // resolve; the migrated content fragment itself stays unpublished.
    if (config.copyDependencies?.preview !== false) {
      try {
        await aemAction(dest, depPath, 'preview');
        await aemAction(dest, depPath, 'live');
      } catch (e) {
        return { path: srcPath, status: 'copied', previewError: e.message };
      }
    }
    return { path: srcPath, status: 'copied' };
  })();

  copiedDependencies.set(depPath, run);
  return run;
}

async function migrateFile(file, ctx) {
  const {
    source, dest, config, pathMapper, destPathFor, dryRun, outDir, publish,
  } = ctx;
  const sourcePath = `${file.path}.${file.ext}`;
  // Only pages are flattened into the content root; assets keep their own path.
  const destPath = file.ext === 'html' ? destPathFor(sourcePath) : pathMapper(sourcePath);
  const result = { sourcePath, destPath, media: [] };

  if (BINARY_EXTS.includes(file.ext)) {
    const blob = await getSource(source, sourcePath, { binary: true });
    if (!blob) return { ...result, status: 'missing' };
    if (!dryRun) await putSource(dest, destPath, blob, file.ext);
    return { ...result, status: dryRun ? 'dry-run' : 'copied' };
  }

  const html = await getSource(source, sourcePath);
  if (html === null) return { ...result, status: 'missing' };

  let transformed = html;
  if (file.ext === 'html') {
    const output = await transformHtml(html, {
      source,
      dest,
      sourcePath,
      destPath,
      config,
      pathMapper,
      customTransform: config.customTransform,
    });
    transformed = output.html;
    result.metadata = output.metadata;
    result.removedBlocks = output.removedBlocks;
    result.removedSections = output.removedSections;
    result.dependencies = output.dependencies;
    result.rewrittenLinks = output.rewrittenLinks;
    result.rewrittenLinkText = output.rewrittenLinkText;
    // Fragments whose content lived entirely in removed blocks are not worth writing.
    if (output.empty) {
      console.warn(`  ! empty after block removal: ${sourcePath}`);
      return { ...result, status: 'empty' };
    }
  }

  if (config.copyMedia !== false && file.ext === 'html') {
    const { copied, missing } = await copyMedia(html, { source, dest, dryRun });
    result.media = copied;
    // `/media_*` lives on the media bus, not in DA source, so absence there proves nothing:
    // only report what the reader still references and the destination cannot serve.
    const stillUsed = missing.filter((p) => transformed.includes(p));
    const destOrigin = `https://${dest.ref || 'main'}--${dest.repo}--${dest.org}.aem.live`;
    const unresolved = await checkLinks(
      stillUsed.map((p) => `${destOrigin}${p}`),
      config.linkCheck,
    );
    result.missingMedia = stillUsed.filter(
      (p) => unresolved.some((link) => link.authored.endsWith(p)),
    );
  }

  // Dependencies are copied before the page so its links resolve immediately.
  if (file.ext === 'html' && result.dependencies?.length) {
    result.dependencyResults = await Promise.all(
      result.dependencies.map((depPath) => copyDependency(depPath, ctx)),
    );
    result.dependencyResults
      .filter((dep) => dep.status === 'missing')
      .forEach((dep) => console.warn(`  ! dependency missing on source: ${dep.path}`));
  }

  if (dryRun) {
    result.output = writeDryRun(outDir, destPath, transformed);
  } else {
    await putSource(dest, destPath, transformed, file.ext);
  }

  // Link health is reported, never a gate: the document is written either way.
  if (file.ext === 'html' && config.linkCheck?.enabled !== false) {
    result.brokenLinks = await checkLinks(result.rewrittenLinks || [], config.linkCheck);
  }

  const previewPath = destPath.replace(/\.html$/, '').replace(/\/index$/, '/');
  result.destUrl = `https://${dest.ref || 'main'}--${dest.repo}--${dest.org}.aem.live${previewPath}`;

  if (dryRun) return { ...result, status: 'dry-run' };

  if (publish !== 'none' && file.ext === 'html') {
    await aemAction(dest, previewPath, 'preview');
    if (publish === 'live') await aemAction(dest, previewPath, 'live');
  }

  return { ...result, status: 'imported' };
}

async function runPool(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  const config = loadConfig(argv.config);
  const source = { ...config.source, side: 'source' };
  const dest = { ...config.dest, side: 'dest' };
  const dryRun = argv['dry-run'];
  const outDir = path.resolve(argv.out);
  const publish = argv.publish || config.publish || 'none';
  const pathMapper = makePathMapper({ pathMap: config.pathMap });
  const destPathFor = makeDestPath({ contentRoot: config.dest.contentRoot });
  const isExcluded = makeExcluder(config.exclude);
  const pathsFile = argv['paths-file'] || config.pathsFile;
  let paths;
  if (argv.paths?.length) {
    paths = argv.paths;
  } else if (pathsFile) {
    paths = readPathsFile(pathsFile);
    console.log(`Loaded ${paths.length} path(s) from ${pathsFile}`);
  } else {
    paths = config.paths;
  }

  if (!paths?.length) throw new Error('No paths to migrate. Set config.paths, --paths, or --paths-file.');

  console.log(`Source: ${source.org}/${source.repo}`);
  console.log(`Dest:   ${dest.org}/${dest.repo}${dryRun ? ' (dry run)' : ''}`);

  const files = await resolveFiles(source, paths, isExcluded);
  console.log(`Found ${files.length} file(s) to migrate.\n`);

  // Flattening discards folders, so two pages can claim the same destination.
  const claims = new Map();
  files.filter((file) => file.ext === 'html').forEach((file) => {
    const sourcePath = `${file.path}.${file.ext}`;
    const destPath = destPathFor(sourcePath);
    claims.set(destPath, [...(claims.get(destPath) || []), sourcePath]);
  });
  const collisions = [...claims].filter(([, sources]) => sources.length > 1);
  if (collisions.length) {
    collisions.forEach(([destPath, sources]) => {
      console.error(`collision ${destPath} <- ${sources.join(', ')}`);
    });
    throw new Error(`${collisions.length} destination path collision(s). Exclude or rename the duplicates.`);
  }

  const ctx = {
    source, dest, config, pathMapper, destPathFor, dryRun, outDir, publish,
  };
  const results = await runPool(files, argv.concurrency, async (file) => {
    const sourcePath = `${file.path}.${file.ext}`;
    try {
      const result = await migrateFile(file, ctx);
      console.log(`${result.status.padEnd(8)} ${sourcePath} -> ${result.destPath}`);
      return result;
    } catch (e) {
      console.error(`failed   ${sourcePath}: ${e.message}`);
      return { sourcePath, status: 'failed', error: e.message };
    }
  });

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(results, null, 2));

  const linkReportPath = path.resolve(
    config.linkCheck?.reportPath || path.join(outDir, 'broken-links.json'),
  );
  const linkTotals = writeLinkReport(results, linkReportPath);

  const mediaReportPath = path.join(outDir, 'missing-media.json');
  const mediaTotals = writeMediaReport(results, mediaReportPath);

  const failed = results.filter((result) => result.status === 'failed');
  console.log(`\nDone. ${results.length - failed.length} succeeded, ${failed.length} failed.`);
  console.log(`Report: ${path.join(outDir, 'report.json')}`);
  console.log(`Broken links: ${linkTotals.brokenLinks} across ${linkTotals.pagesWithBrokenLinks} page(s) -> ${linkReportPath}`);
  console.log(`Missing media: ${mediaTotals.missingMedia} across ${mediaTotals.pagesWithMissingMedia} page(s) -> ${mediaReportPath}`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
