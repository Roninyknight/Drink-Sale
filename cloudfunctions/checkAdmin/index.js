const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const ADMIN_OPENIDS = []; // 请填入管理员openid

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  return {
    isAdmin: ADMIN_OPENIDS.includes(OPENID),
    openid: OPENID,
  };
};
