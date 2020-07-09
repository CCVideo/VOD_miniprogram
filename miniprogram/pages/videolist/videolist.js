// pages/videolist/videolist.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    vlist: [
      {
        "vid": "A4F81E6E8DD693A59C33DC5901307461",
        "siteid": "2661F9756E5C832E",
        "vc": "",
        "title": "公开课",
        "customId": 'ccc',
        "banDrag": true
      },
       {
         "vid": "A7D0F7B88759A39E9C33DC5901307461",
         "siteid": "407C0500BD0F12BC",
         "title": "纯音频",
         "customId": '333',
         "banDrag": true
       }
    ]
  },

  // 跳转页面
  toast: function (event) {
    let vid = event.currentTarget.dataset.vid;
    let siteid = event.currentTarget.dataset.siteid;
    let vc = event.currentTarget.dataset.vc;
    let customId = event.currentTarget.dataset.customid;
    let banDrag = event.currentTarget.dataset.bandrag;
    console.log(event.currentTarget.dataset);
    console.log('banDrag---' + banDrag);
    console.log('custom_id:' + customId);
    wx.navigateTo({
      url: `../index/index?vid=${vid}&siteid=${siteid}&vc=${vc}&custom_id=${customId}&banDrag=${banDrag}`
    })
  }
})