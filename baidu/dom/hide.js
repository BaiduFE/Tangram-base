/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/hide.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */

///import baidu.dom.g;

/**
 * 隐藏目标元素
 * @name baidu.dom.hide
 * @function
 * @grammar baidu.dom.hide(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @shortcut hide
 * @meta standard
 * @see baidu.dom.show,baidu.dom.toggle
 *             
 * @returns {HTMLElement} 目标元素
 */
baidu.dom.hide = function (element) {
    element = baidu.dom.g(element);
    element.style.display = "none";

    return element;
};

// 声明快捷方法
baidu.hide = baidu.dom.hide;
