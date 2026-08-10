/* eslint-disable compat/compat */
import { setLibs, getEnv, isOldBrowser } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');

let createTag;
let getConfig;
let loadBlock;
let getMetadata;
let loadIms;
let loadScript;

const EOLBrowserPage = 'https://acrobat.adobe.com/home/index-browser-eol.html';

const MB25 = 26214400;
const ACCEPTED_FILES = ['.jpg', '.jpeg', '.png'];

const LIMITS = { 'image-to-pdf': { maxFileSize: MB25, acceptedFiles: ACCEPTED_FILES, multipleFiles: false } };

const DC_ENV = ['www.adobe.com', 'sign.ing', 'edit.ing'].includes(window.location.hostname) ? 'prod' : 'stage';

const fallBack = 'https://www.adobe.com/go/acrobat-overview';

const verbRedirMap = {
  createpdf: 'createpdf',
  'crop-pages': 'crop',
  'delete-pages': 'deletepages',
  'extract-pages': 'extract',
  'combine-pdf': 'combine',
  'protect-pdf': 'protect',
  'add-comment': 'addcomment',
  'pdf-to-image': 'pdftoimage',
  'reorder-pages': 'reorderpages',
  sendforsignature: 'sendforsignature',
  'rotate-pages': 'rotatepages',
  fillsign: 'fillsign',
  'split-pdf': 'split',
  'insert-pdf': 'insert',
  'compress-pdf': 'compress',
  'png-to-pdf': 'jpgtopdf',
  'image-to-pdf': 'jpgtopdf',
  'bmp-to-pdf': 'jpgtopdf',
  'gif-to-pdf': 'jpgtopdf',
  'tiff-to-pdf': 'jpgtopdf',
  'indd-to-pdf': 'createpdf',
  'psd-to-pdf': 'createpdf',
  'ai-to-pdf': 'createpdf',
  'number-pages': 'number',
  'ocr-pdf': 'ocr',
  'chat-pdf': 'chat',
  'chat-pdf-student': 'study',
};

const exhLimitCookieMap = {
  'to-pdf': 'cr_p_c',
  'pdf-to': 'ex_p_c',
  'combine-pdf': 'cb_p_c',
  'compress-pdf': 'cm_p_ops',
  'rotate-pages': 'or_p_c',
  createpdf: 'cr_p_c',
  'ocr-pdf': 'ocr_p_c',
};

const appEnvCookieMap = {
  stage: 's_ta_',
  prod: 'p_ac_',
};

const MIME_TYPES = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
};

