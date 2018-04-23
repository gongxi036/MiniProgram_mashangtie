//index.js
//获取应用实例
const app = getApp()
var utils = require('../../utils/util.js')
// 定义主页定时器
let interval

Page({
  data: {
    urlOptions: null,
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    iv: '',
    encryptedData: '',
    token: null,
    imgUrls: ['../../images/banner@2x.png', '../../images/banner@3x.png'],
    rate_width: '0%',
    // time_arr: [{ src: '../../images/count_down.png', key: '时', value: '01' },
    // { src: '../../images/cout_down.png', key: '分', value: '50' },
    // { src: '../../images/cout_down.png', key: '秒', value: '39' }],
    winner_arr: [],//助力排行榜
    friends_arr: [],//好友助力记录
    showDialog: false,//遮罩层弹框
    showHelp: false,//助力
    showResult: false,//助力结果
    showClosed: false,//活动结束,
    showNoNetwork: false,//显示无网络,
    start_city: "深圳",
    hasActivity: false,//当前用户是否已经参与活动
    HotelInfo: { totalPrice: '!!!' },
    // current_price: "???",
    countTime: { hour: '', min: '', sec: '' },
    now_list: 'now-list',
    history_list: 'history-list',
    ActivityInfo: { afterHotelPrice: "???", upvoteTime: 0, discountAmt: 0 },
    formId: null,
    help_discountAmt: null,
    flag: true,
    showAddFavorite: true,
    hid: "",
    inFive: false, //是否在榜单前五名,
    hotelName: "",//酒店名称,
    comeDate: "",//入住日期,
    othersActivity: {},
    hasOrder: false,
    showModalStatus: false,//邀好友弹框
    animationData: null,
    isReviewed: false,//审核通过的标识，false表示在审核
  },
  onLoad: function (options) {
    // console.log('onLoad')

    // 自动跳转仅开发使用
    // this.autoNavigateTo();

    this.setData({
      urlOptions: options
    })
    // wx.setNavigationBarColor({
    //   frontColor: '#000000',
    //   backgroundColor: '#E7E9F5',
    // })

    //监测网络变化
    let _this = this;
    wx.onNetworkStatusChange(function (res) {
      if (!res.isConnected) {
        _this.setData({ showDialog: true, showNoNetwork: true });
      } else {
        _this.setData({ showDialog: false, showNoNetwork: false });
      }
    })

    // this.getHistoryResult();
  },
  GetDateStr(AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期 
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;//获取当前月份的日期 
    var d = dd.getDate();
    return y + "年" + m + "月" + d + "日";
  },
  onShow: function () {
    // console.log('onshow')

    // 清除倒计时
    clearInterval(interval)

    var _this = this;
    //获取网络状态
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        var networkType = res.networkType;
        if (networkType === 'none') {
          _this.setData({ showDialog: true, showNoNetwork: true });
        }
      }
    })

    //开始活动倒计时
    // var endtime = new Date(new Date().setHours(23, 59, 59, 0));
    // this.count_down(endtime.getTime() / 1000 - new Date().getTime() / 1000);

    // 逻辑执行入口
    utils.myLogin(this.doOptions);
  },
  downLoadImgs() {
    wx.downloadFile({
      url: 'https://m.matafy.com/wechatMp/mpSource/hotel_share1.jpg',
      success: function (res) {
        app.globalData.temp_share_bg = res.tempFilePath;
        // console.log(app.globalData.temp_share_bg)
      }
    })
    wx.downloadFile({
      url: app.globalData.iconUrl,
      success: function (res) {
        app.globalData.temp_portrait = res.tempFilePath
        // console.log(app.globalData.temp_portrait)
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

      }
    })
  },
  
  getToken() {
    var params = {
      'code': this.data.weChatCode,
      'iv': this.data.iv,
      'encryptedData': this.data.encryptedData,
      'from': '3'  // 注册小程来源平台("1" 马上飞 "2": 一键购 3:一元住 4.马上住
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
          console.log("<><><token><><")
          console.log(res.data.data.token)
          app.globalData.token = res.data.data.token;
          app.globalData.userId = res.data.userId;
          app.globalData.weixinId = res.data.data.weixinId;
          app.globalData.name = res.data.data.name;
          app.globalData.iconUrl = res.data.data.iconUrl;

          _this.doOptions();

        } else {
          console.log('登录失败');
        }
      }
    })
  },
  /**
 * 弹出层函数
 */
  //出现
  show: function () {

    this.setData({ flag: false })

  },
  //消失

  hide: function () {

    this.setData({ flag: true })

  },
  callOrder() {
    //拨打客服电话，预定酒店
    wx.makePhoneCall({
      phoneNumber: '13923465839' //仅为示例，并非真实的电话号码
    })

  },
  showOrderTips() {
    console.log("show order tips")
    //下单提示
    wx.showModal({
      title: '提示',
      content: '亲，还没进榜单前五名，不能订酒店哦，加油！',
      showCancel: false,
      confirmColor: "#157EFB"
    })
  },
  addFavorite(e) {
    /*
     * 添加到路线单当中
     */
    var hid = e.currentTarget.dataset.id
    var price = e.currentTarget.dataset.price
    var title = e.currentTarget.dataset.title

    let that = this;
  },
  toBuy() {
    switch (this.data.ActivityInfo.status) {
      case 1:
        wx.showToast({
          title: '还在助力中，加油哦',
          icon: 'none'
        })
        break;
      case 2:
        wx.showToast({
          title: '此次活动您已购买',
          icon: 'none'
        })
        break;
      case 3:
        console.log('可购买')
        wx.navigateTo({
          url: '../webview/webview?path=3&discountAmt=' + this.data.ActivityInfo.discountAmt
        })
        break;
      default:
        console.log('status==' + this.data.ActivityInfo.status);
        wx.showToast({
          title: '还在助力中，加油哦',
          icon: 'none'
        })
        break;
    }
  },
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
  toRule() {
    wx.navigateTo({
      url: '../rule/rule',
    })
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function (res) {
    if (!this.data.isReviewed) {
      return {
        title: '马踏飞燕全球旅行最低价',
        path: '/pages/index/index',
        imageUrl: '../../images/share.png',
      }
    } else {
      if (res.from === 'button') {
        // 来自页面内转发按钮
        this.setData({ showModalStatus: false })
      }
      console.log('activityId=' + this.data.ActivityInfo.id);
      if (!this.data.ActivityInfo.id) {
        return {
          title: '马踏飞燕1元住酒店，填写行程后，邀请好友助力砍价，把票价砍到低，就能用1元住路线酒店啦',
          path: '/pages/shareOpen/shareOpen',
          imageUrl: '../../images/share.png',
        }
      } else {
        return {
          title: `${app.globalData.name}参加了1元住酒店砍价活动，向你发起助力请求，帮Ta点一下，把价格砍到底，Ta就可以1元住路线酒店啦`,
          path: '/pages/shareOpen/shareOpen?activityId=' + this.data.ActivityInfo.id + '&name=' + app.globalData.name,
          imageUrl: '../../images/share.png',
        }
      }
    }
  },
  // 添加路线
  goAddWishHotel(e) {
    app.globalData.formId = e.detail.formId;
    console.log("add wish hotel formId==" + app.globalData.formId);
    wx.navigateTo({
      url: '../webview/webview'
    })
  },
  selectCity(e) {
    let type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '../destination/destination?type=' + type,
    })
  },
  doOptions() {
    //判断环境，区别显示
    this.setData({ isReviewed: app.globalData.isReviewed });

    // let options = this.data.urlOptions;
    let options = app.globalData.urlOptions;
    console.log("get options");
    console.log(options);

    // this.load_hotels();
    var comeDate = this.GetDateStr(1);
    console.log("comeDate:" + comeDate);
    this.setData({
      comeDate: comeDate
    });


    let _this = this;

    //判断是否添加过路线酒店
    if (options != null) {

      //从扫描图片二维码过来
      var scene = decodeURIComponent(options.scene);
      console.log("scene==" + scene);
      var id_index = scene.indexOf('activityId');
      if (scene && id_index > 0) {
        console.log("从扫描图片二维码过来");
        // this.data.ActivityInfo.id = scene.substring(id_index + 11);
        this.data.othersActivity.id = scene.substring(id_index + 11);
        this.getActivityById();
      }

      //从H5选择城市回来
      if (options.hotelId && options.hotelId != '') {
        console.log("从H5选择城市回来");

        //创建活动
        console.log("formId==" + app.globalData.formId);
        //处理hotel info
        let city = options.thisCity[0].cityName
        options.city = city;
        // let nights = options.orderRooms[0].pricelist.length
        let { nights } = options
        options.nights = nights;

        let roomType = options.roomName
        options.roomType = roomType;

        // let checkinDateArr = options.ArrivalDate.split('-')
        // let checkinDate = checkinDateArr[1] + "-" + checkinDateArr[2]
        // options.checkinDate = checkinDate;

        // let checkoutDateArr = options.departureDate.split('-')
        // let checkoutDate = checkoutDateArr[1] + "-" + checkoutDateArr[2]
        // options.checkoutDate = checkoutDate;
        let params = {
          "hotelPrice": options.totalPrice,
          "checkInDate": options.ArrivalDate,
          "checkOutDate": options.LeaveDate,
          "formId": app.globalData.formId,
          "weixinId": app.globalData.weixinId,
          "hotelId": options.hotelId,
          "roomId": options.roomTypeId,
          "city": city,
          "nights": nights,
          "roomType": roomType,
          "name": options.hotelNameCn
        }
        console.log('params', params)
        if (_this.data.ActivityInfo.id) return
        wx.request({
          url: app.globalData.url_host + '/activity/createActivity',
          method: 'POST',
          header: { 'x-access-token': app.globalData.token },
          data: params,
          success: res => {
            console.log('createActivity');
            console.log(res.data);
            if (res.statusCode == 200 && res.data.code == 200) {
              app.globalData.urlOptions = null
              console.log('activityId=' + res.data.data.activity.id);
              console.log("count down time" + res.data.data.activity.countdownTime);
              _this.count_down(res.data.data.activity.countdownTime / 1000);

              _this.setData({
                hasActivity: true,
                HotelInfo: options,
                ActivityInfo: res.data.data.activity
              })
              wx.showToast({
                title: '路线酒店添加成功',
              })
            } else {
              if (res.data.code == 124) {
                wx.showToast({
                  title: '已经购买过酒店的7天后才能参与该活动',
                  icon: 'none'
                })
              }
            }
          }
        })
      }

      // 判断用户是否在前五名，能否预定酒店 
      if (!app.globalData.hasShowResult) {
        this.getHistoryResult();
      }

      //分享跳转进来,从推送通知过来  
      if (options.activityId && options.activityId != '') {
        console.log("分享跳转进来");
        console.log(options.activityId);
        // this.data.ActivityInfo.id = options.activityId;
        this.setData({
          "othersActivity.id": options.activityId
        })
        // this.getActivityById();
      }

    }

    this.checkActivity();
    this.getActiviyList(1);
    this.downLoadImgs();

  },
  count_down(time) {
    let _this = this;
    // if (!app.globalData.index_coutdown_interval) {
    interval = setInterval(() => {
      let hour = Math.floor(time / 3600);
      let min = Math.floor(time % 3600 / 60);
      let sec = Math.floor(time % 3600 % 60);
      hour = hour.toString().length == 1 ? '0' + hour : hour;
      min = min.toString().length == 1 ? '0' + min : min;
      sec = sec.toString().length == 1 ? '0' + sec : sec;

      _this.setData({
        countTime: { 'hour': hour, 'min': min, 'sec': sec }

      })

      if (time == 0) {
        clearInterval(interval);
      }
      time--;
    }, 1000)
    app.globalData.index_coutdown_interval = interval;
    // }
  },
  // 切换Tab
  changeList(e) {
    /*
     * 切换助力排行榜：当前榜单 历史盛况
     */
    let type = e.currentTarget.dataset.type;
    if (type == 1) {
      console.log('当前榜单');
      this.setData({
        now_list: 'now-list',
        history_list: 'history-list'
      })
      this.getActiviyList(1);
    } else {
      console.log('历史盛况');
      this.setData({
        now_list: 'history-list',
        history_list: 'now-list'
      })
      this.getActiviyList(2);
    }
  },
  // 跳转页面分享图片
  toShare() {
    this.setData({ showModalStatus: false });

    if (this.data.ActivityInfo.id) {
      wx.navigateTo({
        url: '../shareWithInfo/shareWithInfo?activityId=' + this.data.ActivityInfo.id,
      })
    } else {
      wx.showToast({
        title: '请先选择路线酒店哦',
        icon: "none"
      })
    }
  },
  // 判断活动状态
  checkActivity() {
    console.log("check activity");
    let _this = this;
    wx.request({
      url: app.globalData.url_host + '/activity/getActivity',
      method: 'POST',
      header: { 'x-access-token': app.globalData.token },
      success: res => {
        if (res.statusCode == 200 && res.data.code == 200) {
          console.log("checkActivity");
          console.log(res.data);
          _this.parseActivityData(res);
        } else if (res.data.code && res.data.code == 131) {
          //活动结束
          _this.setData({
            showDialog: true,
            showClosed: true
          });
        }
      }
    })
  },
  /*
   * 获取助力排行榜
   */
  getActiviyList(type) {
    let _url = app.globalData.url_host + '/activity/currentRankingList';
    if (type == 2) {
      _url = app.globalData.url_host + '/activity/historyRankingList';
    }
    let _this = this;
    wx.request({
      url: _url,
      method: 'POST',
      header: { 'x-access-token': app.globalData.token },
      success: res => {
        console.log('getActiviyList');
        // console.log(res.data);
        if (res.statusCode == 200 && res.data.code == 200) {
          let arr = [];
          for (let i = 0; i < res.data.data.length; i++) {
            // { index: 1, img: '../../images/banner@3x.png', name: 'jack', value: '100' }
            let item = {};
            item.index = i + 1;
            item.img = res.data.data[i].userHeadPortrait;
            item.name = res.data.data[i].userName;
            item.value = res.data.data[i].upvoteTime;
            arr.push(item);

          }
          _this.setData({
            winner_arr: arr
          })
        }
      }
    })
  },
  /*
   * 获取好友助力记录
   */
  getFriendsHelp() {
    let _this = this;
    console.log(222);
    console.log(_this.data.ActivityInfo.id)
    wx.request({
      url: app.globalData.url_host + '/activity/upvoteRecords',
      method: 'POST',
      data: { activityId: _this.data.ActivityInfo.id },
      header: { 'x-access-token': app.globalData.token },
      success: res => {
        console.log('getFriendsHelp');
        console.log(res.data);
        if (res.statusCode == 200 && res.data.code == 200) {
          let arr = [];
          let month, day;

          for (let i = 0; i < res.data.data.length; i++) {
            // { index: 1, img: '../../images/banner@3x.png', name: 'jack', value: '100' }
            let item = {};
            item.img = res.data.data[i].inviteeHeadPortrait;
            item.name = res.data.data[i].inviteeName;
            let date = new Date(res.data.data[i].operateTime);
            month = date.getMonth() + 1;
            month = (month < 10 ? "0" + month : month);

            day = date.getDate();
            day = (day < 10 ? "0" + day : day);

            item.time = date.getFullYear() + '-' + month + '-' + day;
            item.value = res.data.data[i].discountAmt;
            arr.push(item);
          }
          _this.setData({
            friends_arr: arr
          })
        }
      }
    })
  },

  checkIsOwn() {
    let _this = this;
    var params = { 'activityId': this.data.othersActivity.id };
    console.log(params);
    wx.request({
      url: app.globalData.url_host + '/activity/checkActivity',
      method: 'POST',
      data: params,
      header: { 'x-access-token': app.globalData.token },
      success: res => {
        console.log('checkIsOwn');
        console.log(res.data);
        if (res.statusCode == 200 && res.data.code == 200) {
          if (res.data.data.selfFlag) {
            _this.setData({ showDialog: false });
          } else {
            _this.setData({
              showDialog: true,
              showHelp: true
            });
          }
        }
      }
    })
  },
  // 根据活动id获取活动信息
  getActivityById() {
    let _this = this;
    console.log('othersActivity.id==' + this.data.othersActivity.id);
    var params = { 'activityId': this.data.othersActivity.id };
    console.log(params);
    wx.request({
      url: app.globalData.url_host + '/activity/getActivityById',
      method: 'POST',
      data: params,
      header: { 'x-access-token': app.globalData.token },
      success: res => {
        console.log('getActivityById');
        console.log(res.data);
        if (res.statusCode == 200 && res.data.code == 200) {
          if (res.data.data.flag != 0) {
            // _this.parseActivityData(res);
            _this.checkIsOwn();
          }
        } else if (res.data.code && res.data.code == 127) {
          // if (res.data.data.flag != 0) {
          //   _this.parseActivityData(res);
          // }
          wx.showToast({
            title: '已经投过票了',
            icon: 'none'
          })
        }
      }
    })
  },
  parseActivityData(res) {
    console.log("parse activity data")
    console.log(res.data.data.activity)
    let _this = this;
    if (res.data.data.flag == 0) {
      if (res.data.data.activity && res.data.data.activity.countdownTime) {
        _this.count_down(res.data.data.activity.countdownTime / 1000);
      }
    } else {
      console.log("parse hotel info");
      let checkInDate = res.data.data.activity.checkInDate;
      console.log(res.data.data.activity.checkInDate);
      let checkOutDate = res.data.data.activity.checkOutDate;
      console.log(_this.getFormatedDate(checkInDate));
      console.log("checkin date");
      let hotelInfo = {
        checkinDate: _this.getFormatedDate(checkInDate),
        checkoutDate: _this.getFormatedDate(checkOutDate),
        city: res.data.data.activity.city,
        hotelNameCn: res.data.data.activity.name,
        roomType: res.data.data.activity.roomType,
        nights: res.data.data.activity.nights,
        totalPrice: res.data.data.activity.preHotelPrice
      }
      let width = res.data.data.activity.discountPercent + '%';

      _this.setData({
        hasActivity: true,
        ActivityInfo: res.data.data.activity,
        HotelInfo: hotelInfo,
        rate_width: width
      })
      _this.count_down(res.data.data.activity.countdownTime / 1000);
      this.getFriendsHelp();

    }
  },
  getFormatedDate(checkDate) {
    let date = new Date(checkDate);
    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" + month : month);

    let day = date.getDate();
    day = (day < 10 ? "0" + day : day);
    // item.createDate = date.getFullYear() + '-' + month + '-' + day;
    return month + '-' + day
  },
  helpFriends() {
    /*
     * 好友助力
     */
    let _this = this;
    var params = { 'activityId': this.data.othersActivity.id };
    console.log(params);
    wx.request({
      url: app.globalData.url_host + '/activity/upvote',
      method: 'POST',
      data: params,
      header: { 'x-access-token': app.globalData.token },
      success: res => {
        console.log('helpFriends');
        console.log(res.data);
        if (res.statusCode == 200) {
          if (res.data.code == 200) {
            //有效
            _this.setData({
              help_discountAmt: res.data.data.upvoteRecord.discountAmt,
              showHelp: false,
              showResult: true,
            })
          } else {
            //无效
            _this.setData({
              showDialog: false,
              showHelp: false,
              showResult: false,
            })
            if (res.data.code == 127) {
              wx.showToast({
                title: '已经投过票',
                icon: 'none'
              })
            }
            if (res.data.code == 126) {
              wx.showToast({
                title: '该活动不在投票时间',
                icon: 'none'
              })
            }
            if (res.data.code == 130) {
              wx.showToast({
                title: '每个用户一天只能投3次票',
                icon: 'none'
              })
            }
          }
          switch (res.data.code) {
            case 200:
              _this.setData({
                showHelp: false,
                showResult: true,
              })
              break;
            case 200:
              break;
          }

        }
      }
    })
  },
  search: function () {
    wx.navigateTo({
      url: '../hotel/hotel'
    })
  },
  // 关闭弹窗
  helpDone() {
    this.setData({
      showDialog: false,
      showHelp: false,
      showResult: false,
    })
    //数据刷新
    this.getActivityById();
  },
  onClickInvite() {
    // console.log(this.data.ActivityInfo.id)
    console.log("test log click invite");
    this.setData({ showModalStatus: true })
  },
  onClickHideModal() {
    this.setData({ showModalStatus: false })
  },
  // 获取历史活动结果
  getHistoryResult() {
    /*
     * 判断用户是否在前五名，能否预定酒店
     */
    let _this = this;
    wx.request({
      url: app.globalData.url_host + '/activity/getHistoryActivity',
      method: 'POST',
      header: { 'x-access-token': app.globalData.token },
      success: res => {
        console.log('getHistoryResult');
        if (res.statusCode == 200 && res.data.code == 200) {
          /**  
           * 活动状态: 
           * -1:过期未购买;
           *  1:投票中;
           *  2:已购买;
           *  3:可购买;
           *  4:不可购买;
           *  5:出票失败
          */
          console.log('活动状态', res.data.data.flag)
          if (res.data.data.flag == 1) {
            if (res.data.data.historyActivity.status == 3 || res.data.data.historyActivity.status == 5) {
              app.globalData.hasShowResult = true;
              console.log(res.data.data.historyActivity);
              //discountAmt实际传入的比例，

              wx.navigateTo({
                url: '../activityResult/activityResult?afterTicketPrice=' + res.data.data.historyActivity.afterHotelPrice
                + "&discountAmt=" + res.data.data.historyActivity.discountAmt + "&ranking=" + res.data.data.historyActivity.ranking
                + "&discountPercent=" + res.data.data.historyActivity.discountPercent
                + "&from=index",
              })
            }
            if (res.data.data.historyActivity.status == 2) {
              _this.setData({
                hasOrder: true
              })
            }
          }
        }
      }
    })
  },

  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },

  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  // 仅测试使用
  autoNavigateTo() {
    setTimeout(() => {
      wx.navigateTo({
        url: '../webview/webview?path=3&discountAmt=' + 100
      })
      // wx.navigateTo({
      //   url: '../shareWithInfo/shareWithInfo?activityId=' + 300,
      // })
    }, 1000)
  }
})
