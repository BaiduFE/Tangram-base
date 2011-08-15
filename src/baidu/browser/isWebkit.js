/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/isWebkit.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */

///import baidu.browser;

/**
 * 判断是否为webkit内核
 * @property isWebkit 
 * @grammar baidu.browser.isWebkit
 * @meta standard
 * @see baidu.browser.isGecko
 * @returns {Boolean} 布尔值
 */
baidu.browser.isWebkit = /webkit/i.test(navigator.userAgent);