const ICONS = {
  WIDGET_ICON: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0.3 24 23.4"><g id="Surfaces"><path fill="#b30b00" d="M4.25.3h15.5A4.24643,4.24643,0,0,1,24,4.55v14.9a4.24643,4.24643,0,0,1-4.25,4.25H4.25A4.24643,4.24643,0,0,1,0,19.45V4.55A4.24643,4.24643,0,0,1,4.25.3Z"/></g><g id="Outlined_Mnemonics_Logos" data-name="Outlined Mnemonics Logos"><path id="_256" data-name=" 256" fill="#fff" d="M19.3,13.85a1.78946,1.78946,0,0,0-.44031-.33547,2.83828,2.83828,0,0,0-.59969-.24078,4.79788,4.79788,0,0,0-.75719-.14516A7.94332,7.94332,0,0,0,16.59,13.08q-.27375.00375-.54891.017-.27492.01337-.54984.03672-.2747.02345-.548.05734-.273.034-.54328.07891-.1725-.16875-.33891-.345-.16617-.17625-.32484-.36-.15844-.18375-.308-.375-.1493-.19125-.28828-.39-.10875-.14625-.212-.29625-.10337-.15-.20172-.30375-.09845-.15375-.19234-.31125-.094-.1575-.18391-.31875.17625-.55125.30766-1.04813.13148-.49688.21859-.93937.08718-.4425.13047-.83063A6.52908,6.52908,0,0,0,13.05,7.03a3.675,3.675,0,0,0-.08594-.80563A2.42373,2.42373,0,0,0,12.685,5.505a1.4927,1.4927,0,0,0-.50406-.51688A1.44959,1.44959,0,0,0,11.42,4.79a1.19728,1.19728,0,0,0-.30547.04719A1.22057,1.22057,0,0,0,10.41,5.38a2.17839,2.17839,0,0,0-.25078.82187,4.69881,4.69881,0,0,0,.007,1.08813,7.85466,7.85466,0,0,0,.25641,1.26812A10.26146,10.26146,0,0,0,10.92,9.92c-.0725.2125-.14625.42312-.222.63391s-.1536.42171-.23422.63484-.16406.42844-.25109.648S10.035,12.28,9.94,12.51q-.12375.2925-.25344.58281Q9.55672,13.383,9.42,13.67q-.13688.28688-.28156.56969Q8.99359,14.52235,8.84,14.8c-.3075.1225-.70125.28937-1.12281.49156A12.99444,12.99444,0,0,0,6.4275,15.995a6.08618,6.08618,0,0,0-1.10594.86094A1.9673,1.9673,0,0,0,4.75,17.82a1.08624,1.08624,0,0,0-.01969.29219,1.10366,1.10366,0,0,0,.05719.28281,1.13932,1.13932,0,0,0,.12844.26031A1.17812,1.17812,0,0,0,5.11,18.88a1.45543,1.45543,0,0,0,.23312.17047,1.49272,1.49272,0,0,0,.25938.12078,1.5496,1.5496,0,0,0,.27812.07016A1.60815,1.60815,0,0,0,6.17,19.26a2.26684,2.26684,0,0,0,1.16953-.36984,5.403,5.403,0,0,0,1.12172-.95391,11.55912,11.55912,0,0,0,1.02609-1.30453c.32078-.46734.61766-.95422.88266-1.42172q.225-.075.45172-.14781.22664-.07266.45453-.14219.22781-.06938.45641-.13469.22851-.06515.45734-.12531.25125-.0675.49687-.12766.24562-.06022.48563-.11359.24-.05343.47437-.10047.23438-.0471.46313-.08828a7.87389,7.87389,0,0,0,1.20266.87266,6.26924,6.26924,0,0,0,1.08359.50609,5.254,5.254,0,0,0,.913.23422A4.37649,4.37649,0,0,0,18,15.9a2.59368,2.59368,0,0,0,.65125-.07453A1.51031,1.51031,0,0,0,19.1,15.63375a1.1277,1.1277,0,0,0,.28375-.26109A1.11325,1.11325,0,0,0,19.54,15.09a1.22521,1.22521,0,0,0,.068-.32313,1.25587,1.25587,0,0,0-.12281-.63875A1.23791,1.23791,0,0,0,19.3,13.85Z"/></g></svg>',
  UPLOAD_ICON: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M22.0007 6.66675H18.0007C17.8238 6.66675 17.6543 6.73699 17.5292 6.86201C17.4042 6.98703 17.334 7.1566 17.334 7.33341V8.66675C17.334 8.84356 17.4042 9.01313 17.5292 9.13815C17.6543 9.26318 17.8238 9.33341 18.0007 9.33341H20.0007V20.0001H4.00065V9.33341H6.00065C6.17746 9.33341 6.34703 9.26318 6.47206 9.13815C6.59708 9.01313 6.66732 8.84356 6.66732 8.66675V7.33341C6.66732 7.1566 6.59708 6.98703 6.47206 6.86201C6.34703 6.73699 6.17746 6.66675 6.00065 6.66675H2.00065C1.82384 6.66675 1.65427 6.73699 1.52925 6.86201C1.40422 6.98703 1.33398 7.1566 1.33398 7.33341V22.0001C1.33398 22.1769 1.40422 22.3465 1.52925 22.4715C1.65427 22.5965 1.82384 22.6667 2.00065 22.6667H22.0007C22.1775 22.6667 22.347 22.5965 22.4721 22.4715C22.5971 22.3465 22.6673 22.1769 22.6673 22.0001V7.33341C22.6673 7.1566 22.5971 6.98703 22.4721 6.86201C22.347 6.73699 22.1775 6.66675 22.0007 6.66675Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.1994 5.3334H10.6661V12.6667C10.6661 12.8435 10.7363 13.0131 10.8613 13.1381C10.9864 13.2632 11.1559 13.3334 11.3327 13.3334H12.6661C12.8429 13.3334 13.0124 13.2632 13.1375 13.1381C13.2625 13.0131 13.3327 12.8435 13.3327 12.6667V5.3334H16.7994C16.9409 5.3334 17.0765 5.27721 17.1765 5.17719C17.2765 5.07717 17.3327 4.94152 17.3327 4.80007C17.3339 4.67018 17.2864 4.54456 17.1994 4.44807L12.2327 0.0960672C12.1706 0.0346729 12.0868 0.000244141 11.9994 0.000244141C11.912 0.000244141 11.8282 0.0346729 11.7661 0.0960672L6.7994 4.4454C6.71182 4.54258 6.6642 4.66926 6.66607 4.80007C6.66607 4.94152 6.72226 5.07717 6.82228 5.17719C6.9223 5.27721 7.05795 5.3334 7.1994 5.3334Z" fill="white"/></svg>',
  SECURITY_ICON: '<svg width="26" height="31" viewBox="0 0 26 31" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 0L25.5 4.163V14.177C25.4633 17.9427 24.2335 21.5998 21.9875 24.6226C19.7415 27.6453 16.5949 29.8781 13 31C9.4386 29.8983 6.31448 27.7033 4.07079 24.7262C1.82711 21.7491 0.577772 18.1411 0.5 14.414V14.052V4.166L13 0ZM13 1.581L2 5.246V14.051C2.00065 17.3991 3.03609 20.6651 4.96458 23.402C6.89306 26.1389 9.62033 28.2129 12.773 29.34L12.996 29.418L13.217 29.34C16.2922 28.2358 18.9645 26.2329 20.8873 23.5911C22.8101 20.9494 23.8946 17.7907 24 14.525V14.177V5.244L13 1.581Z" fill="#8E8E8E"/><path d="M19.2052 10.484C19.3352 10.3458 19.5127 10.262 19.7019 10.2494C19.8912 10.2369 20.0782 10.2965 20.2253 10.4163C20.3723 10.5361 20.4685 10.7072 20.4945 10.8951C20.5205 11.083 20.4743 11.2738 20.3652 11.429L20.2952 11.515L12.0362 20.242C11.913 20.3715 11.7476 20.4528 11.5697 20.4711C11.3919 20.4895 11.2133 20.4436 11.0662 20.342L10.9802 20.273L7.23925 16.788C7.10054 16.659 7.01577 16.4823 7.00199 16.2933C6.98821 16.1044 7.04642 15.9173 7.16494 15.7695C7.28345 15.6217 7.4535 15.5243 7.64091 15.4967C7.82832 15.4692 8.01921 15.5136 8.17525 15.621L8.26225 15.691L11.4622 18.669L19.2052 10.484Z" fill="#FA0F00"/></svg>',
  INFO_ICON: '<svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.8"><path d="M9.00078 7.0748C9.59449 7.0748 10.0758 6.59351 10.0758 5.9998C10.0758 5.4061 9.59449 4.9248 9.00078 4.9248C8.40707 4.9248 7.92578 5.4061 7.92578 5.9998C7.92578 6.59351 8.40707 7.0748 9.00078 7.0748Z" fill="#222222"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.167 12H10V8.2C10 8.14696 9.97893 8.09609 9.94142 8.05858C9.90391 8.02107 9.85304 8 9.8 8H7.833C7.833 8 7.25 8.016 7.25 8.5C7.25 8.984 7.833 9 7.833 9H8V12H7.833C7.833 12 7.25 12.016 7.25 12.5C7.25 12.984 7.833 13 7.833 13H10.167C10.167 13 10.75 12.984 10.75 12.5C10.75 12.016 10.167 12 10.167 12Z" fill="#222222"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9.00078 1.0498C7.42842 1.0498 5.89137 1.51606 4.584 2.38962C3.27663 3.26318 2.25766 4.5048 1.65594 5.95747C1.05423 7.41014 0.896789 9.00862 1.20354 10.5508C1.51029 12.0929 2.26746 13.5095 3.37929 14.6213C4.49111 15.7331 5.90767 16.4903 7.44982 16.797C8.99197 17.1038 10.5904 16.9464 12.0431 16.3446C13.4958 15.7429 14.7374 14.724 15.611 13.4166C16.4845 12.1092 16.9508 10.5722 16.9508 8.9998C16.9508 6.89133 16.1132 4.86922 14.6223 3.37831C13.1314 1.88739 11.1093 1.0498 9.00078 1.0498ZM9.00078 15.9558C7.62502 15.9558 6.28015 15.5478 5.13624 14.7835C3.99233 14.0192 3.10076 12.9328 2.57428 11.6618C2.0478 10.3907 1.91004 8.99209 2.17844 7.64276C2.44684 6.29342 3.10934 5.05398 4.08215 4.08117C5.05496 3.10836 6.2944 2.44586 7.64374 2.17746C8.99307 1.90906 10.3917 2.04682 11.6627 2.5733C12.9338 3.09978 14.0202 3.99135 14.7845 5.13526C15.5488 6.27917 15.9568 7.62404 15.9568 8.9998C15.9568 10.8447 15.2239 12.6139 13.9194 13.9184C12.6149 15.2229 10.8456 15.9558 9.00078 15.9558Z" fill="#222222"/></g></svg>',
  CLOSE_ICON: '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_15746_2423)"><g clip-path="url(#clip1_15746_2423)"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.2381 15.9994L19.6944 13.5434C19.8586 13.3793 19.9509 13.1566 19.9509 12.9245C19.951 12.6923 19.8588 12.4696 19.6946 12.3054C19.5305 12.1412 19.3078 12.0489 19.0757 12.0488C18.8435 12.0488 18.6208 12.141 18.4566 12.3051L16.0002 14.7615L13.5435 12.3051C13.3793 12.141 13.1566 12.0489 12.9245 12.049C12.6923 12.0491 12.4697 12.1414 12.3057 12.3056C12.1416 12.4698 12.0495 12.6925 12.0496 12.9246C12.0497 13.1568 12.142 13.3794 12.3062 13.5434L14.7622 15.9994L12.3062 18.4555C12.1427 18.6197 12.051 18.8421 12.0512 19.0738C12.0515 19.3055 12.1436 19.5277 12.3074 19.6916C12.4711 19.8556 12.6933 19.9478 12.925 19.9482C13.1567 19.9486 13.3791 19.8571 13.5435 19.6938L16.0002 17.2374L18.4566 19.6938C18.6208 19.8579 18.8435 19.9501 19.0756 19.9501C19.3078 19.95 19.5305 19.8577 19.6946 19.6935C19.8588 19.5293 19.9509 19.3066 19.9509 19.0745C19.9509 18.8423 19.8586 18.6196 19.6944 18.4555L17.2381 15.9994Z" fill="white"/></g></g><defs><clipPath id="clip0_15746_2423"><rect width="8" height="8" fill="white" transform="translate(12 12)"/></clipPath><clipPath id="clip1_15746_2423"><rect width="8" height="8" fill="white" transform="translate(12 12)"/></clipPath></defs></svg>',
};

