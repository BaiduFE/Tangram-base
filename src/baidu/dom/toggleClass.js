/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/toggleClass.js
 * author: berg
 * version: 1.0
 * date: 2010-07-06
 */

/**
 * 添加或者删除一个节点中的指定class，如果已经有就删除，否则添加
 * @name baidu.dom.toggleClass
 * @function
 * @grammar baidu.dom.toggleClass(element, className)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {String} className 指定的className。允许同时添加多个class，中间使用空白符分隔
 * @version 1.3
 * @remark
 * 
 * 传入多个class时，只要其中有一个class不在当前元素中，则添加所有class，否则删除所有class。
 */
///import baidu.dom;
///import baidu.dom.addClass;
///import baidu.dom.removeClass;
///import baidu.dom.hasClass;

baidu.dom.toggleClass = function (element, className) {
    if(baidu.dom.hasClass(element, className)){
        baidu.dom.removeClass(element, className);
    }else{
        baidu.dom.addClass(element, className);
    }
};
