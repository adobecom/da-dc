import { expect } from '@esm-bundle/chai';

const {
  decorateImage,
  getAuthoredSvgInfo,
  getHostEnv,
  hostRedDirLink,
  processMedia,
} = await import('../../acrobat/scripts/verbMarqueeUtils.js');

describe('verbMarqueeUtils', () => {
  it('treats local and preview hosts as stage', () => {
    expect(getHostEnv()).to.equal('stage');
    expect(hostRedDirLink('compress-pdf')).to.equal('https://www.adobe.com/go/acrobat-compresspdf-stage');
  });

  it('moves the picture into its link', () => {
    const media = document.createElement('div');
    media.innerHTML = '<a href="/x">text</a><picture></picture>';
    decorateImage(media);
    expect(media.classList.contains('image')).to.be.true;
    expect(media.querySelector('a > picture')).to.exist;
    expect(media.querySelector('a').textContent).to.equal('');
  });

  it('only decorates image media', () => {
    expect(processMedia(null)).to.be.null;
    const video = document.createElement('div');
    video.innerHTML = '<video></video>';
    expect(processMedia(video).classList.contains('image')).to.be.false;
    expect(video.classList.contains('asset')).to.be.true;
  });

  it('finds an authored svg near the headline', () => {
    const foreground = document.createElement('div');
    foreground.innerHTML = '<div><h1>Title</h1><img src="/icon.svg" alt="Icon"></div><div><img src="/other.svg"></div>';
    const info = getAuthoredSvgInfo(foreground, foreground.querySelector('h1'));
    expect(info).to.deep.equal({ url: '/icon.svg', altText: 'Icon' });
    expect(getAuthoredSvgInfo(null)).to.be.null;
  });
});
