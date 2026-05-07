/* eslint-disable compat/compat */

function readSessionLocale(key) {
  const value = sessionStorage.getItem(key);
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return parsed.country?.toLowerCase() || '';
    }
  } catch { /* not JSON */ }
  return value.toLowerCase();
}

function getPageLang() {
  const seg = (window.location?.pathname || '').split('/').filter(Boolean)[0];
  return seg && /^[a-z]{2}$/i.test(seg) ? seg.toLowerCase() : '';
}

function getPagePrefix() {
  const seg = (window.location?.pathname || '').split('/').filter(Boolean)[0];
  return seg ? seg.toLowerCase() : '';
}

function placeholderUrl(prefix) {
  return prefix === '' ? '/dc-shared/placeholders.json' : `/${prefix}/dc-shared/placeholders.json`;
}

function resolvePrefix(locales, country, lang, pagePrefix) {
  const norm = country === 'us' ? '' : country;
  const candidates = [
    norm,
    country && lang && country !== lang ? `${country}_${lang}` : null,
    pagePrefix,
  ];
  for (const candidate of candidates) {
    if (candidate != null && candidate in locales) return candidate;
  }
  return null;
}

async function fetchPlaceholders(locale, locales) {
  const lang = getPageLang();
  const pagePrefix = getPagePrefix();

  if (locales && typeof locales === 'object') {
    const prefix = resolvePrefix(locales, locale, lang, pagePrefix);
    if (prefix === null) return { status: 404, json: async () => ({}) };
    return fetch(placeholderUrl(prefix));
  }

  const primary = await fetch(placeholderUrl(locale === 'us' ? '' : locale));
  if (primary.status === 200) return primary;

  if (locale && /^[a-z]{2}$/.test(locale) && locale !== 'us' && lang && lang !== locale) {
    const langFallback = await fetch(placeholderUrl(`${locale}_${lang}`));
    if (langFallback.status === 200) return langFallback;
  }

  if (pagePrefix && pagePrefix !== locale) {
    const prefixFallback = await fetch(placeholderUrl(pagePrefix));
    if (prefixFallback.status === 200) return prefixFallback;
  }

  return primary;
}

export default async function geoPhoneNumber(locales) {
  const geoTwo = await fetch('https://geo2.adobe.com/json/');
  const urlParams = new URLSearchParams(window.location.search);
  const geoData = await geoTwo.json();

  const newLocale = readSessionLocale('international')
  || urlParams.get('akamaiLocale')?.toLowerCase()
  || geoData?.country?.toLowerCase()
  || readSessionLocale('feds_location')
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

  const placeHolderJson = await fetchPlaceholders(newLocale, locales);
  if (placeHolderJson.status !== 200) return;
  const placeHolderJsonData = await placeHolderJson.json();
  placeHolderJsonData.data = placeHolderJsonData.data.map((val) => ({
    ...val,
    value: val.value.replace(/\u00A0/g, ' '),
  }));
  window.dcpns = placeHolderJsonData.data;
  const globalPhoneNumbers = new CustomEvent('DCNumbers:Ready');
  window.dispatchEvent(globalPhoneNumbers);

  document.querySelectorAll('a[class*="geo-pn"]').forEach((phoneNumber) => {
    const numberType = phoneNumber.getAttribute('number-type');
    const numberID = phoneNumber.classList[0];
    placeHolderJsonData.data.forEach((val) => {
      if (val.key === numberType) {
        updatePhoneNumber(val.value, numberID);
      }
    });
  });
}

const frags = document.querySelectorAll('.fragment [href*="tel"]');
window.addEventListener('DCNumbers:Ready', () => {
  frags.forEach((f) => {
    const fragPhoneType = `phone-${f.href.split(' ')[1]}`;
    window.dcpns.forEach((val) => {
      if (val.key === fragPhoneType) {
        f.innerText = val.value;
        f.href = `tel: ${val.value}`;
      }
    });
  });
});
