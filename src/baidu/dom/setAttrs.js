/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/setAttrs.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */

///import baidu.dom.g;
///import baidu.dom.setAttr;

/**
 * 批量设置目标元素的attribute值
 * @name baidu.dom.setAttrs
 * @function
 * @grammar baidu.dom.setAttrs(element, attributes)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {Object} attributes 要设置的attribute集合
 * @shortcut setAttrs
 * @meta standard
 * @see baidu.dom.setAttr,baidu.dom.getAttr
 *             
 * @returns {HTMLElement} 目标元素
 */
baidu.dom.setAttrs = function (element, attributes) {
    element = baidu.dom.g(element);

    for (var key in attributes) {
        baidu.dom.setAttr(element, key, attributes[key]);
    }

    return element;
};

// 声明快捷方法
baidu.setAttrs = baidu.dom.setAttrs;