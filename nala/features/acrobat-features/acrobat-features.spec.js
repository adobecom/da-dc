/* eslint-disable object-curly-newline */
module.exports = {
  FeatureName: 'Acrobat Features',
  features: [
    {
      tcid: '0',
      name: '@features-smoke',
      path: '/acrobat/features',
      data: {},
      tags: '@features @smoke @live',
    },
    {
      tcid: '1',
      name: '@features-modify-pdfs-smoke',
      path: '/acrobat/features/modify-pdfs',
      data: {},
      tags: '@features @modify-pdfs @smoke @live',
    },
    {
      tcid: '2',
      name: '@features-export-pdf-smoke',
      path: '/acrobat/features/export-pdf',
      data: {},
      tags: '@features @export-pdf @smoke @live',
    },
  ],
};
