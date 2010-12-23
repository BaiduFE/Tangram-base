/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/get.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/23
 */

///import baidu.event.EventArg;

/**
 * 获取扩展的EventArg对象
 * @name baidu.event.get
 * @function
 * @grammar baidu.event.get(event[, win])
 * @param {Event} event 事件对象
 * @param {window} [win] 触发事件元素所在的window
 * @meta standard
 * @see baidu.event.EventArg
 *             
 * @returns {EventArg} 扩展的事件对象
 */
baidu.event.get = function (event, win) {
    return new baidu.event.EventArg(event, win);
};
