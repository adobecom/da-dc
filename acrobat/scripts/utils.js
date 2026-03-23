/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

/**
 * The decision engine for where to get Milo's libs from.
 */
export const [setLibs, getLibs] = (() => {
  let libs;
  return [
    (prodLibs, location) => {
      libs = (() => {
        const { hostname, search } = location || window.location;
        if (!['.aem.', '.hlx.', '.stage.', 'local', '.da.'].some((i) => hostname.includes(i))) return prodLibs;
        // eslint-disable-next-line compat/compat
        const branch = new URLSearchParams(search).get('milolibs') || 'main';
        if (branch === 'main' && hostname === 'www.stage.adobe.com') return '/libs';
        if (branch === 'local') return 'http://localhost:6456/libs';
        return `https://${branch}${branch.includes('--') ? '' : '--milo--adobecom'}.aem.live/libs`;
      })();
      return libs;
    },
    () => libs,
  ];
})();

export function getEnv() {
  const { hostname } = window.location;
  if (['www.adobe.com', 'sign.ing', 'edit.ing'].includes(hostname)) return 'prod';
  if (
    [
      'stage--dc--adobecom.hlx.page',
      'main--dc--adobecom.hlx.page',
      'stage--dc--adobecom.hlx.live',
      'main--dc--adobecom.hlx.live',
      'stage--dc--adobecom.aem.page',
      'main--dc--adobecom.aem.page',
      'stage--dc--adobecom.aem.live',
      'main--dc--adobecom.aem.live',
      'www.stage.adobe.com',
    ].includes(hostname)
  ) return 'stage';
  return 'dev';
}

export function isOldBrowser() {
  const { name, version } = window?.browser || {};
  return (
    name === 'Internet Explorer'
    || (name === 'Microsoft Edge' && (!version || version.split('.')[0] < 86))
    || (name === 'Safari' && version.split('.')[0] < 14)
  );
}

/**
 * Loads placeholders, if SOME were not already loaded
 * @param {string | string[] | undefined} prefix Optional prefix, or list of prefixes, for loading specific placeholders.
 * With multiple prefixes, fetches unless window.mph already has at least one key for each prefix (not merely any match).
 */
export async function loadPlaceholders(prefix) {
  const miloLibs = setLibs('/libs');
  const { getConfig } = await import(`${miloLibs}/utils/utils.js`);
  const config = getConfig();

  let prefixes;
  if (prefix == null) prefixes = [];
  else if (Array.isArray(prefix)) prefixes = prefix;
  else prefixes = [prefix];
  const keyMatches = (key) => prefixes.length === 0 || prefixes.some((p) => key.startsWith(p));

  window.mph = window.mph || {};

  const mphKeyList = Object.keys(window.mph);
  const allCovered = (prefixes.length === 0 && mphKeyList.length > 0)
    || (prefixes.length > 0 && prefixes.every((p) => mphKeyList.some((k) => k.startsWith(p))));

  if (!allCovered) {
    const placeholdersPath = `${config.locale.contentRoot}/placeholders.json`;
    try {
      const response = await fetch(placeholdersPath);
      if (response.ok) {
        const placeholderData = await response.json();
        placeholderData.data.forEach(({ key, value }) => {
          if (prefixes.length && !keyMatches(key)) return;
          window.mph[key] = value.replace(/\u00A0/g, ' ');
        });
      }
    } catch (error) {
      window.lana?.log(`Failed to load placeholders: ${error?.message}`);
    }
  }
}
