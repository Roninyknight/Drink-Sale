import { config, cdnBase } from '../../config/index';

/** 获取首页数据 */
function mockFetchHome() {
  const { delay } = require('../_utils/delay');
  const { genSwiperImageList } = require('../../model/swiper');
  return delay().then(() => {
    return {
      swiper: genSwiperImageList(),
      tabList: [
        {
          text: '精选推荐',
          key: 0,
        },
        {
          text: '白酒特惠',
          key: 1,
        },
        {
          text: '红酒精选',
          key: 2,
        },
        {
          text: '洋酒专场',
          key: 3,
        },
        {
          text: '人气榜',
          key: 4,
        },
        {
          text: '好评榜',
          key: 5,
        },
        {
          text: '新品上架',
          key: 6,
        },
      ],
      activityImg: `${cdnBase}/activity/banner.png`,
    };
  });
}

/** 获取首页数据 */
export function fetchHome() {
  if (config.useMock) {
    return mockFetchHome();
  }
  return new Promise((resolve) => {
    resolve('real api');
  });
}
