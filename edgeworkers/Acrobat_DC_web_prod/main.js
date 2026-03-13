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
  const path = request.path.split('/');
  const first = path[1];
  const last = path.splice(-1)[0].split('.')[0];
  const origin = `${request.scheme}://${request.host}`;
  const isProd = request.host === 'www.adobe.com' || request.host === 'acrobat.adobe.com';
  const isAcrobatSubdomain = ['acrobat.adobe.com','stage.acrobat.adobe.com'].includes(request.host);
  const codeRoot = isAcrobatSubdomain ? '/dc-shared' : '/acrobat';
  const contentRoot = '/dc-shared';
  const rewriter = new HtmlRewritingStream();

  const fetchFrictionlessPage = async () => {
    // Setup: Fetch a stream containing HTML
    const path = `${origin}${request.path}${isAcrobatSubdomain ? '' : '.html'}`;
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
    ]) {
      delete responseHeaders[prop];
    }

    return [responseStream, responseHeaders, mobileWidget, unityWorkflow];
  };

  const fetchResource = async path => {
    const url = path.startsWith('http') ? path : origin + path;
    const response = await httpRequest(url);
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
      let group;
      // on acrobat subdomain
      if (isAcrobatSubdomain) {
        group = 'frictionless_acrobat' + `${path.filter(Boolean).length <= 1 ? '' : `_${first}`}`;
      } else {
        // on www domain
        group = 'frictionless' + (first === 'acrobat' ? '' : `_${first}`);
      }

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

  try {
    const miloBaseUrl = isProd ? 'https://www.adobe.com' : 'https://www.stage.adobe.com';
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

    const csp = contentSecurityPolicy(isProd, scriptHashes);
    const adobeid = isProd ? 'https://adobeid-na1.services.adobe.com' : 'https://adobeid-na1-stg1.services.adobe.com';

    let headerLink = [
        `<${adobeid}>;rel="preconnect"`,
        '<https://assets.adobedtm.com>;rel="preconnect"',
        '<https://use.typekit.net>;rel="preconnect"',
        `<${miloBaseUrl}>;rel="preconnect"`,
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
      ];
      if (isAcrobatSubdomain) {
        headerLink.push(`<${path.filter(Boolean).length <= 1 ? '' : `/${first}`}/${contentRoot}/placeholders.json>;rel="preload";as="fetch";crossorigin="anonymous"`);
      } else {
        headerLink.push(`<${first === 'acrobat' ? '' : `/${first}`}/${contentRoot}/placeholders.json>;rel="preload";as="fetch";crossorigin="anonymous"`);
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
