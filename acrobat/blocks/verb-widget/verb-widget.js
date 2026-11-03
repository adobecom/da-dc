/* eslint-disable compat/compat */
import { setLibs, getEnv, isOldBrowser } from '../../scripts/utils.js';
import { localeMap } from '../unity/unity.js';
import {
  DC_ENV,
  EOLBrowserPage,
  FILE_PICKER_EVENTS,
  FILES_DROPPED_EVENTS,
  createCtaButton,
  createErrorToast,
  createFileInput,
  createFooter,
  createVerbImage,
  createWidgetFrame,
  createWidgetHeader,
  errorAnalyticsMap,
  getAuthoredVerbIcon,
  getCookie,
  getSplunkEndpoint,
  getVerbKey,
  handleUpSell,
  incrementVerbKey,
  initializePingService,
  isMobileDevice,
  isTabletDevice,
  lanaOptions,
  onDocumentReady,
  prefetchInIframe,
  prefetchNextPage,
  redDir,
  registerAnalyticsLoader,
  reloadOnHistoryTraversal,
  setCookie,
  setRedirectCookie,
  setUser,
  trackAnalyticsEvent,
  uploadedTime,
} from '../../scripts/verbWidgetUtils.js';

const miloLibs = setLibs('/libs');

let createTag;
let getConfig;
let soloClicked;

const demoPath = 'blob/JTdCJTIyc291cmNlJTIyJTNBJTIyY2RuJTIyJTJDJTIyZmlsZVBhdGglMjIlM0ElMjIlMkZkYy1maWxlczItZHJvcGluJTJGZGVtby1maWxlcyUyRmVuLVVTJTJGY2hhdC1wZGYtZGVtby12NCUyRmNoYXQtcGRmLWRlbW8tdjQucGRmJTIyJTJDJTIyaXRlbU5hbWUlMjIlM0ElMjJBSSUyMEFzc2lzdGFudCUyMGRlbW8lMjBmaWxlLnBkZiUyMiUyQyUyMm5hbWUlMjIlM0ElMjJjaGF0LXBkZi1kZW1vLXY0JTIyJTJDJTIyaXRlbVR5cGUlMjIlM0ElMjJhcHBsaWNhdGlvbiUyRnBkZiUyMiU3RA/?defaultRHPFeature=verb-qanda&x_api_client_id=ChatPDFTryDemoFile&x_api_client_location=chat_pdf&try-ai-demo=true&demo-mode=true&promoid=HHJ4X8CS&mv=product&mv2=acrobat-web';
const EARLY_PREFETCH_DUMMY_ASSET = 'urn%3Aaaid%3Asc%3AUS%3A1111111%7CSample%20word%20file_WordtoPDF.docx%7C386919%7Capplication%2Fvnd.openxmlformats-officedocument.wordprocessingml.document';
const EARLY_PREFETCH_CONFIG = {
  'word-to-pdf': { path: 'word-to-pdf/av', clientLocation: 'word-to-pdf', assets: EARLY_PREFETCH_DUMMY_ASSET },
  'excel-to-pdf': { path: 'excel-to-pdf', clientLocation: 'excel-to-pdf', assets: EARLY_PREFETCH_DUMMY_ASSET },
  'ppt-to-pdf': { path: 'ppt-to-pdf', clientLocation: 'ppt-to-pdf', assets: EARLY_PREFETCH_DUMMY_ASSET },
};
const redirectReady = new CustomEvent('DCUnity:RedirectReady');

