/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/getPageX.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/16
 */

///import baidu.event;

/**
 * 获取鼠标事件的鼠标x坐标
 * @name baidu.event.getPageX
 * @function
 * @grammar baidu.event.getPageX(event)
 * @param {Event} event 事件对象
 * @see baidu.event.getPageY
 *             
 * @returns {number} 鼠标事件的鼠标x坐标
 */
baidu.event.getPageX = function (event) {
    var result = event.pageX,
        doc = document;
    if (!result && result !== 0) {
        result = (event.clientX || 0) 
                    + (doc.documentElement.scrollLeft 
                        || doc.body.scrollLeft);
    }
    return result;
};
