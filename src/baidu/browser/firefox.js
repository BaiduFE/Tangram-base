/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/firefox.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */

///import baidu.browser;

if (/firefox\/(\d+\.\d)/i.test(navigator.userAgent)) {
/**
 * 判断是否为firefox浏览器
 * @property firefox firefox版本号
 * @grammar baidu.browser.firefox
 * @meta standard
 * @see baidu.browser.ie,baidu.browser.safari,baidu.browser.opera,baidu.browser.chrome   
 */
    baidu.browser.firefox = parseFloat(RegExp['\x241']);
}
