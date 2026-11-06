/* eslint-disable compat/compat */

const COUNTRY_ALIASES = { gb: 'uk' };
// Language sites in these countries carry different numbers; pin the right one.
const PREFERRED_LOCALE = { lu: 'lu_en' };

const hasKey = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

function readSavedLocale(key) {
  const value = sessionStorage.getItem(key);
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') return parsed.country?.toLowerCase() || '';
    if (typeof parsed === 'string') return parsed.toLowerCase();
  } catch { /* plain prefix string, e.g. "de" or "ch_de" */ }
  return value.replace(/^\/+|\/+$/g, '').toLowerCase();
}

function getPagePrefix(locales) {
  const seg = (window.location?.pathname || '').split('/').filter(Boolean)[0]?.toLowerCase() || '';
  if (!locales) return seg;
  return hasKey(locales, seg) ? seg : '';
}

function getPageLang(locales, pagePrefix) {
  const ietfLang = locales?.[pagePrefix]?.ietf?.split('-')[0]?.toLowerCase();
  return ietfLang || pagePrefix.split('_').pop();
}

function getCandidates(saved, locales, pagePrefix) {
  const [rawCountry, savedLang] = saved.split('_');
  const country = hasKey(COUNTRY_ALIASES, rawCountry) ? COUNTRY_ALIASES[rawCountry] : rawCountry;
  const candidates = [];
  if (country) {
    const lang = savedLang || getPageLang(locales, pagePrefix);
    candidates.push(
      country === 'us' ? '' : country,
      hasKey(PREFERRED_LOCALE, country) ? PREFERRED_LOCALE[country] : undefined,
      lang ? `${country}_${lang}` : undefined,
      ...Object.keys(locales || {}).filter((key) => key.startsWith(`${country}_`)),
    );
  }
  candidates.push(pagePrefix);
  return [...new Set(candidates)]
    .filter((c) => c !== undefined && (!locales || hasKey(locales, c)));
}

const placeholderUrl = (prefix) => `${prefix ? `/${prefix}` : ''}/dc-shared/placeholders.json`;
const fragKey = (link) => `phone-${link.href.split(' ')[1]}`;

function getNeededKeys() {
  const keys = [
    ...[...document.querySelectorAll('a[class*="geo-pn"]')].map((a) => a.getAttribute('number-type')),
    ...[...document.querySelectorAll('.fragment [href*="tel"]')].map(fragKey),
  ].filter(Boolean);
  return keys.length ? keys : ['phone-business'];
}

async function loadNumbers(candidates, neededKeys) {
  let fallback;
  let status;
  for (const prefix of candidates) {
    const resp = await fetch(placeholderUrl(prefix)).catch(() => ({ status: 'error' }));
    status = resp.status;
    if (resp.status === 200) {
      const json = await resp.json();
      const data = (json.data || []).map((val) => ({
        ...val,
        value: (val.value || '').replace(/\u00A0/g, ' '),
      }));
      if (data.some((val) => val.value && neededKeys.includes(val.key))) return { data };
      fallback ||= { data };
    }
  }
  return fallback || { status };
}

function hasDigits(href) {
  try {
    return /\d/.test(decodeURIComponent(href));
  } catch {
    return /\d/.test(href);
  }
}

// Unresolved placeholder links: dial the number the visitor can see.
function repairTelLinks() {
  document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
    if (hasDigits(a.getAttribute('href'))) return;
    const number = a.textContent.replace(/[^\d+]/g, '');
    if (/\d{5,}/.test(number)) a.href = `tel:${number}`;
  });
}

export default async function geoPhoneNumber(locales) {
  const dcLocales = locales && typeof locales === 'object' ? locales : null;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const geoData = await fetch('https://geo2.adobe.com/json/')
      .then((resp) => resp.json())
      .catch(() => ({}));

    const saved = readSavedLocale('international')
    || urlParams.get('akamaiLocale')?.toLowerCase()
    || geoData?.country?.toLowerCase()
    || readSavedLocale('feds_location')
    || '';

    const updatePhoneNumber = (visNum, i) => {
      const phoneNumberEle = document.querySelector(`.${i}`);
      phoneNumberEle.href = `tel:${visNum}`;

      const firstChild = phoneNumberEle.childNodes[0];
      const secondChild = phoneNumberEle.childNodes[1];
      const isIconFirst = firstChild?.nodeType === Node.ELEMENT_NODE && firstChild.classList.contains('icon');
      if (isIconFirst && secondChild) {
        if (secondChild.nodeType === Node.TEXT_NODE) secondChild.nodeValue = visNum;
        else phoneNumberEle.textContent = visNum;
      } else {
        phoneNumberEle.textContent = visNum;
      }
    };

    const pagePrefix = getPagePrefix(dcLocales);
    const candidates = getCandidates(saved, dcLocales, pagePrefix);
    const { data, status } = await loadNumbers(candidates, getNeededKeys());
    if (!data) {
      window.lana?.log(
        `Geo Phone: phone placeholder request failed; HTTP ${status ?? 'none'}; country ${/^[a-z_]{2,8}$/.test(saved) ? saved : 'unknown'}`,
        { severity: 'error', tags: 'DC_Milo,geo-phone' },
      );
      return;
    }
    window.dcpns = data;
    window.dispatchEvent(new CustomEvent('DCNumbers:Ready'));

    document.querySelectorAll('a[class*="geo-pn"]').forEach((phoneNumber) => {
      const numberType = phoneNumber.getAttribute('number-type');
      const numberID = phoneNumber.classList[0];
      data.forEach((val) => {
        if (val.key === numberType && val.value) {
          updatePhoneNumber(val.value, numberID);
        }
      });
    });
  } finally {
    repairTelLinks();
  }
}

window.addEventListener('DCNumbers:Ready', () => {
  document.querySelectorAll('.fragment [href*="tel"]').forEach((f) => {
    const fragPhoneType = fragKey(f);
    window.dcpns.forEach((val) => {
      if (val.key === fragPhoneType && val.value) {
        f.innerText = val.value;
        f.href = `tel: ${val.value}`;
      }
    });
  });
});
