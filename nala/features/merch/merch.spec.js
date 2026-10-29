/* eslint-disable object-curly-newline */
// The checkout links on /acrobat/plans use the same WCS OSI in every locale.
const planOffers = {
  'compare-plans-1': [
    'QgYu51CVY2wKyFEqMuvec4N1tc1OaCypeKJjT5n2-Fc', // Acrobat Standard: buy now
    '-lYm-YaTSZoUgv1gzqCgybgFotLqRsLwf8CgYdvdnsQ', // Acrobat Pro: free trial
    'vQmS1H18A6_kPd0tYBgKnp-TQIF0GbT6p8SH8rWcLMs', // Acrobat Pro: buy now
    'x0LkInr7lGkqK8dcTFS_Pc6oHauo_g7N_4yWT_gLn20', // Acrobat Studio: free trial
    'V3W0kzf4e6M2Ht1hP9ZAt3dQNmhuDFrmYmEPlE2SlG0', // Acrobat Studio: buy now
  ],
  'compare-plans-2': [
    'AW-jV275GNYtPao6Q7XWENqyv_Stkc1BbzF7ak2u1dk', // Acrobat Standard for teams: buy now
    '8Lr09qx_PHqAJUwvUNiof4FFFEKjsR1TTbvBUncV2b0', // Acrobat Pro for teams: free trial
    'vV01ci-KLH6hYdRfUKMBFx009hdpxZcIRG1-BY_PutE', // Acrobat Pro for teams: buy now
    'PVhDPYXq4fsy15OdlEE-XyIlvcxaPMxGs73pw39Cx-s', // Acrobat Studio for teams: free trial
    'SfkorgyrBAsqBVpyKddQQEn6jR0ItBohpXc74sZcKHg', // Acrobat Studio for teams: buy now
  ],
  'compare-plans-3': [
    'WJLr3TF4T4qyJIGZTsDf9KPbTfxA7qAgStpaF2IgYao', // Acrobat Pro for students: free trial
    'ZZQMV2cU-SWQoDxuznonUFMRdxSyTr4J3fB77YBNakY', // Acrobat Pro for students: buy now
    'OQ1oCm1tZG35Gj7LCrkGeOOdUMfVlC7xx-7ml-CTWIE', // Creative Cloud Pro for students: free trial
    'Hnk2P6L5wYhnpZLFYTW5upuk2Y3AJXlso8VGWQ0l2TI', // Creative Cloud Pro for students: buy now
  ],
};

module.exports = {
  FeatureName: 'Merch cards',
  planOffers,
  features: [
    { tcid: '0', name: '@merch-plans-us', path: '/acrobat/plans', data: { currency: 'US$', country: 'us' }, tags: '@merch @regression' },
    { tcid: '1', name: '@merch-plans-uk', path: '/uk/acrobat/plans', data: { currency: '£', country: 'gb' }, tags: '@merch @regression' },
    { tcid: '2', name: '@merch-plans-fr', path: '/fr/acrobat/plans', data: { currency: '€', country: 'fr' }, tags: '@merch @regression' },
    { tcid: '3', name: '@merch-plans-de', path: '/de/acrobat/plans', data: { currency: '€', country: 'de' }, tags: '@merch @regression' },
    { tcid: '4', name: '@merch-plans-jp', path: '/jp/acrobat/plans', data: { currency: '円', country: 'jp' }, tags: '@merch @regression' },
  ],
};
