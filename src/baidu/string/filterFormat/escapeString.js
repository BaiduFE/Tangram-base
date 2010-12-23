/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/filterFormat/escapeString.js
 * author: rocy
 * version: 1.1.2
 * date: 2010/06/12
 */

///import baidu.string.filterFormat;
baidu.string.filterFormat.escapeString = function(str){
	if(!str || 'string' != typeof str) return str;
	return str.replace(/"/g,'&#34;')
		.replace(/'/g,"&#39;")
		.replace(/</g,'&#60;')
		.replace(/>/g,'&#62;')
		.replace(/\\/g,'&#92;')
		.replace(/\//g,'&#47;')
		.replace(/`/g, '&#96;')
};

baidu.string.filterFormat.e = baidu.string.filterFormat.escapeString;