/*
 * tangram
 * copyright 2011 baidu inc. all rights reserved.
 *
 * path: baidu/string/stripTags.js
 * author: leeight
 * version: 1.1.0
 * date: 2011/04/30
 */

///import baidu.string;

/**
 * 去掉字符串中的html标签
 * @function
 * @grammar baidu.string.stripTags(source)
 * @param {string} source 要处理的字符串.
 * @return {String}
 */
baidu.string.stripTags = function(source) {
    return String(source || '').replace(/<[^>]+>/g, '');
};
