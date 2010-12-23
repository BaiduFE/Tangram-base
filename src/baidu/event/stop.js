/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/stop.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/23
 */

///import baidu.event.stopPropagation;
///import baidu.event.preventDefault;

/**
 * 停止事件
 * @name baidu.event.stop
 * @function
 * @grammar baidu.event.stop(event)
 * @param {Event} event 事件对象
 * @see baidu.event.stopPropagation,baidu.event.preventDefault
 */
baidu.event.stop = function (event) {
    var e = baidu.event;
    e.stopPropagation(event);
    e.preventDefault(event);
};
