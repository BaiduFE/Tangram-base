/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/preventDefault.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/23
 */

///import baidu.event;

/**
 * 阻止事件的默认行为
 * @name baidu.event.preventDefault
 * @function
 * @grammar baidu.event.preventDefault(event)
 * @param {Event} event 事件对象
 * @meta standard
 * @see baidu.event.stop,baidu.event.stopPropagation
 */
baidu.event.preventDefault = function (event) {
   if (event.preventDefault) {
       event.preventDefault();
   } else {
       event.returnValue = false;
   }
};
