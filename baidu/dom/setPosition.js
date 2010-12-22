
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/setPosition.js
 * author: berg
 * version: 1.0.0
 * date: 2010/12/14
 */

///import baidu.dom;
///import baidu.dom._g;

///import baidu.dom.getStyle;
///import baidu.dom.setStyles;

///import baidu.dom._styleFilter.px;

/**
 * 设置目标元素的top和left值到用户指定的位置
 * 
 * @name baidu.dom.setPosition
 * @function
 * @grammar baidu.dom.setPosition(element, position)
 * 
 * @param {HTMLElement|string}	element 	目标元素或目标元素的id
 * @param {object} 				position 	位置对象 {top: {number}, left : {number}}
 *
 * @return {HTMLElement}  进行设置的元素
 */
baidu.dom.setPosition = function (element, position) {
    return baidu.dom.setStyles(element, {
        left : position.left - parseFloat(baidu.dom.getStyle(element, "margin-left")) || 0,
        top : position.top - parseFloat(baidu.dom.getStyle(element, "margin-top")) || 0
    });
};
