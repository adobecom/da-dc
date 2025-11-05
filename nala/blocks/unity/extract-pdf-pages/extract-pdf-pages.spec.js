module.exports = {
  FeatureName: 'Extract PDF pages',
  features: [
    {
      tcid: '0',
      name: '@extract-pdf-pages',
      path: '/acrobat/online/test/extract-pdf-pages',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Extract PDF pages',
        verbCopy: 'Drag and drop a PDF file, then extract pages from it.',
      },
      tags: '@extract-pdf-pages @smoke @regression @unity',
    },
  ],
};
