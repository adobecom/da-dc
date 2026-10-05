/* eslint-env jest */
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const source = fs.readFileSync(path.resolve('tools/prerender/prerender.js'), 'utf8');
const locales = [
  'cz', 'de', 'dk', 'es', 'fi', 'fr', 'id_id', 'in_hi', 'it', 'jp', 'kr',
  'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'se', 'th_th', 'tr', 'tw',
];
const acrobatCases = ['', '/tools', '/africa', ...locales.map((locale) => `/${locale}`), '/fr/tools'];
const cases = ['acrobat.adobe.com', 'stage.acrobat.adobe.com'].flatMap((host) => (
  acrobatCases.map((prefix) => [
    `https://${host}${prefix}/pdf-to-word`,
    'frictionless_acrobat',
    locales.includes(prefix.split('/')[1]) ? `_${prefix.split('/')[1]}` : '',
  ])
));
cases.push(
  ['https://acrobat.adobe.com/heic-to-pdf', 'frictionless_acrobat', ''],
  ['https://www.adobe.com/acrobat/online/pdf-to-word.html', 'frictionless', ''],
  ['https://www.stage.adobe.com/fr/acrobat/online/pdf-to-word.html', 'frictionless', '_fr'],
  ['https://main--da-dc--adobecom.aem.live/id_id/acrobat/online/pdf-to-word', 'frictionless', '_id_id'],
);

describe.each(['desktop', 'mobile'])('prerender uploader (%s)', (layout) => {
  it.each(cases)('uploads %s to the expected EdgeKV group', async (url, group, suffix) => {
    const writeFile = jest.fn().mockResolvedValue(undefined);
    const auth = jest.fn();
    const close = jest.fn().mockResolvedValue(undefined);
    const page = {
      goto: jest.fn().mockResolvedValue(undefined),
      waitForLoadState: jest.fn().mockResolvedValue(undefined),
      locator: jest.fn().mockReturnValue({
        innerHTML: jest.fn().mockResolvedValue('<div>widget</div>'),
        evaluate: jest.fn().mockResolvedValue({ top: '100px', height: '200px' }),
      }),
    };
    const args = {
      argv: {
        _: [url], layout, network: 'production', namespace: 'prod', group, edgekv: true,
      },
    };
    ['usage', 'option', 'demandCommand', 'help'].forEach((method) => {
      args[method] = () => args;
    });
    const modules = {
      playwright: {
        chromium: {
          launch: async () => ({
            newContext: async () => ({ newPage: async () => page }),
            close,
          }),
        },
      },
      'akamai-edgegrid': function EdgeGrid() {
        this.auth = auth;
        this.send = (callback) => callback(null, {}, 'ok');
      },
      fs: { promises: { writeFile } },
      path,
      os: { homedir: () => '/mock-home' },
      'yargs/yargs': () => args,
      'yargs/helpers': { hideBin: () => [] },
    };
    const error = jest.fn();
    await vm.runInNewContext(source, {
      require: (name) => modules[name],
      __dirname: '/mock-prerender',
      process: { argv: [], env: {} },
      console: { log: jest.fn(), warn: jest.fn(), error },
      URL,
    });

    const basename = path.basename(new URL(url).pathname, '.html');
    expect(error).not.toHaveBeenCalled();
    expect(auth).toHaveBeenCalledWith({
      path: `/edgekv/v1/networks/production/namespaces/prod/groups/${group}${suffix}/items/${basename}_${layout}`,
      method: 'PUT',
      headers: {},
      body: { html: '<div>widget</div>', top: '100px', height: '200px' },
    });
    expect(writeFile).toHaveBeenNthCalledWith(1, `/mock-prerender/${basename}-${layout}.html`, '<div>widget</div>', 'utf8');
    expect(writeFile).toHaveBeenNthCalledWith(
      2,
      `/mock-prerender/${basename}-${layout}.json`,
      JSON.stringify({ html: '<div>widget</div>', top: '100px', height: '200px' }, null, 2),
      'utf8',
    );
    expect(close).toHaveBeenCalledTimes(1);
  });
});