const MB100 = 104857600;
const MB250 = 262144000;
const PDF_ONLY = ['.pdf'];
const ALL_FILES = ['.pdf', '.doc', '.docx', '.xml', '.ppt', '.pptx', '.xls', '.xlsx', '.rtf', '.txt', '.text', '.ai', '.form', '.bmp', '.gif', '.indd', '.jpeg', '.jpg', '.png', '.psd', '.tif', '.tiff'];
const STUDENT_FILES = ['.pdf', '.doc', '.docx', '.xml', '.ppt', '.pptx', '.xls', '.xlsx', '.rtf', '.txt'];
const SIGNED_IN_FILES = ['.doc', '.docx', '.xml', '.ppt', '.pptx', '.xls', '.xlsx', '.rtf', '.txt', '.text', '.ai', '.form', '.bmp', '.gif', '.indd', '.jpeg', '.jpg', '.png', '.psd', '.tif', '.tiff'];
const COMMON_TO_PDF_FILES = ['.jpg', '.jpeg', '.png', '.heic', '.tif', '.tiff', '.bmp', '.gif', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.rtf', '.txt', '.text'];
const CREATEPDF_FILES = [...COMMON_TO_PDF_FILES, '.pdf', '.psd', '.ai', '.indd'];

const SINGLE_PDF = { maxFileSize: MB100, acceptedFiles: PDF_ONLY, maxNumFiles: 1 };
const MULTI_PDF = { maxFileSize: MB100, acceptedFiles: PDF_ONLY, multipleFiles: true };
const MULTI_ALL = { maxFileSize: MB100, acceptedFiles: ALL_FILES, multipleFiles: true };
const MULTI_COMMON_TO_PDF = {
  maxFileSize: MB100,
  acceptedFiles: COMMON_TO_PDF_FILES,
  multipleFiles: true,
};
const GENAI_MULTI = { ...MULTI_ALL, maxNumFiles: 100, uploadType: 'multifile-only', subCopy: true, genAI: true };
const group = (verbs, config) => verbs.reduce((acc, v) => { acc[v] = config; return acc; }, {});

export const LIMITS = {
  fillsign: { ...SINGLE_PDF, mobileApp: true },
  'ocr-pdf': { ...MULTI_PDF, maxNumFiles: 100 },
  'chat-pdf-student': {
    maxFileSize: MB100,
    acceptedFiles: STUDENT_FILES,
    maxNumFiles: 100,
    multipleFiles: true,
    uploadType: 'multifile-only',
    subCopy: true,
    genAI: true,
  },
  'summarize-pdf': { maxFileSize: MB100, acceptedFiles: ALL_FILES, maxNumFiles: 1, subCopy: true, genAI: true },
  'split-pdf': { ...SINGLE_PDF, signedInAcceptedFiles: SIGNED_IN_FILES },
  'add-comment': { ...SINGLE_PDF },
  'compress-pdf': { maxFileSize: 2147483648, acceptedFiles: ALL_FILES, multipleFiles: true },
  sendforsignature: {
    maxFileSize: 5242880,
    acceptedFiles: PDF_ONLY,
    maxNumFiles: 1,
    mobileApp: true,
  },
  ...group(['number-pages', 'crop-pages'], { ...SINGLE_PDF, level: 0 }),
  ...group(['protect-pdf', 'delete-pages', 'insert-pdf', 'extract-pages', 'reorder-pages'], SINGLE_PDF),
  ...group(['chat-pdf', 'pdf-ai'], GENAI_MULTI),
  ...group(['combine-pdf', 'rotate-pages'], { ...MULTI_PDF, maxNumFiles: 100, uploadType: 'multifile-only' }),
  ...group(['pdf-to-excel', 'pdf-to-image', 'pdf-to-png'], MULTI_PDF),
  ...group(['pdf-to-word', 'pdf-to-ppt'], { maxFileSize: MB250, acceptedFiles: PDF_ONLY, multipleFiles: true }),
  createpdf: { maxFileSize: MB100, acceptedFiles: CREATEPDF_FILES, multipleFiles: true },
  ...group(['png-to-pdf', 'excel-to-pdf', 'ppt-to-pdf'], MULTI_COMMON_TO_PDF),
  ...group(['word-to-pdf', 'jpg-to-pdf'], { ...MULTI_COMMON_TO_PDF, noRedirectTimeout: true }),
  ...group(['image-to-pdf', 'bmp-to-pdf', 'gif-to-pdf', 'tiff-to-pdf'], MULTI_COMMON_TO_PDF),
  'psd-to-pdf': { maxFileSize: MB100, acceptedFiles: ['.psd'], multipleFiles: true },
  'ai-to-pdf': { maxFileSize: MB100, acceptedFiles: ['.ai'], multipleFiles: true },
  'indd-to-pdf': { maxFileSize: MB100, acceptedFiles: ['.indd'], multipleFiles: true },
};

const setDraggingClass = (widget, shouldToggle) => {
  // eslint-disable-next-line chai-friendly/no-unused-expressions
  shouldToggle ? widget.classList.add('dragging') : widget.classList.remove('dragging');
};

function prefetchTarget() {
  if (window.prefetchTargetLoaded || !window.prefetchTargetUrl) return;
  prefetchInIframe(window.prefetchTargetUrl);
  window.prefetchTargetLoaded = true;
}

function initiatePrefetch(url) {
  if (!window.prefetchTargetUrl) {
    prefetchNextPage(url);
    window.prefetchTargetUrl = url;
  }
}

function buildEarlyPrefetchUrl(verb) {
  const config = EARLY_PREFETCH_CONFIG[verb];
  if (!config) return null;
  const langFromPath = window.location.pathname.split('/')[1];
  const locale = localeMap[langFromPath] || 'en-us';
  const [languageCode, languageRegion] = locale.split('-');
  const domain = DC_ENV === 'prod' ? 'acrobat.adobe.com' : 'stage.acrobat.adobe.com';
  return `https://${domain}/${languageRegion}/${languageCode}/${config.path}?x_api_client_id=unity&x_api_client_location=${config.clientLocation}&user=frictionless_return_user&attempts=2%2B#assets=${config.assets}`;
}

function getDemoEndpoint(verb) {
  const baseUrl = (getEnv() === 'prod') ? 'https://acrobat.adobe.com' : 'https://stage.acrobat.adobe.com';
  let demoUrl = `${baseUrl}/${demoPath}`;
  if (verb === 'pdf-ai') {
    demoUrl = demoUrl.replace('x_api_client_location=chat_pdf', 'x_api_client_location=chat_pdf_pdf_ai');
  }
  return demoUrl;
}

function getUnityReferrer() {
  const unityBlock = document.querySelector('.unity');
  const referrerClass = unityBlock && [...unityBlock.classList].find((cn) => cn.startsWith('referrer-'));
  return referrerClass ? referrerClass.replace('referrer-', '') : '';
}

function getDemoHref(verb, authoredHref) {
  const defaultHref = getDemoEndpoint(verb);
  const referrer = getUnityReferrer();
  if (!authoredHref && !referrer) return defaultHref;
  try {
    const defaults = new URL(defaultHref).searchParams;
    const url = new URL(authoredHref || defaultHref);
    if (!url.searchParams.has('x_api_client_id')) {
      url.searchParams.set('x_api_client_id', defaults.get('x_api_client_id'));
    }
    if (!authoredHref || !url.searchParams.has('x_api_client_location')) {
      url.searchParams.set('x_api_client_location', referrer || defaults.get('x_api_client_location'));
    }
    return url.toString();
  } catch (e) {
    return authoredHref || defaultHref;
  }
}

let exitFlag;
let tabClosureSent;
let isUploading;
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

const getCTA = (verb) => {
  const verbConfig = LIMITS[verb];
  return window.mph[`verb-widget-cta-${verbConfig?.uploadType}`] || window.mph['verb-widget-cta'];
};

function getStoreType() {
  const { ua } = window.browser;
  if (/android/i.test(ua)) {
    return 'google';
  }
  if (/iphone|ipod/i.test(ua)) {
    return 'apple';
  }
  if (navigator.userAgent.includes('Mac') && 'ontouchend' in document && !/iphone|ipod/i.test(navigator.userAgent)) {
    return 'apple';
  }
  if (/ipad/i.test(ua)) {
    return 'apple';
  }
  return 'desktop';
}

function getPricingLink() {
  const { locale } = getConfig();
  const ENV = getEnv();
  const links = {
    dev: `https://www.stage.adobe.com${locale.prefix}/acrobat/pricing/pricing.html`,
    stage: `https://www.stage.adobe.com${locale.prefix}/acrobat/pricing/pricing.html`,
    prod: `https://www.adobe.com${locale.prefix}/acrobat/pricing/pricing.html`,
  };

  // If env is invalid or omitted, default to 'prod'
  return links[ENV] || links.prod;
}

registerAnalyticsLoader('verb-widget');

export default async function init(element) {
  ({ createTag, getConfig } = await import(`${miloLibs}/utils/utils.js`));

  if (isOldBrowser()) {
    window.location.href = EOLBrowserPage;
    return;
  }

  const prerenderElement = document.querySelector('#prerender_verb-widget');

  const isMobile = isMobileDevice();
  const isTablet = isTabletDevice();
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const IOS_UNKNOWN_EXTS = new Set(['.ai', '.psd', '.indd', '.form']);
  const getAcceptValue = (verb) => {
    const accepted = LIMITS[verb]?.acceptedFiles;
    if (isIOS && accepted?.some((ext) => IOS_UNKNOWN_EXTS.has(ext))) return '*/*';
    return accepted;
  };

  const LABEL_PREFIX = 'dc-block-row-';
  const authored = new Map();
  const children = [];
  element.querySelectorAll(':scope > div').forEach((rowEl) => {
    const label = rowEl.firstElementChild?.textContent?.trim() || '';
    if (label.startsWith(LABEL_PREFIX)) {
      authored.set(label.slice(LABEL_PREFIX.length), rowEl.children[1] || null);
      rowEl.remove();
    } else {
      children.push(rowEl);
    }
  });
  const cellText = (key) => authored.get(key)?.textContent?.trim() || '';
  const VERB = element.classList[1];
  const widgetHeading = createTag('h1', { class: 'verb-heading' }, children[0].textContent);
  let widgetSubHeading = window.mph[`verb-widget-${VERB}-description`];
  let widgetMobSubHeading = window.mph[`verb-widget-${VERB}-mobile-description`];
  if (children.length > 2) {
    widgetSubHeading = children[1].textContent;
    widgetMobSubHeading = children[2].textContent;
  }
  const authoredIcon = getAuthoredVerbIcon(element);
  let noOfFiles = null;
  let openFilePicker = true;
  const userAttempts = getVerbKey(`${VERB}_attempts`);

  function mergeData(eventData = {}) {
    return { ...eventData, noOfFiles };
  }

  children.forEach((child) => {
    child.remove();
  });

  let widgetSubCopy;
  let widgetDemoButton;
  const { widget, widgetLeft, widgetRight } = await createWidgetFrame();
  const widgetHeader = await createWidgetHeader();
  const widgetCopy = createTag('p', { class: 'verb-copy' }, widgetSubHeading);
  const widgetMobCopy = createTag('p', { class: 'verb-copy' }, widgetMobSubHeading);
  const widgetButton = await createCtaButton(getCTA(VERB));

  if (LIMITS[VERB].subCopy) {
    const subCopyText = cellText('sub-copy') || window.mph[`verb-widget-${VERB}-sub-description`];
    widgetSubCopy = createTag('p', { class: 'verb-copy verb-sub-copy' }, subCopyText);
    widgetCopy.append(widgetSubCopy);
  }

  const button = await createFileInput(getAcceptValue(VERB), LIMITS[VERB]?.multipleFiles);
  widgetRight.append(await createVerbImage(VERB, authoredIcon));
  const { errorState, showError } = await createErrorToast(widget);

  widgetLeft.append(widgetHeader, widgetHeading, errorState);

  if (isMobile || isTablet) {
    widgetLeft.insertBefore(widgetMobCopy, errorState);
    if (LIMITS[VERB].level === 0) {
      openFilePicker = false;
      widget.classList.add('trial');
      const widgetMobileFreeTrial = createTag('a', { class: 'verb-mobile-cta', href: getPricingLink() }, window.mph['verb-widget-cta-mobile-start-trial']);
      widgetLeft.insertBefore(widgetMobileFreeTrial, errorState);
    } else if (LIMITS[VERB].mobileApp) {
      openFilePicker = false;
      widget.classList.add('mobile-app');
      const storeType = getStoreType();
      const mobileLink = window.mph[`verb-widget-${VERB}-${storeType}`] || window.mph[`verb-widget-${VERB}-apple`];
      const widgetMobileButton = createTag('a', { class: 'verb-mobile-cta', href: mobileLink }, window.mph['verb-widget-cta-mobile']);
      widgetMobileButton.addEventListener('click', () => {
        window.analytics.verbAnalytics('goto-app:clicked', VERB, { userAttempts });
      });
      widgetLeft.insertBefore(widgetMobileButton, errorState);
    } else {
      widgetLeft.insertBefore(widgetButton, errorState);
      widgetLeft.insertBefore(button, errorState);
    }
  } else if ((VERB.indexOf('chat-pdf') > -1 || VERB.indexOf('pdf-ai') > -1)
    && (cellText('demo-cta') || window.mph['verb-widget-cta-demo'])) {
    const demoBtnWrapper = createTag('div', { class: 'demo-button-wrapper' });
    const demoText = cellText('demo-cta') || window.mph['verb-widget-cta-demo'];
    const demoHref = getDemoHref(VERB, authored.get('demo-cta')?.querySelector('a[href]')?.href);
    widgetDemoButton = createTag('a', { href: demoHref, class: 'verb-cta demo-cta', tabindex: 0 }, demoText);
    widgetDemoButton.addEventListener('click', () => {
      window.analytics.verbAnalytics('Try with a demo file', VERB, { userAttempts });
    });
    demoBtnWrapper.append(widgetButton, widgetDemoButton);
    widgetLeft.insertBefore(widgetCopy, errorState);
    // widgetLeft.insertBefore(widgetButton, errorState);
    widgetLeft.insertBefore(demoBtnWrapper, errorState);
    widgetLeft.insertBefore(button, errorState);
  } else {
    widgetLeft.insertBefore(widgetCopy, errorState);
    widgetLeft.insertBefore(widgetButton, errorState);
    widgetLeft.insertBefore(button, errorState);
  }

  const footer = (LIMITS[VERB].mobileApp && isMobile)
    ? createTag('div', { class: 'verb-footer' })
    : await createFooter({ genAI: LIMITS[VERB].genAI });
  element.append(widget, footer);

  async function checkSignedInUser() {
    if (!window.adobeIMS?.isSignedInUser?.()) return;

    element.classList.remove('upsell');
    element.classList.add('signed-in');

    if (LIMITS[VERB].signedInAcceptedFiles) {
      button.accept = [...LIMITS[VERB].acceptedFiles, ...LIMITS[VERB].signedInAcceptedFiles];
    }

    redDir(VERB);
  }

  const handleAnalyticsEvent = (...args) => trackAnalyticsEvent(VERB, ...args);

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
    if (LIMITS[VERB]?.noRedirectTimeout ?? true) {
      window.dispatchEvent(redirectReady);
    } else {
      setTimeout(() => {
        window.dispatchEvent(redirectReady);
        window.lana?.log(
          'Adobe Analytics done callback failed to trigger, 3 second timeout dispatched event.',
          { ...lanaOptions, severity: 'warning' },
        );
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

  await handleUpSell(VERB, element, userAttempts);

  // Race the condition
  await checkSignedInUser();

  // Redirect after IMS:Ready
  window.addEventListener('IMS:Ready', checkSignedInUser);

  window.prefetchTargetUrl = null;

  if (EARLY_PREFETCH_CONFIG[VERB]) {
    const triggerEarlyPrefetch = () => {
      initiatePrefetch(buildEarlyPrefetchUrl(VERB));
      prefetchTarget();
    };
    document.addEventListener('click', triggerEarlyPrefetch, { once: true });
    document.addEventListener('dragover', triggerEarlyPrefetch, { once: true });
  }

  element.parentNode.style.display = 'block';

  requestAnimationFrame(() => requestAnimationFrame(() => prerenderElement?.remove()));

  widget.addEventListener('click', (e) => {
    if (e.srcElement.classList.value.includes('error')) { return; }
    if (e.srcElement.classList.value.includes('demo')) { return; }
    if (openFilePicker === true) { button.click(); }
  });

  button.addEventListener('click', (data) => {
    if (soloClicked) {
      soloClicked = false;
      return;
    }
    FILE_PICKER_EVENTS.forEach((analyticsEvent) => {
      window.analytics.verbAnalytics(analyticsEvent, VERB, { ...data, userAttempts });
    });
  });

  button.addEventListener('change', (data) => {
    const { target: { files } } = data;
    if (!files) return;
    noOfFiles = files.length;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  button.addEventListener('cancel', () => {
    window.analytics.verbAnalytics('choose-file:close', VERB, { userAttempts });
  });

  widget.addEventListener('dragover', (e) => {
    e.preventDefault();
    setDraggingClass(widget, true);
  });

  widget.addEventListener('dragleave', () => {
    setDraggingClass(widget, false);
  });

  widget.addEventListener('drop', (event) => {
    event.preventDefault();
    const { files } = event.dataTransfer;
    if (!files) return;
    noOfFiles = files.length;
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
        FILES_DROPPED_EVENTS.forEach((analyticsEvent) => {
          handleAnalyticsEvent(analyticsEvent, metadata, true, canSendDataToSplunk);
        });
        setDraggingClass(widget, false);
        registerTabCloseEvent(metadata, 'preuploading');
      },
      cancel: () => {
        if (exitFlag) return;
        handleAnalyticsEvent('job:cancel', metadata, true, canSendDataToSplunk);
        exitFlag = true;
      },
      uploading: () => handleUploadingEvent(data, userAttempts, cookieExp, canSendDataToSplunk),
      uploaded: () => handleUploadedEvent(data, userAttempts, cookieExp, canSendDataToSplunk),
      redirectUrl: () => {
        if (data) initiatePrefetch(data.redirectUrl);
        if (isUploading) prefetchTarget();
        handleAnalyticsEvent('job:redirect-success', metadata, false, canSendDataToSplunk);
      },
      chunk_uploaded: () => {
        if (canSendDataToSplunk) window.analytics.sendAnalyticsToSplunk('job:chunk-uploaded', VERB, metadata, getSplunkEndpoint());
      },
    };

    if (analyticsMap[event]) {
      analyticsMap[event]();
    }
  });

  window.addEventListener('beforeunload', () => {
    if (exitFlag) setRedirectCookie();
  });

  const handleError = (detail, logToLana = false, logOptions = {}) => {
    const { code, message, status, info = 'No additional info provided', accountType = 'Unknown account type' } = detail;
    if (message) showError(message);
    if (logToLana) {
      window.lana?.log(
        `Error Code: ${code}, Status: ${status}, Message: ${message}, Info: ${info}, Account Type: ${accountType}`,
        logOptions,
      );
    }
  };

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

  reloadOnHistoryTraversal();

  function soloUpload() {
    const uploadLinkContains = document.querySelectorAll('a[href*="#upload"]');

    uploadLinkContains.forEach((link) => {
      const verbCtaClone = document.querySelector('.verb-cta')?.cloneNode(true);

      if (!verbCtaClone) return;

      const labelElement = createTag('label', {
        for: 'file-upload',
        class: 'verb-cta verb-cta-solo',
        tabindex: 0,
        'daa-ll': verbCtaClone.textContent,
        'aria-label': `${verbCtaClone.textContent}`,
      });

      labelElement.innerHTML = verbCtaClone.innerHTML;
      link.closest('div').append(labelElement);
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

  onDocumentReady(() => {
    soloUpload();
    initializePingService();
    if (!element.dataset.dcInjectedFromMarquee) {
      window.dispatchEvent(new CustomEvent('analyticsLoad', {
        detail: {
          verb: VERB,
          userAttempts,
        },
      }));
    }
  });
}
