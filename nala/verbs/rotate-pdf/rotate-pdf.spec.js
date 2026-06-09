module.exports = {
  FeatureName: 'Rotate PDF',
  features: [
    {
      tcid: '0',
      name: '@rotate-pdf',
      path: '/acrobat/online/rotate-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Rotate PDF pages',
        verbCopy: 'Drag and drop one or more PDFs, then rotate pages with our PDF rotator.',
      },
      tags: '@rotate-pdf @smoke @regression @unity',
    },
  ],
};