function isMobileDevice() {
  return /android|iphone|ipod|blackberry|windows phone/i.test(navigator.userAgent);
}

function isTabletDevice() {
  const ua = navigator.userAgent.toLowerCase();
  const isIPadOS = navigator.userAgent.includes('Mac') && 'ontouchend' in document && !/iphone|ipod/i.test(ua);
  return isIPadOS || /ipad|android(?!.*mobile)/i.test(ua);
}

function redDirLink(verb) {
  const hostname = window?.location?.hostname;
  const ENV = getEnv();
  if (hostname !== 'www.adobe.com' && hostname !== 'sign.ing' && hostname !== 'edit.ing') {
    return `https://www.adobe.com/go/acrobat-${verbRedirMap[verb] || verb.split('-').join('')}-${ENV}`;
  }
  return `https://www.adobe.com/go/acrobat-${verbRedirMap[verb] || verb.split('-').join('')}` || fallBack;
}

function redDir(verb) {
  window.location.href = redDirLink(verb);
}

async function loadGoogleLogin() {
  if (window.adobeIMS?.isSignedInUser()) return;
  const { default: initGoogleLogin } = await import(`${miloLibs}/features/google-login.js`);
  initGoogleLogin(loadIms, getMetadata, loadScript, getConfig);
}

async function showUpSell(verb, element) {
  const headline = window.mph?.[`verb-widget-upsell-headline-${verb}`] || window.mph?.['verb-widget-upsell-headline'];
  const headlineNopayment = window.mph?.['verb-widget-upsell-headline-nopayment'];
  const bulletsHeading = window.mph?.['verb-widget-upsell-bullets-heading'];
  const bullets = window.mph?.[`verb-widget-upsell-bullets-${verb}`] || window.mph?.['verb-widget-upsell-bullets'];

  const headlineEl = createTag('h1', { class: 'verb-upsell-heading' }, headline);
  const headingNopaymentEl = createTag('h1', { class: 'verb-upsell-heading verb-upsell-heading-nopayment' }, headlineNopayment);
  const upsellBulletsHeading = createTag('p', { class: 'verb-upsell-bullets-heading' }, bulletsHeading);
  const upsellBullets = createTag('ul', { class: 'verb-upsell-bullets' });
  (bullets || '').split('\n').forEach((bullet) => upsellBullets.append(createTag('li', {}, bullet)));

  const upsell = createTag('div', { class: 'verb-upsell' });
  const upsellColumn = createTag('div', { class: 'verb-upsell-column' });

  const socialContainer = createTag('div', { class: 'verb-upsell-social-container' });
  const socialCta = createTag('div', { class: 'susi-light' });
  socialCta.innerHTML = `<div><div>${redDirLink(verb)}</div></div>`;
  socialContainer.append(socialCta);
  await loadBlock(socialCta);

  const upsellRow = createTag('div', { class: 'verb-row' });
  upsellRow.append(upsellColumn, socialContainer);
  upsell.append(upsellRow);
  upsellColumn.append(headlineEl, headingNopaymentEl, upsellBulletsHeading, upsellBullets);

  const upsellWidget = createTag('div', { class: 'verb-wrapper verb-upsell-active' });
  const upsellContainer = createTag('div', { class: 'verb-container' });
  upsellWidget.append(upsellContainer);
  upsellContainer.append(upsell);

  element.classList.add('upsell');
  element.append(upsellWidget);

  loadGoogleLogin();
}

