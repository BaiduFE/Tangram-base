/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/url/escapeSymbol.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/16
 */

///import baidu.url;

/**
 * 对字符串进行%&+/#=和空格七个字符进行url转义
 * @name baidu.url.escapeSymbol
 * @function
 * @grammar baidu.url.escapeSymbol(source)
 * @param {string} source 需要转义的字符串
 * @return {string} 转义之后的字符串.
 * @remark
 * 用于get请求转义。在服务器只接受gbk，并且页面是gbk编码时，可以经过本转义后直接发get请求。
 *             
 * @returns {string} 转义后的字符串
 */
baidu.url.escapeSymbol = function (source) {
    return String(source).replace(/\%/g, "%25")
                        .replace(/&/g, "%26")
                        .replace(/\+/g, "%2B")
                        .replace(/\ /g, "%20")
                        .replace(/\//g, "%2F")
                        .replace(/\#/g, "%23")
                        .replace(/\=/g, "%3D");
};
