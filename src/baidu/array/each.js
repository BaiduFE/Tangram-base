
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/array/each.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/02
 */

///import baidu.array;

/**
 * 遍历数组中所有元素
 * @name baidu.array.each
 * @function
 * @grammar baidu.array.each(source, iterator)
 * @param {Array} source 需要遍历的数组
 * @param {Function} iterator 对每个数组元素进行调用的函数，该函数有两个参数，第一个为数组元素，第二个为数组索引值，function (item, index)。
 * @remark
 * each方法不支持对Object的遍历,对Object的遍历使用baidu.object.each 。
 * @shortcut each
 * @meta standard
 *             
 * @returns {Array} 遍历的数组
 */
 
baidu.array.each = function (source, iterator) {
    var returnValue, item, i, len = source.length;
    
    if ('function' == typeof iterator) {
        for (i = 0; i < len; i++) {
            item = source[i];
            returnValue = iterator.call(source, item, i);
    
            if (returnValue === false) {
                break;
            }
        }
    }
    return source;
};

// 声明快捷方法
baidu.each = baidu.array.each;
