// pages/pay/pay.js

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options:null,
    isSuccess:false,
    times: 0,
    orderState: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({ options})
    var _this = this;
      wx.requestPayment({
        timeStamp: options.timeStamp,
        nonceStr: options.nonceStr,
        package:"prepay_id="+options.prepay_id,
        signType: options.signType,
        paySign: options.paySign,
        success:(res)=>{
          console.log('success');
          console.log(res);
          _this.setData({
            isSuccess: true
          })
          setTimeout(function() {
            console.log('查询订单');
            _this.getOrderState();
          }, 3000);
        },
        fail:(res)=>{
          console.log('fail');
          console.log(res);
          // wx.showToast({
          //   title: '支付失败',
          // })
          _this.setData({
            isSuccess: false
          })
          // setTimeout(function () {
          //   _this.getOrderState();
          // }, 3000);
          _this.toOrder();
        }
      })
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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

  },
  toOrder() {
    console.log(this.data.options)
    wx.redirectTo({
      url: '../webview/webview?path=1&orderNo=' + this.data.options.orderNo + '&type=' + this.data.options.type,//path=1为标识代表跳转至OrderDetail
    })
  },
  toHome() {
    wx.redirectTo({
      url: '../webview/webview',
    })
  },
  getOrderState() {
    console.log('查询订单开始');
    var _this = this;
    this.setData({
      times: ++this.data.times
    })
    console.log('订单里面车看options=='+_this.data.options)
    wx.request({
      url: app.globalData.orderUrl + '/' + _this.data.options.orderNo,
      header: {
        'x-access-token': _this.data.options.token
      },
      success: function(res) {
          console.log(res.data.data);
          if (res.data.data.status == 8 || res.data.data.status == 9 || res.data.data.status == 10) {
            console.log('支付成功');
            _this.setData({ orderState: 1 })
          } else {
            if (_this.data.times < 2) {
              setTimeout(() => {
                console.log('延时继续查');
                _this.getOrderState();
              })
              
            } else {
              console.log('查找超时');
              _this.setData({ orderState: 2 })
            }
          } 
      }
    });

  }

})