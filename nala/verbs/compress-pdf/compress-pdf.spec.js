module.exports = {
  FeatureName: 'Compress PDF',
  features: [
    {
      tcid: '0',
      name: '@compress-pdf',
      path: '/acrobat/online/compress-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Compress a PDF',
        verbCopy: 'Drag and drop a PDF to reduce file size with our PDF compressor.',
      },
      tags: '@compress-pdf @smoke @regression @unity',
    },
  ],
};
