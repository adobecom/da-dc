/* eslint-disable compat/compat */
import { getEnv } from '../../scripts/utils.js';
import {
  bindFilePicker,
  bindUnityEvents,
  buildEarlyPrefetchUrl,
  createLogger,
  createUploadSession,
  getStoreType,
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

const logger = createLogger('verb-widget');

registerAnalyticsLoader(logger);

const demoPath = 'blob/JTdCJTIyc291cmNlJTIyJTNBJTIyY2RuJTIyJTJDJTIyZmlsZVBhdGglMjIlM0ElMjIlMkZkYy1maWxlczItZHJvcGluJTJGZGVtby1maWxlcyUyRmVuLVVTJTJGY2hhdC1wZGYtZGVtby12NCUyRmNoYXQtcGRmLWRlbW8tdjQucGRmJTIyJTJDJTIyaXRlbU5hbWUlMjIlM0ElMjJBSSUyMEFzc2lzdGFudCUyMGRlbW8lMjBmaWxlLnBkZiUyMiUyQyUyMm5hbWUlMjIlM0ElMjJjaGF0LXBkZi1kZW1vLXY0JTIyJTJDJTIyaXRlbVR5cGUlMjIlM0ElMjJhcHBsaWNhdGlvbiUyRnBkZiUyMiU3RA/?defaultRHPFeature=verb-qanda&x_api_client_id=ChatPDFTryDemoFile&x_api_client_location=chat_pdf&try-ai-demo=true&demo-mode=true&promoid=HHJ4X8CS&mv=product&mv2=acrobat-web';

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

function getPricingLink(locale) {
  const domain = getEnv() === 'prod' ? 'https://www.adobe.com' : 'https://www.stage.adobe.com';
  return `${domain}${locale.prefix}/acrobat/pricing/pricing.html`;
}

function getWidgetActions(parts, {
  verb,
  limits,
  userAttempts,
  locale,
  createTag,
}) {
  const {
    content,
    widget,
    ctaButton,
    fileInput,
    isMobileOrTablet,
  } = parts;
  const mph = window.mph || {};

  if (isMobileOrTablet && limits.level === 0) {
    widget.classList.add('trial');
    return [createTag('a', { class: 'verb-mobile-cta', href: getPricingLink(locale) }, mph['verb-widget-cta-mobile-start-trial'])];
  }

  if (isMobileOrTablet && limits.mobileApp) {
    widget.classList.add('mobile-app');
    const mobileLink = mph[`verb-widget-${verb}-${getStoreType()}`] || mph[`verb-widget-${verb}-apple`];
    const mobileButton = createTag('a', { class: 'verb-mobile-cta', href: mobileLink }, mph['verb-widget-cta-mobile']);
    mobileButton.addEventListener('click', () => {
      window.analytics.verbAnalytics('goto-app:clicked', verb, { userAttempts });
    });
    return [mobileButton];
  }

  const demoText = content.cellText('demo-cta') || mph['verb-widget-cta-demo'];
  if (isMobileOrTablet || !/chat-pdf|pdf-ai/.test(verb) || !demoText) return [ctaButton, fileInput];

  const demoHref = getDemoHref(verb, content.cell('demo-cta')?.querySelector('a[href]')?.href);
  const demoButton = createTag('a', { href: demoHref, class: 'verb-cta demo-cta', tabindex: 0 }, demoText);
  demoButton.addEventListener('click', () => {
    window.analytics.verbAnalytics('Try with a demo file', verb, { userAttempts });
  });
  return [createTag('div', { class: 'demo-button-wrapper' }, [ctaButton, demoButton]), fileInput];
}

export default async function init(element) {
  if (redirectOldBrowser()) return;
  const { createTag, getConfig } = await loadMiloUtils();
  const { locale } = getConfig();

  const VERB = element.classList[1];
  const limits = LIMITS[VERB];
  const userAttempts = getVerbKey(`${VERB}_attempts`);

  const ui = await renderVerbWidget(element, {
    verb: VERB,
    limits,
    logger,
    getActions: (parts) => getWidgetActions(parts, {
      verb: VERB,
      limits,
      userAttempts,
      locale,
      createTag,
    }),
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
  setupEarlyPrefetch(buildEarlyPrefetchUrl(VERB));
  revealWidget(element);

  bindFilePicker(ui, session);
  bindUnityEvents(element, session);
  startPageServices(element, session);
}
