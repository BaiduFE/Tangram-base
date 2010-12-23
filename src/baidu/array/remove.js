/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/array/remove.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/30
 */

///import baidu.array;

/**
 * 移除数组中的项
 * @name baidu.array.remove
 * @function
 * @grammar baidu.array.remove(source, condition)
 * @param {Array} source 需要移除项的数组
 * @param {Any|Function} condition 要移除的项或移除匹配函数
 * @remark
 * condition如果是Function类型，则会按function (item, index)方式调用判断，函数需要返回true或false。如果要移除Function类型的项，请传入自定义的判断函数。
 * @meta standard
 * @see baidu.array.removeAt
 *             
 * @returns {Array} 移除后的数组
 */
baidu.array.remove = function (source, condition) {
    var len = source.length,
        iterator = condition;
    
    if ('function' != typeof condition) {
        iterator = function (item) {
            return condition === item;
        };
    }
    
    while (len--) {
        if (true === iterator.call(source, source[len], len)) {
            source.splice(len, 1);
        }
    }
    return source;
};
