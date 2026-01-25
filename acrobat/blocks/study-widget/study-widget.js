import { setLibs, isOldBrowser } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');
const { createTag } = await import(`${miloLibs}/utils/utils.js`);
const { decorateBlockBg } = await import(`${miloLibs}/utils/decorate.js`);

// Constants
const EOLBrowserPage = 'https://acrobat.adobe.com/home/index-browser-eol.html';

// Errors, Analytics & Logging
const lanaOptions = {
  sampleRate: 100,
  tags: 'DC_Milo,Project Unity (DC)',
};

// SVG Icons
const ICONS = {
  WIDGET_ICON: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0.3 24 23.4"><g id="Surfaces"><path fill="#b30b00" d="M4.25.3h15.5A4.24643,4.24643,0,0,1,24,4.55v14.9a4.24643,4.24643,0,0,1-4.25,4.25H4.25A4.24643,4.24643,0,0,1,0,19.45V4.55A4.24643,4.24643,0,0,1,4.25.3Z"/></g><g id="Outlined_Mnemonics_Logos" data-name="Outlined Mnemonics Logos"><path id="_256" data-name=" 256" fill="#fff" d="M19.3,13.85a1.78946,1.78946,0,0,0-.44031-.33547,2.83828,2.83828,0,0,0-.59969-.24078,4.79788,4.79788,0,0,0-.75719-.14516A7.94332,7.94332,0,0,0,16.59,13.08q-.27375.00375-.54891.017-.27492.01337-.54984.03672-.2747.02345-.548.05734-.273.034-.54328.07891-.1725-.16875-.33891-.345-.16617-.17625-.32484-.36-.15844-.18375-.308-.375-.1493-.19125-.28828-.39-.10875-.14625-.212-.29625-.10337-.15-.20172-.30375-.09845-.15375-.19234-.31125-.094-.1575-.18391-.31875.17625-.55125.30766-1.04813.13148-.49688.21859-.93937.08718-.4425.13047-.83063A6.52908,6.52908,0,0,0,13.05,7.03a3.675,3.675,0,0,0-.08594-.80563A2.42373,2.42373,0,0,0,12.685,5.505a1.4927,1.4927,0,0,0-.50406-.51688A1.44959,1.44959,0,0,0,11.42,4.79a1.19728,1.19728,0,0,0-.30547.04719A1.22057,1.22057,0,0,0,10.41,5.38a2.17839,2.17839,0,0,0-.25078.82187,4.69881,4.69881,0,0,0,.007,1.08813,7.85466,7.85466,0,0,0,.25641,1.26812A10.26146,10.26146,0,0,0,10.92,9.92c-.0725.2125-.14625.42312-.222.63391s-.1536.42171-.23422.63484-.16406.42844-.25109.648S10.035,12.28,9.94,12.51q-.12375.2925-.25344.58281Q9.55672,13.383,9.42,13.67q-.13688.28688-.28156.56969Q8.99359,14.52235,8.84,14.8c-.3075.1225-.70125.28937-1.12281.49156A12.99444,12.99444,0,0,0,6.4275,15.995a6.08618,6.08618,0,0,0-1.10594.86094A1.9673,1.9673,0,0,0,4.75,17.82a1.08624,1.08624,0,0,0-.01969.29219,1.10366,1.10366,0,0,0,.05719.28281,1.13932,1.13932,0,0,0,.12844.26031A1.17812,1.17812,0,0,0,5.11,18.88a1.45543,1.45543,0,0,0,.23312.17047,1.49272,1.49272,0,0,0,.25938.12078,1.5496,1.5496,0,0,0,.27812.07016A1.60815,1.60815,0,0,0,6.17,19.26a2.26684,2.26684,0,0,0,1.16953-.36984,5.403,5.403,0,0,0,1.12172-.95391,11.55912,11.55912,0,0,0,1.02609-1.30453c.32078-.46734.61766-.95422.88266-1.42172q.225-.075.45172-.14781.22664-.07266.45453-.14219.22781-.06938.45641-.13469.22851-.06515.45734-.12531.25125-.0675.49687-.12766.24562-.06022.48563-.11359.24-.05343.47437-.10047.23438-.0471.46313-.08828a7.87389,7.87389,0,0,0,1.20266.87266,6.26924,6.26924,0,0,0,1.08359.50609,5.254,5.254,0,0,0,.913.23422A4.37649,4.37649,0,0,0,18,15.9a2.59368,2.59368,0,0,0,.65125-.07453A1.51031,1.51031,0,0,0,19.1,15.63375a1.1277,1.1277,0,0,0,.28375-.26109A1.11325,1.11325,0,0,0,19.54,15.09a1.22521,1.22521,0,0,0,.068-.32313,1.25587,1.25587,0,0,0-.12281-.63875A1.23791,1.23791,0,0,0,19.3,13.85Zm-1.09.76a.5154.5154,0,0,1-.08641.19734.58489.58489,0,0,1-.16234.15141.79481.79481,0,0,1-.228.097A1.1248,1.1248,0,0,1,17.45,15.09c-.03,0-.05937-.00062-.08828-.002s-.05734-.00359-.08547-.00672-.05594-.00719-.08359-.01234S17.1375,15.0575,17.11,15.05a4.95589,4.95589,0,0,1-.55719-.16906,5.26538,5.26538,0,0,1-.54781-.23844,5.88716,5.88716,0,0,1-.54031-.30969q-.26859-.173-.53469-.38281.19875-.03.39938-.0525t.40312-.0375q.2025-.015.40688-.0225T16.55,13.83q.135-.00375.27-.00015.135.00351.27.0139.135.01032.27.027.135.01665.27.03922a1.06557,1.06557,0,0,1,.23406.06438.67592.67592,0,0,1,.20594.12812.47151.47151,0,0,1,.13094.20688A.61536.61536,0,0,1,18.21,14.61ZM11.05,5.76a.44669.44669,0,0,1,.06312-.08922.418.418,0,0,1,.08188-.06953.38563.38563,0,0,1,.09687-.04516A.37033.37033,0,0,1,11.4,5.54a.3585.3585,0,0,1,.23219.07781.49431.49431,0,0,1,.14031.19969,1.11421,1.11421,0,0,1,.06906.27094A2.13908,2.13908,0,0,1,11.86,6.38a4.75269,4.75269,0,0,1-.03313.52266c-.02187.19453-.05437.408-.09687.63609s-.095.47094-.15688.72422S11.44,8.78,11.36,9.05a8.57492,8.57492,0,0,1-.34656-1.17359,5.96418,5.96418,0,0,1-.13094-.95516,3.50469,3.50469,0,0,1,.03031-.71328A1.38226,1.38226,0,0,1,11.05,5.76Zm.91,8.03q-.12375.03375-.2475.06766-.12375.034-.2475.06859-.12375.03468-.2475.07047-.12375.03585-.2475.07328.0675-.135.13125-.26813t.12375-.26437q.06-.13125.11625-.26063T11.45,13.02q.0675-.16875.13469-.33578.067-.16711.13281-.333.06563-.16595.12906-.33109.06329-.16524.12344-.33016.0525.0825.10516.16328.05272.08087.10609.16047.05343.07968.108.15859.0546.079.11078.15766.10875.15.21969.29625.11109.14625.22531.28875.11438.1425.23281.28125.11859.13875.24219.27375a1.28474,1.28474,0,0,0-.14922.02891c-.09234.02015-.22016.04922-.362.08234s-.29781.07031-.44641.10672S12.0725,13.76,11.96,13.79Zm-3.51,2c-.2525.405-.50375.7725-.74766,1.09594a8.70907,8.70907,0,0,1-.70359.83156,3.63,3.63,0,0,1-.623.52781A.99041.99041,0,0,1,5.87,18.43a.43094.43094,0,0,1-.06875-.00563.4412.4412,0,0,1-.06875-.01687.4004.4004,0,0,1-.065-.02813A.33419.33419,0,0,1,5.61,18.34a.384.384,0,0,1-.07094-.07609.36982.36982,0,0,1-.06687-.18969A.38084.38084,0,0,1,5.48,17.97a1.11708,1.11708,0,0,1,.27422-.47844,3.84739,3.84739,0,0,1,.61453-.54406,8.74359,8.74359,0,0,1,.91266-.57781C7.63063,16.175,8.0225,15.98,8.45,15.79Z"/></g></svg>',
  UPLOAD_ICON: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M22.0007 6.66675H18.0007C17.8238 6.66675 17.6543 6.73699 17.5292 6.86201C17.4042 6.98703 17.334 7.1566 17.334 7.33341V8.66675C17.334 8.84356 17.4042 9.01313 17.5292 9.13815C17.6543 9.26318 17.8238 9.33341 18.0007 9.33341H20.0007V20.0001H4.00065V9.33341H6.00065C6.17746 9.33341 6.34703 9.26318 6.47206 9.13815C6.59708 9.01313 6.66732 8.84356 6.66732 8.66675V7.33341C6.66732 7.1566 6.59708 6.98703 6.47206 6.86201C6.34703 6.73699 6.17746 6.66675 6.00065 6.66675H2.00065C1.82384 6.66675 1.65427 6.73699 1.52925 6.86201C1.40422 6.98703 1.33398 7.1566 1.33398 7.33341V22.0001C1.33398 22.1769 1.40422 22.3465 1.52925 22.4715C1.65427 22.5965 1.82384 22.6667 2.00065 22.6667H22.0007C22.1775 22.6667 22.347 22.5965 22.4721 22.4715C22.5971 22.3465 22.6673 22.1769 22.6673 22.0001V7.33341C22.6673 7.1566 22.5971 6.98703 22.4721 6.86201C22.347 6.73699 22.1775 6.66675 22.0007 6.66675Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.1994 5.3334H10.6661V12.6667C10.6661 12.8435 10.7363 13.0131 10.8613 13.1381C10.9864 13.2632 11.1559 13.3334 11.3327 13.3334H12.6661C12.8429 13.3334 13.0124 13.2632 13.1375 13.1381C13.2625 13.0131 13.3327 12.8435 13.3327 12.6667V5.3334H16.7994C16.9409 5.3334 17.0765 5.27721 17.1765 5.17719C17.2765 5.07717 17.3327 4.94152 17.3327 4.80007C17.3339 4.67018 17.2864 4.54456 17.1994 4.44807L12.2327 0.0960672C12.1706 0.0346729 12.0868 0.000244141 11.9994 0.000244141C11.912 0.000244141 11.8282 0.0346729 11.7661 0.0960672L6.7994 4.4454C6.71182 4.54258 6.6642 4.66926 6.66607 4.80007C6.66607 4.94152 6.72226 5.07717 6.82228 5.17719C6.9223 5.27721 7.05795 5.3334 7.1994 5.3334Z" fill="white"/></svg>',
  INFO_ICON: '<svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.8"><path d="M9.00078 7.0748C9.59449 7.0748 10.0758 6.59351 10.0758 5.9998C10.0758 5.4061 9.59449 4.9248 9.00078 4.9248C8.40707 4.9248 7.92578 5.4061 7.92578 5.9998C7.92578 6.59351 8.40707 7.0748 9.00078 7.0748Z" fill="#222222"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.167 12H10V8.2C10 8.14696 9.97893 8.09609 9.94142 8.05858C9.90391 8.02107 9.85304 8 9.8 8H7.833C7.833 8 7.25 8.016 7.25 8.5C7.25 8.984 7.833 9 7.833 9H8V12H7.833C7.833 12 7.25 12.016 7.25 12.5C7.25 12.984 7.833 13 7.833 13H10.167C10.167 13 10.75 12.984 10.75 12.5C10.75 12.016 10.167 12 10.167 12Z" fill="#222222"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9.00078 1.0498C7.42842 1.0498 5.89137 1.51606 4.584 2.38962C3.27663 3.26318 2.25766 4.5048 1.65594 5.95747C1.05423 7.41014 0.896789 9.00862 1.20354 10.5508C1.51029 12.0929 2.26746 13.5095 3.37929 14.6213C4.49111 15.7331 5.90767 16.4903 7.44982 16.797C8.99197 17.1038 10.5904 16.9464 12.0431 16.3446C13.4958 15.7429 14.7374 14.724 15.611 13.4166C16.4845 12.1092 16.9508 10.5722 16.9508 8.9998C16.9508 6.89133 16.1132 4.86922 14.6223 3.37831C13.1314 1.88739 11.1093 1.0498 9.00078 1.0498ZM9.00078 15.9558C7.62502 15.9558 6.28015 15.5478 5.13624 14.7835C3.99233 14.0192 3.10076 12.9328 2.57428 11.6618C2.0478 10.3907 1.91004 8.99209 2.17844 7.64276C2.44684 6.29342 3.10934 5.05398 4.08215 4.08117C5.05496 3.10836 6.2944 2.44586 7.64374 2.17746C8.99307 1.90906 10.3917 2.04682 11.6627 2.5733C12.9338 3.09978 14.0202 3.99135 14.7845 5.13526C15.5488 6.27917 15.9568 7.62404 15.9568 8.9998C15.9568 10.8447 15.2239 12.6139 13.9194 13.9184C12.6149 15.2229 10.8456 15.9558 9.00078 15.9558Z" fill="#222222"/></g></svg>',
  CLOSE_ICON: '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_15746_2423)"><g clip-path="url(#clip1_15746_2423)"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.2381 15.9994L19.6944 13.5434C19.8586 13.3793 19.9509 13.1566 19.9509 12.9245C19.951 12.6923 19.8588 12.4696 19.6946 12.3054C19.5305 12.1412 19.3078 12.0489 19.0757 12.0488C18.8435 12.0488 18.6208 12.141 18.4566 12.3051L16.0002 14.7615L13.5435 12.3051C13.3793 12.141 13.1566 12.0489 12.9245 12.049C12.6923 12.0491 12.4697 12.1414 12.3057 12.3056C12.1416 12.4698 12.0495 12.6925 12.0496 12.9246C12.0497 13.1568 12.142 13.3794 12.3062 13.5434L14.7622 15.9994L12.3062 18.4555C12.1427 18.6197 12.051 18.8421 12.0512 19.0738C12.0515 19.3055 12.1436 19.5277 12.3074 19.6916C12.4711 19.8556 12.6933 19.9478 12.925 19.9482C13.1567 19.9486 13.3791 19.8571 13.5435 19.6938L16.0002 17.2374L18.4566 19.6938C18.6208 19.8579 18.8435 19.9501 19.0756 19.9501C19.3078 19.95 19.5305 19.8577 19.6946 19.6935C19.8588 19.5293 19.9509 19.3066 19.9509 19.0745C19.9509 18.8423 19.8586 18.6196 19.6944 18.4555L17.2381 15.9994Z" fill="white"/></g></g><defs><clipPath id="clip0_15746_2423"><rect width="8" height="8" fill="white" transform="translate(12 12)"/></clipPath><clipPath id="clip1_15746_2423"><rect width="8" height="8" fill="white" transform="translate(12 12)"/></clipPath></defs></svg>',
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

// Redirect functions for signed-in users
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
  // For study-space, redirect to the product
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

function getSplunkEndpoint() {
  return (getEnv() === 'prod') ? 'https://unity.adobe.io/api/v1/log' : 'https://unity-stage.adobe.io/api/v1/log';
}

// Cookie helper functions
function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, expires) {
  document.cookie = `${name}=${value};domain=.adobe.com;path=/;expires=${expires}`;
}

