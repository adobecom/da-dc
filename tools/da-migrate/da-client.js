/* eslint-disable no-console */
const {
  AEM_ORIGIN, CONTENT_TYPES, DA_ORIGIN,
} = require('./constants.js');

const tokenCache = new Map();

async function fetchImsToken() {
  const {
    DA_IMS_URL,
    DA_IMS_CLIENT_ID,
    DA_IMS_CLIENT_SECRET,
    DA_IMS_CODE,
    DA_IMS_GRANT_TYPE,
  } = process.env;

  if (!DA_IMS_URL || !DA_IMS_CLIENT_ID || !DA_IMS_CLIENT_SECRET) {
    throw new Error('No DA credentials. Set DA_TOKEN, or DA_IMS_URL + DA_IMS_CLIENT_ID + DA_IMS_CLIENT_SECRET.');
  }

  const params = new URLSearchParams();
  params.append('client_id', DA_IMS_CLIENT_ID);
  params.append('client_secret', DA_IMS_CLIENT_SECRET);
  if (DA_IMS_CODE) params.append('code', DA_IMS_CODE);
  params.append('grant_type', DA_IMS_GRANT_TYPE || 'client_credentials');

  const resp = await fetch(DA_IMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  if (!resp.ok) throw new Error(`Failed to retrieve IMS token (${resp.status})`);
  const { access_token: accessToken } = await resp.json();
  if (!accessToken) throw new Error('IMS response did not contain an access token.');
  return accessToken;
}

/**
 * Resolves a bearer token for a side of the migration.
 * `side` is 'source' or 'dest' so the two DA instances can use different credentials.
 */
async function getToken(side) {
  if (tokenCache.has(side)) return tokenCache.get(side);
  const explicit = process.env[`DA_${side.toUpperCase()}_TOKEN`] || process.env.DA_TOKEN;
  const token = explicit ? explicit.trim() : await fetchImsToken();
  tokenCache.set(side, token);
  return token;
}

async function daFetch(url, { side = 'source', ...opts } = {}) {
  const token = await getToken(side);
  const headers = { ...(opts.headers || {}), Authorization: `Bearer ${token}` };
  return fetch(url, { ...opts, headers });
}

function sourceUrl({ org, repo }, path) {
  return `${DA_ORIGIN}/source/${org}/${repo}${path}`;
}

/** Lists a DA folder. Returns `[{ path, name, ext }]` with paths relative to the repo root. */
async function listFolder(instance, path) {
  const { org, repo } = instance;
  const resp = await daFetch(`${DA_ORIGIN}/list/${org}/${repo}${path}`, { side: instance.side });
  if (!resp.ok) throw new Error(`Could not list ${path} (${resp.status} ${resp.statusText})`);
  const entries = await resp.json();
  const prefix = `/${org}/${repo}`;
  return (Array.isArray(entries) ? entries : []).map((entry) => ({
    ...entry,
    path: entry.path.startsWith(prefix) ? entry.path.slice(prefix.length) : entry.path,
  }));
}

/** Depth-first walk of a DA folder, yielding only files. */
async function walkFolder(instance, path) {
  const entries = await listFolder(instance, path);
  const files = [];
  for (const entry of entries) {
    if (entry.ext) {
      files.push(entry);
    } else {
      files.push(...await walkFolder(instance, entry.path));
    }
  }
  return files;
}

async function getSource(instance, path, { binary = false } = {}) {
  const resp = await daFetch(sourceUrl(instance, path), { side: instance.side });
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error(`Could not read ${path} (${resp.status} ${resp.statusText})`);
  return binary ? Buffer.from(await resp.arrayBuffer()) : resp.text();
}

async function putSource(instance, path, content, ext = 'html') {
  const type = CONTENT_TYPES[ext] || 'application/octet-stream';
  const body = new FormData();
  body.append('data', new Blob([content], { type }));
  const resp = await daFetch(sourceUrl(instance, path), {
    side: instance.side,
    method: 'POST',
    body,
  });
  if (!resp.ok) throw new Error(`Could not write ${path} (${resp.status} ${resp.statusText})`);
  return resp.status;
}

/** Triggers an AEM admin `preview` or `live` action on the destination. */
async function aemAction(instance, path, action) {
  const {
    org, repo, ref = 'main',
  } = instance;
  const authToken = (process.env.AEM_ADMIN_TOKEN || '').trim();
  const resp = await fetch(`${AEM_ORIGIN}/${action}/${org}/${repo}/${ref}${path}`, {
    method: 'POST',
    ...(authToken && { headers: { 'X-Auth-Token': authToken } }),
  });
  if (!resp.ok) throw new Error(`Failed ${action} for ${path} (${resp.status} ${resp.statusText})`);
}

module.exports = {
  aemAction,
  daFetch,
  getSource,
  listFolder,
  putSource,
  walkFolder,
};
