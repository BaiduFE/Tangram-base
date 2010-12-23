/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/cookie/setRaw.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */

///import baidu.cookie._isValidKey;

/**
 * 设置cookie的值，不对值进行编码
 * @name baidu.cookie.setRaw
 * @function
 * @grammar baidu.cookie.setRaw(key, value[, options])
 * @param {string} key 需要设置Cookie的键名
 * @param {string} value 需要设置Cookie的值
 * @param {Object} [options] 设置Cookie的其他可选参数
 * @config {string} [path] cookie路径
 * @config {Date|number} [expires] cookie过期时间,如果类型是数字的话, 单位是毫秒
 * @config {string} [domain] cookie域名
 * @config {string} [secure] cookie是否安全传输
 * @remark
 * 
<b>options参数包括：</b><br>
path:cookie路径<br>
expires:cookie过期时间，Number型，单位为毫秒。<br>
domain:cookie域名<br>
secure:cookie是否安全传输
		
 * @meta standard
 * @see baidu.cookie.set,baidu.cookie.getRaw
 */
baidu.cookie.setRaw = function (key, value, options) {
    if (!baidu.cookie._isValidKey(key)) {
        return;
    }
    
    options = options || {};
    //options.path = options.path || "/"; // meizz 20100402 设定一个初始值，方便后续的操作
    //berg 20100409 去掉，因为用户希望默认的path是当前路径，这样和浏览器对cookie的定义也是一致的
    
    // 计算cookie过期时间
    var expires = options.expires;
    if ('number' == typeof options.expires) {
        expires = new Date();
        expires.setTime(expires.getTime() + options.expires);
    }
    
    document.cookie =
        key + "=" + value
        + (options.path ? "; path=" + options.path : "")
        + (expires ? "; expires=" + expires.toGMTString() : "")
        + (options.domain ? "; domain=" + options.domain : "")
        + (options.secure ? "; secure" : ''); 
};
