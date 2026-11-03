/* eslint-disable compat/compat */
import { setLibs, isOldBrowser, getLanaErrorName } from '../../scripts/utils.js';
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
  getSplunkEndpoint,
  getVerbKey,
  handleUpSell,
  incrementVerbKey,
  initializePingService,
  isMobileDevice,
  isTabletDevice,
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

const MB25 = 26214400;
const ACCEPTED_FILES = ['.jpg', '.jpeg', '.png'];

const LIMITS = { 'image-to-pdf': { maxFileSize: MB25, acceptedFiles: ACCEPTED_FILES, multipleFiles: false } };

export const LOCALE_REDIRECT_MAP = {
  ar: 'es',
  at: 'de',
  be_fr: 'fr',
  be_nl: 'nl',
  br: 'pt',
  ca_fr: 'fr',
  ch_de: 'de',
  ch_fr: 'fr',
  ch_it: 'it',
  cl: 'es',
  co: 'es',
  cr: 'es',
  cz: 'cz',
  de: 'de',
  dk: 'dk',
  ec: 'es',
  es: 'es',
  fi: 'fi',
  fr: 'fr',
  gt: 'es',
  hk_zh: 'tw',
  id_id: 'id_id',
  in_hi: 'in_hi',
  it: 'it',
  jp: 'jp',
  kr: 'kr',
  la: 'es',
  lu_de: 'de',
  lu_fr: 'fr',
  mx: 'es',
  nl: 'nl',
  no: 'no',
  pe: 'es',
  pl: 'pl',
  pr: 'es',
  pt: 'pt',
  ro: 'ro',
  ru: 'ru',
  se: 'se',
  th_th: 'th_th',
  tr: 'tr',
  tw: 'tw',
};

const MIME_TYPES = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
};

const lanaOptions = { sampleRate: 1, tags: 'DC_Milo,Project Unity (DC),verb-widget-client-upload', severity: 'error' };

