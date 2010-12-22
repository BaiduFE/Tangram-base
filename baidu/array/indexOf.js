/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/array/indexOf.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/02
 */

///import baidu.array;

/**
 * 查询数组中指定元素的索引位置
 * @name baidu.array.indexOf
 * @function
 * @grammar baidu.array.indexOf(source, condition[, position])
 * @param {Array} source 需要查询的数组
 * @param {Any|Function} condition 查询项或查询函数，查询函数有两个参数，第一个参数为数组元素，第二个参数为数组索引值，function (item, position)。
 * @param {number} [position] 查询的起始位索引位置
 * @see baidu.array.find,baidu.array.lastIndexOf
 *             
 * @returns {number} 指定元素的索引位置，查询不到时返回-1
 */
baidu.array.indexOf = function (source, condition, position) {
    var len = source.length,
        iterator = condition;
        
    // 参考ecma262的String.prototype.indexOf实现
    // 为undefined时归0，否则进行ToInteger(参见ecma262 3rd 9.4)
    position = Number(position) || 0;
    position = position < 0 ? Math.ceil(position) : Math.floor(position); 
    position = Math.min(Math.max(position, 0), len);
    
    if ('function' != typeof condition) {
        iterator = function (item) {
            return condition === item;
        };
    }
    
    for ( ; position < len; position++) {
        if (true === iterator.call(source, source[position], position)) {
            return position;
        }
    }
    
    return -1;
};
