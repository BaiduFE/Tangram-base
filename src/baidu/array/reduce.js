/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

///import baidu.array;

/**
 * 遍历数组中所有元素，将每一个元素应用方法进行合并，并返回合并后的结果。
 * @name baidu.array.reduce
 * @function
 * @grammar baidu.array.reduce(source, iterator, initializer)
 * @param {Array}    source      需要遍历的数组.
 * @param {Function} iterator    对每个数组元素进行处理的函数.
 * @param {Object}   initializer 合并的初始项.
 * @return {Array} map后的数组.
 * @version 1.3.4
 * @author cat
 * @see baidu.array.map
 */
baidu.array.reduce = function(source, iterator, initializer) {
    var result = initializer,
        i = 0,
        l = source.length;
    for (; i < l; i++) {
        result = iterator(result, source[i]);
    }
    return result;
};
