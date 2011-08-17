/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/url/jsonToQuery.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/16
 */

///import baidu.url.escapeSymbol;
///import baidu.object.each;
///import baidu.lang.isArray;

/**
 * 将json对象解析成query字符串
 * @name baidu.url.jsonToQuery
 * @function
 * @grammar baidu.url.jsonToQuery(json[, replacer])
 * @param {Object} json 需要解析的json对象
 * @param {Function=} replacer_opt 对值进行特殊处理的函数，function (value, key)
 * @see baidu.url.queryToJson,baidu.url.getQueryValue
 *             
 * @return {string} - 解析结果字符串，其中值将被URI编码，{a:'&1 '} ==> "a=%261%20"。
 */
baidu.url.jsonToQuery = function (json, replacer_opt) {
    var result = [], 
        itemLen,
        replacer = replacer_opt || function (value) {
          return baidu.url.escapeSymbol(value);
        };
        
    baidu.object.each(json, function(item, key){
        // 这里只考虑item为数组、字符串、数字类型，不考虑嵌套的object
        if (baidu.lang.isArray(item)) {
            itemLen = item.length;
            // value的值需要encodeURIComponent转义吗？
            // FIXED 优化了escapeSymbol函数
            while (itemLen--) {
                result.push(key + '=' + replacer(item[itemLen], key));
            }
        } else {
            result.push(key + '=' + replacer(item, key));
        }
    });
    
    return result.join('&');
};
