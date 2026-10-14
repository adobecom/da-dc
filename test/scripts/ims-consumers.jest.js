/**
 * @jest-environment node
 */
/* eslint-disable no-undef */
import fs from 'fs';
import path from 'path';

const SCRIPTS = path.join(__dirname, '../../acrobat/scripts/scripts.js');
const BLOCKS_DIR = path.join(__dirname, '../../acrobat/blocks');

const source = fs.readFileSync(SCRIPTS, 'utf8');
const consumers = source.match(/const IMS_CONSUMERS = \[([\s\S]*?)\]/)[1];

describe('IMS_CONSUMERS stays in sync with the code it guards', () => {
  it('covers every block that listens for IMS:Ready', () => {
    const listeners = fs.readdirSync(BLOCKS_DIR).filter((block) => {
      const file = path.join(BLOCKS_DIR, block, `${block}.js`);
      return fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes('IMS:Ready');
    });

    expect(listeners.length).toBeGreaterThan(0);
    listeners.forEach((block) => {
      expect(consumers).toMatch(new RegExp(`['"][#.]${block}['"]`));
    });
  });

  it('covers the ids that replace a block class during fast-track', () => {
    const ids = [...source.matchAll(/\.id = '([^']+)'/g)].map((m) => m[1]);

    expect(ids.length).toBeGreaterThan(0);
    ids.forEach((id) => {
      expect(consumers).toContain(`'#${id}'`);
    });
  });
});
