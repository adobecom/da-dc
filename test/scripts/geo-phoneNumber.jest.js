/**
 * @jest-environment jsdom
 */
/* eslint-env jest */
import geoPhoneNumber from '../../acrobat/scripts/geo-phoneNumber';

// Mocking fetch API
window.fetch = jest.fn((url) => {
  const response = {
    status: 200,
    json: () => {
      if (url.includes('dc-shared/placeholders.json')) {
        return Promise.resolve({ data: [{ key: 'phone-business', value: '800\u00A0915\u00A09430' }]});
      }
      return Promise.resolve({ country: 'us' });
    },
  };
  return Promise.resolve(response);
});

// Mocking sessionStorage
global.sessionStorage = {
  getItem: jest.fn(() => JSON.stringify({ country: 'us' })),
};

// Mocking window.location
delete window.location;
window.location = { search: '?akamaiLocale=de' };

// Mocking document.querySelector and document.querySelectorAll
// document.querySelector = jest.fn();
// document.querySelectorAll = jest.fn();
document.body.innerHTML = '<header><main><p class="geo-pn3" number-type="phone-enterprise"><a href="tel:800-915-9430" number-type="phone-enterprise">800-915-9430</a></p></main></header>';

describe('geoPhoneNumber', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should call fetch with the correct URL', async () => {
    await geoPhoneNumber();
    expect(fetch).toHaveBeenCalledWith('https://geo2.adobe.com/json/');
  });

  it('should get the correct locale', async () => {
    await geoPhoneNumber();
  });

  it('should update phone numbers correctly', async () => {
    await geoPhoneNumber(document.body.innerHTML);
    expect(document.querySelector('.geo-pn3').innerHTML).toBe('<a href="tel:800-915-9430" number-type="phone-enterprise">800-915-9430</a>');
  });

  it('should dispatch a custom event when phone numbers are ready', async () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    await geoPhoneNumber();
    expect(dispatchEventSpy).toHaveBeenCalled();
    expect(dispatchEventSpy.mock.calls[0][0] instanceof CustomEvent).toBe(true);
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe('DCNumbers:Ready');
  });

  it('should remove special characters for empty space', async () => {
    document.body.innerHTML = '<header><main><p class="geo-pn3"><a class="geo-pn" number-type="phone-business" href="tel:%20%7B%7Bphone-business-geo%7D%7D">{{phone-business}}</a></p></main></header>';
    await geoPhoneNumber();
    const phoneLink = document.querySelector('.geo-pn3 a');
    expect(phoneLink.textContent).toEqual('800 915 9430');
    expect(phoneLink.href).toEqual('tel:800 915 9430');
  })
});

function makeFetchMock(routes = [], geoCountry = 'US') {
  return jest.fn(async (url) => {
    if (url === 'https://geo2.adobe.com/json/') {
      return { status: 200, json: async () => ({ country: geoCountry }) };
    }
    const route = routes.find((r) => (typeof r.match === 'function' ? r.match(url) : r.match === url));
    if (route) {
      return { status: route.status, json: async () => route.data || { data: [] } };
    }
    return { status: 404, json: async () => ({}) };
  });
}

