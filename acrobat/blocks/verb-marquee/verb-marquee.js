import { setLibs, loadPlaceholders, getEnv as getAppEnv } from '../../scripts/utils.js';
import {
  DC_ENV,
  appEnvCookieMap,
  ICONS as SHARED_ICONS,
  FILE_PICKER_EVENTS,
  SOLO_PICKER_EVENTS,
  FILES_DROPPED_EVENTS,
  errorAnalyticsMap,
  createLogger,
  isMobileDevice,
  isTabletDevice,
  getStoreType,
  redirectOldBrowser,
  onDocumentReady,
  getSplunkEndpoint,
  setUser,
  getVerbKey,
  incrementVerbKey,
  getCookie,
  setCookie,
  setRedirectCookie,
  uploadedTime,
  setDraggingClass,
  initiatePrefetch,
  prefetchTarget,
  buildEarlyPrefetchUrl,
  setupEarlyPrefetch,
  reloadOnHistoryTraversal,
  trackAnalyticsEvent,
  registerAnalyticsLoader,
  parseSvg,
  initializePingService,
} from '../../scripts/verbWidgetUtils.js';
import {
  getHostEnv,
  hostRedDirLink,
  processMedia,
  getAuthoredSvgInfo,
} from '../../scripts/verbMarqueeUtils.js';

const MB100 = 104857600;
const MB20 = 20971520;
const PDF_ONLY = ['.pdf'];
const DOC_ONLY = ['.pdf', '.doc', '.docx'];
const ALL_FILES = ['.pdf', '.doc', '.docx', '.xml', '.ppt', '.pptx', '.xls', '.xlsx', '.rtf', '.txt', '.text', '.ai', '.form', '.bmp', '.gif', '.indd', '.jpeg', '.jpg', '.png', '.psd', '.tif', '.tiff'];
const SINGLE_PDF = { maxFileSize: MB100, acceptedFiles: PDF_ONLY, maxNumFiles: 1 };
const MULTI_ALL = { maxFileSize: MB100, acceptedFiles: ALL_FILES, multipleFiles: true };
const group = (verbs, config) => verbs.reduce((acc, v) => { acc[v] = config; return acc; }, {});

