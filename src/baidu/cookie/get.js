/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/cookie/get.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */

///import baidu.cookie.getRaw;

/**
 * 获取cookie的值，用decodeURIComponent进行解码
 * @name baidu.cookie.get
 * @function
 * @grammar baidu.cookie.get(key)
 * @param {string} key 需要获取Cookie的键名
 * @remark
 * <b>注意：</b>该方法会对cookie值进行decodeURIComponent解码。如果想获得cookie源字符串，请使用getRaw方法。
 * @meta standard
 * @see baidu.cookie.getRaw,baidu.cookie.set
 *             
 * @returns {string|null} cookie的值，获取不到时返回null
 */
baidu.cookie.get = function (key) {
    var value = baidu.cookie.getRaw(key);
    if ('string' == typeof value) {
        value = decodeURIComponent(value);
        return value;
    }
    return null;
};
