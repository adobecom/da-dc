/* eslint-disable compat/compat */
import { getEnv, isOldBrowser, setLibs } from './utils.js';
import { localeMap } from '../blocks/unity/unity.js';
import verbRedirMap from './maps/verbRedirMap.js';

const miloLibs = setLibs('/libs');

export const loadMiloUtils = () => import(`${miloLibs}/utils/utils.js`);

export const EOLBrowserPage = 'https://acrobat.adobe.com/home/index-browser-eol.html';

export const DC_ENV = ['www.adobe.com', 'sign.ing', 'edit.ing'].includes(window.location.hostname) ? 'prod' : 'stage';

export function createLogger(blockName) {
  const options = {
    sampleRate: 1,
    tags: ['DC_Milo', 'Project Unity (DC)', blockName].filter(Boolean).join(','),
    severity: 'error',
  };
  return {
    blockName,
    options,
    error: (message) => window.lana?.log(message, options),
    warn: (message) => window.lana?.log(message, { ...options, severity: 'warning' }),
  };
}

const defaultLogger = createLogger();

export { verbRedirMap };

export const exhLimitCookieMap = {
  'to-pdf': 'cr_p_c',
  'pdf-to': 'ex_p_c',
  'combine-pdf': 'cb_p_c',
  'compress-pdf': 'cm_p_ops',
  'rotate-pages': 'or_p_c',
  createpdf: 'cr_p_c',
  'ocr-pdf': 'ocr_p_c',
};

export const appEnvCookieMap = {
  stage: 's_ta_',
  prod: 'p_ac_',
};

