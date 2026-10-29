/* eslint-disable object-curly-newline */
module.exports = {
  FeatureName: 'Acrobat Plans',
  features: [
    {
      tcid: '0',
      name: '@plans-individuals-smoke',
      path: '/acrobat/plans',
      data: { tabId: 'tab-compare-plans-1' },
      tags: '@plans @pricing-individuals @smoke @live',
    },
    {
      tcid: '1',
      name: '@plans-business-smoke',
      path: '/acrobat/plans?tab=compare-plans-2',
      data: { tabId: 'tab-compare-plans-2' },
      tags: '@plans @pricing-business @business @smoke @live',
    },
    {
      tcid: '2',
      name: '@plans-students-smoke',
      path: '/acrobat/plans?tab=compare-plans-3',
      data: { tabId: 'tab-compare-plans-3' },
      tags: '@plans @pricing-students @students @smoke @live',
    },
  ],
};
