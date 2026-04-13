/* eslint-disable object-curly-newline */
module.exports = {
  FeatureName: 'Acrobat Online Sign and Protect',
  features: [
    {
      tcid: '0',
      name: '@online-sign-pdf-smoke',
      path: '/acrobat/online/sign-pdf',
      verb: 'fillsign',
      data: {},
      tags: '@online @sign @verbs @sign-pdf @smoke @live',
    },
    {
      tcid: '1',
      name: '@online-request-signature-smoke',
      path: '/acrobat/online/request-signature',
      verb: 'sendforsignature',
      data: {},
      tags: '@online @sign @verbs @request-signature @smoke @live',
    },
    {
      tcid: '2',
      name: '@online-password-protect-pdf-smoke',
      path: '/acrobat/online/password-protect-pdf',
      verb: 'protect-pdf',
      data: {},
      tags: '@online @sign @verbs @password-protect-pdf @smoke @live',
    },
  ],
};
