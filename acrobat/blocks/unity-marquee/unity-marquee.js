import { setLibs, isOldBrowser, loadPlaceholders } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');
let createTag;
let getConfig;
let decorateBlockBg;

const EOLBrowserPage = 'https://acrobat.adobe.com/home/index-browser-eol.html';

const lanaOptions = {
  sampleRate: 1,
  tags: 'DC_Milo,Project Unity (DC)',
  severity: 'error',
};

const ICONS = {
  WIDGET_ICON: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="31" viewBox="0 0 32 31" fill="none"><path d="M25.8211 0H5.67886C2.54251 0 0 2.45484 0 5.48304V24.9308C0 27.959 2.54251 30.4138 5.67886 30.4138H25.8211C28.9575 30.4138 31.5 27.959 31.5 24.9308V5.48304C31.5 2.45484 28.9575 0 25.8211 0Z" fill="#B30B00"/><path d="M25.7023 17.5726C24.1856 16.0519 20.044 16.6714 19.0523 16.784C17.594 15.4323 16.6023 13.799 16.2523 13.2358C16.7773 11.7151 17.1273 10.1944 17.1856 8.56106C17.1856 7.15301 16.6023 5.63232 14.969 5.63232C14.3856 5.63232 13.8606 5.97026 13.569 6.42083C12.869 7.60359 13.1606 9.96911 14.269 12.3909C13.6273 14.1369 13.044 15.8266 11.4106 18.8116C9.71898 19.4875 6.16064 21.0645 5.86898 22.7542C5.75231 23.2611 5.92731 23.768 6.33564 24.1622C6.74398 24.5001 7.26898 24.6691 7.79398 24.6691C9.95231 24.6691 12.0523 21.7967 13.5106 19.3749C14.7356 18.9806 16.6606 18.4174 18.5856 18.0795C20.8606 19.9944 22.844 20.276 23.894 20.276C25.294 20.276 25.819 19.7128 25.994 19.2059C26.2856 18.6427 26.1106 18.0231 25.7023 17.5726ZM24.244 18.53C24.1856 18.9243 23.6606 19.3185 22.7273 19.0932C21.619 18.8116 20.6273 18.3047 19.7523 17.6289C20.5106 17.5162 22.2023 17.3473 23.4273 17.5726C23.894 17.6852 24.3606 17.9668 24.244 18.53ZM14.5023 6.92773C14.619 6.75876 14.794 6.64612 14.969 6.64612C15.494 6.64612 15.6106 7.26566 15.6106 7.77255C15.5523 8.95531 15.319 10.1381 14.9106 11.2645C14.0356 9.01164 14.2106 7.43462 14.5023 6.92773ZM14.3856 17.8542C14.8523 16.953 15.494 15.376 15.7273 14.7001C16.2523 15.545 17.1273 16.5588 17.594 17.0093C17.594 17.0657 15.7856 17.4036 14.3856 17.8542ZM10.944 20.107C9.60231 22.2473 8.20231 23.599 7.44398 23.599C7.32731 23.599 7.21064 23.5427 7.09398 23.4864C6.91898 23.3737 6.86064 23.2047 6.91898 22.9795C7.09398 22.1909 8.61064 21.1208 10.944 20.107Z" fill="white"/></svg>',
  INFO_ICON: '<svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.8"><path d="M9.00078 7.0748C9.59449 7.0748 10.0758 6.59351 10.0758 5.9998C10.0758 5.4061 9.59449 4.9248 9.00078 4.9248C8.40707 4.9248 7.92578 5.4061 7.92578 5.9998C7.92578 6.59351 8.40707 7.0748 9.00078 7.0748Z" fill="#222222"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.167 12H10V8.2C10 8.14696 9.97893 8.09609 9.94142 8.05858C9.90391 8.02107 9.85304 8 9.8 8H7.833C7.833 8 7.25 8.016 7.25 8.5C7.25 8.984 7.833 9 7.833 9H8V12H7.833C7.833 12 7.25 12.016 7.25 12.5C7.25 12.984 7.833 13 7.833 13H10.167C10.167 13 10.75 12.984 10.75 12.5C10.75 12.016 10.167 12 10.167 12Z" fill="#222222"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9.00078 1.0498C7.42842 1.0498 5.89137 1.51606 4.584 2.38962C3.27663 3.26318 2.25766 4.5048 1.65594 5.95747C1.05423 7.41014 0.896789 9.00862 1.20354 10.5508C1.51029 12.0929 2.26746 13.5095 3.37929 14.6213C4.49111 15.7331 5.90767 16.4903 7.44982 16.797C8.99197 17.1038 10.5904 16.9464 12.0431 16.3446C13.4958 15.7429 14.7374 14.724 15.611 13.4166C16.4845 12.1092 16.9508 10.5722 16.9508 8.9998C16.9508 6.89133 16.1132 4.86922 14.6223 3.37831C13.1314 1.88739 11.1093 1.0498 9.00078 1.0498ZM9.00078 15.9558C7.62502 15.9558 6.28015 15.5478 5.13624 14.7835C3.99233 14.0192 3.10076 12.9328 2.57428 11.6618C2.0478 10.3907 1.91004 8.99209 2.17844 7.64276C2.44684 6.29342 3.10934 5.05398 4.08215 4.08117C5.05496 3.10836 6.2944 2.44586 7.64374 2.17746C8.99307 1.90906 10.3917 2.04682 11.6627 2.5733C12.9338 3.09978 14.0202 3.99135 14.7845 5.13526C15.5488 6.27917 15.9568 7.62404 15.9568 8.9998C15.9568 10.8447 15.2239 12.6139 13.9194 13.9184C12.6149 15.2229 10.8456 15.9558 9.00078 15.9558Z" fill="#222222"/></g></svg>',
};

const GENAI_VERBS = new Set(['quiz-maker', 'flashcard-maker', 'mindmap-maker']);

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

function getVerbKey(verbKey) {
  const count = parseInt(localStorage.getItem(verbKey), 10) || 0;
  const trialMapping = {
    0: '1st',
    1: '2nd',
  };
  return trialMapping[count] || '2+';
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
      'Analytics failed to initialize correctly: some methods remain no-ops on unity-marquee block',
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

  const prerenderElement = document.querySelector('#prerender_verb-widget');
  if (prerenderElement && window.PerformanceObserver) {
    Promise.race([
      new Promise((resolve) => {
        try {
          const lcpObserver = new PerformanceObserver((entries) => {
            if (entries.getEntries().length > 0) {
              prerenderElement.remove();
              lcpObserver.disconnect();
              resolve();
            }
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (error) {
          prerenderElement.remove();
          resolve();
        }
      }),
      // Fallback timeout - remove after 3 seconds if LCP not detected
      new Promise((resolve) => {
        setTimeout(() => {
          prerenderElement.remove();
          resolve();
        }, 3000);
      }),
    ]);
  } else if (prerenderElement) {
    // Fallback for browsers without PerformanceObserver support
    setTimeout(() => {
      prerenderElement.remove();
    }, 3000);
  }

  window.mph = window.mph || {};
  const VERB = element.classList[1];
  // Initialize analytics - track attempts for analytics data (no UI changes based on attempts)
  const userAttempts = getVerbKey(`${VERB}_attempts`);

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
  const widgetIconSvg = createSvgElement('WIDGET_ICON');
  if (widgetIconSvg) {
    widgetIconSvg.classList.add('icon-acrobat');
    widgetIconSvg.setAttribute('aria-hidden', 'true');
    iconWrapper.appendChild(widgetIconSvg);
  }
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
