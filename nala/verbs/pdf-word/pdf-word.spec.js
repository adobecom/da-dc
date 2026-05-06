module.exports = {
  FeatureName: 'Pdf to Word',
  features: [
    {
      tcid: '0',
      name: '@pdf-word',
      path: '/acrobat/online/pdf-to-word',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Convert PDF to Word',
        verbCopy: 'Drag and drop a PDF file to use our PDF to Microsoft Word converter.',
      },
      tags: '@pdf-to-word @smoke @regression @unity',
    },
  ],
};