describe('geoPhoneNumber - patch behavior', () => {
  let originalFetch;
  let originalLocation;

  beforeAll(() => {
    originalFetch = window.fetch;
    originalLocation = window.location;
  });

  afterAll(() => {
    window.fetch = originalFetch;
    delete window.location;
    window.location = originalLocation;
  });

  beforeEach(() => {
    window.sessionStorage.clear();
    document.body.innerHTML = '<a class="geo-pn3 geo-pn" number-type="phone-business" href="tel:%7B%7Bphone-business-geo%7D%7D">{{phone-business}}</a>';
  });

  function setLocation(pathname, search = '') {
    delete window.location;
    window.location = { pathname, search };
  }

  function placeholderFetchUrls() {
    return window.fetch.mock.calls
      .map((c) => c[0])
      .filter((u) => u !== 'https://geo2.adobe.com/json/');
  }

  it('reads sessionStorage.international as a plain string without throwing (current Milo shape)', async () => {
    window.sessionStorage.setItem('international', 'be_fr');
    setLocation('/fr/');
    window.fetch = makeFetchMock([
      {
        match: '/be_fr/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '+32 1 234 5678' }] },
      },
    ]);

    await expect(geoPhoneNumber()).resolves.not.toThrow();
    expect(placeholderFetchUrls()).toContain('/be_fr/dc-shared/placeholders.json');
    expect(document.querySelector('.geo-pn3').textContent).toBe('+32 1 234 5678');
  });

  it('still understands the legacy JSON shape (backward-compatible)', async () => {
    window.sessionStorage.setItem('international', JSON.stringify({ country: 'BE' }));
    setLocation('/fr/');
    window.fetch = makeFetchMock([
      { match: '/be/dc-shared/placeholders.json', status: 404 },
      {
        match: '/be_fr/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '+32 1 234 5678' }] },
      },
    ]);

    await geoPhoneNumber();
    expect(placeholderFetchUrls()).toEqual(expect.arrayContaining([
      '/be/dc-shared/placeholders.json',
      '/be_fr/dc-shared/placeholders.json',
    ]));
  });

  it('does not throw when sessionStorage.international is unparseable garbage', async () => {
    window.sessionStorage.setItem('international', 'asdf%%notvalid');
    setLocation('/fr/');
    window.fetch = makeFetchMock([]);

    await expect(geoPhoneNumber()).resolves.not.toThrow();
  });

  it('falls back from /be/ to /be_fr/ when the primary 404s and the page lang is fr', async () => {
    setLocation('/fr/foo/bar', '?akamaiLocale=be');
    window.fetch = makeFetchMock([
      { match: '/be/dc-shared/placeholders.json', status: 404 },
      {
        match: '/be_fr/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '+32 1 234 5678' }] },
      },
    ]);

    await geoPhoneNumber();
    expect(placeholderFetchUrls()).toEqual([
      '/be/dc-shared/placeholders.json',
      '/be_fr/dc-shared/placeholders.json',
    ]);
  });

  it('falls back to the page URL prefix when both country and country+lang 404 (gb on /uk/)', async () => {
    setLocation('/uk/foo', '?akamaiLocale=gb');
    window.fetch = makeFetchMock([
      { match: '/gb/dc-shared/placeholders.json', status: 404 },
      { match: '/gb_uk/dc-shared/placeholders.json', status: 404 },
      {
        match: '/uk/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '+44 800 000 0000' }] },
      },
    ]);

    await geoPhoneNumber();
    expect(placeholderFetchUrls()).toEqual([
      '/gb/dc-shared/placeholders.json',
      '/gb_uk/dc-shared/placeholders.json',
      '/uk/dc-shared/placeholders.json',
    ]);
  });

  it('falls back to /africa/ for a sub-Saharan country on a regional page', async () => {
    setLocation('/africa/foo', '?akamaiLocale=ke');
    window.fetch = makeFetchMock([
      { match: '/ke/dc-shared/placeholders.json', status: 404 },
      {
        match: '/africa/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '+27 11 555 0100' }] },
      },
    ]);

    await geoPhoneNumber();
    expect(placeholderFetchUrls()).toEqual([
      '/ke/dc-shared/placeholders.json',
      '/africa/dc-shared/placeholders.json',
    ]);
  });

  it('honors language encoded in the URL prefix (Arabic MENA via /mena_ar/)', async () => {
    setLocation('/mena_ar/foo', '?akamaiLocale=eg');
    window.fetch = makeFetchMock([
      { match: '/eg/dc-shared/placeholders.json', status: 404 },
      {
        match: '/mena_ar/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '+20 2 1234 5678' }] },
      },
    ]);

    await geoPhoneNumber();
    expect(placeholderFetchUrls()).toEqual([
      '/eg/dc-shared/placeholders.json',
      '/mena_ar/dc-shared/placeholders.json',
    ]);
  });

  it('does not issue a fallback fetch for single-prefix locales like /de/ (regression guard)', async () => {
    setLocation('/de/', '?akamaiLocale=de');
    window.fetch = makeFetchMock([
      {
        match: '/de/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '+49 800 000 0000' }] },
      },
    ]);

    await geoPhoneNumber();
    expect(placeholderFetchUrls()).toEqual(['/de/dc-shared/placeholders.json']);
  });
});

