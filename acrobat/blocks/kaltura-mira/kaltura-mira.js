function getMeta(name) {
  return document.querySelector(`meta[name="${name}"]`)?.content || '';
}

function buildMiraUrl(config) {
  const { host, scheduler, pid } = config;
  const params = new URLSearchParams();
  if (scheduler) params.set('scheduler', scheduler);
  if (pid) params.set('pid', pid);
  const qs = params.toString();
  return `https://${host}.mediaspace.kaltura.com/mira${qs ? `?${qs}` : ''}`;
}

export default function init(el) {
  const rows = [...el.children];

  // Row 1: specialist pid (overrides page meta)
  // Row 2: scheduler URL (overrides page meta)
  const pid = rows[0]?.querySelector('p,div')?.textContent?.trim() || getMeta('kaltura-pid');
  const scheduler = rows[1]?.querySelector('p,div')?.textContent?.trim() || getMeta('kaltura-scheduler');
  const host = getMeta('kaltura-host') || 'acrobat-express';

  const src = buildMiraUrl({ host, scheduler, pid });

  el.innerHTML = '';
  el.classList.add('kaltura-mira-block');

  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = 'Kaltura Mira Video Assistant';
  iframe.setAttribute('allow', 'camera; microphone; fullscreen');
  iframe.setAttribute('loading', 'lazy');
  el.append(iframe);
}
