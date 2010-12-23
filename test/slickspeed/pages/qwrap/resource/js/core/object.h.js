/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: wuliang
	author: JK
*/


/**
 * @class ObjectH 核心对象Object的静态扩展
 * @singleton
 * @namespace QW
 * @helper
 */

(function(){

var encode4Js=QW.StringH.encode4Js;
var ObjectH = {
	/**
	* 得到一个对象的类型字符串
	* @method getType
	* @static
	* @param {any} o 目标对象或值
	* @returns {string} 该对象的类型
	* @example
		getType(null); //null
		getType(undefined); //undefined
		getType(""); //string
		getType([]); //array
		getType(true); //boolean
		getType({}); //object
		getType(new Date()); //date
		getType(/a/); //regexp
		getType({}.constructor); //function
		getType(window); //window
		getType(document); //document
		getType(document.body); //BODY
	*/
	getType: function(o){
		var type = typeof o;
		if(type == 'object'){
			if(o==null) type='null';
			else if("__type__" in o) type=o.__type__;
			else if("core" in o) type='wrap';
			else if(o.window==o) type='window'; //window
			else if(o.nodeName) type=(o.nodeName+'').replace('#',''); //document/element
			else if(!o.constructor) type='unknown object';
			else type=Object.prototype.toString.call(o).slice(8,-1).toLowerCase();
		}
		return type;
	},

	/** 
	* 将源对象的属性并入到目标对象
	* @method mix
	* @static
	* @param {Object} des 目标对象
	* @param {Object|Array} src 源对象，如果是数组，则依次并入
	* @param {boolean} override (Optional) 是否覆盖已有属性
	* @returns {Object} des
	*/
	mix: function(des, src, override){
		if("array" == ObjectH.getType(src)){
			for(var i = 0, len = src.length; i<len; i++){
				ObjectH.mix(des, src[i], override);
			}
			return des;
		}
		for(var i in src){
			if(override || !(i in des)){
				des[i] = src[i];
			}
		}
		return des;
	},

	/**
	* 将一个对象中某些属性复制出来，返回一个引用这些属性值的普通对象
	* @method dump
	* @static
	* @param {Object} obj 被操作的对象
	* @param {Array} props 包含要被复制的属性名称的数组
	* @param {Object} toObj 输出目标，如果为空，则输出一个新的Json
	* @param {boolean} override 是否覆盖原有属性。
	* @return {Object} toObj 返回包含这个对象中被复制属性的对象
	*/
	dump: function(obj, props, toObj,override){
		var ret = toObj || {};
		for(var i = 0; i<props.length;i++){
			var key = props[i];
			if(key in obj){
				if(override || !ret[key]) ret[key] = obj[key];
			}
		}
		return ret;
	},

	/**
	* 得到一个对象中所有可以被枚举出的属性的列表
	* @method keys
	* @static
	* @param {Object} obj 被操作的对象
	* @return {Array} 返回包含这个对象中所有属性的数组
	*/
	keys : function(obj){
		var ret = [];
		for(var key in obj){
			ret.push(key);
		}
		return ret;
	},

	/** 
	* 序列化一个对象(只序列化String,Number,Boolean,Date,Array,Json对象和有toJSON方法的对象,其它的对象都会被序列化成null)
	* @method stringify
	* @static
	* @param {Object} obj 需要序列化的Json、Array对象或其它对象
	* @returns {String} : 返回序列化结果
	* @example 
		var card={cardNo:"bbbb1234",history:[{date:"2008-09-16",count:120.0,isOut:true},1]};
		alert(stringify(card));
	*/
	stringify:function (obj){
		if(obj==null) return null;
		if(obj.toJSON) {
			obj= obj.toJSON();
		}
		var type=ObjectH.getType(obj);
		switch(type){
			case 'string': return '"'+encode4Js(obj)+'"';
			case 'number': 
			case 'boolean': return obj+'';
			case 'date': return 'new Date(' + obj.getTime() + ')';
			case 'array' :
				var ar=[];
				for(var i=0;i<obj.length;i++) ar[i]=ObjectH.stringify(obj[i]);
				return '['+ar.join(',')+']';
			case 'object' :
				ar=[];
				for(i in obj){
					ar.push('"'+encode4Js(i+'')+'":'+ObjectH.stringify(obj[i]));
				}
				return '{'+ar.join(',')+'}';
		}
		return null;//无法序列化的，返回null;
	},

	/** 
	* 为一个对象设置属性
	* @method set
	* @static
	* @param {Object} obj 目标对象
	* @param {string} prop 属性名
	* @param {any} value 属性值
	* @returns {void} 
	*/
	set:function (obj,prop,value){
		obj[prop]=value;
	},

	/** 
	* 获取一个对象的属性值:
	* @method set
	* @static
	* @param {Object} obj 目标对象
	* @param {string} prop 属性名
	* @returns {any} 
	*/
	get:function (obj,prop){
		return obj[prop];
	},

	/** 
	* 为一个对象设置属性，支持以下三种调用方式:
		setEx(obj, prop, value)
		setEx(obj, propJson)
		setEx(obj, props, values)
		---特别说明propName里带的点，会被当作属性的层次
	* @method setEx
	* @static
	* @param {Object} obj 目标对象
	* @param {string|Json|Array} prop 如果是string,则当属性名(属性名可以是属性链字符串,如"style.display")，如果是Json，则当prop/value对。如果是数组，则当prop数组，第二个参数对应的也是value数组
	* @param {any | Array} value 属性值
	* @returns {Object} obj 
	* @example 
		var el={style:{},firstChild:{}};
		setEx(el,"id","aaaa");
		setEx(el,{className:"cn1", 
			"style.display":"block",
			"style.width":"8px"
		});
	*/
	setEx:function (obj,prop,value){
		var propType=ObjectH.getType(prop);
		if(propType == 'array') {
			//setEx(obj, props, values)
			for(var i=0;i<prop.length;i++){
				ObjectH.setEx(obj,prop[i],value[i]);
			}
		}
		else if(propType == 'object') {
			//setEx(obj, propJson)
			for(var i in prop)
				ObjectH.setEx(obj,i,prop[i]);
		}
		else {
			//setEx(obj, prop, value);
			var keys=(prop+"").split(".");
			for(var i=0, obj2=obj, len=keys.length-1;i<len;i++){
				obj2=obj2[keys[i]];
			}
			obj2[keys[i]]=value;
		}
		return obj;
	},

	/** 
	* 得到一个对象的相关属性，支持以下三种调用方式:
		getEx(obj, prop) -> obj[prop]
		getEx(obj, props) -> propValues
		getEx(obj, propJson) -> propJson
	* @method getEx
	* @static
	* @param {Object} obj 目标对象
	* @param {string | Array} prop 如果是string,则当属性名(属性名可以是属性链字符串,如"style.display")；
		如果是Array，则当props看待
	* @param {boolean} returnJson 是否需要返回Json对象
	* @returns {any|Array|Json} 返回属性值
	* @example 
		getEx(obj,"style"); //返回obj["style"];
		getEx(obj,"style.color"); //返回 obj.style.color;
		getEx(obj,"style.color",true); //返回 {"style.color":obj.style.color};
		getEx(obj,["id","style.color"]); //返回 [obj.id, obj.style.color];
		getEx(obj,["id","style.color"],true); //返回 {id:obj.id, "style.color":obj.style.color};
	*/
	getEx:function (obj,prop,returnJson){
		var ret,propType=ObjectH.getType(prop);
		if(propType == 'array'){
			if(returnJson){
				ret={};
				for(var i =0; i<prop.length;i++){
					ret[prop[i]]=ObjectH.getEx(obj,prop[i]);
				}
			}
			else{
				//getEx(obj, props)
				ret=[];
				for(var i =0; i<prop.length;i++){
					ret[i]=ObjectH.getEx(obj,prop[i]);
				}
			}
		}
		else {
			//getEx(obj, prop)
			var keys=(prop+"").split(".");
			ret=obj;
			for(var i=0;i<keys.length;i++){
				ret=ret[keys[i]];
			}
			if(returnJson) {
				var json={};
				json[prop]=ret;
				return json;
			}
		}
		return ret;
	}

};
QW.ObjectH=ObjectH;
})()
