/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const pattern = /{{phone-\S\w*\S\w*}}/g;
document.querySelectorAll('a').forEach((p, idx) => {
  if (pattern.exec(p.innerHTML)) {
    p.setAttribute('number-type', p.innerHTML.match(pattern)[0].replace(/[&/\\#,+()$~%.'":*?<>{}]/g, ''));
    p.classList.add(`geo-pn${idx}`);
  }
});

/**
 * The decision engine for where to get Milo's libs from.
 */
const setLibs = (prodLibs, location = window.location) => {
  const { hostname, search } = location;
  if (!['.aem.', '.hlx.', '.stage.', 'local', '.da.'].some((i) => hostname.includes(i))) return prodLibs;
  // eslint-disable-next-line compat/compat
  const branch = new URLSearchParams(search).get('milolibs') || 'main';
  if (!/^[a-zA-Z0-9_-]+$/.test(branch)) throw new Error('Invalid branch name.');
  if (branch === 'main' && hostname === 'www.stage.adobe.com') return '/libs';
  if (branch === 'local') return 'http://localhost:6456/libs';
  return `https://${branch}${branch.includes('--') ? '' : '--milo--adobecom'}.aem.live/libs`;
};

const getLocale = (locales, pathname = window.location.pathname) => {
  if (!locales) {
    return { ietf: 'en-US', tk: 'hah7vzn.css', prefix: '' };
  }
  const LANGSTORE = 'langstore';
  const split = pathname.split('/');
  const localeString = split[1];
  const locale = locales[localeString] || locales[''];
  if (localeString === LANGSTORE) {
    locale.prefix = `/${localeString}/${split[2]}`;
    if (
      Object.values(locales)
        .find((loc) => loc.ietf?.startsWith(split[2]))?.dir === 'rtl'
    ) locale.dir = 'rtl';
    return locale;
  }
  const isUS = locale.ietf === 'en-US';
  locale.prefix = isUS ? '' : `/${localeString}`;
  locale.region = isUS ? 'us' : localeString.split('_')[0];
  return locale;
};

const getBrowserData = (userAgent) => {
  if (!userAgent) {
    return {};
  }
  if (userAgent.includes('AdobeEdgeOptimize')) {
    return { ua: userAgent, isMobile: false };
  }

  const browser = {
    ua: userAgent,
    isMobile: userAgent.includes('Mobile'),
  };

  const regex = [
    {
      browserReg: /edg([ae]|ios)?/i,
      versionReg: /edg([ae]|ios)?[\s/](\d+(\.?\d+)+)/i,
      name: 'Microsoft Edge',
    },
    {
      browserReg: /chrome|crios|crmo/i,
      versionReg: /(?:chrome|crios|crmo)\/(\d+(\.?\d+)+)/i,
      name: 'Chrome',
    },
    {
      browserReg: /firefox|fxios|iceweasel/i,
      versionReg: /(?:firefox|fxios|iceweasel)[\s/](\d+(\.?\d+)+)/i,
      name: 'Firefox',
    },
    {
      browserReg: /msie|trident/i,
      versionReg: /(?:msie |rv:)(\d+(\.?\d+)+)/i,
      name: 'Internet Explorer',
    },
    {
      browserReg: /safari|applewebkit/i,
      versionReg: /(?:version)\/(\d+(\.?\d+)+)/i,
      name: 'Safari',
    },
  ];

  for (const reg of regex) {
    if (reg.browserReg.test(userAgent)) {
      browser.name = reg.name;
      const version = userAgent.match(reg.versionReg);
      if (version) {
        browser.version = reg.name === 'Microsoft Edge' ? version[2] : version[1];
      }

      return browser;
    }
  }

  return browser;
};

// Get browser data
window.browser = getBrowserData(window.navigator.userAgent);

const { hostname } = window.location;

// Adding .html to canonical url for .ing pages
if (hostname.endsWith('.ing')) {
  const canonEl = document.head.querySelector('link[rel="canonical"]');
  if (!canonEl?.href.endsWith('.html')) canonEl?.setAttribute('href', `${canonEl.href}.html`);
}

function loadLink(href, { as, callback, crossorigin, rel, fetchpriority } = {}) {
  let link = document.head.querySelector(`link[href="${href}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    if (as) link.setAttribute('as', as);
    if (crossorigin) link.setAttribute('crossorigin', crossorigin);
    if (fetchpriority) link.setAttribute('fetchpriority', fetchpriority);
    link.setAttribute('href', href);
    if (callback) {
      link.onload = (e) => callback(e.type);
      link.onerror = (e) => callback(e.type);
    }
    document.head.appendChild(link);
  } else if (callback) {
    callback('noop');
  }
  return link;
}

function loadStyle(href, callback) {
  return loadLink(href, { rel: 'stylesheet', callback });
}

function addLocale(locale) {
  const metaTag = document.createElement('meta');
  metaTag.setAttribute('property', 'og:locale');
  metaTag.setAttribute('content', locale);
  document.head.appendChild(metaTag);
}

// Add project-wide styles here.
const STYLES = '/acrobat/styles/styles.css';

// Use '/libs' if your live site maps '/libs' to milo's origin.
const LIBS = '/libs';

const locales = {
  // Americas
  ar: { ietf: 'es-AR', tk: 'oln4yqj.css' },
  br: { ietf: 'pt-BR', tk: 'inq1xob.css' },
  ca: { ietf: 'en-CA', tk: 'pps7abe.css', base: '' },
  ca_fr: { ietf: 'fr-CA', tk: 'vrk5vyv.css', base: 'fr' },
  cl: { ietf: 'es-CL', tk: 'oln4yqj.css' },
  co: { ietf: 'es-CO', tk: 'oln4yqj.css' },
  la: { ietf: 'es', tk: 'oln4yqj.css' },
  mx: { ietf: 'es-MX', tk: 'oln4yqj.css' },
  pe: { ietf: 'es-PE', tk: 'oln4yqj.css' },
  '': { ietf: 'en-US', tk: 'hah7vzn.css' },
  // EMEA
  africa: { ietf: 'en', tk: 'pps7abe.css', base: '' },
  be_fr: { ietf: 'fr-BE', tk: 'vrk5vyv.css', base: 'fr' },
  be_en: { ietf: 'en-BE', tk: 'pps7abe.css', base: '' },
  be_nl: { ietf: 'nl-BE', tk: 'cya6bri.css' },
  cy_en: { ietf: 'en-CY', tk: 'pps7abe.css' },
  dk: { ietf: 'da-DK', tk: 'aaz7dvd.css' },
  de: { ietf: 'de-DE', tk: 'vin7zsi.css' },
  ee: { ietf: 'et-EE', tk: 'aaz7dvd.css' },
  es: { ietf: 'es-ES', tk: 'oln4yqj.css' },
  fr: { ietf: 'fr-FR', tk: 'vrk5vyv.css' },
  gr_en: { ietf: 'en-GR', tk: 'pps7abe.css', base: '' },
  ie: { ietf: 'en-GB', tk: 'pps7abe.css', base: '' },
  il_en: { ietf: 'en-IL', tk: 'pps7abe.css', base: '' },
  it: { ietf: 'it-IT', tk: 'bbf5pok.css' },
  lv: { ietf: 'lv-LV', tk: 'aaz7dvd.css' },
  lt: { ietf: 'lt-LT', tk: 'aaz7dvd.css' },
  lu_de: { ietf: 'de-LU', tk: 'vin7zsi.css' },
  lu_en: { ietf: 'en-LU', tk: 'pps7abe.css', base: '' },
  lu_fr: { ietf: 'fr-LU', tk: 'vrk5vyv.css', base: 'fr' },
  hu: { ietf: 'hu-HU', tk: 'aaz7dvd.css' },
  mt: { ietf: 'en-MT', tk: 'pps7abe.css' },
  mena_en: { ietf: 'en', tk: 'pps7abe.css', base: '' },
  nl: { ietf: 'nl-NL', tk: 'cya6bri.css' },
  no: { ietf: 'no-NO', tk: 'aaz7dvd.css' },
  pl: { ietf: 'pl-PL', tk: 'aaz7dvd.css' },
  pt: { ietf: 'pt-PT', tk: 'inq1xob.css' },
  ro: { ietf: 'ro-RO', tk: 'qxw8hzm.css' },
  sa_en: { ietf: 'en-SA', tk: 'pps7abe.css', base: '' },
  ch_de: { ietf: 'de-CH', tk: 'vin7zsi.css' },
  si: { ietf: 'sl-SI', tk: 'aaz7dvd.css' },
  sk: { ietf: 'sk-SK', tk: 'aaz7dvd.css' },
  ch_fr: { ietf: 'fr-CH', tk: 'vrk5vyv.css', base: 'fr' },
  fi: { ietf: 'fi-FI', tk: 'aaz7dvd.css' },
  se: { ietf: 'sv-SE', tk: 'fpk1pcd.css' },
  ch_it: { ietf: 'it-CH', tk: 'bbf5pok.css' },
  tr: { ietf: 'tr-TR', tk: 'aaz7dvd.css' },
  ae_en: { ietf: 'en', tk: 'pps7abe.css', dir: 'ltr', base: '' },
  uk: { ietf: 'en-GB', tk: 'pps7abe.css' },
  at: { ietf: 'de-AT', tk: 'vin7zsi.css' },
  cz: { ietf: 'cs-CZ', tk: 'aaz7dvd.css' },
  bg: { ietf: 'bg-BG', tk: 'aaz7dvd.css' },
  ru: { ietf: 'ru-RU', tk: 'aaz7dvd.css' },
  ua: { ietf: 'uk-UA', tk: 'aaz7dvd.css' },
  il_he: { ietf: 'he', tk: 'nle2tdz.css', dir: 'rtl' },
  ae_ar: { ietf: 'ar-AE', tk: 'dis2dpj.css', dir: 'rtl' },
  mena_ar: { ietf: 'ar', tk: 'dis2dpj.css', dir: 'rtl' },
  sa_ar: { ietf: 'ar-SA', tk: 'dis2dpj.css', dir: 'rtl' },
  // Asia Pacific
  au: { ietf: 'en-AU', tk: 'pps7abe.css' },
  hk_en: { ietf: 'en-HK', tk: 'pps7abe.css', base: '' },
  in: { ietf: 'en-IN', tk: 'pps7abe.css' },
  id_id: { ietf: 'id-ID', tk: 'czc0mun.css' },
  id_en: { ietf: 'en-ID', tk: 'pps7abe.css', base: '' },
  my_ms: { ietf: 'ms-MY', tk: 'sxj4tvo.css' },
  my_en: { ietf: 'en-MY', tk: 'pps7abe.css', base: '' },
  nz: { ietf: 'en-NZ', tk: 'pps7abe.css', base: '' },
  ph_en: { ietf: 'en-PH', tk: 'pps7abe.css', base: '' },
  ph_fil: { ietf: 'tl-PH', tk: 'ict8rmp.css' },
  sg: { ietf: 'en-SG', tk: 'pps7abe.css', base: '' },
  th_en: { ietf: 'en-TH', tk: 'pps7abe.css', base: '' },
  in_hi: { ietf: 'hi-IN', tk: 'aaa8deh.css' },
  th_th: { ietf: 'th-TH', tk: 'lqo2bst.css' },
  cn: { ietf: 'zh-CN', tk: 'puu3xkp' },
  hk_zh: { ietf: 'zh-HK', tk: 'jay0ecd' },
  tw: { ietf: 'zh-TW', tk: 'jay0ecd' },
  jp: { ietf: 'ja-JP', tk: 'dvg6awq' },
  kr: { ietf: 'ko-KR', tk: 'qjs5sfm' },
  // Langstore Support.
  langstore: { ietf: 'en-US', tk: 'hah7vzn.css' },
  // geo expansion MWPW-124903
  za: { ietf: 'en-ZA', tk: 'pps7abe.css', base: '' }, // South Africa (GB English)
  ng: { ietf: 'en-NG', tk: 'pps7abe.css', base: '' }, // Nigeria (GB English)
  cr: { ietf: 'es-CR', tk: 'oln4yqj.css' }, // Costa Rica (Spanish Latin America)
  ec: { ietf: 'es-EC', tk: 'oln4yqj.css' }, // Ecuador (Spanish Latin America)
  pr: { ietf: 'es-PR', tk: 'oln4yqj.css' }, // Puerto Rico (Spanish Latin America)
  gt: { ietf: 'es-GT', tk: 'oln4yqj.css' }, // Guatemala (Spanish Latin America)
  eg_ar: { ietf: 'ar-EG', tk: 'dis2dpj.css', dir: 'rtl' }, // Egypt (Arabic)
  kw_ar: { ietf: 'ar-KW', tk: 'dis2dpj.css', dir: 'rtl' }, // Kuwait (Arabic)
  qa_ar: { ietf: 'ar-QA', tk: 'dis2dpj.css', dir: 'rtl' }, // Quatar (Arabic)
  eg_en: { ietf: 'en-EG', tk: 'pps7abe.css', base: '' }, // Egypt (GB English)
  kw_en: { ietf: 'en-KW', tk: 'pps7abe.css', base: '' }, // Kuwait (GB English)
  qa_en: { ietf: 'en-QA', tk: 'pps7abe.css', base: '' }, // Qatar (GB English)
  gr_el: { ietf: 'el-GR', tk: 'fnx0rsr.css' }, // Greece (Greek)
  el: { ietf: 'el', tk: 'aaz7dvd.css' },
  vn_vi: { ietf: 'vi-VN', tk: 'jii8bki.css' },
  vn_en: { ietf: 'en-VN', tk: 'pps7abe.css', base: '' },
};

// Add any config options.
const CONFIG = {
  codeRoot: '/acrobat',
  contentRoot: '/dc-shared',
  imsClientId: 'acrobatmilo',
  iconsExcludeBlocks: ['unity'],
  commerce: {
    checkoutClientId: 'doc_cloud',
    'wcs-api-key': 'wcms-commerce-ims-ro-user-milo-dc',
  },
  local: {
    edgeConfigId: 'e065836d-be57-47ef-b8d1-999e1657e8fd',
    pdfViewerClientId: 'ec572982b2a849d4b16c47d9558d66d1',
    pdfViewerReportSuite: 'adbadobedxqa',
  },
  page: {
    pdfViewerClientId: '332f83ea8edc489e9d1bd116affe3fe2', // client id for aem.page domain
    pdfViewerReportSuite: 'adbadobedxqa',
  },
  stagePage: {
    pdfViewerClientId: '2522674a708e4ddf8bbd62e18585ae4b',
    pdfViewerReportSuite: 'adbadobedxqa',
  },
  stage: {
    edgeConfigId: 'e065836d-be57-47ef-b8d1-999e1657e8fd',
    marTechUrl: 'https://www.stage.adobe.com/marketingtech/d4d114c60e50/a0e989131fd5/launch-2c94beadc94f-development.min.js',
    pdfViewerClientId: '5bfb3a784f2642f88ecf9d2ff4cd573e',
    pdfViewerReportSuite: 'adbadobedxqa',
  },
  live: {
    pdfViewerClientId: '2ecc42a42bf24c6bb5dca41a25908a1f', // client id for aem.live domain
    pdfViewerReportSuite: 'adbadobedxqa',
  },
  prod: {
    edgeConfigId: '913eac4d-900b-45e8-9ee7-306216765cd2',
    pdfViewerClientId: '8a1d0707bf0f45af8af9f3bead0d213e',
    pdfViewerReportSuite: 'adbadobenonacdcprod,adbadobedxprod,adbadobeprototype',
  },
  hlxPage: {
    pdfViewerClientId: 'a42d91c0e5ec46f982d2da0846d9f7d0',
    pdfViewerReportSuite: 'adbadobedxqa',
  },
  hlxLive: {
    edgeConfigId: 'e065836d-be57-47ef-b8d1-999e1657e8fd',
    pdfViewerClientId: '18e9175fc6754b9892d315cae9f346f1',
    pdfViewerReportSuite: 'adbadobedxqa',
  },
  locales,
  // geoRouting: 'on',
  prodDomains: ['www.adobe.com', 'business.adobe.com', 'helpx.adobe.com'],
  stageDomainsMap: {
    // Match both --dc--adobecom and --da-dc--adobecom
    '--(da-)?dc--adobecom.(hlx|aem).page': {
      'www.adobe.com': 'www.stage.adobe.com',
      'business.adobe.com': 'business.adobe.com',
      'blog.adobe.com': 'blog.adobe.com',
      'developer.adobe.com': 'developer.adobe.com',
      'firefly.adobe.com': 'firefly.adobe.com',
      'helpx.adobe.com': 'helpx.adobe.com',
      'milo.adobe.com': 'milo.adobe.com',
      'news.adobe.com': 'news.adobe.com',
      '(?<!stage\\.)acrobat\\.adobe\\.com': 'stage.acrobat.adobe.com',
    },
    '--(da-)?dc--adobecom.(hlx|aem).live': {
      'www.adobe.com': 'www.adobe.com',
      'business.adobe.com': 'business.adobe.com',
      'blog.adobe.com': 'blog.adobe.com',
      'developer.adobe.com': 'developer.adobe.com',
      'firefly.adobe.com': 'firefly.adobe.com',
      'helpx.adobe.com': 'helpx.adobe.com',
      'milo.adobe.com': 'milo.adobe.com',
      'news.adobe.com': 'news.adobe.com',
    },
    'www.stage.adobe.com': {
      'www.adobe.com': 'origin',
      'business.adobe.com': 'business.stage.adobe.com',
      'blog.adobe.com': 'blog.stage.adobe.com',
      'developer.adobe.com': 'developer-stage.adobe.com',
      'firefly.adobe.com': 'firefly-stage.corp.adobe.com',
      'helpx.adobe.com': 'helpx.stage.adobe.com',
      'milo.adobe.com': 'milo-stage.corp.adobe.com',
      'news.adobe.com': 'news.stage.adobe.com',
      '(?<!stage\\.)acrobat\\.adobe\\.com': 'stage.acrobat.adobe.com',
    },
    '.graybox.adobe.com': { 'www.adobe.com': 'origin' },
    '.business-graybox.adobe.com': { 'business.adobe.com': 'origin' },
  },
  jarvis: {
    id: 'DocumentCloudWeb1',
    version: '1.0',
    onDemand: false,
  },
  htmlExclude: [
    /www\.adobe\.com\/(\w\w(_\w\w)?\/)?express(\/.*)?/,
    /www\.adobe\.com\/(\w\w(_\w\w)?\/)?go(\/.*)?/,
    /www\.adobe\.com\/(\w\w(_\w\w)?\/)?learn(\/.*)?/,
  ],
  uniqueSiteId: 'da-dc',
  mepLingoCountryToRegion: {
    africa: ['ke', 'mu', 'ng', 'za'],
    la: ['ag', 'ar', 'bo', 'cl', 'co', 'cr', 'cu', 'do', 'ec', 'gt', 'hn', 'mx', 'ni', 'pa', 'pe', 'pr', 'py', 'sv', 'uy', 've'],
    mena_en: ['ae', 'af', 'bh', 'dz', 'eg', 'iq', 'ir', 'jo', 'kw', 'lb', 'ly', 'ma', 'om', 'ps', 'qa', 'sa', 'sy', 'tn', 'ye'],
  },
  imsScope: 'AdobeID,openid,gnav,pps.read,firefly_api,additional_info.roles,read_organizations,account_cluster.read',
};

/*
 ⚠ IMPORTANT NOTICE ⚠
 Before modifying IMS scope configurations, please review the IMS Scope Update Guide:
 → https://github.com/adobecom/dc/wiki/IMS-Scope-Update-Guide
 IMS Scope updates must match the IMS portal scopes. Any incorrect changes may result in a CSO.
*/

const IMS_GUEST = document.querySelector('meta[name="ims-guest"]')?.content;

if (IMS_GUEST) {
  const CLIENT_ID = document.querySelector('meta[name="ims-cid"]')?.content;

  CONFIG.adobeid = {
    client_id: CLIENT_ID,
    scope: 'AdobeID,openid,gnav,additional_info.roles,read_organizations,pps.read,account_cluster.read,DCAPI',

    enableGuestAccounts: true,
    enableGuestTokenForceRefresh: true,

    api_parameters: { check_token: { guest_allowed: true } },

    onAccessToken: (accessToken) => {
      window.dc_hosted?.ims_callbacks?.onAccessToken?.(accessToken);
    },
    onReauthAccessToken: (reauthTokenInformation) => {
      window.dc_hosted?.ims_callbacks?.onReauthAccessToken?.(reauthTokenInformation);
    },
    onAccessTokenHasExpired: () => {
      window.dc_hosted?.ims_callbacks?.onAccessTokenHasExpired?.();
    },
  };
}

const { ietf, prefix } = getLocale(locales);

function replaceDotMedia(area = document) {
  // eslint-disable-next-line compat/compat
  const currUrl = new URL(window.location);
  const pathSeg = currUrl.pathname.split('/').length;
  if ((prefix === '' && pathSeg >= 3) || (prefix !== '' && pathSeg >= 4)) return;
  const resetAttributeBase = (tag, attr) => {
    area.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((el) => {
      // eslint-disable-next-line compat/compat
      el[attr] = `${new URL(`${CONFIG.contentRoot}${el.getAttribute(attr).substring(1)}`, window.location).href}`;
    });
  };
  resetAttributeBase('img', 'src');
  resetAttributeBase('source', 'srcset');
}

replaceDotMedia(document);

// Default to loading the first image as eager.
(async function loadLCPImage() {
  const blocks = '.marquee,.hero-marquee,.study-marquee';
  const marquee = document.querySelector(blocks); // first marquee only
  if (marquee) {
    if (window?.browser?.isMobile) {
      marquee.querySelectorAll('img')[0]?.setAttribute('loading', 'eager');
    } else {
      marquee.querySelectorAll('img')[1]?.setAttribute('loading', 'eager');
      marquee.querySelectorAll('img')[2]?.setAttribute('loading', 'eager');
    }
  }
}());

const MAS_FRAGMENT_API = 'https://www.adobe.com/mas/io/fragment';
const DEFAULT_MAS_FRAGMENT_API_KEY = 'wcms-commerce-ims-ro-user-milo';
const MAS_LINK_SELECTOR = 'a[href*="mas.adobe.com/studio.html"]';

// Kept in sync with GeoMap in Milo's blocks/merch/merch.js.
const MAS_GEO_MAP = {
  ar: 'AR_es',
  be_en: 'BE_en',
  be_fr: 'BE_fr',
  be_nl: 'BE_nl',
  br: 'BR_pt',
  ca: 'CA_en',
  ch_de: 'CH_de',
  ch_fr: 'CH_fr',
  ch_it: 'CH_it',
  cl: 'CL_es',
  co: 'CO_es',
  la: 'DO_es',
  mx: 'MX_es',
  pe: 'PE_es',
  africa: 'MU_en',
  dk: 'DK_da',
  de: 'DE_de',
  ee: 'EE_et',
  eg_ar: 'EG_ar',
  eg_en: 'EG_en',
  es: 'ES_es',
  fr: 'FR_fr',
  gr_el: 'GR_el',
  gr_en: 'GR_en',
  ie: 'IE_en',
  il_he: 'IL_he',
  it: 'IT_it',
  lv: 'LV_lv',
  lt: 'LT_lt',
  lu_de: 'LU_de',
  lu_en: 'LU_en',
  lu_fr: 'LU_fr',
  my_en: 'MY_en',
  my_ms: 'MY_ms',
  hu: 'HU_hu',
  mt: 'MT_en',
  mena_en: 'DZ_en',
  mena_ar: 'DZ_ar',
  nl: 'NL_nl',
  no: 'NO_nb',
  pl: 'PL_pl',
  pt: 'PT_pt',
  ro: 'RO_ro',
  si: 'SI_sl',
  sk: 'SK_sk',
  fi: 'FI_fi',
  se: 'SE_sv',
  tr: 'TR_tr',
  uk: 'GB_en',
  at: 'AT_de',
  cz: 'CZ_cs',
  bg: 'BG_bg',
  ru: 'RU_ru',
  ua: 'UA_uk',
  au: 'AU_en',
  in_en: 'IN_en',
  in_hi: 'IN_hi',
  id_en: 'ID_en',
  id_id: 'ID_id',
  nz: 'NZ_en',
  sa_ar: 'SA_ar',
  sa_en: 'SA_en',
  sg: 'SG_en',
  cn: 'CN_zh',
  tw: 'TW_zh',
  hk_zh: 'HK_zh',
  jp: 'JP_ja',
  kr: 'KR_ko',
  za: 'ZA_en',
  ng: 'NG_en',
  cr: 'CR_es',
  ec: 'EC_es',
  pr: 'US_es',
  gt: 'GT_es',
  cis_en: 'TM_en',
  cis_ru: 'TM_ru',
  sea: 'SG_en',
  th_en: 'TH_en',
  th_th: 'TH_th',
};

const MAS_EXTRA_LOCALES = { pr: 'es_PR' };

function getMasLocale(miloLocale) {
  const geo = (miloLocale?.prefix || 'US_en').replace('/', '');
  let [country = 'US', language = 'en'] = (MAS_GEO_MAP[geo] ?? geo).split('_', 2);
  country = country.toUpperCase();
  language = language.toLowerCase();
  return { locale: MAS_EXTRA_LOCALES[geo] ?? `${language}_${country}`, country };
}

function preloadMasFragment(a, config) {
  let url;
  try {
    // eslint-disable-next-line compat/compat
    url = new URL(a.href);
  } catch {
    return;
  }
  if (url.hostname !== 'mas.adobe.com' || !url.pathname.endsWith('/studio.html')) return;
  // eslint-disable-next-line compat/compat
  const params = new URLSearchParams(url.hash.replace(/^#/, ''));
  const fragment = params.get('fragment') || params.get('query');
  if (!fragment) return;

  const { locale, country } = getMasLocale(config?.locale);
  const apiKey = config?.commerce?.['wcs-api-key'] ?? DEFAULT_MAS_FRAGMENT_API_KEY;
  let endpoint = `${MAS_FRAGMENT_API}?id=${fragment}&api_key=${apiKey}&locale=${locale}`;
  if (country && !locale.endsWith(`_${country}`)) endpoint += `&country=${country}`;

  loadLink(endpoint, { rel: 'preload', as: 'fetch', crossorigin: 'anonymous', fetchpriority: 'low' });
}

function scanForMasLinks(area, options, config) {
  const { fragmentLink } = options || {};
  if (fragmentLink) {
    if (fragmentLink.closest('.section')?.dataset.idx === '0') {
      area?.querySelectorAll(MAS_LINK_SELECTOR).forEach((a) => preloadMasFragment(a, config));
    }
    return;
  }
  (area ?? document).querySelector('body > main > div')
    ?.querySelectorAll(MAS_LINK_SELECTOR)
    .forEach((a) => preloadMasFragment(a, config));
}

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

async function loadPage() {
  // Fast track the widget
  const widgetBlock = document.querySelector('[class*="dc-converter-widget"]');
  const mobileAppBlock = document.querySelector('[class*="mobile-widget"]');
  const hasMobileAppBlock = window.browser.isMobile && document.querySelector('meta[name="mobile-widget"]')?.content === 'true';

  if (hasMobileAppBlock && mobileAppBlock) {
    widgetBlock?.remove();
    mobileAppBlock.dataset.verb = mobileAppBlock.classList.value.replace('mobile-widget', '').trim();
    document.body.classList.add('dc-bc');
    mobileAppBlock.removeAttribute('class');
    mobileAppBlock.id = 'mobile-widget';
    const { default: dcConverter } = await import(`${CONFIG.codeRoot}/blocks/mobile-widget/mobile-widget.js`);
    await dcConverter(mobileAppBlock);
  } else {
    mobileAppBlock?.remove();
  }

  if (widgetBlock && !hasMobileAppBlock) {
    document.body.classList.add('dc-bc');
    document.querySelector('header').className = 'global-navigation has-breadcrumbs';
    const verb = widgetBlock.children[0].children[0]?.innerText?.trim();
    const blockName = widgetBlock.classList.value;
    widgetBlock.removeAttribute('class');
    widgetBlock.id = 'dc-converter-widget';
    widgetBlock.setAttribute('verb', verb);
    const DC_GENERATE_CACHE_VERSION = document.querySelector('meta[name="dc-generate-cache-version"]')?.getAttribute('content');
    const INLINE_SNIPPET = document.querySelector('section#edge-snippet');
    const dcUrls = INLINE_SNIPPET ? [] : [
      `https://www.adobe.com/dc/dc-generate-cache/dc-hosted-${DC_GENERATE_CACHE_VERSION}/${verb}-${ietf.toLowerCase()}.html`,
    ];

    dcUrls.forEach((url) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'preload');
      if (url.split('.').pop() === 'html') { link.setAttribute('as', 'fetch'); }
      if (url.split('.').pop() === 'js') { link.setAttribute('as', 'script'); }
      link.setAttribute('href', url);
      link.setAttribute('crossorigin', '');
      document.head.appendChild(link);
    });

    const { default: dcConverter } = await import(`../blocks/${blockName}/${blockName}.js`);
    await dcConverter(widgetBlock);
  }

  // Setup CSP
  (async () => {
    if (document.querySelector('meta[name="dc-widget-version"]') && !hasMobileAppBlock) {
      const { default: ContentSecurityPolicy } = await import('./contentSecurityPolicy/csp.js');
      ContentSecurityPolicy();
    }
  })();

  function getCustomMetadata(name, doc = document) {
    const attr = name && name.includes(':') ? 'property' : 'name';
    const meta = doc.head.querySelector(`meta[${attr}="${name}"]`);
    return meta && meta.content;
  }

  // Setup Milo
  const miloLibs = setLibs(LIBS);

  // Milo and site styles
  if (!document.getElementById('inline-milo-styles')) {
    const paths = [];
    const stylesPrefix = getCustomMetadata('foundation') === 'c2' ? '/c2' : '';
    paths.push(`${miloLibs}${stylesPrefix}/styles/styles.css`);
    const skin = getCustomMetadata('skin');
    if (skin) paths.push(`${miloLibs}/styles/skins/${skin}.css`);
    if (STYLES) { paths.push(STYLES); }
    paths.forEach((css) => loadStyle(css));
  }

  // Import base milo features and run them
  const {
    loadArea, setConfig, loadLana, getMetadata, loadIms, getConfig,
  } = await import(`${miloLibs}/utils/utils.js`);
  addLocale(ietf);

  if (getMetadata('commerce')) {
    const { default: replacePlaceholdersWithImages } = await import('./imageReplacer.js');
    replacePlaceholdersWithImages(ietf, miloLibs);
  }

  // Preload first-section M@S fragments so their fetch stops blocking LCP. Wired
  // as Milo's decorateArea: our initial call scans the authored document, and Milo re-invokes
  // it per loaded fragment (with { fragmentLink }), catching a marquee that MEP swaps in.
  const decorateArea = (area, options) => scanForMasLinks(area, options, getConfig());
  setConfig({ ...CONFIG, miloLibs, decorateArea });
  decorateArea();

  window.addEventListener('IMS:Ready', async () => {
    const susiElems = document.querySelectorAll('a[href*="susi"]');
    if (susiElems.length > 0) {
      const { default: handleImsSusi } = await import('./susiAuthHandler.js');
      handleImsSusi(susiElems);
    }
  });

  loadIms().then(() => {
    const imsIsReady = new CustomEvent('IMS:Ready');
    window.dispatchEvent(imsIsReady);
  }).catch((err) => {
    window.dispatchEvent(new CustomEvent('DC_Hosted:Error', { detail: { wrappedException: err } }));
  });

  loadLana({ clientId: 'dxdc', tags: 'DC_Milo' });

  if (window.location.pathname.startsWith(`${prefix}/acrobat/online/`)) {
    if (!window.alloy_all) {
      // Mirror milo's alloy_all get/set interface so helpers.js callbacks work correctly
      const get = (obj, path) => path.split('.').reduce((cur, seg) => (cur !== undefined && cur !== null ? cur[seg] : undefined), obj);
      const set = (obj, path, val) => {
        path.split('.').reduce((cur, seg, i, segs) => {
          if (i === segs.length - 1) cur[seg] = val;
          else cur[seg] = cur[seg] || {};
          return cur[seg];
        }, obj);
        return obj;
      };
      window.alloy_all = { get, set };
    }
    window.alloy_all.set(window.alloy_all, 'data._adobe_corpnew.app.appName', 'ACROBAT_WEB_FRICTIONLESS');
    window.alloy_all.set(window.alloy_all, 'data._adobe_corpnew.app.appVersion', '1.0');
  }

  await loadArea(document, false);

  // Setup Logging
  const { default: lanaLogging } = await import('./dcLana.js');
  lanaLogging();

  // DC Hosted Ready...
  const dcHostedReady = setInterval(() => {
    if (window.dc_hosted) {
      clearInterval(dcHostedReady);
      const imsIsReady = new CustomEvent('DC_Hosted:Ready');
      window.dispatchEvent(imsIsReady);
    }
  }, 1000);

  if (document.querySelectorAll('a[class*="geo-pn"]').length > 0 || document.querySelectorAll('a[href*="geo"]').length > 0) {
    const { default: geoPhoneNumber } = await import('./geo-phoneNumber.js');
    geoPhoneNumber();
  }

  // Import tooltip accessibility implementation for WCAG 1.4.13 and 4.1.2
  if (document.querySelectorAll('.milo-tooltip').length > 0) {
    const { default: initTooltips } = await import('./tooltips.js');
    initTooltips();
  }
}

loadPage();

(async function loadDa() {
  if (!new URL(window.location.href).searchParams.get('dapreview')) return;
  // eslint-disable-next-line import/no-unresolved
  import('https://da.live/scripts/dapreview.js').then(({ default: daPreview }) => daPreview(loadPage));
}());