export const ICONS = {
  WIDGET_ICON: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0.3 24 23.4"><g id="Surfaces"><path fill="#b30b00" d="M4.25.3h15.5A4.24643,4.24643,0,0,1,24,4.55v14.9a4.24643,4.24643,0,0,1-4.25,4.25H4.25A4.24643,4.24643,0,0,1,0,19.45V4.55A4.24643,4.24643,0,0,1,4.25.3Z"/></g><g id="Outlined_Mnemonics_Logos" data-name="Outlined Mnemonics Logos"><path id="_256" data-name=" 256" fill="#fff" d="M19.3,13.85a1.78946,1.78946,0,0,0-.44031-.33547,2.83828,2.83828,0,0,0-.59969-.24078,4.79788,4.79788,0,0,0-.75719-.14516A7.94332,7.94332,0,0,0,16.59,13.08q-.27375.00375-.54891.017-.27492.01337-.54984.03672-.2747.02345-.548.05734-.273.034-.54328.07891-.1725-.16875-.33891-.345-.16617-.17625-.32484-.36-.15844-.18375-.308-.375-.1493-.19125-.28828-.39-.10875-.14625-.212-.29625-.10337-.15-.20172-.30375-.09845-.15375-.19234-.31125-.094-.1575-.18391-.31875.17625-.55125.30766-1.04813.13148-.49688.21859-.93937.08718-.4425.13047-.83063A6.52908,6.52908,0,0,0,13.05,7.03a3.675,3.675,0,0,0-.08594-.80563A2.42373,2.42373,0,0,0,12.685,5.505a1.4927,1.4927,0,0,0-.50406-.51688A1.44959,1.44959,0,0,0,11.42,4.79a1.19728,1.19728,0,0,0-.30547.04719A1.22057,1.22057,0,0,0,10.41,5.38a2.17839,2.17839,0,0,0-.25078.82187,4.69881,4.69881,0,0,0,.007,1.08813,7.85466,7.85466,0,0,0,.25641,1.26812A10.26146,10.26146,0,0,0,10.92,9.92c-.0725.2125-.14625.42312-.222.63391s-.1536.42171-.23422.63484-.16406.42844-.25109.648S10.035,12.28,9.94,12.51q-.12375.2925-.25344.58281Q9.55672,13.383,9.42,13.67q-.13688.28688-.28156.56969Q8.99359,14.52235,8.84,14.8c-.3075.1225-.70125.28937-1.12281.49156A12.99444,12.99444,0,0,0,6.4275,15.995a6.08618,6.08618,0,0,0-1.10594.86094A1.9673,1.9673,0,0,0,4.75,17.82a1.08624,1.08624,0,0,0-.01969.29219,1.10366,1.10366,0,0,0,.05719.28281,1.13932,1.13932,0,0,0,.12844.26031A1.17812,1.17812,0,0,0,5.11,18.88a1.45543,1.45543,0,0,0,.23312.17047,1.49272,1.49272,0,0,0,.25938.12078,1.5496,1.5496,0,0,0,.27812.07016A1.60815,1.60815,0,0,0,6.17,19.26a2.26684,2.26684,0,0,0,1.16953-.36984,5.403,5.403,0,0,0,1.12172-.95391,11.55912,11.55912,0,0,0,1.02609-1.30453c.32078-.46734.61766-.95422.88266-1.42172q.225-.075.45172-.14781.22664-.07266.45453-.14219.22781-.06938.45641-.13469.22851-.06515.45734-.12531.25125-.0675.49687-.12766.24562-.06022.48563-.11359.24-.05343.47437-.10047.23438-.0471.46313-.08828a7.87389,7.87389,0,0,0,1.20266.87266,6.26924,6.26924,0,0,0,1.08359.50609,5.254,5.254,0,0,0,.913.23422A4.37649,4.37649,0,0,0,18,15.9a2.59368,2.59368,0,0,0,.65125-.07453A1.51031,1.51031,0,0,0,19.1,15.63375a1.1277,1.1277,0,0,0,.28375-.26109A1.11325,1.11325,0,0,0,19.54,15.09a1.22521,1.22521,0,0,0,.068-.32313,1.25587,1.25587,0,0,0-.12281-.63875A1.23791,1.23791,0,0,0,19.3,13.85Zm-1.09.76a.5154.5154,0,0,1-.08641.19734.58489.58489,0,0,1-.16234.15141.79481.79481,0,0,1-.228.097A1.1248,1.1248,0,0,1,17.45,15.09c-.03,0-.05937-.00062-.08828-.002s-.05734-.00359-.08547-.00672-.05594-.00719-.08359-.01234S17.1375,15.0575,17.11,15.05a4.95589,4.95589,0,0,1-.55719-.16906,5.26538,5.26538,0,0,1-.54781-.23844,5.88716,5.88716,0,0,1-.54031-.30969q-.26859-.173-.53469-.38281.19875-.03.39938-.0525t.40312-.0375q.2025-.015.40688-.0225T16.55,13.83q.135-.00375.27-.00015.135.00351.27.0139.135.01032.27.027.135.01665.27.03922a1.06557,1.06557,0,0,1,.23406.06438.67592.67592,0,0,1,.20594.12812.47151.47151,0,0,1,.13094.20688A.61536.61536,0,0,1,18.21,14.61ZM11.05,5.76a.44669.44669,0,0,1,.06312-.08922.418.418,0,0,1,.08188-.06953.38563.38563,0,0,1,.09687-.04516A.37033.37033,0,0,1,11.4,5.54a.3585.3585,0,0,1,.23219.07781.49431.49431,0,0,1,.14031.19969,1.11421,1.11421,0,0,1,.06906.27094A2.13908,2.13908,0,0,1,11.86,6.38a4.75269,4.75269,0,0,1-.03313.52266c-.02187.19453-.05437.408-.09687.63609s-.095.47094-.15688.72422S11.44,8.78,11.36,9.05a8.57492,8.57492,0,0,1-.34656-1.17359,5.96418,5.96418,0,0,1-.13094-.95516,3.50469,3.50469,0,0,1,.03031-.71328A1.38226,1.38226,0,0,1,11.05,5.76Zm.91,8.03q-.12375.03375-.2475.06766-.12375.034-.2475.06859-.12375.03468-.2475.07047-.12375.03585-.2475.07328.0675-.135.13125-.26813t.12375-.26437q.06-.13125.11625-.26063T11.45,13.02q.0675-.16875.13469-.33578.067-.16711.13281-.333.06563-.16595.12906-.33109.06329-.16524.12344-.33016.0525.0825.10516.16328.05272.08087.10609.16047.05343.07968.108.15859.0546.079.11078.15766.10875.15.21969.29625.11109.14625.22531.28875.11438.1425.23281.28125.11859.13875.24219.27375a1.28474,1.28474,0,0,0-.14922.02891c-.09234.02015-.22016.04922-.362.08234s-.29781.07031-.44641.10672S12.0725,13.76,11.96,13.79Zm-3.51,2c-.2525.405-.50375.7725-.74766,1.09594a8.70907,8.70907,0,0,1-.70359.83156,3.63,3.63,0,0,1-.623.52781A.99041.99041,0,0,1,5.87,18.43a.43094.43094,0,0,1-.06875-.00563.4412.4412,0,0,1-.06875-.01687.4004.4004,0,0,1-.065-.02813A.33419.33419,0,0,1,5.61,18.34a.384.384,0,0,1-.07094-.07609.36982.36982,0,0,1-.06687-.18969A.38084.38084,0,0,1,5.48,17.97a1.11708,1.11708,0,0,1,.27422-.47844,3.84739,3.84739,0,0,1,.61453-.54406,8.74359,8.74359,0,0,1,.91266-.57781C7.63063,16.175,8.0225,15.98,8.45,15.79Z"/></g></svg>',
  UPLOAD_ICON: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M22.0007 6.66675H18.0007C17.8238 6.66675 17.6543 6.73699 17.5292 6.86201C17.4042 6.98703 17.334 7.1566 17.334 7.33341V8.66675C17.334 8.84356 17.4042 9.01313 17.5292 9.13815C17.6543 9.26318 17.8238 9.33341 18.0007 9.33341H20.0007V20.0001H4.00065V9.33341H6.00065C6.17746 9.33341 6.34703 9.26318 6.47206 9.13815C6.59708 9.01313 6.66732 8.84356 6.66732 8.66675V7.33341C6.66732 7.1566 6.59708 6.98703 6.47206 6.86201C6.34703 6.73699 6.17746 6.66675 6.00065 6.66675H2.00065C1.82384 6.66675 1.65427 6.73699 1.52925 6.86201C1.40422 6.98703 1.33398 7.1566 1.33398 7.33341V22.0001C1.33398 22.1769 1.40422 22.3465 1.52925 22.4715C1.65427 22.5965 1.82384 22.6667 2.00065 22.6667H22.0007C22.1775 22.6667 22.347 22.5965 22.4721 22.4715C22.5971 22.3465 22.6673 22.1769 22.6673 22.0001V7.33341C22.6673 7.1566 22.5971 6.98703 22.4721 6.86201C22.347 6.73699 22.1775 6.66675 22.0007 6.66675Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.1994 5.3334H10.6661V12.6667C10.6661 12.8435 10.7363 13.0131 10.8613 13.1381C10.9864 13.2632 11.1559 13.3334 11.3327 13.3334H12.6661C12.8429 13.3334 13.0124 13.2632 13.1375 13.1381C13.2625 13.0131 13.3327 12.8435 13.3327 12.6667V5.3334H16.7994C16.9409 5.3334 17.0765 5.27721 17.1765 5.17719C17.2765 5.07717 17.3327 4.94152 17.3327 4.80007C17.3339 4.67018 17.2864 4.54456 17.1994 4.44807L12.2327 0.0960672C12.1706 0.0346729 12.0868 0.000244141 11.9994 0.000244141C11.912 0.000244141 11.8282 0.0346729 11.7661 0.0960672L6.7994 4.4454C6.71182 4.54258 6.6642 4.66926 6.66607 4.80007C6.66607 4.94152 6.72226 5.07717 6.82228 5.17719C6.9223 5.27721 7.05795 5.3334 7.1994 5.3334Z" fill="white"/></svg>',
  SECURITY_ICON: '<svg width="26" height="31" viewBox="0 0 26 31" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 0L25.5 4.163V14.177C25.4633 17.9427 24.2335 21.5998 21.9875 24.6226C19.7415 27.6453 16.5949 29.8781 13 31C9.4386 29.8983 6.31448 27.7033 4.07079 24.7262C1.82711 21.7491 0.577772 18.1411 0.5 14.414V14.052V4.166L13 0ZM13 1.581L2 5.246V14.051C2.00065 17.3991 3.03609 20.6651 4.96458 23.402C6.89306 26.1389 9.62033 28.2129 12.773 29.34L12.996 29.418L13.217 29.34C16.2922 28.2358 18.9645 26.2329 20.8873 23.5911C22.8101 20.9494 23.8946 17.7907 24 14.525V14.177V5.244L13 1.581Z" fill="#8E8E8E"/><path d="M19.2052 10.484C19.3352 10.3458 19.5127 10.262 19.7019 10.2494C19.8912 10.2369 20.0782 10.2965 20.2253 10.4163C20.3723 10.5361 20.4685 10.7072 20.4945 10.8951C20.5205 11.083 20.4743 11.2738 20.3652 11.429L20.2952 11.515L12.0362 20.242C11.913 20.3715 11.7476 20.4528 11.5697 20.4711C11.3919 20.4895 11.2133 20.4436 11.0662 20.342L10.9802 20.273L7.23925 16.788C7.10054 16.659 7.01577 16.4823 7.00199 16.2933C6.98821 16.1044 7.04642 15.9173 7.16494 15.7695C7.28345 15.6217 7.4535 15.5243 7.64091 15.4967C7.82832 15.4692 8.01921 15.5136 8.17525 15.621L8.26225 15.691L11.4622 18.669L19.2052 10.484Z" fill="#FA0F00"/></svg>',
  INFO_ICON: '<svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.8"><path d="M9.00078 7.0748C9.59449 7.0748 10.0758 6.59351 10.0758 5.9998C10.0758 5.4061 9.59449 4.9248 9.00078 4.9248C8.40707 4.9248 7.92578 5.4061 7.92578 5.9998C7.92578 6.59351 8.40707 7.0748 9.00078 7.0748Z" fill="#222222"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.167 12H10V8.2C10 8.14696 9.97893 8.09609 9.94142 8.05858C9.90391 8.02107 9.85304 8 9.8 8H7.833C7.833 8 7.25 8.016 7.25 8.5C7.25 8.984 7.833 9 7.833 9H8V12H7.833C7.833 12 7.25 12.016 7.25 12.5C7.25 12.984 7.833 13 7.833 13H10.167C10.167 13 10.75 12.984 10.75 12.5C10.75 12.016 10.167 12 10.167 12Z" fill="#222222"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9.00078 1.0498C7.42842 1.0498 5.89137 1.51606 4.584 2.38962C3.27663 3.26318 2.25766 4.5048 1.65594 5.95747C1.05423 7.41014 0.896789 9.00862 1.20354 10.5508C1.51029 12.0929 2.26746 13.5095 3.37929 14.6213C4.49111 15.7331 5.90767 16.4903 7.44982 16.797C8.99197 17.1038 10.5904 16.9464 12.0431 16.3446C13.4958 15.7429 14.7374 14.724 15.611 13.4166C16.4845 12.1092 16.9508 10.5722 16.9508 8.9998C16.9508 6.89133 16.1132 4.86922 14.6223 3.37831C13.1314 1.88739 11.1093 1.0498 9.00078 1.0498ZM9.00078 15.9558C7.62502 15.9558 6.28015 15.5478 5.13624 14.7835C3.99233 14.0192 3.10076 12.9328 2.57428 11.6618C2.0478 10.3907 1.91004 8.99209 2.17844 7.64276C2.44684 6.29342 3.10934 5.05398 4.08215 4.08117C5.05496 3.10836 6.2944 2.44586 7.64374 2.17746C8.99307 1.90906 10.3917 2.04682 11.6627 2.5733C12.9338 3.09978 14.0202 3.99135 14.7845 5.13526C15.5488 6.27917 15.9568 7.62404 15.9568 8.9998C15.9568 10.8447 15.2239 12.6139 13.9194 13.9184C12.6149 15.2229 10.8456 15.9558 9.00078 15.9558Z" fill="#222222"/></g></svg>',
  CLOSE_ICON: '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_15746_2423)"><g clip-path="url(#clip1_15746_2423)"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.2381 15.9994L19.6944 13.5434C19.8586 13.3793 19.9509 13.1566 19.9509 12.9245C19.951 12.6923 19.8588 12.4696 19.6946 12.3054C19.5305 12.1412 19.3078 12.0489 19.0757 12.0488C18.8435 12.0488 18.6208 12.141 18.4566 12.3051L16.0002 14.7615L13.5435 12.3051C13.3793 12.141 13.1566 12.0489 12.9245 12.049C12.6923 12.0491 12.4697 12.1414 12.3057 12.3056C12.1416 12.4698 12.0495 12.6925 12.0496 12.9246C12.0497 13.1568 12.142 13.3794 12.3062 13.5434L14.7622 15.9994L12.3062 18.4555C12.1427 18.6197 12.051 18.8421 12.0512 19.0738C12.0515 19.3055 12.1436 19.5277 12.3074 19.6916C12.4711 19.8556 12.6933 19.9478 12.925 19.9482C13.1567 19.9486 13.3791 19.8571 13.5435 19.6938L16.0002 17.2374L18.4566 19.6938C18.6208 19.8579 18.8435 19.9501 19.0756 19.9501C19.3078 19.95 19.5305 19.8577 19.6946 19.6935C19.8588 19.5293 19.9509 19.3066 19.9509 19.0745C19.9509 18.8423 19.8586 18.6196 19.6944 18.4555L17.2381 15.9994Z" fill="white"/></g></g><defs><clipPath id="clip0_15746_2423"><rect width="8" height="8" fill="white" transform="translate(12 12)"/></clipPath><clipPath id="clip1_15746_2423"><rect width="8" height="8" fill="white" transform="translate(12 12)"/></clipPath></defs></svg>',
};

