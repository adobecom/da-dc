/* eslint-env jest */
import checkPageLinks from '../../nala/utils/link-checker.js';

const STAGE = 'https://stage--da-dc--adobecom.aem.live';

function mockPage(href, statusFor) {
  const request = async (url) => ({ status: () => statusFor(url) });
  const locator = {
    waitFor: async () => {},
    first() { return this; },
    scrollIntoViewIfNeeded: async () => {},
    evaluateAll: async () => [href],
  };
  return {
    url: () => `${STAGE}/acrobat/online/quiz-maker`,
    waitForLoadState: async () => {},
    waitForFunction: async () => {},
    locator: () => locator,
    request: { fetch: request, get: request },
  };
}

async function linkStatus(href, statusFor) {
  const statuses = [];
  const expect = (status) => ({ not: { toBe: () => statuses.push(status) } });
  await checkPageLinks(mockPage(href, statusFor), expect);
  return statuses;
}

describe('link-checker on AEM hosts', () => {
  it('passes an ".html" link that works without ".html"', async () => {
    const href = `${STAGE}/acrobat/online/rotate-pdf.html`;
    expect(await linkStatus(href, (url) => (url === href ? 404 : 200))).toEqual([200]);
  });

  it('passes a link to another Adobe site that works on www.adobe.com', async () => {
    const href = `${STAGE}/education/students/photoshop`;
    expect(await linkStatus(href, (url) => (url.startsWith(STAGE) ? 404 : 200))).toEqual([200]);
  });

  it('keeps the 404 when every host returns 404', async () => {
    expect(await linkStatus(`${STAGE}/acrobat/missing`, () => 404)).toEqual([404]);
  });

  it('keeps the 404 when the www.adobe.com fallback fails', async () => {
    const statuses = await linkStatus(`${STAGE}/acrobat/missing`, (url) => {
      if (url.startsWith('https://www.adobe.com')) throw new Error('timeout');
      return 404;
    });
    expect(statuses).toEqual([404]);
  });
});
