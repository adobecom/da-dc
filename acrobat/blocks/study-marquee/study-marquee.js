import { setLibs, loadPlaceholders } from '../../scripts/utils.js';
import {
  createLogger,
  ICONS,
  FILE_PICKER_EVENTS,
  FILES_DROPPED_EVENTS,
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
  redirectOldBrowser,
  onDocumentReady,
  reloadOnHistoryTraversal,
  trackAnalyticsEvent,
  registerAnalyticsLoader,
  parseSvg,
  initializePingService,
} from '../../scripts/verbWidgetUtils.js';
import { getHostEnv, hostRedDirLink, processMedia } from '../../scripts/verbMarqueeUtils.js';
import {
  MB100,
  groupLimits,
} from '../../scripts/uploadLimits.js';

const miloLibs = setLibs('/libs');
let createTag;
let getConfig;
let decorateBlockBg;

const logger = createLogger('study-marquee');

const STUDY_MARQUEE_ICONS = {
  ...ICONS,
  WIDGET_ICON: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="31" viewBox="0 0 32 31" fill="none"><path d="M25.8211 0H5.67886C2.54251 0 0 2.45484 0 5.48304V24.9308C0 27.959 2.54251 30.4138 5.67886 30.4138H25.8211C28.9575 30.4138 31.5 27.959 31.5 24.9308V5.48304C31.5 2.45484 28.9575 0 25.8211 0Z" fill="#B30B00"/><path d="M25.7023 17.5726C24.1856 16.0519 20.044 16.6714 19.0523 16.784C17.594 15.4323 16.6023 13.799 16.2523 13.2358C16.7773 11.7151 17.1273 10.1944 17.1856 8.56106C17.1856 7.15301 16.6023 5.63232 14.969 5.63232C14.3856 5.63232 13.8606 5.97026 13.569 6.42083C12.869 7.60359 13.1606 9.96911 14.269 12.3909C13.6273 14.1369 13.044 15.8266 11.4106 18.8116C9.71898 19.4875 6.16064 21.0645 5.86898 22.7542C5.75231 23.2611 5.92731 23.768 6.33564 24.1622C6.74398 24.5001 7.26898 24.6691 7.79398 24.6691C9.95231 24.6691 12.0523 21.7967 13.5106 19.3749C14.7356 18.9806 16.6606 18.4174 18.5856 18.0795C20.8606 19.9944 22.844 20.276 23.894 20.276C25.294 20.276 25.819 19.7128 25.994 19.2059C26.2856 18.6427 26.1106 18.0231 25.7023 17.5726ZM24.244 18.53C24.1856 18.9243 23.6606 19.3185 22.7273 19.0932C21.619 18.8116 20.6273 18.3047 19.7523 17.6289C20.5106 17.5162 22.2023 17.3473 23.4273 17.5726C23.894 17.6852 24.3606 17.9668 24.244 18.53ZM14.5023 6.92773C14.619 6.75876 14.794 6.64612 14.969 6.64612C15.494 6.64612 15.6106 7.26566 15.6106 7.77255C15.5523 8.95531 15.319 10.1381 14.9106 11.2645C14.0356 9.01164 14.2106 7.43462 14.5023 6.92773ZM14.3856 17.8542C14.8523 16.953 15.494 15.376 15.7273 14.7001C16.2523 15.545 17.1273 16.5588 17.594 17.0093C17.594 17.0657 15.7856 17.4036 14.3856 17.8542ZM10.944 20.107C9.60231 22.2473 8.20231 23.599 7.44398 23.599C7.32731 23.599 7.21064 23.5427 7.09398 23.4864C6.91898 23.3737 6.86064 23.2047 6.91898 22.9795C7.09398 22.1909 8.61064 21.1208 10.944 20.107Z" fill="white"/></svg>',
};

const STUDY_FILES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.rtf', '.txt', '.text', '.vtt'];
const STUDY_FILES_EXTENDED = [...STUDY_FILES, '.eml', '.msg', '.jpg', '.jpeg', '.png', '.tif', '.tiff'];
const STUDY_GENAI = {
  maxFileSize: MB100,
  acceptedFiles: STUDY_FILES,
  maxNumFiles: 100,
  multipleFiles: true,
  uploadType: 'multifile-only',
  genAI: true,
};
const STUDY_GENAI_SINGLE = {
  maxFileSize: MB100,
  acceptedFiles: STUDY_FILES_EXTENDED,
  maxNumFiles: 1,
  genAI: true,
};

const SIGNED_IN_UPLOAD_VERBS = new Set(['gen-presentation-v2', 'interactive-report', 'stylize']);

export const LIMITS = {
  ...groupLimits(['quiz-maker', 'flashcard-maker', 'mindmap-maker'], STUDY_GENAI),
  ...groupLimits(['gen-presentation-v2', 'interactive-report', 'stylize'], { ...STUDY_GENAI_SINGLE, acceptedFiles: ['.pdf'] }),
};

