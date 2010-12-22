/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/isStrict.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */

///import baidu.browser;

/**
 * @property isStrict 判断是否严格标准的渲染模式
 * @grammar baidu.browser.isStrict
 * @meta standard
 */
baidu.browser.isStrict = document.compatMode == "CSS1Compat";
