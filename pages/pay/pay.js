// pages/pay/pay.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options:null,
    isSuccess:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.data.options = options;
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
          _this.setData({ isSuccess:true})
        },
        fail:(res)=>{
          console.log('fail');
          console.log(res);
          wx.showToast({
            title: '支付失败',
          })
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

})