///*
// * Tangram
// * Copyright 2009 Baidu Inc. All rights reserved.
// * 
// * path: baidu/string/filterFormat/escapeString.js
// * author: rocy
// * version: 1.1.2
// * date: 2010/06/12
// */
//
/////import baidu.string.filterFormat;
//baidu.string.filterFormat.escapeString = function(str){
//	if(!str || 'string' != typeof str) return str;
//	return str.replace(/"/g,'&#34;')
//		.replace(/'/g,"&#39;")
//		.replace(/</g,'&#60;')
//		.replace(/>/g,'&#62;')
//		.replace(/\\/g,'&#92;')
//		.replace(/\//g,'&#47;')
//};
//
//baidu.string.filterFormat.e = baidu.string.filterFormat.escapeString;


module('baidu.string.filterFormat.escapeString');

test('format', function(){

			var sPattern = '<input value="#{0|escapeString}#{1|e}#{2|e}#{3|e}#{4|e}#{5|e}">', sRet = baidu.string
					.filterFormat(sPattern, '<', '>', '/', '\\', '"', "'");
			equals(sRet, '<input value="&#60;&#62;&#47;&#92;&#34;&#39;">');



			// 传入空参数
			try {
				var sPattern = '<input value="#{0|escapeString}#{1|e}">', sRet = baidu.string
						.filterFormat(sPattern, '<');
			} catch (e) {
				equals(sRet, "参数个数传入错误");
			}	
});