// Calculate upload time from cookies
function uploadedTime() {
  const uploadingUTS = parseInt(getCookie('UTS_Uploading'), 10);
  const uploadedUTS = parseInt(getCookie('UTS_Uploaded'), 10);
  if (Number.isNaN(uploadingUTS) || Number.isNaN(uploadedUTS)) return 'N/A';
  return ((uploadedUTS - uploadingUTS) / 1000).toFixed(1);
}

// Helper to run callback when document is ready
function runWhenDocumentIsReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

// Redirect ready event
const redirectReady = new CustomEvent('DCUnity:RedirectReady');

// Global flags for tracking
let exitFlag = true;
let tabClosureSent = false;
let isUploading = false;

// Prefetch functions for next page performance
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

// Handle exit/tab closure for analytics
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

// Initialize analytics functions as no-ops until loaded
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

// Load analytics after LCP
window.addEventListener('analyticsLoad', async ({ detail }) => {
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
      'Analytics failed to initialize correctly: some methods remain no-ops on study-widget block',
      lanaOptions,
    );
  }
});

// Decorate image media like marquee block
function decorateImage(media) {
  media.classList.add('image');
  
  const imageLink = media.querySelector('a');
  const picture = media.querySelector('picture');
  
  if (imageLink && picture && !imageLink.parentElement.classList.contains('modal-img-link')) {
    imageLink.textContent = '';
    imageLink.append(picture);
  }
}

