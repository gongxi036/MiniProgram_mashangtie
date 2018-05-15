const app = getApp()

var loginCallback;

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

function myLogin(callback) {
  loginCallback = callback;
  //读取存储数据
  readStorage();
  //获取当前审核状态
  getEnv();
}
function readStorage() {
  var _this = this;
  wx.getStorage({
    key: 'phoneToken',
    success: function (res) {
      app.globalData.token = res.data;
    }
  })
  wx.getStorage({
    key: 'loginData',
    success: function (res) {
      console.log('获取本地微信用户信息成功');
      console.log(res.data)
      app.globalData.mpToken = res.data.token;
      wx.setStorage({
        key: 'mpToken',//此token只用于在未手机登录状态下助力使用
        data: res.data.token
      })
      app.globalData.userId = res.data.userId;
      app.globalData.weixinId = res.data.weixinId;
      //获取实时头像昵称
      getUserInfo();
    },
    fail: function () {
      console.log('获取本地微信用户信息失败');
      login();
    }
  })
}

// 微信登录
function login() {
  console.log('微信登录')
  var _this = this;
  wx.login({
    success: function (res) {
      if (res.code) {
        //发起网络请求
        console.log('weChatCode', res.code)
        app.globalData.weChatCode = res.code
        getUserInfo();

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

function getUserInfo() {
  console.log('getUserInfo')
  var _this = this;

  wx.getUserInfo({
    withCredentials: true,
    success: res => {
      console.log('getUserInfo成功');
      app.globalData.userInfo = res.userInfo;
      app.globalData.name = res.userInfo.nickName;
      app.globalData.iconUrl = res.userInfo.avatarUrl;
      app.globalData.isLogin = true;


      updateUserInfo();

      if (!app.globalData.mpToken) {
        getToken(res.iv, res.encryptedData);
      } else {
        loginCallback()
      }
    },
    fail: function (res) {
      // console.log('getUserInfo失败');
      // console.log(res);
      authSetting();
      app.globalData.isLogin = false
    },
    complete: () => {
      checkLogin()
    }
  })
}

function checkLogin() {
  let pages = getCurrentPages(),
    currentPage = pages[pages.length - 1]
  currentPage.checkLogin()
}
function authSetting(res) {
  // return
  // wx.showModal({
  //   title: '提醒',
  //   content: '请先授权小程序哦',
  //   showCancel: false,
  //   success: function (res) {
  //     if (res.confirm) {
  checkLogin()
  // wx.openSetting({
  //   success: (res) => {
  //     if (res.authSetting['scope.userInfo']) {
  //       console.log(res)
  //       wx.getUserInfo({
  //         withCredentials: true,
  //         success: res => {
  //           console.log(res);
  //           app.globalData.userInfo = res.userInfo
  //           app.globalData.name = res.userInfo.nickName;
  //           app.globalData.iconUrl = res.userInfo.avatarUrl;

  //         }
  //       })
  //     } else {
  //       authSetting();
  //     }
  //   }
  // });

  //     }
  //   }
  // })
}

function getToken(iv, encryptedData) {
  console.log('获取token')
  var params = {
    'code': app.globalData.weChatCode,
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
      console.log(res.data);
      if (res.data.code == 200) {
        console.log('登录成功');
        wx.setStorageSync('isLogin', true)
        app.globalData.userInfo = res.data.data
        wx.setStorage({
          key: 'loginData',
          data: res.data.data,
        })
        wx.setStorage({
          key: 'mpToken',//此token只用于在未手机登录状态下助力使用
          data: res.data.data.token,
        })
        app.globalData.mpToken = res.data.data.token;
        app.globalData.userId = res.data.userId;
        app.globalData.weixinId = res.data.data.weixinId;
        loginCallback()
      } else {
        console.log('登录失败');
        if (res.data.code != 301) {
          wx.showToast({
            title: '错误:' + res.data.code,
            icon: 'none'
          })
        }
      }
    }
  })
}
/**
 * 获取当前环境，并触发更新用户信息
 */
function getEnv() {
  wx.request({
    url: app.globalData.hostname + '/applet/getTrainEnv',
    method: 'POST',
    data: { version: '1.0' },
    success: res => {
      console.log('getEnv()');
      console.log('当前环境', res.data)
      // 200,133
      if (res.data.code == 133) {
        app.globalData.isReviewed = false;
      } else {
        app.globalData.isReviewed = true;
      }
      // app.globalData.isReviewed = false;
      console.log('获取环境成功，执行登录回调')
    },
    fail: res => {
      console.log('获取环境失败，执行登录回调')
    }
  })
}

/**
 * 更新服务器端用户信息
 */
function updateUserInfo() {
  let token = app.globalData.token;
  if (!token) {
    token = app.globalData.mpToken;
  }
  if (!token) {
    return;
  }
  let params = {
    "userName": app.globalData.name,
    "userHeadPortrait": app.globalData.iconUrl
  }
  console.log(params);
  wx.request({
    url: app.globalData.url_host + '/train/activity/updateUserInfo',
    method: 'POST',
    data: params,
    header: { 'x-access-token': token },
    success: res => {
      console.log('updateUserInfo()');
      console.log(res.data)
    }
  })
}
module.exports = {
  formatTime: formatTime,
  myLogin: myLogin,
  authSetting: authSetting,
  getUserInfo: getUserInfo
}
