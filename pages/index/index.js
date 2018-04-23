//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function (options) {
  },
  onShow: function () {

    var _this = this;
    wx.getStorage({
      key: 'loginData',
      success: function (res) {
        // console.log(res.data)
        if (res.data) {
          // 获取token userId weixinId name iconUrl
          app.globalData.token = res.data.token;
          app.globalData.userId = res.data.userId;
          app.globalData.weixinId = res.data.weixinId;
          app.globalData.name = res.data.name;
          app.globalData.iconUrl = res.data.iconUrl;
          _this.toWebview();
        } else {
          _this.login();
        }

      },
      fail: function () {
        console.log('failed');
        _this.login();
      }
    })
  },
  getUserInfo() {
    var _this = this;
    wx.getUserInfo({
      withCredentials: true,
      success: res => {
        console.log(res);
        app.globalData.userInfo = res.userInfo
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          iv: res.iv,
          encryptedData: res.encryptedData,
        })
        _this.getToken();

      },
      fail: function (res) {
        console.log('getUserInfo失败');
        console.log(res);
        authSetting();
      }
    })

    function authSetting() {
      wx.showModal({
        title: '提醒',
        content: '请先授权小程序哦',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            wx.openSetting({
              success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                  console.log(res)
                  wx.getUserInfo({
                    withCredentials: true,
                    success: res => {
                      console.log(res);
                      app.globalData.userInfo = res.userInfo
                      _this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true,
                        iv: res.iv,
                        encryptedData: res.encryptedData,
                      })
                      console.log(111);
                      _this.getToken();

                    }
                  })
                } else {
                  authSetting();
                }
              }
            });

          }
        }
      })
    }
  },
  login() {
    var _this = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求
          console.log(res.code)
          _this.setData({
            weChatCode: res.code
          })
          _this.getUserInfo();

        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  },
  getToken() {
    console.log(333)
    var params = {
      code: this.data.weChatCode,
      iv: this.data.iv,
      encryptedData: this.data.encryptedData,
      from:"5"
    }
    var _this = this;
    console.log(params)
    wx.request({
      url: 'https://sso.matafy.com/user/wechat/pregister',
      method: 'POST',
      data: params,
      success: res => {
        if (res.statusCode == 200 && res.data.code == 200) {
          console.log('登录成功');
          console.log(res.data);
          wx.setStorage({
            key: 'loginData',
            data: res.data.data,
          })
          app.globalData.token = res.data.data.token;
          app.globalData.userId = res.data.userId;
          app.globalData.weixinId = res.data.data.weixinId;
          app.globalData.name = res.data.data.name;
          app.globalData.iconUrl = res.data.data.iconUrl;
          _this.toWebview();
          
        } else {
          console.log(res.data);          
          console.log('登录失败');
        }
      }
    })
  },
  toWebview() {
    wx.navigateTo({
      url: '../webview/webview'
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
