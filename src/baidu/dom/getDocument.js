/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getDocument.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */

///import baidu.dom.g;

/**
 * 获取目标元素所属的document对象
 * @name baidu.dom.getDocument
 * @function
 * @grammar baidu.dom.getDocument(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @meta standard
 * @see baidu.dom.getWindow
 *             
 * @returns {HTMLDocument} 目标元素所属的document对象
 */
baidu.dom.getDocument = function (element) {
    element = baidu.dom.g(element);
    return element.nodeType == 9 ? element : element.ownerDocument || element.document;
};