registerAnalyticsLoader('verb-widget-client-upload', lanaOptions);

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

  if (files.length > 1) {
    return {
      valid: false,
      code: 'error_only_accept_one_file',
      message: mph['verb-widget-error-only-accept-one-file'] || 'Only 1 file can be uploaded at a time.',
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

  for (const file of files) {
    if (file.size === 0) {
      return {
        valid: false,
        code: 'error_empty_file',
        message: mph['verb-widget-error-empty-file'] || 'This file is empty.',
      };
    }

    if (file.size > limits.maxFileSize) {
      return {
        valid: false,
        code: 'error_file_too_large',
        message: mph['verb-widget-error-file-too-large'] || 'This file is either too large or too complex to export.',
      };
    }

    const ext = `.${file.name.split('.').pop().toLowerCase()}`;
    if (limits.acceptedFiles && !limits.acceptedFiles.includes(ext)) {
      return {
        valid: false,
        code: 'error_unsupported_type',
        message: mph['verb-widget-error-unsupported-type'] || 'This file is in a format not supported for conversion to PDF.',
      };
    }

    const allowedMimes = MIME_TYPES[ext];
    if (file.type && allowedMimes && !allowedMimes.includes(file.type)) {
      return {
        valid: false,
        code: 'error_unsupported_type',
        message: mph['verb-widget-error-unsupported-type'] || 'This file is in a format not supported for conversion to PDF.',
      };
    }
  }

  return { valid: true };
}

function getRedirectBase(locale) {
  const domain = DC_ENV === 'prod' ? 'https://www.adobe.com' : 'https://www.stage.adobe.com';
  const redirectPrefix = LOCALE_REDIRECT_MAP[locale.prefix.slice(1)];
  return `${domain}${redirectPrefix ? `/${redirectPrefix}` : ''}/acrobat-online/image-to-pdf.html`;
}

function prefetchRedirectPage(url) {
  if (window.clientUploadPrefetchUrl) return;
  window.clientUploadPrefetchUrl = url;
  prefetchNextPage(url);
}

function prefetchTarget() {
  if (window.clientUploadPrefetchLoaded || !window.clientUploadPrefetchUrl) return;
  window.clientUploadPrefetchLoaded = true;
  prefetchInIframe(window.clientUploadPrefetchUrl);
}

export default async function init(element) {
  ({ createTag, getConfig } = await import(`${miloLibs}/utils/utils.js`));

  if (isOldBrowser()) {
    window.location.href = EOLBrowserPage;
    return;
  }

  const prerenderElement = document.querySelector('#prerender_verb-widget');
  const removePrerender = () => prerenderElement?.remove();

  const { locale } = getConfig();

  const triggerEarlyPrefetch = () => {
    prefetchRedirectPage(`${getRedirectBase(locale)}?clientConvert=true`);
    prefetchTarget();
  };
  document.addEventListener('click', triggerEarlyPrefetch, { once: true });
  document.addEventListener('dragover', triggerEarlyPrefetch, { once: true });

  const children = [...element.querySelectorAll(':scope > div')];
  const VERB = element.classList[1];
  const limits = LIMITS[VERB] ?? LIMITS['image-to-pdf'];
  const userAttempts = getVerbKey(`${VERB}_attempts`);
  const isMobile = isMobileDevice();
  const isTablet = isTabletDevice();

  const heading = children[0]?.textContent ?? '';
  let subCopy = window.mph?.[`verb-widget-${VERB}-description`] ?? '';
  let mobSubCopy = window.mph?.[`verb-widget-${VERB}-mobile-description`] ?? subCopy;
  if (children.length > 2) {
    subCopy = children[1].textContent;
    mobSubCopy = children[2].textContent;
  }
  const ctaLabel = window.mph?.['verb-widget-cta'] ?? 'Select a file';
  const authoredIcon = getAuthoredVerbIcon(element);

  children.forEach((c) => c.remove());

  const { widget, widgetLeft, widgetRight } = await createWidgetFrame();
  const { errorState, showError, hideError } = await createErrorToast(widget, lanaOptions);
  const ctaButton = await createCtaButton(ctaLabel, lanaOptions);
  const fileInput = await createFileInput(limits.acceptedFiles, limits.multipleFiles);

  widgetLeft.append(
    await createWidgetHeader(lanaOptions),
    createTag('h1', { class: 'verb-heading' }, heading),
    createTag('p', { class: 'verb-copy' }, (isMobile || isTablet) ? mobSubCopy : subCopy),
    errorState,
    ctaButton,
    fileInput,
  );
  widgetRight.append(await createVerbImage(VERB, authoredIcon, lanaOptions));
  element.append(widget, await createFooter({ logOptions: lanaOptions }));
  requestAnimationFrame(() => requestAnimationFrame(removePrerender));
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

  await handleUpSell(VERB, element, userAttempts, lanaOptions);

  await checkSignedInUser();
  window.addEventListener('IMS:Ready', checkSignedInUser);

  let exitFlag = false;
  let isUploading = false;

  const handleAnalyticsEvent = (...args) => trackAnalyticsEvent(VERB, ...args);

  function dispatchError(code, message, metadata = {}, diagnostic = '') {
    showError(message);
    window.lana?.log(
      `verb-widget-client-upload: ${VERB}; Error Code: ${code}, Message: ${message}${diagnostic ? `, Diagnostic: ${diagnostic}` : ''}`,
      lanaOptions,
    );
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

    let operation = 'file encryption and storage';
    try {
      const id = await encryptAndStore(file);
      operation = 'upload completion';

      const uploadTimestamp = Date.now();
      setCookie('UTS_Uploaded', uploadTimestamp);
      exitFlag = true;
      isUploading = false;
      incrementVerbKey(`${VERB}_attempts`);
      setUser();

      const uploadedMetadata = { ...filesData, assetId: id, uploadTime: uploadedTime() };
      handleAnalyticsEvent('job:uploaded', uploadedMetadata, false);

      const originalParams = DC_ENV === 'stage' ? `${window.location.search.slice(1)}&` : '';
      const localeParam = locale.ietf ? `&localeCode=${encodeURIComponent(locale.ietf)}` : '';
      const redirectUrl = `${getRedirectBase(locale)}?${originalParams}clientConvert=true&UTS_Uploaded=${uploadTimestamp}&redirectTime=${Date.now()}&fileId=${id}${localeParam}`;
      operation = 'redirect handoff';
      handleAnalyticsEvent('job:redirect-success', { ...filesData, redirectUrl }, false);
      window.location.href = redirectUrl;
    } catch (err) {
      isUploading = false;
      ctaButton.disabled = false;
      ctaButton.querySelector('.verb-cta-label').textContent = ctaLabel;
      dispatchError(
        'error_generic',
        window.mph?.['verb-widget-error-generic'] || 'Unable to process the request.',
        filesData,
        `${operation}; ${getLanaErrorName(err)}`,
      );
    }
  }

  fileInput.addEventListener('click', () => {
    FILE_PICKER_EVENTS.forEach((evt) => {
      window.analytics.verbAnalytics(evt, VERB, { userAttempts });
    });
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
    FILES_DROPPED_EVENTS.forEach((evt) => {
      handleAnalyticsEvent(evt, { userAttempts }, true);
    });
    const validation = validateFiles(files, VERB);
    if (!validation.valid) {
      dispatchError(validation.code, validation.message, { userAttempts });
      return;
    }
    startUpload(Array.from(files));
  });

  window.addEventListener('beforeunload', (e) => {
    if (exitFlag) setRedirectCookie();
    if (isUploading) {
      e.preventDefault();
      e.returnValue = true;
    }
  });

  reloadOnHistoryTraversal();

  onDocumentReady(() => {
    initializePingService(lanaOptions);
    window.dispatchEvent(new CustomEvent('analyticsLoad', { detail: { verb: VERB, userAttempts } }));
  });
}
