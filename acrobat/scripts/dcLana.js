export default function lanaLogging() {
  const fricPage = document.querySelector('meta[name="dc-widget-version"]');
  const lanaOptions = { sampleRate: 1, tags: 'DC_Milo,Frictionless', severity: 'error' };

  const lanaCspOptions = { sampleRate: 0.001, tags: 'DC_Milo,Frictionless,CSP', severity: 'warning' };

  window.dcwErrors?.forEach((error) => {
    window.lana?.log(error, lanaOptions);
  });

  // Content Security Policy Logging
  if (fricPage) {
    window.cspErrors?.forEach((error) => {
      window.lana?.log(error, lanaCspOptions);
    });
    document.addEventListener('securitypolicyviolation', (e) => {
      window.lana?.log(`${e.violatedDirective} violation ¶ Refused to load content from ${e.blockedURI}`, lanaCspOptions);
    });
  }
}
