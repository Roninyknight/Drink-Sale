import { config } from '../../config/index';

/** 获取商品列表 */
function mockFetchGoodCategory() {
  const { delay } = require('../_utils/delay');
  const { getCategoryList } = require('../../model/category');
  return delay().then(() => getCategoryList());
}

/** 获取商品列表 */
export function getCategoryList() {
  if (config.useMock) {
    return mockFetchGoodCategory();
  }
  return wx.cloud.callFunction({
    name: 'categories',
    data: { action: 'list' },
  }).then((res) => {
    const { buildCategoryTree } = require('../_utils/buildCategoryTree');
    return buildCategoryTree(res.result);
  });
}
