/* eslint-disable compat/compat */
import { getLanaErrorName } from '../../scripts/utils.js';
import {
  DC_ENV,
  bindFilePicker,
  createLogger,
  createUploadSession,
  getVerbKey,
  handleSignedInUser,
  handleUpSell,
  loadMiloUtils,
  redirectOldBrowser,
  registerAnalyticsLoader,
  renderVerbWidget,
  revealWidget,
  setupEarlyPrefetch,
  startPageServices,
} from '../../scripts/verbWidgetUtils.js';
import { MB25 } from '../../scripts/uploadLimits.js';

const logger = createLogger('verb-widget-client-upload');

registerAnalyticsLoader(logger);

const ACCEPTED_FILES = ['.jpg', '.jpeg', '.png'];

export const LIMITS = { 'image-to-pdf': { maxFileSize: MB25, acceptedFiles: ACCEPTED_FILES, multipleFiles: false } };

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

function getRedirectUrl(locale, uploadedAt, fileId) {
  const originalParams = DC_ENV === 'stage' ? `${window.location.search.slice(1)}&` : '';
  const localeParam = locale.ietf ? `&localeCode=${encodeURIComponent(locale.ietf)}` : '';
  return `${getRedirectBase(locale)}?${originalParams}clientConvert=true&UTS_Uploaded=${uploadedAt}&redirectTime=${Date.now()}&fileId=${fileId}${localeParam}`;
}

async function uploadFile(file, { ui, session, locale }) {
  const ctaLabel = ui.ctaButton.querySelector('.verb-cta-label');
  const defaultLabel = ctaLabel.textContent;
  const filesData = {
    userAttempts: session.userAttempts,
    size: file.size,
    type: file.type,
    count: 1,
    uploadType: 'sfu',
  };

  ui.hideError();
  session.track('uploading', filesData);
  ui.ctaButton.disabled = true;
  ctaLabel.textContent = window.mph?.['verb-widget-processing'] || 'Processing…';

  let operation = 'file encryption and storage';
  try {
    const fileId = await encryptAndStore(file);
    operation = 'upload completion';
    const uploadedAt = session.track('uploaded', { ...filesData, assetId: fileId });
    operation = 'redirect handoff';
    session.redirect(getRedirectUrl(locale, uploadedAt, fileId), filesData);
  } catch (err) {
    ui.ctaButton.disabled = false;
    ctaLabel.textContent = defaultLabel;
    session.reportError({
      code: 'error_generic',
      message: window.mph?.['verb-widget-error-generic'] || 'Unable to process the request.',
      info: `${operation}; ${getLanaErrorName(err)}`,
      metaData: filesData,
    });
  }
}

function handleFiles(files, source, context) {
  const { session } = context;
  session.track(source);
  const validation = validateFiles(files, session.verb);
  if (!validation.valid) {
    const { code, message } = validation;
    session.reportError({ code, message, metaData: { userAttempts: session.userAttempts } });
    return;
  }
  uploadFile(files[0], context);
}

export default async function init(element) {
  if (redirectOldBrowser()) return;
  const { getConfig } = await loadMiloUtils();
  const { locale } = getConfig();

  const VERB = element.classList[1];
  const limits = LIMITS[VERB] ?? LIMITS['image-to-pdf'];
  const userAttempts = getVerbKey(`${VERB}_attempts`);

  const ui = await renderVerbWidget(element, {
    verb: VERB,
    limits,
    logger,
  });
  const session = createUploadSession({
    verb: VERB,
    limits,
    userAttempts,
    widget: ui.widget,
    showError: ui.showError,
    logger,
  });

  await handleUpSell(VERB, element, userAttempts, logger);
  handleSignedInUser({ element, verb: VERB, limits, fileInput: ui.fileInput });
  setupEarlyPrefetch(`${getRedirectBase(locale)}?clientConvert=true`);
  revealWidget(element);

  bindFilePicker(ui, session, (files, source) => {
    handleFiles(files, source, { ui, session, locale });
  });
  startPageServices(element, session);
}
