/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

///import baidu.dom;
///import baidu.dom.setBorderBoxSize;

/**
 * 按照border-box模型设置元素的width值
 * 
 * @author berg
 * @name baidu.dom.setBorderBoxWidth
 * @function
 * @grammar baidu.dom.setBorderBoxWidth(element, width)
 * 
 * @param {HTMLElement|string} 	element DOM元素或元素的id
 * @param {number|string} 		width 	要设置的width
 *
 * @return {HTMLElement}  设置好的元素
 * @see baidu.dom.setBorderBoxHeight, baidu.dom.setBorderBoxSize
 * @shortcut dom.setOuterWidth
 */
baidu.dom.setOuterWidth = 
baidu.dom.setBorderBoxWidth = function (element, width) {
    return baidu.dom.setBorderBoxSize(element, {width : width});
};
