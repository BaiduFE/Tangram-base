/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/last.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/18
 */

///import baidu.dom._matchNode;

/**
 * 获取目标元素的最后一个元素节点
 * @name baidu.dom.last
 * @function
 * @grammar baidu.dom.last(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @see baidu.dom.first,baidu.dom.prev,baidu.dom.next
 *             
 * @returns {HTMLElement|null} 目标元素的最后一个元素节点，查找不到时返回null
 */
baidu.dom.last = function (element) {
    return baidu.dom._matchNode(element, 'previousSibling', 'lastChild');
};
