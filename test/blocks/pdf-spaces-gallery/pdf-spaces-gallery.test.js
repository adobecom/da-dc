import { expect } from '@esm-bundle/chai';

const { testables } = await import(
  '../../../acrobat/blocks/pdf-spaces-gallery/pdf-spaces-gallery.js'
);

const {
  getCategory,
  matchesCategory,
  buildDestinationUrl,
  buildThumbnailUrl,
  buildCard,
} = testables;

// Minimal stand-in for Milo's createTag (element + attributes + children).
function createTag(tag, attrs, content) {
  const el = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
  const append = (c) => {
    if (c === null || c === undefined) return;
    if (Array.isArray(c)) { c.forEach(append); return; }
    if (c instanceof Node) { el.append(c); return; }
    el.append(document.createTextNode(String(c)));
  };
  append(content);
  return el;
}

const RENDITION_REL = 'http://ns.adobe.com/adobecloud/rel/rendition';

describe('pdf-spaces-gallery block', () => {
  describe('getCategory', () => {
    it('resolves the variant class', () => {
      const block = document.createElement('div');
      block.classList.add('lifestyle');
      expect(getCategory(block)).to.equal('lifestyle');
    });

    it('defaults to featured when no variant is present', () => {
      const block = document.createElement('div');
      expect(getCategory(block)).to.equal('featured');
    });

    it('supports the all variant', () => {
      const block = document.createElement('div');
      block.classList.add('all');
      expect(getCategory(block)).to.equal('all');
    });
  });

  describe('matchesCategory', () => {
    it('matches case-insensitively', () => {
      expect(matchesCategory('Featured', 'featured')).to.be.true;
    });

    it('returns false for an empty API category', () => {
      expect(matchesCategory('', 'featured')).to.be.false;
    });

    it('returns false for a non-matching category', () => {
      expect(matchesCategory('productivity', 'lifestyle')).to.be.false;
    });
  });

  describe('buildDestinationUrl', () => {
    it('builds the spaces link with the expected params', () => {
      expect(buildDestinationUrl('abc123')).to.equal(
        'https://acrobat.adobe.com/link/spaces/abc123/?x_api_client_id=pdf_spaces&x_api_client_location=adobe',
      );
    });
  });

  describe('buildThumbnailUrl', () => {
    it('strips the URI template and appends size + png MIME type', () => {
      const href = 'https://x.adobe.io/rendition/id/abc?publicId=kwc_curated{&size,type,c2paSign}';
      const item = { acpc_links: { [RENDITION_REL]: [{ href }] } };
      const url = buildThumbnailUrl(item);
      expect(url).to.equal(
        'https://x.adobe.io/rendition/id/abc?publicId=kwc_curated&size=400&type=image%2Fpng',
      );
    });

    it('uses ? when the base has no query string', () => {
      const href = 'https://x.adobe.io/rendition/id/abc{?size,type}';
      const item = { acpc_links: { [RENDITION_REL]: [{ href }] } };
      expect(buildThumbnailUrl(item)).to.equal(
        'https://x.adobe.io/rendition/id/abc?size=400&type=image%2Fpng',
      );
    });

    it('returns null when there is no rendition link', () => {
      expect(buildThumbnailUrl({})).to.equal(null);
    });
  });

  describe('buildCard', () => {
    const item = {
      id: 'space-1',
      category: 'Productivity',
      name: 'My Space',
      description: 'A helpful space.',
    };

    it('renders an editorial-card with title, description and CTA', () => {
      const card = buildCard(item, 'Explore now', createTag, null);
      expect(card.classList.contains('editorial-card')).to.be.true;
      expect(card.classList.contains('pdf-spaces-card')).to.be.true;
      expect(card.querySelector('.pdf-spaces-text h3').textContent).to.equal('My Space');
      const cta = card.querySelector('.pdf-spaces-cta a');
      expect(cta.getAttribute('href')).to.equal(buildDestinationUrl('space-1'));
      expect(cta.getAttribute('aria-label')).to.equal('Explore now My Space');
    });

    it('sets API strings via textContent (no HTML injection)', () => {
      const hostile = { ...item, name: '<img src=x onerror=alert(1)>', description: 'a & b < c' };
      const card = buildCard(hostile, 'Explore now', createTag, null);
      const title = card.querySelector('.pdf-spaces-text h3');
      expect(title.children.length).to.equal(0);
      expect(title.textContent).to.equal('<img src=x onerror=alert(1)>');
      const desc = card.querySelector('.pdf-spaces-text p:last-child');
      expect(desc.textContent).to.equal('a & b < c');
    });

    it('falls back to the placeholder image when there is no token', () => {
      const card = buildCard(item, 'Explore now', createTag, null);
      const img = card.querySelector('img');
      expect(img.classList.contains('pdf-spaces-placeholder-img')).to.be.true;
    });
  });
});
