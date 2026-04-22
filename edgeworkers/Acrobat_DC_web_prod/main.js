import { crypto } from 'crypto';
import { HtmlRewritingStream } from 'html-rewriter';
import { TextEncoder, btoa } from 'encoding';
import { WritableStream } from 'streams';
import { createResponse } from 'create-response';
import { httpRequest } from 'http-request';
//import { logger } from 'log';
import { EdgeKV } from './edgekv.js';
import contentSecurityPolicy from './utils/csp/index.js';

export async function responseProvider(request) {
  if (['acrobat.adobe.com','stage.acrobat.adobe.com'].includes(request.host)) {
    return frictionlessResponseProvider(request);
  }
  const path = request.path.split('/');
  const first = path[1];
  const last = path.splice(-1)[0].split('.')[0];
  const origin = `${request.scheme}://${request.host}`;
  const isProd = request.host === 'www.adobe.com';
  const rewriter = new HtmlRewritingStream();

  const fetchFrictionlessPage = async () => {
    // Setup: Fetch a stream containing HTML
    const path = `${origin}${request.path}.html`;
    const headers = {'X-EW-Frictionless-Page': ['true']};
    const htmlResponse = await httpRequest(
      path,
      {headers},
    );
    if (!htmlResponse.ok) {
      const err = new Error(`Failed to fetch doc: ${path}`);
      err.body = htmlResponse.body;
      err.status = htmlResponse.status;
      throw err;
    }

    // Make preliminary pass through the content to capture metadata
    const firstPassRewriter = new HtmlRewritingStream();
    let mobileWidget, unityWorkflow;
    const prefix = isProd ? '' : 'stg-';
    firstPassRewriter.onElement('meta[name="mobile-widget"]', el => {
      mobileWidget = el.getAttribute('content');
    });
    firstPassRewriter.onElement('.unity.workflow-acrobat', el => {
      unityWorkflow = true;
    });
    let studyMarquee;
    firstPassRewriter.onElement('.study-marquee', el => {
      studyMarquee = true;
    });
    const nullWriter = new WritableStream({
      write() {},
      close() {},
    });

    const [preParseStream, responseStream] = htmlResponse.body.tee();
    await preParseStream.pipeThrough(firstPassRewriter).pipeTo(nullWriter);

    // Strip headers which should not be forwarded
    const responseHeaders = htmlResponse.getHeaders();
    for (const prop of [
      'accept-encoding',
      'cache-control',
      'content-encoding',
      'content-length',
      'connection',
      'keep-alive',
      'link',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'transfer-encoding',
      'upgrade',
      'vary',
    ]) {
      delete responseHeaders[prop];
    }

    return [responseStream, responseHeaders, mobileWidget, unityWorkflow, studyMarquee];
  };

  const fetchResource = async path => {
    const response = await httpRequest(origin + path);
    if (response.ok) {
      return response.text();
    }
    throw new Error(`Failed to fetch resource: ${path} status: ${response.status}`);
  };

  const scriptHashes = [];
  let prerenderTop = 0;

  const inlineScripts = async (unityWorkflow, mobileWidget, scripts, dcConverter) => {
    // Inline dc-converter-widget.js and scripts.js. Remove modular definition and import.
    // Change relative paths to absolute. Remove JS-driven CSP in favor of HTTP header.
    let inlineScript = scripts
      .replace('await import(\'./contentSecurityPolicy/csp.js\')', '{default:()=>{}}')
      .replace('await import(\'./dcLana.js\')', 'await import(\'/acrobat/scripts/dcLana.js\')')
      .replace('await import(\'./susiAuthHandler.js\')', 'await import(\'/acrobat/scripts/susiAuthHandler.js\')')
      .replace('await import(\'./geo-phoneNumber.js\')', 'await import(\'/acrobat/scripts/geo-phoneNumber.js\')')
      .replace('await import(\'./tooltips.js\')', 'await import(\'/acrobat/scripts/tooltips.js\')')
      .replace('await import(\'./imageReplacer.js\')', 'await import(\'/acrobat/scripts/imageReplacer.js\')');

    if (!(mobileWidget && request.device.isMobile) && !unityWorkflow) {
      inlineScript = dcConverter
        .replace('export default', 'const dcConverter = ')
        .replace('import(\'../../scripts/frictionless.js\')', 'import(\'/acrobat/scripts/frictionless.js\')')
      + inlineScript
        .replace('const { default: dcConverter } = await import(`../blocks/${blockName}/${blockName}.js`);', '')
    } 

    // Generate hash of inlined script and add to our CSP policy
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(inlineScript));
    const hash64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
    scriptHashes.push(`'sha256-${hash64}'`);

    const headers = request.getHeaders();
    const ua = headers["user-agent"][0];
    const isMobile = /android|iphone|ipod|blackberry|windows phone/i.test(ua);
    const isIPadOS = ua.includes('Mac') && ua.includes('Version/') && !/iphone|ipod/i.test(ua);
    const isTablet = /ipad|android(?!.*mobile)/i.test(ua);    
    if (unityWorkflow && !(isTablet || isIPadOS)) {
      const group = 'frictionless' + (first === 'acrobat' ? '' : `_${first}`);
      const edgeKv = new EdgeKV({namespace: isProd? 'prod' : 'stage', group});
      let prerenderHtml = '<!-- init -->';
      try {
        const item = last + ((isMobile || isIPadOS || isTablet) ? '_mobile' : '_desktop');
        const prerenderJson = await edgeKv.getJson({ item, default_value: {html: '', top: 0} });
        prerenderHtml = prerenderJson.html;
        prerenderTop = prerenderJson.top;
        if (prerenderHtml) {
          prerenderHtml = `<div id="prerender_verb-widget">${prerenderHtml}</div>`;
        }
      } catch (e) {
        prerenderHtml = `<!-- ${e.toString()} -->`;
      }

      rewriter.onElement('body', el => {
        el.prepend(prerenderHtml);
      });
    }

    // Remove external script reference
    rewriter.onElement('script[src="/acrobat/scripts/scripts.js"]', el => {
      el.replaceWith('');
    });
    // Can't put scripts.js in HEAD, loadPage needs the BODY to be parsed.
    rewriter.onElement('body"]', el => {
      // TODO: Make more explicit markers in code
      el.append(`<script>${inlineScript}</script>`);
    });
  };

  const inlineStyles = (dcStyles, miloStyles, verbWidgetStyles, studyMarqueeStyles, unityWorkflow, studyMarquee, prerenderTop) => {
    rewriter.onElement('head', el => {
      el.append(`<style id="inline-milo-styles">${miloStyles}</style>`);
      el.append(`<style id="inline-dc-styles">${dcStyles}</style>`);
      if (unityWorkflow) {
        if (studyMarquee) {
          el.append(`<style id="inline-study-marquee-styles">${studyMarqueeStyles}</style>`);
        } else {
          el.append(`<style id="inline-verb-widget-styles">${verbWidgetStyles}</style>`);
        }
        el.append(`<style>#prerender_verb-widget { position: absolute; top: ${prerenderTop}; left: 0; width: 100%; z-index: -1; pointer-events: auto; }</style></head>`);
      }
    });
  };

  try {
    const [
      [responseStream, responseHeaders, mobileWidget, unityWorkflow, studyMarquee],
      scripts,
      dcConverter,
      dcStyles,
      miloStyles,
      verbWidgetStyles,
      studyMarqueeStyles
    ] = await Promise.all([
      fetchFrictionlessPage(),
      fetchResource('/acrobat/scripts/scripts.js'),
      fetchResource('/acrobat/blocks/dc-converter-widget/dc-converter-widget.js'),
      fetchResource('/acrobat/styles/styles.css'),
      fetchResource('/libs/styles/styles.css'),
      fetchResource('/acrobat/blocks/verb-widget/verb-widget.css'),
      fetchResource('/acrobat/blocks/study-marquee/study-marquee.css')
    ]);

    await inlineScripts(unityWorkflow, mobileWidget, scripts, dcConverter);
    inlineStyles(dcStyles, miloStyles, verbWidgetStyles, studyMarqueeStyles, unityWorkflow, studyMarquee, prerenderTop);

    const csp = contentSecurityPolicy(isProd, scriptHashes);
    const acrobat = isProd ? 'https://acrobat.adobe.com' : 'https://stage.acrobat.adobe.com';
    const adobeid = isProd ? 'https://adobeid-na1.services.adobe.com' : 'https://adobeid-na1-stg1.services.adobe.com';

    let headerLink = [
        `<${adobeid}>;rel="preconnect"`,
        '<https://assets.adobedtm.com>;rel="preconnect"',
        '<https://use.typekit.net>;rel="preconnect"',
        `</libs/deps/imslib.min.js>;rel="preload";as="script"`,
    ];
    if (unityWorkflow) {
      headerLink = [...headerLink,
        `</acrobat/blocks/unity/unity.js>;rel="preload";as="script";crossorigin="anonymous"`,
        `</acrobat/blocks/unity/unity.css>;rel="preload";as="style"`,
        `</acrobat/scripts/utils.js>;rel="preload";as="script";crossorigin="anonymous"`,
        `</libs/utils/utils.js>;rel="preload";as="script";crossorigin="anonymous"`,
        `</libs/features/placeholders.js>;rel="preload";as="script";crossorigin="anonymous"`,
        `<${first === 'acrobat' ? '' : `/${first}`}/dc-shared/placeholders.json>;rel="preload";as="fetch";crossorigin="anonymous"`,
      ];
      if (studyMarquee) {
        headerLink = [...headerLink,
          `</acrobat/blocks/study-marquee/study-marquee.js>;rel="preload";as="script";crossorigin="anonymous"`,
          `</acrobat/blocks/study-marquee/study-marquee.css>;rel="preload";as="style"`,
        ];
      } else {
        headerLink = [...headerLink,
          `</acrobat/blocks/verb-widget/verb-widget.js>;rel="preload";as="script";crossorigin="anonymous"`,
          `</acrobat/blocks/verb-widget/verb-widget.css>;rel="preload";as="style"`,
        ];
      }
    }
    headerLink = headerLink.join();

    const headers = {
      ...responseHeaders,
      'Content-Security-Policy': csp,
      Link: headerLink
    };

    return createResponse(
      200,
      headers,
      responseStream.pipeThrough(rewriter),
    );
  } catch (error) {
    return createResponse(error.status ?? 500, {}, error.body ?? error.message);
  }
}

