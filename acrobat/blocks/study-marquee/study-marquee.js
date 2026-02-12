import { setLibs, isOldBrowser, loadPlaceholders } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');
let createTag;
let getConfig;
let decorateBlockBg;

const EOLBrowserPage = 'https://acrobat.adobe.com/home/index-browser-eol.html';

const lanaOptions = {
  sampleRate: 100,
  tags: 'DC_Milo,Project Unity (DC)',
};

const ICONS = {
  WIDGET_ICON: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="31" viewBox="0 0 32 31" fill="none"><path d="M25.8211 0H5.67886C2.54251 0 0 2.45484 0 5.48304V24.9308C0 27.959 2.54251 30.4138 5.67886 30.4138H25.8211C28.9575 30.4138 31.5 27.959 31.5 24.9308V5.48304C31.5 2.45484 28.9575 0 25.8211 0Z" fill="#B30B00"/><path d="M25.7023 17.5726C24.1856 16.0519 20.044 16.6714 19.0523 16.784C17.594 15.4323 16.6023 13.799 16.2523 13.2358C16.7773 11.7151 17.1273 10.1944 17.1856 8.56106C17.1856 7.15301 16.6023 5.63232 14.969 5.63232C14.3856 5.63232 13.8606 5.97026 13.569 6.42083C12.869 7.60359 13.1606 9.96911 14.269 12.3909C13.6273 14.1369 13.044 15.8266 11.4106 18.8116C9.71898 19.4875 6.16064 21.0645 5.86898 22.7542C5.75231 23.2611 5.92731 23.768 6.33564 24.1622C6.74398 24.5001 7.26898 24.6691 7.79398 24.6691C9.95231 24.6691 12.0523 21.7967 13.5106 19.3749C14.7356 18.9806 16.6606 18.4174 18.5856 18.0795C20.8606 19.9944 22.844 20.276 23.894 20.276C25.294 20.276 25.819 19.7128 25.994 19.2059C26.2856 18.6427 26.1106 18.0231 25.7023 17.5726ZM24.244 18.53C24.1856 18.9243 23.6606 19.3185 22.7273 19.0932C21.619 18.8116 20.6273 18.3047 19.7523 17.6289C20.5106 17.5162 22.2023 17.3473 23.4273 17.5726C23.894 17.6852 24.3606 17.9668 24.244 18.53ZM14.5023 6.92773C14.619 6.75876 14.794 6.64612 14.969 6.64612C15.494 6.64612 15.6106 7.26566 15.6106 7.77255C15.5523 8.95531 15.319 10.1381 14.9106 11.2645C14.0356 9.01164 14.2106 7.43462 14.5023 6.92773ZM14.3856 17.8542C14.8523 16.953 15.494 15.376 15.7273 14.7001C16.2523 15.545 17.1273 16.5588 17.594 17.0093C17.594 17.0657 15.7856 17.4036 14.3856 17.8542ZM10.944 20.107C9.60231 22.2473 8.20231 23.599 7.44398 23.599C7.32731 23.599 7.21064 23.5427 7.09398 23.4864C6.91898 23.3737 6.86064 23.2047 6.91898 22.9795C7.09398 22.1909 8.61064 21.1208 10.944 20.107Z" fill="white"/></svg>',
  UPLOAD_ICON: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M22.0007 6.66675H18.0007C17.8238 6.66675 17.6543 6.73699 17.5292 6.86201C17.4042 6.98703 17.334 7.1566 17.334 7.33341V8.66675C17.334 8.84356 17.4042 9.01313 17.5292 9.13815C17.6543 9.26318 17.8238 9.33341 18.0007 9.33341H20.0007V20.0001H4.00065V9.33341H6.00065C6.17746 9.33341 6.34703 9.26318 6.47206 9.13815C6.59708 9.01313 6.66732 8.84356 6.66732 8.66675V7.33341C6.66732 7.1566 6.59708 6.98703 6.47206 6.86201C6.34703 6.73699 6.17746 6.66675 6.00065 6.66675H2.00065C1.82384 6.66675 1.65427 6.73699 1.52925 6.86201C1.40422 6.98703 1.33398 7.1566 1.33398 7.33341V22.0001C1.33398 22.1769 1.40422 22.3465 1.52925 22.4715C1.65427 22.5965 1.82384 22.6667 2.00065 22.6667H22.0007C22.1775 22.6667 22.347 22.5965 22.4721 22.4715C22.5971 22.3465 22.6673 22.1769 22.6673 22.0001V7.33341C22.6673 7.1566 22.5971 6.98703 22.4721 6.86201C22.347 6.73699 22.1775 6.66675 22.0007 6.66675Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.1994 5.3334H10.6661V12.6667C10.6661 12.8435 10.7363 13.0131 10.8613 13.1381C10.9864 13.2632 11.1559 13.3334 11.3327 13.3334H12.6661C12.8429 13.3334 13.0124 13.2632 13.1375 13.1381C13.2625 13.0131 13.3327 12.8435 13.3327 12.6667V5.3334H16.7994C16.9409 5.3334 17.0765 5.27721 17.1765 5.17719C17.2765 5.07717 17.3327 4.94152 17.3327 4.80007C17.3339 4.67018 17.2864 4.54456 17.1994 4.44807L12.2327 0.0960672C12.1706 0.0346729 12.0868 0.000244141 11.9994 0.000244141C11.912 0.000244141 11.8282 0.0346729 11.7661 0.0960672L6.7994 4.4454C6.71182 4.54258 6.6642 4.66926 6.66607 4.80007C6.66607 4.94152 6.72226 5.07717 6.82228 5.17719C6.9223 5.27721 7.05795 5.3334 7.1994 5.3334Z" fill="white"/></svg>',
  INFO_ICON: '<svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.8"><path d="M9.00078 7.0748C9.59449 7.0748 10.0758 6.59351 10.0758 5.9998C10.0758 5.4061 9.59449 4.9248 9.00078 4.9248C8.40707 4.9248 7.92578 5.4061 7.92578 5.9998C7.92578 6.59351 8.40707 7.0748 9.00078 7.0748Z" fill="#222222"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.167 12H10V8.2C10 8.14696 9.97893 8.09609 9.94142 8.05858C9.90391 8.02107 9.85304 8 9.8 8H7.833C7.833 8 7.25 8.016 7.25 8.5C7.25 8.984 7.833 9 7.833 9H8V12H7.833C7.833 12 7.25 12.016 7.25 12.5C7.25 12.984 7.833 13 7.833 13H10.167C10.167 13 10.75 12.984 10.75 12.5C10.75 12.016 10.167 12 10.167 12Z" fill="#222222"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9.00078 1.0498C7.42842 1.0498 5.89137 1.51606 4.584 2.38962C3.27663 3.26318 2.25766 4.5048 1.65594 5.95747C1.05423 7.41014 0.896789 9.00862 1.20354 10.5508C1.51029 12.0929 2.26746 13.5095 3.37929 14.6213C4.49111 15.7331 5.90767 16.4903 7.44982 16.797C8.99197 17.1038 10.5904 16.9464 12.0431 16.3446C13.4958 15.7429 14.7374 14.724 15.611 13.4166C16.4845 12.1092 16.9508 10.5722 16.9508 8.9998C16.9508 6.89133 16.1132 4.86922 14.6223 3.37831C13.1314 1.88739 11.1093 1.0498 9.00078 1.0498ZM9.00078 15.9558C7.62502 15.9558 6.28015 15.5478 5.13624 14.7835C3.99233 14.0192 3.10076 12.9328 2.57428 11.6618C2.0478 10.3907 1.91004 8.99209 2.17844 7.64276C2.44684 6.29342 3.10934 5.05398 4.08215 4.08117C5.05496 3.10836 6.2944 2.44586 7.64374 2.17746C8.99307 1.90906 10.3917 2.04682 11.6627 2.5733C12.9338 3.09978 14.0202 3.99135 14.7845 5.13526C15.5488 6.27917 15.9568 7.62404 15.9568 8.9998C15.9568 10.8447 15.2239 12.6139 13.9194 13.9184C12.6149 15.2229 10.8456 15.9558 9.00078 15.9558Z" fill="#222222"/></g></svg>',
  CLOSE_ICON: '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_15746_2423)"><g clip-path="url(#clip1_15746_2423)"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.2381 15.9994L19.6944 13.5434C19.8586 13.3793 19.9509 13.1566 19.9509 12.9245C19.951 12.6923 19.8588 12.4696 19.6946 12.3054C19.5305 12.1412 19.3078 12.0489 19.0757 12.0488C18.8435 12.0488 18.6208 12.141 18.4566 12.3051L16.0002 14.7615L13.5435 12.3051C13.3793 12.141 13.1566 12.0489 12.9245 12.049C12.6923 12.0491 12.4697 12.1414 12.3057 12.3056C12.1416 12.4698 12.0495 12.6925 12.0496 12.9246C12.0497 13.1568 12.142 13.3794 12.3062 13.5434L14.7622 15.9994L12.3062 18.4555C12.1427 18.6197 12.051 18.8421 12.0512 19.0738C12.0515 19.3055 12.1436 19.5277 12.3074 19.6916C12.4711 19.8556 12.6933 19.9478 12.925 19.9482C13.1567 19.9486 13.3791 19.8571 13.5435 19.6938L16.0002 17.2374L18.4566 19.6938C18.6208 19.8579 18.8435 19.9501 19.0756 19.9501C19.3078 19.95 19.5305 19.8577 19.6946 19.6935C19.8588 19.5293 19.9509 19.3066 19.9509 19.0745C19.9509 18.8423 19.8586 18.6196 19.6944 18.4555L17.2381 15.9994Z" fill="white"/></g></g><defs><clipPath id="clip0_15746_2423"><rect width="8" height="8" fill="white" transform="translate(12 12)"/></clipPath><clipPath id="clip1_15746_2423"><rect width="8" height="8" fill="white" transform="translate(12 12)"/></clipPath></defs></svg>',
};

