const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const ADMIN_OPENIDS = [];

exports.main = async () => {
  try {
    const { OPENID } = cloud.getWXContext();
    return {
      isAdmin: ADMIN_OPENIDS.includes(OPENID),
    };
  } catch (err) {
    return { isAdmin: false };
  }
};