// Process media element like marquee block
function processMedia(mediaDiv) {
  if (!mediaDiv) return null;
  
  // Add asset class like marquee
  mediaDiv.classList.add('asset');
  
  // Check if it contains video or video link
  const hasVideo = mediaDiv.querySelector('video, a[href*=".mp4"], a[href*=".webm"], a[href*=".ogg"]');
  
  // If it doesn't contain video, decorate as image
  if (!hasVideo) {
    decorateImage(mediaDiv);
  }
  
  return mediaDiv;
}

export default async function init(element) {
  // Check for old browser and redirect if needed
  if (isOldBrowser()) {
    window.location.href = EOLBrowserPage;
    return;
  }

  // Get VERB from element classList (same as verb-widget.js)
  const VERB = element.classList[1];

  // Initialize analytics
  let userAttempts = 0;
  try {
    const unityUserCookie = localStorage.getItem('unity.user');
    if (unityUserCookie) {
      const unityUser = JSON.parse(unityUserCookie);
      userAttempts = unityUser.adsQty || 0;
    }
  } catch (error) {
    window.lana?.log(
      `Error Code: Unknown, Status: 'Unknown', Message: Failed to read unity.user cookie: ${error.message}`,
      lanaOptions,
    );
  }

  // Track number of files for analytics
  let noOfFiles = null;

  // Merge data helper for analytics
  function mergeData(eventData = {}) {
    return { ...eventData, noOfFiles };
  }

  // Dispatch analytics load event when document is ready
  runWhenDocumentIsReady(() => {
    window.dispatchEvent(new CustomEvent('analyticsLoad', {
      detail: { verb: VERB, userAttempts },
    }));
  });

  const children = element.querySelectorAll(':scope > div');
  
  // Handle background and foreground like marquee block
  const foreground = children[children.length - 1];
  foreground.classList.add('foreground', 'container');
  
  // Add background if there are multiple children
  if (children.length > 1) {
    children[0].classList.add('background');
    decorateBlockBg(element, children[0], { useHandleFocalpoint: true });
  }
  
  // Find heading and media INSIDE foreground (exactly like marquee)
  const headline = foreground.querySelector('h1, h2, h3, h4, h5, h6');
  const heading = headline?.textContent?.trim() || 'Quiz Maker';
  const text = headline?.closest('div');
  if (text) {
    text.classList.add('text');
  }
  
  // Find media inside foreground - any direct child div without a class (like marquee)
  const media = foreground.querySelector(':scope > div:not([class])');
  
  if (media) {
    processMedia(media);
  }
  
  // Create main container
  const container = createTag('div', { class: 'study-widget-container' });
  const row = createTag('div', { class: 'study-widget-row' });
  const leftCol = createTag('div', { class: 'study-widget-col study-widget-col-left' });
  const rightCol = createTag('div', { class: 'study-widget-col study-widget-col-right' });
  
  // Create header with Acrobat icon and "Adobe StudySpace" text
  const header = createTag('div', { class: 'study-widget-header' });
  const iconWrapper = createTag('div', { class: 'acrobat-icon' });
  const widgetIconSvg = createSvgElement('WIDGET_ICON');
  if (widgetIconSvg) {
    widgetIconSvg.classList.add('icon-acrobat');
    widgetIconSvg.setAttribute('aria-hidden', 'true');
    iconWrapper.appendChild(widgetIconSvg);
  }
  const title = createTag('div', { class: 'study-widget-title' });
  const adobeText = createTag('span', { class: 'adobe-red' }, 'Adobe');
  const studySpaceText = createTag('span', {}, ' StudySpace');
  title.append(adobeText, studySpaceText);
  header.append(iconWrapper, title);
  
  // Create heading
  const headingEl = createTag('h1', { class: 'study-widget-heading' }, heading);
  
  // Create description copy
  const copy1 = createTag('p', { class: 'study-widget-copy' }, window.mph?.[`studyspace-${VERB}-copy`] || 'An AI study buddy that transforms notes, PDFs, and links into quizzes.');
  const copy2 = createTag('p', { class: 'study-widget-copy study-widget-copy-sub' }, window.mph?.[`studyspace-${VERB}-copy-sub`] || 'Free • No download required • 1M+ happy students');
  
  // Create dropzone container (dashed border area) with accessibility
  // Using existing drag placeholder for aria-label (simpler, reuses existing content)
  const dropzoneAriaLabel = window.mph?.[`studyspace-${VERB}-drag`] || 'Or drag and drop here';
  
  const dropzone = createTag('div', { 
    class: 'study-widget-dropzone', 
    id: 'drop-zone',
    role: 'button',
    tabindex: '0',
    'aria-label': dropzoneAriaLabel,
    'aria-describedby': 'file-upload-description'
  });
  
  // Create CTA button with upload icon
  const ctaButton = createTag('button', { 
    class: 'study-widget-cta',
    type: 'button',
    'aria-label': window.mph?.['verb-widget-cta'] || 'Select a file'
  });
  const uploadIconSvg = createSvgElement('UPLOAD_ICON');
  if (uploadIconSvg) {
    uploadIconSvg.classList.add('upload-icon');
    uploadIconSvg.setAttribute('aria-hidden', 'true');
    ctaButton.appendChild(uploadIconSvg);
  }
  const ctaLabel = createTag('span', { class: 'study-widget-cta-label' }, window.mph?.['verb-widget-cta'] || 'Select a file');
  ctaButton.appendChild(ctaLabel);
  
  // Create "Or drag and drop here" text
  const dragText = createTag('p', { class: 'study-widget-drag' }, window.mph?.[`studyspace-${VERB}-drag`] || 'Or drag and drop here');
  
  // Create file limit text with ID for aria-describedby
  const fileLimitText = createTag('p', { 
    class: 'study-widget-file-limit',
    id: 'file-upload-description'
  }, window.mph?.[`studyspace-${VERB}-file-limit`] || 'File must be PDF and up to 50MB');
  
  // Hidden file input with proper label association
  const fileInput = createTag('input', {
    type: 'file',
    id: 'file-upload',
    class: 'hide',
    'aria-hidden': 'true',
    accept: '.pdf',
    'aria-describedby': 'file-upload-description'
  });
  
  // Create error state UI with accessibility
  const errorState = createTag('div', { 
    class: 'error hide',
    role: 'alert',
    'aria-live': 'assertive',
    'aria-atomic': 'true'
  });
  const errorStateText = createTag('p', { 
    class: 'study-widget-errorText',
    id: 'error-message'
  });
  const errorIcon = createTag('div', { 
    class: 'study-widget-errorIcon',
    'aria-hidden': 'true'
  });
  const errorCloseBtn = createTag('button', { 
    class: 'study-widget-errorBtn',
    type: 'button',
    'aria-label': window.mph?.[`studyspace-${VERB}-error-close`] || 'Close error message'
  });
  const closeIconSvg = createSvgElement('CLOSE_ICON');
  if (closeIconSvg) {
    closeIconSvg.classList.add('close-icon', 'error');
    closeIconSvg.setAttribute('aria-hidden', 'true');
    errorCloseBtn.prepend(closeIconSvg);
  }
  errorState.append(errorIcon, errorStateText, errorCloseBtn);
  
  // Create footer with legal text and info icon
  const footer = createTag('div', { class: 'study-widget-footer' });
  const legalText = createTag('p', { class: 'study-widget-legal' }, window.mph?.['study-space-legal'] || 'Your file will be securely handled by Adobe servers and deleted unless you sign in to save it.');
  
  // Add info icon with tooltip
  const infoIcon = createTag('button', {
    class: 'info-icon milo-tooltip',
    type: 'button',
    'aria-label': window.mph?.['verb-widget-tool-tip'] || 'Files security information',
    'aria-describedby': 'info-tooltip-text',
    'data-tooltip': window.mph?.['verb-widget-tool-tip'] || 'Files are securely processed and deleted after use',
  });
  const infoIconSvg = createSvgElement('INFO_ICON');
  if (infoIconSvg) {
    infoIconSvg.setAttribute('aria-hidden', 'true');
    infoIcon.appendChild(infoIconSvg);
  }
  // Hidden tooltip text for screen readers
  const tooltipText = createTag('span', {
    id: 'info-tooltip-text',
    class: 'hide'
  }, window.mph?.['verb-widget-tool-tip'] || 'Files are securely processed and deleted after use');
  infoIcon.appendChild(tooltipText);
  
  footer.append(legalText, infoIcon);
  
  // Assemble dropzone
  dropzone.append(ctaButton, dragText, fileLimitText);
  
  // Assemble left column (error state appears above dropzone but hidden by default)
  leftCol.append(header, headingEl, copy1, copy2, errorState, dropzone, fileInput, footer);
  
  // Create media area in right column
  if (media) {
    const mediaWrapper = createTag('div', { class: 'study-widget-media' });
    // Move all content from media div into wrapper
    while (media.firstChild) {
      mediaWrapper.appendChild(media.firstChild);
    }
    rightCol.appendChild(mediaWrapper);
  }
  
  // Assemble row
  row.append(leftCol, rightCol);
  container.appendChild(row);
  
  // Clear foreground and append new structure
  foreground.innerHTML = '';
  foreground.append(container);
  
  // Analytics helper function
  let uploadingStartTime = null;

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

  // Register tab close event handler
  function registerTabCloseEvent(eventData, workflowStep) {
    window.addEventListener('beforeunload', (windowEvent) => {
      handleExit(windowEvent, VERB, eventData, false, workflowStep);
    });
  }

  // Error handler function
  function handleError(
    {
      code,
      status = 'Unknown',
      message,
      info,
    },
    logToLana = false,
    logOptions = lanaOptions,
  ) {
    const accountType = window?.adobeIMS?.getAccountType?.() || 'anonymous';
    
    if (message) {
      setDraggingClass(false);
      errorState.classList.add('study-widget-error');
      errorState.classList.remove('hide');
      errorStateText.textContent = message;
      // Update dropzone aria-describedby to include error message for accessibility
      dropzone.setAttribute('aria-describedby', 'file-upload-description error-message');
      dropzone.setAttribute('aria-invalid', 'true');
    }
    if (logToLana) {
      window.lana?.log(
        `Error Code: ${code}, Status: ${status}, Message: ${message}, Info: ${info}, Account Type: ${accountType}`,
        logOptions,
      );
    }

    setTimeout(() => {
      errorState.classList.remove('study-widget-error');
      errorState.classList.add('hide');
      errorStateText.textContent = '';
      // Remove error from aria-describedby
      dropzone.setAttribute('aria-describedby', 'file-upload-description');
      dropzone.removeAttribute('aria-invalid');
    }, 5000);
  }
  
  // Add drag and drop event listeners
  const setDraggingClass = (shouldToggle) => {
    if (shouldToggle) {
      dropzone.classList.add('dragging');
    } else {
      dropzone.classList.remove('dragging');
    }
  };
  
  // Click handler for dropzone
  dropzone.addEventListener('click', (e) => {
    if (e.srcElement.classList.value.includes('error')) { return; }
    fileInput.click();
  });
  
  // Keyboard navigation for dropzone (Enter and Space keys)
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!e.srcElement.classList.value.includes('error')) {
        fileInput.click();
      }
    }
  });
  
  // Drag and drop handlers for dropzone
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    setDraggingClass(true);
  });
  
  dropzone.addEventListener('dragleave', (e) => {
    // Only remove dragging class if leaving the dropzone entirely
    if (!dropzone.contains(e.relatedTarget)) {
      setDraggingClass(false);
    }
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    setDraggingClass(false);
    const { dataTransfer: { files } } = e;
    if (files.length > 0) {
      noOfFiles = files.length;
      element.dispatchEvent(new CustomEvent('unity:track-analytics', {
        detail: {
          event: 'drop',
          data: { userAttempts },
        },
      }));
    }
  });

  // Make the entire block a drop zone
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingClass(true);
    element.classList.add('dragging-block');
  });
  
  element.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only remove dragging class if leaving the element entirely
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
      // Trigger file input change event with the dropped files
      const dataTransfer = new DataTransfer();
      Array.from(files).forEach(file => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
      
      // Dispatch change event
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

  // File input event listeners
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

  // Error close button
  errorCloseBtn.addEventListener('click', () => {
    errorState.classList.remove('study-widget-error');
    errorState.classList.add('hide');
  });

  // unity:track-analytics event listener
  element.addEventListener('unity:track-analytics', (e) => {
    const { event, data } = e.detail || {};
    const canSendDataToSplunk = e.detail?.sendToSplunk ?? true;

    if (!event) return;
    const metadata = mergeData({ ...data, userAttempts });
    const analyticsMap = {
      change: () => {
        exitFlag = false;
        handleAnalyticsEvent('choose-file:open', metadata, true, canSendDataToSplunk);
      },
      drop: () => {
        exitFlag = false;
        ['files-dropped', 'entry:clicked', 'discover:clicked'].forEach((analyticsEvent) => {
          handleAnalyticsEvent(analyticsEvent, metadata, true, canSendDataToSplunk);
        });
        setDraggingClass(false);
      },
      cancel: () => {
        handleAnalyticsEvent('choose-file:close', metadata, true, canSendDataToSplunk);
      },
      uploading_started: () => {
        isUploading = true;
        exitFlag = false;
        prefetchTarget();
        uploadingStartTime = Date.now();
        const cookieExp = new Date(Date.now() + 30 * 60 * 1000).toUTCString();
        setCookie('UTS_Uploading', Date.now(), cookieExp);
        handleAnalyticsEvent('job:uploading-started', metadata, true, canSendDataToSplunk);
      },
      upload_success: () => {
        isUploading = false;
        exitFlag = true;
        const cookieExp = new Date(Date.now() + 30 * 60 * 1000).toUTCString();
        setCookie('UTS_Uploaded', Date.now(), cookieExp);
        const calcUploadedTime = uploadedTime();
        const uploadMetadata = { ...metadata, uploadTime: calcUploadedTime };
        handleAnalyticsEvent('job:uploaded', uploadMetadata, true, canSendDataToSplunk);
        
        // Dispatch redirect ready event with timeout fallback
        setTimeout(() => {
          window.dispatchEvent(redirectReady);
          window.lana?.log(
            'Adobe Analytics done callback failed to trigger, 3 second timeout dispatched event.',
            { sampleRate: 5, tags: 'DC_Milo,Project Unity (DC)' },
          );
        }, 3000);
      },
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

  // unity:show-error-toast event listener
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

  // Tab closure tracking
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

  // Set redirect cookie on exit
  window.addEventListener('beforeunload', () => {
    const cookieExp = new Date(Date.now() + 90 * 1000).toUTCString();
    if (exitFlag) {
      document.cookie = `UTS_Redirect=${Date.now()};domain=.adobe.com;path=/;expires=${cookieExp}`;
    }
  });

  // Check and redirect signed-in users
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

    // Redirect all signed-in users to the product for study-space
    if (accountType) redDir(VERB);
  }

  // Race the condition
  await checkSignedInUser();

  // Redirect after IMS:Ready
  window.addEventListener('IMS:Ready', checkSignedInUser);

  // Handle back/forward cache - reload page on back/forward navigation
  window.addEventListener('pageshow', (event) => {
    const historyTraversal = event.persisted
      || (typeof window.performance !== 'undefined'
        && window.performance.getEntriesByType('navigation')[0].type === 'back_forward');
    if (historyTraversal) {
      window.location.reload();
    }
  });
}
