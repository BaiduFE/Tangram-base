/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: wuliang
*/

/**
 * @class ClassH 为function提供强化的原型继承能力。(类的继承，是JS的一个弱项，各js框架自行其是，也没有完美的解决方案。虚席中。)
 * @singleton 
 * @namespace QW
 * @helper
 */

(function(){

var ClassH = {
	/**
	 * 函数包装器 extend
	 * <p>改进的对象原型继承，延迟执行参数构造，并在子类的实例中添加了$super和$class引用</p>
	 * @method extend
	 * @static
	 * @param {function} cls 产生子类的原始类型
	 * @param {function} p 父类型
	 * @optional {boolean} runCon 是否自动运行父类构造器，默认为true，自动运行了父类构造器，如果为false，在构造器内可以通过arguments.callee.$super手工运行 
	 * @return {function} 返回以自身为构造器继承了p的类型
	 * @throw {Error} 不能对继承返回的类型再使用extend
	 */
	extend : function(cls,p,runCon){
		if(runCon == null) runCon = true;
		var wrapped = function()	//创建构造函数
		{   
			if(runCon)
				p.apply(this, arguments);
			
			var ret = cls.apply(this, arguments);

			return ret;
		}
		wrapped.toString = function(){
			return cls.toString();
		}
		
		var T = function(){};			//构造prototype-chain
		T.prototype = p.prototype;
		wrapped.prototype = new T();

		wrapped.$class = cls;
		wrapped.$super = cls.$super = p;
		
		wrapped.prototype.constructor = wrapped;

		for(var i in cls.prototype){		//如果原始类型的prototype上有方法，先copy
			if(cls.prototype.hasOwnProperty(i))
				wrapped.prototype[i] = cls.prototype[i];
		}

		wrapped.extend = function(){
			throw new Error("you maynot apply the same wrapper twice.");
		}

		return wrapped;
	}	
};

QW.ClassH =ClassH;

})();