/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/getByteLength.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */

///import baidu.string;

/**
 * 获取目标字符串在gbk编码下的字节长度
 * @name baidu.string.getByteLength
 * @function
 * @grammar baidu.string.getByteLength(source)
 * @param {string} source 目标字符串
 * @remark
 * 获取字符在gbk编码下的字节长度, 实现原理是认为大于127的就一定是双字节。如果字符超出gbk编码范围, 则这个计算不准确
 * @meta standard
 * @see baidu.string.subByte
 *             
 * @returns {number} 字节长度
 */
baidu.string.getByteLength = function (source) {
    return String(source).replace(/[^\x00-\xff]/g, "ci").length;
};
