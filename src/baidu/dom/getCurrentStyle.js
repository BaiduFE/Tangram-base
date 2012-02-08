/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * author: meizz
 * create: 20111204
 */

///import baidu.dom.g;
///import baidu.dom.getComputedStyle;

/**
 * 获取目标元素的 currentStyle 值，兼容非IE浏览器
 * 某些样式名称或者值需要hack的话，需要别外处理！
 * @author meizz
 * @name baidu.dom.getCurrentStyle
 * @function
 * @grammar baidu.dom.currentStyle(element, key)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} key 要获取的样式名
 *
 * @see baidu.dom.getStyle
 *             
 * @returns {string} 目标元素的computed style值
 */

baidu.dom.getCurrentStyle = function(element, key){
    element = baidu.dom.g(element);

    return element.style[key] ||
        (element.currentStyle ? element.currentStyle[key] : "") || 
        baidu.dom.getComputedStyle(element, key);
};
