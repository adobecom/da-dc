const cache = new Map();

/** aem.page is preview-only, so availability is always verified against aem.live. */
function toLiveUrl(href) {
  const url = new URL(href);
  url.hostname = url.hostname.replace(/\.aem\.page$/, '.aem.live');
  return url.toString();
}

async function probe(url, timeoutMs) {
  try {
    // Some EDS origins reject HEAD; fall back to a ranged GET.
    let resp = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (resp.status === 405 || resp.status === 501) {
      resp = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { Range: 'bytes=0-0' },
        signal: AbortSignal.timeout(timeoutMs),
      });
    }
    return { status: resp.status, ok: resp.ok };
  } catch (e) {
    return { status: 0, ok: false, error: e.message };
  }
}

async function checkOne(href, timeoutMs) {
  const checked = toLiveUrl(href);
  if (!cache.has(checked)) cache.set(checked, probe(checked, timeoutMs));
  return { authored: href, checked, ...await cache.get(checked) };
}

/** Returns only the failures, so a clean page contributes nothing to the report. */
async function checkLinks(urls, { concurrency = 8, timeoutMs = 15000 } = {}) {
  const queue = [...new Set(urls)];
  const failures = [];

  await Promise.all(Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      while (queue.length) {
        const result = await checkOne(queue.shift(), timeoutMs);
        if (!result.ok) failures.push(result);
      }
    },
  ));

  return failures.sort((a, b) => a.checked.localeCompare(b.checked));
}

module.exports = { checkLinks, toLiveUrl };
