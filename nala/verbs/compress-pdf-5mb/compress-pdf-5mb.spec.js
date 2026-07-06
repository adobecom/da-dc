module.exports = {
  FeatureName: 'Compress PDF to 5MB',
  features: [
    {
      tcid: '0',
      name: '@compress-pdf-5mb',
      path: '/in/acrobat/online/compress-pdf-5mb',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Compress PDF to 5MB',
        verbCopy: 'Drag and drop a PDF to reduce file size to 5MB.',
      },
      tags: '@compress-pdf-5mb @smoke @regression @unity',
    },
  ],
};
