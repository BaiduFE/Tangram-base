/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/insertAfter.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */

///import baidu.dom._g;

/**
 * 将目标元素添加到基准元素之后
 * @name baidu.dom.insertAfter
 * @function
 * @grammar baidu.dom.insertAfter(newElement, existElement)
 * @param {HTMLElement|string} newElement 被添加的目标元素
 * @param {HTMLElement|string} existElement 基准元素
 * @meta standard
 * @see baidu.dom.insertBefore
 *             
 * @returns {HTMLElement} 被添加的目标元素
 */
baidu.dom.insertAfter = function (newElement, existElement) {
    var g, existParent;
    g = baidu.dom._g;
    newElement = g(newElement);
    existElement = g(existElement);
    existParent = existElement.parentNode;
    
    if (existParent) {
        existParent.insertBefore(newElement, existElement.nextSibling);
    }
    return newElement;
};
