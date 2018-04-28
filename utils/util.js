const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


const app = getApp()
var loginCallback;
function myLogin(callback) {
  loginCallback = callback;
  var _this = this;
  // 获取本地 phoneToken
  wx.getStorage({
    key: 'phoneToken',
    success: function (res) {
      app.globalData.token = res.data;
      console.log('token==' + app.globalData.token);
    }
  })
  // 获取本地 mpToken 及 用户信息
  wx.getStorage({
    key: 'loginData',
    success: function (res) {
      // console.log(res.data)
      if (res.data) {
        // _this.data.token = res.data;
        app.globalData.mpToken = res.data.token;
        wx.setStorage({
          key: 'mpToken',//此token只用于在未手机登录状态下助力使用
          data: res.data.token
        })
        app.globalData.userId = res.data.userId;
        app.globalData.weixinId = res.data.weixinId;
        //获取实时头像昵称
        getUserInfo();
        // getEnv();
        loginCallback();

      } else {
        login();
      }

    },
    fail: function () {
      console.log('getStorage failed');
      login();
    }
  })
}
function login() {
  var _this = this;
  wx.login({
    success: function (res) {
      if (res.code) {
        //发起网络请求
        console.log(res)
        app.globalData.weChatCode = res.code
        getUserInfo(res.code);

      } else {
        console.log('获取用户登录态失败！' + res.errMsg)
      }
    },
    fail: function (res) {
      console.log('login失败');
      console.log(res);
    }
  });
}
function getUserInfo(code) {
  console.log('getUserInfo')
  var _this = this;
  wx.getUserInfo({
    withCredentials: true,
    success: res => {
      app.globalData.userInfo = res.userInfo;
      app.globalData.name = res.userInfo.nickName;
      app.globalData.iconUrl = res.userInfo.avatarUrl;
      if (!app.globalData.mpToken) {
        getToken(res.iv, res.encryptedData, code);
      } else {
        // updateUserInfo();
      }

    },
    fail: function (res) {
      console.log('getUserInfo失败');
      console.log(res);
      authSetting(code);
    }
  })
}
function authSetting(code) {
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
                  app.globalData.name = res.userInfo.nickName;
                  app.globalData.iconUrl = res.userInfo.avatarUrl;
                  if (!app.globalData.mpToken) {
                    getToken(res.iv, res.encryptedData,code);
                  }

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
function getToken(iv, encryptedData, code) {
  var params = {
    'code': code,
    'iv': iv,
    'encryptedData': encryptedData,
    'from': '5'  // 注册小程来源平台("1" 马上飞 "2": 一键购)
  }
  var _this = this;
  console.log(params)
  wx.request({
    url: 'https://sso.matafy.com/user/wechat/pregister',
    method: 'POST',
    data: params,
    success: res => {
      console.log('getToken');
      console.log(res.data);
      if (res.statusCode == 200) {
        console.log('登录成功');
        wx.setStorage({
          key: 'loginData',
          data: res.data.data,
        })
        app.globalData.mpToken = res.data.data.token;
        wx.setStorage({
          key: 'mpToken',//此token只用于在未手机登录状态下助力使用
          data: res.data.data.token
        })
        app.globalData.userId = res.data.userId;
        app.globalData.weixinId = res.data.data.weixinId;
        loginCallback();

      } else {
        console.log('登录失败');
      }
    }
  })
}
/**
 * 获取当前环境，并触发更新用户信息
 */
function getEnv() {
  wx.request({
    url: app.globalData.url_host + '/applet/getEnv',
    method: 'POST',
    header: { 'x-access-token': app.globalData.token },
    data: {},
    success: res => {
      console.log('getEnv()');
      console.log(res.data)
      // 200,133
      if (res.data.code == 133) {
        app.globalData.isReviewed = false;
      } else {
        app.globalData.isReviewed = true;
      }
      loginCallback();

    },
    fail: res => {
      loginCallback();
    }
  })
}

/**
 * 更新服务器端用户信息
 */
function updateUserInfo() {
  let params = {
    "userName": app.globalData.name,
    "userHeadPortrait": app.globalData.iconUrl
  }
  console.log(params);
  wx.request({
    url: app.globalData.url_host + '/activity/updateUserInfo',
    method: 'POST',
    data: params,
    header: { 'x-access-token': app.globalData.token },
    success: res => {
      console.log('updateUserInfo()');
      console.log(res.data)


    }
  })
}
module.exports = {
  formatTime: formatTime,
  myLogin: myLogin
}