const getCTA = (verb) => {
  const verbConfig = LIMITS[verb];
  return window.mph?.[`study-marquee-${verb}-upload-cta`]
    || window.mph?.[`verb-widget-cta-${verbConfig?.uploadType}`]
    || window.mph?.['verb-widget-cta']
    || '';
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
  ({ createTag, getConfig } = (await import(`${miloLibs}/utils/utils.js`)));
  ({ decorateBlockBg } = (await import(`${miloLibs}/utils/decorate.js`)));

  element.classList.add('con-block');
  if (redirectOldBrowser()) return;

  const prerenderElement = document.querySelector('#prerender_verb-widget');

  window.mph = window.mph || {};
  await loadPlaceholders(['study', 'verb-widget']);
  const isAvalon = element.classList.contains('avalon');
  const VERB = element.classList[1] === 'avalon' ? element.classList[2] : element.classList[1];
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
  const LABEL_PREFIX = 'dc-block-row-';
  const authored = new Map();
  element.querySelectorAll(':scope > div').forEach((rowEl) => {
    const label = rowEl.firstElementChild?.textContent?.trim() || '';
    if (label.startsWith(LABEL_PREFIX)) {
      authored.set(label.slice(LABEL_PREFIX.length), rowEl.children[1] || null);
      rowEl.remove();
    }
  });
  const cellText = (key) => authored.get(key)?.textContent?.trim() || '';
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
  const widgetIconSvg = parseSvg(STUDY_MARQUEE_ICONS.WIDGET_ICON);
  widgetIconSvg.classList.add('icon-acrobat');
  widgetIconSvg.setAttribute('aria-hidden', 'true');
  iconWrapper.appendChild(widgetIconSvg);
  const title = createTag('div', { class: 'study-marquee-title' });
  if (cellText('title')) {
    title.textContent = cellText('title');
  } else {
    const adobeText = createTag('span', {}, 'Adobe');
    const studySpaceText = createTag('span', {}, ' Acrobat');
    title.append(adobeText, studySpaceText);
  }
  header.append(iconWrapper, title);
  const headingEl = createTag('h1', { class: 'study-marquee-heading' }, heading);
  const isMobileOrTablet = window.innerWidth < 1200;
  const copy1Text = isMobileOrTablet
    ? (cellText('mobile-copy') || window.mph?.[`study-marquee-${VERB}-mobile-copy`] || cellText('copy') || window.mph?.[`study-marquee-${VERB}-copy`] || '')
    : (cellText('copy') || window.mph?.[`study-marquee-${VERB}-copy`] || '');
  const copy2Text = isMobileOrTablet
    ? (cellText('mobile-sub-copy') || window.mph?.[`study-marquee-${VERB}-mobile-sub-copy`] || cellText('sub-copy') || window.mph?.[`study-marquee-${VERB}-sub-copy`] || '')
    : (cellText('sub-copy') || window.mph?.[`study-marquee-${VERB}-sub-copy`] || '');
  const copy1 = createTag('p', { class: 'study-marquee-copy' }, copy1Text);
  const copy2 = createTag('p', { class: 'study-marquee-copy study-marquee-copy-sub' }, copy2Text);
  const dropzone = createTag('div', {
    class: 'study-marquee-dropzone',
    id: 'drop-zone',
  });
  const ctaButtonLabel = cellText('upload-cta') || getCTA(VERB);
  const ctaButton = createTag('button', {
    class: 'study-marquee-cta',
    type: 'button',
    ...(ctaButtonLabel && { 'aria-label': ctaButtonLabel }),
  });
  const uploadIconSvg = parseSvg(STUDY_MARQUEE_ICONS.UPLOAD_ICON);
  uploadIconSvg.classList.add('upload-icon');
  uploadIconSvg.setAttribute('aria-hidden', 'true');
  ctaButton.appendChild(uploadIconSvg);
  const ctaLabel = createTag('span', { class: 'study-marquee-cta-label' }, ctaButtonLabel);
  ctaButton.appendChild(ctaLabel);
  const dragText = createTag('p', { class: 'study-marquee-drag' }, cellText('dragndrop-text') || window.mph?.[`study-widget-${VERB}-dragndrop-text`] || '');
  const fileLimitText = createTag('p', {
    class: 'study-marquee-file-limit',
    id: 'file-upload-description',
  }, cellText('file-limit') || window.mph?.[`study-widget-${VERB}-file-limit`] || '');
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
    class: 'study-marquee-error-text',
    id: 'error-message',
  });
  const errorIcon = createTag('div', {
    class: 'study-marquee-errorIcon',
    'aria-hidden': 'true',
  });
  const errorCloseBtn = createTag('div', {
    class: 'study-marquee-errorBtn',
    role: 'button',
    tabindex: '0',
    'aria-label': 'Close error',
  });
  const srAlert = { announceTimer: null, cleanupTimer: null };
  const clearSrAlert = () => {
    clearTimeout(srAlert.announceTimer);
    clearTimeout(srAlert.cleanupTimer);
    document.querySelector('.study-marquee-sr-alert')?.remove();
  };
  const announceToScreenReader = (msg) => {
    clearSrAlert();
    srAlert.announceTimer = setTimeout(() => {
      const alertEl = createTag('div', {
        class: 'study-marquee-sr-alert',
        role: 'alert',
        style: 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0',
      });
      alertEl.textContent = msg;
      document.body.appendChild(alertEl);
      srAlert.cleanupTimer = setTimeout(() => alertEl.remove(), 10000);
    }, 5000);
  };
  const closeIconSvg = parseSvg(STUDY_MARQUEE_ICONS.CLOSE_ICON);
  closeIconSvg.classList.add('close-icon', 'error');
  closeIconSvg.setAttribute('aria-hidden', 'true');
  errorCloseBtn.prepend(closeIconSvg);
  errorState.append(errorIcon, errorStateText, errorCloseBtn);
  const footer = createTag('div', { class: 'study-marquee-footer' });
  const { locale } = getConfig();
  const ppURL = window.mph?.['verb-widget-privacy-policy-url'] || `https://www.adobe.com${locale.prefix}/privacy/policy.html`;
  const touURL = window.mph?.['verb-widget-terms-of-use-url'] || `https://www.adobe.com${locale.prefix}/legal/terms.html`;
  const genAIurl = window.mph?.['verb-widget-genai-terms-url'] || `https://www.adobe.com${locale.prefix}/legal/licenses-terms/adobe-gen-ai-user-guidelines.html`;
  const authoredLegalEl = cellText('legal-text') ? authored.get('legal-text') : null;
  const legalText = createTag('p', { class: 'study-marquee-legal' });
  if (authoredLegalEl) {
    legalText.innerHTML = authoredLegalEl.innerHTML;
  } else {
    const baseLegalText = window.mph?.['study-marquee-legal-text'] || '';
    const legalTextContent = isAvalon
      ? (window.mph?.[`study-marquee-avalon-${VERB}-legal`]
        || window.mph?.['study-marquee-avalon-legal']
        || baseLegalText)
      : baseLegalText;
    legalText.textContent = legalTextContent;
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
  }
  const tooltipContent = cellText('tool-tip') || window.mph?.['verb-widget-tool-tip'] || '';
  const infoIcon = createTag('button', {
    class: 'info-icon milo-tooltip top',
    type: 'button',
    ...(tooltipContent && { 'aria-label': tooltipContent }),
    'aria-describedby': 'info-tooltip-text',
    ...(tooltipContent && { 'data-tooltip': tooltipContent }),
  });
  const infoIconSvg = parseSvg(STUDY_MARQUEE_ICONS.INFO_ICON);
  infoIconSvg.setAttribute('aria-hidden', 'true');
  infoIcon.appendChild(infoIconSvg);
  const tooltipText = createTag('span', {
    id: 'info-tooltip-text',
    class: 'hide',
  }, tooltipContent);
  infoIcon.appendChild(tooltipText);
  footer.append(legalText, infoIcon);
  dropzone.append(ctaButton, dragText, fileLimitText);
  const leftColChildren = [
    header, headingEl, copy1, ...(copy2Text ? [copy2] : []), dropzone, fileInput, footer,
  ];
  leftCol.append(...leftColChildren);
  let mediaWrapper = null;
  if (media) {
    mediaWrapper = createTag('div', { class: 'study-marquee-media' });
    while (media.firstChild) {
      mediaWrapper.appendChild(media.firstChild);
    }
    if (!isAvalon) rightCol.appendChild(mediaWrapper);
  }
  row.append(leftCol, rightCol);
  container.appendChild(row);
  foreground.innerHTML = '';
  foreground.append(container);
  if (isAvalon && mediaWrapper) element.append(mediaWrapper);
  element.append(errorState);

  const handleAnalyticsEvent = (eventName, metadata, documentUnloading, sendToSplunk) => (
    trackAnalyticsEvent(VERB, eventName, metadata, documentUnloading, sendToSplunk, getHostEnv())
  );

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
      logger.warn('Adobe Analytics done callback failed to trigger, 3 second timeout dispatched event.');
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

  let outsideClickHandler = null;
  const dismissError = () => {
    errorState.classList.remove('study-marquee-error');
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
      errorState.classList.add('study-marquee-error');
      errorState.classList.remove('hide');
      errorStateText.textContent = message;
      announceToScreenReader(message);
      errorCloseBtn.focus();
      setTimeout(() => {
        if (outsideClickHandler) return;
        outsideClickHandler = (e) => {
          if (!errorState.contains(e.target)) dismissError();
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
  errorCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissError();
  });
  errorCloseBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dismissError();
    }
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
      error_password_protected: 'error:password_protected',
      error_acroform_not_supported: 'error:acroform_not_supported',
      error_scanned_document: 'error:scanned_document',
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
    const cookieExp = new Date(Date.now() + 90 * 1000).toUTCString();
    if (exitFlag) {
      document.cookie = `UTS_Redirect=${Date.now()};domain=.adobe.com;path=/;expires=${cookieExp}`;
    }
  });

  async function checkSignedInUser() {
    if (SIGNED_IN_UPLOAD_VERBS.has(VERB)) return;
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
  element.parentNode.style.display = 'block';

  // eslint-disable-next-line compat/compat
  requestAnimationFrame(() => requestAnimationFrame(() => prerenderElement?.remove()));

  reloadOnHistoryTraversal();
}
