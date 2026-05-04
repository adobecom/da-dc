module.exports = {
  FeatureName: 'OCR PDF',
  features: [
    {
      tcid: '0',
      name: '@ocr-pdf',
      path: '/acrobat/online/ocr-pdf',
      data: {
        verbTitle: 'Adobe Acrobat',
        verbHeading: 'OCR a PDF',
        verbCopy: 'Drag and drop a PDF file to recognize text in it using OCR technology, creating a searchable PDF.',
        verbCopyMobile: 'Select a PDF to recognize text in it using OCR technology.',
      },
      tags: '@ocr-pdf @smoke @regression @unity',
    },
  ],
};
