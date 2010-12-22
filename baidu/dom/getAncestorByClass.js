/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getAncestorByClass.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */

///import baidu.dom.g;
///import baidu.string.trim;

/**
 * 获取目标元素指定元素className最近的祖先元素
 * @name baidu.dom.getAncestorByClass
 * @function
 * @grammar baidu.dom.getAncestorByClass(element, className)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} className 祖先元素的class，只支持单个class
 * @remark 使用者应保证提供的className合法性，不应包含不合法字符，className合法字符参考：http://www.w3.org/TR/CSS2/syndata.html。
 * @see baidu.dom.getAncestorBy,baidu.dom.getAncestorByTag
 *             
 * @returns {HTMLElement|null} 指定元素className最近的祖先元素，查找不到时返回null
 */
baidu.dom.getAncestorByClass = function (element, className) {
    element = baidu.dom.g(element);
    className = new RegExp("(^|\\s)" + baidu.string.trim(className) + "(\\s|\x24)");

    while ((element = element.parentNode) && element.nodeType == 1) {
        if (className.test(element.className)) {
            return element;
        }
    }

    return null;
};
