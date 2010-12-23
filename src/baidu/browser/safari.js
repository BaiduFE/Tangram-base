/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/safari.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */

///import baidu.browser;

if ((/(\d+\.\d)(\.\d)?\s+safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent))) {
/**
 * 判断是否为safari浏览器
 * @property safari safari版本号
 * @grammar baidu.browser.safari
 * @meta standard
 * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.opera,baidu.browser.chrome   
 */
    baidu.browser.safari = parseFloat(RegExp['\x241']);
}
