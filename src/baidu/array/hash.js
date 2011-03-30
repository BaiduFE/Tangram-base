/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

///import baidu.array;

/**
 * 将两个数组参数合并成一个类似hashMap结构的对象，这个对象使用第一个数组做为key，使用第二个数组做为值，如果第二个参数未指定，则把对象的所有值置为true。
 * @name baidu.array.hash
 * @function
 * @grammar baidu.array.hash(keys[, values])
 * @param {Array} keys 作为key的数组
 * @param {Array} [values] 作为value的数组，未指定此参数时，默认值将对象的值都设为true。
 *             
 * @returns {Object} 合并后的对象{key : value}
 */
baidu.array.hash = function(keys, values) {
    var o = {}, vl = values && values.length, i = 0, l = keys.length;
    for (; i < l; i++) {
        o[keys[i]] = (vl && vl > i) ? values[i] : true;
    }
    return o;
};

