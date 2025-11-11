module.exports = {
  FeatureName: 'Convert Word to PDF',
  features: [
    {
      tcid: '0',
      name: '@word-to-pdf',
      path: '/drafts/nala/acrobat/online/test/word-to-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'Word to PDF converter',
        verbCopy: 'Drag and drop a Microsoft Word (DOCX or DOC), RTF, or TXT file to convert to PDF.',
      },
      tags: '@word-to-pdf @smoke @regression @unity',
    },
  ],
};
