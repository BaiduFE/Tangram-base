/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/wbr.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/30
 */

///import baidu.string;

/**
 * 为目标字符串添加wbr软换行
 * @name baidu.string.wbr
 * @function
 * @grammar baidu.string.wbr(source)
 * @param {string} source 目标字符串
 * @remark
 * 
1.支持html标签、属性以及字符实体。<br>
2.任意字符中间都会插入wbr标签，对于过长的文本，会造成dom节点元素增多，占用浏览器资源。
		
 *             
 * @returns {string} 添加软换行后的字符串
 */
baidu.string.wbr = function (source) {
    return String(source)
        .replace(/(?:<[^>]+>)|(?:&#?[0-9a-z]{2,6};)|(.{1})/gi, '$&<wbr>')
        .replace(/><wbr>/g, '>');
};
