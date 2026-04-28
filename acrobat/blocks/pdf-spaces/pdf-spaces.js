/* eslint-disable compat/compat */
import { setLibs, getEnv } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');

const DEFAULT_PUBLIC_ID = 'kwc_curated';
const DEFAULT_API_CLIENT_ID = 'dc-prod-virgoweb';
const DISCOVERY_URL = 'https://dc-api.adobe.io/discovery';
const DISCOVERY_ACCEPT = 'application/vnd.adobe.dc+json;profile="https://dc-api.adobe.io/schemas/discovery_v1.json"';
const COLLECTION_ACCEPT = 'application/vnd.adobe.dc+json;profile="https://dc-kwcollection.adobe.io/schemas/kwcollection_curated_listing_v1.json"';
const SPACE_LINK_PREFIX = 'https://acrobat.adobe.com/link/spaces/';
const SPACE_LINK_SUFFIX = '?x_api_client_id=pdf_spaces&x_api_client_location=adobe';
const TOKEN_RETRY_WAIT_MS = 2000;

const SKIP_BLOCK_CLASSES = new Set(['pdf-spaces', 'block', 'pdf-spaces--error']);
const OPEN_AUX_CLASSES = ['l-rounded-corners-image', 'static-links-copy', 'no-border'];

const apiCache = new Map();
let createTag;
let loadStyle;
let cachedDiscoveryEndpoint;

function readKeyValueSet(element) {
  const cfg = {};
  for (const row of [...element.children]) {
    if (row.children.length < 2) break;
    cfg[row.children[0].textContent.trim().toLowerCase()] = row.children[1].textContent.trim();
  }
  return cfg;
}

async function attemptTokenRefresh() {
  try {
    const { tokenInfo } = window.adobeIMS ? await window.adobeIMS.refreshToken() : {};
    return { token: tokenInfo, error: null };
  } catch (e) {
    const msg = (e?.message || e?.exception?.message || '').trim();
    if (msg === 'invalid_credentials') return { token: null, isGuestToken: true, error: null };
    return { token: null, error: e };
  }
}

async function getImsToken() {
  const accessToken = window.adobeIMS?.getAccessToken();
  if (accessToken && accessToken.expire?.valueOf() > Date.now() + (5 * 60 * 1000)) {
    return { token: accessToken, error: null };
  }
  const first = await attemptTokenRefresh();
  if (!first.error) return first;
  await new Promise((res) => { setTimeout(res, TOKEN_RETRY_WAIT_MS); });
  const retry = await attemptTokenRefresh();
  if (!retry.error) return retry;
  return { token: null, error: retry.error };
}

async function getAuthorization() {
  const result = await getImsToken();
  console.log('[pdf-spaces] ims token result:', {
    hasToken: !!result.token?.token,
    isGuestToken: !!(result.isGuestToken || result.token?.isGuestToken),
    tokenExpire: result.token?.expire,
    error: result.error?.message,
    imsAvailable: !!window.adobeIMS,
    isSignedIn: window.adobeIMS?.isSignedInUser?.() || false,
  });
  const auth = result.token?.token ? `Bearer ${result.token.token}` : null;
  console.log('[pdf-spaces] using auth scheme:', auth ? 'Bearer' : 'none');
  return auth;
}

function authScheme(authorization) {
  return authorization?.startsWith('Bearer') ? 'Bearer' : authorization || 'none';
}

async function readErrorBody(res) {
  try { return (await res.text()).slice(0, 500); } catch { return ''; }
}

function buildHeaders(authorization, accept, additional = {}) {
  return {
    Accept: accept,
    Authorization: authorization,
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'x-api-client-id': DEFAULT_API_CLIENT_ID,
    ...additional,
  };
}

function getDiscoveryUrl() {
  const env = getEnv();
  if (env === 'prod') return DISCOVERY_URL;
  return DISCOVERY_URL;
}

function findCuratedListingEndpoint(discovery) {
  // eslint-disable-next-line no-underscore-dangle
  const links = discovery?.links || discovery?._links || {};
  const direct = links['kwcollection.curated_listing']
    || links['kwcollections.curated_listing']
    || links.kwcollection_curated_listing
    || links.kwcollections_curated_listing;
  if (direct?.href) return direct.href;
  for (const value of Object.values(links)) {
    const href = value?.href;
    if (typeof href === 'string' && href.includes('kwcollections/curated')) return href;
  }
  return null;
}

