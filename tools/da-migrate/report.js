const fs = require('fs');
const path = require('path');

/** Writes the broken-link summary as JSON plus a flat CSV for triage. */
function writeLinkReport(results, reportPath) {
  const pages = results.filter((result) => result.brokenLinks?.length);
  const payload = {
    generatedAt: new Date().toISOString(),
    totals: {
      pagesExported: results.length,
      pagesWithBrokenLinks: pages.length,
      brokenLinks: pages.reduce((n, page) => n + page.brokenLinks.length, 0),
    },
    pages: pages.map(({ sourcePath, destPath, destUrl, brokenLinks }) => ({
      sourcePath, destPath, destUrl, brokenLinks,
    })),
  };

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(payload, null, 2)}\n`);

  const csv = ['sourcePath,destPath,destUrl,brokenLink,status']
    .concat(payload.pages.flatMap((page) => page.brokenLinks.map((link) => [
      page.sourcePath, page.destPath, page.destUrl, link.checked, link.status,
    ].map((field) => `"${field}"`).join(','))))
    .join('\n');
  fs.writeFileSync(reportPath.replace(/\.json$/, '.csv'), `${csv}\n`);

  return payload.totals;
}

/** Lists media still referenced by a migrated page but absent on the source, for authors to fix. */
function writeMediaReport(results, reportPath) {
  const pages = results.filter((result) => result.missingMedia?.length);
  const payload = {
    generatedAt: new Date().toISOString(),
    totals: {
      pagesWithMissingMedia: pages.length,
      missingMedia: pages.reduce((n, page) => n + page.missingMedia.length, 0),
    },
    pages: pages.map(({ sourcePath, destUrl, missingMedia }) => ({
      sourcePath, destUrl, missingMedia,
    })),
  };

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(payload, null, 2)}\n`);

  const csv = ['page,missingImage,destUrl']
    .concat(payload.pages.flatMap((page) => page.missingMedia.map((media) => [
      page.sourcePath, media, page.destUrl,
    ].map((field) => `"${field}"`).join(','))))
    .join('\n');
  fs.writeFileSync(reportPath.replace(/\.json$/, '.csv'), `${csv}\n`);

  return payload.totals;
}

module.exports = { writeLinkReport, writeMediaReport };