export const FILE_PICKER_EVENTS = [
  'filepicker:shown',
  'dropzone:choose-file-clicked',
  'files-selected',
  'entry:clicked',
  'discover:clicked',
];

export const SOLO_PICKER_EVENTS = [
  'filepicker:shown',
  'cta:choose-file-clicked',
  'files-selected',
  'entry:clicked',
  'discover:clicked',
];

export const FILES_DROPPED_EVENTS = ['files-dropped', 'entry:clicked', 'discover:clicked'];

export const errorAnalyticsMap = {
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

export function isMobileDevice() {
  return /android|iphone|ipod|blackberry|windows phone/i.test(navigator.userAgent);
}

export function isTabletDevice() {
  const ua = navigator.userAgent.toLowerCase();
  const isIPadOS = navigator.userAgent.includes('Mac') && 'ontouchend' in document && !/iphone|ipod/i.test(ua);
  return isIPadOS || /ipad|android(?!.*mobile)/i.test(ua);
}

const EARLY_PREFETCH_DUMMY_ASSET = 'urn%3Aaaid%3Asc%3AUS%3A1111111%7CSample%20word%20file_WordtoPDF.docx%7C386919%7Capplication%2Fvnd.openxmlformats-officedocument.wordprocessingml.document';

export const EARLY_PREFETCH_CONFIG = {
  'word-to-pdf': { path: 'word-to-pdf/av', clientLocation: 'word-to-pdf', assets: EARLY_PREFETCH_DUMMY_ASSET },
  'excel-to-pdf': { path: 'excel-to-pdf', clientLocation: 'excel-to-pdf', assets: EARLY_PREFETCH_DUMMY_ASSET },
  'ppt-to-pdf': { path: 'ppt-to-pdf', clientLocation: 'ppt-to-pdf', assets: EARLY_PREFETCH_DUMMY_ASSET },
};

export function buildEarlyPrefetchUrl(verb) {
  const config = EARLY_PREFETCH_CONFIG[verb];
  if (!config) return null;
  const langFromPath = window.location.pathname.split('/')[1];
  const locale = localeMap[langFromPath] || 'en-us';
  const [languageCode, languageRegion] = locale.split('-');
  const domain = DC_ENV === 'prod' ? 'acrobat.adobe.com' : 'stage.acrobat.adobe.com';
  return `https://${domain}/${languageRegion}/${languageCode}/${config.path}?x_api_client_id=unity&x_api_client_location=${config.clientLocation}&user=frictionless_return_user&attempts=2%2B#assets=${config.assets}`;
}

export function getStoreType() {
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

export function redirectOldBrowser() {
  if (!isOldBrowser()) return false;
  window.location.href = EOLBrowserPage;
  return true;
}

export function onDocumentReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

export function redDirLink(verb) {
  const hostname = window?.location?.hostname;
  const suffix = verbRedirMap[verb] || verb.split('-').join('');
  if (hostname !== 'www.adobe.com' && hostname !== 'sign.ing' && hostname !== 'edit.ing') {
    return `https://www.adobe.com/go/acrobat-${suffix}-${getEnv()}`;
  }
  return `https://www.adobe.com/go/acrobat-${suffix}`;
}

export function redDir(verb) {
  window.location.href = redDirLink(verb);
}

export function getSplunkEndpoint(env = getEnv()) {
  return env === 'prod'
    ? 'https://unity.adobe.io/api/v1/log'
    : 'https://unity-stage.adobe.io/api/v1/log';
}

export function setUser() {
  localStorage.setItem('unity.user', 'true');
}

export function getVerbKey(verbKey) {
  const count = parseInt(localStorage.getItem(verbKey), 10) || 0;
  return ({ 0: '1st', 1: '2nd' })[count] || '2+';
}

export function incrementVerbKey(verbKey) {
  const count = (parseInt(localStorage.getItem(verbKey), 10) || 0) + 1;
  localStorage.setItem(verbKey, count);
  return count;
}

export function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export function setCookie(name, value, expires) {
  const expiry = expires || new Date(Date.now() + THIRTY_MINUTES_MS).toUTCString();
  document.cookie = `${name}=${value};domain=.adobe.com;path=/;expires=${expiry}`;
}

export function setRedirectCookie() {
  setCookie('UTS_Redirect', Date.now(), new Date(Date.now() + 90 * 1000).toUTCString());
}

export function uploadedTime() {
  const uploadingUTS = parseInt(getCookie('UTS_Uploading'), 10);
  const uploadedUTS = parseInt(getCookie('UTS_Uploaded'), 10);
  if (Number.isNaN(uploadingUTS) || Number.isNaN(uploadedUTS)) return 'N/A';
  return ((uploadedUTS - uploadingUTS) / 1000).toFixed(1);
}

export function isLimitExhausted(verb) {
  const limitCookie = exhLimitCookieMap[verb] || exhLimitCookieMap[verb.match(/^pdf-to|to-pdf$/)?.[0]];
  const cookiePrefix = appEnvCookieMap[DC_ENV] || '';
  return !!limitCookie && document.cookie.includes(`${cookiePrefix}${limitCookie}`);
}

export function setDraggingClass(widget, isDragging) {
  widget.classList.toggle('dragging', isDragging);
}

export function prefetchNextPage(url) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.crossOrigin = 'anonymous';
  link.as = 'document';
  document.head.appendChild(link);
}

export function prefetchInIframe(url) {
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
}

export function initiatePrefetch(url) {
  if (window.prefetchTargetUrl) return;
  prefetchNextPage(url);
  window.prefetchTargetUrl = url;
}

export function prefetchTarget() {
  if (window.prefetchTargetLoaded || !window.prefetchTargetUrl) return;
  prefetchInIframe(window.prefetchTargetUrl);
  window.prefetchTargetLoaded = true;
}

export function setupEarlyPrefetch(url) {
  window.prefetchTargetUrl = null;
  if (!url) return;
  const triggerEarlyPrefetch = () => {
    initiatePrefetch(url);
    prefetchTarget();
  };
  document.addEventListener('click', triggerEarlyPrefetch, { once: true });
  document.addEventListener('dragover', triggerEarlyPrefetch, { once: true });
}

export function reloadOnHistoryTraversal() {
  window.addEventListener('pageshow', (event) => {
    const historyTraversal = event.persisted
      || (typeof window.performance !== 'undefined'
        && window.performance.getEntriesByType('navigation')[0].type === 'back_forward');
    if (historyTraversal) {
      window.location.reload();
    }
  });
}

function waitForLcp(timeout = 3000) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
    if (!window.PerformanceObserver) return;
    try {
      const obs = new PerformanceObserver((list) => {
        if (list.getEntries().length > 0) {
          obs.disconnect();
          resolve();
        }
      });
      obs.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      resolve();
    }
  });
}

