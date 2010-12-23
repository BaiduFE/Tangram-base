/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/first.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/11/18
 */

///import baidu.dom._matchNode;

/**
 * 获取目标元素的第一个元素节点
 * @name baidu.dom.first
 * @function
 * @grammar baidu.dom.first(element)
 * @param {HTMLElement|String} element 目标元素或目标元素的id
 * @see baidu.dom.last,baidu.dom.prev,baidu.dom.next
 *             
 * @returns {HTMLElement|null} 目标元素的第一个元素节点，查找不到时返回null
 */
baidu.dom.first = function (element) {
    return baidu.dom._matchNode(element, 'nextSibling', 'firstChild');
};
