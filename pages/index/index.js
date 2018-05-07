//index.js
//获取应用实例
const app = getApp()
var utils = require('../../utils/util.js')

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    flag: true
  },
  onLoad: function (options) { },
  onShow: function () {
    utils.myLogin(this.doOptions);
  },
  doOptions() {
    this.toWebview();
  },
  toWebview() {
    wx.navigateTo({
      url: '../webview/webview?path=' + app.globalData.urlPath
    })
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    return {
      path: '/pages/index/index',
      imageUrl: '../../images/share.png',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})
