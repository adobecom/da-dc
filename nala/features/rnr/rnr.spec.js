module.exports = {
  FeatureName: 'Ratings and Reviews (RnR) block',
  features: [
    {
      tcid: '0',
      name: '@rnr-en',
      path: '/acrobat/online/compress-pdf',
      data: {
        verb: 'compress-pdf',
        locale: 'en-us',
        otherVerbPath: '/acrobat/online/merge-pdf',
      },
      tags: '@rnr @regression',
    },
    {
      tcid: '1',
      name: '@rnr-fr',
      path: '/fr/acrobat/online/compress-pdf',
      data: {
        verb: 'compress-pdf',
        locale: 'fr-FR',
        englishTitle: 'Rate your experience',
      },
      tags: '@rnr @regression',
    },
  ],
};
