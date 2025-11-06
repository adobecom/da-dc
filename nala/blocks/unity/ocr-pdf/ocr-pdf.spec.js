module.exports = {
  FeatureName: 'OCR PDF files',
  features: [
    {
      tcid: '0',
      name: '@ocr-pdf',
      path: '/acrobat/online/test/ocr-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'OCR a PDF',
        verbCopy: 'Drag and drop a PDF file to recognize text in it using OCR technology, creating a searchable PDF.',
      },
      tags: '@ocr-pdf @smoke @regression @unity',
    },
  ],
};
