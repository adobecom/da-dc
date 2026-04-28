import { setLibs, isOldBrowser, loadPlaceholders, getEnv as getAppEnv } from '../../scripts/utils.js';

/** Verbs supported by verb-marquee only; values mirror ../verb-widget/verb-widget.js LIMITS. */
export const LIMITS = {
  fillsign: {
    maxFileSize: 104857600, // 100 MB
    maxFileSizeFriendly: '100 MB',
    acceptedFiles: ['.pdf'],
    maxNumFiles: 1,
    multipleFiles: false,
    mobileApp: true,
  },
  'word-to-pdf': {
    maxFileSize: 104857600, // 100 MB
    maxFileSizeFriendly: '100 MB',
    acceptedFiles: ['.pdf', '.doc', '.docx', '.xml', '.ppt', '.pptx', '.xls', '.xlsx', '.rtf', '.txt', '.text', '.ai', '.form', '.bmp', '.gif', '.indd', '.jpeg', '.jpg', '.png', '.psd', '.tif', '.tiff'],
    multipleFiles: true,
  },
  'jpg-to-pdf': {
    maxFileSize: 104857600, // 100 MB
    maxFileSizeFriendly: '100 MB',
    acceptedFiles: ['.pdf', '.doc', '.docx', '.xml', '.ppt', '.pptx', '.xls', '.xlsx', '.rtf', '.txt', '.text', '.ai', '.form', '.bmp', '.gif', '.indd', '.jpeg', '.jpg', '.png', '.psd', '.tif', '.tiff'],
    multipleFiles: true,
  },
  'summarize-pdf': {
    maxFileSize: 104857600, // 100 MB
    maxFileSizeFriendly: '1 MB',
    acceptedFiles: ['.pdf', '.doc', '.docx', '.xml', '.ppt', '.pptx', '.xls', '.xlsx', '.rtf', '.txt', '.text', '.ai', '.form', '.bmp', '.gif', '.indd', '.jpeg', '.jpg', '.png', '.psd', '.tif', '.tiff'],
    maxNumFiles: 1,
    genAI: true,
  },
};

const miloLibs = setLibs('/libs');
let createTag;
let getConfig;
let loadStyle;
let decorateBlockBg;

/** Mirrors verb-widget exhLimitCookieMap for anonymous conversion-limit cookies. */
const exhLimitCookieMap = {
  'to-pdf': 'cr_p_c',
  'pdf-to': 'ex_p_c',
  'compress-pdf': 'cm_p_ops',
  'rotate-pages': 'or_p_c',
  createpdf: 'cr_p_c',
  'ocr-pdf': 'ocr_p_c',
};

const appEnvCookieMap = {
  stage: 's_ta_',
  prod: 'p_ac_',
};

const DC_ENV = ['www.adobe.com', 'sign.ing', 'edit.ing'].includes(window.location.hostname) ? 'prod' : 'stage';

const EOLBrowserPage = 'https://acrobat.adobe.com/home/index-browser-eol.html';

const lanaOptions = {
  sampleRate: 100,
  tags: 'DC_Milo,Project Unity (DC)',
  severity: 'error',
};

