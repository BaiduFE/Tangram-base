/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/ie.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */

///import baidu.browser;
if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
    //IE 8下，以documentMode为准
    //在百度模板中，可能会有$，防止冲突，将$1 写成 \x241
/**
 * 判断是否为ie浏览器
 * @name baidu.browser.ie
 * @field
 * @grammar baidu.browser.ie
 * @returns {Number} IE版本号
 */
   baidu.browser.ie = baidu.ie = document.documentMode || + RegExp['\x241'];
}
