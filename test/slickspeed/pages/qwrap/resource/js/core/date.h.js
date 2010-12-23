/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: JK
*/

/**
 * @class DateH 核心对象Date的扩展
 * @singleton 
 * @namespace QW
 * @helper
 */

(function(){

var DateH = {
	/** 
	* 格式化日期
	* @method format
	* @static
	* @param {Date} d 日期对象
	* @param {string} pattern 日期格式(y年M月d天h时m分s秒)，默认为"yyyy-MM-dd"
	* @return {string}  返回format后的字符串
	* @example
		var d=new Date();
		alert(format(d," yyyy年M月d日\n yyyy-MM-dd\n MM-dd-yy\n yyyy-MM-dd hh:mm:ss"));
	*/
	format:function(d,pattern)
	{
		pattern=pattern||"yyyy-MM-dd";
		var y=d.getFullYear();
		var o = {
			"M" : d.getMonth()+1, //month
			"d" : d.getDate(),    //day
			"h" : d.getHours(),   //hour
			"m" : d.getMinutes(), //minute
			"s" : d.getSeconds() //second
		}
		pattern=pattern.replace(/(y+)/ig,function(a,b){var len=Math.min(4,b.length);return (y+"").substr(4-len);});
		for(var i in o){
			pattern=pattern.replace(new RegExp("("+i+"+)","g"),function(a,b){return (o[i]<10 && b.length>1 )? "0"+o[i] : o[i]});
		}
		return pattern;
	}
};

QW.DateH = DateH;

})();