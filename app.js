import updateManager from './common/updateManager';
import { cloudEnvId } from './config/env';

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      env: cloudEnvId,
      traceUser: true,
    });
  },
  onShow: function () {
    updateManager();
  },
});
