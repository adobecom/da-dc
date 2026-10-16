import assert from 'assert';
import { Buffer } from 'buffer';
import fs from 'fs';
import prod from '../../../acrobat/scripts/contentSecurityPolicy/prod.js';
import stage from '../../../acrobat/scripts/contentSecurityPolicy/stage.js';
import dev from '../../../acrobat/scripts/contentSecurityPolicy/dev.js';

const head = fs.readFileSync('head.html', 'utf8');
const inlineScripts = head.match(/<script>[\s\S]*?<\/script>/g).map((tag) => tag.slice(8, -9));

async function sha256(text) {
  const digest = await crypto.subtle.digest('SHA-256', Buffer.from(text));
  return `'sha256-${Buffer.from(digest).toString('base64')}'`;
}

describe('head.html inline scripts', () => {
  it('have their hashes in the prod, stage and dev CSP', async () => {
    for (const script of inlineScripts) {
      const hash = await sha256(script);
      [prod, stage, dev].forEach(({ scriptSrc }) => {
        assert.ok(scriptSrc.includes(hash), hash);
      });
    }
  });
});
