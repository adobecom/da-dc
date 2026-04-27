module.exports = {
  FeatureName: 'Extract Pages Pdf',
  features: [
    {
      tcid: '0',
      name: '@extract-pages',
      path: '/acrobat/online/extract-pdf-pages',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Extract PDF pages',
        verbCopy: 'Drag and drop a PDF file, then extract pages from it.',
      },
      tags: '@extract-pages @smoke @regression @unity',
    },
  ],
};
