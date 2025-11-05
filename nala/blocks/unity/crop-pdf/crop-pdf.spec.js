module.exports = {
  FeatureName: 'Crop PDF pages',
  features: [
    {
      tcid: '0',
      name: '@crop-pdf',
      path: '/acrobat/online/test/crop-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Crop PDF pages',
        verbCopy: 'Drag and drop a PDF, then crop it to change the PDF page size.',
      },
      tags: '@crop-pdf @smoke @regression @unity',
    },
  ],
};
