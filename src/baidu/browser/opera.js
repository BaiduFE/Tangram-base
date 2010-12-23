/*
 * Tangram
 * Copyright 2009 Baidu, Inc. All rights reserved.
 * 
 * path: baidu/browser/opera.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */

///import baidu.browser;

if (/opera\/(\d+\.\d)/i.test(navigator.userAgent)) {
/**
 * 判断是否为opera浏览器
 * @property opera opera版本号
 * @grammar baidu.browser.opera
 * @meta standard
 * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.safari,baidu.browser.chrome 
 */
    baidu.browser.opera = parseFloat(RegExp['\x241']);
}
