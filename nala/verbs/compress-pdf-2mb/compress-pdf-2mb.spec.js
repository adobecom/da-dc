module.exports = {
  FeatureName: 'Compress PDF to 2MB',
  features: [
    {
      tcid: '0',
      name: '@compress-pdf-2mb',
      path: '/in/acrobat/online/compress-pdf-2mb',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Compress PDF to 2MB',
        verbCopy: 'Drag and drop a PDF to reduce file size to 2MB.',
      },
      tags: '@compress-pdf-2mb @smoke @regression @unity',
    },
  ],
};
