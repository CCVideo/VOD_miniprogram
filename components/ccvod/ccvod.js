// let calldata = require('../../app.js');
let StatisClass = require('./statis.js');
//初始数据
let defaultData = {
  videoSrcList: [], // 获取视频地址列表
  videoSrc: '', // 显示的视频地址
  videoPoster: '', // 视频封面
  videoControls: false, // controls
  isPlaying: false, // 是否正在播放
  percent: 0, // 进度条
  cPlayBtn: false,
  dragBtnleft: -15, // 进度条按钮
  vCurrentTime: 0, // video播放时间
  vDuration: 0, // video总时间
  second_width: 0, // 手机宽度
  uaModel: 'other', //ua信息，用于接口请求参数
  ccH5TimeCurrent: '00:00',
  ccH5TimeTotal: '00:00',
  btnsShow: true, // 界面显示隐藏
  interFaceShow: true, // 界面按钮显示隐藏
  ccH5spTxt: '常速',
  spShow: false, // 倍速显示隐藏
  hdShow: false, // 清晰度显示隐藏
  ccH5hdTxt: '', // 清晰度按钮信息
  authenable: -1, // 授权播放
  freetime: 0, // 授权播放时间
  authmessage: '', // 授权播放提示信息
  isPlayAuth: false, // 授权播放界面隐藏
  videoBoxShow: true, // video盒子显示
  authCallback: null, // 授权播放回调
  authOpen: false,
  heartId: null, //统计的heaaSend定时器id 
  watingNum: 0, //记录等待加载的次数
  lastTime: 0, //判断是否快进，禁止拖动使用
  lastTimeMax: 0,
  isAudio: false,
  audioBg: '',
  started: false,
  spList: [{
      "num": "1.5",
      "txt": "1.5倍",
    },
    {
      "num": "1.25",
      "txt": "1.25倍",
    },
    {
      "num": "1",
      "txt": "常速",
    },
    {
      "num": "0.8",
      "txt": "0.8倍",
    },
  ],
}

