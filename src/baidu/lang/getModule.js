/*
 * tangram
 * copyright 2011 baidu inc. all rights reserved.
 *
 * path: baidu/lang/getModule.js
 * author: leeight
 * version: 1.1.0
 * date: 2011/04/29
 */

///import baidu.lang;

/**
 * 根据变量名或者命名空间来查找对象
 * @function
 * @grammar baidu.lang.getModule(name, opt_obj)
 * @param {string} name 变量或者命名空间的名字.
 * @param {Object=} opt_obj 从这个对象开始查找，默认是window;
 * @return {?Object} 返回找到的对象，如果没有找到返回null.
 * @see goog.getObjectByName
 */
baidu.lang.getModule = function(name, opt_obj) {
    var parts = name.split('.'),
        cur = opt_obj || window,
        part;
    for (; part = parts.shift(); ) {
        if (cur[part] != null) {
            cur = cur[part];
        } else {
          return null;
        }
    }

    return cur;
};



















/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
