module.exports = {
  FeatureName: 'Split PDF',
  features: [
    {
      tcid: '0',
      name: '@split-pdf',
      path: '/acrobat/online/split-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Split PDF files',
        verbCopy: 'Drag and drop a PDF, then separate it into multiple files with our PDF splitter',
      },
      tags: '@split-pdf @smoke @regression @unity',
    },
  ],
};
