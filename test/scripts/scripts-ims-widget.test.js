/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';

// The fast-track path strips the block's class and sets an id, so the IMS check
// must still match. Separate file: scripts.js self-invokes loadPage() on import.
document.head.innerHTML = '<meta name="dc-generate-cache-version" content="123"/>';
document.body.innerHTML = '<header></header><main><div class="dc-converter-widget"><div><div>compress-pdf</div></div></div></main>';

describe('IMS loading for fast-tracked widgets', () => {
  it('loads IMS after dc-converter-widget swaps its class for an id', async () => {
    const imsAttempted = new Promise((resolve) => {
      window.addEventListener('IMS:Ready', () => resolve('ready'), { once: true });
      window.addEventListener('DC_Hosted:Error', () => resolve('error'), { once: true });
    });
    await import('../../acrobat/scripts/scripts.js');
    expect(document.querySelector('#dc-converter-widget')).to.not.be.null;
    expect(document.querySelector('.dc-converter-widget')).to.be.null;
    expect(await imsAttempted).to.be.oneOf(['ready', 'error']);
  });
});
