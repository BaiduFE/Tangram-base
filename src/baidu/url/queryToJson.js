/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/url/queryToJson.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/16
 */

///import baidu.url;
///import baidu.lang.isArray;

/**
 * 解析目标URL中的参数成json对象
 * @name baidu.url.queryToJson
 * @function
 * @grammar baidu.url.queryToJson(url)
 * @param {string} url 目标URL
 * @see baidu.url.jsonToQuery
 *             
 * @returns {Object} 解析结果对象
 */
baidu.url.queryToJson = function (url) {
    var query   = url.substr(url.lastIndexOf('?') + 1),
        params  = query.split('&'),
        len     = params.length,
        result  = {},
        i       = 0,
        key, value, item, param;
    
    for (; i < len; i++) {
        param   = params[i].split('=');
        key     = param[0];
        value   = param[1];
        
        item = result[key];
        if ('undefined' == typeof item) {
            result[key] = value;
        } else if (baidu.lang.isArray(item)) {
            item.push(value);
        } else { // 这里只可能是string了
            result[key] = [item, value];
        }
    }
    
    return result;
};
