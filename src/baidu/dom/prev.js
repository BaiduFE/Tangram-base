/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/prev.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/18
 */

///import baidu.dom._matchNode;

/**
 * 获取目标元素的上一个兄弟元素节点
 * @name baidu.dom.prev
 * @function
 * @grammar baidu.dom.prev(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @see baidu.dom.first,baidu.dom.last,baidu.dom.next
 *             
 *             
 * @returns {HTMLElement|null} 目标元素的上一个兄弟元素节点，查找不到时返回null
 */
baidu.dom.prev = function (element) {
    return baidu.dom._matchNode(element, 'previousSibling', 'previousSibling');
};
