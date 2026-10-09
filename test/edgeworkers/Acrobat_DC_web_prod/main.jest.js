
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
import { EdgeKV } from "../../../edgeworkers/Acrobat_DC_web_prod/edgekv.js";


describe("EdgeWorker that consumes an HTML document and rewrites it", () => {
  let fetches;
  let resource404 = false
  let unityMarquee = false;
  let authoredBlocks;
  let unityCss404;
  const unityCssPaths = [
    '/unitylibs/core/widgets/shared/shared.css',
    '/unitylibs/core/widgets/prompt-upload/prompt-upload.css',
    '/acrobat/blocks/unity-marquee/unity-marquee.css',
    '/acrobat/blocks/unity/unity.css',
  ];
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
      } else if (unityCssPaths.some((cssPath) => path.endsWith(cssPath))) {
        response = unityCss404 && path.endsWith(unityCss404)
          ? new HttpResponse404() : new HttpResponseStyles();
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
    authoredBlocks = new Set();
    unityCss404 = undefined;
    jest.spyOn(EdgeKV.prototype, 'getJson').mockResolvedValue({html: '', top: 0});
    mockOnElement.mockImplementation((selector, handler) => {
      if (selector === '.unity-marquee') {
        if (unityMarquee) handler({getAttribute: () => 'unity-marquee flashcard-maker light'});
        return;
      }
      if (selector === '.unity.workflow-acrobat') {
        if (authoredBlocks.has('.unity.workflow-acrobat')) {
          handler({getAttribute: () => 'unity workflow-acrobat'});
        }
        return;
      }
      if (selector === '.unity') {
        if (authoredBlocks.has('.unity.workflow-prompt-upload')) {
          // Mirrors production markup, which carries extra option classes.
          handler({getAttribute: () => 'unity workflow-prompt-upload product-acrobat feature-flashcard-maker widget-prompt-upload'});
        }
        return;
      }
      if (['.verb-widget-client-upload', '.study-marquee', '.verb-marquee'].includes(selector)) {
        if (authoredBlocks.has(selector)) handler({});
        return;
      }
      return originalOnElement(selector, handler);
    });
  });

  afterEach(() => {
    mockOnElement.mockImplementation(originalOnElement);
    jest.restoreAllMocks();
  });

  it.each(['www.adobe.com', 'www.stage.adobe.com', 'sign.ing', 'edit.ing'])("selects Unity marquee styles and preloads on %s", async (host) => {
    authoredBlocks.add('.unity.workflow-acrobat');
    const request = new Request({path: '/acrobat/online/pdf-to-ppt', host});
    const baseline = await replaceResponseProvider(request);
    const baselineFetches = [...fetches];
    const baselineSelectors = mockOnElement.mock.calls.map(([selector]) => selector);
    const baselineHeaders = {...baseline.headers};
    expect(baseline.headers.Link).not.toContain('/unitylibs/');
    expect(baselineFetches.some((path) => path.includes('/unitylibs/'))).toBe(false);
    const baselineAppend = jest.fn();
    mockOnElement.mock.calls.find(([selector]) => selector === 'head')[1]({append: baselineAppend});
    expect(baselineAppend.mock.calls).toHaveLength(4);

    fetches = [];
    mockOnElement.mockClear();
    unityMarquee = true;
    authoredBlocks.delete('.unity.workflow-acrobat');
    authoredBlocks.add('.unity.workflow-prompt-upload');
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
    const commonLinks = baselineHeaders.Link.split(',').filter((link) => !link.includes('/acrobat/blocks/verb-widget/') && !link.includes('placeholders'));
    expect(response.headers.Link).toBe([...commonLinks, ...unityLinks].join(','));
    expect(response.headers.Link).not.toContain('/acrobat/blocks/verb-widget/');
    expect(response.headers.Link).not.toContain('placeholders');
    expect({...response.headers, Link: baselineHeaders.Link}).toEqual(baselineHeaders);
    expect(fetches).toEqual([...baselineFetches, ...unityCssPaths.map((path) => `https://${host}${path}`)]);
    expect(mockOnElement.mock.calls.map(([selector]) => selector)).toEqual(baselineSelectors);
    const headHandler = mockOnElement.mock.calls.find(([selector]) => selector === 'head')[1];
    const append = jest.fn();
    headHandler({append});
    expect(append.mock.calls).toHaveLength(7);
    expect(append.mock.calls[0][0]).toContain('<style id="inline-milo-styles">');
    expect(append.mock.calls[1][0]).toContain('<style id="inline-dc-styles">');
    expect(append.mock.calls.slice(2, 6)).toEqual([
      ['<style id="inline-unity-shared-styles">styles response text</style>'],
      ['<style id="inline-unity-prompt-upload-styles">styles response text</style>'],
      ['<style id="inline-unity-marquee-styles">styles response text</style>'],
      ['<style id="inline-unity-styles">styles response text</style>'],
    ]);
    expect(append.mock.calls[6]).toEqual(baselineAppend.mock.calls[3]);
    expect(append.mock.calls.some(([css]) => css.includes('inline-verb-widget-styles'))).toBe(false);
  });

  it.each(['.unity.workflow-acrobat', '.study-marquee', '.verb-marquee', '.verb-widget-client-upload'])(
    'preserves inline styles for %s when Unity CSS is unavailable', async (selector) => {
      authoredBlocks.add('.unity.workflow-acrobat');
      authoredBlocks.add(selector);
      unityCss404 = unityCssPaths[0];
      const response = await replaceResponseProvider(new Request({path: '/acrobat/online/pdf-to-ppt'}));
      expect(response.status).toBe(200);
      expect(fetches.some((path) => unityCssPaths.some((cssPath) => path.endsWith(cssPath)))).toBe(false);
      const append = jest.fn();
      mockOnElement.mock.calls.find(([selected]) => selected === 'head')[1]({append});
      expect(append.mock.calls).toHaveLength(4);
    },
  );

  it.each(unityCssPaths)(
    "handles a failed Unity CSS fetch: %s", async (path) => {
    unityMarquee = true;
    authoredBlocks.add('.unity.workflow-prompt-upload');
    unityCss404 = path;
    const response = await replaceResponseProvider(new Request({path: '/acrobat/online/pdf-to-ppt'}));
    expect(response.status).toBe(500);
    expect(response.body).toContain(`Failed to fetch resource: ${path} status: 404`);
  });

  it.each([undefined, '.unity.workflow-acrobat'])('does not inject Unity marquee styles or preloads without prompt upload: %s', async (workflow) => {
    unityMarquee = true;
    if (workflow) authoredBlocks.add(workflow);
    const response = await replaceResponseProvider(new Request({path: '/acrobat/online/pdf-to-ppt'}));
    expect(response.status).toBe(200);
    expect(response.headers.Link).not.toContain('/unitylibs/');
    expect(response.headers.Link).not.toContain('/acrobat/blocks/unity-marquee/');
    expect(fetches.some((path) => path.includes('/unitylibs/'))).toBe(false);
    const append = jest.fn();
    mockOnElement.mock.calls.find(([selector]) => selector === 'head')[1]({append});
    expect(append.mock.calls).toHaveLength(workflow ? 4 : 2);
    expect(append.mock.calls.some(([css]) => css.includes('inline-unity-'))).toBe(false);
  });

  it.each(['.verb-widget-client-upload', '.study-marquee', '.verb-marquee'])(
    'preserves existing block precedence for %s',
    async (selector) => {
      authoredBlocks.add('.unity.workflow-acrobat');
      authoredBlocks.add(selector);
      const request = new Request({path: '/acrobat/online/pdf-to-ppt'});
      const baseline = await replaceResponseProvider(request);
      const baselineFetches = [...fetches];
      const baselineAppend = jest.fn();
      mockOnElement.mock.calls.find(([selected]) => selected === 'head')[1]({append: baselineAppend});
      fetches = [];
      mockOnElement.mockClear();
      unityMarquee = true;
      const response = await replaceResponseProvider(request);
      const append = jest.fn();
      mockOnElement.mock.calls.find(([selected]) => selected === 'head')[1]({append});
      expect(response.status).toBe(200);
      expect(response.headers).toEqual(baseline.headers);
      expect(fetches).toEqual(baselineFetches);
      expect(append.mock.calls).toEqual(baselineAppend.mock.calls);
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
        'https://www.adobe.com/acrobat/blocks/verb-widget-client-upload/verb-widget-client-upload.css',
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
        'https://www.adobe.com/acrobat/blocks/verb-widget-client-upload/verb-widget-client-upload.css',
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

  it("responseProvider client-upload hero SVG preload", async () => {
    const originalOnElement = mockOnElement.getMockImplementation();
    mockOnElement.mockImplementation((elem, fn) => {
      if (elem === '.verb-widget-client-upload') {
        fn({ getAttribute: jest.fn() });
      }
      return {};
    });

    try {
      const heroPreload = '</acrobat/blocks/verb-widget/icons/image-to-pdf.svg>;rel="preload";as="fetch";fetchpriority="high";crossorigin="anonymous"';

      let response = await replaceResponseProvider(new Request({ path: '/acrobat/online/image-to-pdf' }));
      expect(response.status).toEqual(200);
      expect(response.headers.Link).toContain('</acrobat/blocks/verb-widget-client-upload/verb-widget-client-upload.js>');
      expect(response.headers.Link).toContain(heroPreload);

      response = await replaceResponseProvider(new Request({ path: '/jp/acrobat/online/image-to-pdf' }));
      expect(response.status).toEqual(200);
      expect(response.headers.Link).toContain('</jp/dc-shared/placeholders.json>');
      expect(response.headers.Link).toContain(heroPreload);
    } finally {
      mockOnElement.mockImplementation(originalOnElement);
    }
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
