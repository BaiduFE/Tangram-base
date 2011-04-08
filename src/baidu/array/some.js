/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

///import baidu.array;

/**
 * 判断一个数组中是否有部分元素满足给定条件
 * @name baidu.array.some
 * @function
 * @grammar baidu.array.some(source, iterator[,thisObject])
 * @param {Array} source 需要判断的数组.
 * @param {Function} iterator 判断函数.
 * @param {Object} [thisObject] 函数调用时的this指针，如果没有此参数，默认是当前遍历的数组
 * @return {boolean} 判断结果.
 * @see baidu.array.every
 */
baidu.array.some = function(source, iterator, thisObject) {
    var i = 0,
        len = source.length;
    for (; i < len; i++) {
        if (i in source && iterator.call(thisObject || source, source[i], i)) {
            return true;
        }
    }
    return false;
};
