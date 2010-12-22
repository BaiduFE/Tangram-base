/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/insertBefore.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/11/17
 */

///import baidu.dom._g;

/**
 * 将目标元素添加到基准元素之前
 * @name baidu.dom.insertBefore
 * @function
 * @grammar baidu.dom.insertBefore(newElement, existElement)
 * @param {HTMLElement|string} newElement 被添加的目标元素
 * @param {HTMLElement|string} existElement 基准元素
 * @meta standard
 * @see baidu.dom.insertAfter
 *             
 * @returns {HTMLElement} 被添加的目标元素
 */
baidu.dom.insertBefore = function (newElement, existElement) {
    var g, existParent;
    g = baidu.dom._g;
    newElement = g(newElement);
    existElement = g(existElement);
    existParent = existElement.parentNode;

    if (existParent) {
        existParent.insertBefore(newElement, existElement);
    }

    return newElement;
};
