let StatisUtil = require('./statisutil.js').default;

let CLICK_LOG_SERVER = 'https://m-click.bokecc.com';
let FLARE_LOG_SERVER = 'https://m-flare.bokecc.com';

function StatisClass(params, videoPlayData, playerApi) {
  this.params = params;
  this.videoPlayData = videoPlayData;
  this.playerApi = playerApi;
  this.uvid = this.getUvid();
}  

StatisClass.prototype = {
  //准备阶段完成日志
  flareReadyStage: function (piTime, readyTime) {
    var status = (this.videoPlayData.status == 1? 1: 0);
    var reason = '';
    switch (this.videoPlayData.status){
       case 1:
        if (this.videoPlayData.authenable == 0) {
          reason = 207;
          break;
         }
         if (this.videoPlayData.copies.length == 0){
            reason = 116;
            break;
         }
         break;
       case 0:
        reason = 114;
        break;
       case 2:
        reason = 113;
        break; 
       case 3:
        reason = 115;
        break;  
    }   
    var params = {
      stage: 10,
      upid: this.videoPlayData.UPID,
      userid: this.params.siteid,
      videoid: this.params.vid,
      status: this.videoPlayData.status,
      pl_time: 1,//固定值1
      pi_time: piTime,
      uvid: this.uvid,
      ready_time: readyTime,
      time: this.getNowTime(),
      random: this.getRandomNum(),
      terminal_type: 30
    };
    if (reason != ''){
      params.reason = reason;
    }
    this.sendFlare(params);
  },

  //成功开始播放日志
  flareFirstPlay: function (readyTime) {
    readyTime = readyTime || '';
    this.sendFlare({
      stage: 31,
      upid: this.videoPlayData.UPID,
      userid: this.params.siteid,
      videoid: this.params.vid,
      play_url: this.playerApi.getVideoSrc(),
      play_position: Math.floor(this.playerApi.getCurrentTime() * 1000),
      load_start_point: -1,
      load_end_point: -1,
      pre_adduration: 0,
      group_test_count: 1,
      total_test_time: 1,
      video_duration: this.playerApi.getDuration(),
      video_size: -1,
      page_url: '',
      uvid: this.uvid,
      ready_time: readyTime,
      time: this.getNowTime(),
      random: this.getRandomNum(),
      terminal_type: 30,
      custom_id: this.params.custom_id
    });
  },

  //视频播卡日志
  flareVideoWaiting: function (startPosition, endPosition) {
    this.sendFlare({
      stage: 32,
      upid: this.videoPlayData.UPID,
      userid: this.params.siteid,
      videoid: this.params.vid,
      play_url: this.playerApi.getVideoSrc(),
      play_position: Math.floor(this.playerApi.getCurrentTime() * 1000),
      //当前播放开始与续播
      load_start_point: startPosition,
      load_end_point: endPosition,
      buffer_left: -1,
      time: this.getNowTime(),
      random: this.getRandomNum(),
      terminal_type: 30
    });
  },

  //视频播卡后再次缓冲完成时日志
  flareVideoWaitingOver: function (startPosition, endPosition, bufferedTime) {
    this.sendFlare({
      stage: 33,
      upid: this.videoPlayData.UPID,
      userid: this.params.siteid,
      videoid: this.params.vid,
      play_url: this.playerApi.getVideoSrc(),
      play_position: Math.floor(this.playerApi.getCurrentTime() * 1000),
      video_duration: Math.floor(this.playerApi.getDuration() * 1000),
      load_start_point: startPosition,
      load_end_point: endPosition,
      buffered_size: -1,
      buffered_time: bufferedTime,
      time: this.getNowTime(),
      random: this.getRandomNum(),
      terminal_type: 30
    });
  },

  //加载失败日志
  flareVideoLoadFail: function (hasPlayed) {
    let status = (!!hasPlayed)? 2: 1;
    this.sendFlare({
      stage: 34,
      upid: this.videoPlayData.UPID,
      userid: this.params.siteid,
      videoid: this.params.vid,
      play_url: this.playerApi.getVideoSrc(),
      play_position: Math.floor(this.playerApi.getCurrentTime() * 1000),
      video_duration: Math.floor(this.playerApi.getDuration() * 1000),
      load_start_point: -1,
      load_end_point: -1,
      status: status,
      time: this.getNowTime(),
      random: this.getRandomNum(),
      terminal_type: 30
    });
  },

  //暂停续播日志
  flareTogglePlay: function (type) {
    this.sendFlare({
      stage: 35,
      upid: this.videoPlayData.UPID,
      userid: this.params.siteid,
      videoid: this.params.vid,
      type: type,
      time: this.getNowTime(),
      random: this.getRandomNum(),
      terminal_type: 30
    })
  },

  //拖拽结束日志
  flareSeeked: function (startPosition, endPosition) {
    this.sendFlare({
      stage: 36,
      upid: this.videoPlayData.UPID,
      userid: this.params.siteid,
      videoid: this.params.vid,
      start_position: startPosition,
      end_position: endPosition,
      load_start_point: startPosition,
      load_end_point: startPosition,
      time: this.getNowTime(),
      random: this.getRandomNum(),
      terminal_type: 30
    })
  },

  //切换清晰度日志
  flareSwitchQuality: function (sourceUrl, destinationUrl) {
    this.sendFlare({
      stage: 37,
      upid: this.videoPlayData.UPID,
      userid: this.params.siteid,
      videoid: this.params.vid,
      source_url: sourceUrl,
      destination_url: destinationUrl,
      time: this.getNowTime(),
      random: this.getRandomNum(),
      terminal_type: 30
    })
  },

  //切换倍速日志
  flareChangeSpeed: function (sourceSpeed, targetSpeed) {
    this.sendFlare({
      stage: 38,
      upid: this.videoPlayData.UPID,
      userid: this.params.siteid,
      videoid: this.params.vid,
      play_url: this.playerApi.getVideoSrc(),
      source_speed: sourceSpeed,
      target_speed: targetSpeed,
      time: this.getNowTime(),
      random: this.getRandomNum(),
      terminal_type: 30
    })
  },

  //播放结束日志
  flarePlayEnded: function () {
    this.sendFlare({
      stage: 40,
      upid: this.videoPlayData.UPID,
      userid: this.params.siteid,
      videoid: this.params.vid,
      play_url: this.playerApi.getVideoSrc(),
      play_position: Math.floor(this.playerApi.getCurrentTime() * 1000),
      video_duration: Math.floor(this.playerApi.getDuration() * 1000),
      time: this.getNowTime(),
      random: this.getRandomNum(),
      terminal_type: 30
    });
  },

   //心跳日志
  flareHeartJump: function () {
    if (this.heartId) {
      clearInterval(this.heartId);
    }
    this.heartId = setInterval(e => {
      this.sendFlare({
        stage: 77,
        upid: this.videoPlayData.UPID,
        userid: this.params.siteid,
        videoid: this.params.vid,
        play_position: Math.floor(this.playerApi.getCurrentTime() * 1000),
        video_duration: Math.floor(this.playerApi.getDuration() * 1000),
        time: this.getNowTime(),
        random: this.getRandomNum(),
        terminal_type: 30
      })
    }, 10000);
  },

  //停止心跳日志
  flareHeartStop:function(){
    if (this.heartId) {
      clearInterval(this.heartId);
      this.heartId = null;
    };
  },

  //click播放日志
  clickPlayLog: function (action) {
    this.sendClick(CLICK_LOG_SERVER + '/playlog.php', {
      id: this.createId(),
      VIP: 2,
      action: action,
      flvURL: this.playerApi.getVideoSrc(),
      bufferPercent: -1,
      userID: this.params.siteid,
      videoID: this.params.vid,
      status: 2,
      data: this.getNowTime(),
      random: this.getRandomNum(),
      terminal_type: 30
    })
  },

  //click播放行为统计日志
  clickStatisLog: function (action) {
    this.sendClick(CLICK_LOG_SERVER + '/flash/playaction', {
      uid: this.params.siteid,
      vid: this.params.vid,
      action: action,
      data: this.getNowTime(),
      random: this.getRandomNum(),
      terminal_type: 30
    })
  },

  // 发送flare系统接口请求
  sendFlare: function (data) {
    wx.request({
      url: FLARE_LOG_SERVER + '/flash/playlog',
      data,
      header: {
        "Content-Type": "applciation/json"
      },
      method: "GET",
      success: function (res) { },
      fail: function (err) { }
    })
  },

  //发送click系统请求
  sendClick: function (url, data) {
    wx.request({
      url,
      data,
      header: {
        "Content-Type": "applciation/json"
      },
      method: "GET",
      success: function (res) { },
      fail: function (err) { }
    })
  },

  getNowTime: function () {
    return new Date().getTime();
  },

  getRandomNum: function () {
    return Math.floor(Math.random() * Math.pow(10, 7));
  },

  createId: function () {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    return (h * 3600 + m * 60 + s).toString(36) + "_" + Math.round(Math.random() * 999999).toString(36);
  },

  getUvid: function () {
    var uniqueVisitorId;
    var co = wx.getStorageSync('uniqueVisitorId');
    if (co != null) {
      uniqueVisitorId = wx.getStorageSync('uniqueVisitorId');
    } else {
      uniqueVisitorId = this.guidGenerator();
      wx.setStorageSync('uniqueVisitorId', uniqueVisitorId);
    }
    return (StatisUtil.hex_sha1(uniqueVisitorId)).toUpperCase();
  },

  guidGenerator: function () {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  }
}

export function createStatis(params, videoPlayData, playerApi) {
  return new StatisClass(params, videoPlayData, playerApi);
}