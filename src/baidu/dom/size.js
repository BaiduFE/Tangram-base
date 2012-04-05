/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: baidu/dom/_styleFixer/size.js
 * author: qiaoyue
 * version: 1.1.0
 * date: 2012/03/16
 */

///import baidu.dom._styleFixer;

/**
 * 提供给getStyle使用
 * @meta standard
 */
baidu.dom._styleFixer.width = baidu.dom._styleFixer.height = {
    get: function(element, key, value) {
        var key = key.replace(/^[a-z]/, function($1){
	            return $1.toUpperCase();
	        }),
        	val = element['client' + key] || element['offset' + key];

        return val > 0 ? val + 'px' : !value || value == 'auto' ? 0 + 'px' : val;
    },

    set: function(element, value, key){
    	element.style[key] = value;
    }
};