const setUser = () => { localStorage.setItem('unity.user', 'true'); };

const lanaOptions = { sampleRate: 1, tags: 'DC_Milo,Project Unity (DC)', severity: 'error' };

window.analytics = {
  verbAnalytics: () => {},
  reviewAnalytics: () => {},
  sendAnalyticsToSplunk: () => {},
};

function getSplunkEndpoint() {
  return getEnv() === 'prod'
    ? 'https://unity.adobe.io/api/v1/log'
    : 'https://unity-stage.adobe.io/api/v1/log';
}

function getVerbKey(verbKey) {
  const count = parseInt(localStorage.getItem(verbKey), 10) || 0;
  return ({ 0: '1st', 1: '2nd' })[count] || '2+';
}

function incrementVerbKey(verbKey) {
  const count = (parseInt(localStorage.getItem(verbKey), 10) || 0) + 1;
  localStorage.setItem(verbKey, count);
}

async function loadAnalyticsAfterLCP(verb, userAttempts) {
  try {
    const { default: verbAnalytics, reviewAnalytics, sendAnalyticsToSplunk } = await import('../../scripts/alloy/verb-widget.js');
    window.analytics.verbAnalytics = verbAnalytics;
    window.analytics.reviewAnalytics = reviewAnalytics;
    window.analytics.sendAnalyticsToSplunk = sendAnalyticsToSplunk;
    window.analytics.verbAnalytics('landing:shown', verb, { userAttempts });
    window.analytics.reviewAnalytics(verb);
  } catch (error) {
    window.lana?.log(
      `Error Code: Unknown, Status: 'Unknown', Message: Analytics import failed: ${error.message} on ${verb}`,
      lanaOptions,
    );
  }
}

