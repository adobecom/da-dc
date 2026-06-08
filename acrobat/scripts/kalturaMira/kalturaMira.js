function getMeta(name) {
  return document.querySelector(`meta[name="${name}"]`)?.content || '';
}

function buildMiraUrl() {
  const host = getMeta('kaltura-host') || 'acrobat-express';
  const scheduler = getMeta('kaltura-scheduler');
  const pid = getMeta('kaltura-pid');

  const params = new URLSearchParams();
  if (scheduler) params.set('scheduler', scheduler);
  if (pid) params.set('pid', pid);
  const qs = params.toString();
  return `https://${host}.mediaspace.kaltura.com/mira${qs ? `?${qs}` : ''}`;
}

export default function initKalturaMiraWidget() {
  const src = buildMiraUrl();

  const widget = document.createElement('div');
  widget.id = 'kaltura-mira-widget';
  widget.setAttribute('aria-label', 'Video specialist');

  // Toggle button — always visible
  const toggle = document.createElement('button');
  toggle.className = 'kaltura-mira-widget-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'kaltura-mira-widget-panel');
  toggle.textContent = 'Talk to a specialist';

  // Panel — hidden until toggled
  const panel = document.createElement('div');
  panel.id = 'kaltura-mira-widget-panel';
  panel.className = 'kaltura-mira-widget-panel';
  panel.hidden = true;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'kaltura-mira-widget-close';
  closeBtn.setAttribute('aria-label', 'Close specialist panel');
  closeBtn.textContent = '✕';

  // Iframe is created but src set only on first open to avoid loading until needed
  const iframe = document.createElement('iframe');
  iframe.title = 'Kaltura Mira Video Assistant';
  iframe.setAttribute('allow', 'camera; microphone; fullscreen');
  let iframeLoaded = false;

  panel.append(closeBtn, iframe);
  widget.append(toggle, panel);
  document.body.append(widget);

  function openPanel() {
    if (!iframeLoaded) {
      iframe.src = src;
      iframeLoaded = true;
    }
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
  }

  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }

  toggle.addEventListener('click', () => {
    if (panel.hidden) openPanel();
    else closePanel();
  });

  closeBtn.addEventListener('click', closePanel);

  // Close on Escape key
  widget.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });
}
