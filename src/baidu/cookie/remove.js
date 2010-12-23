/*
 * Tangram
 * Copyright 2009 Baidu, Inc. All rights reserved.
 * 
 * path: baidu/cookie/remove.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */

///import baidu.cookie.setRaw;

/**
 * 删除cookie的值
 * @name baidu.cookie.remove
 * @function
 * @grammar baidu.cookie.remove(key, options)
 * @param {string} key 需要删除Cookie的键名
 * @param {Object} options 需要删除的cookie对应的 path domain 等值
 * @meta standard
 */
 //20100402 meizz 在删除 cookie 的时候若指定删除的 cookie 的 domain path 等信息与原设定的 cookie 信息不致时，是无法删除这个 cookie 的。
baidu.cookie.remove = function (key, options) {
    options = options || {};
    options.expires = new Date(0);
    baidu.cookie.setRaw(key, '', options);
};
