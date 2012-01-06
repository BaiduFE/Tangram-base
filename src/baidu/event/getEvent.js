/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: baidu/event/getEvent.js
 * author: xiadengping
 * version: 1.6.0
 * date: 2011/12/08
 */

///import baidu.event;

/**
 * 获取事件对象
 * @name baidu.event.getEvent
 * @function
 * @param {Event} event event对象，目前没有使用这个参数，只是保留接口。by dengping.
 * @grammar baidu.event.getEvent()
 * @meta standard
 * @return {Event} event对象.
 */

baidu.event.getEvent = function(event) {
    if (window.event) {
        return window.event;
    } else {
        var f = arguments.callee;
        do { //此处参考Qwrap框架 see http://www.qwrap.com/ by dengping
            if (/Event/.test(f.arguments[0])) {
                return f.arguments[0];
            }
        } while (f = f.caller);
        return null;
    }
};
