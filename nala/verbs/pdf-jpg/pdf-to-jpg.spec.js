module.exports = {
  FeatureName: 'PDF to JPG',
  features: [
    {
      tcid: '0',
      name: '@pdf-jpg',
      path: '/acrobat/online/pdf-to-jpg',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Convert a PDF to JPG image',
        verbCopy: 'Drag and drop a PDF, then convert to JPG, PNG or TIFF file formats.',
      },
      tags: '@pdf-to-jpg @smoke @regression @unity',
    },
  ],
};
