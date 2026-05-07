/* eslint-disable compat/compat */
import { getEnv } from './utils.js';

export default async function geoPhoneNumber() {
  const geoTwo = await fetch('https://geo2.adobe.com/json/');
  const urlParams = new URLSearchParams(window.location.search);
  const geoData = await geoTwo.json();

  let newLocale = JSON.parse(sessionStorage.getItem('international'))?.country?.toLowerCase()
  || urlParams.get('akamaiLocale')?.toLowerCase()
  || geoData?.country?.toLowerCase()
  || JSON.parse(sessionStorage.getItem('international'))?.country?.toLowerCase()
  || JSON.parse(sessionStorage.getItem('feds_location'))?.country?.toLowerCase()
  || '';

  if (newLocale === 'us' || newLocale === '/' || newLocale === '//') {
    newLocale = '/';
  } else {
    newLocale = `/${newLocale}/`;
  }
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

  const placeHolderJson = await fetch(`${newLocale}dc-shared/placeholders.json`);
  if (placeHolderJson.status !== 200) return;
  const placeHolderJsonData = await placeHolderJson.json();
  placeHolderJsonData.data = placeHolderJsonData.data.map((val) => ({
    ...val,
    value: val.value.replace(/\u00A0/g, ' '),
  }));

  let navPlaceholderData = null;
  if (document.querySelector('.global-navigation a[class*="geo-pn"]')) {
    const baseUrl = `https://www.${getEnv() === 'prod' ? '' : 'stage.'}adobe.com`;
    const navPlaceholderJson = await fetch(`${baseUrl}${newLocale}federal/globalnav/placeholders.json`);
    if (navPlaceholderJson.status === 200) {
      const navData = await navPlaceholderJson.json();
      navPlaceholderData = navData.data.map((val) => ({ ...val, value: val.value.replace(/\u00A0/g, ' ') }));
    }
  }

  window.dcpns = placeHolderJsonData.data;
  const globalPhoneNumbers = new CustomEvent('DCNumbers:Ready');
  window.dispatchEvent(globalPhoneNumbers);

  document.querySelectorAll('a[class*="geo-pn"]').forEach((phoneNumber) => {
    const numberType = phoneNumber.getAttribute('number-type');
    const numberID = phoneNumber.classList[0];
    const data = (phoneNumber.closest('.global-navigation') && navPlaceholderData)
      ? navPlaceholderData : placeHolderJsonData.data;
    data.forEach((val) => {
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
