/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

///import baidu.array;

/**
 * 判断一个数组中是否有部分元素满足给定条件
 * @name baidu.array.some
 * @function
 * @grammar baidu.array.some(source, iterator)
 * @param {Array} source 需要判断的数组.
 * @param {Function} iterator 判断函数.
 * @return {boolean} 判断结果.
 * @see baidu.array.every
 * @author berg
 */
baidu.array.some = function(source, iterator) {
    var i = 0,
        len = source.length;
    for (; i < len; i++) {
        if (iterator.call(source, source[i], i)) {
            return true;
        }
    }
    return false;
};