describe('geoPhoneNumber - validates path against CONFIG.locales', () => {
  const dcLocales = {
    '': { ietf: 'en-US' },
    de: { ietf: 'de-DE' },
    fr: { ietf: 'fr-FR' },
    uk: { ietf: 'en-GB' },
    africa: { ietf: 'en' },
    mena_ar: { ietf: 'ar' },
    be_fr: { ietf: 'fr-BE' },
    be_en: { ietf: 'en-BE' },
    be_nl: { ietf: 'nl-BE' },
    eg_ar: { ietf: 'ar-EG' },
    eg_en: { ietf: 'en-EG' },
  };

  let originalFetch;
  let originalLocation;

  beforeAll(() => {
    originalFetch = window.fetch;
    originalLocation = window.location;
  });

  afterAll(() => {
    window.fetch = originalFetch;
    delete window.location;
    window.location = originalLocation;
  });

  beforeEach(() => {
    window.sessionStorage.clear();
    document.body.innerHTML = '<a class="geo-pn3 geo-pn" number-type="phone-business" href="tel:%7B%7Bphone-business-geo%7D%7D">{{phone-business}}</a>';
  });

  function setLocation(pathname, search = '') {
    delete window.location;
    window.location = { pathname, search };
  }

  function placeholderFetchUrls() {
    return window.fetch.mock.calls
      .map((c) => c[0])
      .filter((u) => u !== 'https://geo2.adobe.com/json/');
  }

  it('visitor in DE on US root page → single fetch to /de/, no 404 pings', async () => {
    setLocation('/', '');
    window.fetch = makeFetchMock([
      {
        match: '/de/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '+49 800 000 0000' }] },
      },
    ], 'DE');

    await geoPhoneNumber(dcLocales);
    expect(placeholderFetchUrls()).toEqual(['/de/dc-shared/placeholders.json']);
    expect(document.querySelector('.geo-pn3').textContent).toBe('+49 800 000 0000');
  });

  it('visitor in US (country=us) → resolves to root, single fetch to /dc-shared/placeholders.json', async () => {
    setLocation('/', '');
    window.fetch = makeFetchMock([
      {
        match: '/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '800 915 9430' }] },
      },
    ], 'US');

    await geoPhoneNumber(dcLocales);
    expect(placeholderFetchUrls()).toEqual(['/dc-shared/placeholders.json']);
  });

  it('country=gb on /uk/ → resolves to uk via tier 3, never pings /gb/ or /gb_xx/', async () => {
    setLocation('/uk/foo', '?akamaiLocale=gb');
    window.fetch = makeFetchMock([
      {
        match: '/uk/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '+44 800 000 0000' }] },
      },
    ]);

    await geoPhoneNumber(dcLocales);
    expect(placeholderFetchUrls()).toEqual(['/uk/dc-shared/placeholders.json']);
  });

  it('country=be on /fr/ → resolves to be_fr via tier 2, never pings /be/', async () => {
    setLocation('/fr/foo', '?akamaiLocale=be');
    window.fetch = makeFetchMock([
      {
        match: '/be_fr/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '+32 1 234 5678' }] },
      },
    ]);

    await geoPhoneNumber(dcLocales);
    expect(placeholderFetchUrls()).toEqual(['/be_fr/dc-shared/placeholders.json']);
  });

  it('country=ke on /africa/ → resolves to africa via tier 3, never pings /ke/', async () => {
    setLocation('/africa/foo', '?akamaiLocale=ke');
    window.fetch = makeFetchMock([
      {
        match: '/africa/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '+27 11 555 0100' }] },
      },
    ]);

    await geoPhoneNumber(dcLocales);
    expect(placeholderFetchUrls()).toEqual(['/africa/dc-shared/placeholders.json']);
  });

  it('country=eg on /mena_ar/ → resolves to mena_ar via tier 3, never pings /eg/', async () => {
    setLocation('/mena_ar/foo', '?akamaiLocale=eg');
    window.fetch = makeFetchMock([
      {
        match: '/mena_ar/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '+20 2 1234 5678' }] },
      },
    ]);

    await geoPhoneNumber(dcLocales);
    expect(placeholderFetchUrls()).toEqual(['/mena_ar/dc-shared/placeholders.json']);
  });

  it('country=de on /de/ (single-prefix locale) → exactly one fetch, no fallbacks', async () => {
    setLocation('/de/', '?akamaiLocale=de');
    window.fetch = makeFetchMock([
      {
        match: '/de/dc-shared/placeholders.json',
        status: 200,
        data: { data: [{ key: 'phone-business', value: '+49 800 000 0000' }] },
      },
    ]);

    await geoPhoneNumber(dcLocales);
    expect(placeholderFetchUrls()).toEqual(['/de/dc-shared/placeholders.json']);
  });

  it('no candidate is in the locales map → no placeholder fetch issued at all', async () => {
    setLocation('/foo/bar', '?akamaiLocale=zz');
    window.fetch = makeFetchMock([], 'ZZ');

    await expect(geoPhoneNumber(dcLocales)).resolves.not.toThrow();
    expect(placeholderFetchUrls()).toEqual([]);
  });
});