const ICONS = {
  WIDGET_ICON: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="31" viewBox="0 0 32 31" fill="none"><path d="M25.8211 0H5.67886C2.54251 0 0 2.45484 0 5.48304V24.9308C0 27.959 2.54251 30.4138 5.67886 30.4138H25.8211C28.9575 30.4138 31.5 27.959 31.5 24.9308V5.48304C31.5 2.45484 28.9575 0 25.8211 0Z" fill="#B30B00"/><path d="M25.7023 17.5726C24.1856 16.0519 20.044 16.6714 19.0523 16.784C17.594 15.4323 16.6023 13.799 16.2523 13.2358C16.7773 11.7151 17.1273 10.1944 17.1856 8.56106C17.1856 7.15301 16.6023 5.63232 14.969 5.63232C14.3856 5.63232 13.8606 5.97026 13.569 6.42083C12.869 7.60359 13.1606 9.96911 14.269 12.3909C13.6273 14.1369 13.044 15.8266 11.4106 18.8116C9.71898 19.4875 6.16064 21.0645 5.86898 22.7542C5.75231 23.2611 5.92731 23.768 6.33564 24.1622C6.74398 24.5001 7.26898 24.6691 7.79398 24.6691C9.95231 24.6691 12.0523 21.7967 13.5106 19.3749C14.7356 18.9806 16.6606 18.4174 18.5856 18.0795C20.8606 19.9944 22.844 20.276 23.894 20.276C25.294 20.276 25.819 19.7128 25.994 19.2059C26.2856 18.6427 26.1106 18.0231 25.7023 17.5726ZM24.244 18.53C24.1856 18.9243 23.6606 19.3185 22.7273 19.0932C21.619 18.8116 20.6273 18.3047 19.7523 17.6289C20.5106 17.5162 22.2023 17.3473 23.4273 17.5726C23.894 17.6852 24.3606 17.9668 24.244 18.53ZM14.5023 6.92773C14.619 6.75876 14.794 6.64612 14.969 6.64612C15.494 6.64612 15.6106 7.26566 15.6106 7.77255C15.5523 8.95531 15.319 10.1381 14.9106 11.2645C14.0356 9.01164 14.2106 7.43462 14.5023 6.92773ZM14.3856 17.8542C14.8523 16.953 15.494 15.376 15.7273 14.7001C16.2523 15.545 17.1273 16.5588 17.594 17.0093C17.594 17.0657 15.7856 17.4036 14.3856 17.8542ZM10.944 20.107C9.60231 22.2473 8.20231 23.599 7.44398 23.599C7.32731 23.599 7.21064 23.5427 7.09398 23.4864C6.91898 23.3737 6.86064 23.2047 6.91898 22.9795C7.09398 22.1909 8.61064 21.1208 10.944 20.107Z" fill="white"/></svg>',
  UPLOAD_ICON: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M22.0007 6.66675H18.0007C17.8238 6.66675 17.6543 6.73699 17.5292 6.86201C17.4042 6.98703 17.334 7.1566 17.334 7.33341V8.66675C17.334 8.84356 17.4042 9.01313 17.5292 9.13815C17.6543 9.26318 17.8238 9.33341 18.0007 9.33341H20.0007V20.0001H4.00065V9.33341H6.00065C6.17746 9.33341 6.34703 9.26318 6.47206 9.13815C6.59708 9.01313 6.66732 8.84356 6.66732 8.66675V7.33341C6.66732 7.1566 6.59708 6.98703 6.47206 6.86201C6.34703 6.73699 6.17746 6.66675 6.00065 6.66675H2.00065C1.82384 6.66675 1.65427 6.73699 1.52925 6.86201C1.40422 6.98703 1.33398 7.1566 1.33398 7.33341V22.0001C1.33398 22.1769 1.40422 22.3465 1.52925 22.4715C1.65427 22.5965 1.82384 22.6667 2.00065 22.6667H22.0007C22.1775 22.6667 22.347 22.5965 22.4721 22.4715C22.5971 22.3465 22.6673 22.1769 22.6673 22.0001V7.33341C22.6673 7.1566 22.5971 6.98703 22.4721 6.86201C22.347 6.73699 22.1775 6.66675 22.0007 6.66675Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.1994 5.3334H10.6661V12.6667C10.6661 12.8435 10.7363 13.0131 10.8613 13.1381C10.9864 13.2632 11.1559 13.3334 11.3327 13.3334H12.6661C12.8429 13.3334 13.0124 13.2632 13.1375 13.1381C13.2625 13.0131 13.3327 12.8435 13.3327 12.6667V5.3334H16.7994C16.9409 5.3334 17.0765 5.27721 17.1765 5.17719C17.2765 5.07717 17.3327 4.94152 17.3327 4.80007C17.3339 4.67018 17.2864 4.54456 17.1994 4.44807L12.2327 0.0960672C12.1706 0.0346729 12.0868 0.000244141 11.9994 0.000244141C11.912 0.000244141 11.8282 0.0346729 11.7661 0.0960672L6.7994 4.4454C6.71182 4.54258 6.6642 4.66926 6.66607 4.80007C6.66607 4.94152 6.72226 5.07717 6.82228 5.17719C6.9223 5.27721 7.05795 5.3334 7.1994 5.3334Z" fill="white"/></svg>',
  INFO_ICON: '<svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.8"><path d="M9.00078 7.0748C9.59449 7.0748 10.0758 6.59351 10.0758 5.9998C10.0758 5.4061 9.59449 4.9248 9.00078 4.9248C8.40707 4.9248 7.92578 5.4061 7.92578 5.9998C7.92578 6.59351 8.40707 7.0748 9.00078 7.0748Z" fill="#222222"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.167 12H10V8.2C10 8.14696 9.97893 8.09609 9.94142 8.05858C9.90391 8.02107 9.85304 8 9.8 8H7.833C7.833 8 7.25 8.016 7.25 8.5C7.25 8.984 7.833 9 7.833 9H8V12H7.833C7.833 12 7.25 12.016 7.25 12.5C7.25 12.984 7.833 13 7.833 13H10.167C10.167 13 10.75 12.984 10.75 12.5C10.75 12.016 10.167 12 10.167 12Z" fill="#222222"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9.00078 1.0498C7.42842 1.0498 5.89137 1.51606 4.584 2.38962C3.27663 3.26318 2.25766 4.5048 1.65594 5.95747C1.05423 7.41014 0.896789 9.00862 1.20354 10.5508C1.51029 12.0929 2.26746 13.5095 3.37929 14.6213C4.49111 15.7331 5.90767 16.4903 7.44982 16.797C8.99197 17.1038 10.5904 16.9464 12.0431 16.3446C13.4958 15.7429 14.7374 14.724 15.611 13.4166C16.4845 12.1092 16.9508 10.5722 16.9508 8.9998C16.9508 6.89133 16.1132 4.86922 14.6223 3.37831C13.1314 1.88739 11.1093 1.0498 9.00078 1.0498ZM9.00078 15.9558C7.62502 15.9558 6.28015 15.5478 5.13624 14.7835C3.99233 14.0192 3.10076 12.9328 2.57428 11.6618C2.0478 10.3907 1.91004 8.99209 2.17844 7.64276C2.44684 6.29342 3.10934 5.05398 4.08215 4.08117C5.05496 3.10836 6.2944 2.44586 7.64374 2.17746C8.99307 1.90906 10.3917 2.04682 11.6627 2.5733C12.9338 3.09978 14.0202 3.99135 14.7845 5.13526C15.5488 6.27917 15.9568 7.62404 15.9568 8.9998C15.9568 10.8447 15.2239 12.6139 13.9194 13.9184C12.6149 15.2229 10.8456 15.9558 9.00078 15.9558Z" fill="#222222"/></g></svg>',
  CLOSE_ICON: '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_15746_2423)"><g clip-path="url(#clip1_15746_2423)"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.2381 15.9994L19.6944 13.5434C19.8586 13.3793 19.9509 13.1566 19.9509 12.9245C19.951 12.6923 19.8588 12.4696 19.6946 12.3054C19.5305 12.1412 19.3078 12.0489 19.0757 12.0488C18.8435 12.0488 18.6208 12.141 18.4566 12.3051L16.0002 14.7615L13.5435 12.3051C13.3793 12.141 13.1566 12.0489 12.9245 12.049C12.6923 12.0491 12.4697 12.1414 12.3057 12.3056C12.1416 12.4698 12.0495 12.6925 12.0496 12.9246C12.0497 13.1568 12.142 13.3794 12.3062 13.5434L14.7622 15.9994L12.3062 18.4555C12.1427 18.6197 12.051 18.8421 12.0512 19.0738C12.0515 19.3055 12.1436 19.5277 12.3074 19.6916C12.4711 19.8556 12.6933 19.9478 12.925 19.9482C13.1567 19.9486 13.3791 19.8571 13.5435 19.6938L16.0002 17.2374L18.4566 19.6938C18.6208 19.8579 18.8435 19.9501 19.0756 19.9501C19.3078 19.95 19.5305 19.8577 19.6946 19.6935C19.8588 19.5293 19.9509 19.3066 19.9509 19.0745C19.9509 18.8423 19.8586 18.6196 19.6944 18.4555L17.2381 15.9994Z" fill="white"/></g></g><defs><clipPath id="clip0_15746_2423"><rect width="8" height="8" fill="white" transform="translate(12 12)"/></clipPath><clipPath id="clip1_15746_2423"><rect width="8" height="8" fill="white" transform="translate(12 12)"/></clipPath></defs></svg>',
  SUBCOPY_CHECK: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10.0176 18.7836C9.41406 18.7836 8.80567 18.7211 8.20117 18.5942C3.47949 17.601 0.44531 12.9525 1.43652 8.23086C1.91699 5.94375 3.25976 3.98086 5.21679 2.70352C7.17382 1.4252 9.51074 0.986721 11.7988 1.46719C12.4951 1.61367 13.1689 1.84219 13.8027 2.14785C14.1758 2.32851 14.332 2.77676 14.1523 3.1498C13.9717 3.52285 13.5254 3.68105 13.1504 3.49941C12.6269 3.24648 12.0684 3.05605 11.4912 2.93593C9.59668 2.53945 7.65918 2.90077 6.03711 3.95937C4.41504 5.01797 3.30273 6.64394 2.90527 8.53945C2.083 12.4516 4.59765 16.3031 8.50976 17.1254C10.4043 17.5248 12.3408 17.1596 13.9629 16.102C15.585 15.0434 16.6973 13.4164 17.0947 11.5209C17.21 10.975 17.2617 10.4164 17.25 9.86172C17.2412 9.44766 17.5703 9.10488 17.9844 9.0961C18.3613 9.05997 18.7412 9.41641 18.75 9.83048C18.7637 10.4994 18.7012 11.1713 18.5635 11.8295C18.083 14.1166 16.7402 16.0805 14.7832 17.3578C13.3428 18.2973 11.6973 18.7836 10.0176 18.7836Z" fill="currentColor"/><path d="M18.4189 3.46937C18.1172 3.18519 17.6416 3.19984 17.3594 3.50355L9.93018 11.4245L7.46094 8.71547C7.18067 8.40785 6.70703 8.38832 6.40137 8.66567C6.09473 8.94497 6.07325 9.41958 6.35157 9.72524L9.36719 13.0338C9.37427 13.0416 9.38428 13.0441 9.39185 13.0514C9.39893 13.0587 9.40162 13.0687 9.40918 13.0758C9.45142 13.1156 9.50244 13.137 9.55078 13.1651C9.58081 13.1826 9.60669 13.2074 9.63867 13.2206C9.72949 13.2579 9.82544 13.2789 9.92187 13.2789C10.0171 13.2789 10.1113 13.2584 10.2012 13.2224C10.2302 13.2108 10.2541 13.1884 10.282 13.1727C10.3313 13.1452 10.3833 13.1234 10.4268 13.0836C10.4351 13.0761 10.438 13.0656 10.4458 13.0578C10.4526 13.0509 10.4619 13.0488 10.4687 13.0416L18.4531 4.52894C18.7363 4.22718 18.7217 3.75257 18.4189 3.46937Z" fill="currentColor"/></svg>',
};

