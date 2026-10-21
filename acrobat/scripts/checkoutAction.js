/* eslint-disable compat/compat */
const IMS_POLL_INTERVAL = 250;
const IMS_POLL_ATTEMPTS = 120;

function waitForImsSignedIn() {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      if (window.adobeIMS?.initialized) {
        resolve(window.adobeIMS.isSignedInUser());
      } else if (attempts >= IMS_POLL_ATTEMPTS) {
        resolve(false);
      } else {
        attempts += 1;
        setTimeout(check, IMS_POLL_INTERVAL);
      }
    };
    check();
  });
}

const slug = (text) => text.toLowerCase().trim().replaceAll(/\s+/g, '-');

// Milo derives the card CTA aria-label and daa-ll from the CTA text once the card is ready.
function syncCtaLabels(el, oldText) {
  const newText = el.textContent.trim();
  if (!oldText || newText === oldText) return;
  const ariaLabel = el.getAttribute('aria-label')?.trim();
  if (ariaLabel?.startsWith(oldText)) {
    el.setAttribute('aria-label', `${newText}${ariaLabel.slice(oldText.length)}`);
  }
  const oldLL = slug(oldText);
  const ll = el.getAttribute('daa-ll');
  if (ll?.startsWith(`${oldLL}--`)) {
    el.setAttribute('daa-ll', `${slug(newText)}${ll.slice(oldLL.length)}`);
  }
}

async function swapWhenSignedIn(getCheckoutAction, offers, options, el) {
  if (!await waitForImsSignedIn()) return;
  const signedIn = Promise.resolve(true);
  const action = await getCheckoutAction(offers, { ...options, modal: undefined }, signedIn, el);
  if (!action || !el.isConnected) return;
  const oldText = el.textContent.trim();
  el.requestUpdate(true);
  await el.onceSettled();
  syncCtaLabels(el, oldText);
}

/**
 * Resolves M@S checkout actions without blocking on IMS. While IMS is loading, CTAs render
 * signed-out; upgrade and download CTAs re-render once IMS confirms a signed-in user.
 * mas's imsSignedInPromise is ignored: it settles to false for good after ~5s.
 */
export default async function resolveCheckoutAction(
  getCheckoutAction,
  offers,
  options,
  imsSignedInPromise,
  el,
) {
  const { adobeIMS } = window;
  if (adobeIMS?.initialized) {
    return getCheckoutAction(offers, options, Promise.resolve(adobeIMS.isSignedInUser()), el);
  }
  if (options.upgrade || options.entitlement === true) {
    swapWhenSignedIn(getCheckoutAction, offers, options, el).catch((error) => {
      window.lana?.log(`Failed to swap checkout CTA: ${error?.message}`, { severity: 'error' });
    });
  }
  return getCheckoutAction(offers, options, Promise.resolve(false), el);
}