export function trackAnalyticsEvent(
  verb,
  eventName,
  metadata,
  documentUnloading = true,
  sendToSplunk = true,
  env = getEnv(),
) {
  window.analytics.verbAnalytics(eventName, verb, metadata, documentUnloading);
  if (!sendToSplunk) return;
  window.analytics.sendAnalyticsToSplunk(eventName, verb, metadata, getSplunkEndpoint(env));
}

async function loadAnalytics(verb, userAttempts, logger) {
  try {
    const { default: verbAnalytics, reviewAnalytics, sendAnalyticsToSplunk } = await import('./alloy/verb-widget.js');
    window.analytics.verbAnalytics = verbAnalytics;
    window.analytics.reviewAnalytics = reviewAnalytics;
    window.analytics.sendAnalyticsToSplunk = sendAnalyticsToSplunk;
    window.analytics.verbAnalytics('landing:shown', verb, { userAttempts });
    window.analytics.reviewAnalytics(verb);
  } catch (error) {
    logger.error(`Error Code: Unknown, Status: 'Unknown', Message: Analytics import failed: ${error.message} on ${verb}`);
  }
}

const analyticsLoaderBlocks = new Set();

export function registerAnalyticsLoader(logger = defaultLogger) {
  if (analyticsLoaderBlocks.has(logger.blockName)) return;
  analyticsLoaderBlocks.add(logger.blockName);

  window.analytics = window.analytics || {
    verbAnalytics: () => {},
    reviewAnalytics: () => {},
    sendAnalyticsToSplunk: () => {},
  };

  window.addEventListener('analyticsLoad', async ({ detail }) => {
    const stubs = { ...window.analytics };
    await waitForLcp();
    await loadAnalytics(detail.verb, detail.userAttempts, logger);
    const stillStubbed = ['verbAnalytics', 'reviewAnalytics', 'sendAnalyticsToSplunk']
      .some((method) => window.analytics[method] === stubs[method]);
    if (stillStubbed) {
      logger.error(`Analytics failed to initialize correctly: some methods remain no-ops on ${logger.blockName} block`);
    }
  });
}

