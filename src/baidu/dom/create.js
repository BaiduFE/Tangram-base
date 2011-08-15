/*
 * Tangram
 * Copyright 2009 Baidu Inc. All right reserved.
 */
///import baidu.dom.setAttrs;

/**
 * 创建 Element 对象。
 * @author berg
 * @name baidu.dom.create
 * @function
 * @grammar baidu.dom.create(tagName[, options])
 * @param {string} tagName 标签名称.
 * @param {Object} opt_attributes 元素创建时拥有的属性，如style和className.
 * @version 1.3
 * @meta standard
 * @returns {HTMLElement} 创建的 Element 对象
 */
baidu.dom.create = function(tagName, opt_attributes) {
    var el = document.createElement(tagName),
        attributes = opt_attributes || {};
    return baidu.dom.setAttrs(el, attributes);
};
