/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/isFunction.js
 * author: rocy
 * version: 1.1.2
 * date: 2010/06/12
 */

///import baidu.lang;

/**
 * 判断目标参数是否为function或Function实例
 * @name baidu.lang.isFunction
 * @function
 * @grammar baidu.lang.isFunction(source)
 * @param {Any} source 目标参数
 * @version 1.2
 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isElement,baidu.lang.isBoolean,baidu.lang.isDate
 *             
 * @returns {boolean} 类型判断结果
 */
baidu.lang.isFunction = function (source) {
	// chrome下,'function' == typeof /a/ 为true.
    return '[object Function]' == Object.prototype.toString.call(source);
};
