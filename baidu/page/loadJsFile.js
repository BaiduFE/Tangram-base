/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/page/loadJsFile.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/20
 */

///import baidu.page;

/**
 * 动态在页面上加载一个外部js文件
 * @name baidu.page.loadJsFile
 * @function
 * @grammar baidu.page.loadJsFile(path)
 * @param {string} path js文件路径
 * @see baidu.page.loadCssFile
 */
baidu.page.loadJsFile = function (path) {
    var element = document.createElement('script');

    element.setAttribute('type', 'text/javascript');
    element.setAttribute('src', path);
    element.setAttribute('defer', 'defer');

    document.getElementsByTagName("head")[0].appendChild(element);    
};