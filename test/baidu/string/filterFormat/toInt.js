///*
// * Tangram
// * Copyright 2009 Baidu Inc. All rights reserved.
// * 
// * path: baidu/string/filterFormat/toInt.js
// * author: rocy
// * version: 1.1.2
// * date: 2010/06/12
// */
//
/////import baidu.string.filterFormat;
//baidu.string.filterFormat.toInt = function(str){
//	return parseInt(str, 10) || 0;
//};
//baidu.string.filterFormat.i = baidu.string.filterFormat.toInt;


module('baidu.string.filterFormat.toInt');

test('format', function(){

	// toInt
	var sPattern = '#{0|toInt}|#{1|i}|#{2|i}', sRet = baidu.string
			.filterFormat(sPattern, '1px', '-2', 'NaN');
	equals(sRet, '1|-2|0');

});