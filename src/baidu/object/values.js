/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/object/values.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */

///import baidu.object;

/**
 * 获取目标对象的值列表
 * @name baidu.object.values
 * @function
 * @grammar baidu.object.values(source)
 * @param {Object} source 目标对象
 * @see baidu.object.keys
 *             
 * @returns {Array} 值列表
 */
baidu.object.values = function (source) {
    var result = [], resultLen = 0, k;
    for (k in source) {
        if (source.hasOwnProperty(k)) {
            result[resultLen++] = source[k];
        }
    }
    return result;
};
