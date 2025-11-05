module.exports = {
  FeatureName: 'Add page numbers to a PDF',
  features: [
    {
      tcid: '0',
      name: '@add-pdf-page-numbers',
      path: '/acrobat/online/test/add-pdf-page-numbers',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Add page numbers to a PDF',
        verbCopy: 'Drag and drop a PDF to add page numbers.',
      },
      tags: '@add-pdf-page-numbers @smoke @regression @unity',
    },
  ],
};
