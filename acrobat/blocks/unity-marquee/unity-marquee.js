import { setLibs, loadPlaceholders } from '../../scripts/utils.js';
import {
  loadMiloUtils,
  createLogger,
  ICONS,
  redirectOldBrowser,
  onDocumentReady,
  getVerbKey,
  registerAnalyticsLoader,
  parseSvg,
  reloadOnHistoryTraversal,
  initializePingService,
} from '../../scripts/verbWidgetUtils.js';
import { getHostEnv, hostRedDirLink, processMedia } from '../../scripts/verbMarqueeUtils.js';

const miloLibs = setLibs('/libs');
let createTag;
let getConfig;
let decorateBlockBg;

const logger = createLogger('unity-marquee');

const WIDGET_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="31" viewBox="0 0 32 31" fill="none"><path d="M25.8211 0H5.67886C2.54251 0 0 2.45484 0 5.48304V24.9308C0 27.959 2.54251 30.4138 5.67886 30.4138H25.8211C28.9575 30.4138 31.5 27.959 31.5 24.9308V5.48304C31.5 2.45484 28.9575 0 25.8211 0Z" fill="#B30B00"/><path d="M25.7023 17.5726C24.1856 16.0519 20.044 16.6714 19.0523 16.784C17.594 15.4323 16.6023 13.799 16.2523 13.2358C16.7773 11.7151 17.1273 10.1944 17.1856 8.56106C17.1856 7.15301 16.6023 5.63232 14.969 5.63232C14.3856 5.63232 13.8606 5.97026 13.569 6.42083C12.869 7.60359 13.1606 9.96911 14.269 12.3909C13.6273 14.1369 13.044 15.8266 11.4106 18.8116C9.71898 19.4875 6.16064 21.0645 5.86898 22.7542C5.75231 23.2611 5.92731 23.768 6.33564 24.1622C6.74398 24.5001 7.26898 24.6691 7.79398 24.6691C9.95231 24.6691 12.0523 21.7967 13.5106 19.3749C14.7356 18.9806 16.6606 18.4174 18.5856 18.0795C20.8606 19.9944 22.844 20.276 23.894 20.276C25.294 20.276 25.819 19.7128 25.994 19.2059C26.2856 18.6427 26.1106 18.0231 25.7023 17.5726ZM24.244 18.53C24.1856 18.9243 23.6606 19.3185 22.7273 19.0932C21.619 18.8116 20.6273 18.3047 19.7523 17.6289C20.5106 17.5162 22.2023 17.3473 23.4273 17.5726C23.894 17.6852 24.3606 17.9668 24.244 18.53ZM14.5023 6.92773C14.619 6.75876 14.794 6.64612 14.969 6.64612C15.494 6.64612 15.6106 7.26566 15.6106 7.77255C15.5523 8.95531 15.319 10.1381 14.9106 11.2645C14.0356 9.01164 14.2106 7.43462 14.5023 6.92773ZM14.3856 17.8542C14.8523 16.953 15.494 15.376 15.7273 14.7001C16.2523 15.545 17.1273 16.5588 17.594 17.0093C17.594 17.0657 15.7856 17.4036 14.3856 17.8542ZM10.944 20.107C9.60231 22.2473 8.20231 23.599 7.44398 23.599C7.32731 23.599 7.21064 23.5427 7.09398 23.4864C6.91898 23.3737 6.86064 23.2047 6.91898 22.9795C7.09398 22.1909 8.61064 21.1208 10.944 20.107Z" fill="white"/></svg>';

const GENAI_VERBS = new Set(['quiz-maker', 'flashcard-maker', 'mindmap-maker']);

const MAX_PRERENDER_FRAMES = 600;

registerAnalyticsLoader(logger);

function isBlockVisible(element) {
  const { width, height } = element.getBoundingClientRect();
  if (!width || !height) return false;
  let current = element;
  while (current) {
    const { display, visibility, opacity } = window.getComputedStyle(current);
    if (display === 'none' || visibility === 'hidden' || visibility === 'collapse' || opacity === '0') {
      return false;
    }
    current = current.parentElement;
  }
  return true;
}

