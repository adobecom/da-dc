module.exports = {
  FeatureName: 'Merge PDF files',
  features: [
    {
      tcid: '0',
      name: '@merge-pdf',
      path: '/acrobat/online/test/merge-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Merge PDF files',
        verbCopy: 'Drag and drop PDFs to merge them into one file with our PDF combiner.',
      },
      tags: '@merge-pdf @smoke @regression @unity',
    },
  ],
};
