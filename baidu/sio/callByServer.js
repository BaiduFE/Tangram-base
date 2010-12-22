/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: baidu/sio/callByServer.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/16
 */

///import baidu.sio;
///import baidu.sio._removeScriptTag;

/**
 * 通过script标签加载数据，加载完成由服务器端触发回调
 * @name baidu.sio.callByServer
 * @function
 * @grammar baidu.sio.callByServer(url[, callback, options])
 * @param {string} url 加载数据的url
 * @param {Function|string} [callback] 服务器端调用的函数或函数名
 * @param {Object} [options] 加载数据时的选项
				
 * @config {string} [charset] script的字符集
 * @config {string} [queryField] 服务器端callback请求字段名，默认为callback
 * @remark
 * 如果url中已经包含key为“callback”的query项，将会被替换成callback中参数传递或自动生成的函数名。
 * @meta standard
 * @see baidu.sio.callByBrowser
 */
baidu.sio.callByServer = function(url, callback, options) {
    options = options || {};
    var scr = document.createElement('SCRIPT'),
        prefix = 'bd__cbs__',
        callbackType = typeof callback,
        callbackName,
        attr,
        charset = options['charset'],
        queryField = options['queryField'] || 'callback';

    if ('string' == callbackType) {
        callbackName = callback;
    } else if ('function' == callbackType) {
        while (1) {
            callbackName = prefix
                + Math.floor(Math.random() * 2147483648).toString(36);
            if (!window[callbackName]) {
                window[callbackName] = function() {
                    try {
                        callback.apply(window, arguments);
                    } finally {
                        baidu.sio._removeScriptTag(scr);
                        window[callbackName] = null;
                    }
                };
                break;
            }
        }
    }

    if ('string' == typeof callbackName) {
        url = url.replace((new RegExp('(\\?|&)callback=[^&]*')), '\x241' + queryField + '=' + callbackName);
        if (url.search(new RegExp('(\\?|&)' + queryField + '=/')) < 0) {
            url += (url.indexOf('?') < 0 ? '?' : '&') + queryField + '=' + callbackName;
        }
    }

    scr.setAttribute('type', 'text/javascript');
    charset && scr.setAttribute('charset', charset);
    scr.setAttribute('src', url);
    document.getElementsByTagName('head')[0].appendChild(scr);
};