function createSvgElement(iconName) {
  const svgString = ICONS[iconName];
  if (!svgString) {
    window.lana?.log(
      `Error Code: Unknown, Status: 'Unknown', Message: Icon not found: ${iconName}`,
      lanaOptions,
    );
    return null;
  }
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
  return svgDoc.documentElement;
}

const getCTA = (verb) => {
  const verbConfig = LIMITS[verb];
  return window.mph?.[`verb-widget-cta-${verbConfig?.uploadType}`] || window.mph?.['verb-widget-cta'] || '';
};

function isMobileDevice() {
  const ua = navigator.userAgent.toLowerCase();
  return /android|iphone|ipod|blackberry|windows phone/i.test(ua);
}

function isTabletDevice() {
  const ua = navigator.userAgent.toLowerCase();
  const isIPadOS = navigator.userAgent.includes('Mac')
    && 'ontouchend' in document
    && !/iphone|ipod/i.test(ua);
  const isTabletUA = /ipad|android(?!.*mobile)/i.test(ua);
  return isIPadOS || isTabletUA;
}

function getStoreType() {
  const { ua } = window.browser;
  if (/android/i.test(ua)) return 'google';
  if (/iphone|ipod/i.test(ua)) return 'apple';
  if (navigator.userAgent.includes('Mac') && 'ontouchend' in document && !/iphone|ipod/i.test(navigator.userAgent)) {
    return 'apple';
  }
  if (/ipad/i.test(ua)) return 'apple';
  return 'desktop';
}

function getEnv() {
  const { hostname } = window.location;
  if (['localhost', '.hlx.', '.aem.', 'stage.adobe.com'].some((p) => hostname.includes(p))) return 'stage';
  return 'prod';
}

function redDirLink(verb) {
  const hostname = window?.location?.hostname;
  const env = getEnv();
  const verbSlug = verb.split('-').join('');
  return hostname !== 'www.adobe.com'
    ? `https://www.adobe.com/go/acrobat-${verbSlug}-${env}`
    : `https://www.adobe.com/go/acrobat-${verbSlug}`;
}

function redDir(verb) {
  window.location.href = redDirLink(verb);
}

function getSplunkEndpoint() {
  return (getEnv() === 'prod') ? 'https://unity.adobe.io/api/v1/log' : 'https://unity-stage.adobe.io/api/v1/log';
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, expires) {
  document.cookie = `${name}=${value};domain=.adobe.com;path=/;expires=${expires}`;
}

function uploadedTime() {
  const uploadingUTS = parseInt(getCookie('UTS_Uploading'), 10);
  const uploadedUTS = parseInt(getCookie('UTS_Uploaded'), 10);
  if (Number.isNaN(uploadingUTS) || Number.isNaN(uploadedUTS)) return 'N/A';
  return ((uploadedUTS - uploadingUTS) / 1000).toFixed(1);
}

function incrementVerbKey(verbKey) {
  let count = parseInt(localStorage.getItem(verbKey), 10) || 0;
  count += 1;
  localStorage.setItem(verbKey, count);
  return count;
}

function getVerbKey(verbKey) {
  const count = parseInt(localStorage.getItem(verbKey), 10) || 0;
  const trialMapping = {
    0: '1st',
    1: '2nd',
  };
  return trialMapping[count] || '2+';
}

