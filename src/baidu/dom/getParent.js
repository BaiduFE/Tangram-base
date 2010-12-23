
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All right reserved.
 * 
 * path: baidu/dom/getParent.js
 * author: berg
 * version: 1.0.0
 * date: 2010/12/02
 */

///import baidu.dom._g;

/**
 * 获得元素的父节点
 * @name baidu.dom.getParent
 * @function
 * @grammar baidu.dom.getParent(element)
 * @param {HTMLElement|string} element   目标元素或目标元素的id
 * @return {HTMLElement|null} 父元素，如果找不到父元素，返回null
 */
baidu.dom.getParent = function (element) {
    element = baidu.dom._g(element);
    //parentElement在IE下准确，parentNode在ie下可能不准确
    return element.parentElement || element.parentNode || null;
};
