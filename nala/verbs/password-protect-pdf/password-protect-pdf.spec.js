module.exports = {
  FeatureName: 'Password Protect PDF',
  features: [
    {
      tcid: '0',
      name: '@password-protect-pdf',
      path: '/acrobat/online/password-protect-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Password protect a PDF',
        verbCopy: 'Drag and drop a PDF, then add a password to protect your file.',
      },
      tags: '@password-protect-pdf @smoke @regression @unity',
    },
  ],
};
