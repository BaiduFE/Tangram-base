/**
 * 获取横向滚动量
 * @name baidu.page.getScrollLeft
 * @function
 * @grammar baidu.page.getScrollLeft()
 * @see baidu.page.getScrollTop
 *             
 * @returns {number} 横向滚动量
 */
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/page/getScrollLeft.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/17
 */

///import baidu.page;

/**
 * 获取横向滚动量
 * 
 * @return {number} 横向滚动量
 */
baidu.page.getScrollLeft = function () {
    var d = document;
    return window.pageXOffset || d.documentElement.scrollLeft || d.body.scrollLeft;
};
