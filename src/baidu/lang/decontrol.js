/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/decontrol.js
 * author: meizz
 * version: 1.1.0
 * $date$
 */

///import baidu.lang._instances;

/**
 * 解除instance中对指定类实例的引用关系。
 * @name baidu.lang.decontrol
 * @function
 * @grammar baidu.lang.decontrol(guid)
 * @param {string} guid 类的唯一标识
 * @version 1.1.1
 * @see baidu.lang.instance
 */
baidu.lang.decontrol = function(guid) {
    var m = window[baidu.guid];
    m._instances && (delete m._instances[guid]);
};
