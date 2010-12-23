/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: JK
*/

/*
渲染内部对象
*/
(function(){
var HelperH=QW.HelperH,
	applyTo=HelperH.applyTo,
	methodizeTo=HelperH.methodizeTo;

/**
* @class Object 扩展Object，用ObjectH来修饰Object，特别说明，未对Object.prototype作渲染，以保证Object.prototype的纯洁性
*/
applyTo(QW.ObjectH,Object);

/**
* @class Array 扩展Array，用ArrayH来修饰Array
*/
applyTo(QW.ArrayH,Array);
methodizeTo(QW.ArrayH,Array.prototype);


/**
* @class Function 扩展Function，用FunctionH/ClassH来修饰Function
*/
Object.mix(QW.FunctionH, QW.ClassH);
applyTo(QW.FunctionH,Function);
methodizeTo(QW.FunctionH,Function.prototype);

/**
* @class String 扩展String，用StringH来修饰String
*/
applyTo(QW.StringH,String);
methodizeTo(QW.StringH,String.prototype);

/**
* @class Date 扩展Date，用DateH来修饰Date
*/
applyTo(QW.DateH,Date);
methodizeTo(QW.DateH,Date.prototype);

})();


