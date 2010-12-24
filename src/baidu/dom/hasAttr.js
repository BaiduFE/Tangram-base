/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/hasAttr.js
 * author: berg
 * version: 1.0
 * date: 2010/07/16 
 */

///import baidu.dom.g;

/**
 * 查询一个元素是否包含指定的属性
 * @name baidu.dom.hasAttr
 * @function
 * @grammar baidu.dom.hasAttr(element, name)
 * @param {DOMElement|string} element DOM元素或元素的id
 * @param {string} name 要查找的属性名
 * @version 1.3
 *             
 * @returns {Boolean} 是否包含此属性        
 */

baidu.dom.hasAttr = function (element, name){
    element = baidu.g(element);
    var attr = element.attributes.getNamedItem(name);
    return !!( attr && attr.specified );
};
