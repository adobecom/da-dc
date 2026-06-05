module.exports = {
  FeatureName: 'Add PDF Page Numbers',
  features: [
    {
      tcid: '0',
      name: '@add-pdf-number',
      path: '/acrobat/online/add-pdf-page-numbers',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Add page numbers to a PDF',
        verbCopy: 'Drag and drop a PDF to add page numbers.',
      },
      tags: '@add-pdf-number @smoke @regression @unity',
    },
  ],
};
