/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

///import baidu.array;

/**
 * 判断一个数组中是否所有元素都满足给定条件
 * @name baidu.array.every
 * @function
 * @grammar baidu.array.every(source, iterator)
 * @param {Array} source 需要判断的数组.
 * @param {Function} iterator 判断函数.
 * @return {boolean} 判断结果.
 * @see baidu.array.some
 * @author berg
 */
baidu.array.every = function(source, iterator) {
    var i = 0,
        len = source.length;
    for (; i < len; i++) {
        if (!iterator.call(source, source[i], i)) {
            return false;
        }
    }
    return true;
};
