module.exports = {
  FeatureName: 'Delete PDF pages',
  features: [
    {
      tcid: '0',
      name: '@delete-pdf-pages',
      path: '/acrobat/online/test/delete-pdf-pages',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Delete PDF pages',
        verbCopy: 'Drag and drop a file, then remove pages from your PDF.',
      },
      tags: '@delete-pdf-pages @smoke @regression @unity',
    },
  ],
};