window.addEventListener('analyticsLoad', async ({ detail }) => {
  const delay = (ms) => new Promise((res) => { setTimeout(res, ms); });
  if (window.PerformanceObserver) {
    await Promise.race([
      new Promise((res) => {
        try {
          const obs = new PerformanceObserver((entries) => {
            if (entries.getEntries().length > 0) { obs.disconnect(); res(); }
          });
          obs.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch { res(); }
      }),
      delay(3000),
    ]);
  } else {
    await delay(3000);
  }
  await loadAnalyticsAfterLCP(detail.verb, detail.userAttempts);
});

export const IDB_NAME = 'dc-file-transfer';
export const IDB_STORE = 'encrypted-files';
const IDB_VERSION = 1;

export function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = ({ target: { result: db } }) => {
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = ({ target: { result } }) => resolve(result);
    req.onerror = ({ target: { error } }) => reject(error);
  });
}

export async function storeEncryptedLocalFile(id, file) {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    await file.arrayBuffer(),
  );

  const record = { ciphertext, iv, key, fileName: file.name, mimeType: file.type };
  const db = await openIDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(record, id);
    tx.oncomplete = resolve;
    tx.onerror = ({ target: { error } }) => reject(error);
  });
  db.close();
}

export async function encryptAndStore(file) {
  const id = crypto.randomUUID();
  await storeEncryptedLocalFile(id, file);
  return id;
}

export function validateFiles(files, verb) {
  const limits = LIMITS[verb];
  const mph = window.mph ?? {};

  if (!limits || !files.length) {
    return { valid: false, code: 'error_generic', message: mph['verb-widget-error-generic'] || 'Unable to process the request.' };
  }

  if (!limits.multipleFiles && !limits.maxNumFiles && files.length > 1) {
    return {
      valid: false,
      code: 'error_only_accept_one_file',
      message: mph['verb-widget-error-only-accept-one-file'] || 'This tool only accepts one file at a time.',
    };
  }

  const maxFiles = limits.maxNumFiles ?? (limits.multipleFiles ? Infinity : 1);
  if (files.length > maxFiles) {
    return {
      valid: false,
      code: 'error_max_num_files',
      message: mph['verb-widget-error-max-num-files'] || 'Too many files selected.',
    };
  }

  const names = Array.from(files).map((f) => f.name);
  const firstDuplicate = names.find((name, i) => names.indexOf(name) !== i);
  if (firstDuplicate) {
    return {
      valid: false,
      code: 'error_duplicate_asset',
      message: mph['verb-widget-error-duplicate-asset'] || 'Duplicate detected. Please rename file before uploading again.',
    };
  }

  const multi = files.length > 1;
  for (const file of files) {
    if (file.size === 0) {
      return {
        valid: false,
        code: 'error_empty_file',
        message: mph['verb-widget-error-empty-file'] || (multi ? 'These files are empty.' : 'This file is empty.'),
      };
    }

    if (file.size > limits.maxFileSize) {
      return {
        valid: false,
        code: 'error_file_too_large',
        message: mph['verb-widget-error-file-too-large'] || (multi ? 'These files are either too large or too complex to export.' : 'This file is either too large or too complex to export.'),
      };
    }

    const ext = `.${file.name.split('.').pop().toLowerCase()}`;
    if (limits.acceptedFiles && !limits.acceptedFiles.includes(ext)) {
      return {
        valid: false,
        code: 'error_unsupported_type',
        message: mph['verb-widget-error-unsupported-type'] || (multi ? 'These files are in a format not supported for conversion to PDF.' : 'This file is in a format not supported for conversion to PDF.'),
      };
    }

    const allowedMimes = MIME_TYPES[ext];
    if (file.type && allowedMimes && !allowedMimes.includes(file.type)) {
      return {
        valid: false,
        code: 'error_unsupported_type',
        message: mph['verb-widget-error-unsupported-type'] || (multi ? 'These files are in a format not supported for conversion to PDF.' : 'This file is in a format not supported for conversion to PDF.'),
      };
    }
  }

  return { valid: true };
}

const svgCache = new Map();

async function loadSvg(iconName) {
  try {
    const response = await fetch(`/acrobat/blocks/verb-widget/icons/${iconName}.svg`);
    if (!response.ok) throw new Error(`Failed to load SVG: ${response.statusText}`);
    return await response.text();
  } catch (error) {
    window.lana?.log(`Error Code: Unknown, Status: 'Unknown', Message: Icon not found: ${iconName}`, lanaOptions);
    return null;
  }
}

