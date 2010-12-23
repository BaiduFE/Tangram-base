/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getWindow.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */

///import baidu.dom.g;
///import baidu.dom.getDocument;

/**
 * 获取目标元素所属的window对象
 * @name baidu.dom.getWindow
 * @function
 * @grammar baidu.dom.getWindow(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @see baidu.dom.getDocument
 *             
 * @returns {window} 目标元素所属的window对象
 */
baidu.dom.getWindow = function (element) {
    element = baidu.dom.g(element);
    var doc = baidu.dom.getDocument(element);
    
    // 没有考虑版本低于safari2的情况
    // @see goog/dom/dom.js#goog.dom.DomHelper.prototype.getWindow
    return doc.parentWindow || doc.defaultView || null;
};
