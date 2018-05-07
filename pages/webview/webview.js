// pages/webview/webview.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    //mpType:1：马踏飞燕一键GO ，2：马上飞，
    //https://m.matafy.com/ticketsMpTest/index.html#/Choose?token=
    //https://m.matafy.com/wechatMp/index.html#/Choose?token=
    //http://192.168.13.67:8080/#Choose?token=
    // 正式环境
    var _url = 'https://m.matafy.com/one_train_pro/index.html#/TrainChoose?token=' + app.globalData.token + '&weixinId=' + app.globalData.weixinId + "&mpType=5";
    // var _url = 'http://192.168.1.116:8081/index.html#/TrainChoose?token=' + app.globalData.token + '&weixinId=' + app.globalData.weixinId + "&mpType=5";
    // var _url = 'https://m.matafy.com/train_test/index.html#/Choose?token=' + app.globalData.token + '&weixinId=' + app.globalData.weixinId + "&mpType=5";


    /****
     * 跳转到指定页面,path为标识
     * path=1为标识代表跳转至OrderDetail
     * path = 2,首页选择城市时间查询最低价格
     */
    
    console.log('path==' + options.path);
    
    if (options.path) {
      switch (options.path) {
        case '1':
          _url = 'https://m.matafy.com/one_train_pro/index.html#/MyOrderDetail?from=paySuccess&orderNo=' + options.orderNo
            + '&token=' + app.globalData.token + '&weixinId=' + app.globalData.weixinId + "&mpType=5";
          break;
        case '2':
          _url = _url
          break;
        case '3':
          _url = 'https://m.matafy.com/one_train_pro/index.html#/activity?token=' + app.globalData.token + '&weixinId=' + app.globalData.weixinId + "&mpType=5";
          break;
          case '4':
          _url += '&isMpbuy=1'
          break
        case '6':
          _url = 'https://m.matafy.com/one_train_pro/index.html#/LoginWithPhone?action=login' + '&weixinId=' + app.globalData.weixinId + "&mpType=5";
          break;
        default:
          break;
      }
    }
    //是否显示关闭小程序提示
    if (app.globalData.isFromYiJianGo && !wx.getStorageSync('ShowedChooseTip')) {
      _url = _url + '&showChooseTip=true';
      wx.setStorage({
        key: 'ShowedChooseTip',
        data: true,
      })
    }
    _url = _url + "&temp=" + new Date().getTime() + '&urlPath=' + options.path;
    this.setData({
      url: _url
    })
    console.log(this.data.url);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

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
  // methods
  onPostMessage(e) {
    console.log('-------"isToActivity"-----------')
    console.log('isToActivity data:', e);
    // let event = JSON.stringify(e)
    // wx.navigateTo({
    //   url: '/pages/test/test?event=' + event,
    // })
    // 跳转一元小程序
    switch (e.detail.data[0].key) {
      case 'isToActivity':
        app.globalData.token = e.detail.data[0].value.token;
        wx.setStorage({
          key: 'phoneToken',
          data: e.detail.data[0].value.token,
        })
        wx.navigateToMiniProgram({
          appId: 'wx949ae119b29caa54',
          path: 'pages/home/home?toIndex=1',
          extraData: {
            token: app.globalData.token,
            key: 'toShowActivity',
            value: {},
          },
          envVersion: app.globalData.envVersionFlight
        });
        break;
      case 'back':
        app.globalData.token = e.detail.data[0].value.token;
        wx.setStorage({
          key: 'phoneToken',
          data: e.detail.data[0].value.token,
        })
        wx.navigateBackMiniProgram({
          extraData: {
            token: app.globalData.token,
            key: 'storageToken'
          },
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
        break;

      default:
        break;
    }
  },
})