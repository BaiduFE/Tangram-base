/*
 * Tangram
 * Copyright 2009 Baidu Inc. All right reserved.
 * 
 * path: baidu/dom/create.js
 * author: berg
 * version: 1.0.0
 * date: 2010/08/10 
 */
///import baidu.dom.setAttrs;

/**
 * 创建 Element 对象。
 * @name baidu.dom.create
 * @function
 * @grammar baidu.dom.create(tagName[, options])
 * @param {string} tagName 标签名称
 * @param {Object} [options] 元素创建时的选项
				
 * @config {string} [style] 样式文本
 * @config {string} [className] 样式名称
 * @version 1.3
 *             
 * @returns {HTMLElement} 创建的 Element 对象
        
 */
baidu.dom.create = function (tagName, options) {
    options = options || {};
    var el = document.createElement(tagName);
    return baidu.dom.setAttrs(el, options);
};
