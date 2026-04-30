module.exports = {
  FeatureName: 'Add Pdf Page Numbers',
  features: [
    {
      tcid: '0',
      name: '@add-pdf',
      path: '/acrobat/online/add-pdf-page-numbers',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Add page numbers to a PDF',
        verbCopy: 'Drag and drop a PDF to add page numbers.',
      },
      tags: '@add-pdf @smoke @regression @unity',
    },
  ],
};