export async function fireUpsellAnalytics(verb, userAttempts, logger = defaultLogger) {
  try {
    await waitForLcp();
    const { default: verbAnalytics } = await import('./alloy/verb-widget.js');
    verbAnalytics('upsell:shown', verb, { userAttempts });
    verbAnalytics('upsell-wall:shown', verb, { userAttempts });
  } catch (error) {
    logger.error(`Upsell analytics failed: ${error.message} on ${verb}`);
  }
}

export async function initializePingService(logger = defaultLogger, env = getEnv()) {
  try {
    const [{ PingService, USER_TYPE }, { getConfig }] = await Promise.all([
      import('./ping.js'),
      loadMiloUtils(),
    ]);
    const isSignedIn = window.adobeIMS?.isSignedInUser() || false;
    const userType = isSignedIn ? USER_TYPE.SIGNEDIN : USER_TYPE.ANON;
    const userId = isSignedIn ? ((await window.adobeIMS?.getProfile())?.userId || '') : '';
    const pingService = new PingService({
      locale: getConfig().locale?.prefix.replace('/', '') || 'en-us',
      config: {
        serverEnv: env,
        appName: 'adobe_com',
        appVersion: '1.0',
        appReferrer: '',
      },
      userId,
      isSignedIn,
      userType,
      subscriptionType: 'unspecified',
    });
    await pingService.sendPingEvent({ appPath: 'unity-dc-frictionless', schema: {} });
  } catch (error) {
    logger.error(`Error Code: Unknown, Status: 'Unknown', Message: Failed to send ping: ${error.message}`);
  }
}

const svgCaches = new WeakMap();

async function loadSvg(iconName) {
  try {
    const response = await fetch(`/acrobat/blocks/verb-widget/icons/${iconName}.svg`);
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    return null;
  }
}

export function parseSvg(svgString) {
  return new DOMParser().parseFromString(svgString, 'image/svg+xml').documentElement;
}

export async function createSvgElement(iconName, logger = defaultLogger, icons = ICONS) {
  if (!svgCaches.has(icons)) svgCaches.set(icons, new Map());
  const cache = svgCaches.get(icons);
  if (cache.has(iconName)) return cache.get(iconName).cloneNode(true);
  const svgString = icons[iconName] || await loadSvg(iconName);
  if (!svgString) {
    logger.error(`Error Code: Unknown, Status: 'Unknown', Message: Icon not found: ${iconName}`);
    return null;
  }
  const svgElement = parseSvg(svgString);
  cache.set(iconName, svgElement);
  return svgElement.cloneNode(true);
}

export function getAuthoredVerbIcon(element) {
  const img = element.querySelector('img');
  if (img) return img;
  const svgLink = element.querySelector('a[href$=".svg"]');
  if (!svgLink) return null;
  const icon = document.createElement('img');
  icon.setAttribute('src', svgLink.getAttribute('href'));
  icon.setAttribute('alt', '');
  return icon;
}

const LABEL_PREFIX = 'dc-block-row-';

export function parseAuthoredContent(element, verb) {
  const mph = window.mph || {};
  const labeledCells = new Map();
  const rows = [];
  element.querySelectorAll(':scope > div').forEach((row) => {
    const label = row.firstElementChild?.textContent?.trim() || '';
    if (label.startsWith(LABEL_PREFIX)) {
      labeledCells.set(label.slice(LABEL_PREFIX.length), row.children[1] || null);
      row.remove();
    } else {
      rows.push(row);
    }
  });
  const icon = getAuthoredVerbIcon(element);
  rows.forEach((row) => row.remove());

  const hasAuthoredCopy = rows.length > 2;
  const copy = hasAuthoredCopy ? rows[1].textContent : (mph[`verb-widget-${verb}-description`] ?? '');
  const mobileCopy = hasAuthoredCopy
    ? rows[2].textContent
    : (mph[`verb-widget-${verb}-mobile-description`] ?? copy);

  return {
    heading: rows[0]?.textContent ?? '',
    copy,
    mobileCopy,
    icon,
    cell: (key) => labeledCells.get(key) || null,
    cellText: (key) => labeledCells.get(key)?.textContent?.trim() || '',
  };
}

export function getCtaLabel(verb, limits) {
  const mph = window.mph || {};
  return mph[`verb-widget-cta-${limits?.uploadType}`] || mph['verb-widget-cta'] || 'Select a file';
}

const IOS_UNKNOWN_EXTS = ['.ai', '.psd', '.indd', '.form'];

export function getAcceptValue(acceptedFiles) {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS && acceptedFiles?.some((ext) => IOS_UNKNOWN_EXTS.includes(ext))) return '*/*';
  return acceptedFiles?.join(',');
}

export async function createWidgetFrame() {
  const { createTag } = await loadMiloUtils();
  const widget = createTag('div', { id: 'drop-zone', class: 'verb-wrapper' });
  const widgetContainer = createTag('div', { class: 'verb-container' });
  const widgetRow = createTag('div', { class: 'verb-row' });
  const widgetLeft = createTag('div', { class: 'verb-col' });
  const widgetRight = createTag('div', { class: 'verb-col right' });
  widgetRow.append(widgetLeft, widgetRight);
  widgetContainer.append(widgetRow);
  widget.append(widgetContainer);
  if (isMobileDevice()) {
    widget.classList.add('mobile');
  } else if (isTabletDevice()) {
    widget.classList.add('tablet');
  }
  return { widget, widgetLeft, widgetRight };
}

export async function createWidgetHeader(logger = defaultLogger) {
  const { createTag } = await loadMiloUtils();
  const widgetIcon = createTag('div', { class: 'acrobat-icon' });
  const widgetIconSvg = await createSvgElement('WIDGET_ICON', logger);
  if (widgetIconSvg) {
    widgetIconSvg.classList.add('icon-verb');
    widgetIcon.appendChild(widgetIconSvg);
  }
  const widgetTitle = createTag('div', { class: 'verb-title' }, 'Adobe Acrobat');
  return createTag('div', { class: 'verb-header' }, [widgetIcon, widgetTitle]);
}

export async function createCtaButton(label, logger = defaultLogger) {
  const { createTag } = await loadMiloUtils();
  const button = createTag('button', { for: 'file-upload', class: 'verb-cta', tabindex: 0, 'aria-label': label });
  button.append(createTag('span', { class: 'verb-cta-label' }, label));
  const uploadIconSvg = await createSvgElement('UPLOAD_ICON', logger);
  if (uploadIconSvg) {
    uploadIconSvg.classList.add('upload-icon');
    button.prepend(uploadIconSvg);
  }
  return button;
}

export async function createFileInput(limits) {
  const { createTag } = await loadMiloUtils();
  return createTag('input', {
    type: 'file',
    accept: getAcceptValue(limits.acceptedFiles),
    id: 'file-upload',
    class: 'hide',
    'aria-hidden': true,
    ...(limits.multipleFiles && { multiple: '' }),
  });
}