export default async function init(element) {
  ({ createTag, getConfig } = (await loadMiloUtils()));
  ({ decorateBlockBg } = (await import(`${miloLibs}/utils/decorate.js`)));

  element.classList.add('con-block');
  if (redirectOldBrowser()) return;

  const prerenderElement = document.querySelector('#prerender_verb-widget');
  let prerenderFrames = 0;
  const removePrerender = () => {
    if (!prerenderElement?.isConnected || !element.isConnected) return;
    if (isBlockVisible(element)) {
      prerenderElement.remove();
    } else if (prerenderFrames < MAX_PRERENDER_FRAMES) {
      prerenderFrames += 1;
      /* eslint-disable-next-line compat/compat -- Opera Mini not a target */
      requestAnimationFrame(removePrerender);
    } else {
      logger.error(`Error Code: Unknown, Status: 'Unknown', Message: unity-marquee never became visible; prerender retained on ${element.classList[1]}`);
    }
  };

  window.mph = window.mph || {};
  const VERB = element.classList[1];
  // Initialize analytics - track attempts for analytics data (no UI changes based on attempts)
  const userAttempts = getVerbKey(`${VERB}_attempts`);

  onDocumentReady(() => {
    initializePingService(logger, getHostEnv());
    window.dispatchEvent(new CustomEvent('analyticsLoad', { detail: { verb: VERB, userAttempts } }));
  });
  const children = [...element.querySelectorAll(':scope > div')];
  const LABEL_PREFIX = 'dc-block-row-';
  const authored = new Map();
  const contentRows = [];
  children.forEach((rowEl) => {
    const label = rowEl.firstElementChild?.textContent?.trim() || '';
    if (label.startsWith(LABEL_PREFIX)) {
      authored.set(label.slice(LABEL_PREFIX.length), rowEl.children[1] || null);
      rowEl.remove();
    } else {
      contentRows.push(rowEl);
    }
  });
  const foreground = contentRows.find((r) => r.querySelector('h1, h2, h3, h4, h5, h6'))
    || contentRows[contentRows.length - 1];
  foreground.classList.add('foreground', 'container');
  const background = contentRows.find((r) => r !== foreground && r.textContent.trim() !== '');
  if (background) {
    background.classList.add('background');
    decorateBlockBg(element, background, { useHandleFocalpoint: true });
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

  const cellText = (key) => authored.get(key)?.textContent?.trim() || '';
  const cellHTML = (key) => authored.get(key)?.innerHTML?.trim() || '';
  const isMobileOrTablet = window.innerWidth < 1200;
  const authoredCopy = isMobileOrTablet
    ? (cellText('mobile-copy') || cellText('desktop-copy'))
    : cellText('desktop-copy');
  const authoredSubCopy = isMobileOrTablet
    ? (cellText('mobile-sub-copy') || cellText('desktop-sub-copy'))
    : cellText('desktop-sub-copy');
  const authoredLegal = cellHTML('legal');
  const authoredTooltip = cellText('tooltip');
  if (!authoredCopy || !authoredLegal || !authoredTooltip) {
    await loadPlaceholders(['study', 'verb-widget']);
  }
  const copy1Text = authoredCopy || (isMobileOrTablet
    ? (window.mph[`study-marquee-${VERB}-mobile-copy`] || window.mph[`study-marquee-${VERB}-copy`])
    : window.mph[`study-marquee-${VERB}-copy`]) || '';
  const copy2Text = authoredSubCopy || '';

  const container = createTag('div', { class: 'unity-marquee-container' });
  const row = createTag('div', { class: 'unity-marquee-row' });
  const leftCol = createTag('div', { class: 'unity-marquee-col unity-marquee-col-left' });
  const rightCol = createTag('div', { class: 'unity-marquee-col unity-marquee-col-right' });
  const header = createTag('div', { class: 'unity-marquee-header' });
  const iconWrapper = createTag('div', { class: 'acrobat-icon' });
  const widgetIconSvg = parseSvg(WIDGET_ICON);
  widgetIconSvg.classList.add('icon-acrobat');
  widgetIconSvg.setAttribute('aria-hidden', 'true');
  iconWrapper.appendChild(widgetIconSvg);
  const authoredTitle = cellText('title') || 'Adobe Acrobat';
  const title = createTag('div', { class: 'unity-marquee-title' }, authoredTitle);
  header.append(iconWrapper, title);
  const headingEl = createTag('h1', { class: 'unity-marquee-heading' }, heading);
  const copy1 = createTag('p', { class: 'unity-marquee-copy' }, copy1Text);
  const copy2 = createTag('p', { class: 'unity-marquee-copy unity-marquee-copy-sub' }, copy2Text);
  const footer = createTag('div', { class: 'unity-marquee-footer' });
  const legalText = createTag('p', { class: 'unity-marquee-legal' });
  if (authoredLegal) {
    // Authored legal keeps its own markup (e.g. links) as-is.
    legalText.innerHTML = authoredLegal;
  } else {
    const { locale } = getConfig();
    const ppURL = window.mph['verb-widget-privacy-policy-url'] || `https://www.adobe.com${locale.prefix}/privacy/policy.html`;
    const touURL = window.mph['verb-widget-terms-of-use-url'] || `https://www.adobe.com${locale.prefix}/legal/terms.html`;
    const genAIurl = window.mph['verb-widget-genai-terms-url'] || `https://www.adobe.com${locale.prefix}/legal/licenses-terms/adobe-gen-ai-user-guidelines.html`;
    const legalPlaceholder = window.mph['study-marquee-legal-text'] || '';
    if (legalPlaceholder) {
      const createLegalLink = (label, url) => `<a class="unity-marquee-legal-url" target="_blank" href="${url}">${label}</a>`;
      const legalLinks = [
        ['verb-widget-terms-of-use', touURL],
        ['verb-widget-privacy-policy', ppURL],
        ...(GENAI_VERBS.has(VERB) ? [['verb-widget-genai-guidelines', genAIurl]] : []),
      ];
      legalText.innerHTML = legalLinks.reduce(
        (html, [key, url]) => {
          const linkText = window.mph[key];
          return linkText ? html.replace(linkText, createLegalLink(linkText, url)) : html;
        },
        legalPlaceholder,
      );
    }
  }
  const tooltipContent = authoredTooltip || window.mph['verb-widget-tool-tip'] || '';
  const infoIcon = createTag('button', {
    class: 'info-icon milo-tooltip top',
    type: 'button',
    ...(tooltipContent && { 'aria-label': tooltipContent }),
    'aria-describedby': 'info-tooltip-text',
    ...(tooltipContent && { 'data-tooltip': tooltipContent }),
  });
  const infoIconSvg = parseSvg(ICONS.INFO_ICON);
  infoIconSvg.setAttribute('aria-hidden', 'true');
  infoIcon.appendChild(infoIconSvg);
  const tooltipText = createTag('span', {
    id: 'info-tooltip-text',
    class: 'hide',
  }, tooltipContent);
  infoIcon.appendChild(tooltipText);
  footer.append(legalText, infoIcon);
  const leftColChildren = [
    header, headingEl, copy1, ...(copy2Text ? [copy2] : []), footer,
  ];
  leftCol.append(...leftColChildren);
  if (media) {
    const mediaWrapper = createTag('div', { class: 'unity-marquee-media' });
    while (media.firstChild) {
      mediaWrapper.appendChild(media.firstChild);
    }
    rightCol.appendChild(mediaWrapper);
  }
  row.append(leftCol, rightCol);
  container.appendChild(row);
  foreground.innerHTML = '';
  foreground.append(container);
  /* eslint-disable-next-line compat/compat -- Opera Mini not a target */
  requestAnimationFrame(() => requestAnimationFrame(removePrerender));

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
  reloadOnHistoryTraversal();
}
