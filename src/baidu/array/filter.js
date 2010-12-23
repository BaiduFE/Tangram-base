
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/array/filter.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/02
 */

///import baidu.array;

/**
 * 从数组中筛选符合条件的元素
 * @name baidu.array.filter
 * @function
 * @grammar baidu.array.filter(source, iterator)
 * @param {Array} source 需要筛选的数组
 * @param {Function} iterator 对每个数组元素进行筛选的函数，该函数有两个参数，第一个为数组元素，第二个为数组索引值，function (item, index)，函数需要返回true或false
 * @meta standard
 * @see baidu.array.find
 *             
 * @returns {Array} 符合条件的数组项集合
 */

baidu.array.filter = function (source, iterator) {
    var result = [],
        resultIndex = 0,
        len = source.length,
        item,
        i;
    
    if ('function' == typeof iterator) {
        for (i = 0; i < len; i++) {
            item = source[i];
            if (true === iterator.call(source, item, i)) {
                // resultIndex用于优化对result.length的多次读取
                result[resultIndex++] = item;
            }
        }
    }
    
    return result;
};