export async function createVerbImage(verb, authoredIcon, logger = defaultLogger) {
  const { createTag } = await loadMiloUtils();
  const widgetImage = createTag('div', { class: 'verb-image' });
  const verbImage = authoredIcon || await createSvgElement(verb, logger);
  if (verbImage) {
    verbImage.classList.add('icon-verb-image');
    if (!verbImage.getAttribute('alt')) {
      verbImage.setAttribute('alt', window.mph?.[`verb-widget-${verb}-alt`] || verb);
    }
    widgetImage.appendChild(verbImage);
  }
  return widgetImage;
}

export async function createErrorToast(widget, logger = defaultLogger) {
  const { createTag } = await loadMiloUtils();
  const errorState = createTag('div', { class: 'error hide' });
  const errorText = createTag('p', { class: 'verb-errorText' });
  const errorIcon = createTag('div', { class: 'verb-errorIcon' });
  const closeButton = createTag('div', { class: 'verb-errorBtn', role: 'button', tabindex: '0', 'aria-label': 'Close error' });
  const closeIconSvg = await createSvgElement('CLOSE_ICON', logger);
  if (closeIconSvg) {
    closeIconSvg.classList.add('close-icon', 'error');
    closeButton.prepend(closeIconSvg);
  }
  errorState.append(errorIcon, errorText, closeButton);

  const srAlert = { announceTimer: null, cleanupTimer: null };
  const clearSrAlert = () => {
    clearTimeout(srAlert.announceTimer);
    clearTimeout(srAlert.cleanupTimer);
    document.querySelector('.verb-sr-alert')?.remove();
  };
  const announceToScreenReader = (message) => {
    clearSrAlert();
    srAlert.announceTimer = setTimeout(() => {
      const alertEl = createTag('div', {
        class: 'verb-sr-alert',
        role: 'alert',
        style: 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0',
      });
      alertEl.textContent = message;
      document.body.appendChild(alertEl);
      srAlert.cleanupTimer = setTimeout(() => alertEl.remove(), 10000);
    }, 5000);
  };

  let outsideClickHandler = null;
  const hideError = () => {
    errorState.classList.remove('verb-error');
    errorState.classList.add('hide');
    errorText.textContent = '';
    clearSrAlert();
    if (outsideClickHandler) {
      document.removeEventListener('click', outsideClickHandler);
      outsideClickHandler = null;
    }
  };
  const showError = (message) => {
    setDraggingClass(widget, false);
    errorState.classList.add('verb-error');
    errorState.classList.remove('hide');
    errorText.textContent = message;
    announceToScreenReader(message);
    closeButton.focus();
    setTimeout(() => {
      if (outsideClickHandler) return;
      outsideClickHandler = (e) => {
        if (!errorState.contains(e.target)) hideError();
      };
      document.addEventListener('click', outsideClickHandler);
    }, 0);
  };

  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    hideError();
  });
  closeButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      hideError();
    }
  });

  return { errorState, showError, hideError };
}

export async function createFooter(limits, logger = defaultLogger) {
  const { createTag, getConfig } = await loadMiloUtils();
  const isMobile = isMobileDevice();
  if (limits.mobileApp && isMobile) return createTag('div', { class: 'verb-footer' });

  const { locale } = getConfig();
  const mph = window.mph || {};
  const isTablet = isTabletDevice();

  const iconSecurity = createTag('div', { class: 'security-icon' });
  const infoIcon = createTag('div', {
    class: 'info-icon milo-tooltip top',
    tabindex: '0',
    role: 'button',
    'aria-label': mph['verb-widget-tool-tip'] || 'Files security information',
    'data-tooltip': mph['verb-widget-tool-tip'] || '',
  });
  const securityIconSvg = await createSvgElement('SECURITY_ICON', logger);
  const infoIconSvg = await createSvgElement('INFO_ICON', logger);
  if (securityIconSvg) iconSecurity.appendChild(securityIconSvg);
  if (infoIconSvg) infoIcon.appendChild(infoIconSvg);
  if (isMobile) {
    infoIcon.classList.add('mobile');
  } else if (isTablet) {
    infoIcon.classList.add('tablet');
  }

  const legalLinks = [
    ['verb-widget-terms-of-use', mph['verb-widget-terms-of-use-url'] || `https://www.adobe.com${locale.prefix}/legal/terms.html`],
    ['verb-widget-privacy-policy', mph['verb-widget-privacy-policy-url'] || `https://www.adobe.com${locale.prefix}/privacy/policy.html`],
    ...(limits.genAI ? [['verb-widget-genai-guidelines', mph['verb-widget-genai-terms-url'] || `https://www.adobe.com${locale.prefix}/legal/licenses-terms/adobe-gen-ai-user-guidelines.html`]] : []),
  ];
  const legal = createTag('p', { class: 'verb-legal' }, `${mph['verb-widget-legal'] ?? ''} `);
  const legalTwo = createTag('p', { class: 'verb-legal verb-legal-two' }, `${mph['verb-widget-legal-2'] ?? ''} `);
  legalTwo.innerHTML = legalLinks.reduce((html, [key, url]) => {
    const text = mph[key];
    return text ? html.replace(text, `<a class="verb-legal-url" target="_blank" href="${url}">${text}</a>`) : html;
  }, (limits.genAI && mph['verb-widget-legal-2-ai']) || legalTwo.textContent);
  const legalWrapper = createTag('div', { class: 'verb-legal-wrapper' }, [legal, legalTwo]);

  const footer = createTag('div', { class: 'verb-footer' }, [iconSecurity, legalWrapper, infoIcon]);
  if (isMobile && !isTablet) {
    iconSecurity.remove();
    footer.prepend(infoIcon);
  }
  return footer;
}

export async function renderVerbWidget(element, {
  verb,
  limits,
  logger = defaultLogger,
  getActions,
}) {
  const { createTag } = await loadMiloUtils();
  const mph = window.mph || {};
  const content = parseAuthoredContent(element, verb);
  const isMobileOrTablet = isMobileDevice() || isTabletDevice();

  const { widget, widgetLeft, widgetRight } = await createWidgetFrame();
  const header = await createWidgetHeader(logger);
  const heading = createTag('h1', { class: 'verb-heading' }, content.heading);
  const copy = createTag('p', { class: 'verb-copy' }, isMobileOrTablet ? content.mobileCopy : content.copy);
  if (limits.subCopy && !isMobileOrTablet) {
    const subCopy = content.cellText('sub-copy') || mph[`verb-widget-${verb}-sub-description`];
    copy.append(createTag('p', { class: 'verb-copy verb-sub-copy' }, subCopy));
  }
  const ctaButton = await createCtaButton(getCtaLabel(verb, limits), logger);
  const fileInput = await createFileInput(limits);
  const verbImage = await createVerbImage(verb, content.icon, logger);
  const { errorState, showError, hideError } = await createErrorToast(widget, logger);

  const parts = { content, widget, ctaButton, fileInput, isMobileOrTablet };
  const actions = getActions?.(parts) ?? [ctaButton, fileInput];
  widgetLeft.append(header, heading, copy, ...actions, errorState);
  widgetRight.append(verbImage);

  const footer = await createFooter(limits, logger);
  element.append(widget, footer);

  return { ...parts, errorState, showError, hideError, footer };
}

