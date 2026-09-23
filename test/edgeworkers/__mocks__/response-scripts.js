import { ReadableStream } from './streams';

export const mock_HttpResponse_text = jest.fn().mockReturnValue(
  new Promise(function(resolve) {
    resolve(`const locales = {
  de: { ietf: 'de-DE', tk: 'vin7zsi.css' },
  fr: { ietf: 'fr-FR', tk: 'vrk5vyv.css' },
  id_id: { ietf: 'id-ID', tk: 'czc0mun.css' },
  jp: { ietf: 'ja-JP', tk: 'dvg6awq' },
};

const CONFIG = {
  codeRoot: '/dc-shared',
};`)
  })
);
export const mock_HttpResponse_json = jest.fn();
export const mock_HttpResponse_getHeader = jest.fn();
export const mock_HttpResponse_getHeaders = jest.fn();
export const mock_HttpResponse_get = jest.fn();

export const HttpResponseScripts = jest.fn().mockImplementation(() => {
  return {
    status: 200,
    ok: true,
    headers: {},
    body: new ReadableStream(),
    text: mock_HttpResponse_text,
    json: mock_HttpResponse_json,
    getHeader: mock_HttpResponse_getHeader,
    getHeaders: mock_HttpResponse_getHeaders,
    get: mock_HttpResponse_get,
  };
});
