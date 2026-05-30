/* eslint-disable no-param-reassign */
import { config } from '../../config/index';

/** 获取商品列表 */
function mockFetchGoodsList(params) {
  const { delay } = require('../_utils/delay');
  const { getSearchResult } = require('../../model/search');

  const data = getSearchResult(params);

  if (data.spuList.length) {
    data.spuList.forEach((item) => {
      item.thumb = item.primaryImage;
      item.price = item.minSalePrice;
      item.originPrice = item.maxLinePrice;
      item.desc = '';
      if (item.spuTagList) {
        item.tags = item.spuTagList.map((tag) => tag.title);
      } else {
        item.tags = [];
      }
    });
  }
  return delay().then(() => {
    return data;
  });
}

/** 获取商品列表 */
export function fetchGoodsList(params) {
  if (config.useMock) {
    return mockFetchGoodsList(params);
  }
  return wx.cloud.callFunction({
    name: 'goods',
    data: {
      action: 'list',
      params: { pageNum: params?.pageNum || 1, pageSize: params?.pageSize || 20 },
    },
  }).then((res) => {
    const data = res.result;
    data.spuList = (data.spuList || []).map((item) => ({
      spuId: item.spuId,
      thumb: item.primaryImage,
      title: item.title,
      price: item.minSalePrice,
      originPrice: item.maxLinePrice,
      tags: (item.tags || []).map((t) => (typeof t === 'string' ? t : t.title)),
    }));
    return data;
  });
}