const setUser = () => {
  localStorage.setItem('unity.user', 'true');
};

const redirectReady = new CustomEvent('DCUnity:RedirectReady');

let exitFlag = true;
let tabClosureSent = false;
let isUploading = false;

function prefetchTarget() {
  const iframe = document.createElement('iframe');
  iframe.src = window.prefetchTargetUrl;
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
}

function prefetchNextPage(url) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.crossOrigin = 'anonymous';
  link.as = 'document';
  document.head.appendChild(link);
}

function initiatePrefetch(url) {
  if (!window.prefetchTargetUrl) {
    prefetchNextPage(url);
    window.prefetchTargetUrl = url;
  }
}

function handleExit(event, verb, userObj, unloadFlag, workflowStep) {
  if (exitFlag || tabClosureSent || (isUploading && workflowStep === 'preuploading')) { return; }
  tabClosureSent = true;
  const uploadingStartTime = parseInt(getCookie('UTS_Uploading'), 10);
  const tabClosureTime = Date.now();
  const duration = uploadingStartTime ? ((tabClosureTime - uploadingStartTime) / 1000).toFixed(1) : 'N/A';
  window.analytics.verbAnalytics('job:browser-tab-closure', verb, userObj, unloadFlag);
  window.analytics.sendAnalyticsToSplunk('job:browser-tab-closure', verb, { ...userObj, workflowStep, uploadTime: duration }, getSplunkEndpoint(), true);
  if (!isUploading) return;
  event.preventDefault();
  event.returnValue = true;
}

window.analytics = window.analytics || {
  verbAnalytics: () => {},
  reviewAnalytics: () => {},
  sendAnalyticsToSplunk: () => {},
};

async function loadAnalyticsAfterLCP(analyticsData) {
  const { verb, userAttempts } = analyticsData;
  try {
    const analyticsModule = await import('../../scripts/alloy/verb-widget.js');
    const { default: verbAnalytics, reviewAnalytics, sendAnalyticsToSplunk } = analyticsModule;
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
  return window.analytics;
}

window.addEventListener('analyticsLoad', async ({ detail }) => {
  /* eslint-disable-next-line compat/compat -- Opera Mini not a target */
  const delay = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
  const {
    verbAnalytics: stubVerb,
    reviewAnalytics: stubReview,
    sendAnalyticsToSplunk: stubSend,
  } = window.analytics;
  if (window.PerformanceObserver) {
    await Promise.race([
      new Promise((res) => {
        try {
          const obs = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) res();
          });
          obs.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (error) {
          res();
        }
      }),
      delay(3000),
    ]);
  } else {
    await delay(3000);
  }
  await loadAnalyticsAfterLCP(detail);
  const {
    verbAnalytics,
    reviewAnalytics,
    sendAnalyticsToSplunk,
  } = window.analytics;
  if (
    verbAnalytics === stubVerb
    || reviewAnalytics === stubReview
    || sendAnalyticsToSplunk === stubSend
  ) {
    window.lana?.log(
      'Analytics failed to initialize correctly: some methods remain no-ops on verb-marquee block',
      lanaOptions,
    );
  }
});

function decorateImage(media) {
  media.classList.add('image');
  const imageLink = media.querySelector('a');
  const picture = media.querySelector('picture');
  if (imageLink && picture && !imageLink.parentElement.classList.contains('modal-img-link')) {
    imageLink.textContent = '';
    imageLink.append(picture);
  }
}

function processMedia(mediaDiv) {
  if (!mediaDiv) return null;
  mediaDiv.classList.add('asset');
  const hasVideo = mediaDiv.querySelector('video, a[href*=".mp4"], a[href*=".webm"], a[href*=".ogg"]');
  if (!hasVideo) {
    decorateImage(mediaDiv);
  }
  return mediaDiv;
}

