export function getHostEnv() {
  const { hostname } = window.location;
  if (['localhost', '.hlx.', '.aem.', 'stage.adobe.com'].some((p) => hostname.includes(p))) return 'stage';
  return 'prod';
}

export function hostRedDirLink(verb) {
  const hostname = window?.location?.hostname;
  const env = getHostEnv();
  const verbSlug = verb.split('-').join('');
  return hostname !== 'www.adobe.com'
    ? `https://www.adobe.com/go/acrobat-${verbSlug}-${env}`
    : `https://www.adobe.com/go/acrobat-${verbSlug}`;
}

export function decorateImage(media) {
  media.classList.add('image');
  const imageLink = media.querySelector('a');
  const picture = media.querySelector('picture');
  if (imageLink && picture && !imageLink.parentElement.classList.contains('modal-img-link')) {
    imageLink.textContent = '';
    imageLink.append(picture);
  }
}

export function processMedia(mediaDiv) {
  if (!mediaDiv) return null;
  mediaDiv.classList.add('asset');
  const hasVideo = mediaDiv.querySelector('video, a[href*=".mp4"], a[href*=".webm"], a[href*=".ogg"]');
  if (!hasVideo) {
    decorateImage(mediaDiv);
  }
  return mediaDiv;
}

export function getAuthoredSvgInfo(foregroundEl, headlineEl) {
  if (!foregroundEl) return null;
  const headingCell = headlineEl
    && [...foregroundEl.children].find((div) => div.contains(headlineEl));
  const searchRoot = headingCell || foregroundEl;
  const svgImg = searchRoot.querySelector('img[src$=".svg"]');
  if (!svgImg) return null;
  return { url: svgImg.getAttribute('src').trim(), altText: svgImg.getAttribute('alt') || '' };
}
