/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/page/getHeight.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/03
 */

///import baidu.page;

/**
 * 获取页面高度
 * @name baidu.page.getHeight
 * @function
 * @grammar baidu.page.getHeight()
 * @see baidu.page.getWidth
 *             
 * @returns {number} 页面高度
 */
baidu.page.getHeight = function () {
    var doc = document,
        body = doc.body,
        html = doc.documentElement,
        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

    return Math.max(html.scrollHeight, body.scrollHeight, client.clientHeight);
};
