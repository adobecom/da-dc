module.exports = {
  FeatureName: 'Add pages to a PDF',
  features: [
    {
      tcid: '0',
      name: '@add-pages-to-pdf',
      path: '/acrobat/online/test/add-pages-to-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Add page numbers to a PDF',
        verbCopy: 'Drag and drop a PDF file, then insert pages.',
      },
      tags: '@add-pages-to-pdf @smoke @regression @unity',
    },
  ],
};
