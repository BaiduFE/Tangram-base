/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/setStyles.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/18
 */

///import baidu.dom.g;
///import baidu.dom.setStyle;

/**
 * 批量设置目标元素的style样式值
 * @name baidu.dom.setStyles
 * @function
 * @grammar baidu.dom.setStyles(element, styles)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {Object} styles 要设置的样式集合
 * @shortcut setStyles
 * @meta standard
 * @see baidu.dom.setStyle,baidu.dom.getStyle
 *             
 * @returns {HTMLElement} 目标元素
 */
baidu.dom.setStyles = function (element, styles) {
    element = baidu.dom.g(element);

    for (var key in styles) {
        baidu.dom.setStyle(element, key, styles[key]);
    }

    return element;
};

// 声明快捷方法
baidu.setStyles = baidu.dom.setStyles;