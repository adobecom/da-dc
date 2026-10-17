/* eslint-disable compat/compat */
import { setLibs, loadPlaceholders } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');
let createTag;
let loadBlock;
let getConfig;

const PDFSPACES_API_KEY = 'acrobatmiloguest';
const DISCOVERY_URL_PROD = 'https://dc-api.adobe.io/discovery';
const DISCOVERY_URL_STAGE = 'https://dc-api-stage.adobe.io/discovery';
const KWCOLLECTION_ID = 'curated';

const COLLECTIONS_ACCEPT_PROD = 'application/vnd.adobe.dc+json;profile="https://dc-kwcollection.adobe.io/schemas/kwcollection_curated_listing_v1.json"';
const COLLECTIONS_ACCEPT_STAGE = 'application/vnd.adobe.dc+json;profile="https://dc-kwcollection-stage.adobe.io/schemas/kwcollection_curated_listing_v1.json"';

const VARIANTS = ['featured', 'productivity', 'lifestyle', 'all'];
const CATEGORY_LABELS = {
  featured: 'Featured',
  productivity: 'Productivity',
  lifestyle: 'Lifestyle',
};

const lanaOptions = {
  sampleRate: 10,
  tags: 'DC_Milo, PDF Spaces Gallery',
  severity: 'error',
};

const getRefreshToken = async () => {
  try {
    const { tokenInfo } = window.adobeIMS ? await window.adobeIMS.refreshToken() : {};
    return tokenInfo;
  } catch (e) {
    return { token: null, error: e };
  }
};

const attemptTokenRefresh = async () => {
  const refreshResult = await getRefreshToken();
  if (!refreshResult?.error) return { token: refreshResult, error: null };
  return refreshResult;
};

const getImsToken = async () => {
  const RETRY_WAIT = 2000;
  try {
    const accessToken = window.adobeIMS?.getAccessToken();
    const expiresSoon = accessToken?.expire?.valueOf() <= Date.now() + (5 * 60 * 1000);
    if (!accessToken || expiresSoon) {
      const first = await attemptTokenRefresh();
      if (!first.error) return first.token?.token;
      await new Promise((r) => { setTimeout(r, RETRY_WAIT); });
      const retry = await attemptTokenRefresh();
      if (!retry.error) return retry.token?.token;
      return null;
    }
    return accessToken?.token;
  } catch (error) {
    window.lana?.log(`PDF Spaces: token error — ${error.message}`, lanaOptions);
    return null;
  }
};

const waitForIms = (timeout = 1000) => new Promise((resolve) => {
  if (window.adobeIMS) { resolve(true); return; }
  setTimeout(() => resolve(!!window.adobeIMS), timeout);
});

const getAndValidateImsToken = async () => {
  await waitForIms();
  return getImsToken();
};

async function fetchCuratedSpaces() {
  const token = await getAndValidateImsToken();
  if (!token) {
    throw new Error('No IMS guest token available — verify ims-cid: acrobatmiloguest is set in the metadata sheet for this URL');
  }

  const authHeader = { Authorization: `Bearer ${token}` };
  const discoveryHeaders = { ...authHeader, 'x-api-key': PDFSPACES_API_KEY };
  const collectionsHeaders = { ...authHeader, 'x-api-client-id': PDFSPACES_API_KEY };

  // IMS token environment must match the API environment (prod vs stage).
  const discoveryUrl = getConfig?.().env?.name === 'prod'
    ? DISCOVERY_URL_PROD : DISCOVERY_URL_STAGE;
  const discoveryResp = await fetch(discoveryUrl, {
    headers: {
      ...discoveryHeaders,
      Accept: 'application/vnd.adobe.dc+json;profile="https://dc-api-v2.adobe.io/schemas/discovery_v1.json"',
    },
  });
  if (!discoveryResp.ok) {
    throw new Error(`Discovery API ${discoveryResp.status} ${discoveryResp.statusText}`);
  }
  const discovery = await discoveryResp.json();

  const kwPath = discovery.templates?.kwcollection_uri?.replace('{+kwcollection_id}', KWCOLLECTION_ID);
  if (!kwPath) throw new Error('Discovery response missing kwcollection_uri template');

  const ietf = getConfig?.().locale?.ietf || 'en-US';
  const [, country = 'US'] = ietf.split('-');
  const kwUrl = `${kwPath}?country=${encodeURIComponent(country)}&language=${encodeURIComponent(ietf)}`;

  const collectionsAccept = getConfig?.().env?.name === 'prod'
    ? COLLECTIONS_ACCEPT_PROD : COLLECTIONS_ACCEPT_STAGE;
  const collectionsResp = await fetch(kwUrl, {
    headers: {
      ...collectionsHeaders,
      Accept: collectionsAccept,
    },
  });
  if (!collectionsResp.ok) {
    throw new Error(`Curated Collections API ${collectionsResp.status} ${collectionsResp.statusText}`);
  }
  return { data: await collectionsResp.json(), token };
}

let curatedPromise = null;

function getCuratedSpaces() {
  if (!curatedPromise) {
    curatedPromise = fetchCuratedSpaces().catch((err) => {
      curatedPromise = null;
      throw err;
    });
  }
  return curatedPromise;
}

function getCategory(block) {
  const found = VARIANTS.find((v) => block.classList.contains(v));
  return found || 'featured';
}

