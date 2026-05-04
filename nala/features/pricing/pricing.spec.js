/* eslint-disable object-curly-newline */
module.exports = {
  FeatureName: 'Acrobat Pricing',
  features: [
    {
      tcid: '0',
      name: '@pricing-individuals-smoke',
      path: '/acrobat/pricing',
      data: {},
      tags: '@pricing @smoke @live',
    },
    {
      tcid: '1',
      name: '@pricing-students-smoke',
      path: '/acrobat/pricing/students',
      data: {},
      tags: '@pricing @students @smoke @live',
    },
    {
      tcid: '2',
      name: '@pricing-compare-smoke',
      path: '/acrobat/pricing/compare-versions',
      data: {},
      tags: '@pricing @compare @smoke @live',
    },
    {
      tcid: '3',
      name: '@pricing-business-smoke',
      path: '/acrobat/pricing/business',
      data: {},
      tags: '@pricing @business @smoke @live',
    },
  ],
};
