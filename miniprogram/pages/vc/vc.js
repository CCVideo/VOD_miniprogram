// pages/vc/vc.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    vcvalue: '',
    vid: '',
    siteid: ''
  },
  vcinput: function (e) {
    this.setData({
      vcvalue: e.detail.value,
    })
  },
  bindbtn: function () {
    let vid = this.data.vid;
    let siteid = this.data.siteid;
    let vc = this.data.vcvalue;
    console.log(vc);
    wx.navigateTo({
        url: `../index/index?vid=${vid}&siteid=${siteid}&vc=${vc}`
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let vid = options.vid;  // cc视频vid
    let siteid = options.siteid;  //cc视频siteid
    this.setData({
      vid: vid,
      siteid: siteid,
    })
  },
})