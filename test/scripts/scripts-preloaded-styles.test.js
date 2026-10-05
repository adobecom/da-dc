import { expect } from '@esm-bundle/chai';

const SITE_STYLES = '/acrobat/styles/styles.css';

describe('scripts.js: stylesheet whose href is already preloaded', () => {
  before(async () => {
    document.head.innerHTML = `<meta name="martech" content="off"><link rel="preload" as="style" href="${SITE_STYLES}">`;
    document.body.innerHTML = '<main><div></div></main>';
    await import('../../acrobat/scripts/scripts.js');
  });

  it('still adds the stylesheet', () => {
    expect(document.head.querySelectorAll(`link[rel="stylesheet"][href="${SITE_STYLES}"]`).length).to.equal(1);
  });

  it('leaves the preload link in place', () => {
    expect(document.head.querySelectorAll(`link[rel="preload"][href="${SITE_STYLES}"]`).length).to.equal(1);
  });

  it('adds the Milo stylesheet once', () => {
    expect(document.head.querySelectorAll('link[rel="stylesheet"][href$="/libs/styles/styles.css"]').length).to.equal(1);
  });
});
