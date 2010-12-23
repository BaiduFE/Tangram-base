/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/intersect.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/12/02
 */

///import baidu.dom.g;
///import baidu.dom.getPosition;

/**
 * 检查两个元素是否相交
 * @name baidu.dom.intersect
 * @function
 * @grammar baidu.dom.intersect(element1, element2)
 * @param {HTMLElement|string} element1 要检查的元素或元素的id
 * @param {HTMLElement|string} element2 要检查的元素或元素的id
 * @see baidu.dom.contains
 *             
 * @returns {boolean} 两个元素是否相交的检查结果
 */
baidu.dom.intersect = function (element1, element2) {
    var g = baidu.dom.g, 
        getPosition = baidu.dom.getPosition, 
        max = Math.max, 
        min = Math.min;

    element1 = g(element1);
    element2 = g(element2);

    var pos1 = getPosition(element1),
        pos2 = getPosition(element2);

    return max(pos1.left, pos2.left) <= min(pos1.left + element1.offsetWidth, pos2.left + element2.offsetWidth)
        && max(pos1.top, pos2.top) <= min(pos1.top + element1.offsetHeight, pos2.top + element2.offsetHeight);
};
