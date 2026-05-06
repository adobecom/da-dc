module.exports = {
  FeatureName: 'Delete Pdf',
  features: [
    {
      tcid: '0',
      name: '@rearrange-pdf',
      path: '/acrobat/online/rearrange-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Rearrange PDF pages',
        verbCopy: 'Drag and drop a PDF to reorder or rearrange the pages.',
      },
      tags: '@rearrange-pdf @smoke @regression @unity',
    },
  ],
};
