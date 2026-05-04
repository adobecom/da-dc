module.exports = {
  FeatureName: 'Delete Pdf Pages',
  features: [
    {
      tcid: '0',
      name: '@delete-pdf',
      path: '/acrobat/online/delete-pdf-pages',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Delete PDF pages',
        verbCopy: 'Drag and drop a file, then remove pages from your PDF.',
      },
      tags: '@delete-pdf @smoke @regression @unity',
    },
  ],
};