export const LIMITS = {
  'quiz-maker': {
    maxFileSize: 104857600, // 100 MB
    maxFileSizeFriendly: '1 MB',
    acceptedFiles: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.rtf', '.txt', '.text', '.vtt'],
    maxNumFiles: 100,
    multipleFiles: true,
    uploadType: 'multifile-only',
    genAI: true,
  },
  'flashcard-maker': {
    maxFileSize: 104857600, // 100 MB
    maxFileSizeFriendly: '1 MB',
    acceptedFiles: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.rtf', '.txt', '.text', '.vtt'],
    maxNumFiles: 100,
    multipleFiles: true,
    uploadType: 'multifile-only',
    genAI: true,
  },
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

function getEnv() {
  const { hostname } = window.location;
  if (hostname.includes('localhost') || hostname.includes('.hlx.')) return 'stage';
  if (hostname.includes('stage.adobe.com')) return 'stage';
  return 'prod';
}

function redDirLink(verb) {
  const hostname = window?.location?.hostname;
  const ENV = getEnv();
  const VERB = verb;
  let newLocation;
  if (hostname !== 'www.adobe.com') {
    newLocation = `https://www.adobe.com/go/acrobat-${VERB.split('-').join('')}-${ENV}`;
  } else {
    newLocation = `https://www.adobe.com/go/acrobat-${VERB.split('-').join('')}`;
  }
  return newLocation;
}

function redDir(verb) {
  window.location.href = redDirLink(verb);
}

function isMobileDevice() {
  const ua = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|iphone|ipod|blackberry|windows phone/i.test(ua);
  return isMobileUA;
}

function isTabletDevice() {
  const ua = navigator.userAgent.toLowerCase();
  const isIPadOS = navigator.userAgent.includes('Mac')
    && 'ontouchend' in document
    && !/iphone|ipod/i.test(ua);
  const isTabletUA = /ipad|android(?!.*mobile)/i.test(ua);
  return isIPadOS || isTabletUA;
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
      'Analytics failed to initialize correctly: some methods remain no-ops on study-marquee block',
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
  ({ createTag, getConfig } = (await import(`${miloLibs}/utils/utils.js`)));
  ({ decorateBlockBg } = (await import(`${miloLibs}/utils/decorate.js`)));

  element.classList.add('con-block');
  if (isOldBrowser()) {
    window.location.href = EOLBrowserPage;
    return;
  }
  window.mph = window.mph || {};
  await loadPlaceholders();
  const VERB = element.classList[1];
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
  const container = createTag('div', { class: 'study-marquee-container' });
  const row = createTag('div', { class: 'study-marquee-row' });
  const leftCol = createTag('div', { class: 'study-marquee-col study-marquee-col-left' });
  const rightCol = createTag('div', { class: 'study-marquee-col study-marquee-col-right' });
  const header = createTag('div', { class: 'study-marquee-header' });
  const iconWrapper = createTag('div', { class: 'acrobat-icon' });
  const widgetIconSvg = createSvgElement('WIDGET_ICON');
  if (widgetIconSvg) {
    widgetIconSvg.classList.add('icon-acrobat');
    widgetIconSvg.setAttribute('aria-hidden', 'true');
    iconWrapper.appendChild(widgetIconSvg);
  }
  const title = createTag('div', { class: 'study-marquee-title' });
  const adobeText = createTag('span', { class: 'adobe-red' }, 'Adobe');
  const studySpaceText = createTag('span', {}, ' StudySpace');
  title.append(adobeText, studySpaceText);
  header.append(iconWrapper, title);
  const headingEl = createTag('h1', { class: 'study-marquee-heading' }, heading);
  const isMobileOrTablet = window.innerWidth < 1200;
  const copy1Text = isMobileOrTablet
    ? (window.mph?.[`study-marquee-${VERB}-mobile-copy`] || window.mph?.[`study-marquee-${VERB}-copy`] || '')
    : (window.mph?.[`study-marquee-${VERB}-copy`] || '');
  const copy2Text = isMobileOrTablet
    ? (window.mph?.[`study-marquee-${VERB}-mobile-sub-copy`] || window.mph?.[`study-marquee-${VERB}-sub-copy`] || '')
    : (window.mph?.[`study-marquee-${VERB}-sub-copy`] || '');
  const copy1 = createTag('p', { class: 'study-marquee-copy' }, copy1Text);
  const copy2 = createTag('p', { class: 'study-marquee-copy study-marquee-copy-sub' }, copy2Text);
  const dropzone = createTag('div', {
    class: 'study-marquee-dropzone',
    id: 'drop-zone',
  });
  const ctaButtonLabel = getCTA(VERB);
  const ctaButton = createTag('button', {
    class: 'study-marquee-cta',
    type: 'button',
    ...(ctaButtonLabel && { 'aria-label': ctaButtonLabel }),
  });
  const uploadIconSvg = createSvgElement('UPLOAD_ICON');
  if (uploadIconSvg) {
    uploadIconSvg.classList.add('upload-icon');
    uploadIconSvg.setAttribute('aria-hidden', 'true');
    ctaButton.appendChild(uploadIconSvg);
  }
  const ctaLabel = createTag('span', { class: 'study-marquee-cta-label' }, ctaButtonLabel);
  ctaButton.appendChild(ctaLabel);
  const dragText = createTag('p', { class: 'study-marquee-drag' }, window.mph?.[`study-widget-${VERB}-dragndrop-text`] || '');
  const fileLimitText = createTag('p', {
    class: 'study-marquee-file-limit',
    id: 'file-upload-description',
  }, window.mph?.[`study-widget-${VERB}-file-limit`] || '');
  const fileInput = createTag('input', {
    type: 'file',
    accept: LIMITS[VERB]?.acceptedFiles,
    id: 'file-upload',
    class: 'hide',
    'aria-hidden': 'true',
    'aria-describedby': 'file-upload-description',
    ...(LIMITS[VERB]?.multipleFiles && { multiple: '' }),
  });
  const errorState = createTag('div', {
    class: 'error hide',
    role: 'alert',
    'aria-live': 'assertive',
    'aria-atomic': 'true',
  });
  const errorStateText = createTag('p', {
    class: 'study-marquee-errorText',
    id: 'error-message',
  });
  const errorIcon = createTag('div', {
    class: 'study-marquee-errorIcon',
    'aria-hidden': 'true',
  });
  const errorCloseBtn = createTag('div', { class: 'study-marquee-errorBtn' });
  const closeIconSvg = createSvgElement('CLOSE_ICON');
  if (closeIconSvg) {
    closeIconSvg.classList.add('close-icon', 'error');
    closeIconSvg.setAttribute('aria-hidden', 'true');
    errorCloseBtn.prepend(closeIconSvg);
  }
  errorState.append(errorIcon, errorStateText, errorCloseBtn);
  const isMobile = isMobileDevice();
  const isTablet = isTabletDevice();
  const footer = createTag('div', { class: 'study-marquee-footer' });
  const { locale } = getConfig();
  const ppURL = window.mph?.['verb-widget-privacy-policy-url'] || `https://www.adobe.com${locale.prefix}/privacy/policy.html`;
  const touURL = window.mph?.['verb-widget-terms-of-use-url'] || `https://www.adobe.com${locale.prefix}/legal/terms.html`;
  const genAIurl = window.mph?.['verb-widget-genai-terms-url'] || `https://www.adobe.com${locale.prefix}/legal/licenses-terms/adobe-gen-ai-user-guidelines.html`;
  const legalText = createTag('p', { class: 'study-marquee-legal' }, window.mph?.['study-marquee-legal-text'] || '');
  if (legalText.textContent) {
    const createLegalLink = (label, url) => `<a class="study-marquee-legal-url" target="_blank" href="${url}">${label}</a>`;
    const legalLinks = [
      ['verb-widget-terms-of-use', touURL],
      ['verb-widget-privacy-policy', ppURL],
      ...(LIMITS[VERB]?.genAI ? [['verb-widget-genai-guidelines', genAIurl]] : []),
    ];
    legalText.innerHTML = legalLinks.reduce(
      (html, [key, url]) => {
        const linkText = window.mph?.[key];
        return linkText ? html.replace(linkText, createLegalLink(linkText, url)) : html;
      },
      legalText.textContent,
    );
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
  footer.append(legalText);
  if (!isMobile || isTablet) {
    footer.append(infoIcon);
  }
  dropzone.append(ctaButton, dragText, fileLimitText);
  const leftColChildren = [
    header, headingEl, copy1, ...(copy2Text ? [copy2] : []), dropzone, fileInput, footer,
  ];
  leftCol.append(...leftColChildren);
  if (media) {
    const mediaWrapper = createTag('div', { class: 'study-marquee-media' });
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
        { sampleRate: 5, tags: 'DC_Milo,Project Unity (DC)' },
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
    if (shouldToggle) {
      dropzone.classList.add('dragging');
    } else {
      dropzone.classList.remove('dragging');
    }
  };
  const handleError = (detail, logToLana = false, logOptions = {}) => {
    const { code, message, status, info = 'No additional info provided', accountType = 'Unknown account type' } = detail;
    if (message) {
      setDraggingClass(false);
      errorState.classList.add('study-marquee-error');
      errorState.classList.remove('hide');
      errorStateText.textContent = message;
    }
    if (logToLana) {
      window.lana?.log(
        `Error Code: ${code}, Status: ${status}, Message: ${message}, Info: ${info}, Account Type: ${accountType}`,
        logOptions,
      );
    }
    setTimeout(() => {
      errorState.classList.remove('study-marquee-error');
      errorState.classList.add('hide');
      errorStateText.textContent = '';
    }, 5000);
  };
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
    e.stopPropagation();
    setDraggingClass(false);
    element.classList.remove('dragging-block');
    const { dataTransfer: { files } } = e;
    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      Array.from(files).forEach((file) => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);
      element.dispatchEvent(new CustomEvent('unity:track-analytics', {
        detail: {
          event: 'drop',
          data: { userAttempts },
        },
      }));
    }
  });
  fileInput.addEventListener('click', () => {
    [
      'cta:clicked',
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
      element.dispatchEvent(new CustomEvent('unity:track-analytics', {
        detail: {
          event: 'change',
          data: { userAttempts },
        },
      }));
    }
  });
  fileInput.addEventListener('cancel', () => {
    window.analytics.verbAnalytics('choose-file:close', VERB, { userAttempts });
  });
  errorCloseBtn.addEventListener('click', () => {
    errorState.classList.remove('study-marquee-error');
    errorState.classList.add('hide');
  });
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
