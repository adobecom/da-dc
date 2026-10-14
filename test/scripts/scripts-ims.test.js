/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';

// Separate file so scripts.js is imported into a fresh module graph with an IMS
// consumer in the DOM; scripts.js self-invokes loadPage() on import.
document.head.innerHTML = '<meta name="dc-widget-version" content="123"/>';
document.body.innerHTML = '<header></header><main><div><a href="/dc/susi">Sign in</a></div></main>';

describe('IMS loading', () => {
  it('loads IMS when the page has an IMS consumer', async () => {
    const imsAttempted = new Promise((resolve) => {
      window.addEventListener('IMS:Ready', () => resolve('ready'), { once: true });
      window.addEventListener('DC_Hosted:Error', () => resolve('error'), { once: true });
    });
    await import('../../acrobat/scripts/scripts.js');
    expect(await imsAttempted).to.be.oneOf(['ready', 'error']);
  });
});
