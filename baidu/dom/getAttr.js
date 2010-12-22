/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getAttr.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */

///import baidu.dom.g;
///import baidu.dom._NAME_ATTRS;

/**
 * 获取目标元素的属性值
 * @name baidu.dom.getAttr
 * @function
 * @grammar baidu.dom.getAttr(element, key)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} key 要获取的attribute键名
 * @shortcut getAttr
 * @meta standard
 * @see baidu.dom.setAttr,baidu.dom.setAttrs
 *             
 * @returns {string|null} 目标元素的attribute值，获取不到时返回null
 */
baidu.dom.getAttr = function (element, key) {
    element = baidu.dom.g(element);

    if ('style' == key){
        return element.style.cssText;
    }

    key = baidu.dom._NAME_ATTRS[key] || key;
    return element.getAttribute(key);
};

// 声明快捷方法
baidu.getAttr = baidu.dom.getAttr;
