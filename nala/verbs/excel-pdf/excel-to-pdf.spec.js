module.exports = {
  FeatureName: 'Excel to PDF',
  features: [
    {
      tcid: '0',
      name: '@excel-pdf',
      path: '/acrobat/online/excel-to-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Convert Excel to PDF',
        verbCopy: 'Drag and drop a Microsoft Excel file (XLSX or XLS) to use our Excel to PDF converter.',
      },
      tags: '@excel-to-pdf @smoke @regression @unity',
    },
  ],
};
