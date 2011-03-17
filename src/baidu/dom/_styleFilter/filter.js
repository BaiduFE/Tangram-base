/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_styleFilter/filter.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */

///import baidu.dom._styleFilter;

/**
 * 为获取和设置样式的过滤器
 * @private
 * @meta standard
 */
baidu.dom._styleFilter.filter = function (key, value, method) {
    for (var i = 0, filters = baidu.dom._styleFilter, filter; filter = filters[i]; i++) {
        if (filter = filter[method]) {
            value = filter(key, value);
        }
    }

    return value;
};
