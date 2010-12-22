
/*
 * Tangram
 * Copyright 2009 Baidu, Inc. All rights reserved.
 * 
 * path: baidu/dom/setOuterHeight.js
 * author: berg
 * version: 1.0
 * date: 2010/12/15
 */

///import baidu.dom;
///import baidu.dom.setOuter;

/**
 * 设置元素的outerHeight
 * @name baidu.dom.setOuterHeight
 * @function
 * @grammar baidu.dom.setOuterHeight(element, height)
 * @param {HTMLElement|string} element DOM元素或元素的id
 * @param {number|string} height 要设置的height
 * @return {HTMLElement}  设置好的元素
 */
baidu.dom.setOuterHeight = function (element, height) {
    return baidu.dom.setOuter(element, {height : height});
};
