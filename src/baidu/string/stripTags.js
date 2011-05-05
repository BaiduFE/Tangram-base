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
 * @param {string} source 要处理的字符串.
 * @return {string}
 */
baidu.string.stripTags = function(source) {
    return String(source || '').replace(/<[^>]+>/g, '');
};




















/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
