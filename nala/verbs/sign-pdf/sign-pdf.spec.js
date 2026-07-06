module.exports = {
  FeatureName: 'Sign PDF',
  features: [
    {
      tcid: '0',
      name: '@sign-pdf',
      path: '/acrobat/online/sign-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Fill and sign a PDF',
        verbCopy: 'Drag and drop a PDF to use Acrobat as a PDF form filler.',
      },
      tags: '@sign-pdf @smoke @regression @unity',
    },
  ],
};
