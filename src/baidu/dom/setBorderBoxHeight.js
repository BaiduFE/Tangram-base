/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

///import baidu.dom;
///import baidu.dom.setBorderBoxSize;

/**
 * 按照border-box模型设置元素的height值
 * 
 * @author berg
 * @name baidu.dom.setBorderBoxHeight
 * @function
 * @grammar baidu.dom.setBorderBoxHeight(element, height)
 * 
 * @param {HTMLElement|string} element DOM元素或元素的id
 * @param {number|string} height 要设置的height
 *
 * @return {HTMLElement}  设置好的元素
 * @see baidu.dom.setBorderBoxWidth, baidu.dom.setBorderBoxSize
 * @shortcut dom.setOuterHeight
 */
baidu.dom.setOuterHeight = 
baidu.dom.setBorderBoxHeight = function (element, height) {
    return baidu.dom.setBorderBoxSize(element, {height : height});
};
