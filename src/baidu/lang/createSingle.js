/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/createSingle.js
 * author: meizz, berg
 * version: 1.1.2
 * date: 2010-05-13
 */

///import baidu.lang;
///import baidu.lang.Class;
///import baidu.lang.Class.$removeEventListener;
///import baidu.lang.Event;

/**
 * 创建一个baidu.lang.Class的单例实例
 * @name baidu.lang.createSingle
 * @function
 * @grammar baidu.lang.createSingle(json)
 * @param {Object} json 直接挂载到这个单例里的预定属性/方法
 * @version 1.2
 * @see baidu.lang.Class
 *             
 * @returns {Object} 一个实例
 */
baidu.lang.createSingle = function (json) {
    var c = new baidu.lang.Class();

    for (var key in json) {
        c[key] = json[key];
    }
    return c;
};