async function fetchDiscovery(authorization) {
  if (cachedDiscoveryEndpoint) {
    console.log('[pdf-spaces] discovery (cached):', cachedDiscoveryEndpoint);
    return cachedDiscoveryEndpoint;
  }
  console.log('[pdf-spaces] discovery request:', { url: getDiscoveryUrl(), auth: authScheme(authorization) });
  let res = await fetch(getDiscoveryUrl(), { headers: buildHeaders(authorization, DISCOVERY_ACCEPT) });
  console.log('[pdf-spaces] discovery response status:', res.status);
  if (res.status === 401 && authorization?.startsWith('Bearer ')) {
    const rawToken = authorization.slice('Bearer '.length);
    console.warn('[pdf-spaces] retrying discovery without "Bearer " prefix (matches rnr block convention)');
    res = await fetch(getDiscoveryUrl(), { headers: buildHeaders(rawToken, DISCOVERY_ACCEPT) });
    console.log('[pdf-spaces] discovery retry status:', res.status);
  }
  if (!res.ok) {
    const body = await readErrorBody(res);
    console.error('[pdf-spaces] discovery failed:', { status: res.status, auth: authScheme(authorization), body });
    throw new Error(`Discovery failed: status=${res.status} auth=${authScheme(authorization)} body=${body}`);
  }
  const json = await res.json();
  const endpoint = findCuratedListingEndpoint(json);
  console.log('[pdf-spaces] discovery endpoint resolved:', endpoint);
  if (!endpoint) {
    console.error('[pdf-spaces] discovery payload (no endpoint found):', json);
    throw new Error('Curated listing endpoint not found in discovery');
  }
  cachedDiscoveryEndpoint = endpoint;
  return endpoint;
}

function expandTemplate(href, params) {
  let url = href;
  Object.entries(params).forEach(([key, val]) => {
    const encoded = encodeURIComponent(val);
    url = url.replaceAll(`{${key}}`, encoded).replaceAll(`{?${key}}`, encoded);
  });
  if (url.includes('{')) {
    const u = new URL(url.replace(/\{[^}]+\}/g, ''));
    Object.entries(params).forEach(([key, val]) => u.searchParams.set(key, val));
    return u.toString();
  }
  const u = new URL(url);
  Object.entries(params).forEach(([key, val]) => {
    if (!u.searchParams.has(key)) u.searchParams.set(key, val);
  });
  return u.toString();
}

async function fetchCuratedCollections(cfg) {
  const cacheKey = `${cfg.publicid}|${cfg.country}|${cfg.language}`;
  if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

  const promise = (async () => {
    const authorization = await getAuthorization();
    const endpoint = await fetchDiscovery(authorization);
    const url = expandTemplate(endpoint, {
      publicId: cfg.publicid,
      country: cfg.country,
      language: cfg.language,
    });
    console.log('[pdf-spaces] curated collections request:', { url, auth: authScheme(authorization) });
    const res = await fetch(url, { headers: buildHeaders(authorization, COLLECTION_ACCEPT) });
    console.log('[pdf-spaces] curated collections response status:', res.status);
    if (!res.ok) {
      const body = await readErrorBody(res);
      console.error('[pdf-spaces] curated collections failed:', { status: res.status, auth: authScheme(authorization), body });
      throw new Error(`Curated collections failed: status=${res.status} auth=${authScheme(authorization)} body=${body}`);
    }
    const json = await res.json();
    const collections = json?.collections || json?.data || json?.items || [];
    console.log('[pdf-spaces] curated collections received:', { count: collections.length, sample: collections[0] });
    return collections;
  })();

  apiCache.set(cacheKey, promise);
  try {
    return await promise;
  } catch (e) {
    apiCache.delete(cacheKey);
    throw e;
  }
}

function buildSpaceUrl(collection) {
  const id = collection.id || collection.urn || collection.collection_id;
  if (!id) return collection.url || '#';
  if (id.startsWith('http')) return id;
  return `${SPACE_LINK_PREFIX}${id}/${SPACE_LINK_SUFFIX}`;
}

function pickImage(collection) {
  return collection.thumbnail
    || collection.thumbnail_url
    || collection.image
    || collection.image_url
    || collection.cover_image
    || collection.banner
    || (Array.isArray(collection.images) && collection.images[0]?.url)
    || '';
}

function pickTitle(collection) {
  return collection.title || collection.name || collection.display_name || '';
}

function pickDescription(collection) {
  return collection.description || collection.subtitle || collection.summary || '';
}

function getVariantClasses(element) {
  const variants = [...element.classList].filter((c) => !SKIP_BLOCK_CLASSES.has(c));
  if (!variants.some((c) => c.endsWith('-lockup'))) variants.push('m-lockup');
  if (variants.includes('open')) {
    OPEN_AUX_CLASSES.forEach((c) => { if (!variants.includes(c)) variants.push(c); });
  }
  return variants;
}

function applyClickableCard(card) {
  const link = card.querySelector('a');
  if (!link) return;
  card.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') return;
    if (link.target === '_blank') window.open(link.href);
    else window.location.assign(link.href);
  });
}

