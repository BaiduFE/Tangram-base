/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getAncestorByTag.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */

///import baidu.dom.g;

/**
 * 获取目标元素指定标签的最近的祖先元素
 * @name baidu.dom.getAncestorByTag
 * @function
 * @grammar baidu.dom.getAncestorByTag(element, tagName)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} tagName 祖先元素的标签名
 * @see baidu.dom.getAncestorBy,baidu.dom.getAncestorByClass
 *             
 * @returns {HTMLElement|null} 指定标签的最近的祖先元素，查找不到时返回null
 */
baidu.dom.getAncestorByTag = function (element, tagName) {
    element = baidu.dom.g(element);
    tagName = tagName.toUpperCase();

    while ((element = element.parentNode) && element.nodeType == 1) {
        if (element.tagName == tagName) {
            return element;
        }
    }

    return null;
};
