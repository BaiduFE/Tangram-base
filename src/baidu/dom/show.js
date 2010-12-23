/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/show.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */

///import baidu.dom.g;

/**
 * 显示目标元素
 * @name baidu.dom.show
 * @function
 * @grammar baidu.dom.show(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @remark
 * 如果在CSS中定义的样式是display:none，将无法实现
 * @shortcut show
 * @meta standard
 * @see baidu.dom.hide,baidu.dom.toggle
 *             
 * @returns {HTMLElement} 目标元素
 */
baidu.dom.show = function (element) {
    element = baidu.dom.g(element);
    element.style.display = "";

    return element;
};

// 声明快捷方法
baidu.show = baidu.dom.show;