async function frictionlessResponseProvider(request) {
  const secretCDNToken = request.getVariable('PMUSER_ADOBE_CDN_TOKEN');
  const path = request.path.split('/');
  const headers = {'X-Adobe-CDN-Token': secretCDNToken};
  const first = path[1];
  const last = path.splice(-1)[0].split('.')[0];
  const origin = `${request.scheme}://${request.host}`;
  const isProd = request.host === 'acrobat.adobe.com';
  const codeRoot = '/dc-shared';
  const contentRoot = '/dc-shared';
  const rewriter = new HtmlRewritingStream();

  const fetchFrictionlessPage = async () => {
    // Setup: Fetch a stream containing HTML
    const hasLocalePrefix = request.path.split('/').filter(Boolean).length > 1;
    let docPath;
    if (hasLocalePrefix) {
      docPath = `${origin}${request.path.replace(`/${first}/`, `/${first}/dc-shared/`)}`;
    } else {
      docPath = `${origin}/dc-shared${request.path}`;
    }
    
    const htmlResponse = await httpRequest(docPath, { headers });
    if (!htmlResponse.ok) {
      const err = new Error(`Failed to fetch doc: ${docPath}`);
      err.body = htmlResponse.body;
      err.status = htmlResponse.status;
      throw err;
    }

    // Make preliminary pass through the content to capture metadata
    const firstPassRewriter = new HtmlRewritingStream();
    let mobileWidget, unityWorkflow;
    firstPassRewriter.onElement('meta[name="mobile-widget"]', el => {
      mobileWidget = el.getAttribute('content');
    });
    firstPassRewriter.onElement('.unity.workflow-acrobat', el => {
      unityWorkflow = true;
    });    
    const nullWriter = new WritableStream({
      write() {},
      close() {},
    });

    const [preParseStream, responseStream] = htmlResponse.body.tee();
    await preParseStream.pipeThrough(firstPassRewriter).pipeTo(nullWriter);

    // Strip headers which should not be forwarded
    const responseHeaders = htmlResponse.getHeaders();
    for (const prop of [
      'accept-encoding',
      'cache-control',
      'content-encoding',
      'content-length',
      'connection',
      'keep-alive',
      'link',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'transfer-encoding',
      'upgrade',
      'vary',
      'x-robots-tag',
    ]) {
      delete responseHeaders[prop];
    }

    return [responseStream, responseHeaders, mobileWidget, unityWorkflow];
  };

  const fetchResource = async path => {
    const url = path.startsWith('http') ? path : origin + path;
    const response = await httpRequest(url, { headers });
    if (response.ok) {
      return response.text();
    }
    const statusText = response.statusText || 'Unknown';
    throw new Error(
      `fetchResource failed | path: "${path}" | url: "${url}" | status: ${response.status} (${statusText})`
    );
  };

  const scriptHashes = [];
  let prerenderTop = 0;

  const inlineScripts = async (unityWorkflow, mobileWidget, scripts, dcConverter) => {
    // Inline dc-converter-widget.js and scripts.js. Remove modular definition and import.
    // Change relative paths to absolute. Remove JS-driven CSP in favor of HTTP header.
    let inlineScript = scripts
      .replace('await import(\'./contentSecurityPolicy/csp.js\')', '{default:()=>{}}')
      .replace('await import(\'./dcLana.js\')', `await import('${codeRoot}/scripts/dcLana.js')`)
      .replace('await import(\'./susiAuthHandler.js\')', `await import('${codeRoot}/scripts/susiAuthHandler.js')`)
      .replace('await import(\'./geo-phoneNumber.js\')', `await import('${codeRoot}/scripts/geo-phoneNumber.js')`)
      .replace('await import(\'./tooltips.js\')', `await import('${codeRoot}/scripts/tooltips.js')`)
      .replace('await import(\'./imageReplacer.js\')', `await import('${codeRoot}/scripts/imageReplacer.js')`);

    if (!(mobileWidget && request.device.isMobile) && !unityWorkflow) {
      inlineScript = dcConverter
        .replace('export default', 'const dcConverter = ')
        .replace('import(\'../../scripts/frictionless.js\')', `import('${codeRoot}/scripts/frictionless.js')`)
      + inlineScript
        .replace('const { default: dcConverter } = await import(`../blocks/${blockName}/${blockName}.js`);', '')
    } 

    // Generate hash of inlined script and add to our CSP policy
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(inlineScript));
    const hash64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
    scriptHashes.push(`'sha256-${hash64}'`);

    const headers = request.getHeaders();
    const ua = headers["user-agent"][0];
    const isMobile = /android|iphone|ipod|blackberry|windows phone/i.test(ua);
    const isIPadOS = ua.includes('Mac') && ua.includes('Version/') && !/iphone|ipod/i.test(ua);
    const isTablet = /ipad|android(?!.*mobile)/i.test(ua);    
    if (unityWorkflow && !(isTablet || isIPadOS)) {
      const group = 'frictionless_acrobat' + `${request.path.split('/').filter(Boolean).length <= 1 ? '' : `_${first}`}`;
      const edgeKv = new EdgeKV({namespace: isProd? 'prod' : 'stage', group});
      let prerenderHtml = '<!-- init -->';
      try {
        const item = last + ((isMobile || isIPadOS || isTablet) ? '_mobile' : '_desktop');
        const prerenderJson = await edgeKv.getJson({ item, default_value: {html: '', top: 0} });
        prerenderHtml = prerenderJson.html;
        prerenderTop = prerenderJson.top;
        if (prerenderHtml) {
          prerenderHtml = `<div id="prerender_verb-widget">${prerenderHtml}</div>`;
        }
      } catch (e) {
        prerenderHtml = `<!-- ${e.toString()} -->`;
      }

      rewriter.onElement('body', el => {
        el.prepend(prerenderHtml);
      });
    }

    // Remove external script reference
    rewriter.onElement(`script[src="${codeRoot}/scripts/scripts.js"]`, el => {
      el.replaceWith('');
    });
    // Can't put scripts.js in HEAD, loadPage needs the BODY to be parsed.
    rewriter.onElement('body', el => {
      // TODO: Make more explicit markers in code
      el.append(`<script>${inlineScript}</script>`);
    });
  };

  const inlineStyles = (dcStyles, miloStyles, verbWidgetStyles, unityWorkflow, prerenderTop) => {
    rewriter.onElement('head', el => {
      el.append(`<style id="inline-milo-styles">${miloStyles}</style>`);
      el.append(`<style id="inline-dc-styles">${dcStyles}</style>`);
      if (unityWorkflow) {
        el.append(`<style id="inline-verb-widget-styles">${verbWidgetStyles}</style>`);
        el.append(`<style>#prerender_verb-widget { position: absolute; top: ${prerenderTop}; left: 0; width: 100%; z-index: -1; pointer-events: auto; }</style></head>`);
      }
    });
  };

  // remove wrong canonical caused by duplicating content
  function fixCanonical() {
    rewriter.onElement('link[rel="canonical"]', el => {
      const href = el.getAttribute('href');
      if (href && href.includes('/dc-shared')) {
        const newHref = href.replace('/dc-shared', '');
        el.replaceWith(`<link rel="canonical" href="${newHref}">`);
      }
    });
  }

  try {
    const miloBaseUrl = '/dc-shared';
    const [
      [responseStream, responseHeaders, mobileWidget, unityWorkflow],
      scripts,
      dcConverter,
      dcStyles,
      miloStyles,
      verbWidgetStyles
    ] = await Promise.all([
      fetchFrictionlessPage(),
      fetchResource(`${codeRoot}/scripts/scripts.js`),
      fetchResource(`${codeRoot}/blocks/dc-converter-widget/dc-converter-widget.js`),
      fetchResource(`${codeRoot}/styles/styles.css`),
      fetchResource(`${miloBaseUrl}/libs/styles/styles.css`),
      fetchResource(`${codeRoot}/blocks/verb-widget/verb-widget.css`)
    ]);

    await inlineScripts(unityWorkflow, mobileWidget, scripts, dcConverter);
    inlineStyles(dcStyles, miloStyles, verbWidgetStyles, unityWorkflow, prerenderTop);
    fixCanonical();

    const csp = contentSecurityPolicy(isProd, scriptHashes);
    const adobeid = isProd ? 'https://adobeid-na1.services.adobe.com' : 'https://adobeid-na1-stg1.services.adobe.com';

    let headerLink = [
        `<${adobeid}>;rel="preconnect"`,
        '<https://assets.adobedtm.com>;rel="preconnect"',
        '<https://use.typekit.net>;rel="preconnect"',
        `<${miloBaseUrl}/libs/deps/imslib.min.js>;rel="preload";as="script"`,
    ];
    if (unityWorkflow) {
      headerLink = [...headerLink,
        `<${codeRoot}/blocks/unity/unity.js>;rel="preload";as="script";crossorigin="anonymous"`,
        `<${codeRoot}/blocks/unity/unity.css>;rel="preload";as="style"`,
        `<${codeRoot}/blocks/verb-widget/verb-widget.js>;rel="preload";as="script";crossorigin="anonymous"`,
        `<${codeRoot}/blocks/verb-widget/verb-widget.css>;rel="preload";as="style"`,
        `<${codeRoot}/scripts/utils.js>;rel="preload";as="script";crossorigin="anonymous"`,
        `<${miloBaseUrl}/libs/utils/utils.js>;rel="preload";as="script";crossorigin="anonymous"`,
        `<${miloBaseUrl}/libs/features/placeholders.js>;rel="preload";as="script";crossorigin="anonymous"`,
        `<${request.path.split('/').filter(Boolean).length <= 1 ? '' : `/${first}`}${contentRoot}/placeholders.json>;rel="preload";as="fetch";crossorigin="anonymous"`
      ];
    }
    headerLink = headerLink.join();

    const headers = {
      ...responseHeaders,
      'Content-Security-Policy': csp,
      Link: headerLink
    };

    return createResponse(
      200,
      headers,
      responseStream.pipeThrough(rewriter),
    );
  } catch (error) {
    return createResponse(error.status ?? 500, {}, error.body ?? error.message);
  }
}

export function onClientRequest (request) {
  const headers = request.getHeaders();
  const ua = headers["user-agent"][0];
  const isMobile = /android|iphone|ipod|blackberry|windows phone/i.test(ua);
  const isIPadOS = ua.includes('Mac') && ua.includes('Version/') && !/iphone|ipod/i.test(ua);
  const isTablet = /ipad|android(?!.*mobile)/i.test(ua);

  request.setVariable('PMUSER_DEVICETYPE', 'Desktop');
  if (isMobile) {
    request.setVariable('PMUSER_DEVICETYPE', 'Mobile');
  } else if (isIPadOS || isTablet) {
    request.setVariable('PMUSER_DEVICETYPE', 'Tablet');
  }
  request.cacheKey.includeVariable('PMUSER_DEVICETYPE');
}
