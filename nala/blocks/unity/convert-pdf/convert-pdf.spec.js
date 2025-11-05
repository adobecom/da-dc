module.exports = {
  FeatureName: 'Convert a PDF',
  features: [
    {
      tcid: '0',
      name: '@convert-pdf',
      path: '/acrobat/online/test/convert-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'PDF converter',
        verbCopy: 'Drag and drop a PDF, Microsoft Word, Excel, PowerPoint, or image file to use our PDF converter.',
      },
      tags: '@convert-pdf @smoke @regression @unity',
    },
  ],
};
