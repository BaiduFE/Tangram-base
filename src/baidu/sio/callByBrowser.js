/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/sio/callByBrowser.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/16
 */

///import baidu.sio;
///import baidu.sio._removeScriptTag;

/**
 * 通过script标签加载数据，加载完成由浏览器端触发回调
 * @name baidu.sio.callByBrowser
 * @function
 * @grammar baidu.sio.callByBrowser(url[, callback, options])
 * @param {string} url 加载数据的url
 * @param {Function} [callback] 数据加载结束时调用的函数
 * @param {Object} [options] 其他可选项
 * @config {String} [charset] script的字符集
 * @remark
 * 1、与callByServer不同，callback参数只支持Function类型，不支持string。
 * 2、如果请求了一个不存在的页面，onsuccess函数也可能被调用（在IE/opera下），因此使用者需要在onsuccess函数中判断数据是否正确加载。
 * @see baidu.sio.callByServer
 */
baidu.sio.callByBrowser = function (url, callback, options) {
    options = options || {};
    var scr = document.createElement("SCRIPT"),
        scriptLoaded = 0,
        attr,
        charset = options['charset'];
    
    // IE和opera支持onreadystatechange
    // safari、chrome、opera支持onload
    scr.onload = scr.onreadystatechange = function () {
        // 避免opera下的多次调用
        if (scriptLoaded) {
            return;
        }
        
        var readyState = scr.readyState;
        if ('undefined' == typeof readyState
            || readyState == "loaded"
            || readyState == "complete") {
            scriptLoaded = 1;
            try {
                ('function' == typeof callback) && callback();
            } finally {
                baidu.sio._removeScriptTag(scr);
            }
        }
    };
    
    scr.setAttribute('type', 'text/javascript');
    charset && scr.setAttribute('charset', charset);
    scr.setAttribute('src', url);
    document.getElementsByTagName("head")[0].appendChild(scr);
};
