module.exports = {
  FeatureName: 'Compress PDF to 10MB',
  features: [
    {
      tcid: '0',
      name: '@compress-pdf-10mb',
      path: '/in/acrobat/online/compress-pdf-10mb',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Compress PDF to 10MB',
        verbCopy: 'Drag and drop a PDF to reduce file size to 10MB.',
      },
      tags: '@compress-pdf-10mb @smoke @regression @unity',
    },
  ],
};
