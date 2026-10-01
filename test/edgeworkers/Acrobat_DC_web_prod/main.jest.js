
import Request from "request";
import { responseProvider as replaceResponseProvider } from "../../../edgeworkers/Acrobat_DC_web_prod/main.js";
import { onClientRequest } from "../../../edgeworkers/Acrobat_DC_web_prod/main.js";
import { createResponse } from "create-response";
import { httpRequest } from "http-request";
import { HttpResponsePdf } from "response-pdf";
import { HttpResponseWidgetCache } from "response-widget-cache";
import { HttpResponseWidget } from "response-widget";
import { HttpResponseScripts } from "response-scripts";
import { HttpResponseStyles } from "response-styles";
import { HttpResponseMiloStyles } from "response-milo-styles";
import { HttpResponseVerbWidgetStyles } from "response-verb-widget-styles";
import { HttpResponse404 } from "response-404";
import { mockOnElement } from "html-rewriter";


describe("EdgeWorker that consumes an HTML document and rewrites it", () => {
  let fetches;
  let resource404 = false
  let unityMarquee = false;
  const originalOnElement = mockOnElement.getMockImplementation();

  beforeAll(() => {
    httpRequest.mockImplementation((path) => {
      let response;
      fetches.push(path);

      if (path.includes('/acrobat/online')) {
        response = new HttpResponsePdf();
      } else if (path.includes('dc-generate-cache')) {
        response = new HttpResponseWidgetCache();
      } else if (path.includes('scripts.js')) {
        response = new HttpResponseScripts();
      } else if (path.includes('widget.js')) {
        response = new HttpResponseWidget();
      } else if (path.includes('/libs/styles/styles.css')) {
        if (resource404 === true) {
          response = new HttpResponse404();
        } else {
          response = new HttpResponseMiloStyles();
        }
      } else if (path.includes('/acrobat/styles/styles.css')) {
        response = new HttpResponseStyles();
      } else if (path.includes('/acrobat/blocks/verb-widget/verb-widget.css')) {
        response = new HttpResponseVerbWidgetStyles();
      } else if (path.includes('/acrobat/blocks/study-marquee/study-marquee.css')) {
        response = new HttpResponseVerbWidgetStyles();
      } else if (path.includes('/acrobat/blocks/verb-marquee/verb-marquee.css')) {
        response = new HttpResponseVerbWidgetStyles();
      } else if (path.includes('/acrobat/blocks/verb-widget-client-upload/verb-widget-client-upload.css')) {
        response = new HttpResponseVerbWidgetStyles();
      } else {
        response = new HttpResponse404();
      }
      return new Promise(function(resolve) {
        resolve(response);
      })
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fetches = [];
    resource404 = false;
    unityMarquee = false;
    mockOnElement.mockImplementation((selector, handler) => {
      if (selector === '.unity-marquee') {
        if (unityMarquee) handler({});
        return;
      }
      return originalOnElement(selector, handler);
    });
  });

  afterEach(() => {
    mockOnElement.mockImplementation(originalOnElement);
  });

  it("preloads Unity marquee resources on www.adobe.com without changing existing flows", async () => {
    const request = new Request({path: '/acrobat/online/pdf-to-ppt'});
    const baseline = await replaceResponseProvider(request);
    const baselineFetches = [...fetches];
    const baselineSelectors = mockOnElement.mock.calls.map(([selector]) => selector);
    const baselineHeaders = {...baseline.headers};
    expect(baseline.headers.Link).not.toContain('/unitylibs/');

    fetches = [];
    mockOnElement.mockClear();
    unityMarquee = true;
    const response = await replaceResponseProvider(request);
    const unityLinks = [
      '</acrobat/blocks/unity-marquee/unity-marquee.js>;rel="preload";as="script";crossorigin="anonymous"',
      '</acrobat/blocks/unity-marquee/unity-marquee.css>;rel="preload";as="style"',
      '</unitylibs/core/widgets/prompt-upload/prompt-upload.css>;rel="preload";as="style"',
      '</unitylibs/core/widgets/shared/shared.css>;rel="preload";as="style"',
      '</unitylibs/core/widgets/prompt-upload/prompt-upload.js>;rel="preload";as="script";crossorigin="anonymous"',
      '</unitylibs/core/workflow/workflow-prompt-upload/action-binder.js>;rel="preload";as="script";crossorigin="anonymous"',
      '</unitylibs/core/workflow/workflow-prompt-upload/target-config.json>;rel="preload";as="fetch";crossorigin="anonymous"',
      '</unitylibs/core/widgets/shared/dropzone.js>;rel="preload";as="script";crossorigin="anonymous"',
      '</unitylibs/core/widgets/shared/dropdown.js>;rel="preload";as="script";crossorigin="anonymous"',
      '</unitylibs/core/widgets/shared/widget-base.js>;rel="preload";as="script";crossorigin="anonymous"',
      '</unitylibs/core/widgets/shared/prompt-input.js>;rel="preload";as="script";crossorigin="anonymous"',
    ];

    expect(response.status).toBe(200);
    expect(response.headers.Link).toBe([baselineHeaders.Link, ...unityLinks].join(','));
    expect({...response.headers, Link: baselineHeaders.Link}).toEqual(baselineHeaders);
    expect(fetches).toEqual(baselineFetches);
    expect(mockOnElement.mock.calls.map(([selector]) => selector)).toEqual(baselineSelectors);
    const headHandler = mockOnElement.mock.calls.find(([selector]) => selector === 'head')[1];
    const append = jest.fn();
    headHandler({append});
    expect(append.mock.calls[0][0]).toContain('<style id="inline-milo-styles">');
    expect(append.mock.calls[1][0]).toContain('<style id="inline-dc-styles">');
  });

  it.each(['www.stage.adobe.com', 'sign.ing', 'edit.ing'])(
    "does not add Unity marquee preloads on %s",
    async (host) => {
      unityMarquee = true;
      const response = await replaceResponseProvider(new Request({path: '/acrobat/online/pdf-to-ppt', host}));
      expect(response.status).toBe(200);
      expect(response.headers.Link).not.toContain('/unitylibs/');
    },
  );

  it("responseProvider", async () => {
    let requestMock = new Request({path: '/acrobat/online/pdf-to-ppt'});

    const responsePromise = replaceResponseProvider(requestMock);
    responsePromise.then(response => {
      expect(response.status).toEqual(200);
      expect(response.headers['header-to-keep']).toEqual('keep');
      expect(response.headers).not.toHaveProperty('accept-encoding');
      expect(response.headers).not.toHaveProperty('vary');
      expect(fetches).toEqual([
        'https://www.adobe.com/acrobat/online/pdf-to-ppt.html',
        'https://www.adobe.com/acrobat/scripts/scripts.js',
        'https://www.adobe.com/acrobat/blocks/dc-converter-widget/dc-converter-widget.js',
        'https://www.adobe.com/acrobat/styles/styles.css',
        'https://www.adobe.com/libs/styles/styles.css',
        'https://www.adobe.com/acrobat/blocks/verb-widget/verb-widget.css',
        'https://www.adobe.com/acrobat/blocks/study-marquee/study-marquee.css',
        'https://www.adobe.com/acrobat/blocks/verb-marquee/verb-marquee.css',
        'https://www.adobe.com/acrobat/blocks/verb-widget-client-upload/verb-widget-client-upload.css'
      ]);
    });
  });

  it("responseProvider ROW", async () => {
    let requestMock = new Request({path: '/jp/acrobat/online/pdf-to-ppt'});

    const responsePromise = replaceResponseProvider(requestMock);
    responsePromise.then(response => {
      expect(response.status).toEqual(200);
      expect(response.headers['header-to-keep']).toEqual('keep');
      expect(fetches).toEqual([
        'https://www.adobe.com/jp/acrobat/online/pdf-to-ppt.html',
        'https://www.adobe.com/acrobat/scripts/scripts.js',
        'https://www.adobe.com/acrobat/blocks/dc-converter-widget/dc-converter-widget.js',
        'https://www.adobe.com/acrobat/styles/styles.css',
        'https://www.adobe.com/libs/styles/styles.css',
        'https://www.adobe.com/acrobat/blocks/verb-widget/verb-widget.css',
        'https://www.adobe.com/acrobat/blocks/study-marquee/study-marquee.css',
        'https://www.adobe.com/acrobat/blocks/verb-marquee/verb-marquee.css',
        'https://www.adobe.com/acrobat/blocks/verb-widget-client-upload/verb-widget-client-upload.css'
      ]);
    });
  });

  it("responseProvider Mobile", async () => {
    let requestMock = new Request({path: '/acrobat/online/pdf-to-ppt', device: 'Mobile'});

    const responsePromise = replaceResponseProvider(requestMock);
    responsePromise.then(response => {
      expect(response.status).toEqual(200);
      expect(response.headers['header-to-keep']).toEqual('keep');
      expect(response.headers).not.toHaveProperty('accept-encoding');
      expect(response.headers).not.toHaveProperty('vary');
      expect(fetches).toEqual([
        'https://www.adobe.com/acrobat/online/pdf-to-ppt.html',
        'https://www.adobe.com/acrobat/scripts/scripts.js',
        'https://www.adobe.com/acrobat/blocks/dc-converter-widget/dc-converter-widget.js',
        'https://www.adobe.com/acrobat/styles/styles.css',
        'https://www.adobe.com/libs/styles/styles.css',
        'https://www.adobe.com/acrobat/blocks/verb-widget/verb-widget.css',
        'https://www.adobe.com/acrobat/blocks/study-marquee/study-marquee.css',
        'https://www.adobe.com/acrobat/blocks/verb-marquee/verb-marquee.css',
        'https://www.adobe.com/acrobat/blocks/verb-widget-client-upload/verb-widget-client-upload.css',
      ]);
    });
  });

  it("404 exception", async () => {
    let requestMock = new Request({path: '/404/online/pdf-to-ppt'});

    const responsePromise = replaceResponseProvider(requestMock);
    responsePromise.then(response => {
      expect(response.status).toEqual(404);
    });
  });

  it("resource 404 exception", async () => {
    let requestMock = new Request({path: '/acrobat/online/pdf-to-ppt'});
    resource404 = true;

    const responsePromise = replaceResponseProvider(requestMock);
    responsePromise.then(response => {
      expect(response.status).toEqual(500);
      expect(response.body).toContain('Failed to fetch resource: /libs/styles/styles.css status: 404');
    });
  });

  it("onClientReqest", async () => {
    let requestMock = new Request({path: '/acrobat/online/pdf-to-ppt'});

    onClientRequest(requestMock);
    expect(requestMock.setVariable).toBeCalledWith('PMUSER_DEVICETYPE', 'Desktop');
    expect(requestMock.cacheKey.includeVariable).toBeCalledWith('PMUSER_DEVICETYPE');

    requestMock = new Request({path: '/acrobat/online/pdf-to-ppt', device: 'Mobile'});

    onClientRequest(requestMock);
    expect(requestMock.setVariable).toBeCalledWith('PMUSER_DEVICETYPE', 'Desktop');

    requestMock = new Request({path: '/acrobat/online/pdf-to-ppt', device: 'Tablet'});

    onClientRequest(requestMock);
    expect(requestMock.setVariable).toBeCalledWith('PMUSER_DEVICETYPE', 'Desktop');
  });
});

describe("frictionlessResponseProvider for acrobat.adobe.com", () => {
  let fetches;

  beforeAll(() => {
    httpRequest.mockImplementation((path) => {
      fetches.push(path);
      let response;
      if (path.includes('scripts.js')) response = new HttpResponseScripts();
      else if (path.includes('widget.js')) response = new HttpResponseWidget();
      else if (path.includes('/libs/styles/styles.css')) response = new HttpResponseMiloStyles();
      else if (path.includes('.css')) response = new HttpResponseStyles();
      else response = new HttpResponsePdf();
      return Promise.resolve(response);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fetches = [];
  });

  // Existing URLs — must continue to work
  it("acrobat.adobe.com/heic-to-pdf → /dc-shared/heic-to-pdf (root, no locale)", async () => {
    const requestMock = new Request({path: '/heic-to-pdf', host: 'acrobat.adobe.com'});
    const response = await replaceResponseProvider(requestMock);
    expect(response.status).toEqual(200);
    expect(fetches).toContain('https://acrobat.adobe.com/dc-shared/heic-to-pdf');
  });

  it("acrobat.adobe.com/fr/heic-to-pdf → /fr/dc-shared/heic-to-pdf (locale prefix)", async () => {
    const requestMock = new Request({path: '/fr/heic-to-pdf', host: 'acrobat.adobe.com'});
    const response = await replaceResponseProvider(requestMock);
    expect(response.status).toEqual(200);
    expect(fetches).toContain('https://acrobat.adobe.com/fr/dc-shared/heic-to-pdf');
  });

  it("acrobat.adobe.com/id_id/heic-to-pdf → /id_id/dc-shared/heic-to-pdf (underscore locale)", async () => {
    const requestMock = new Request({path: '/id_id/heic-to-pdf', host: 'acrobat.adobe.com'});
    const response = await replaceResponseProvider(requestMock);
    expect(response.status).toEqual(200);
    expect(fetches).toContain('https://acrobat.adobe.com/id_id/dc-shared/heic-to-pdf');
  });

  // New /tools/* URLs
  it("acrobat.adobe.com/tools/pdf-to-word → /dc-shared/tools/pdf-to-word (tools section)", async () => {
    const requestMock = new Request({path: '/tools/pdf-to-word', host: 'acrobat.adobe.com'});
    const response = await replaceResponseProvider(requestMock);
    expect(response.status).toEqual(200);
    expect(fetches).toContain('https://acrobat.adobe.com/dc-shared/tools/pdf-to-word');
  });

  it("acrobat.adobe.com/tools/split-pdf → /dc-shared/tools/split-pdf (tools section)", async () => {
    const requestMock = new Request({path: '/tools/split-pdf', host: 'acrobat.adobe.com'});
    const response = await replaceResponseProvider(requestMock);
    expect(response.status).toEqual(200);
    expect(fetches).toContain('https://acrobat.adobe.com/dc-shared/tools/split-pdf');
  });

  it("acrobat.adobe.com/fr/pdf-to-word → /fr/dc-shared/pdf-to-word (locale + new content)", async () => {
    const requestMock = new Request({path: '/fr/pdf-to-word', host: 'acrobat.adobe.com'});
    const response = await replaceResponseProvider(requestMock);
    expect(response.status).toEqual(200);
    expect(fetches).toContain('https://acrobat.adobe.com/fr/dc-shared/pdf-to-word');
  });

  it("acrobat.adobe.com/id_id/pdf-to-word → /id_id/dc-shared/pdf-to-word (underscore locale + new content)", async () => {
    const requestMock = new Request({path: '/id_id/pdf-to-word', host: 'acrobat.adobe.com'});
    const response = await replaceResponseProvider(requestMock);
    expect(response.status).toEqual(200);
    expect(fetches).toContain('https://acrobat.adobe.com/id_id/dc-shared/pdf-to-word');
  });

  it("acrobat.adobe.com/fr/tools/pdf-to-word → /fr/dc-shared/tools/pdf-to-word (locale + tools section)", async () => {
    const requestMock = new Request({path: '/fr/tools/pdf-to-word', host: 'acrobat.adobe.com'});
    const response = await replaceResponseProvider(requestMock);
    expect(response.status).toEqual(200);
    expect(fetches).toContain('https://acrobat.adobe.com/fr/dc-shared/tools/pdf-to-word');
  });

  it("acrobat.adobe.com/africa/heic-to-pdf → /dc-shared/africa/heic-to-pdf (unsupported locale treated as section)", async () => {
    const requestMock = new Request({path: '/africa/heic-to-pdf', host: 'acrobat.adobe.com'});
    const response = await replaceResponseProvider(requestMock);
    expect(response.status).toEqual(200);
    expect(fetches).toContain('https://acrobat.adobe.com/dc-shared/africa/heic-to-pdf');
  });
});
