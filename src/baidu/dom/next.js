/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/next.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/18
 */

///import baidu.dom._matchNode;

/**
 * 获取目标元素的下一个兄弟元素节点
 * @name baidu.dom.next
 * @function
 * @grammar baidu.dom.next(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @see baidu.dom.first,baidu.dom.last,baidu.dom.prev
 * @meta standard
 * @returns {HTMLElement|null} 目标元素的下一个兄弟元素节点，查找不到时返回null
 */
baidu.dom.next = function (element) {
    return baidu.dom._matchNode(element, 'nextSibling', 'nextSibling');
};