export const LIMITS = {
  fillsign: { ...SINGLE_PDF, mobileApp: true },
  'summarize-pdf': { maxFileSize: MB100, acceptedFiles: ALL_FILES, maxNumFiles: 1, genAI: true },
  'resume-builder': { maxFileSize: MB20, acceptedFiles: DOC_ONLY, maxNumFiles: 1, genAI: true },
  ...group(['word-to-pdf', 'jpg-to-pdf'], { ...MULTI_ALL, noRedirectTimeout: true }),
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

const logger = createLogger('verb-marquee');

const ICONS = {
  ...SHARED_ICONS,
  WIDGET_ICON: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="31" viewBox="0 0 32 31" fill="none"><path d="M25.8211 0H5.67886C2.54251 0 0 2.45484 0 5.48304V24.9308C0 27.959 2.54251 30.4138 5.67886 30.4138H25.8211C28.9575 30.4138 31.5 27.959 31.5 24.9308V5.48304C31.5 2.45484 28.9575 0 25.8211 0Z" fill="#B30B00"/><path d="M25.7023 17.5726C24.1856 16.0519 20.044 16.6714 19.0523 16.784C17.594 15.4323 16.6023 13.799 16.2523 13.2358C16.7773 11.7151 17.1273 10.1944 17.1856 8.56106C17.1856 7.15301 16.6023 5.63232 14.969 5.63232C14.3856 5.63232 13.8606 5.97026 13.569 6.42083C12.869 7.60359 13.1606 9.96911 14.269 12.3909C13.6273 14.1369 13.044 15.8266 11.4106 18.8116C9.71898 19.4875 6.16064 21.0645 5.86898 22.7542C5.75231 23.2611 5.92731 23.768 6.33564 24.1622C6.74398 24.5001 7.26898 24.6691 7.79398 24.6691C9.95231 24.6691 12.0523 21.7967 13.5106 19.3749C14.7356 18.9806 16.6606 18.4174 18.5856 18.0795C20.8606 19.9944 22.844 20.276 23.894 20.276C25.294 20.276 25.819 19.7128 25.994 19.2059C26.2856 18.6427 26.1106 18.0231 25.7023 17.5726ZM24.244 18.53C24.1856 18.9243 23.6606 19.3185 22.7273 19.0932C21.619 18.8116 20.6273 18.3047 19.7523 17.6289C20.5106 17.5162 22.2023 17.3473 23.4273 17.5726C23.894 17.6852 24.3606 17.9668 24.244 18.53ZM14.5023 6.92773C14.619 6.75876 14.794 6.64612 14.969 6.64612C15.494 6.64612 15.6106 7.26566 15.6106 7.77255C15.5523 8.95531 15.319 10.1381 14.9106 11.2645C14.0356 9.01164 14.2106 7.43462 14.5023 6.92773ZM14.3856 17.8542C14.8523 16.953 15.494 15.376 15.7273 14.7001C16.2523 15.545 17.1273 16.5588 17.594 17.0093C17.594 17.0657 15.7856 17.4036 14.3856 17.8542ZM10.944 20.107C9.60231 22.2473 8.20231 23.599 7.44398 23.599C7.32731 23.599 7.21064 23.5427 7.09398 23.4864C6.91898 23.3737 6.86064 23.2047 6.91898 22.9795C7.09398 22.1909 8.61064 21.1208 10.944 20.107Z" fill="white"/></svg>',
  SUBCOPY_CHECK: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10.0176 18.7836C9.41406 18.7836 8.80567 18.7211 8.20117 18.5942C3.47949 17.601 0.44531 12.9525 1.43652 8.23086C1.91699 5.94375 3.25976 3.98086 5.21679 2.70352C7.17382 1.4252 9.51074 0.986721 11.7988 1.46719C12.4951 1.61367 13.1689 1.84219 13.8027 2.14785C14.1758 2.32851 14.332 2.77676 14.1523 3.1498C13.9717 3.52285 13.5254 3.68105 13.1504 3.49941C12.6269 3.24648 12.0684 3.05605 11.4912 2.93593C9.59668 2.53945 7.65918 2.90077 6.03711 3.95937C4.41504 5.01797 3.30273 6.64394 2.90527 8.53945C2.083 12.4516 4.59765 16.3031 8.50976 17.1254C10.4043 17.5248 12.3408 17.1596 13.9629 16.102C15.585 15.0434 16.6973 13.4164 17.0947 11.5209C17.21 10.975 17.2617 10.4164 17.25 9.86172C17.2412 9.44766 17.5703 9.10488 17.9844 9.0961C18.3613 9.05997 18.7412 9.41641 18.75 9.83048C18.7637 10.4994 18.7012 11.1713 18.5635 11.8295C18.083 14.1166 16.7402 16.0805 14.7832 17.3578C13.3428 18.2973 11.6973 18.7836 10.0176 18.7836Z" fill="currentColor"/><path d="M18.4189 3.46937C18.1172 3.18519 17.6416 3.19984 17.3594 3.50355L9.93018 11.4245L7.46094 8.71547C7.18067 8.40785 6.70703 8.38832 6.40137 8.66567C6.09473 8.94497 6.07325 9.41958 6.35157 9.72524L9.36719 13.0338C9.37427 13.0416 9.38428 13.0441 9.39185 13.0514C9.39893 13.0587 9.40162 13.0687 9.40918 13.0758C9.45142 13.1156 9.50244 13.137 9.55078 13.1651C9.58081 13.1826 9.60669 13.2074 9.63867 13.2206C9.72949 13.2579 9.82544 13.2789 9.92187 13.2789C10.0171 13.2789 10.1113 13.2584 10.2012 13.2224C10.2302 13.2108 10.2541 13.1884 10.282 13.1727C10.3313 13.1452 10.3833 13.1234 10.4268 13.0836C10.4351 13.0761 10.438 13.0656 10.4458 13.0578C10.4526 13.0509 10.4619 13.0488 10.4687 13.0416L18.4531 4.52894C18.7363 4.22718 18.7217 3.75257 18.4189 3.46937Z" fill="currentColor"/></svg>',
};

function createSvgElement(iconName) {
  const svgString = ICONS[iconName];
  if (!svgString) {
    logger.error(`Error Code: Unknown, Status: 'Unknown', Message: Icon not found: ${iconName}`);
    return null;
  }
  return parseSvg(svgString);
}

const getCTA = (verb) => {
  const verbConfig = LIMITS[verb];
  return window.mph?.[`verb-marquee-${verb}-upload-cta`]
    || window.mph?.[`verb-widget-cta-${verbConfig?.uploadType}`]
    || window.mph?.['verb-widget-cta'] || '';
};

const redirectReady = new CustomEvent('DCUnity:RedirectReady');

let exitFlag = true;
let tabClosureSent = false;
let isUploading = false;

function handleExit(event, verb, userObj, unloadFlag, workflowStep) {
  if (exitFlag || tabClosureSent || (isUploading && workflowStep === 'preuploading')) { return; }
  tabClosureSent = true;
  const uploadingStartTime = parseInt(getCookie('UTS_Uploading'), 10);
  const tabClosureTime = Date.now();
  const duration = uploadingStartTime ? ((tabClosureTime - uploadingStartTime) / 1000).toFixed(1) : 'N/A';
  window.analytics.verbAnalytics('job:browser-tab-closure', verb, userObj, unloadFlag);
  window.analytics.sendAnalyticsToSplunk('job:browser-tab-closure', verb, { ...userObj, workflowStep, uploadTime: duration }, getSplunkEndpoint(getHostEnv()), true);
  if (!isUploading) return;
  event.preventDefault();
  event.returnValue = true;
}

registerAnalyticsLoader(logger);

export default async function init(element) {
  ({ createTag, getConfig, loadStyle } = (await import(`${miloLibs}/utils/utils.js`)));
  ({ decorateBlockBg } = (await import(`${miloLibs}/utils/decorate.js`)));

  element.classList.add('con-block');
  if (redirectOldBrowser()) return;
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
  onDocumentReady(() => {
    initializePingService(logger, getHostEnv());
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
  const authoredSvg = getAuthoredSvgInfo(foreground, headline);
  const media = foreground.querySelector(':scope > div:not([class])');
  if (media) {
    processMedia(media);
  }
  const container = createTag('div', { class: 'verb-marquee-container' });
  const row = createTag('div', { class: 'verb-marquee-row' });
  const leftCol = createTag('div', { class: 'verb-marquee-col verb-marquee-col-left' });
  const rightCol = createTag('div', { class: 'verb-marquee-col verb-marquee-col-right' });
  const header = createTag('div', { class: 'verb-marquee-header' });
  if (authoredSvg) {
    const svgImg = createTag('img', {
      src: authoredSvg.url,
      alt: authoredSvg.altText,
      class: 'verb-marquee-title-svg',
    });
    header.append(svgImg);
  } else {
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
  }
  const headingEl = createTag('h1', { class: 'verb-marquee-heading' }, heading);
  const isMobileOrTabletViewport = window.innerWidth < 1200;
  const copy1Text = isMobileOrTabletViewport
    ? (window.mph?.[`verb-marquee-${VERB}-mobile-copy`] || window.mph?.[`verb-marquee-${VERB}-copy`] || '')
    : (window.mph?.[`verb-marquee-${VERB}-copy`] || '');
  const subCopies = ['', '-2']
    .map((suffix) => {
      const subCopyText = isMobileOrTabletViewport
        ? (window.mph?.[`verb-marquee-${VERB}-mobile-sub-copy${suffix}`]
          || window.mph?.[`verb-marquee-${VERB}-sub-copy${suffix}`] || '')
        : (window.mph?.[`verb-marquee-${VERB}-sub-copy${suffix}`] || '');
      if (!subCopyText) return null;
      const el = createTag('p', { class: 'verb-marquee-copy-sub' });
      const icon = createSvgElement('SUBCOPY_CHECK');
      if (icon) {
        icon.classList.add('verb-marquee-copy-sub-icon');
        icon.setAttribute('aria-hidden', 'true');
        el.appendChild(icon);
      }
      el.appendChild(createTag('span', { class: 'verb-marquee-copy-sub-label' }, subCopyText));
      return el;
    })
    .filter(Boolean);
  const copy1 = createTag('p', { class: 'verb-marquee-copy' }, copy1Text);
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
    ...subCopies,
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

  function handleAnalyticsEvent(eventName, metadata, documentUnloading, canSendDataToSplunk) {
    const env = getHostEnv();
    trackAnalyticsEvent(VERB, eventName, metadata, documentUnloading, canSendDataToSplunk, env);
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
    if (LIMITS[VERB]?.noRedirectTimeout) {
      window.dispatchEvent(redirectReady);
    } else {
      setTimeout(() => {
        window.dispatchEvent(redirectReady);
        logger.warn('Adobe Analytics done callback failed to trigger, 3 second timeout dispatched event.');
      }, 3000);
    }
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

  let outsideClickHandler = null;
  const closeError = () => {
    errorState.classList.remove('verb-marquee-error');
    errorState.classList.add('hide');
    errorStateText.textContent = '';
    clearSrAlert();
    if (outsideClickHandler) {
      document.removeEventListener('click', outsideClickHandler);
      outsideClickHandler = null;
    }
  };
  const handleError = (detail, logToLana = false, logOptions = {}) => {
    const { code, message, status, info = 'No additional info provided', accountType = 'Unknown account type' } = detail;
    if (message) {
      setDraggingClass(dropzone, false);
      errorState.classList.add('verb-marquee-error');
      errorState.classList.remove('hide');
      errorStateText.textContent = message;
      announceToScreenReader(message);
      errorCloseBtn.focus();
      setTimeout(() => {
        if (outsideClickHandler) return;
        outsideClickHandler = (e) => {
          if (!errorState.contains(e.target)) closeError();
        };
        document.addEventListener('click', outsideClickHandler);
      }, 0);
    }
    if (logToLana) {
      window.lana?.log(
        `Error Code: ${code}, Status: ${status}, Message: ${message}, Info: ${info}, Account Type: ${accountType}`,
        logOptions,
      );
    }
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
      setDraggingClass(dropzone, true);
      element.classList.add('dragging-block');
    });
    element.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!element.contains(e.relatedTarget)) {
        setDraggingClass(dropzone, false);
        element.classList.remove('dragging-block');
      }
    });
    element.addEventListener('drop', (e) => {
      e.preventDefault();
      setDraggingClass(dropzone, false);
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
      FILE_PICKER_EVENTS.forEach((analyticsEvent) => {
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
  errorCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeError();
  });
  errorCloseBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeError();
    }
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
        SOLO_PICKER_EVENTS.forEach((analyticsEvent) => {
          window.analytics.verbAnalytics(analyticsEvent, VERB, { ...data, userAttempts });
        });
      });
    });
  }
  onDocumentReady(soloUpload);
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
        FILES_DROPPED_EVENTS.forEach((analyticsEvent) => {
          handleAnalyticsEvent(analyticsEvent, metadata, true, canSendDataToSplunk);
        });
        setDraggingClass(dropzone, false);
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
        if (canSendDataToSplunk) window.analytics.sendAnalyticsToSplunk('job:chunk-uploaded', VERB, metadata, getSplunkEndpoint(getHostEnv()));
      },
      redirectUrl: () => {
        if (data) initiatePrefetch(data.redirectUrl);
        if (isUploading) prefetchTarget();
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
    handleError(e.detail, true, logger.options);
    if (errorCode.includes('cookie_not_set')) return;
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
        getSplunkEndpoint(getHostEnv()),
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
    window.analytics.sendAnalyticsToSplunk('job:browser-tab-closure', VERB, { userAttempts, uploadTime: duration }, getSplunkEndpoint(getHostEnv()), true);
    if (!isUploading) return;
    event.preventDefault();
    event.returnValue = true;
  });
  window.addEventListener('beforeunload', () => {
    if (exitFlag) setRedirectCookie();
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
    const headingForWidget = heading || window.mph?.[`verb-widget-${VERB}-title`] || ' ';
    const widgetRoot = createTag('div', { class: `verb-widget ${VERB}` });
    widgetRoot.dataset.dcInjectedFromMarquee = 'true';
    widgetRoot.append(createTag('div', {}, headingForWidget));
    element.append(widgetRoot);
    try {
      const { default: initVerbWidget } = await import('../verb-widget/verb-widget.js');
      await initVerbWidget(widgetRoot);
    } catch (error) {
      logger.error(`Error Code: Unknown, Status: 'Unknown', Message: verb-widget init from verb-marquee failed: ${error.message}`);
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
    if (accountType) window.location.href = hostRedDirLink(VERB);
  }
  await checkSignedInUser();
  window.addEventListener('IMS:Ready', checkSignedInUser);
  setupEarlyPrefetch(VERB === 'word-to-pdf' ? buildEarlyPrefetchUrl(VERB) : null);

  element.parentNode.style.display = 'block';

  const prerenderElement = document.querySelector('#prerender_verb-widget');
  // eslint-disable-next-line compat/compat
  requestAnimationFrame(() => requestAnimationFrame(() => prerenderElement?.remove()));

  reloadOnHistoryTraversal();
}