function isImageUrl(value) {
  if (!value) return false;
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('/')) return true;
  return /\.(png|jpe?g|webp|gif|svg|avif)(\?|#|$)/i.test(value);
}

function applyBackground(card, value) {
  if (!value) return;
  if (isImageUrl(value)) {
    card.style.background = 'transparent';
    const bg = createTag('div', { class: 'background' });
    const picture = createTag('picture');
    const img = createTag('img', {
      src: value, alt: '', loading: 'lazy', 'aria-hidden': 'true',
    });
    picture.append(img);
    bg.append(picture);
    card.prepend(bg);
  } else {
    card.style.backgroundColor = value;
  }
}

function buildCard(collection, cfg) {
  const baseClasses = ['pdf-spaces-card', 'editorial-card', 'con-block'];
  if (!cfg.background) baseClasses.push('no-bg');
  const card = createTag('div', { class: [...baseClasses, ...cfg.variantClasses].join(' ') });
  const href = buildSpaceUrl(collection);

  const mediaArea = createTag('div', { class: 'media-area' });
  const imgSrc = pickImage(collection);
  if (imgSrc) {
    const picture = createTag('picture');
    const img = createTag('img', { src: imgSrc, alt: pickTitle(collection), loading: 'lazy' });
    picture.append(img);
    mediaArea.append(picture);
  }

  const foreground = createTag('div', { class: 'foreground' });
  if (cfg.eyebrow) {
    const eyebrow = createTag('p', { class: 'pdf-spaces-eyebrow detail-m' }, cfg.eyebrow);
    foreground.append(eyebrow);
  }
  const title = pickTitle(collection);
  if (title) foreground.append(createTag('h3', { class: 'pdf-spaces-title heading-m' }, title));
  const description = pickDescription(collection);
  if (description) foreground.append(createTag('p', { class: 'pdf-spaces-description body-m' }, description));

  const footer = createTag('div', { class: 'card-footer' });
  const actionArea = createTag('div', { class: 'action-area' });
  const cta = createTag('a', {
    class: 'con-button blue button-m',
    href,
    'daa-ll': `pdfspaces-${(title || '').toLowerCase().replace(/\s+/g, '-')}`,
  }, cfg.button);
  actionArea.append(cta);
  footer.append(actionArea);

  card.append(mediaArea, foreground, footer);
  applyBackground(card, cfg.background);
  if (cfg.variantClasses.includes('click')) applyClickableCard(card);
  return card;
}

function renderCards(element, collections, cfg) {
  const limit = cfg.limit ? parseInt(cfg.limit, 10) : collections.length;
  const list = collections.slice(0, Number.isFinite(limit) ? limit : collections.length);

  const container = element.parentElement;
  const fragment = document.createDocumentFragment();
  list.forEach((collection) => fragment.append(buildCard(collection, cfg)));

  if (container?.classList.contains('carousel') || container?.classList.contains('tabs')) {
    container.insertBefore(fragment, element);
    element.remove();
  } else {
    element.replaceChildren(fragment);
  }
}

function renderError(element) {
  element.classList.add('pdf-spaces--error');
  element.replaceChildren();
}

export default async function init(element) {
  const utils = await import(`${miloLibs}/utils/utils.js`);
  createTag = utils.createTag;
  loadStyle = utils.loadStyle;
  const config = utils.getConfig?.() || {};
  const localeIetf = config.locale?.ietf || 'en-US';
  const [defaultLang, defaultCountry = 'US'] = localeIetf.split('-');
  const variantClasses = getVariantClasses(element);

  if (variantClasses.includes('rounded-corners')) {
    const base = config.miloLibs || config.codeRoot || miloLibs;
    loadStyle?.(`${base}/styles/rounded-corners.css`);
  }

  const cfg = {
    publicid: DEFAULT_PUBLIC_ID,
    country: defaultCountry,
    language: `${defaultLang}-${defaultCountry}`,
    eyebrow: 'FEATURED',
    button: 'Explore now',
    ...readKeyValueSet(element),
    variantClasses,
  };

  console.log('[pdf-spaces] init config:', { ...cfg, variantClasses: cfg.variantClasses });
  try {
    const collections = await fetchCuratedCollections(cfg);
    if (!collections?.length) {
      console.warn('[pdf-spaces] no collections returned, rendering error state');
      renderError(element);
      return;
    }
    renderCards(element, collections, cfg);
    console.log('[pdf-spaces] rendered', collections.length, 'cards');
  } catch (e) {
    console.error('[pdf-spaces] init failed:', e);
    window.lana?.log?.(`pdf-spaces failed: ${e?.message || e}`, { tags: 'pdf-spaces' });
    renderError(element);
  }
}
