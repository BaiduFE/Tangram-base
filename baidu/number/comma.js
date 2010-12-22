/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/number/comma.js
 * author: dron, erik, berg
 * version: 1.2.0
 * date: 2010/09/07 
 */

///import baidu.number;

/**
 * 为目标数字添加逗号分隔
 * @name baidu.number.comma
 * @function
 * @grammar baidu.number.comma(source[, length])
 * @param {number} source 需要处理的数字
 * @param {number} [length] 两次逗号之间的数字位数，默认为3位
 *             
 * @returns {string} 添加逗号分隔后的字符串
 */
baidu.number.comma = function (source, length) {
    if (!length || length < 1) {
        length = 3;
    }

    source = String(source).split(".");
    source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{'+length+'})+$)','ig'),"$1,");
    return source.join(".");
};
