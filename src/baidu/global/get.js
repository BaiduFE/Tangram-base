/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * version: 1.4.0
 * date: 2011/07/05
 */

///import baidu.global;

/**
 * @namespace baidu.global.get 取得global全局对象里存储的信息。
 * @author meizz
 *
 * @param   {string}    key     信息对应的 key 值
 * @return  {object}            信息
 */
(function(){
    var global = window[baidu.guid].global;

    baidu.global.get = function(key) {
        return global[key];
    };
})();
