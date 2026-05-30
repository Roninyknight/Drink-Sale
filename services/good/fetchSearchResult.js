/* eslint-disable no-param-reassign */
import { config } from '../../config/index';

/** 获取搜索历史 */
function mockSearchResult(params) {
  const { delay } = require('../_utils/delay');
  const { getSearchResult } = require('../../model/search');

  const data = getSearchResult(params);

  if (data.spuList.length) {
    data.spuList.forEach((item) => {
      item.thumb = item.primaryImage;
      item.price = item.minSalePrice;
      item.originPrice = item.maxLinePrice;
      if (item.spuTagList) {
        item.tags = item.spuTagList.map((tag) => ({ title: tag.title }));
      } else {
        item.tags = [];
      }
    });
  }
  return delay().then(() => {
    return data;
  });
}

/** 获取搜索历史 */
export function getSearchResult(params) {
  if (config.useMock) {
    return mockSearchResult(params);
  }
  return wx.cloud.callFunction({
    name: 'goods',
    data: {
      action: 'search',
      params: { keyword: params?.keyword || '', pageNum: params?.pageNum || 1, pageSize: params?.pageSize || 20 },
    },
  }).then((res) => {
    const data = res.result;
    data.spuList = (data.spuList || []).map((item) => ({
      spuId: item.spuId,
      thumb: item.primaryImage,
      title: item.title,
      price: item.minSalePrice,
      originPrice: item.maxLinePrice,
      tags: (item.tags || []).map((t) => ({ title: typeof t === 'string' ? t : t.title })),
    }));
    return data;
  });
}