// Extend with localized category values if the API returns them per-locale.
const CATEGORY_ALIASES = {
  featured: ['featured'],
  productivity: ['productivity'],
  lifestyle: ['lifestyle'],
};

function matchesCategory(apiCategory, variantCategory) {
  const value = (apiCategory || '').trim().toLowerCase();
  if (!value) return false;
  const aliases = CATEGORY_ALIASES[variantCategory] || [variantCategory];
  return aliases.some((a) => a.toLowerCase() === value);
}

function buildDestinationUrl(assetId) {
  return `https://acrobat.adobe.com/link/spaces/${assetId}/?x_api_client_id=pdf_spaces&x_api_client_location=adobe`;
}

function buildThumbnailUrl(item) {
  const rel = 'http://ns.adobe.com/adobecloud/rel/rendition';
  const template = item.acpc_links?.[rel]?.[0]?.href;
  if (!template) return null;
  // On this endpoint `type` is the output MIME type, not "png"/"jpg".
  const base = template.replace(/\{[^{}]*\}/g, '');
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}size=400&type=${encodeURIComponent('image/png')}`;
}

// Neutral placeholder shown until the real thumbnail loads.
const PLACEHOLDER_IMG = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">'
  + '<rect width="400" height="400" fill="#e8e8e8"/>'
  + '<g fill="#b8b8b8">'
  + '<rect x="120" y="140" width="160" height="120" rx="8"/>'
  + '<circle cx="160" cy="180" r="14" fill="#e8e8e8"/>'
  + '<path d="M120 260l50-50 40 30 30-20 40 40v0z" fill="#e8e8e8"/>'
  + '</g></svg>',
)}`;

async function loadThumbnail(img, thumbUrl, token) {
  try {
    const resp = await fetch(thumbUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Api-Key': PDFSPACES_API_KEY,
        'Client-Agent': 'v=2; app=DCWeb; os=na; device=na; surface=na',
        'acpc-published-links': 'true',
        directive: 'link-2023',
        'link-options': 'absolute-base,long-form-rel',
      },
    });
    if (!resp.ok) return;
    const blob = await resp.blob();
    img.src = URL.createObjectURL(blob);
    img.classList.remove('pdf-spaces-placeholder-img');
  } catch {
    // leave the placeholder in place
  }
}

function buildCard(item, ctaText, token) {
  const card = createTag('div', { class: 'editorial-card l-rounded-corners hover-scale click pdf-spaces-card' });

  const bgRow = createTag('div', { class: 'pdf-spaces-bg' }, createTag('div', {}, '#fafafa'));

  const thumbUrl = buildThumbnailUrl(item);
  const img = createTag('img', {
    loading: 'lazy',
    alt: '',
    src: PLACEHOLDER_IMG,
    class: 'pdf-spaces-placeholder-img',
    width: 400,
    height: 400,
  });
  if (thumbUrl && token) loadThumbnail(img, thumbUrl, token).catch(() => {});
  const picture = createTag('picture', {}, img);
  const imgRow = createTag('div', { class: 'pdf-spaces-media' }, createTag('div', {}, picture));

  const textInner = createTag('div', {}, [
    createTag('p', {}, item.category || ''),
    createTag('h3', {}, item.name || ''),
    createTag('p', {}, item.description || ''),
  ]);
  const textRow = createTag('div', { class: 'pdf-spaces-text' }, textInner);

  const cta = createTag('a', { href: buildDestinationUrl(item.id), 'aria-label': `${ctaText} ${item.name}` }, ctaText);
  const ctaRow = createTag('div', { class: 'pdf-spaces-cta' }, createTag('div', {}, [
    createTag('p', {}, '--- #B6B6B6'),
    createTag('p', {}, createTag('strong', {}, cta)),
  ]));

  card.append(bgRow, imgRow, textRow, ctaRow);
  return card;
}

export default async function init(element) {
  ({ createTag, loadBlock, getConfig } = await import(`${miloLibs}/utils/utils.js`));
  await loadPlaceholders(['pdf-spaces']);

  const category = getCategory(element);
  const ctaText = window.mph?.['pdf-spaces-cta'] || 'Explore now';

  let spaces;
  let token;
  try {
    const { data, token: fetchedToken } = await getCuratedSpaces();
    token = fetchedToken;
    const all = data?.children || [];
    spaces = category === 'all'
      ? all
      : all.filter((s) => matchesCategory(s.category, category));
  } catch (err) {
    window.lana?.log(`PDF Spaces: fetch failed — ${err.message}`, lanaOptions);
    element.remove();
    return;
  }

  if (!spaces.length) {
    element.remove();
    return;
  }

  const container = createTag('div', { class: 'pdf-spaces-cards' });
  element.replaceChildren(container);

  // Load each card individually — Milo's carousel is section-level, so it can't
  // be driven programmatically from a block.
  await Promise.all(spaces.map(async (item) => {
    const card = buildCard(item, ctaText, token);
    container.append(card);
    try {
      await loadBlock(card);
    } catch (err) {
      window.lana?.log(`PDF Spaces: card load failed — ${err.message}`, lanaOptions);
    }
  }));
}

export const testables = {
  getCategory,
  matchesCategory,
  buildDestinationUrl,
  buildThumbnailUrl,
  buildCard: (item, ctaText, tagFn, token) => {
    createTag = tagFn;
    return buildCard(item, ctaText, token);
  },
  CATEGORY_LABELS,
};
