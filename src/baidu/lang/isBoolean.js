/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/isBoolean.js
 * author: berg
 * version: 1.0.0
 * date: 2010/10/12
 */

///import baidu.lang;

/**
 * 判断目标参数是否Boolean对象
 * @name baidu.lang.isBoolean
 * @function
 * @grammar baidu.lang.isBoolean(source)
 * @param {Any} source 目标参数
 * @version 1.3
 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isElement,baidu.lang.isArray,baidu.lang.isDate
 *             
 * @returns {boolean} 类型判断结果
 */
baidu.lang.isBoolean = function(o) {
    return typeof o === 'boolean';
};