export default async function init(element) {
  ({ createTag, getConfig, loadStyle } = (await import(`${miloLibs}/utils/utils.js`)));
  ({ decorateBlockBg } = (await import(`${miloLibs}/utils/decorate.js`)));

  element.classList.add('con-block');
  if (isOldBrowser()) {
    window.location.href = EOLBrowserPage;
    return;
  }
  window.mph = window.mph || {};
  await loadPlaceholders(['verb-marquee', 'verb-widget']);
  const rawVerb = element.classList[1];
  const VERB = rawVerb === 'ai-summary-generator' ? 'summarize-pdf' : rawVerb;
  const limits = LIMITS[VERB];
  const isMobile = isMobileDevice();
  const isTablet = isTabletDevice();
  const mobileOrTabletTouch = isMobile || isTablet;

  function getPricingLink() {
    const { locale } = getConfig();
    const ENV = getAppEnv();
    const links = {
      dev: `https://www.stage.adobe.com${locale.prefix}/acrobat/pricing/pricing.html`,
      stage: `https://www.stage.adobe.com${locale.prefix}/acrobat/pricing/pricing.html`,
      prod: `https://www.adobe.com${locale.prefix}/acrobat/pricing/pricing.html`,
    };
    return links[ENV] || links.prod;
  }

  let useFileUpload = true;
  if (mobileOrTabletTouch) {
    if (limits?.level === 0) useFileUpload = false;
    else if (limits?.mobileApp) useFileUpload = false;
  }

  // Initialize analytics - track attempts for analytics data (no UI changes based on attempts)
  const userAttempts = getVerbKey(`${VERB}_attempts`);
  let noOfFiles = null;

  function mergeData(eventData = {}) {
    return { ...eventData, noOfFiles };
  }
  function getLocale() {
    const currLocale = getConfig().locale?.prefix.replace('/', '');
    return currLocale || 'en-us';
  }
  function runWhenDocumentIsReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }
  const initializePingService = async () => {
    try {
      const { PingService, USER_TYPE } = await import('../../scripts/ping.js');
      const isSignedIn = window.adobeIMS?.isSignedInUser() || false;
      const userType = isSignedIn ? USER_TYPE.SIGNEDIN : USER_TYPE.ANON;
      const userId = isSignedIn ? ((await window.adobeIMS?.getProfile())?.userId || '') : '';
      const pingService = new PingService({
        locale: getLocale(),
        config: {
          serverEnv: getEnv(),
          appName: 'adobe_com',
          appVersion: '1.0',
          appReferrer: '',
        },
        userId,
        isSignedIn,
        userType,
        subscriptionType: 'unspecified',
      });
      const pingConfig = {
        appPath: 'unity-dc-frictionless',
        schema: {},
      };
      await pingService.sendPingEvent(pingConfig);
    } catch (error) {
      window.lana?.log(
        `Error Code: Unknown, Status: 'Unknown', Message: Failed to send ping: ${error.message}`,
        lanaOptions,
      );
    }
  };
  runWhenDocumentIsReady(() => {
    initializePingService();
    window.dispatchEvent(new CustomEvent('analyticsLoad', { detail: { verb: VERB, userAttempts } }));
  });
  const children = element.querySelectorAll(':scope > div');
  const foreground = children[children.length - 1];
  foreground.classList.add('foreground', 'container');
  if (children.length > 1 && children[0].textContent !== '') {
    children[0].classList.add('background');
    decorateBlockBg(element, children[0], { useHandleFocalpoint: true });
  }
  const headline = foreground.querySelector('h1, h2, h3, h4, h5, h6');
  const heading = headline?.textContent?.trim() || '';
  const text = headline?.closest('div');
  if (text) {
    text.classList.add('text');
  }
  const media = foreground.querySelector(':scope > div:not([class])');
  if (media) {
    processMedia(media);
  }
  const container = createTag('div', { class: 'verb-marquee-container' });
  const row = createTag('div', { class: 'verb-marquee-row' });
  const leftCol = createTag('div', { class: 'verb-marquee-col verb-marquee-col-left' });
  const rightCol = createTag('div', { class: 'verb-marquee-col verb-marquee-col-right' });
  const header = createTag('div', { class: 'verb-marquee-header' });
  const iconWrapper = createTag('div', { class: 'acrobat-icon' });
  const widgetIconSvg = createSvgElement('WIDGET_ICON');
  if (widgetIconSvg) {
    widgetIconSvg.classList.add('icon-acrobat');
    widgetIconSvg.setAttribute('aria-hidden', 'true');
    iconWrapper.appendChild(widgetIconSvg);
  }
  const title = createTag('div', { class: 'verb-marquee-title' });
  const adobeText = createTag('span', {}, 'Adobe');
  const studySpaceText = createTag('span', {}, ' Acrobat');
  title.append(adobeText, studySpaceText);
  header.append(iconWrapper, title);
  const headingEl = createTag('h1', { class: 'verb-marquee-heading' }, heading);
  const isMobileOrTabletViewport = window.innerWidth < 1200;
  const copy1Text = isMobileOrTabletViewport
    ? (window.mph?.[`verb-marquee-${VERB}-mobile-copy`] || window.mph?.[`verb-marquee-${VERB}-copy`] || '')
    : (window.mph?.[`verb-marquee-${VERB}-copy`] || '');
  const copy2Text = isMobileOrTabletViewport
    ? (window.mph?.[`verb-marquee-${VERB}-mobile-sub-copy`]
      || window.mph?.[`verb-marquee-${VERB}-sub-copy`] || '')
    : (window.mph?.[`verb-marquee-${VERB}-sub-copy`] || '');
  const includeCopy2 = !!copy2Text;
  const copy1 = createTag('p', { class: 'verb-marquee-copy' }, copy1Text);
  let copy2 = null;
  if (includeCopy2) {
    copy2 = createTag('p', { class: 'verb-marquee-copy-sub' });
    const subcopyIcon = createSvgElement('SUBCOPY_CHECK');
    if (subcopyIcon) {
      subcopyIcon.classList.add('verb-marquee-copy-sub-icon');
      subcopyIcon.setAttribute('aria-hidden', 'true');
      copy2.appendChild(subcopyIcon);
    }
    copy2.appendChild(createTag('span', { class: 'verb-marquee-copy-sub-label' }, copy2Text));
  }
  const dropzone = createTag('div', {
    class: 'verb-marquee-dropzone',
    id: 'drop-zone',
  });
  const ctaButtonLabel = getCTA(VERB);
  const ctaButton = createTag('button', {
    class: 'verb-marquee-cta',
    type: 'button',
    ...(ctaButtonLabel && { 'aria-label': ctaButtonLabel }),
  });
  const uploadIconSvg = createSvgElement('UPLOAD_ICON');
  if (uploadIconSvg) {
    uploadIconSvg.classList.add('upload-icon');
    uploadIconSvg.setAttribute('aria-hidden', 'true');
    ctaButton.appendChild(uploadIconSvg);
  }
  const ctaLabel = createTag('span', { class: 'verb-marquee-cta-label' }, ctaButtonLabel);
  ctaButton.appendChild(ctaLabel);
  const dragText = createTag('p', { class: 'verb-marquee-drag' }, window.mph?.[`verb-widget-${VERB}-dragndrop-text`] || '');
  const fileLimitText = createTag('p', {
    class: 'verb-marquee-file-limit',
    id: 'file-upload-description',
  }, window.mph?.[`verb-widget-${VERB}-file-limit`] || '');

  if (useFileUpload) {
    dropzone.append(ctaButton, dragText, fileLimitText);
  } else if (mobileOrTabletTouch) {
    if (limits?.level === 0) {
      element.classList.add('verb-marquee-trial');
      const trialCta = createTag(
        'a',
        { class: 'verb-marquee-mobile-cta', href: getPricingLink() },
        window.mph?.['verb-widget-cta-mobile-start-trial'] || '',
      );
      dropzone.append(trialCta);
    } else if (limits?.mobileApp) {
      element.classList.add('verb-marquee-mobile-app');
      const storeType = getStoreType();
      const mobileLink = window.mph?.[`verb-widget-${VERB}-${storeType}`]
        || window.mph?.[`verb-widget-${VERB}-apple`];
      const storeCta = createTag(
        'a',
        { class: 'verb-marquee-mobile-cta', href: mobileLink || '#' },
        window.mph?.['verb-widget-cta-mobile'] || '',
      );
      storeCta.addEventListener('click', () => {
        window.analytics.verbAnalytics('goto-app:clicked', VERB, { userAttempts });
      });
      dropzone.append(storeCta);
    }
  }

  let soloClicked = false;
  let fileInput = null;
  if (useFileUpload) {
    fileInput = createTag('input', {
      type: 'file',
      accept: limits?.acceptedFiles,
      id: 'file-upload',
      class: 'hide',
      'aria-hidden': 'true',
      'aria-describedby': 'file-upload-description',
      ...(limits?.multipleFiles && { multiple: '' }),
    });
  }
  const errorState = createTag('div', {
    class: 'error hide',
    role: 'alert',
    'aria-live': 'assertive',
    'aria-atomic': 'true',
  });
  const errorStateText = createTag('p', {
    class: 'verb-marquee-error-text',
    id: 'error-message',
  });
  const errorIcon = createTag('div', {
    class: 'verb-marquee-errorIcon',
    'aria-hidden': 'true',
  });
  const errorCloseBtn = createTag('div', { class: 'verb-marquee-errorBtn', role: 'button', tabindex: '0', 'aria-label': 'Close error' });
  const srAlert = { announceTimer: null, cleanupTimer: null };
  const clearSrAlert = () => {
    clearTimeout(srAlert.announceTimer);
    clearTimeout(srAlert.cleanupTimer);
    document.querySelector('.verb-marquee-sr-alert')?.remove();
  };
  const announceToScreenReader = (msg) => {
    clearSrAlert();
    srAlert.announceTimer = setTimeout(() => {
      const alertEl = createTag('div', {
        class: 'verb-marquee-sr-alert',
        role: 'alert',
        style: 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0',
      });
      alertEl.textContent = msg;
      document.body.appendChild(alertEl);
      srAlert.cleanupTimer = setTimeout(() => alertEl.remove(), 10000);
    }, 5000);
  };
  const closeIconSvg = createSvgElement('CLOSE_ICON');
  if (closeIconSvg) {
    closeIconSvg.classList.add('close-icon', 'error');
    closeIconSvg.setAttribute('aria-hidden', 'true');
    errorCloseBtn.prepend(closeIconSvg);
  }
  errorState.append(errorIcon, errorStateText, errorCloseBtn);
  const footer = createTag('div', { class: 'verb-marquee-footer' });
  const { locale } = getConfig();
  const ppURL = window.mph?.['verb-widget-privacy-policy-url'] || `https://www.adobe.com${locale.prefix}/privacy/policy.html`;
  const touURL = window.mph?.['verb-widget-terms-of-use-url'] || `https://www.adobe.com${locale.prefix}/legal/terms.html`;
  const genAIurl = window.mph?.['verb-widget-genai-terms-url'] || `https://www.adobe.com${locale.prefix}/legal/licenses-terms/adobe-gen-ai-user-guidelines.html`;
  const mph = window.mph || {};
  const legalPart1 = mph['verb-marquee-legal'] || mph['verb-widget-legal'] || '';
  const legalPart2 = limits?.genAI
    ? (mph['verb-marquee-legal-2-ai'] || mph['verb-widget-legal-2-ai'] || '')
    : (mph['verb-marquee-legal-2'] || mph['verb-widget-legal-2'] || '');
  const legalCombined = [legalPart1, legalPart2].filter(Boolean).join(' ').trim();
  const legalInitial = legalCombined || (mph['verb-marquee-legal-text'] || '');
  const legalText = createTag('p', { class: 'verb-marquee-legal' }, legalInitial);
  const omitFooterForMobileStore = limits?.mobileApp && mobileOrTabletTouch;
  if (!omitFooterForMobileStore && !(limits?.mobileApp && isMobile)) {
    if (legalText.textContent) {
      const createLegalLink = (label, url) => `<a class="verb-marquee-legal-url" target="_blank" href="${url}">${label}</a>`;
      const legalLinks = [
        ['verb-widget-terms-of-use', touURL],
        ['verb-widget-privacy-policy', ppURL],
        ...(limits?.genAI ? [['verb-widget-genai-guidelines', genAIurl]] : []),
      ];
      legalText.innerHTML = legalLinks.reduce(
        (html, [key, url]) => {
          const linkText = window.mph?.[key];
          return linkText ? html.replace(linkText, createLegalLink(linkText, url)) : html;
        },
        legalText.textContent,
      );
    }
  }
  const tooltipContent = window.mph?.['verb-widget-tool-tip'] || '';
  const infoIcon = createTag('button', {
    class: 'info-icon milo-tooltip top',
    type: 'button',
    ...(tooltipContent && { 'aria-label': tooltipContent }),
    'aria-describedby': 'info-tooltip-text',
    ...(tooltipContent && { 'data-tooltip': tooltipContent }),
  });
  const infoIconSvg = createSvgElement('INFO_ICON');
  if (infoIconSvg) {
    infoIconSvg.setAttribute('aria-hidden', 'true');
    infoIcon.appendChild(infoIconSvg);
  }
  const tooltipText = createTag('span', {
    id: 'info-tooltip-text',
    class: 'hide',
  }, tooltipContent);
  infoIcon.appendChild(tooltipText);
  if (!omitFooterForMobileStore) {
    footer.append(legalText, infoIcon);
  }
  const leftColChildren = [
    header,
    headingEl,
    copy1,
    ...(copy2 ? [copy2] : []),
    dropzone,
    ...(fileInput ? [fileInput] : []),
    ...(omitFooterForMobileStore ? [] : [footer]),
  ];
  leftCol.append(...leftColChildren);
  if (media) {
    const mediaWrapper = createTag('div', { class: 'verb-marquee-media' });
    while (media.firstChild) {
      mediaWrapper.appendChild(media.firstChild);
    }
    rightCol.appendChild(mediaWrapper);
  }
  row.append(leftCol, rightCol);
  container.appendChild(row);
  foreground.innerHTML = '';
  foreground.append(container);
  element.append(errorState);

  function handleAnalyticsEvent(
    eventName,
    metadata = {},
    documentUnloading = true,
    canSendDataToSplunk = true,
  ) {
    window.analytics.verbAnalytics(eventName, VERB, metadata, documentUnloading);
    if (!canSendDataToSplunk) return;
    window.analytics.sendAnalyticsToSplunk(eventName, VERB, metadata, getSplunkEndpoint());
  }

  function registerTabCloseEvent(eventData, workflowStep) {
    window.addEventListener('beforeunload', (windowEvent) => {
      handleExit(windowEvent, VERB, eventData, false, workflowStep);
    });
  }

  function handleUploadingEvent(data, attempts, cookieExp, canSendDataToSplunk) {
    isUploading = true;
    exitFlag = false;
    prefetchTarget();
    const metadata = mergeData({ ...data, userAttempts: attempts });
    handleAnalyticsEvent('job:uploading', metadata, false, canSendDataToSplunk);
    if (LIMITS[VERB]?.multipleFiles) {
      handleAnalyticsEvent('job:multi-file-uploading', metadata, false, canSendDataToSplunk);
    }
    setCookie('UTS_Uploading', Date.now(), cookieExp);
    registerTabCloseEvent(metadata, 'uploading');
  }

  function handleUploadedEvent(data, attempts, cookieExp, canSendDataToSplunk) {
    exitFlag = true;
    setTimeout(() => {
      window.dispatchEvent(redirectReady);
      window.lana?.log(
        'Adobe Analytics done callback failed to trigger, 3 second timeout dispatched event.',
        { sampleRate: 5, tags: 'DC_Milo,Project Unity (DC)', severity: 'warning' },
      );
    }, 3000);
    setCookie('UTS_Uploaded', Date.now(), cookieExp);
    const calcUploadedTime = uploadedTime();
    const metadata = { ...data, uploadTime: calcUploadedTime, userAttempts: attempts };
    handleAnalyticsEvent('job:uploaded', metadata, false, canSendDataToSplunk);
    if (LIMITS[VERB]?.multipleFiles) {
      handleAnalyticsEvent('job:multi-file-uploaded', metadata, false, canSendDataToSplunk);
    }
    setUser();
    incrementVerbKey(`${VERB}_attempts`);
  }

  const setDraggingClass = (shouldToggle) => {
    dropzone.classList.toggle('dragging', !!shouldToggle);
  };
  const handleError = (detail, logToLana = false, logOptions = {}) => {
    const { code, message, status, info = 'No additional info provided', accountType = 'Unknown account type' } = detail;
    if (message) {
      setDraggingClass(false);
      errorState.classList.add('verb-marquee-error');
      errorState.classList.remove('hide');
      errorStateText.textContent = message;
      announceToScreenReader(message);
    }
    if (logToLana) {
      window.lana?.log(
        `Error Code: ${code}, Status: ${status}, Message: ${message}, Info: ${info}, Account Type: ${accountType}`,
        logOptions,
      );
    }
    setTimeout(() => {
      errorState.classList.remove('verb-marquee-error');
      errorState.classList.add('hide');
      errorStateText.textContent = '';
    }, 5000);
  };
  if (useFileUpload && fileInput) {
    ctaButton.addEventListener('click', () => {
      fileInput.click();
    });
    dropzone.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) { return; }
      if (e.target.classList.value.includes('error') || e.target.closest('.error')) { return; }
      fileInput.click();
    });
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggingClass(true);
      element.classList.add('dragging-block');
    });
    element.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!element.contains(e.relatedTarget)) {
        setDraggingClass(false);
        element.classList.remove('dragging-block');
      }
    });
    element.addEventListener('drop', (e) => {
      e.preventDefault();
      setDraggingClass(false);
      element.classList.remove('dragging-block');
      const { dataTransfer: { files } } = e;
      if (files.length > 0) {
        noOfFiles = files.length;
      }
    });
    fileInput.addEventListener('click', () => {
      if (soloClicked) {
        soloClicked = false;
        return;
      }
      [
        'filepicker:shown',
        'dropzone:choose-file-clicked',
        'files-selected',
        'entry:clicked',
        'discover:clicked',
      ].forEach((analyticsEvent) => {
        window.analytics.verbAnalytics(analyticsEvent, VERB, { userAttempts });
      });
    });
    fileInput.addEventListener('change', (data) => {
      const { target: { files } } = data;
      if (files.length > 0) {
        noOfFiles = files.length;
      }
    });
    fileInput.addEventListener('cancel', () => {
      window.analytics.verbAnalytics('choose-file:close', VERB, { userAttempts });
    });
  }
  errorCloseBtn.addEventListener('click', () => {
    errorState.classList.remove('verb-marquee-error');
    errorState.classList.add('hide');
    errorStateText.textContent = '';
    clearSrAlert();
  });
  function soloUpload() {
    if (!useFileUpload || !fileInput || !ctaButton) return;
    const uploadLinks = document.querySelectorAll('a[href*="#upload"]');
    uploadLinks.forEach((link) => {
      const labelElement = createTag('label', {
        for: 'file-upload',
        class: 'verb-marquee-cta verb-marquee-cta-solo',
        tabindex: 0,
        'daa-ll': ctaButton.textContent,
        'aria-label': ctaButton.textContent,
      });
      labelElement.innerHTML = ctaButton.innerHTML;
      const wrapper = link.closest('div');
      if (!wrapper) return;
      wrapper.append(labelElement);
      link.remove();
      labelElement.addEventListener('click', (data) => {
        soloClicked = true;
        [
          'filepicker:shown',
          'cta:choose-file-clicked',
          'files-selected',
          'entry:clicked',
          'discover:clicked',
        ].forEach((analyticsEvent) => {
          window.analytics.verbAnalytics(analyticsEvent, VERB, { ...data, userAttempts });
        });
      });
    });
  }
  runWhenDocumentIsReady(soloUpload);
  element.addEventListener('unity:track-analytics', (e) => {
    const cookieExp = new Date(Date.now() + 30 * 60 * 1000).toUTCString();
    const { event, data } = e.detail || {};
    const canSendDataToSplunk = e.detail?.sendToSplunk ?? true;
    if (!event) return;
    const metadata = mergeData({ ...data, userAttempts });
    const analyticsMap = {
      change: () => {
        exitFlag = false;
        handleAnalyticsEvent('choose-file:open', metadata, true, canSendDataToSplunk);
        registerTabCloseEvent(metadata, 'preuploading');
      },
      drop: () => {
        exitFlag = false;
        ['files-dropped', 'entry:clicked', 'discover:clicked'].forEach((analyticsEvent) => {
          handleAnalyticsEvent(analyticsEvent, metadata, true, canSendDataToSplunk);
        });
        setDraggingClass(false);
        registerTabCloseEvent(metadata, 'preuploading');
      },
      cancel: () => {
        if (exitFlag) return;
        handleAnalyticsEvent('job:cancel', metadata, true, canSendDataToSplunk);
        exitFlag = true;
      },
      uploading: () => handleUploadingEvent(data, userAttempts, cookieExp, canSendDataToSplunk),
      uploaded: () => handleUploadedEvent(data, userAttempts, cookieExp, canSendDataToSplunk),
      chunk_uploaded: () => {
        if (canSendDataToSplunk) window.analytics.sendAnalyticsToSplunk('job:chunk-uploaded', VERB, metadata, getSplunkEndpoint());
      },
      redirectUrl: () => {
        if (data) initiatePrefetch(data.redirectUrl);
        handleAnalyticsEvent('job:redirect-success', metadata, false, canSendDataToSplunk);
      },
    };
    if (analyticsMap[event]) {
      analyticsMap[event]();
    }
  });
  element.addEventListener('unity:show-error-toast', (e) => {
    const {
      code: errorCode,
      info: errorInfo,
      metaData: metadata,
      errorData,
      sendToSplunk: canSendDataToSplunk = true,
    } = e.detail || {};
    if (!errorCode) return;
    handleError(e.detail, true, lanaOptions);
    if (errorCode.includes('cookie_not_set')) return;
    const errorAnalyticsMap = {
      error_only_accept_one_file: 'error_only_accept_one_file',
      error_unsupported_type: 'error:UnsupportedFile',
      error_empty_file: 'error:EmptyFile',
      error_file_too_large: 'error:TooLargeFile',
      error_max_page_count: 'error:max_page_count',
      error_min_page_count: 'error:min_page_count',
      error_max_num_files: 'error:max_num_files',
      error_generic: 'error',
      error_max_quota_exceeded: 'error:max_quota_exceeded',
      error_no_storage_provision: 'error:no_storage_provision',
      error_duplicate_asset: 'error:duplicate_asset',
      warn_chunk_upload: 'warn:verb_upload_warn_chunk_upload',
      error_file_same_type: 'error:file_same_type',
      error_fetch_redirect_url: 'error:fetch_redirect_url',
      error_finalize_asset: 'error:finalize_asset',
      error_verify_page_count: 'error:verify_page_count',
      error_chunk_upload: 'error:chunk_upload',
      error_create_asset: 'error:create_asset',
      error_fetching_access_token: 'error:fetching_access_token',
    };
    const key = Object.keys(errorAnalyticsMap).find((k) => errorCode?.includes(k));
    if (key) {
      const event = errorAnalyticsMap[key];
      window.analytics.verbAnalytics(event, VERB, event === 'error' ? { errorInfo } : {});
    }
    if (canSendDataToSplunk) {
      window.analytics.sendAnalyticsToSplunk(
        key,
        VERB,
        { ...metadata, errorData },
        getSplunkEndpoint(),
      );
    }
    exitFlag = true;
  });
  window.addEventListener('beforeunload', (event) => {
    if (exitFlag || tabClosureSent || !isUploading) return;
    tabClosureSent = true;
    const uploadingUTS = parseInt(getCookie('UTS_Uploading'), 10);
    const tabClosureTime = Date.now();
    const duration = uploadingUTS ? ((tabClosureTime - uploadingUTS) / 1000).toFixed(1) : 'N/A';
    window.analytics.verbAnalytics('job:browser-tab-closure', VERB, { userAttempts }, exitFlag);
    window.analytics.sendAnalyticsToSplunk('job:browser-tab-closure', VERB, { userAttempts, uploadTime: duration }, getSplunkEndpoint(), true);
    if (!isUploading) return;
    event.preventDefault();
    event.returnValue = true;
  });
  window.addEventListener('beforeunload', () => {
    const cookieExp = new Date(Date.now() + 90 * 1000).toUTCString();
    if (exitFlag) {
      document.cookie = `UTS_Redirect=${Date.now()};domain=.adobe.com;path=/;expires=${cookieExp}`;
    }
  });

  const { cookie } = document;
  const limitCookie = exhLimitCookieMap[VERB] || exhLimitCookieMap[VERB.match(/^pdf-to|to-pdf$/)?.[0]];
  const cookiePrefix = appEnvCookieMap[DC_ENV] || '';
  const isLimitExhausted = limitCookie && cookie.includes(`${cookiePrefix}${limitCookie}`);

  if (!window.adobeIMS?.isSignedInUser?.() && isLimitExhausted) {
    if (useFileUpload && fileInput?.isConnected) {
      fileInput.remove();
    }
    const { codeRoot = '/acrobat' } = getConfig() || {};
    loadStyle(`${codeRoot}/blocks/verb-widget/verb-widget.css`);
    const headingForWidget = heading || window.mph?.[`verb-widget-${VERB}-title`] || '\u00a0';
    const widgetRoot = createTag('div', { class: `verb-widget ${VERB}` });
    widgetRoot.dataset.dcInjectedFromMarquee = 'true';
    widgetRoot.append(createTag('div', {}, headingForWidget));
    element.append(widgetRoot);
    try {
      const { default: initVerbWidget } = await import('../verb-widget/verb-widget.js');
      await initVerbWidget(widgetRoot);
    } catch (error) {
      window.lana?.log(
        `Error Code: Unknown, Status: 'Unknown', Message: verb-widget init from verb-marquee failed: ${error.message}`,
        lanaOptions,
      );
      widgetRoot.remove();
    }
  }

  async function checkSignedInUser() {
    if (!window.adobeIMS?.isSignedInUser?.()) return;
    let accountType;
    try {
      accountType = window.adobeIMS.getAccountType();
    } catch {
      accountType = (await window.adobeIMS.getProfile()).account_type;
    }
    if (accountType) redDir(VERB);
  }
  await checkSignedInUser();
  window.addEventListener('IMS:Ready', checkSignedInUser);
  window.prefetchTargetUrl = null;
  element.parentNode.style.display = 'block';
  window.addEventListener('pageshow', (event) => {
    const historyTraversal = event.persisted
      || (typeof window.performance !== 'undefined'
        && window.performance.getEntriesByType('navigation')[0].type === 'back_forward');
    if (historyTraversal) {
      window.location.reload();
    }
  });
}
