/* eslint-disable object-curly-newline */
module.exports = {
  FeatureName: 'Complete PDF Solution',
  features: [
    {
      tcid: '0',
      name: '@pdf-solution-smoke',
      path: '/acrobat/complete-pdf-solution',
      data: {},
      tags: '@pdf-solution @smoke @live',
    },
    {
      tcid: '1',
      name: '@pdf-solution-edit-smoke',
      path: '/acrobat/complete-pdf-solution?ttid=edit-pdf',
      data: {},
      tags: '@pdf-solution @edit-pdf @smoke @live',
    },
  ],
};
