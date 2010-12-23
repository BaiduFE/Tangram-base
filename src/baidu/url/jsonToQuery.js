/*
 * Tangram
 * Copyright 2009 Baidu, Inc. All rights reserved.
 * 
 * path: baidu/url/jsonToQuery.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/16
 */

///import baidu.url.escapeSymbol;

/**
 * 将json对象解析成query字符串
 * @name baidu.url.jsonToQuery
 * @function
 * @grammar baidu.url.jsonToQuery(json[, replacer])
 * @param {JSON} json 需要解析的json对象
 * @param {Function} [replacer] 对值进行特殊处理的函数，function (value, key)
 * @see baidu.url.queryToJson,baidu.url.getQueryValue
 *             
 * @returns {string} 解析结果字符串
 */
baidu.url.jsonToQuery = function (json, replacer) {
    var result = [], 
        len = 0, 
        key, item, itemLen;
    
    replacer = replacer || function (value) {
        return baidu.url.escapeSymbol(value);
    };
        
    for (key in json) {
        if (json.hasOwnProperty(key)) {
            item = json[key];
            // 这里只考虑item为数组、字符串、数字类型，不考虑嵌套的object
            if (Object.prototype.toString.call(item) == '[object Array]') {
                itemLen = item.length;
                while (itemLen--) {
                    result[len++] = key + '=' + replacer(item[itemLen], key);
                }
            } else {
                result[len++] = key + '=' + replacer(item, key);
            }
        }
    }
    return result.join('&');
};
