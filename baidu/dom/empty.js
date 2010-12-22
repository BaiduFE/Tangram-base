/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/empty.js
 * author: berg
 * version: 1.0
 * date: 2010-07-06
 */

/**
 * 删除一个节点下面的所有子节点。
 * @name baidu.dom.empty
 * @function
 * @grammar baidu.dom.empty(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @version 1.3
 *             
 * @returns {HTMLElement} 目标元素
        
 */
///import baidu.dom;
///import baidu.dom.g;

baidu.dom.empty = function (element) {
    element = baidu.dom.g(element);
    
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
    //todo：删除元素上绑定的事件等?

    return element;
};
