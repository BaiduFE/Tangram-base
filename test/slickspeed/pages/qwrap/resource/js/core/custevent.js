/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: JK
*/



(function(){
var mix=QW.ObjectH.mix,
	indexOf=QW.ArrayH.indexOf;

//----------QW.CustEvent----------

/**
* @class CustEvent 自定义事件
* @namespace QW
* @param {object} target 事件所属对象，即：是哪个对象的事件。
* @param {string} type 事件类型。备用。
* @returns {CustEvent} 自定义事件
*/
var CustEvent=QW.CustEvent=function(target,type){
	this.target=target;
	this.type=type;
};

mix(CustEvent.prototype,{
	/**
	* @property {Object} target CustEvent的target
	*/
	target: null,
	/**
	* @property {Object} currentTarget CustEvent的currentTarget，即事件派发者
	*/
	currentTarget: null,
	/**
	* @property {String} type CustEvent的类型
	*/
	type: null,
	/**
	* @property {boolean} returnValue fire方法执行后的遗留产物。(建议规则:对于onbeforexxxx事件，如果returnValue===false，则不执行该事件)。
	*/
	returnValue: undefined,
	/**
	* 设置event的返回值为false。
	* @method preventDefault
	* @returns {void} 无返回值
	*/
	preventDefault: function(){
		this.returnValue=false;
	}
});
	/**
	* 为一个对象添加一系列事件，并添加on/un/fire三个方法，参见：QW.CustEventTarget.createEvents
	* @static
	* @method createEvents
	* @param {Object} obj 事件所属对象，即：是哪个对象的事件。
	* @param {String|Array} types 事件名称。
	* @returns {void} 无返回值
	*/



/**
 * @class CustEventTarget  自定义事件Target
 * @namespace QW
 */

var CustEventTarget=QW.CustEventTarget=function(){
	this.__custListeners={};
};
mix(CustEventTarget.prototype,{
	/**
	* 添加监控
	* @method on 
	* @param {string} sEvent 事件名称。
	* @param {Function} fn 监控函数，在CustEvent fire时，this将会指向oScope，而第一个参数，将会是一个CustEvent对象。
	* @return {boolean} 是否成功添加监控。例如：重复添加监控，会导致返回false.
	* @throw {Error} 如果没有对事件进行初始化，则会抛错
	*/
	on: function(sEvent,fn) {
		var cbs=this.__custListeners[sEvent];
		if(indexOf(cbs,fn)>-1) return false;
		cbs.push(fn);
		return true;
	},
	/**
	* 取消监控
	* @method un
	* @param {string} sEvent 事件名称。
	* @param {Function} fn 监控函数
	* @return {boolean} 是否有效执行un.
	* @throw {Error} 如果没有对事件进行初始化，则会抛错
	*/
	un: function(sEvent, fn){
		var cbs=this.__custListeners[sEvent];
		if(fn) {
			var idx=indexOf(cbs,fn);
			if(idx<0) return false;
			cbs.splice(idx,1);
		}
		else cbs.length=0;
		return true;

	},
	/**
	* 事件触发。触发事件时，在监控函数里，this将会指向oScope，而第一个参数，将会是一个CustEvent对象，与Dom3的listener的参数类似。<br/>
	  如果this.target['on'+this.type],则也会执行该方法,与HTMLElement的独占模式的事件(如el.onclick=function(){alert(1)})类似.
	* @method fire 
	* @param {string | CustEvent} custEvent 自定义事件，或事件名称。 如果是事件名称，相当于传new CustEvent(this,sEvent).
	* @return {boolean} 以下两种情况返回false，其它情况下返回true.
			1. 所有callback(包括独占模式的onxxx)执行完后，custEvent.returnValue===false
			2. 所有callback(包括独占模式的onxxx)执行完后，custEvent.returnValue===undefined，并且独占模式的onxxx()的返回值为false.
	*/
	fire: function(custEvent)
	{
		if(typeof custEvent == 'string') custEvent=new CustEvent(this,custEvent);
		var sEvent=custEvent.type;
		if(! custEvent instanceof CustEvent || !sEvent) throw new TypeError();
		custEvent.returnValue=undefined; //去掉本句，会导致静态CustEvent的returnValue向后污染
		custEvent.currentTarget=this;
		var obj=custEvent.currentTarget;
		if(obj && obj['on'+custEvent.type]) {
			var retDef=obj['on'+custEvent.type].call(obj,custEvent);//对于独占模式的返回值，会弱影响event.returnValue
		}
		var cbs=this.__custListeners[sEvent];
		for(var i=0;i<cbs.length;i++){
			cbs[i].call(obj,custEvent);
		}
		return (custEvent.returnValue!==false || retDef===false && custEvent.returnValue===undefined);
	}
});

CustEvent.createEvents=CustEventTarget.createEvents=function(obj,types){
	/**
	* 为一个对象添加一系列事件，并添加on/un/fire三个方法
	* @static
	* @method createEvents
	* @param {Object} obj 事件所属对象，即：是哪个对象的事件。
	* @param {String|Array} types 事件名称。
	* @returns {void} 无返回值
	*/
	if(typeof types =="string") types=types.split(",");
	var listeners=obj.__custListeners;
	if(!listeners) listeners=obj.__custListeners={};
	for(var i=0;i<types.length;i++){
		listeners[types[i]]=listeners[types[i]] || [];//可以重复create，而不影响之前的listerners.
	}
	mix(obj,CustEventTarget.prototype);//尊重对象本身的on。
};



})();


