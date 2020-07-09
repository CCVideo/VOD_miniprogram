// const app = getApp()
Page({
  ccVod: null,
  played:false,
  data: {
    vid: '',
    siteid: '',
    vc: '',
    custom_id: ''
  },
  onLoad: function (options) {
    if (!!options.vc) {
      this.setData({
        vc: options.vc
      })
    }
    if (!!options.custom_id) {
      this.setData({
        custom_id: options.custom_id
      })
    }
    this.setData({
      vid: options.vid,
      siteid: options.siteid,
    })
  },
  toNext:function(){
    let ccVod = this.getCCVod();
    //记录当前视频播放的进度
    this.rememberPlayTime();
    //视频切换播放
    var params = {
      "vid": "C18F506284ABAB3C9C33DC5901307461",
      "siteid": "2661F9756E5C832E",
      "vc": "",
      "title": "下一个视频",
      "custom_id": 'ccc'
    };
    ccVod.changeNext(params);
  },
  handleVideoPlay:function(){
    if (this.played) {
       return;
    }
    this.played = true;
    let ccVod = this.getCCVod();
    let historyTime = wx.getStorageSync('historyTime_' + this.data.vid);
    if (historyTime){
      ccVod.gotoSeek(historyTime);
    }
    console.log('video play callback');
  },
  onUnload:function(){
    this.rememberPlayTime();
  },
  rememberPlayTime:function(){
    let ccVod = this.getCCVod();
    if (!ccVod || !ccVod.getCurrentTime){
      return;
    }
    let currentTime = ccVod.getCurrentTime();
    wx.setStorageSync('historyTime_' + this.data.vid, currentTime);
  },
  getCCVod:function(){
    if(this.ccVod){
       return this.ccVod;
    }
    const pages = getCurrentPages();
    const ctx = pages[pages.length - 1];
    this.ccVod = ctx.selectComponent("#ccVod");
    return this.ccVod;
  }
})