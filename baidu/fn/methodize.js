/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/fn/methodize.js
 * author: berg
 * version: 1.0.0
 * date: 2010/11/02 
 */

///import baidu.fn;

/**
 * 将一个静态函数变换成一个对象的方法，使其的第一个参数为this，或this[attr]
 * @name baidu.fn.methodize
 * @function
 * @grammar baidu.fn.methodize(func[, attr])
 * @param {Function}	func	要方法化的函数
 * @param {string}		[attr]	属性
 * @version 1.3
 * @returns {Function} 已方法化的函数
 */
baidu.fn.methodize = function (func, attr) {
    return function(){
        return func.apply(this, [(attr ? this[attr] : this)].concat([].slice.call(arguments)));
    };
};
