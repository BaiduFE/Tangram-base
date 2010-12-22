/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/array/map.js
 * author: berg
 * version: 1.1.0
 * date: 2010/12/14
 */

///import baidu.array;

/**
 * 遍历数组中所有元素，将每一个元素应用方法进行转换，并返回转换后的新数组。
 * @name baidu.array.map
 * @function
 * @grammar baidu.array.map(source, iterator)
 * @param {Array}    source   需要遍历的数组
 * @param {Function} iterator 对每个数组元素进行处理的函数
 * @return {Array} map后的数组
 */
baidu.array.map = function (source, iterator) {
    var results = [],
        i = 0,
        l = source.length ;
    for (; i < l; i++){
        results[i] = iterator(source[i], i);
    }
    return results;
};
