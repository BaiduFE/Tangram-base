/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/maxthon.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */

///import baidu.browser;

try {
    if (/(\d+\.\d)/.test(external.max_version)) {
/**
 * 判断是否为maxthon浏览器
 * @property maxthon maxthon版本号
 * @grammar baidu.browser.maxthon
 * @see baidu.browser.ie  
 */
        baidu.browser.maxthon = parseFloat(RegExp['\x241']);
    }
} catch (e) {}
