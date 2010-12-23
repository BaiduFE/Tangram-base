/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/getPageY.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/16
 */

///import baidu.event;

/**
 * 获取鼠标事件的鼠标y坐标
 * @name baidu.event.getPageY
 * @function
 * @grammar baidu.event.getPageY(event)
 * @param {Event} event 事件对象
 * @see baidu.event.getPageX
 *             
 * @returns {number} 鼠标事件的鼠标y坐标
 */
baidu.event.getPageY = function (event) {
    var result = event.pageY,
        doc = document;
    if (!result && result !== 0) {
        result = (event.clientY || 0) 
                    + (doc.documentElement.scrollTop 
                        || doc.body.scrollTop);
    }
    return result;
};
