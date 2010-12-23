/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/decodeHTML.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */

///import baidu.string;

/**
 * 对目标字符串进行html解码
 * @name baidu.string.decodeHTML
 * @function
 * @grammar baidu.string.decodeHTML(source)
 * @param {string} source 目标字符串
 * @shortcut decodeHTML
 * @meta standard
 * @see baidu.string.encodeHTML
 *             
 * @returns {string} html解码后的字符串
 */
baidu.string.decodeHTML = function (source) {
    var str = String(source)
                .replace(/&quot;/g,'"')
                .replace(/&lt;/g,'<')
                .replace(/&gt;/g,'>')
                .replace(/&amp;/g, "&");
    //处理转义的中文和实体字符
    return str.replace(/&#([\d]+);/g, function(_0, _1){
        return String.fromCharCode(parseInt(_1, 10));
    });
};

baidu.decodeHTML = baidu.string.decodeHTML;
