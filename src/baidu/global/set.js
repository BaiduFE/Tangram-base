/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * version: 1.4.0
 * date: 2011/07/05
 */

///import baidu.global;

/**
 * @namespace baidu.global.set 向global全局对象里存储信息。
 * @author meizz
 *
 * @param   {string}    key         信息对应的 key 值
 * @param   {object}    value       被存储的信息
 * @param   {boolean}   protected_  保护原值不被覆盖，默认值 false 可覆盖
 * @return  {object}                信息
 */
(function(){
    var global = window[baidu.guid].global;

    baidu.global.set = function(key, value, protected_) {
        var b = !protected_ || (protected_ && typeof global[key] == "undefined");

        b && (global[key] = value);
        return global[key];
    };
})();