async function loadGoogleLogin() {
  if (window.adobeIMS?.isSignedInUser()) return;
  const [miloUtils, { default: initGoogleLogin }] = await Promise.all([
    loadMiloUtils(),
    import(`${miloLibs}/features/google-login.js`),
  ]);
  const { loadIms, getMetadata, loadScript, getConfig } = miloUtils;
  initGoogleLogin(loadIms, getMetadata, loadScript, getConfig);
}

async function showUpSell(verb, element) {
  const { createTag, loadBlock } = await loadMiloUtils();
  const mph = window.mph || {};
  const headline = mph[`verb-widget-upsell-headline-${verb}`] || mph['verb-widget-upsell-headline'];
  const headlineNopayment = mph['verb-widget-upsell-headline-nopayment'];
  const bulletsHeading = mph['verb-widget-upsell-bullets-heading'];
  const bullets = mph[`verb-widget-upsell-bullets-${verb}`] || mph['verb-widget-upsell-bullets'];

  const headlineEl = createTag('h1', { class: 'verb-upsell-heading' }, headline);
  const headingNopaymentEl = createTag('h1', { class: 'verb-upsell-heading verb-upsell-heading-nopayment' }, headlineNopayment);
  const upsellBulletsHeading = createTag('p', { class: 'verb-upsell-bullets-heading' }, bulletsHeading);
  const upsellBullets = createTag('ul', { class: 'verb-upsell-bullets' });
  (bullets || '').split('\n').forEach((bullet) => upsellBullets.append(createTag('li', {}, bullet)));
  const upsellColumn = createTag('div', { class: 'verb-upsell-column' }, [headlineEl, headingNopaymentEl, upsellBulletsHeading, upsellBullets]);

  const socialCta = createTag('div', { class: 'susi-light' });
  socialCta.innerHTML = `<div><div>${redDirLink(verb)}</div></div>`;
  const socialContainer = createTag('div', { class: 'verb-upsell-social-container' }, socialCta);
  await loadBlock(socialCta);

  const upsellRow = createTag('div', { class: 'verb-row' }, [upsellColumn, socialContainer]);
  const upsell = createTag('div', { class: 'verb-upsell' }, upsellRow);
  const upsellContainer = createTag('div', { class: 'verb-container' }, upsell);
  const upsellWidget = createTag('div', { class: 'verb-wrapper verb-upsell-active' }, upsellContainer);

  element.classList.add('upsell');
  element.append(upsellWidget);

  loadGoogleLogin();
}

export async function handleUpSell(verb, element, userAttempts, logger = defaultLogger) {
  if (window.adobeIMS?.isSignedInUser?.() || !isLimitExhausted(verb)) return;
  await showUpSell(verb, element);
  fireUpsellAnalytics(verb, userAttempts, logger);
}

export function handleSignedInUser({
  element,
  verb,
  limits,
  fileInput,
}) {
  const redirectSignedInUser = () => {
    if (!window.adobeIMS?.isSignedInUser?.()) return;
    element.classList.remove('upsell');
    element.classList.add('signed-in');
    if (limits.signedInAcceptedFiles) {
      fileInput.accept = [...limits.acceptedFiles, ...limits.signedInAcceptedFiles];
    }
    redDir(verb);
  };
  redirectSignedInUser();
  window.addEventListener('IMS:Ready', redirectSignedInUser);
}

export function revealWidget(element) {
  const prerenderElement = document.querySelector('#prerender_verb-widget');
  element.classList.add('ready');
  element.parentNode.style.display = 'block';
  requestAnimationFrame(() => requestAnimationFrame(() => prerenderElement?.remove()));
}

export function formatErrorLog(blockName, verb, {
  code,
  status,
  message,
  info,
  accountType,
}) {
  const fields = [
    ['Error Code', code],
    ['Status', status],
    ['Message', message],
    ['Info', info],
    ['Account Type', accountType],
  ]
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value]) => `${label}: ${value}`);
  return `${blockName}: ${verb}; ${fields.join(', ')}`;
}

