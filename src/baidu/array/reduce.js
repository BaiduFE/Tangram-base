/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

///import baidu.array;

/**
 * 遍历数组中所有元素，将每一个元素应用方法进行合并，并返回合并后的结果。
 * @name baidu.array.reduce
 * @function
 * @grammar baidu.array.reduce(source, iterator[, initializer])
 * @param {Array}    source 需要遍历的数组.
 * @param {Function} iterator 对每个数组元素进行处理的函数，函数接受四个参数：上一次reduce的结果（或初始值），当前元素值，索引值，整个数组.
 * @param {Object}   [initializer] 合并的初始项，如果没有此参数，默认用数组中的第一个值作为初始值.
 * @return {Array} reduce后的值.
 * @version 1.3.4
 * @see baidu.array.reduce
 */
baidu.array.reduce = function(source, iterator, initializer) {
    var i = 0,
        l = source.length,
        found = 0;

    if( arguments.length < 3){
        //没有initializer的情况，找到第一个可用的值
        for(; i < l; i++){
            initializer = source[i++];
            found = 1;
            break;
        }
        if(!found){
            return ;
        }
    }

    for (; i < l; i++) {
        if( i in source){
            initializer = iterator(initializer, source[i] , i , source);
        }
    }
    return initializer;
};
