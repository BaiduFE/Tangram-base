/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/chrome.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/24
 */

///import baidu.browser;
if (/chrome\/(\d+\.\d)/i.test(navigator.userAgent)) {
/**
 * 判断是否为chrome浏览器
 * @grammar baidu.browser.chrome
 * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.safari,baidu.browser.opera   
 * @property chrome chrome版本号
 */
    baidu.browser.chrome = + RegExp['\x241'];
}
