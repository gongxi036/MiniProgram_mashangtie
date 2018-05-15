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
  onLoad: function (options) {
    
    // wx.login({
    //   success: function(res) {
    //     console.log(res);
    //     app.globalData.weChatCode = res.code
    //   }
    // })
    // wx.getSetting({
    //   success: function (res) {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称
    //       wx.getUserInfo({
    //         success: function (res) {
    //           console.log(res.userInfo)
    //         }
    //       })
    //     }
    //   }
    // })
  },
  onShow: function () {
    utils.myLogin(this.doOptions);
    this.checkLogin()
   },
  doOptions() {
    this.toWebview();
  },
  toWebview() {
    console.log('../webview/webview?path=' + app.globalData.urlPath)
    wx.navigateTo({
      url: '../webview/webview?path=' + app.globalData.urlPath
    })
    app.globalData.urlPath = null
  },

  checkLogin() {
    if (wx.getStorageSync('LoginData') || app.globalData.isLogin) {
      console.log('已登录');
      this.setData({
        showDialog: false,
        isLogin: true
      })
    } else {
      console.log('未登录')
      this.setData({
        showDialog: true,
        isLogin: false
      })
    }
  },
  getUserInfo() {
    utils.getUserInfo()
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
