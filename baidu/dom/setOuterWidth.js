/*
 * Tangram
 * Copyright 2009 Baidu, Inc. All rights reserved.
 * 
 * path: baidu/dom/setOuterWidth.js
 * author: berg
 * version: 1.0
 * date: 2010/12/15
 */

///import baidu.dom;
///import baidu.dom.setOuter;

/**
 * 设置元素的outerWidth
 * 
 * @name baidu.dom.setOuterWidth
 * @function
 * @grammar baidu.dom.setOuterWidth(element, width)
 * 
 * @param {HTMLElement|string} 	element DOM元素或元素的id
 * @param {number|string} 		width 	要设置的width
 *
 * @return {HTMLElement}  设置好的元素
 */
baidu.dom.setOuterWidth = function (element, width) {
    return baidu.dom.setOuter(element, {width : width});
};
