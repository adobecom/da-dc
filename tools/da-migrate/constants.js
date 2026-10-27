const DA_ORIGIN = 'https://admin.da.live';
const DA_CONTENT_ORIGIN = 'https://content.da.live';
const AEM_ORIGIN = 'https://admin.hlx.page';

// Fragments are flattened into this folder, under a locale prefix when present.
const CONTENT_ROOT = '/dc-shared/tools/content';

// Mirrors ACROBAT_LOCALES in edgeworkers/Acrobat_DC_web_prod/main.js: a first
// segment in this set is a locale, anything else is a section. English has no prefix.
const ACROBAT_LOCALES = new Set([
  'cz', 'de', 'dk', 'es', 'fi', 'fr', 'id_id', 'in_hi', 'it', 'jp', 'kr',
  'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'se', 'th_th', 'tr', 'tw',
]);

// Extensions DA stores as-is (no HTML transform pass).
const BINARY_EXTS = ['svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'pdf'];

const CONTENT_TYPES = {
  html: 'text/html',
  json: 'application/json',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  mp4: 'video/mp4',
  pdf: 'application/pdf',
};

module.exports = {
  ACROBAT_LOCALES,
  AEM_ORIGIN,
  BINARY_EXTS,
  CONTENT_ROOT,
  CONTENT_TYPES,
  DA_CONTENT_ORIGIN,
  DA_ORIGIN,
};
