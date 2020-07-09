# <div style="text-align:center;">点播小程序集成文档</div>

------

##  开发配置
小程序微信开发者后台设置-开发设置-服务器域名中配置 [request合法域名],需要把CC视频接口服务器域名配置上，需要加的域名有：

<div style="color:#0000ff;font-size:24px;">https://p.bokecc.com</div>
<div style="color:#0000ff;font-size:24px;">https://m-click.bokecc.com</div>
<div style="color:#0000ff;font-size:24px;">https://m-flare.bokecc.com</div>



如下图所示：

![cmd-markdown-logo](http://1-material.bokecc.com/material/789B96A2238D7A0E/128150.png)


## Demo 结构说明
Demo的目录结构如下图所示：
![cmd-markdown-logo](http://1-material.bokecc.com/material/789B96A2238D7A0E/128147.png)

components目录是视频播放所实现的自定义组件。pages下有两个页面，videolist是视频列表页，index是播放页。在index播放页引入components的自定义组件实现播放功能。videolist和index可根据用户情况做改动。 app*对应的几个文件的内容可以被完全替换。images目录是视频播放器用到的一些图标。utils.js是一些工具方法。

## 视频播放集成
视频播放的主要功能封装在自定义组件内，用户只需集成这个自定义组件。集成页面在demo中是index页页面。index页面代码如下：

```
<view>
    <ccvod id='ccVod' vid='{{vid}}' siteid='{{siteid}}' vc='{{vc}}' custom_id='{{custom_id}}'/>
</view>
```
 ccvod是引用视频播放的自定义组件，index.json配置如下：
 
```
 {
    "component": true,
    "usingComponents": {
        "ccvod": "../../components/ccvod/ccvod"
    }
 }
```

ccvod自定义组件需要用到视频播放相关的几个参数，参数说明如下：

> vid: 视频id  
> siteid: 用户id  
> vc: 授权验证码，没开授权验证时默认为空字符串  
> custome_id:用户自定义参数统计时的参数，默认为空字符串  
> banDrag:是否禁止快进，设置成true时不允许进度条向右拖动  
> marqueeText: 跑马灯文字内容  
> marqueeColor: 跑马灯文字颜色  
> usingMarquee: 是否使用跑马灯，默认为false  


逻辑层index.js的示例代码如下：

```
Page({
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
})
```

在页面加载时获取上一个页面传过来的参数值。


## 获取ccvod自定义组件

ccvod视频播放自定义组件提供一些api供页面调用，在调用前需要获取ccvod自定义组件对象，示例如下：

```
 const pages = getCurrentPages();
 const ctx = pages[pages.length - 1];
 const ccVod = ctx.selectComponent("#ccVod");
```


## ccvod自定义组件API
###1、切换视频   
方法：changeNext(params)    
参数：params包含视频播放的参数名和参数值，    
返回值：无     
示例如下：

```
var params = {
  "vid": "C18F506284ABAB3C9C33DC5901307461",
  "siteid": "2661F9756E5C832E",
  "vc": "",
  "title": "下一个视频",
  "custom_id": 'ccc'
};
ccVod.changeNext(params);
```

###2、设置播放进度   
方法：gotoSeek(second)    
参数：second进度时间（秒）     
返回值：无     
示例如下：

```
ccVod.gotoSeek(10);
```

###3、获取当前播放进度时间   
方法：getCurrentTime()    
参数：无    
返回值：当前播放进度时间（秒），视频播放后才能获取，否则返回0       
示例如下：

```
let currentTime = ccVod.getCurrentTime();
```

###4、获取视频时长   
方法：getDuration()    
参数：无    
返回值：当前播放视频时长（秒），视频播放后才能获取，否则返回0    
示例如下：

```
let duration = ccVod.getDuration();
```

###5、播放   
方法：play()    
参数：无    
返回值：无    
示例如下：

```
ccVod.play();
```

###6、暂停  
方法：pause()    
参数：无    
返回值：无    
示例如下：

```
ccVod.pause();
```

## ccvod自定义组件事件回调
ccvod自定义组件中某些行为会回调页面，通过triggerEvent(eventName)的方式回调页面。页面使用ccvod自定义组件时，可以绑定对应的事件捕获处理，不需要处理时可不绑事件捕获处理。示例如下：

1、页面使用自定义组件，绑定事件捕获处理。

```
 <ccvod id="ccVod" vid='{{vid}}' siteid='{{siteid}}' vc='{{vc}}' custom_id='{{custom_id}}' bind:videoPlay='handleVideoPlay'/>
```
bind:videoPlay='handleVideoPlay' 是对videoPlay事件设置事件捕获的回调方法handleVideoPlay

2、回调方法处理

```
handleVideoPlay:function(){
  console.log('video play callback');
},
```
3、ccvod自定义组件触发事件回调

```
vPlay: function() {
  ...
  this.triggerEvent('videoPlay');
  ...
}
```


###1、视频播放事件回调
事件：videoPlay    
detail对象：无    
触发事件的选项：无    
示例如下：

```
this.triggerEvent('videoPlay');
```

###2、视频暂停事件回调
事件：videoPause    
detail对象：无    
触发事件的选项：无    
示例如下：

```
this.triggerEvent('videoPause');
```


###3、视频播放结束事件回调
事件：videoEnded    
detail对象：无    
触发事件的选项：无    
示例如下：

```
this.triggerEvent('videoEnded');
```

###4、视频播放错误事件回调
事件：videoError    
detail对象：无    
触发事件的选项：无    
示例如下：

```
this.triggerEvent('videoError');
```




