/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/isDate.js
 * author: berg
 * version: 1.0.0
 * date: 2010/10/12 
 */

///import baidu.lang;

/**
 * 判断目标参数是否为Date对象
 * @name baidu.lang.isDate
 * @function
 * @grammar baidu.lang.isDate(source)
 * @param {Any} source 目标参数
 * @version 1.3
 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isBoolean,baidu.lang.isElement
 *             
 * @returns {boolean} 类型判断结果
 */
baidu.lang.isDate = function(o) {
    // return o instanceof Date;
    return {}.toString.call(o) === "[object Date]" && o.toString() !== 'Invalid Date' && !isNaN(o);
};
