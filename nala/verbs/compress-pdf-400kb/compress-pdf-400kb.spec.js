module.exports = {
  FeatureName: 'Compress PDF to 400KB',
  features: [
    {
      tcid: '0',
      name: '@compress-pdf-400kb',
      path: '/in/acrobat/online/compress-pdf-400kb',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Compress PDF to 400KB',
        verbCopy: 'Drag and drop a PDF to reduce file size to 400KB.',
      },
      tags: '@compress-pdf-400kb @smoke @regression @unity',
    },
  ],
};
