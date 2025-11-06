module.exports = {
  FeatureName: 'Password protect PDF files',
  features: [
    {
      tcid: '0',
      name: '@protect-pdf',
      path: '/acrobat/online/test/protect-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Password protect a PDF',
        verbCopy: 'Drag and drop a PDF, then add a password to protect your file.',
      },
      tags: '@protect-pdf @smoke @regression @unity',
    },
  ],
};
