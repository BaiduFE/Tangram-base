/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */

///import baidu.sio;

/**
 * 通过请求一个图片的方式令服务器存储一条日志
 * @function
 * @grammar baidu.sio.log(url)
 * @param {string} url 要发送的地址.
 * @author: int08h,leeight
 */
baidu.sio.log = function(url) {
  var img = new Image(),
      key = 'tangram_sio_log_' + Math.floor(Math.random() *
            2147483648).toString(36);

  // 这里一定要挂在window下
  // 在IE中，如果没挂在window下，这个img变量又正好被GC的话，img的请求会abort
  // 导致服务器收不到日志
  window[key] = img;

  img.onload = img.onerror = img.onabort = function() {
    // 下面这句非常重要
    // 如果这个img很不幸正好加载了一个存在的资源，又是个gif动画
    // 则在gif动画播放过程中，img会多次触发onload
    // 因此一定要清空
    img.onload = img.onerror = img.onabort = null;

    window[key] = null;

    // 下面这句非常重要
    // new Image创建的是DOM，DOM的事件中形成闭包环引用DOM是典型的内存泄露
    // 因此这里一定要置为null
    img = null;
  };

  // 一定要在注册了事件之后再设置src
  // 不然如果图片是读缓存的话，会错过事件处理
  // 最后，对于url最好是添加客户端时间来防止缓存
  // 同时服务器也配合一下传递Cache-Control: no-cache;
  img.src = url;
};
