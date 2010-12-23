/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: wuliang
	author: JK
*/

/**
 * @class FunctionH 核心对象Function的扩展
 * @singleton 
 * @namespace QW
 * @helper
 */
(function(){

var FunctionH = {
	/**
	* 函数包装器 methodize，对函数进行methodize化，使其的第一个参数为this，或this[attr]。
	* @method methodize
	* @static
	* @param {func} 要方法化的函数
	* @optional {string} attr 属性
	* @return {function} 已方法化的函数
	*/
	methodize: function(func,attr){
		if(attr) return function(){
			return func.apply(null,[this[attr]].concat([].slice.call(arguments)));
		};
		return function(){
			return func.apply(null,[this].concat([].slice.call(arguments)));
		};
	},
	/**
	* methodize的反向操作
	* @method unmethodize
	* @static
	* @param {func} 要反方法化的函数
	* @optional {string} attr 属性
	* @return {function} 已反方法化的函数
	*/
	unmethodize: function(func, attr){
		if(attr) return function(owner){
			return func.apply(owner[attr],[].slice.call(arguments, 1));
		};
		return function(owner){
			return func.apply(owner,[].slice.call(arguments, 1));
		};
	},
	/**
	* 对函数进行集化，使其在第一个参数为array时，结果也返回一个数组
	* @method mul
	* @static
	* @param {func} 
	* @return {Object} 已集化的函数
	*/
	mul: function(func, recursive){
		var newFunc = function(){
			var list = arguments[0], fn = recursive ? newFunc : func;

			if(list instanceof Array){
				var ret = [];
				var moreArgs = [].slice.call(arguments,0);
				for(var i = 0, len = list.length; i < len; i++){
					moreArgs[0]=list[i];
					var r = fn.apply(this, moreArgs);
					ret.push(r); 	
				}
				return ret;
			}else{
				return func.apply(this, arguments);
			}
		}
		return newFunc;
	},
	/**
	* 函数包装变换
	* @method rwrap
	* @static
	* @param {func} 
	* @return {Function}
	*/
	rwrap: function(func,wrapper,idx){
		idx = idx | 0;
		return function(){ 
			var ret = func.apply(this,arguments); 
			if(idx >= 0)
				return new wrapper(arguments[idx]);
			else if(ret != null)
				return new wrapper(ret);
			return ret;
		}
	},
	/**
	* 绑定
	* @method bind
	* @static
	* @param {func} 
	* @return {Function}
	*/
	bind: function(func, thisObj){
		return function(){
			return func.apply(thisObj, arguments);
		}
	},
	/** 
	* 懒惰执行某函数：一直到不得不执行的时候才执行。
	* @method lazyApply
	* @static
	* @param {Function} fun  调用函数
	* @param {Object} thisObj  相当于apply方法的thisObj参数
	* @param {Array} argArray  相当于apply方法的argArray参数
	* @param {int} ims  interval毫秒数，即window.setInterval的第二个参数.
	* @param {Function} checker  定期运行的判断函数，传给它的参数为：checker.call(thisObj,argArray,ims,checker)。<br/>
		对于不同的返回值，得到不同的结果：<br/>
			返回true或1，表示需要立即执行<br/>
			返回-1，表示成功偷懒，不用再执行<br/>
			返回其它值，表示暂时不执行<br/>
	@return {int}  返回interval的timerId
	*/
	lazyApply:function(fun,thisObj,argArray,ims,checker){
		var timer=function(){
			var verdict=checker.call(thisObj,argArray,ims,timerId);
			if(verdict==1){
				fun.apply(thisObj,argArray||[]);
			}
			if(verdict==1 || verdict==-1){
				clearInterval(timerId);
			}
		};
		var timerId=setInterval(timer,ims);
		return timerId;
	}
};

QW.FunctionH=FunctionH;

})();



