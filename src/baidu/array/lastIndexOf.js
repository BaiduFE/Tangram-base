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
 * @grammar baidu.array.lastIndexOf(source, match)
 * @param {Array} source 需要查询的数组
 * @param {Any} match 查询项
 * @param {number} [fromIndex] 查询的起始位索引位置，如果为负数，则从source.length+fromIndex往前开始查找
 * @see baidu.array.indexOf
 *             
 * @returns {number} 指定元素的索引位置，查询不到时返回-1
 */

baidu.array.lastIndexOf = function (source, match, fromIndex) {
    var len = source.length;

    fromIndex = fromIndex | 0;

    if(!fromIndex || fromIndex >= len){
        fromIndex = len - 1;
    }
    if(fromIndex < 0){
        fromIndex += len;
    }
    for(; fromIndex >= 0; fromIndex --){
        if(fromIndex in source && source[fromIndex] === match){
            return fromIndex;
        }
    }
    
    return -1;
};
