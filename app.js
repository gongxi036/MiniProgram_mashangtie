//app.js
App({
  onLaunch: function (options) {
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onShow: function (options) {
    console.log('onShow');  
    if (options.referrerInfo && options.referrerInfo.extraData) {
      //从其他小程序跳转而来
      this.globalData.isFromYiJianGo = true;
      let extraData = options.referrerInfo.extraData;
      console.log(extraData);
      if (this.globalData.isTest) {
        extraData = JSON.parse(extraData);
      }
      switch (extraData.key) {
        case 'toActivity':
          this.globalData.urlPath = extraData.value.path;
          break;
        default:
          break;

      }
      this.globalData.token = options.referrerInfo.extraData.token;
      wx.setStorage({
        key: 'phoneToken',
        data: this.globalData.token,
      })
    }
  },
  globalData: {
    userInfo: null,
    token: null,
    weixinId: null,
    userId: null,
    iconUrl: '',
    name: '',
    isFromYiJianGo:false,
    mpToken: null,//小程序获取的token
    userId: null,
    activityId: null,//添加的活动Id
    isToActivity: null,//从一键Go跳转进来，进入H5的Activity页面
    orderUrl: 'https://service.matafy.com/train/ticket/order/detail',
    //环境配置
    isTest: false,
    envVersionFlight: 'trial',//全局控制跳转的环境，方便测试 develop,trial,release
  }
})