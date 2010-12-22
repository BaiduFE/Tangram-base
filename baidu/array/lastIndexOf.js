/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/array/lastIndexOf.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/14
 */

///import baidu.array;

/**
 * 从后往前，查询数组中指定元素的索引位置
 * @name baidu.array.lastIndexOf
 * @function
 * @grammar baidu.array.lastIndexOf(source, condition)
 * @param {Array} source 需要查询的数组
 * @param {Any|Function} condition 查询项或查询函数，查询函数有两个参数，第一个参数为数组元素，第二个参数为数组索引值，function (item, position)。
 * @see baidu.array.indexOf
 *             
 * @returns {number} 指定元素的索引位置，查询不到时返回-1
 */

baidu.array.lastIndexOf = function (source, condition) {
    var len = source.length,
        iterator = condition;
    
    if ('function' != typeof condition) {
        iterator = function (item) {
            return condition === item;
        };
    }
    
    while (len--) {
        if (true === iterator.call(source, source[len], len)) {
            return len;
        }
    }
    
    return -1;
};
