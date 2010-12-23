/*
 * Tangram
 * Copyright 2009 Baidu Inc. All right reserved.
 * 
 * path: baidu/dom/_styleFixer/float.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */
///import baidu.dom._styleFixer;
///import baidu.browser.ie;

/**
 * 提供给setStyle与getStyle使用
 */
baidu.dom._styleFixer["float"] = baidu.browser.ie ? "styleFloat" : "cssFloat";
