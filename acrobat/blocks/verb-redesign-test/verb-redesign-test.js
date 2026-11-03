import { setLibs, loadPlaceholders } from '../../scripts/utils.js';
import {
  DC_ENV,
  appEnvCookieMap,
  ICONS as SHARED_ICONS,
  FILE_PICKER_EVENTS,
  SOLO_PICKER_EVENTS,
  FILES_DROPPED_EVENTS,
  errorAnalyticsMap,
  buildEarlyPrefetchUrl,
  redirectOldBrowser,
  onDocumentReady,
  getSplunkEndpoint,
  setUser,
  getVerbKey,
  incrementVerbKey,
  getCookie,
  setCookie,
  uploadedTime,
  setDraggingClass,
  initiatePrefetch,
  prefetchTarget,
  reloadOnHistoryTraversal,
  trackAnalyticsEvent,
  registerAnalyticsLoader,
  createLogger,
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
const VERB_LIMITS = {
  maxFileSize: MB100,
  acceptedFiles: ['.pdf', '.doc', '.docx', '.xml', '.ppt', '.pptx', '.xls', '.xlsx', '.rtf', '.txt', '.text', '.ai', '.form', '.bmp', '.gif', '.indd', '.jpeg', '.jpg', '.png', '.psd', '.tif', '.tiff'],
  multipleFiles: true,
  noRedirectTimeout: true,
};

export const LIMITS = {
  'jpg-to-pdf': VERB_LIMITS,
  'word-to-pdf': VERB_LIMITS,
};

const exhLimitCookieMap = { 'to-pdf': 'cr_p_c' };

const DEFAULTS = {
  subtitle: { 'jpg-to-pdf': '', 'word-to-pdf': '' },
  cta: '',
  dragText: { 'jpg-to-pdf': '', 'word-to-pdf': '' },
  fileLimit: { 'jpg-to-pdf': '', 'word-to-pdf': '' },
  benefits: ['', '', '', ''],
};

const miloLibs = setLibs('/libs');
let createTag;
let getConfig;
let loadStyle;
let decorateBlockBg;

const logger = createLogger('verb-redesign-test');

const ICONS = {
  ...SHARED_ICONS,
  WIDGET_ICON: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="31" viewBox="0 0 32 31" fill="none"><path d="M25.8211 0H5.67886C2.54251 0 0 2.45484 0 5.48304V24.9308C0 27.959 2.54251 30.4138 5.67886 30.4138H25.8211C28.9575 30.4138 31.5 27.959 31.5 24.9308V5.48304C31.5 2.45484 28.9575 0 25.8211 0Z" fill="#B30B00"/><path d="M25.7023 17.5726C24.1856 16.0519 20.044 16.6714 19.0523 16.784C17.594 15.4323 16.6023 13.799 16.2523 13.2358C16.7773 11.7151 17.1273 10.1944 17.1856 8.56106C17.1856 7.15301 16.6023 5.63232 14.969 5.63232C14.3856 5.63232 13.8606 5.97026 13.569 6.42083C12.869 7.60359 13.1606 9.96911 14.269 12.3909C13.6273 14.1369 13.044 15.8266 11.4106 18.8116C9.71898 19.4875 6.16064 21.0645 5.86898 22.7542C5.75231 23.2611 5.92731 23.768 6.33564 24.1622C6.74398 24.5001 7.26898 24.6691 7.79398 24.6691C9.95231 24.6691 12.0523 21.7967 13.5106 19.3749C14.7356 18.9806 16.6606 18.4174 18.5856 18.0795C20.8606 19.9944 22.844 20.276 23.894 20.276C25.294 20.276 25.819 19.7128 25.994 19.2059C26.2856 18.6427 26.1106 18.0231 25.7023 17.5726ZM24.244 18.53C24.1856 18.9243 23.6606 19.3185 22.7273 19.0932C21.619 18.8116 20.6273 18.3047 19.7523 17.6289C20.5106 17.5162 22.2023 17.3473 23.4273 17.5726C23.894 17.6852 24.3606 17.9668 24.244 18.53ZM14.5023 6.92773C14.619 6.75876 14.794 6.64612 14.969 6.64612C15.494 6.64612 15.6106 7.26566 15.6106 7.77255C15.5523 8.95531 15.319 10.1381 14.9106 11.2645C14.0356 9.01164 14.2106 7.43462 14.5023 6.92773ZM14.3856 17.8542C14.8523 16.953 15.494 15.376 15.7273 14.7001C16.2523 15.545 17.1273 16.5588 17.594 17.0093C17.594 17.0657 15.7856 17.4036 14.3856 17.8542ZM10.944 20.107C9.60231 22.2473 8.20231 23.599 7.44398 23.599C7.32731 23.599 7.21064 23.5427 7.09398 23.4864C6.91898 23.3737 6.86064 23.2047 6.91898 22.9795C7.09398 22.1909 8.61064 21.1208 10.944 20.107Z" fill="white"/></svg>',
  CLOSE_ICON: '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_vm2)"><g clip-path="url(#clip1_vm2)"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.2381 15.9994L19.6944 13.5434C19.8586 13.3793 19.9509 13.1566 19.9509 12.9245C19.951 12.6923 19.8588 12.4696 19.6946 12.3054C19.5305 12.1412 19.3078 12.0489 19.0757 12.0488C18.8435 12.0488 18.6208 12.141 18.4566 12.3051L16.0002 14.7615L13.5435 12.3051C13.3793 12.141 13.1566 12.0489 12.9245 12.049C12.6923 12.0491 12.4697 12.1414 12.3057 12.3056C12.1416 12.4698 12.0495 12.6925 12.0496 12.9246C12.0497 13.1568 12.142 13.3794 12.3062 13.5434L14.7622 15.9994L12.3062 18.4555C12.1427 18.6197 12.051 18.8421 12.0512 19.0738C12.0515 19.3055 12.1436 19.5277 12.3074 19.6916C12.4711 19.8556 12.6933 19.9478 12.925 19.9482C13.1567 19.9486 13.3791 19.8571 13.5435 19.6938L16.0002 17.2374L18.4566 19.6938C18.6208 19.8579 18.8435 19.9501 19.0756 19.9501C19.3078 19.95 19.5305 19.8577 19.6946 19.6935C19.8588 19.5293 19.9509 19.3066 19.9509 19.0745C19.9509 18.8423 19.8586 18.6196 19.6944 18.4555L17.2381 15.9994Z" fill="white"/></g></g><defs><clipPath id="clip0_vm2"><rect width="8" height="8" fill="white" transform="translate(12 12)"/></clipPath><clipPath id="clip1_vm2"><rect width="8" height="8" fill="white" transform="translate(12 12)"/></clipPath></defs></svg>',
  BENEFIT_CARD_ICON: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1.5" y="4.5" width="17" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5"/><line x1="1.5" y1="8" x2="18.5" y2="8" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="12" x2="8" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  BENEFIT_SHIELD_ICON: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 5.2V9.6C3 13.6 6.1 17.3 10 18.3C13.9 17.3 17 13.6 17 9.6V5.2L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  BENEFIT_TRASH_ICON: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5.5H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 5.5V3.5H12V5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 5.5L5.8 16.5H14.2L15 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  BENEFIT_STAR_ICON: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M10 2l2.09 4.26L17 7.27l-3.5 3.41.83 4.82L10 13.27l-4.33 2.23.83-4.82L3 7.27l4.91-.71L10 2z" fill="currentColor"/></svg>',
};

const BENEFIT_ICON_KEYS = ['BENEFIT_CARD_ICON', 'BENEFIT_SHIELD_ICON', 'BENEFIT_TRASH_ICON', null];

function createSvgElement(iconName) {
  const svgString = ICONS[iconName];
  if (!svgString) return null;
  return parseSvg(svgString);
}

const redirectReady = new CustomEvent('DCUnity:RedirectReady');

let exitFlag = true;
let tabClosureSent = false;
let isUploading = false;

const getSplunkUrl = () => getSplunkEndpoint(getHostEnv());

function handleExit(event, verb, userObj, unloadFlag, workflowStep) {
  if (exitFlag || tabClosureSent || (isUploading && workflowStep === 'preuploading')) return;
  tabClosureSent = true;
  const uploadingStartTime = parseInt(getCookie('UTS_Uploading'), 10);
  const tabClosureTime = Date.now();
  const duration = uploadingStartTime ? ((tabClosureTime - uploadingStartTime) / 1000).toFixed(1) : 'N/A';
  window.analytics.verbAnalytics('job:browser-tab-closure', verb, userObj, unloadFlag);
  window.analytics.sendAnalyticsToSplunk('job:browser-tab-closure', verb, { ...userObj, workflowStep, uploadTime: duration }, getSplunkUrl(), true);
  if (!isUploading) return;
  event.preventDefault();
  event.returnValue = true;
}

registerAnalyticsLoader(logger);

function buildBenefitsRow(verb) {
  const benefits = BENEFIT_ICON_KEYS
    .map((iconKey, i) => {
      const text = window.mph?.[`verb-redesign-test-${verb}-highlight-${i + 1}`]
        || window.mph?.[`verb-redesign-test-highlight-${i + 1}`]
        || DEFAULTS.benefits[i]
        || '';
      if (!text) return null;
      const item = createTag('div', { class: 'vm2-benefit' });
      const icon = createSvgElement(iconKey);
      if (icon) {
        icon.classList.add('vm2-benefit-icon');
        icon.setAttribute('aria-hidden', 'true');
        item.appendChild(icon);
      }
      item.appendChild(createTag('span', { class: 'vm2-benefit-text' }, text));
      return item;
    })
    .filter(Boolean);

  if (!benefits.length) return null;
  const row = createTag('div', { class: 'vm2-benefits' });
  row.append(...benefits);
  return row;
}

export default async function init(element) {
  ({ createTag, getConfig, loadStyle } = (await import(`${miloLibs}/utils/utils.js`)));
  ({ decorateBlockBg } = (await import(`${miloLibs}/utils/decorate.js`)));

  element.classList.add('con-block');
  if (redirectOldBrowser()) return;

  const prerenderElement = document.querySelector('#prerender_verb-widget');

  window.mph = window.mph || {};
  await loadPlaceholders(['verb-redesign-test', 'verb-marquee', 'verb-widget']);

  const VERB = element.classList[1];
  const isChallenger1 = element.classList.contains('challenger1');
  const userAttempts = getVerbKey(`${VERB}_attempts`);
  let noOfFiles = null;

  function mergeData(eventData = {}) { return { ...eventData, noOfFiles }; }

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
  if (text) text.classList.add('text');
  const authoredSvg = getAuthoredSvgInfo(foreground, headline);
  const media = foreground.querySelector(':scope > div:not([class])');
  if (media) processMedia(media);

  const header = createTag('div', { class: 'vm2-header' });
  if (authoredSvg) {
    header.append(createTag('img', { src: authoredSvg.url, alt: authoredSvg.altText, class: 'vm2-title-svg' }));
  } else {
    const iconWrapper = createTag('div', { class: 'vm2-acrobat-icon' });
    const widgetIconSvg = createSvgElement('WIDGET_ICON');
    if (widgetIconSvg) {
      widgetIconSvg.classList.add('icon-acrobat');
      widgetIconSvg.setAttribute('aria-hidden', 'true');
      iconWrapper.appendChild(widgetIconSvg);
    }
    const title = createTag('div', { class: 'vm2-title' });
    title.append(createTag('span', {}, 'Adobe'));
    title.append(createTag('span', {}, ' Acrobat'));
    header.append(iconWrapper, title);
  }

  const headingEl = createTag('h1', { class: 'vm2-heading' }, heading);

  const subtitleText = window.mph?.[`verb-redesign-test-${VERB}-subtitle`]
    || window.mph?.['verb-redesign-test-subtitle']
    || DEFAULTS.subtitle[VERB]
    || '';
  const subtitleEl = subtitleText ? createTag('p', { class: 'vm2-subtitle' }, subtitleText) : null;

  const dropzone = createTag('div', { class: 'vm2-dropzone', id: 'drop-zone' });

  let mediaWrapper = null;
  if (media) {
    mediaWrapper = createTag('div', { class: 'vm2-dropzone-media' });
    while (media.firstChild) mediaWrapper.appendChild(media.firstChild);
    if (!isChallenger1) dropzone.appendChild(mediaWrapper);
  }

  const ctaButtonLabel = window.mph?.[`verb-redesign-test-${VERB}-upload-cta`]
    || window.mph?.['verb-redesign-test-cta']
    || DEFAULTS.cta;
  const ctaButton = createTag('button', {
    class: 'vm2-cta',
    type: 'button',
    ...(ctaButtonLabel && { 'aria-label': ctaButtonLabel }),
  });
  const uploadIconSvg = createSvgElement('UPLOAD_ICON');
  if (uploadIconSvg) {
    uploadIconSvg.classList.add('upload-icon');
    uploadIconSvg.setAttribute('aria-hidden', 'true');
    ctaButton.appendChild(uploadIconSvg);
  }
  ctaButton.appendChild(createTag('span', { class: 'vm2-cta-label' }, ctaButtonLabel));

  const dragText = createTag('p', { class: 'vm2-drag' }, window.mph?.[`verb-redesign-test-${VERB}-dragndrop-text`] || DEFAULTS.dragText[VERB] || '');
  const fileLimitText = createTag('p', {
    class: 'vm2-file-limit',
    id: 'file-upload-description',
  }, window.mph?.[`verb-redesign-test-${VERB}-file-limit`] || DEFAULTS.fileLimit[VERB] || '');

  dropzone.append(ctaButton, dragText, fileLimitText);

  const fileInput = createTag('input', {
    type: 'file',
    accept: LIMITS[VERB]?.acceptedFiles,
    id: 'file-upload',
    class: 'hide',
    'aria-hidden': 'true',
    'aria-describedby': 'file-upload-description',
    multiple: '',
  });

  const errorState = createTag('div', {
    class: 'error hide',
    role: 'alert',
    'aria-live': 'assertive',
    'aria-atomic': 'true',
  });
  const errorStateText = createTag('p', { class: 'vm2-error-text', id: 'error-message' });
  const errorIcon = createTag('div', { class: 'vm2-error-icon', 'aria-hidden': 'true' });
  const errorCloseBtn = createTag('div', { class: 'vm2-error-btn', role: 'button', tabindex: '0', 'aria-label': 'Close error' });
  const srAlert = { announceTimer: null, cleanupTimer: null };
  const clearSrAlert = () => {
    clearTimeout(srAlert.announceTimer);
    clearTimeout(srAlert.cleanupTimer);
    document.querySelector('.vm2-sr-alert')?.remove();
  };
  const announceToScreenReader = (msg) => {
    clearSrAlert();
    srAlert.announceTimer = setTimeout(() => {
      const alertEl = createTag('div', {
        class: 'vm2-sr-alert',
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

  const footer = createTag('div', { class: 'vm2-footer' });
  const { locale } = getConfig();
  const ppURL = window.mph?.['verb-widget-privacy-policy-url'] || `https://www.adobe.com${locale.prefix}/privacy/policy.html`;
  const touURL = window.mph?.['verb-widget-terms-of-use-url'] || `https://www.adobe.com${locale.prefix}/legal/terms.html`;
  const mph = window.mph || {};
  const legalPart1 = mph['verb-redesign-test-legal'] || '';
  const legalPart2 = mph['verb-redesign-test-legal-2'] || '';
  const legalCombined = [legalPart1, legalPart2].filter(Boolean).join(' ').trim();
  const legalInitial = legalCombined || mph['verb-redesign-test-legal-text'] || '';
  const legalText = createTag('p', { class: 'vm2-legal' }, legalInitial);

  if (legalText.textContent) {
    const createLegalLink = (label, url) => `<a class="vm2-legal-url" target="_blank" href="${url}">${label}</a>`;
    [['verb-widget-terms-of-use', touURL], ['verb-widget-privacy-policy', ppURL]].forEach(([key, url]) => {
      const linkText = window.mph?.[key];
      if (linkText) {
        legalText.innerHTML = legalText.innerHTML.replace(linkText, createLegalLink(linkText, url));
      }
    });
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
  infoIcon.appendChild(createTag('span', { id: 'info-tooltip-text', class: 'hide' }, tooltipContent));
  footer.append(legalText, infoIcon);

  const benefitsRow = buildBenefitsRow(VERB);
  const container = createTag('div', { class: 'vm2-container' });

  if (isChallenger1) {
    const textBottom = createTag('div', { class: 'vm2-text-bottom' });
    while (dropzone.firstChild) textBottom.appendChild(dropzone.firstChild);
    const textTop = createTag('div', { class: 'vm2-text-top' });
    textTop.append(header, headingEl, ...(subtitleEl ? [subtitleEl] : []));
    const textCol = createTag('div', { class: 'vm2-text-col' });
    textCol.append(textTop, textBottom);
    dropzone.append(textCol);
    if (mediaWrapper) dropzone.append(mediaWrapper);
    container.append(dropzone, fileInput, ...(benefitsRow ? [benefitsRow] : []), footer);
  } else {
    container.append(
      header,
      headingEl,
      ...(subtitleEl ? [subtitleEl] : []),
      dropzone,
      fileInput,
      ...(benefitsRow ? [benefitsRow] : []),
      footer,
    );
  }

  foreground.innerHTML = '';
  foreground.append(container);
  element.append(errorState);

  function handleAnalyticsEvent(
    eventName,
    metadata = {},
    documentUnloading = true,
    canSendDataToSplunk = true,
  ) {
    trackAnalyticsEvent(
      VERB,
      eventName,
      metadata,
      documentUnloading,
      canSendDataToSplunk,
      getHostEnv(),
    );
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
    errorState.classList.remove('vm2-error-active');
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
      errorState.classList.add('vm2-error-active');
      errorState.classList.remove('hide');
      errorStateText.textContent = message;
      announceToScreenReader(message);
      errorCloseBtn.focus();
      setTimeout(() => {
        if (outsideClickHandler) return;
        outsideClickHandler = (e) => { if (!errorState.contains(e.target)) closeError(); };
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

  let soloClicked = false;
  ctaButton.addEventListener('click', () => { fileInput.click(); });
  dropzone.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    if (e.target.classList.value.includes('error') || e.target.closest('.error')) return;
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
    if (files.length > 0) noOfFiles = files.length;
  });
  fileInput.addEventListener('click', () => {
    if (soloClicked) { soloClicked = false; return; }
    FILE_PICKER_EVENTS
      .forEach((analyticsEvent) => {
        window.analytics.verbAnalytics(analyticsEvent, VERB, { userAttempts });
      });
  });
  fileInput.addEventListener('change', ({ target: { files } }) => {
    if (!files) return;
    noOfFiles = files.length;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  fileInput.addEventListener('cancel', () => {
    window.analytics.verbAnalytics('choose-file:close', VERB, { userAttempts });
  });

  errorCloseBtn.addEventListener('click', (e) => { e.stopPropagation(); closeError(); });
  errorCloseBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeError(); }
  });

  function soloUpload() {
    document.querySelectorAll('a[href*="#upload"]').forEach((link) => {
      const labelElement = createTag('label', {
        for: 'file-upload',
        class: 'vm2-cta vm2-cta-solo',
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
        SOLO_PICKER_EVENTS
          .forEach((analyticsEvent) => {
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
        FILES_DROPPED_EVENTS.forEach((evt) => {
          handleAnalyticsEvent(evt, metadata, true, canSendDataToSplunk);
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
        if (canSendDataToSplunk) {
          window.analytics.sendAnalyticsToSplunk('job:chunk-uploaded', VERB, metadata, getSplunkUrl());
        }
      },
      redirectUrl: () => {
        if (data) initiatePrefetch(data.redirectUrl);
        if (isUploading) prefetchTarget();
        handleAnalyticsEvent('job:redirect-success', metadata, false, canSendDataToSplunk);
      },
    };
    if (analyticsMap[event]) analyticsMap[event]();
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
        getSplunkUrl(),
      );
    }
    exitFlag = true;
  });

  window.addEventListener('beforeunload', (event) => {
    if (exitFlag || tabClosureSent || !isUploading) return;
    tabClosureSent = true;
    const uploadingUTS = parseInt(getCookie('UTS_Uploading'), 10);
    const duration = uploadingUTS ? ((Date.now() - uploadingUTS) / 1000).toFixed(1) : 'N/A';
    window.analytics.verbAnalytics('job:browser-tab-closure', VERB, { userAttempts }, exitFlag);
    window.analytics.sendAnalyticsToSplunk('job:browser-tab-closure', VERB, { userAttempts, uploadTime: duration }, getSplunkUrl(), true);
    if (!isUploading) return;
    event.preventDefault();
    event.returnValue = true;
  });

  window.addEventListener('beforeunload', () => {
    const cookieExp = new Date(Date.now() + 90 * 1000).toUTCString();
    if (exitFlag) document.cookie = `UTS_Redirect=${Date.now()};domain=.adobe.com;path=/;expires=${cookieExp}`;
  });

  const { cookie } = document;
  const limitCookie = exhLimitCookieMap[VERB.match(/to-pdf$/)?.[0]];
  const cookiePrefix = appEnvCookieMap[DC_ENV] || '';
  const isLimitExhausted = limitCookie && cookie.includes(`${cookiePrefix}${limitCookie}`);

  if (!window.adobeIMS?.isSignedInUser?.() && isLimitExhausted) {
    if (fileInput?.isConnected) fileInput.remove();
    const { codeRoot = '/acrobat' } = getConfig() || {};
    loadStyle(`${codeRoot}/blocks/verb-widget/verb-widget.css`);
    const headingForWidget = heading || window.mph?.[`verb-widget-${VERB}-title`] || ' ';
    const widgetRoot = createTag('div', { class: `verb-widget ${VERB}` });
    widgetRoot.dataset.dcInjectedFromMarquee = 'true';
    widgetRoot.append(createTag('div', {}, headingForWidget));
    element.append(widgetRoot);
    try {
      const { default: initVerbWidget } = await import('../verb-widget/verb-widget.js');
      await initVerbWidget(widgetRoot);
    } catch (error) {
      window.lana?.log(
        `Error Code: Unknown, Status: 'Unknown', Message: verb-widget init from verb-redesign-test failed: ${error.message}`,
        logger.options,
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
    if (accountType) window.location.href = hostRedDirLink(VERB);
  }
  await checkSignedInUser();
  window.addEventListener('IMS:Ready', checkSignedInUser);
  window.prefetchTargetUrl = null;

  if (VERB === 'word-to-pdf') {
    const triggerEarlyPrefetch = () => {
      initiatePrefetch(buildEarlyPrefetchUrl('word-to-pdf'));
      prefetchTarget();
    };
    document.addEventListener('click', triggerEarlyPrefetch, { once: true });
    document.addEventListener('dragover', triggerEarlyPrefetch, { once: true });
  }

  element.parentNode.style.display = 'block';

  // eslint-disable-next-line compat/compat
  requestAnimationFrame(() => requestAnimationFrame(() => prerenderElement?.remove()));

  reloadOnHistoryTraversal();
}