let app = getApp();
Component({
  freeTimeInterval: null,
  piTime: 0,
  initTime: 0,
  loadStartPositon: 0,
  isWaiting: false,
  loaded: false,
  played: false,
  /**
   * 组件的属性列表
   */
  properties: {
    vid: {
      type: String,
      value: '',
    },
    siteid: {
      type: String,
      value: '',
    },
    vc: {
      type: String,
      value: '',
    },
    custom_id: {
      type: String,
      value: ''
    },
    banDrag: {
      type: Boolean,
      value: false
    },
    marqueeText: {
      type: String,
      value: ''
    },
    marqueeColor: {
      type: String,
      value: ''
    },
    usingMarquee: {
      type: Boolean,
      value: false
    }
  },

  //组件的初始数据
  data: {},

  //组件生命周期方法
  lifetimes: {
    ready: function () {
      this.setData(defaultData);
      this.init();
    },
    attached: function () {
      // 在组件实例进入页面节点树时执行
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  //页面生命周期方法
  pageLifetimes: {
    show: function () {
      // 页面被展示
    },
    hide: function () {
      // 页面被隐藏
    },
    resize: function (size) {
      // 页面尺寸变化
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 播放下一个
     */
    changeNext: function ({ vid, siteid, vc, custom_id, banDrag = false, marqueeText, marqueeColor, usingMarquee}) {
      this.clearIntervals();
      this.started = false;

      if (this.ccVideo){
        this.ccVideo.pause();
      }
      this.setData(defaultData);
      this.setData({
        vid: vid,
        siteid: siteid,
        vc: vc,
        custom_id: custom_id,
        banDrag: banDrag,
        marqueeText: marqueeText,
        marqueeColor: marqueeColor,
        usingMarquee: usingMarquee
      });
      this.init();
    },

    /**
     * 播放初始化
     */
    init: function() {
      this.loaded = false;
      this.played = false;
      this.initTime = new Date().getTime();
      this.ccVideo = wx.createVideoContext('ccVideo', this)
      let that = this;
      let vid = this.data.vid;
      let siteid = this.data.siteid;
      let vc = this.data.vc;
      let custom_id = this.data.custom_id;

      let res = wx.getSystemInfoSync();
      let uaModel = 'iPhone';
      if (res && res.system) {
        let lowerCaseModel = res.system.toLowerCase();
        if (lowerCaseModel.startsWith('android')) {
          uaModel = 'Android';
        }
      } else {
        uaModel = 'Android';
      }
      // 计算主体部分高度,单位为px
      that.setData({
        uaModel: uaModel,
        second_width: res.windowWidth
      });
      this.getData(vid, siteid, vc, that.showPlayer);
    },

    /***
     * 播放器点击播放
     */
    videoPlay: function() {
      this.started = true;
      if (this.data.authenable == 0 && this.data.authOpen == false) {
        this.playAuth();
        this.setData({
          authOpen: true,
        });
      }
      if (this.data.isPlaying == false) {
        this.ccVideo.play();
        this.setData({
          isPlaying: true
        });
      } else {
        this.ccVideo.pause();
        this.setData({
          isPlaying: false
        });
      }
    },

    /***
     * 视频暂停事件回调
     */
    vPause: function() {
      this.setData({
        isPlaying: false
      });
      this.isWaiting = false;
      this.triggerEvent('videoPause');
      if (this.data.vCurrentTime != this.data.vDuration) {
        //暂停播放播放日志
        this.statis.flareTogglePlay(1);
        //暂停播放行为统计
        this.statis.clickStatisLog('pause');
      }
    },

    /***
     * 视频播放事件回调
     */
    vPlay: function() {
      if (!this.started) {
        this.ccVideo.pause();
        return;
      };
      this.setData({
        isPlaying: true
      });
      this.triggerEvent('videoPlay');
      //统计heartSend启动
      if (!this.played) {
        this.played = true;
        //播放心跳日志
        this.statis.flareHeartJump();
        //第一次播放flare日志
        this.statis.flareFirstPlay(this.readyTime);
      }
      //开始播放flare日志
      this.statis.flareTogglePlay(2);
      //开始播放播放日志
      this.statis.clickPlayLog(0);
      //开始播放行为统计
      this.statis.clickStatisLog('replay');
    },

    /***
     * 视频加载中事件回调
     */
    vWaiting: function(e) {
      if (!this.loaded) {
        return;
      }
      if (this.data.vCurrentTime - this.data.lastTime < 2 && this.data.vCurrentTime >= this.data.lastTime){
        //正常播卡才发送日志，排除拖拽行为的播卡
        this.isWaiting = true;
        this.data.watingNum++;
        this.statis.flareVideoWaiting(parseInt(this.loadStartPositon * 1000), parseInt(this.data.vCurrentTime * 1000));
        if (this.data.watingNum == 1) {
          //第一次播卡播放日志
          this.statis.clickPlayLog(1);
        } else if (this.data.watingNum == 3) {
          //第三次播卡播放日志
          this.statis.clickPlayLog(3);
        }
      }
    },

    /***
     * 视频播放出错事件回调
     */
    vError: function(e) {
      //停止播放心跳
      this.statis.flareHeartStop();
      this.statis.flareVideoLoadFail(this.played);
      //视频加载失败播放日志
      this.statis.clickPlayLog(2);
      this.triggerEvent('videoError');
    },

    /***
     * 视频播放结束事件回调
     */
    vEnd: function(e) {
      //设置播放时间
      this.setData({
        vCurrentTime: this.data.vDuration,
      });
      this.lastTime = this.data.vDuration;
      this.lastTimeMax = this.data.vDuration;
      //播放结束flare日志
      this.statis.flarePlayEnded();
      //播放结束行为统计
      this.statis.clickStatisLog('finish');
      //停止播放心跳
      this.statis.flareHeartStop();
      this.triggerEvent('videoEnded');
    },

    /***
     * 加载进度变化时事件回调
     */
    vProgress: function(e) {
      if (!this.loaded) {
        return;
      }
      if (this.isWaiting){
        this.isWaiting = false;
        let currentTime = this.data.vCurrentTime;
        setTimeout(() => {
          if (this.data.vCurrentTime == currentTime){
             this.isWaiting = true;
             return;
          }
          //缓冲结束flare日志
          this.statis.flareVideoWaitingOver(parseInt(this.loadStartPositon * 1000), parseInt(this.data.vCurrentTime * 1000), 0);
        }, 500);
      }
    },

    /***
     * 视频元数据加载后事件回调
     */
    vLoadedmetadata: function(e) {
      this.loaded = true;
      this.isWaiting = false;
      this.setData({
        vDuration: e.detail.duration
      });
      this.readyTime = new Date().getTime() - this.initTime;
      //播放准备flare日志
      this.statis.flareReadyStage(this.piTime, this.readyTime);
    },

    /***
     * 点击切换倍速
     */
    changeSpeed: function(e) {
      if (e.target.dataset.txt == this.data.ccH5spTxt) {
        this.setData({
          spShow: false,
        });
        return;
      }
      
      let oldSp = 1;
      let spList = this.data.spList;
      for(let sp of spList){
        if (sp.txt == this.data.ccH5spTxt){
          oldSp = sp.num;
          break;
        }
      }

      let index = e.target.dataset.key;
      let spNum = e.target.dataset.num;
      let spTxt = e.target.dataset.txt;
      this.setData({
        ccH5spTxt: spTxt,
        spShow: false,
      });
      this.ccVideo.playbackRate(Number(spNum));
      //切换倍速flare日志
      this.statis.flareChangeSpeed(oldSp, spNum);
    },

    /***
     * 点击切换清晰度
     */
    changeQuality: function(e) {
      if (e.target.dataset.txt == this.data.ccH5hdTxt) {
        this.setData({
          hdShow: false,
        });
        return;
      }
      let hdTxt = e.target.dataset.txt;
      let vTime = this.data.vCurrentTime;
      let oldUrl = this.data.videoSrc;
      let hdUrl = '';
      if (!!this.data.custom_id) {
        hdUrl = e.target.dataset.url + '&custom_id=' + this.data.custom_id;
      } else {
        hdUrl = e.target.dataset.url;
      }
      this.setData({
        ccH5spTxt: '常速',
        ccH5hdTxt: hdTxt,
        videoSrc: hdUrl,
        hdShow: false
      });
      this.ccVideo.playbackRate(1);
      this.data.isPlaying = false;
      this.ccVideo.play();
      this.gotoSeek(vTime);

      //切换清晰度flare统计
      this.statis.flareSwitchQuality(oldUrl, hdUrl);
    },

    /**
     * 跳转到某个时间点播放
     */
    gotoSeek: function(duration) {
      this.started = true;
      if (this.data.lastTimeMax < duration) {
        this.data.lastTimeMax = duration;
      }
      let that = this;
      setTimeout(function() {
        that.ccVideo.play();
        if (!that.data.isPlaying) {
          that.gotoSeek(duration);
          return;
        }
        that.ccVideo.seek(duration);
      }, 200);
    },

    /***
     * 点击显示隐藏倍速列表
     */
    clickSpShow: function() {
      if (this.data.spShow == true) {
        this.setData({
          spShow: false,
          hdShow: false,
        });
      } else {
        this.setData({
          spShow: true,
          hdShow: false,
        });
      }
    },

    /***
     * 点击显示隐藏清晰度列表
     */
    clickHdShow: function() {
      if (this.data.hdShow == true) {
        this.setData({
          spShow: false,
          hdShow: false
        });
      } else {
        this.setData({
          spShow: false,
          hdShow: true
        });
      }
    },

    /***
     * 界面显示隐藏
     */
    clickBtnsShow: function() {
      if (this.data.interFaceShow == false) {
        this.setData({
          interFaceShow: true,
          spShow: false,
          hdShow: false
        });
      } else {
        this.setData({
          interFaceShow: false,
          spShow: false,
          hdShow: false
        });
      }

      if (this.data.vCurrentTime == 0) {
        this.videoPlay();
      }
    },

    /***
     * 监听播放器的播放进度
     */
    vTimeupdate: function(e) {
      let currentTime = e.detail.currentTime;
      let isPlaying = true;
      if (e.detail.duration - currentTime < 0.5) {
        currentTime = e.detail.duration;
        isPlaying = false;
      }
  
      this.setData({
        ccH5TimeCurrent: this.timeFormat(currentTime),
        ccH5TimeTotal: this.timeFormat(e.detail.duration),
        dragBtnleft: currentTime / e.detail.duration * (this.data.second_width - 116) - 15,
        percent: currentTime / e.detail.duration * 100,
        vCurrentTime: currentTime,
        vDuration: e.detail.duration,
        isPlaying: isPlaying
      });
      // 是否 禁止拖动
      if (this.data.banDrag && e.detail.currentTime - this.data.lastTimeMax > 2) {
          this.ccVideo.seek(this.data.lastTime);
          return;
      }
      this.data.lastTime = e.detail.currentTime;
      if (this.data.lastTime >= this.data.lastTimeMax) {
        this.data.lastTimeMax = this.data.lastTime;
      }
      this.loadStartPositon = e.detail.currentTime;
    },

    /***
     * 时间转成00:00格式
     */
    timeFormat: function(time) {
      var t = parseInt(time),
        h, i, s;
      h = Math.floor(t / 3600);
      h = h ? (h + ':') : '';
      i = h ? Math.floor(t % 3600 / 60) : Math.floor(t / 60);
      s = Math.floor(t % 60);
      i = i > 9 ? i : '0' + i;
      s = s > 9 ? s : '0' + s;
      return (h + i + ':' + s);
    },

    /***
     * 全屏播放
     */
    fullScreen: function() {
      this.ccVideo.requestFullScreen();
    },

    /***
     * 监听全屏后显示系统进度条
     */
    vFullScreen: function(e) {
      this.started = true;
      if (e.detail.fullScreen) {
        this.setData({
          videoControls: true,
          cPlayBtn: true,
          btnsShow: false,
        });
      } else {
        this.setData({
          videoControls: false,
          cPlayBtn: false,
          btnsShow: true,
        });
      }
    },

    /***
     * 拖拽跳转时间
     */
    dragTime: function(e) {
      this.ccVideo.pause();
      if (e.touches[0].clientX <= 56) {
        this.setData({
          dragBtnleft: -15,
          percent: 0,
          vCurrentTime: 0,
        });
        return;
      } 

      if (e.touches[0].clientX >= this.data.second_width - 56) {
        this.setData({
          dragBtnleft: this.data.second_width - 131,
          percent: 100,
          vCurrentTime: this.data.vDuration,
        });
        return;
      }  

      this.setData({
        dragBtnleft: e.touches[0].clientX - 73,
        percent: (e.touches[0].clientX - 58) / (this.data.second_width - 116) * 100,
        vCurrentTime: this.data.vDuration * this.data.percent / 100
      });
      return;
    },

    /***
     * 拖拽抬起跳转时间
     */
    dragTimeEnd: function() {
      let that = this;
      this.ccVideo.seek(this.data.vCurrentTime);
      setTimeout(function() {
        that.ccVideo.play();
      }, 300);
      
      //flare拖拽结束日志
      this.statis.flareSeeked(this.data.lastTime, this.data.vCurrentTime);
    },

    /***
     * 播放授权
     */
    playAuth: function() {
      let that = this;
      if (this.data.authmessage == '') {
        this.setData({
          authmessage: '不允许观看或试看时间用尽',
        })
      }

      if (this.data.freetime == 0) {
        this.setData({
          isPlayAuth: true,
          videoBoxShow: false,
        });
        if (that.data.authCallback != '') {
          if (typeof app[that.data.authCallback] == "function") {
            app[that.data.authCallback]();
          }
        }
        return;
      }  

      let freeT = setInterval(function() {
        if (that.data.vCurrentTime < that.data.freetime) {
          clearInterval(freeT);
          return;
        }
        clearTimeout(freeT);
        that.setData({
          isPlayAuth: true,
          videoBoxShow: false,
          authOpen: false,
        });
        if (that.data.authCallback != '') {
          if (typeof that.data.authCallback == "function") {
            that.data.authCallback();
          }
        }
      }, 500);
      this.freeTimeInterval = freeT;
    },

    /***
     * 获取视频数据后的回调
     */
    showPlayer: function(that, data) {
      data = data.substring(data.indexOf('(') + 1, data.length - 1);
      let dataObj = JSON.parse(data);
      //初始化统计
      that.initStatis(dataObj);
      // custom_id
      let custom_id = that.data.custom_id;
      let vSrc = '';
      // 避免获取视频信息出错时报错
      if (dataObj.copies.length === 0) {
        that.readyTime = new Date().getTime() - that.initTime;
        that.statis.flareReadyStage(that.piTime, that.readyTime);
        return;
      }
      if (!!that.data.custom_id) {
        vSrc = dataObj.copies[0].playurl + '&custom_id=' + custom_id;
      } else {
        vSrc = dataObj.copies[0].playurl
      }
      let isAudio = false;
      let videoPoster = dataObj.img;
      let audioBg = '';
      if (dataObj.copies[0].mediatype != 1) {
        isAudio = true;
        videoPoster = '';
        audioBg = dataObj.img;
      }
      that.lastTimeMax = 0;
      that.setData({
        videoSrcList: dataObj.copies,
        videoSrc: vSrc,
        videoPoster: videoPoster,
        ccH5hdTxt: dataObj.copies[0].desp,
        isAudio: isAudio,
        audioBg: audioBg
      });
      if (dataObj.authenable == 0) {
        that.setData({
          authenable: dataObj.authenable,
          authmessage: dataObj.authmessage,
          authCallback: dataObj.callback,
          freetime: dataObj.freetime,
        });
      }
    },

    /***
     * 初始化统计
     */
    initStatis: function(dataObj) {
      let that = this;
      //提供给统计使用的参数
      let params = {
        vid: that.data.vid,
        siteid: that.data.siteid,
        custom_id: that.data.custom_id,
      };
      //提供给统计使用的api
      let playerApi = {
        getCurrentTime: function() {
          return that.data.vCurrentTime;
        },
        getDuration: function() {
          return that.data.vDuration;
        },
        getVideoSrc: function() {
          return that.data.videoSrc;
        }
      };
      that.statis = StatisClass.createStatis(params, dataObj, playerApi);
    },

    /***
     * 请求接口
     */
    getData: function(vid, siteid, vc, callback) {
      var _this = this;
      var startTime = new Date().getTime();
      wx.request({
        url: 'https://p.bokecc.com/servlet/getvideofile',
        data: {
          vid: vid,
          siteid: siteid,
          hlssupport: 1,
          useragent: _this.data.uaModel,
          vc: vc,
        },
        header: {
          "Content-Type": "applciation/json"
        },
        method: "GET",
        success: function(res) {
          _this.piTime = new Date().getTime() - startTime;
          callback(_this, res.data);
        },
        fail: function(err) {}
      })
    },
    
    /***
     * 清楚定时任务
     */
    clearIntervals: function() {
      this.statis.flareHeartStop();
      clearInterval(this.freeTimeInterval);
    },
    getCurrentTime:function(){
      return this.data.vCurrentTime || 0;
    },
    getDuration: function () {
      return this.data.vDuration || 0;
    },
    play:function(){
      this.ccVideo.play();
    },
    pause:function(){
      this.ccVideo.pause();
    }
  }
})