export function createUploadSession({
  verb,
  limits,
  userAttempts,
  widget,
  showError,
  logger = defaultLogger,
  env = getEnv(),
}) {
  const splunkEndpoint = getSplunkEndpoint(env);
  const state = {
    exitFlag: false,
    isUploading: false,
    tabClosureSent: false,
    noOfFiles: null,
    soloClicked: false,
  };
  const exitWatches = [];
  const withMetadata = (data) => ({ ...data, userAttempts, noOfFiles: state.noOfFiles });
  const track = (eventName, metadata, documentUnloading = true, sendToSplunk = true) => (
    trackAnalyticsEvent(verb, eventName, metadata, documentUnloading, sendToSplunk, env)
  );

  function sendTabClosure(event, metadata, workflowStep) {
    if (state.exitFlag || state.tabClosureSent) return;
    if (state.isUploading && workflowStep === 'preuploading') return;
    state.tabClosureSent = true;
    const uploadingStartTime = parseInt(getCookie('UTS_Uploading'), 10);
    const duration = uploadingStartTime ? ((Date.now() - uploadingStartTime) / 1000).toFixed(1) : 'N/A';
    window.analytics.verbAnalytics('job:browser-tab-closure', verb, metadata, false);
    window.analytics.sendAnalyticsToSplunk('job:browser-tab-closure', verb, { ...metadata, workflowStep, uploadTime: duration }, splunkEndpoint, true);
    if (!state.isUploading) return;
    event.preventDefault();
    event.returnValue = true;
  }

  window.addEventListener('beforeunload', (event) => {
    if (state.exitFlag) setRedirectCookie();
    exitWatches.forEach(({ metadata, workflowStep }) => {
      sendTabClosure(event, metadata, workflowStep);
    });
  });

  const lifecycle = {
    change(data, sendToSplunk) {
      const metadata = withMetadata(data);
      state.exitFlag = false;
      track('choose-file:open', metadata, true, sendToSplunk);
      exitWatches.push({ metadata, workflowStep: 'preuploading' });
    },
    drop(data, sendToSplunk) {
      const metadata = withMetadata(data);
      state.exitFlag = false;
      FILES_DROPPED_EVENTS.forEach((eventName) => track(eventName, metadata, true, sendToSplunk));
      setDraggingClass(widget, false);
      exitWatches.push({ metadata, workflowStep: 'preuploading' });
    },
    cancel(data, sendToSplunk) {
      if (state.exitFlag) return;
      track('job:cancel', withMetadata(data), true, sendToSplunk);
      state.exitFlag = true;
    },
    uploading(data, sendToSplunk) {
      state.isUploading = true;
      state.exitFlag = false;
      prefetchTarget();
      const metadata = withMetadata(data);
      track('job:uploading', metadata, false, sendToSplunk);
      if (limits?.multipleFiles) track('job:multi-file-uploading', metadata, false, sendToSplunk);
      setCookie('UTS_Uploading', Date.now());
      exitWatches.push({ metadata, workflowStep: 'uploading' });
    },
    uploaded(data, sendToSplunk) {
      state.exitFlag = true;
      const uploadedAt = Date.now();
      setCookie('UTS_Uploaded', uploadedAt);
      const metadata = { ...data, uploadTime: uploadedTime(), userAttempts };
      track('job:uploaded', metadata, false, sendToSplunk);
      if (limits?.multipleFiles) track('job:multi-file-uploaded', metadata, false, sendToSplunk);
      setUser();
      incrementVerbKey(`${verb}_attempts`);
      return uploadedAt;
    },
    redirectUrl(data, sendToSplunk) {
      if (data) initiatePrefetch(data.redirectUrl);
      if (state.isUploading) prefetchTarget();
      track('job:redirect-success', withMetadata(data), false, sendToSplunk);
    },
    chunk_uploaded(data, sendToSplunk) {
      if (!sendToSplunk) return;
      window.analytics.sendAnalyticsToSplunk('job:chunk-uploaded', verb, withMetadata(data), splunkEndpoint);
    },
  };

  function reportError(detail = {}) {
    const {
      code,
      message,
      info,
      metaData,
      errorData,
      sendToSplunk = true,
    } = detail;
    if (!code) return;
    if (message) showError(message);
    logger.error(formatErrorLog(logger.blockName, verb, detail));
    if (code.includes('cookie_not_set')) return;
    const key = Object.keys(errorAnalyticsMap).find((k) => code.includes(k));
    if (key) {
      const eventName = errorAnalyticsMap[key];
      window.analytics.verbAnalytics(eventName, verb, eventName === 'error' ? { errorInfo: info } : {});
    }
    if (sendToSplunk) {
      const splunkData = { ...metaData, errorData };
      window.analytics.sendAnalyticsToSplunk(key, verb, splunkData, splunkEndpoint);
    }
    state.exitFlag = true;
  }

  return {
    verb,
    limits,
    userAttempts,
    logger,
    state,
    setFileCount: (count) => { state.noOfFiles = count; },
    track: (event, data, sendToSplunk = true) => lifecycle[event]?.(data, sendToSplunk),
    reportError,
    redirect(url, data) {
      track('job:redirect-success', withMetadata({ ...data, redirectUrl: url }), false);
      window.location.href = url;
    },
  };
}

export function bindFilePicker({ widget, fileInput }, session, onFiles = () => {}) {
  const { verb, userAttempts, state } = session;

  widget.addEventListener('click', (e) => {
    if (e.target.closest('.error, .demo-cta') || e.target.classList.contains('demo-button-wrapper')) return;
    if (fileInput.isConnected) fileInput.click();
  });

  fileInput.addEventListener('click', () => {
    if (state.soloClicked) {
      state.soloClicked = false;
      return;
    }
    FILE_PICKER_EVENTS.forEach((eventName) => {
      window.analytics.verbAnalytics(eventName, verb, { userAttempts });
    });
  });

  fileInput.addEventListener('change', ({ target: { files } }) => {
    if (!files?.length) return;
    session.setFileCount(files.length);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onFiles(files, 'change');
  });

  fileInput.addEventListener('cancel', () => {
    window.analytics.verbAnalytics('choose-file:close', verb, { userAttempts });
  });

  widget.addEventListener('dragover', (e) => {
    e.preventDefault();
    setDraggingClass(widget, true);
  });

  widget.addEventListener('dragleave', () => setDraggingClass(widget, false));

  widget.addEventListener('drop', (e) => {
    e.preventDefault();
    setDraggingClass(widget, false);
    const files = e.dataTransfer?.files;
    if (!files?.length) return;
    session.setFileCount(files.length);
    onFiles(files, 'drop');
  });
}

function dispatchRedirectReady(limits, logger) {
  const redirectReady = new CustomEvent('DCUnity:RedirectReady');
  if (limits.noRedirectTimeout ?? true) {
    window.dispatchEvent(redirectReady);
    return;
  }
  setTimeout(() => {
    window.dispatchEvent(redirectReady);
    logger.warn('Adobe Analytics done callback failed to trigger, 3 second timeout dispatched event.');
  }, 3000);
}

export function bindUnityEvents(element, session) {
  element.addEventListener('unity:track-analytics', (e) => {
    const { event, data, sendToSplunk } = e.detail || {};
    if (!event) return;
    if (event === 'uploaded') dispatchRedirectReady(session.limits, session.logger);
    session.track(event, data, sendToSplunk ?? true);
  });
  element.addEventListener('unity:show-error-toast', (e) => session.reportError(e.detail));
}

function bindSoloUploadLinks({ verb, userAttempts, state }) {
  document.querySelectorAll('a[href*="#upload"]').forEach((link) => {
    const verbCtaClone = document.querySelector('.verb-cta')?.cloneNode(true);
    if (!verbCtaClone) return;
    const label = document.createElement('label');
    Object.entries({
      for: 'file-upload',
      class: 'verb-cta verb-cta-solo',
      tabindex: 0,
      'daa-ll': verbCtaClone.textContent,
      'aria-label': verbCtaClone.textContent,
    }).forEach(([name, value]) => label.setAttribute(name, value));
    label.innerHTML = verbCtaClone.innerHTML;
    link.closest('div').append(label);
    link.remove();
    label.addEventListener('click', () => {
      state.soloClicked = true;
      SOLO_PICKER_EVENTS.forEach((eventName) => {
        window.analytics.verbAnalytics(eventName, verb, { userAttempts });
      });
    });
  });
}

export function startPageServices(element, session) {
  reloadOnHistoryTraversal();
  onDocumentReady(() => {
    bindSoloUploadLinks(session);
    initializePingService(session.logger);
    if (!element.dataset.dcInjectedFromMarquee) {
      const { verb, userAttempts } = session;
      window.dispatchEvent(new CustomEvent('analyticsLoad', { detail: { verb, userAttempts } }));
    }
  });
}
