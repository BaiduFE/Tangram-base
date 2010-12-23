/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/format.js
 * author: dron, erik
 * version: 1.1.0
 * date: 2009/11/30
 */

///import baidu.string;

/**
 * 对目标字符串进行格式化
 * @name baidu.string.format
 * @function
 * @grammar baidu.string.format(source, opts)
 * @param {string} source 目标字符串
 * @param {Object|string...} opts 提供相应数据的对象或多个字符串
 * @remark
 * 
opts参数为“Object”时，替换目标字符串中的#{property name}部分。<br>
opts为“string...”时，替换目标字符串中的#{0}、#{1}...部分。
		
 * @shortcut format
 * @meta standard
 *             
 * @returns {string} 格式化后的字符串
 */
baidu.string.format = function (source, opts) {
    source = String(source);
    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
    if(data.length){
	    data = data.length == 1 ? 
	    	/* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
	    	(opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
	    	: data;
    	return source.replace(/#\{(.+?)\}/g, function (match, key){
	    	var replacer = data[key];
	    	// chrome 下 typeof /a/ == 'function'
	    	if('[object Function]' == toString.call(replacer)){
	    		replacer = replacer(key);
	    	}
	    	return ('undefined' == typeof replacer ? '' : replacer);
    	});
    }
    return source;
};

// 声明快捷方法
baidu.format = baidu.string.format;