async function createSvgElement(iconName) {
  if (svgCache.has(iconName)) return svgCache.get(iconName).cloneNode(true);
  const svgString = ICONS[iconName] || await loadSvg(iconName);
  if (!svgString) return null;
  const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  svgCache.set(iconName, doc.documentElement);
  return doc.documentElement.cloneNode(true);
}

export default async function init(element) {
  ({
    createTag, getConfig, loadBlock, getMetadata, loadIms, loadScript,
  } = await import(`${miloLibs}/utils/utils.js`));

  if (isOldBrowser()) {
    window.location.href = EOLBrowserPage;
    return;
  }

  const { locale } = getConfig();
  const ppURL = window.mph?.['verb-widget-privacy-policy-url']
    || `https://www.adobe.com${locale.prefix}/privacy/policy.html`;
  const touURL = window.mph?.['verb-widget-terms-of-use-url']
    || `https://www.adobe.com${locale.prefix}/legal/terms.html`;

  const children = [...element.querySelectorAll(':scope > div')];
  const VERB = element.classList[1];
  const limits = LIMITS[VERB] ?? LIMITS['image-to-pdf'];
  const userAttempts = getVerbKey(`${VERB}_attempts`);
  const isMobile = isMobileDevice();
  const isTablet = isTabletDevice();

  const heading = children[0]?.textContent ?? '';
  const subCopy = children[1]?.textContent ?? window.mph?.[`verb-widget-${VERB}-description`] ?? '';
  const ctaLabel = window.mph?.['verb-widget-cta'] ?? 'Select a file';

  children.forEach((c) => c.remove());

  const widget = createTag('div', { id: 'drop-zone', class: 'verb-wrapper' });
  const widgetContainer = createTag('div', { class: 'verb-container' });
  const widgetRow = createTag('div', { class: 'verb-row' });
  const widgetLeft = createTag('div', { class: 'verb-col' });
  const widgetRight = createTag('div', { class: 'verb-col right' });

  const widgetHeader = createTag('div', { class: 'verb-header' });
  const widgetIcon = createTag('div', { class: 'acrobat-icon' });
  const widgetIconSvg = await createSvgElement('WIDGET_ICON');
  if (widgetIconSvg) { widgetIconSvg.classList.add('icon-verb'); widgetIcon.appendChild(widgetIconSvg); }
  const widgetTitle = createTag('div', { class: 'verb-title' }, 'Adobe Acrobat');
  widgetHeader.append(widgetIcon, widgetTitle);

  const widgetHeading = createTag('h1', { class: 'verb-heading' }, heading);
  const widgetCopy = createTag('p', { class: 'verb-copy' }, subCopy);

  const errorState = createTag('div', { class: 'error hide' });
  const errorIcon = createTag('div', { class: 'verb-errorIcon' });
  const errorText = createTag('p', { class: 'verb-errorText' });
  const closeErrorBtn = createTag('div', { class: 'verb-errorBtn', role: 'button', tabindex: '0', 'aria-label': 'Close error' });
  const closeIconSvg = await createSvgElement('CLOSE_ICON');
  if (closeIconSvg) { closeIconSvg.classList.add('close-icon', 'error'); closeErrorBtn.prepend(closeIconSvg); }

  const ctaButton = createTag('button', { for: 'file-upload', class: 'verb-cta', tabindex: 0, 'aria-label': ctaLabel });
  const uploadIconSvg = await createSvgElement('UPLOAD_ICON');
  if (uploadIconSvg) { uploadIconSvg.classList.add('upload-icon'); ctaButton.prepend(uploadIconSvg); }
  ctaButton.append(createTag('span', { class: 'verb-cta-label' }, ctaLabel));

  const fileInput = createTag('input', {
    type: 'file',
    accept: limits.acceptedFiles?.join(','),
    id: 'file-upload',
    class: 'hide',
    'aria-hidden': 'true',
    ...(limits.multipleFiles && { multiple: '' }),
  });

  const widgetImage = createTag('div', { class: 'verb-image' });
  const verbImageSvg = await createSvgElement(VERB);
  if (verbImageSvg) {
    verbImageSvg.classList.add('icon-verb-image');
    verbImageSvg.setAttribute('alt', window.mph?.[`verb-widget-${VERB}-alt`] || VERB);
    widgetImage.appendChild(verbImageSvg);
  }

  const footer = createTag('div', { class: 'verb-footer' });
  const iconSecurity = createTag('div', { class: 'security-icon' });
  const infoIcon = createTag('div', {
    class: 'info-icon milo-tooltip top',
    tabindex: '0',
    role: 'button',
    'aria-label': window.mph?.['verb-widget-tool-tip'] || 'Files security information',
    'data-tooltip': window.mph?.['verb-widget-tool-tip'] || '',
  });
  const securityIconSvg = await createSvgElement('SECURITY_ICON');
  const infoIconSvg = await createSvgElement('INFO_ICON');
  if (securityIconSvg) {
    iconSecurity.appendChild(securityIconSvg);
    infoIcon.appendChild(infoIconSvg);
  }
  const legalWrapper = createTag('div', { class: 'verb-legal-wrapper' });
  const legal = createTag('p', { class: 'verb-legal' }, `${window.mph?.['verb-widget-legal'] ?? ''} `);
  const legalTwo = createTag('p', { class: 'verb-legal verb-legal-two' });
  legalTwo.innerHTML = [
    { key: 'verb-widget-terms-of-use', url: touURL },
    { key: 'verb-widget-privacy-policy', url: ppURL },
  ].reduce((html, { key, url }) => {
    const text = window.mph?.[key];
    return text ? html.replace(text, `<a class="verb-legal-url" target="_blank" href="${url}">${text}</a>`) : html;
  }, `${window.mph?.['verb-widget-legal-2'] ?? ''} `);
  legalWrapper.append(legal, legalTwo);
  if (isMobile) {
    widget.classList.add('mobile');
    infoIcon.classList.add('mobile');
  } else if (isTablet) {
    widget.classList.add('tablet');
    infoIcon.classList.add('tablet');
  }

  footer.append(iconSecurity, legalWrapper, infoIcon);

  if (isMobile && !isTablet) {
    iconSecurity.remove();
    footer.prepend(infoIcon);
  }

  errorState.append(errorIcon, errorText, closeErrorBtn);
  widgetLeft.append(
    widgetHeader,
    widgetHeading,
    widgetCopy,
    errorState,
    ctaButton,
    fileInput,
  );
  widgetRight.append(widgetImage);
  widgetRow.append(widgetLeft, widgetRight);
  widgetContainer.append(widgetRow);
  widget.append(widgetContainer);
  element.append(widget, footer);
  element.classList.add('ready');
  element.parentNode.style.display = 'block';

  async function checkSignedInUser() {
    if (!window.adobeIMS?.isSignedInUser?.()) return;

    element.classList.remove('upsell');
    element.classList.add('signed-in');

    let accountType;
    try {
      accountType = window.adobeIMS.getAccountType();
    } catch {
      accountType = (await window.adobeIMS.getProfile()).account_type;
    }

    if (accountType && LIMITS[VERB].neverRedirect) return;
    if (accountType !== 'type1') redDir(VERB);
    if (accountType === 'type1' && !LIMITS[VERB].typeOneLanding) redDir(VERB);
  }

  const { cookie } = document;
  const limitCookie = exhLimitCookieMap[VERB] || exhLimitCookieMap[VERB.match(/^pdf-to|to-pdf$/)?.[0]];
  const cookiePrefix = appEnvCookieMap[DC_ENV] || '';
  const isLimitExhausted = limitCookie && cookie.includes(`${cookiePrefix}${limitCookie}`);

  if (!window.adobeIMS?.isSignedInUser?.() && isLimitExhausted) {
    await showUpSell(VERB, element);
    window.analytics.verbAnalytics('upsell:shown', VERB, { userAttempts });
    window.analytics.verbAnalytics('upsell-wall:shown', VERB, { userAttempts });
  }

  await checkSignedInUser();
  window.addEventListener('IMS:Ready', checkSignedInUser);

  const showError = (message) => {
    errorText.textContent = message;
    errorState.classList.remove('hide');
    errorState.classList.add('verb-error');
    widget.classList.remove('dragging');
  };

  const hideError = () => {
    errorState.classList.add('hide');
    errorState.classList.remove('verb-error');
    errorText.textContent = '';
  };

  let exitFlag = false;
  let isUploading = false;

  function setCookie(name, value) {
    const expires = new Date(Date.now() + 30 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value};domain=.adobe.com;path=/;expires=${expires}`;
  }

  function getUploadTime() {
    const uploading = parseInt(document.cookie.match(/UTS_Uploading=([^;]*)/)?.[1], 10);
    const uploaded = parseInt(document.cookie.match(/UTS_Uploaded=([^;]*)/)?.[1], 10);
    if (Number.isNaN(uploading) || Number.isNaN(uploaded)) return 'N/A';
    return ((uploaded - uploading) / 1000).toFixed(1);
  }

  const errorAnalyticsMap = {
    error_only_accept_one_file: 'error_only_accept_one_file',
    error_unsupported_type: 'error:UnsupportedFile',
    error_empty_file: 'error:EmptyFile',
    error_file_too_large: 'error:TooLargeFile',
    error_max_num_files: 'error:max_num_files',
    error_duplicate_asset: 'error:duplicate_asset',
    error_generic: 'error',
  };

  function handleAnalyticsEvent(eventName, metadata, documentUnloading = true) {
    window.analytics.verbAnalytics(eventName, VERB, metadata, documentUnloading);
    window.analytics.sendAnalyticsToSplunk(eventName, VERB, metadata, getSplunkEndpoint());
  }

  function dispatchError(code, message, metadata = {}) {
    showError(message);
    window.lana?.log(`Error Code: ${code}, Message: ${message}`, lanaOptions);
    const analyticsKey = Object.keys(errorAnalyticsMap).find((k) => code.includes(k));
    if (analyticsKey) {
      window.analytics.verbAnalytics(errorAnalyticsMap[analyticsKey], VERB, analyticsKey === 'error_generic' ? { errorInfo: message } : {});
      window.analytics.sendAnalyticsToSplunk(analyticsKey, VERB, metadata, getSplunkEndpoint());
    }
    exitFlag = true;
  }

  async function startUpload(files) {
    hideError();

    const [file] = files;
    const filesData = {
      userAttempts,
      size: file.size,
      type: file.type,
      count: 1,
      uploadType: 'sfu',
    };

    isUploading = true;
    exitFlag = false;
    setCookie('UTS_Uploading', Date.now());
    handleAnalyticsEvent('job:uploading', filesData, false);

    ctaButton.disabled = true;
    ctaButton.querySelector('.verb-cta-label').textContent = window.mph?.['verb-widget-processing'] || 'Processing…';

    try {
      const id = await encryptAndStore(file);

      const uploadTimestamp = Date.now();
      setCookie('UTS_Uploaded', uploadTimestamp);
      exitFlag = true;
      isUploading = false;
      incrementVerbKey(`${VERB}_attempts`);
      setUser();

      const uploadTime = getUploadTime();
      const uploadedMetadata = { ...filesData, assetId: id, uploadTime };
      handleAnalyticsEvent('job:uploaded', uploadedMetadata, false);

      const redirectBase = DC_ENV === 'prod'
        ? 'https://www.adobe.com/acrobat-online/image-to-pdf.html'
        : 'https://www.stage.adobe.com/acrobat-online/image-to-pdf.html';
      const originalParams = DC_ENV === 'stage' ? `${window.location.search.slice(1)}&` : '';
      const redirectUrl = `${redirectBase}?${originalParams}clientConvert=true&UTS_Uploaded=${uploadTimestamp}&redirectTime=${Date.now()}&fileId=${id}`;
      handleAnalyticsEvent('job:redirect-success', { ...filesData, redirectUrl }, false);
      window.location.href = redirectUrl;
    } catch (err) {
      isUploading = false;
      ctaButton.disabled = false;
      ctaButton.querySelector('.verb-cta-label').textContent = ctaLabel;
      dispatchError('error_generic', err.message || 'Failed to store file. Please try again.', filesData);
    }
  }

  fileInput.addEventListener('click', () => {
    [
      'filepicker:shown',
      'dropzone:choose-file-clicked',
      'files-selected',
      'entry:clicked',
      'discover:clicked',
    ].forEach((evt) => window.analytics.verbAnalytics(evt, VERB, { userAttempts }));
  });

  fileInput.addEventListener('cancel', () => {
    window.analytics.verbAnalytics('choose-file:close', VERB, { userAttempts });
  });

  fileInput.addEventListener('change', ({ target: { files } }) => {
    if (!files?.length) return;
    exitFlag = false;
    handleAnalyticsEvent('choose-file:open', { userAttempts }, true);
    const validation = validateFiles(files, VERB);
    if (!validation.valid) {
      dispatchError(validation.code, validation.message, { userAttempts });
      return;
    }
    startUpload(Array.from(files));
  });

  widget.addEventListener('click', (e) => {
    if (e.target.closest('.error')) return;
    fileInput.click();
  });

  widget.addEventListener('dragover', (e) => {
    e.preventDefault();
    widget.classList.add('dragging');
  });

  widget.addEventListener('dragleave', () => widget.classList.remove('dragging'));

  widget.addEventListener('drop', (e) => {
    e.preventDefault();
    widget.classList.remove('dragging');
    const { files } = e.dataTransfer;
    if (!files?.length) return;
    exitFlag = false;
    ['files-dropped', 'entry:clicked', 'discover:clicked'].forEach((evt) => {
      handleAnalyticsEvent(evt, { userAttempts }, true);
    });
    const validation = validateFiles(files, VERB);
    if (!validation.valid) {
      dispatchError(validation.code, validation.message, { userAttempts });
      return;
    }
    startUpload(Array.from(files));
  });

  closeErrorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideError();
  });

  window.addEventListener('beforeunload', (e) => {
    const cookieExp = new Date(Date.now() + 90 * 1000).toUTCString();
    if (exitFlag) {
      document.cookie = `UTS_Redirect=${Date.now()};domain=.adobe.com;path=/;expires=${cookieExp}`;
    }
    if (isUploading) {
      e.preventDefault();
      e.returnValue = true;
    }
  });

  window.addEventListener('pageshow', (e) => {
    const historyTraversal = e.persisted
      || (typeof window.performance !== 'undefined'
        && window.performance.getEntriesByType('navigation')[0].type === 'back_forward');
    if (historyTraversal) window.location.reload();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.dispatchEvent(new CustomEvent('analyticsLoad', { detail: { verb: VERB, userAttempts } }));
    });
  } else {
    window.dispatchEvent(new CustomEvent('analyticsLoad', { detail: { verb: VERB, userAttempts } }));
  }
}
