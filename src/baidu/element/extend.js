
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/element/extend.js
 * author: berg
 * version: 1.0.0
 * date: 2010/12/16
 */

///import baidu.element;

///import baidu.object.each;
///import baidu.fn.wrapReturnValue;
///import baidu.fn.methodize;

 /**
 * 为element对象扩展一个方法。
 * @name baidu.element.extend
 * @function
 * @grammar baidu.element.extend(json)
 * @param {Object} json 要扩展的方法名以及方法
 * @version 1.3
 * @shortcut e
 * @returns {baidu.element.Element} Element对象
 *
 */
baidu.element.extend = function(json){
    var e = baidu.element;
    baidu.object.each(json, function(item, key){
        e.Element.prototype[key] = baidu.element._toChainFunction(item, -1);
    });
};
