/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/cookie/getRaw.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */

///import baidu.cookie._isValidKey;

/**
 * 获取cookie的值，不对值进行解码
 * @name baidu.cookie.getRaw
 * @function
 * @grammar baidu.cookie.getRaw(key)
 * @param {string} key 需要获取Cookie的键名
 * @meta standard
 * @see baidu.cookie.get,baidu.cookie.setRaw
 *             
 * @returns {string|null} 获取的Cookie值，获取不到时返回null
 */
baidu.cookie.getRaw = function (key) {
    if (baidu.cookie._isValidKey(key)) {
        var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"),
            result = reg.exec(document.cookie);
            
        if (result) {
            return result[2] || null;
        }
    }

    return null;
};
