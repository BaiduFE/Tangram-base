

/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: JK
*/

(function(){
/**
* @singleton 
* @class QW QW框架的根命名空间
*/

var QW = {
	/**
	* 当前框架版本
	* @porperty CORE_VERSION
	* @type string
	*/
	CORE_VERSION: "0.0.1",
	/**
	* core目录所在路径，包含最后的一个"/"
	* @property JSPATH
	* @type string
	*/
	JSPATH: function(){
		var els=document.getElementsByTagName('script');
		for (var i = 0; i < els.length; i++) {
			var src = els[i].src.split(/(apps|core)[\\\/]/g);
			if (src[1]) {
				return src[0];
			}
		}
		return '';}(),
	/**
	 * 向QW这个命名空间里设变量
	 * @method provide
	 * @static
	 * @param {string|Json} key 如果类型为string，则为key，否则为Json，表示将该Json里的值dump到QW命名空间
	 * @param {any} value (Optional)值
	 * @return {void} 
	 */		
	provide: function(key, value){
		if(arguments.length==1 && typeof key=='object'){
			for(var i in key){
				QW.provide(i,key[i]);
			}
			return;
		}
		var domains=QW.provideDomains;
		for(var i=0;i<domains.length;i++){
			if(!domains[i][key]) domains[i][key]=value;
		}
	},
	/**
	* 异步加载脚本
	* @method getScript
	* @static
	* @param { String } url Javascript文件路径
	* @param { Function } onsuccess (Optional) Javascript加载后的回调函数
	* @param { Json } options (Optional) 配置选项，例如charset
	*/
	getScript: function(url,onsuccess,options){
		options = options || {};
		var head = document.getElementsByTagName('head')[0],
			script = document.createElement('script'),
			done = false;
		script.src = url;
		if( options.charset )
			script.charset = options.charset;
		script.onerror = script.onload = script.onreadystatechange = function(){
			if ( !done && (!this.readyState ||
					this.readyState == "loaded" || this.readyState == "complete") ) {
				done = true;
				onsuccess && onsuccess();
				script.onerror = script.onload = script.onreadystatechange = null;
				head.removeChild( script );
			}
		};
		head.appendChild(script);

	}
};

/**
 * @property {Array} provideDomains provide方法针对的命名空间
 * @type string
 */
QW.provideDomains=[QW];

window.QW=QW;
})();
/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: JK
*/


/**
 * @class Browser js的运行环境，浏览器以及版本信息
 * @singleton 
 * @namespace QW 
 */
QW.Browser=function(){
	var na=window.navigator,ua = na.userAgent.toLowerCase();
	// 判断浏览器的代码,部分来自JQuery,致谢!
	var b= {
		platform: na.platform,
		//mozilla: /mozilla/.test( ua ) && !/(compatible|webkit|firefox)/.test( ua ),//废弃
		msie: /msie/.test( ua ) && !/opera/.test( ua ),
		opera: /opera/.test( ua ),
		//gecko: /gecko/.test( ua ) && /khtml/.test( ua ),//废弃
		safari: /webkit/.test( ua ) && !/chrome/.test( ua ),
		firefox: /firefox/.test( ua ) ,
		chrome: /chrome/.test( ua )
	};
	var vMark="";
	for(var i in b){
		if(b[i]) vMark=i;
	}
	if(b.safari) vMark="version";
	b.version=(ua.match( new RegExp("(?:"+vMark+")[\\/: ]([\\d.]+)") ) || [])[1];
	b.ie=b.msie;
	b.ie6=b.msie && parseInt(b.version)==6;
	try{b.maxthon=b.msie && !!external.max_version;} catch(ex){}
	return b;
}();


/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: JK
*/


/**
 * @class StringH 核心对象String的扩展
 * @singleton
 * @namespace QW
 * @helper
 */

(function(){

var StringH = {
	/** 
	* 除去字符串两边的空白字符
	* @method trim
	* @static
	* @param {String} s 需要处理的字符串
	* @return {String}  除去两端空白字符后的字符串
	* @remark 如果字符串中间有很多连续tab,会有有严重效率问题,相应问题可以用下一句话来解决.
		return s.replace(/^[\s\xa0\u3000]+/g,"").replace(/([^\u3000\xa0\s])[\u3000\xa0\s]+$/g,"$1");
	*/
	trim:function(s){
		return s.replace(/^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g, "");
	},
	/** 
	* 对一个字符串进行多次replace
	* @method mulReplace
	* @static
	* @param {String} s  需要处理的字符串
	* @param {array} arr  数组，每一个元素都是由replace两个参数组成的数组
	* @return {String} 返回处理后的字符串
	* @example alert(mulReplace("I like aa and bb. JK likes aa.",[[/aa/g,"山"],[/bb/g,"水"]]));
	*/
	mulReplace:function (s,arr){
		for(var i=0;i<arr.length;i++) s=s.replace(arr[i][0],arr[i][1]);
		return s;
	},
	/** 
	* 字符串简易模板
	* @method format
	* @static
	* @param {String} s 字符串模板，其中变量以{0} {1}表示
	* @param {String} arg0 (Optional) 替换的参数
	* @return {String}  模板变量被替换后的字符串
	* @example alert(tmpl("{0} love {1}.",'I','You'))
	*/
	format:function(s,arg0){
		var args=arguments;
		return s.replace(/\{(\d+)\}/ig,function(a,b){return args[b*1+1]||''});
	},
	/** 
	* 字符串简易模板
	* @method tmpl
	* @static
	* @param {String} sTmpl 字符串模板，其中变量以｛$aaa｝表示
	* @param {Object} opts 模板参数
	* @return {String}  模板变量被替换后的字符串
	* @example alert(tmpl("{$a} love {$b}.",{a:"I",b:"you"}))
	*/
	tmpl:function(sTmpl,opts){
		return sTmpl.replace(/\{\$(\w+)\}/g,function(a,b){return opts[b]});
	},

	/** 
	* 判断一个字符串是否包含另一个字符串
	* @method contains
	* @static
	* @param {String} s 字符串
	* @param {String} opts 子字符串
	* @return {String} 模板变量被替换后的字符串
	* @example alert(contains("aaabbbccc","ab"))
	*/
	contains:function(s,subStr){
		return s.indexOf(subStr)>-1;
	},

	/** 
	* 全角字符转半角字符
		全角空格为12288，转化成" "；
		全角句号为12290，转化成"."；
		其他字符半角(33-126)与全角(65281-65374)的对应关系是：均相差65248 
	* @method dbc2sbc
	* @static
	* @param {String} s 需要处理的字符串
	* @return {String}  返回转化后的字符串
	* @example 
		var s="发票号是ＢＢＣ１２３４５６，发票金额是１２.３５元";
		alert(dbc2sbc(s));
	*/
	dbc2sbc:function(s)
	{
		return StringH.mulReplace(s,[
			[/[\uff01-\uff5e]/g,function(a){return String.fromCharCode(a.charCodeAt(0)-65248);}],
			[/\u3000/g,' '],
			[/\u3002/g,'.']
		]);
	},

	/** 
	* 得到字节长度
	* @method byteLen
	* @static
	* @param {String} s 字符串
	* @return {number}  返回字节长度
	*/
	byteLen:function(s)
	{
		return s.replace(/[^\x00-\xff]/g,"--").length;
	},

	/** 
	* 得到指定字节长度的子字符串
	* @method subByte
	* @static
	* @param {String} s 字符串
	* @param {number} len 字节长度
	* @optional {string} tail 结尾字符串
	* @return {string}  返回指定字节长度的子字符串
	*/
	subByte:function(s, len, tail)
	{
		if(StringH.byteLen(s)<=len) return s;
		tail = tail||'';
		len -= StringH.byteLen(tail);
		return s=s.substr(0,len).replace(/([^\x00-\xff])/g,"$1 ")//双字节字符替换成两个
			.substr(0,len)//截取长度
			.replace(/[^\x00-\xff]$/,"")//去掉临界双字节字符
			.replace(/([^\x00-\xff]) /g,"$1") + tail;//还原
	},

	/** 
	* 驼峰化字符串。将“ab-cd”转化为“abCd”
	* @method camelize
	* @static
	* @param {String} s 字符串
	* @return {String}  返回转化后的字符串
	*/
	camelize:function(s) {
		return s.replace(/\-(\w)/ig,function(a,b){return b.toUpperCase();});
	},

	/** 
	* 反驼峰化字符串。将“abCd”转化为“ab-cd”。
	* @method decamelize
	* @static
	* @param {String} s 字符串
	* @return {String} 返回转化后的字符串
	*/
	decamelize:function(s) {
		return s.replace(/[A-Z]/g,function(a){return "-"+a.toLowerCase();});
	},

	/** 
	* 字符串为javascript转码
	* @method encode4Js
	* @static
	* @param {String} s 字符串
	* @return {String} 返回转化后的字符串
	* @example 
		var s="my name is \"JK\",\nnot 'Jack'.";
		window.setTimeout("alert('"+encode4Js(s)+"')",10);
	*/
	encode4Js:function(s){
		return StringH.mulReplace(s,[
			[/\\/g,"\\u005C"],
			[/"/g,"\\u0022"],
			[/'/g,"\\u0027"],
			[/\//g,"\\u002F"],
			[/\r/g,"\\u000A"],
			[/\n/g,"\\u000D"],
			[/\t/g,"\\u0009"]
		]);
	},

	/** 
	* 为http的不可见字符、不安全字符、保留字符作转码
	* @method encode4Http
	* @static
	* @param {String} s 字符串
	* @return {String} 返回处理后的字符串
	*/
	encode4Http:function(s){
		return s.replace(/[\u0000-\u0020\u0080-\u00ff\s"'#\/\|\\%<>\[\]\{\}\^~;\?\:@=&]/,function(a){return encodeURIComponent(a)});
	},

	/** 
	* 字符串为Html转码
	* @method encode4Html
	* @static
	* @param {String} s 字符串
	* @return {String} 返回处理后的字符串
	* @example 
		var s="<div>dd";
		alert(encode4Html(s));
	*/
	encode4Html:function(s){
		var el = document.createElement('pre');//这里要用pre，用div有时会丢失换行，例如：'a\r\n\r\nb'
		var text = document.createTextNode(s);
		el.appendChild(text);
		return el.innerHTML;
	},

	/** 
	* 字符串为Html的value值转码
	* @method encode4HtmlValue
	* @static
	* @param {String} s 字符串
	* @return {String} 返回处理后的字符串
	* @example:
		var s="<div>\"\'ddd";
		alert("<input value='"+encode4HtmlValue(s)+"'>");
	*/
	encode4HtmlValue:function(s){
		return StringH.encode4Html(s).replace(/"/g,"&quot;").replace(/'/g,"&#039;");
	},

	/** 
	* 与encode4Html方法相反，进行反编译
	* @method decode4Html
	* @static
	* @param {String} s 字符串
	* @return {String} 返回处理后的字符串
	*/
	decode4Html:function(s){
		var div = document.createElement('div');
		div.innerHTML = s.stripTags();
		return div.childNodes[0] ? div.childNodes[0].nodeValue+'' : '';
	},
	/** 
	* 将所有tag标签消除，即去除<tag>，以及</tag>
	* @method stripTags
	* @static
	* @param {String} s 字符串
	* @return {String} 返回处理后的字符串
	*/
	stripTags:function(s) {
		return s.replace(/<[^>]*>/gi, '');
	},
	/** 
	* eval某字符串。如果叫"eval"，在这里需要加引号，才能不影响YUI压缩。不过其它地方用了也会有问题，所以改名evalJs，
	* @method evalJs
	* @static
	* @param {String} s 字符串
	* @param {any} opts 运行时需要的参数。
	* @return {any} 根据字符结果进行返回。
	*/
	evalJs:function(s,opts) { //如果用eval，在这里需要加引号，才能不影响YUI压缩。不过其它地方用了也会有问题，所以改成evalJs，
		return new Function("opts",s)(opts);
	},
	/** 
	* eval某字符串，这个字符串是一个js表达式，并返回表达式运行的结果
	* @method evalExp
	* @static
	* @param {String} s 字符串
	* @param {any} opts eval时需要的参数。
	* @return {any} 根据字符结果进行返回。
	*/
	evalExp:function(s,opts) {
		return new Function("opts","return "+s+";")(opts);
	}
};

QW.StringH=StringH;

})();

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

/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: JK
*/

/**
 * @class ArrayH 核心对象Array的扩展
 * @singleton 
 * @namespace QW
 * @helper
 */
(function(){

var ArrayH = {
	/** 
	* 在数组中的每个项上运行一个函数，并将全部结果作为数组返回。
	* @method map
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数.
	* @param {Object} pThis (Optional) 指定callback的this对象.
	* @return {Array} 返回满足过滤条件的元素组成的新数组 
	* @example 
		var arr=["aa","ab","bc"];
		var arr2=map(arr,function(a,b){return a.substr(0,1)=="a"});
		alert(arr2);
	*/
	map:function(arr,callback,pThis){
		var len=arr.length;
		var rlt=new Array(len);
		for (var i =0;i<len;i++) {
			if (i in arr) rlt[i]=callback.call(pThis,arr[i],i,arr);
		}
		return rlt;
	},

	/** 
	* 对Array的每一个元素运行一个函数。
	* @method forEach
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数.
	* @optional {Object} pThis (Optional) 指定callback的this对象.
	* @return {void}  
	* @example 
		var arr=["a","b","c"];
		var dblArr=[];
		forEach(arr,function(a,b){dblArr.push(b+":"+a+a);});
		alert(dblArr);
	*/
	forEach:function(arr,callback,pThis){
		for (var i =0,len=arr.length;i<len;i++){
			if (i in arr) callback.call(pThis,arr[i],i,arr);
		}
	},

	/** 
	* 在数组中的每个项上运行一个函数，并将函数返回真值的项作为数组返回。
	* @method filter
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数.
	* @optional {Object} pThis (Optional) 指定callback的this对象.
	* @return {Array} 返回满足过滤条件的元素组成的新数组 
	* @example 
		var arr=["aa","ab","bc"];
		var arr2=filter(arr,function(a,b){return a.substr(0,1)=="a"});
		alert(arr2);
	*/
	filter:function(arr,callback,pThis){
		var rlt=[];
		for (var i =0,len=arr.length;i<len;i++) {
			if((i in arr) && callback.call(pThis,arr[i],i,arr)) rlt.push(arr[i]);
		}
		return rlt;
	},

	/** 
	* 判断数组中是否有元素满足条件。
	* @method some
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数.
	* @optional {Object} pThis (Optional) 指定callback的this对象.
	* @return {boolean} 如果存在元素满足条件，则返回true. 
	* @example 
		var arr=["aa","ab","bc"];
		var arr2=filter(arr,function(a,b){return a.substr(0,1)=="a"});
		alert(arr2);
	*/
	some:function(arr,callback,pThis){
		for (var i =0,len=arr.length;i<len;i++) {
			if(i in arr && callback.call(pThis,arr[i],i,arr)) return true;
		}
		return false;
	},

	/** 
	* 判断数组中所有元素都满足条件。
	* @method every
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数.
	* @optional {Object} pThis (Optional) 指定callback的this对象.
	* @return {boolean} 所有元素满足条件，则返回true. 
	* @example 
		var arr=["aa","ab","bc"];
		var arr2=filter(arr,function(a,b){return a.substr(0,1)=="a"});
		alert(arr2);
	*/
	every:function(arr,callback,pThis){
		for (var i =0,len=arr.length;i<len;i++) {
			if(i in arr && !callback.call(pThis,arr[i],i,arr)) return false;
		}
		return true;
	},

	/** 
	* 返回一个元素在数组中的位置（从前往后找）。如果数组里没有该元素，则返回-1
	* @method indexOf
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Object} obj 元素，可以是任何类型
	* @optional {int} fromIdx (Optional) 从哪个位置开始找起，如果为负，则表示从length+startIdx开始找
	* @return {int} 则返回该元素在数组中的位置.
	* @example 
		var arr=["a","b","c"];
		alert(indexOf(arr,"c"));
	*/
	indexOf:function(arr,obj,fromIdx){
		var len=arr.length;
		fromIdx=fromIdx|0;//取整
		if(fromIdx<0) fromIdx+=len;
		if(fromIdx<0) fromIdx=0;
		for(; fromIdx < len; fromIdx ++){
			if(fromIdx in arr && arr[fromIdx] === obj) return fromIdx;
		}
		return -1;
	},

	/** 
	* 返回一个元素在数组中的位置（从后往前找）。如果数组里没有该元素，则返回-1
	* @method lastIndexOf
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Object} obj 元素，可以是任何类型
	* @optional {int} fromIdx (Optional) 从哪个位置开始找起，如果为负，则表示从length+startIdx开始找
	* @return {int} 则返回该元素在数组中的位置.
	* @example 
		var arr=["a","b","a"];
		alert(lastIndexOf(arr,"a"));
	*/
	lastIndexOf:function(arr,obj,fromIdx){
		var len=arr.length;
		fromIdx=fromIdx|0;//取整
		if(!fromIdx || fromIdx>=len) fromIdx=len-1;
		if(fromIdx<0) fromIdx+=len;
		for(; fromIdx >-1; fromIdx --){
			if(fromIdx in arr && arr[fromIdx] === obj) return fromIdx;
		}
		return -1;
	},

	/** 
	* 判断数组是否包含某元素
	* @method contains
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Object} obj 元素，可以是任何类型
	* @return {boolean} 如果元素存在于数组，则返回true，否则返回false
	* @example 
		var arr=["a","b","c"];
		alert(contains(arr,"c"));
	*/
	contains:function(arr,obj) {
		return (ArrayH.indexOf(arr,obj) >= 0);
	},

	/** 
	* 清空一个数组
	* @method clear
	* @static
	* @param {Array} arr 待处理的数组.
	* @return {void} 
	*/
	clear:function(arr){
		arr.length = 0;
	},

	/** 
	* 将数组里的某(些)元素移除。
	* @method remove
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Object} obj0 待移除元素
	* @param {Object} obj1 … 待移除元素
	* @return {number} 返回第一次被移除的位置。如果没有任何元素被移除，则返回-1.
	* @example 
		var arr=["a","b","c"];
		remove(arr,"a","c");
		alert(arr);
	*/
	remove:function(arr,obj){
		var idx=-1;
		for(var i=1;i<arguments.length;i++){
			var oI=arguments[i];
			for(var j=0;j<arr.length;j++){
				if(oI === arr[j]) {
					if(idx<0) idx=j;
					arr.splice(j--,1);
				}
			}
		}
		return idx;
	},

	/** 
	* 数组元素除重，得到新数据
	* @method unique
	* @static
	* @param {Array} arr 待处理的数组.
	* @return {void} 数组元素除重，得到新数据
	* @example 
		var arr=["a","b","a"];
		alert(unique(arr));
	*/
	unique:function(arr){
		var rlt = [];
		var oI=null;
		for(var i = 0; i < arr.length; i ++){
			if(ArrayH.indexOf(rlt,oI=arr[i])<0){
				rlt.push(oI);
			}
		}
		return rlt;
	},

	/** 
	* 合并两个已经unique过的数组，相当于两个数组concat起来，再unique，不过效率更高
	* @method union
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Array} arr2 待处理的数组.
	* @return {Array} 返回一个新数组
	* @example 
		var arr=["a","b"];
		var arr2=["b","c"];
		alert(union(arr,arr2));
	*/
	union:function(arr,arr2){
		var ra = [];
		for(var i = 0, len = arr2.length; i < len; i ++){
			if(!ArrayH.contains(arr,arr2[i])) {
				ra.push(arr2[i]);
			}
		}
		return [].concat(arr,ra);
	},

	/** 
	* 为数组元素进行递推操作。
	* @method reduce
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数。
	* @param {any} initial (Optional) 初始值，如果没有这初始，则从第一个有效元素开始。没有初始值，并且没有有效元素，会抛异常
	* @return {any} 返回递推结果. 
	* @example 
		var arr=[1,2,3];
		alert(reduce(arr,function(a,b){return Math.max(a,b);}));
	*/
	reduce:function(arr,callback,initial){
		var len=arr.length;
		var i=0;
		if(arguments.length<3){//找到第一个有效元素当作初始值
			var hasV=0;
			for(;i<len;i++){
				if(i in arr) {initial=arr[i++];hasV=1;break;}
			}
			if(!hasV) throw new Error("No component to reduce");
		}
		for(;i<len;i++){
			if(i in arr) initial=callback(initial,arr[i],i,arr);
		}
		return initial;
	},

	/** 
	* 为数组元素进行逆向递推操作。
	* @method reduceRight
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数。
	* @param {any} initial (Optional) 初始值，如果没有这初始，则从第一个有效元素开始。没有初始值，并且没有有效元素，会抛异常
	* @return {any} 返回递推结果. 
	* @example 
		var arr=[1,2,3];
		alert(reduceRight(arr,function(a,b){return Math.max(a,b);}));
	*/
	reduceRight:function(arr,callback,initial){
		var len=arr.length;
		var i=len-1;
		if(arguments.length<3){//逆向找到第一个有效元素当作初始值
			var hasV=0;
			for(;i>-1;i--){
				if(i in arr) {initial=arr[i--];hasV=1;break;}
			}
			if(!hasV) throw new Error("No component to reduceRight");
		}
		for(;i>-1;i--){
			if(i in arr) initial=callback(initial,arr[i],i,arr);
		}
		return initial;
	},

	/**
	* 将一个数组扁平化
	* @method expand
	* @static
	* @param {Array} arr要扁平化的数组
	* @return {Array} 扁平化后的数组
	*/	
	expand:function(arr){
		return [].concat.apply([], arr);
	},

	/** 
	* 将一个泛Array转化成一个Array对象。
	* @method toArray
	* @static
	* @param {Array} arr 待处理的Array的泛型对象.
	* @return {Array}  
	*/
	toArray:function(arr){
		var ret=[];
		for(var i=0;i<arr.length;i++){
			ret[i]=arr[i];
		}
		return ret;
	}

};

QW.ArrayH=ArrayH;

})();



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

/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: JK
*/


/**
 * @class HelperH
 * <p>一个Helper是指同时满足如下条件的一个对象：</p>
 * <ol><li>Helper是一个不带有可枚举proto属性的简单对象（这意味着你可以用for...in...枚举一个Helper中的所有属性和方法）</li>
 * <li>Helper可以拥有属性和方法，但Helper对方法的定义必须满足如下条件：</li>
 * <div> 1). Helper的方法必须是静态方法，即内部不能使用this。</div>
 * <div> 2). 同一个Helper中的方法的第一个参数必须是相同类型或相同泛型。</div>
 * <li> Helper类型的名字必须以Helper或大写字母H结尾。 </li>
 * <li> 对于只满足第一条的JSON，也算是泛Helper，通常以“U”（util）结尾。 </li>
 * <li> 本来Util和Helper应该是继承关系，但是JavaScript里我们把继承关系简化了。</li>
 * </ol>
 * @singleton
 * @namespace QW
 * @helper
 */

(function(){

var FunctionH = QW.FunctionH,
	ObjectH = QW.ObjectH;

var HelperH = {
	/**
	* 对于需要返回wrap对象的helper方法，进行结果包装
	* @method rwrap
	* @static
	* @param {Helper} helper Helper对象
	* @param {Class} wrapper 将返回值进行包装时的包装器(WrapClass)
	* @param {Object} wrapConfig 需要返回Wrap对象的方法的配置
	* @return {Object} 方法已rwrap化的<strong>新的</strong>Helper
	*/
	rwrap: function(helper, wrapper, wrapConfig){
		var ret = {};
		if(null == wrapConfig) wrapConfig = {};

		for(var i in helper){
			if((typeof wrapConfig == "number" || i in wrapConfig) && typeof helper[i] == "function"){
				var wrapC = typeof wrapConfig == "number" ? wrapConfig : wrapConfig[i];
				ret[i] = FunctionH.rwrap(helper[i], wrapper, wrapC);
			}
			else ret[i] = helper[i];
		}
		return ret;
	},
	/**
	* 根据配置，产生gsetter新方法，它根椐参数的参短来决定调用getter还是setter
	* @method gsetter
	* @static
	* @param {Helper} helper Helper对象
	* @param {Object} gsetterConfig 需要返回Wrap对象的方法的配置
	* @return {Object} 方法已rwrap化的<strong>新的</strong>helper
	*/
	gsetter: function(helper,gsetterConfig){
		gsetterConfig=gsetterConfig||{};
		for(var i in gsetterConfig){
			helper[i]=function(config){
				return function(){return helper[config[Math.min(arguments.length,config.length)-1]].apply(null,arguments);}
			}(gsetterConfig[i]);
		}
		return helper;
	},
	/**
	* 对helper的方法，进行mul化，使其在第一个参数为array时，结果也返回一个数组
	* @method mul
	* @static
	* @param {Object} helper Helper对象
	* @param {boolean} recursive (Optional) 是否递归
	* @return {Object} 方法已mul化的<strong>新的</strong>Helper
	*/
	mul: function (helper, recursive){ 
		var ret = {};
		for(var i in helper){
			if(typeof helper[i] == "function")
				ret[i] = FunctionH.mul(helper[i], recursive);
			else
				ret[i] = helper[i];
		}
		return ret;
	},
	/**
	* 将一个Helper应用到某个Object上，Helper上的方法作为静态函数，即：extend(obj,helper)
	* @method applyTo
	* @static
	* @param {Object} helper Helper对象，如DateH
	* @param {Object} obj 目标对象.
	* @return {Object} 应用Helper后的对象 
	*/
	applyTo: function(helper,obj){

		return ObjectH.mix(obj, helper);  //复制属性
	},
	/**
	* 对helper的方法，进行methodize化，使其的第一个参数为this，或this[attr]。
	* <strong>methodize方法会抛弃掉helper上的非function类成员以及命名以下划线开头的成员（私有成员）</strong>
	* @method methodize
	* @static
	* @param {Object} helper Helper对象，如DateH
	* @param {string} attr (Optional)属性
	* @return {Object} 方法已methodize化的<strong>新的</strong>Helper
	*/
	methodize: function(helper, attr){
		var ret = {};
		for(var i in helper){
			if(typeof helper[i] == "function" && !/^_/.test(i)){
				ret[i] = FunctionH.methodize(helper[i], attr); 
			}
		}
		return ret;
	},
	/**
	* <p>将一个Helper应用到某个Object上，Helper上的方法作为对象方法</p>
	* @method methodizeTo
	* @static
	* @param {Object} helper Helper对象，如DateH
	* @param {Object} obj  目标对象.
	* @param {string} attr (Optional) 包装对象的core属性名称。如果为空，则用this，否则用this[attr]，当作Helper方法的第一个参数
	* @return {Object} 应用Helper后的对象
	*/
	methodizeTo: function(helper, obj, attr){

		helper = HelperH.methodize(helper,attr);	//方法化
		
		return ObjectH.mix(obj, helper);  //复制属性		 
	}
};

QW.HelperH = HelperH;
})();

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



/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: JK
*/

/**
 * @class Selector Css Selector相关的几个方法
 * @singleton
 * @namespace QW
 */
(function(){
var trim=QW.StringH.trim;

var Selector={
	/**
	 * @property {int} queryStamp 最后一次查询的时间戳，扩展伪类时可能会用到，以提速
	 */
	queryStamp:0,
	/**
	 * @property {Json} _operators selector属性运算符
	 */
	_operators:{	//以下表达式，aa表示attr值，vv表示比较的值
		'': 'aa',//isTrue|hasValue
		'=': 'aa=="vv"',//equal
		'!=': 'aa!="vv"', //unequal
		'~=': 'aa&&(" "+aa+" ").indexOf(" vv ")>-1',//onePart
		'|=': 'aa&&(aa+"-").indexOf("vv-")==0', //firstPart
		'^=': 'aa&&aa.indexOf("vv")==0', // beginWith
		'$=': 'aa&&aa.lastIndexOf("vv")==aa.length-"vv".length', // endWith
		'*=': 'aa&&aa.indexOf("vv")>-1' //contains
	},
	/**
	 * @property {Json} _shorthands 缩略写法
	 */
    _shorthands: [
		[/\#([\w\-]+)/g,'[id="$1"]'],//id缩略写法
		[/^([\w\-]+)/g, function(a,b){return '[tagName="'+b.toUpperCase()+'"]';}],//tagName缩略写法
		[/\.([\w\-]+)/g, '[className~="$1"]'],//className缩略写法
		[/^\*/g, '[tagName]']//任意tagName缩略写法
	],
	/**
	 * @property {Json} _pseudos 伪类逻辑
	 */
	_pseudos:{
		"first-child":function(a){return a.parentNode.getElementsByTagName("*")[0]==a;},
		"last-child":function(a){return !(a=a.nextSibling) || !a.tagName && !a.nextSibling;},
		"only-child":function(a){return getChildren(a.parentNode).length==1;},
		"nth-child":function(a,iFlt){return iFlt(getNth(a,false)); },
		"nth-last-child":function(a,iFlt){return iFlt(getNth(a,true)); },
		"first-of-type":function(a){ var tag=a.tagName; while(a=a.previousSlibling){if(a.tagName==tag) return false;} return true;},
		"last-of-type":function(a){ var tag=a.tagName; while(a=a.nextSibling){if(a.tagName==tag) return false;} return true; },
		"only-of-type":function(a){var els=a.parentNode.childNodes; for(var i=els.length-1;i>-1;i--){if(els[i].tagName==a.tagName && els[i]!=a) return false;} return true;},
		"nth-of-type":function(a,iFlt){var idx=1,tag=a.tagName;while(a=a.previousSibling) {if(a.tagName==tag) idx++;} return iFlt(idx); },//JK：懒得为这两个伪类作性能优化
		"nth-last-of-type":function(a,iFlt){var idx=1,tag=a.tagName;while(a=a.nextSibling) {if(a.tagName==tag) idx++;} return iFlt(idx); },//JK：懒得为这两个伪类作性能优化
		"empty":function(a){ return !a.firstChild; },
		"parent":function(a){ return !!a.firstChild; },
		"not":function(a,sFlt){ return !sFlt(a); },
		"enabled":function(a){ return !a.disabled; },
		"disabled":function(a){ return a.disabled; },
		"checked":function(a){ return a.checked; },
		"contains":function(a,s){return (a.textContent || a.innerText || "").indexOf(s) >= 0;}
	},
	/**
	 * @property {Json} _attrGetters 常用的Element属性
	 */
	_attrGetters:function(){ 
		var o={'class': 'el.className',
			'for': 'el.htmlFor',
			'href':'el.getAttribute("href",2)'};
		var attrs='name,id,className,value,selected,checked,disabled,type,tagName,readOnly'.split(',');
		for(var i=0,a;a=attrs[i];i++) o[a]="el."+a;
		return o;
	}(),
	/**
	 * @property {Json} _relations selector关系运算符
	 */
	_relations:{
		//寻祖
		"":function(el,filter,topEl){
			while((el=el.parentNode) && el!=topEl){
				if(filter(el)) return el;
			}
			return null;
		},
		//寻父
		">":function(el,filter,topEl){
			el=el.parentNode;
			return el!=topEl&&filter(el) ? el:null;
		},
		//寻最小的哥哥
		"+":function(el,filter){
			while(el=el.previousSibling){
				if(el.tagName){
					return filter(el) && el;
				}
			}
			return null;
		},
		//寻所有的哥哥
		"~":function(el,filter){
			while(el=el.previousSibling){
				if(el.tagName && filter(el)){
					return el;
				}
			}
			return null;
		}
	},
	/** 
	 * 把一个selector字符串转化成一个过滤函数.
	 * @method selector2Filter
	 * @static
	 * @param {string} sSelector 过滤selector，这个selector里没有关系运算符（", >+~"）
	 * @returns {function} : 返回过滤函数。
	 * @example: 
		var fun=selector2Filter("input.aaa");alert(fun);
	 */
	selector2Filter:function(sSelector){
		return s2f(sSelector);
	},
	/** 
	 * 判断一个元素是否符合某selector.
	 * @method test 
	 * @static
	 * @param {HTMLElement} el: 被考察参数
	 * @param {string} sSelector: 过滤selector，这个selector里没有关系运算符（", >+~"）
	 * @returns {function} : 返回过滤函数。
	 */
	test:function(el,sSelector){
		return s2f(sSelector)(el);
	},
	/** 
	 * 以refEl为参考，得到符合过滤条件的HTML Elements. refEl可以是element或者是document
	 * @method query
	 * @static
	 * @param {HTMLElement} refEl: 参考对象
	 * @param {string} sSelector: 过滤selector,
	 * @returns {array} : 返回elements数组。
	 * @example: 
		var els=query(document,"li input.aaa");
		for(var i=0;i<els.length;i++ )els[i].style.backgroundColor='red';
	 */
	query:function(refEl,sSelector){
		Selector.queryStamp = queryStamp++;
		refEl=refEl||document.documentElement;
		var els=nativeQuery(refEl,sSelector);
		if(els) return els;//优先使用原生的
		var groups=trim(sSelector).split(",");
		var els=querySimple(refEl,groups[0]);
		for(var i=1,gI;gI=groups[i];i++){
			var els2=querySimple(refEl,gI);
			els=els.concat(els2);
			//els=union(els,els2);//除重会太慢，放弃此功能
		}
		return els;
	}

};

/*
	retTrue 一个返回为true的函数
*/
function retTrue(){
	return true;
}

/*
	arrFilter(arr,callback) : 对arr里的元素进行过滤
*/
function arrFilter(arr,callback){
	if(callback==retTrue){
		if(arr instanceof Array) return arr;
		else{
			for(var rlt=[],i=0,len=arr.length;i<len;i++) {
				rlt[i]=arr[i];
			}
		}
	}
	else{
		for(var rlt=[],i=0,oI;oI=arr[i++];) {
			callback(oI) && rlt.push(oI);
		}
	}
	return rlt;
};

var elContains,//部分浏览器不支持contains()，例如FF
	getChildren,//部分浏览器不支持children，例如FF3.5-
	hasNativeQuery,//部分浏览器不支持原生querySelectorAll()，例如IE8-
	findId=function(id) {return document.getElementById(id);};

(function(){
	var div=document.createElement('div');
	div.innerHTML='<div class="aaa"></div>';
	hasNativeQuery=(div.querySelectorAll && div.querySelectorAll('.aaa').length==1);
	elContains=div.contains?
		function(pEl,el){ return pEl!=el && pEl.contains(el);}:
		function(pEl,el){ return (pEl.compareDocumentPosition(el) & 16);};
	getChildren=div.children?
		function(pEl){ return pEl.children;}:
		function(pEl){ 
			return arrFilter(pEl.children,function(el){return el.tagName;});
		};
})();



/*
 * nth(sN): 返回一个判断函数，来判断一个数是否满足某表达式。
 * @param { string } sN: 表达式，如：'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
 * @return { function } function(i){return i满足sN}: 返回判断函数。
 */
function nth(sN){
	if(sN=="even") sN='2n';
	if(sN=="odd") sN='2n+1';
	sN=sN.replace(/(^|\D+)n/g,"$11n");
	if(!(/n/.test(sN))) {
		return function(i){return i==sN;}
	}
	else{
		var arr=sN.split("n");
		var a=arr[0]|0, b=arr[1]|0;
		return function(i){var d=i-b; return d>=0 && d%a==0;};
	}
}

/*
 * getNth(el,reverse): 得到一个元素的nth值。
 * @param { element } el: HTML Element
 * @param { boolean } : 是否反向算－－如果为真，相当于nth-last
 * @return { int } : 返回nth值
 */
function getNth(el,reverse){
	var pEl=el.parentNode;
	if(pEl.__queryStamp!=queryStamp){
		var els=getChildren(pEl);
		for(var i=0,elI;elI=els[i++];){
			elI.__siblingIdx=i;
		};
		pEl.__queryStamp=queryStamp;
		pEl.__childrenNum=i;
	}
	if(reverse) return pEl.__childrenNum-el.__siblingIdx+1;
	else return el.__siblingIdx;
}

/*
 * s2f(sSelector): 由一个selector得到一个过滤函数filter，这个selector里没有关系运算符（", >+~"）
 */
function s2f(sSelector){
	var pseudos=[];//伪类数组,每一个元素都是数组，依次为：伪类名／伪类值
	var attrs=[];//属性数组，每一个元素都是数组，依次为：属性名／属性比较符／比较值
	var s=trim(sSelector);
	s=s.replace(/\:([\w\-]+)(\(([^)]+)\))?/g,function(a,b,c,d,e){pseudos.push([b,d]);return "";});//伪类
	for(var i=0,shorthands=Selector._shorthands,sh;sh=shorthands[i];i++)
		s=s.replace(sh[0],sh[1]);
	var reg=/\[\s*([\w\-]+)\s*([!~|^$*]?\=)?\s*(?:(["']?)([^\]'"]*)\3)?\s*\]/g; //属性选择表达式解析
	s=s.replace(reg,function(a,b,c,d,e){attrs.push([b,c||"",e||""]);return "";});//普通写法[foo][foo=""][foo~=""]等
	if(!(/^\s*$/).test(s)) {
		var ex="Unsupported Selector:\n"+sSelector+"\n-"+s; 
		throw ex;
	}

	//将以上解析结果，转化成过滤函数
	var flts=[];
	if(attrs.length){
		var sFun=[];
		for(var i=0,attr;attr=attrs[i];i++){//属性过滤
			var attrGetter=Selector._attrGetters[attr[0]] || 'el.getAttribute("'+attr[0]+'")';
			sFun.push(Selector._operators[attr[1]].replace(/aa/g,attrGetter).replace(/vv(?=\W)/g,attr[2]));
		}
		sFun='return '+sFun.join("&&");
		flts.push(new Function("el",sFun));
	}
	for(var i=0,pI;pI=pseudos[i];i++) {//伪类过滤
		var fun=Selector._pseudos[pI[0]];
		if(!fun) {
			var ex="Unsupported Selector:\n"+pI[0]+"\n"+s;
			throw ex;
		}
		if(pI[0].indexOf("nth-")==0){ //把伪类参数，转化成过滤函数。
			flts.push(function(fun,arg){return function(el){return fun(el,arg);}}(fun,nth(pI[1])));
		}
		else if(pI[0]=="not"){ //把伪类参数，转化成过滤函数。
			flts.push(function(fun,arg){return function(el){return fun(el,arg);}}(fun,s2f(pI[1])));
		}
		else if(pI[0]=="contains"){ //把伪类参数，转化成过滤函数。
			flts.push(function(fun,arg){return function(el){return fun(el,arg);}}(fun,pI[1]));
		}
		else flts.push(fun);
	}
	//返回终级filter function
	var fltsLen=flts.length;
	switch(fltsLen){//返回越简单越好
		case 0: return retTrue;
		case 1: return flts[0];
		case 2: return function(el){return flts[0](el)&&flts[1](el);};
	}
	return function(el){
		for (var i=0;i<fltsLen;i++){
			if(!flts[i](el)) return false;
		}
		return true;
	};
};

/* 
	* {int} xxxStamp: 全局变量查询标记
 */
var queryStamp=0,
	relationStamp=0,
	querySimpleStamp=0;

/*
* nativeQuery(refEl,sSelector): 如果有原生的querySelectorAll，并且只是简单查询，则调用原生的query，否则返回null. 
* @param {Element} refEl 参考元素
* @param {string} sSelector selector字符串
* @returns 
*/
function nativeQuery(refEl,sSelector){
		if(hasNativeQuery && /((^|,)\s*[^>+~][.\w\s\->,+~]*)+$/.test(sSelector)) {
			//如果浏览器自带有querySelectorAll，并且本次query的是简单selector，则直接调用selector以加速
			//部分浏览器不支持以">~+"开始的关系运算符
			var arr=[],els=refEl.querySelectorAll(sSelector);
			for(var i=0,elI;elI=els[i++];) arr.push(elI);
			return arr;
		}
		return null;
};

/* 
* querySimple(pEl,sSelector): 得到pEl下的符合过滤条件的HTML Elements. 
* sSelector里没有","运算符
* pEl是默认是document.body 
* @see: query。
*/
function querySimple(pEl,sSelector){
	querySimpleStamp++;
	/*
		为了提高查询速度，有以下优先原则：
		最优先：原生查询
		次优先：在' '、'>'关系符出现前，优先正向（从祖到孙）查询
		次优先：id查询
		次优先：只有一个关系符，则直接查询
		最原始策略，采用关系判断，即：从最底层向最上层连线，能连得成功，则满足条件
	*/

	//最优先：原生查询
	var els=nativeQuery(pEl,sSelector);
	if(els) return els;//优先使用原生的


	var sltors=[];
	var reg=/(^|\s*[>+~ ]\s*)(([\w\-\:.#*]+|\([^\)]*\)|\[[^\]]*\])+)(?=($|\s*[>+~ ]\s*))/g;
	var s=trim(sSelector).replace(reg,function(a,b,c,d){sltors.push([trim(b),c]);return "";});
	if(!(/^\s*$/).test(s)) {
		var ex="Unsupported Selector:\n"+sSelector+"\n--"+s; 
		throw ex;
	}

	//次优先：在' '、'>'关系符出现前，优先正向（从上到下）查询
	var pEls=[pEl];
	var sltor0;
	while(sltor0=sltors[0]){
		if(!pEls.length) return [];
		var relation=sltor0[0];
		els=[];
		if(relation=='+'){//第一个弟弟
			filter=s2f(sltor0[1]);
			for(var i=0,pElI;pElI=pEls[i++];){
				var elI=pElI;
				while(elI=elI.nextSibling){
					if(elI.tagName){
						if(filter(elI)) els.push(elI);
						break;
					}
				}
			}
			pEls=els;
			sltors.splice(0,1);
		}
		else if(relation=='~'){//所有的弟弟
			filter=s2f(sltor0[1]);
			for(var i=0,pElI;pElI=pEls[i++];){
				var elI=pElI;
				if(i>1 && pElI.parentNode==pEls[i-2].parentNode) continue;//除重：如果已经query过兄长，则不必query弟弟
				while(elI=elI.nextSibling){
					if(elI.tagName){
						if(filter(elI)) els.push(elI);
					}
				}
			}
			pEls=els;
			sltors.splice(0,1);
		}
		else{
			break;
		}
	}
	if(!sltors.length || !pEls.length) return pEls;
	
	//次优先：idIdx查询
	for(var idIdx=0;sltor=sltors[idIdx];idIdx++){
		if((/^[.\w-]*#([\w-]+)/i).test(sltor[1])) break;
	}
	if(idIdx<sltors.length){//存在id
		var idEl=findId(RegExp.$1);
		if(!idEl) return [];
		for(var i=0,pElI;pElI=pEls[i++];){
			if(elContains(pElI,idEl)) {
				els=filterByRelation(pEl,[idEl],sltors.slice(0,idIdx+1));
				if(!els.length || idIdx==sltors.length-1) return els;
				return querySimple(idEl,sltors.slice(idIdx+1).join(',').replace(/,/g,' '));
			}
		}
		return [];
	}

	//---------------
	var getChildrenFun=function(pEl){return pEl.getElementsByTagName(tagName);},
		tagName='*',
		className='';
	sSelector=sltors[sltors.length-1][1];
	sSelector=sSelector.replace(/^[\w\-]+/,function(a){tagName=a;return ""});
	if(hasNativeQuery){
		sSelector=sSelector.replace(/^[\w\*]*\.([\w\-]+)/,function(a,b){className=b;return ""});
	}
	if(className){
		getChildrenFun=function(pEl){return pEl.querySelectorAll(tagName+'.'+className);};
	}

	//次优先：只剩一个'>'或' '关系符(结合前面的代码，这时不可能出现还只剩'+'或'~'关系符)
	if(sltors.length==1){
		if(sltors[0][0]=='>') {
			getChildrenFun=getChildren;
			var filter=s2f(sltors[0][1]);
		}
		else{
			filter=s2f(sSelector);
		}
		els=[];
		for(var i=0,pElI;pElI=pEls[i++];){
			els=els.concat(arrFilter(getChildrenFun(pElI),filter));
		}
		return els;
	}

	//走第一个关系符是'>'或' '的万能方案
	sltors[sltors.length-1][1] = sSelector;
	els=[];
	for(var i=0,pElI;pElI=pEls[i++];){
		els=els.concat(filterByRelation(pElI,getChildrenFun(pElI),sltors));
	}
	return els;
};

/*
判断一个长辈与子孙节点是否满足关系要求。----特别说明：这里的第一个关系只能是父子关系，或祖孙关系;
*/

function filterByRelation(pEl,els,sltors){
	relationStamp++;
	var sltor=sltors[0],
		len=sltors.length,
		relationJudge=sltor[0]?	//
			function(el){return el.parentNode==pEl;}:
			retTrue;
	var filters=[],
		reations=[],
		needNext=[];
		
	for(var i=0;i<len;i++){
		sltor=sltors[i];
		filters[i]=s2f(sltor[1]);//过滤
		reations[i]=Selector._relations[sltor[0]];//寻亲函数
		if(sltor[0]=='' || sltor[0]=='~') needNext[i]=true;//是否递归寻亲
	}
	els=arrFilter(els,filters[len-1]);//自身过滤
	if(len==1) return arrFilter(els,relationJudge);

	function chkRelation(el){//关系人过滤
		var parties=[],//中间关系人
			j=len-1,
			party=parties[j]=reations[j](el,filters[j-1],pEl);
		if(!party) {
			return false;
		}
		for(j--;j>-1;j--){
			if(party){
				if(j==0){
					if(relationJudge(party)) return true;//通过最后的检查
					else party=null;//在最后一关被打回
				}
				//else if(sltors[j][5] && !elContains(pEl,party)) party=null;//找过头了
				else{
					party=parties[j]=reations[j](parties[j+1],filters[j-1],pEl);
					if(party) continue;
				}
			}
			while (!party){//回溯
				j++;//回退一步
				if(j==len) return false;//退到底了
				if(needNext[j]) party=parties[j]=reations[j](parties[j],filters[j-1],pEl);
			}
			party=parties[j]=reations[j](parties[j+1],filters[j-1],pEl);

		}
	};
	return arrFilter(els,chkRelation);
}

QW.Selector=Selector;
})();

/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: wangchen
*/

/**
 * @class EventH Event的扩展
 * @namespace QW
 * @helper
 */
 
 (function(){
var EventH={
	/**
	* @final KEY_X 一些常用的静态变量
	*/
	KEY_BACKSPACE: 8,
	KEY_TAB: 9,
	KEY_ENTER: 13,
	KEY_ESC: 27,
	KEY_LEFT: 37,
	KEY_UP: 38,
	KEY_RIGHT: 39,
	KEY_DOWN: 40,
	KEY_DELETE: 46,
	/**
	* 获取事件实例
	* @method getEvent
	* @param {Event} e (Optional) 事件实例
	* @return {window|document|Element} target 。
	* @return {HTMLElement} 返回事件的target。
	*/
	getEvent: function(e,target) {
		if(e) return e;
		if ('object' == typeof Event) {//Firefox等，上溯查找
			var f = arguments.callee;
			do {
				if (f.arguments[0] instanceof Event) return f.arguments[0];
			} while (f = f.caller);
			return null;
		} 
		//IE下需要找到对应的window
		if(target){
			var doc,win;
			if (target.window == target) return target.event;//window;
			if (doc = target.ownerDocument) return doc.parentWindow.event;//element etc.
			if (win = target.parentWindow) return win.event;
		}
		return window.event;
	},
	/**
	* 获取触发该事件的对象
	* @method target
	* @param {Event} e 事件参数
	* @return {HTMLElement} 返回事件的target。
	*/
	target: function(e) {
		e=e||EventH.getEvent();
		return e.target || e.srcElement;
	},

	/**
	* 获取触发该事件的relatedTarget
	* @method relatedTarget
	* @param {Event} e 事件参数
	* @return {HTMLElement} 返回事件的relatedTarget。
	*/
	relatedTarget : function (e) {
		e=e||EventH.getEvent();
		if ('relatedTarget' in e) return e.relatedTarget;
		return (e.type == 'mouseover') && e.fromElement 
			|| (e.type == 'mouseout') && e.toElement 
			|| null;
	},

	/** 
	* 事件触发时是否持续按住ctrl键
	* @method	ctrlKey
	* @param {Event} e 事件参数
	* @return	{boolean}	判断结果
	*/
	ctrlKey : function (e) {
		e=e||EventH.getEvent();
		return e.ctrlKey;
	},
	
	/** 
	* 事件触发时是否持续按住shift键
	* @method	shiftKey
	* @param {Event} e 事件参数
	* @return	{boolean}	判断结果
	*/
	shiftKey : function (e) {
		e=e||EventH.getEvent();
		return e.shiftKey;
	},
	
	/** 
	* 事件触发时是否持续按住alt键
	* @method	altKey
	* @param {Event} e 事件参数
	* @return	{boolean}	判断结果
	*/
	altKey : function (e) {
		e=e||EventH.getEvent();
		return e.altKey;
	},

	/** 
	* 获取鼠标滚轮方向
	* @method	detail
	* @optional {event}		event	event对象 默认为调用位置所在宿主的event
	* @optional {element}	element 任意element对象 element对象所在宿主的event
	* @return	{int}		>0 向下 <0 向上
	*/
	detail : function (e) {
		e = e || window.event;
		return e.detail || -(e.wheelDelta || 0);
	},

	/**
	* 获取keyCode
	* @method keyCode
	* @param {Event} e 事件参数
	* @return {int} 返回事件的keyCode
	*/
	keyCode: function(e) {
		e=e||EventH.getEvent();
		return e.which || e.keyCode || e.charCode;
	},

	/**
	* 判断是否单击鼠标左键
	* @method isLeftClick
	* @param {Event} e 事件参数
	* @return {boolean} 是否单击左键
	*/
	isLeftClick: function(e) {
		e=e||EventH.getEvent();
		return (((e.which) && (e.which == 1)) || ((e.button) && (e.button == 1)));
	},

	/**
	* 获取事件触发时鼠标相对文档左上角的x坐标，是相对于当前文档的位置，而不是屏幕
	* @method pageX
	* @param {Event} e 事件参数
	* @return {int} 获取事件触发时鼠标相对文档左上角的x坐标
	*/
	pageX: function(e) {
		e=e||EventH.getEvent();
		if(e.pageX!=null) return e.pageX;
		else return (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft)-2);
	},

	/**
	* 获取事件触发时鼠标相对文档左上角的y坐标
	* @method pageY
	* @param {Event} e 事件参数
	* @return {int} 获取事件触发时鼠标相对文档左上角的y坐标
	*/
	pageY: function(e) {
		e=e||EventH.getEvent();
		if(e.pageY!=null) return e.pageY;
		else return (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop)-2);
	},

	/**
	* 获取事件触发时鼠标相对图层元素左上角的x坐标
	* @method layerX
	* @param {Event} e 事件参数
	* @type {int} 获取事件触发时鼠标相对图层元素左上角的x坐标
	*/
	layerX: function(e) {
		e=e||EventH.getEvent();
		return e.layerX || e.offsetX;
	},

	/**
	* 获取事件触发时鼠标相对图层元素左上角的y坐标
	* @method layerY
	* @param {Event} e 事件参数
	* @type {int} 获取事件触发时鼠标相对图层元素左上角的y坐标
	*/
	layerY: function(e) {
		e=e||EventH.getEvent();
		return e.layerY || e.offsetY;
	},

	/**
	* 取消默认的事件
	* @method preventDefault
	* @param {Event} e 事件参数
	* @return {void} 
	*/
	preventDefault: function(e) {
		e=e||EventH.getEvent();
		if (e.preventDefault) { 
			e.preventDefault(); 
		} else {
			e.returnValue = false;
		}
	},

	/**
	* 停止事件的起泡
	* @method stopPropagation
	* @param {Event} e 事件参数
	* @return {void} 
	*/
	stopPropagation: function(e) {
		e=e||EventH.getEvent();
		if (e.stopPropagation) { 
			e.stopPropagation(); 
		} else {
			e.cancelBubble = true;
		}
	}
};
QW.EventH=EventH;
})();



/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: wangchen
*/
/** 
* @class EventW Event Wrap，event对象包装器
* @namespace QW
*/
QW.EventW = function () {
	this.chromeHack; //chrome bug hack

	/** 
	* @property core 原生Event实例
	* @type {Event}
	*/
	this.core = QW.EventH.getEvent.apply(null, arguments);

	/** 
	* @property target 事件触发的元素
	* @type {HTMLElement}
	*/
	this.target = this.target();

	/** 
	* @property relatedTarget mouseover/mouseout 事件时有效 over时为来源元素,out时为移动到的元素.
	* @type {HTMLElement}
	*/
	this.relatedTarget = this.relatedTarget();

	/** 
	* @property pageX 鼠标位于完整页面的X坐标
	* @type {int}
	*/
	this.pageX = this.pageX();

	/** 
	* @property pageX 鼠标位于完整页面的Y坐标
	* @type {int}
	*/
	this.pageY = this.pageY();
	//this.layerX = this.layerX();
	//this.layerY = this.layerY();

	/** 
	* @property detail 鼠标滚轮方向 大于0向下,小于0向上.
	* @type {int}
	*/
	this.detail = this.detail();

	/** 
	* @property keyCode 事件触发的按键对应的ascii码
	* @type {int}
	*/
	this.keyCode = this.keyCode();

	/** 
	* @property ctrlKey 事件触发时是否持续按住ctrl键
	* @type {boolean}
	*/
	this.ctrlKey = this.ctrlKey();

	/** 
	* @property shiftKey 事件触发时是否持续按住shift键
	* @type {boolean}
	*/
	this.shiftKey = this.shiftKey();

	/** 
	* @property altKey 事件触发时是否持续按住alt键
	* @type {boolean}
	*/
	this.altKey = this.altKey();

	/** 
	* @property button 事件触发的鼠标键位(左中右) 由于ie和其它浏览器策略很不相同，所以没有作兼容处理。这里返回的是原生结果
	* @type {boolean}
	*/
	this.button = this.core.button;
};

QW.HelperH.methodizeTo(QW.EventH, QW.EventW.prototype, 'core');

/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: wangchen
*/

/**
 * @class DomU DomU命名空间，收集一些常用的Dom相关方法
 * @singleton
 * @namespace QW
*/

(function(){
var Browser=QW.Browser,
	mix=QW.ObjectH.mix,
	Selector=QW.Selector;
function $F(s) { return parseInt(s)||0;};

var DomU={
	/** 
	* 按cssselector获取元素集 
	* @method	query
	* @param	{String} sSelector cssselector字符串
	* @param	{Element} refEl (Optional) 参考元素，默认为document.documentElement
	* @return	{Array}
	*/
	query: function (sSelector,refEl) {
		return Selector.query(refEl || document.documentElement,sSelector);
	},
	/** 
	* 通过html字符串创建DOM对象 
	* @method	create
	* @param	{string}	html html字符串
	* @param	{boolean}	rfrag (Optional) 是否返回documentFragment对象
	* @param	{document}	doc (Optional)在IE里，不同document下的element不能交互append，这种情况下，需要传入document对象。
	* @return	{HTMLElement | Fragment}	返回创建的element对象或documentFragment对象
	*/
	create : function () {
		var temp = document.createElement('div');
		return function (html, rfrag, doc) {
			var temp2=doc && doc.createElement('div') || temp;
			temp2.innerHTML = html;
			var el=temp2.firstChild;
			if (!el || !rfrag) {
				return el;
			} else {
				var frag = (doc || document).createDocumentFragment();
				while (el=temp2.firstChild) frag.appendChild(el);
				return frag;
			}
		};
	}(),
	/** 
	* 创建html元素 
	* @method	createElement
	* @param	{string}	tagName tagName
	* @param	{Json}	opts (Optional) 参多参数
	* @return	{HTMLElement}	返回创建的element
	*/
	createElement : function (tagName, opts) {
		var el=document.createElement(tagName);
		if(opts){
			for(var i in opts) el[i]=opts[i];
		}
		return el;
	},
	/** 
	* 把NodeCollection转为ElementCollection
	* @method	pluckWhiteNode
	* @param	{NodeCollection|array} list Node的集合
	* @return	{array}						Element的集合
	*/
	pluckWhiteNode : function (list) {
		for (var result = [], i = 0,el; el=list[i++] ;)
			if (el.nodeType==1) result.push(el);
		return result;
	},
	/** 
	* 判断Node实例是否继承了Element接口
	* @method	isElement
	* @param	{object} el Node的实例
	* @return	{boolean}		 判断结果
	*/
	isElement : function (el) {
		return !!(el && el.nodeType == 1);
	},
	/**
	* 返回rect1是否完整包含rect2
	* @method	rectContains
	* @param	{Region} rect1 参考区域1
	* @param	{Region} rect2 参考区域2
	* @return	{boolean} 如果rect1完整包含rect2，返回true；否则返回false。
	*/
	rectContains: function (rect1, rect2) {
		return ( rect1.left   <= rect2.left   && 
			rect1.right  >= rect2.right  && 
			rect1.top    <= rect2.top    && 
			rect1.bottom >= rect2.bottom  );
	},
	/**
	* rectIntersect(rect1, rect2): 得到两个区域的重叠区域
	* @method	rectIntersect
	* @param	{rect} rect1 参考区域1
	* @param	{rect} rect2 参考区域2
	* @return	{rect} 如果两个区域有重叠，则返回重叠区域，否则返回null。
	*/
	rectIntersect: function (rect1, rect2) {
		var t = Math.max( rect1.top,    rect2.top    ),
			r = Math.min( rect1.right,  rect2.right  ),
			b = Math.min( rect1.bottom, rect2.bottom ),
			l = Math.max( rect1.left,   rect2.left   );
		if (b >= t && r >= l) {
			return {left:l, top:t, width:r-l, height:b-t, right:r, bottom:b};
		} else {
			return null;
		}
	},
	/**
	* 得到页面区域的相关信息
	* @method	getDocRect
	* @param	{window} win 传入窗口对象，默认为当前window对象
	* @return	{Json} 包括以下属性:		
		{'scrollLeft': 1,  'scrollTop':1,
		'width'  : 1, 'height':1,
		'scrollWidth' : 1, 'scrollHeight': 1}
	*/
	getDocRect: function (win) {
		win=win||window;
		var doc = win.document,
			docEl=doc.documentElement,
			bd=doc.body,
			left = win.pageXOffset || Math.max($F(docEl.scrollLeft),$F(bd.scrollLeft)),
			top = win.pageYOffset || Math.max($F(docEl.scrollTop),$F(bd.scrollTop)),
			width = $F(docEl.clientWidth),
			height = $F(docEl.clientHeight),
			scrollHeight = Math.max ($F(docEl.scrollHeight), $F(bd.offsetHeight)),
			scrollWidth = Math.max ($F(docEl.scrollWidth),  $F(bd.offsetWidth));

		if((!doc.compatMode || doc.compatMode == 'CSS1Compat') 
			&& !Browser.opera	&& docEl.clientWidth) {
			//just as default;
		} else if (bd.clientWidth) {
			height = bd.clientHeight;
			width  = bd.clientWidth;
		} else if(win.innerWidth) {
			height = win.innerHeight;
			width  = win.innerWidth;
		} 

		if(Browser.safari) {
			scrollHeight = Math.max(scrollHeight, $F(bd.scrollHeight));
			scrollWidth = Math.max(scrollWidth, $F(bd.scrollWidth));
		}

		scrollHeight = Math.max(height,scrollHeight);
		scrollWidth = Math.max(width,scrollWidth);

		return {
		'scrollLeft': left,  'scrollTop':top,
		'width'  : width, 'height':height,
		'scrollWidth' : scrollWidth, 'scrollHeight': scrollHeight
		}
	},
	/** 
	* 监听DOM树结构初始化完毕事件
	* @method	ready
	* @param	{function} handler 事件处理程序
	* @return	{void}
	*/
	ready : function (handler) {
		if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', handler, false);
		} else {
			var fireDOMReadyEvent = function () {
				fireDOMReadyEvent = new Function;
				handler();
			};
			(function () {
				try {
					document.body.doScroll('left');
				} catch(ex) {
					setTimeout(arguments.callee, 10);
					return ;
				}
				fireDOMReadyEvent();
			})();
			document.attachEvent('onreadystatechange', function () {
				/^(?:loaded|complete)$/.test(document.readyState) && fireDOMReadyEvent();
			});
		}
	}
};

QW.DomU=DomU;
})();



/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: wangchen
	author: JK
*/


/**
 * @class NodeH Element的扩展
 * @singleton
 * @namespace QW
 * @helper
 */
(function(){
var StringH=QW.StringH,
	trim=StringH.trim,
	camelize=StringH.camelize,
	decamelize=StringH.decamelize,
	mix=QW.ObjectH.mix,
	getDocRect=QW.DomU.getDocRect,
	create=QW.DomU.create,
	Selector=QW.Selector,
	query=Selector.query,
	selector2Filter=Selector.selector2Filter,
	Browser=QW.Browser;
/**
* 得到一个HTML Element对象。如果参数不是字符串，就返回参数本身. 
* @method	$
* @param	{String} id HTML Element的id.
* @param	{document} doc 目标document.
* @return	{Object} 参数如果是字符串，就返回document.getElementById，否则就返回参数本身
*/
function $(id, doc){
	if ('string' == typeof id) 
		return (doc || document).getElementById(id);
	else
		return (id && ('core' in id)) ? $(id.core,doc) : id;
};

var NodeH={
	//--//JsData系列
	/**
	* JsData 一个命名空间，用来存贮跟元素对应变量.
	* @property	{Json} JsData 用来存贮跟元素对应的某些变量。
		示例：
		{
			valid:{
				'.date':{'format':'yyyy-mm-dd','minValue':'2008-01-01'},
				'#myDate':{'minDate':'2009-01-01'}
			},
			effect:{
				'DIV':{easing:function(per){return per}},
				'.slow':{per:50}
			}
		}
	*/
	JsData:{},
	/** 
	* 从JsData中获取element对象的属性
	* @method	getJsAttr
	* @param	{HTMLElement} el 目标对象
	* @param	{string} attribute 属性名称
	* @param	{string|Json} ns 如果是字符串，则ns=NodeH.JsData[ns]；否则把它当一个Json来处理
	* @return	{any}
	*/
	getJsAttr: function (el, attribute, ns) {
		el=$(el);
		if(typeof ns =='string') ns=NodeH.JsData[ns];
		var keys=(el.id && ['#'+el.id] || []).concat(el.className.match(/\.[\w\-]+/g) ||[], el.tagName),//优先度:id>className>tagName
			len=keys.length;
		for(var i=0;i<len;i++){
			var key=keys[i];
			if((key in ns) && (attribute in ns[key])) return ns[key][attribute];
		}
		return null;
	},
	/** 
	* 获取element对象的属性,如果未获取成功，则从JsData中获取element对象的属性
	* @method	getExAttr
	* @param	{HTMLElement} el 目标对象
	* @param	{string} attribute 属性名称
	* @optional	{string|Json} ns 请参考getJsAttr的ns参数
	* @return	{any}
	*/
	getExAttr: function (el, attribute, ns) {
		el=$(el);
		if(attribute in el) return el[attribute];
		var value=el.getAttribute(attribute);
		if(value) return value;
		return NodeH.getJsAttr(el,attribute,ns);
	},

	//--//以下为getElements系列
	$:$,
	/**
	* 方法"$"的一个别名. 
	* @method	g
	* @see	$
	*/
	query:function(refEl,sSelector){
		var el2=$(refEl);
		if(refEl && !el2) throw new Error('null');//以下情况抛出异常：refEl是一个找不到对象的id，
		return query(el2,sSelector);
	},
	/**
	* 通过className来得到元素集合.
	* @method	getElementsByClass
	* @param	{HTMLElement} refEl 容器对象
	* @param	{string} className className.
	* @return	{Array} 返回Element数组
	*/
	getElementsByClass:function(refEl,className){
		return NodeH.query(refEl,"."+className);
	},
	/**
	* 通过className来得到元素集合.
	* @method	getElementsByTagName
	* @param	{string} tagName tagName.
	* @param	{HTMLElement} pEl 容器对象
	* @return	{Array} 返回Element数组
	*/
	getElementsByTagName:function(pEl,tagName){
		return NodeH.query(pEl,tagName);
	},

	//--// Dom判断与Dom关系系列
	/**
	* 满足条件的最近祖先节点
	* @method	ancestorNode
	* @param	{String} sSelector css选择器，可以为空
	* @return	{HTMLElement} 返回满足条件的祖先节点，如果没有祖先节点满足条件，则返回null
	*/
	ancestorNode: function(el, sSelector) {
		return findFirst($(el).parentNode,'parentNode',sSelector);
	},
	/**
	* 满足条件的最近弟弟节点
	* @method	nextSibling
	* @param	{String} sSelector css选择器，可以为空
	* @return	{HTMLElement} 返回满足条件的弟弟节点，如果没有弟弟节点满足条件，则返回null
	*/
	nextSibling: function (el,sSelector) {
		return findFirst($(el).nextSibling,'nextSibling',sSelector);
	},
	/**
	* 满足条件的最近兄长节点
	* @method	previousSibling
	* @param	{String} sSelector css选择器，可以为空
	* @return	{HTMLElement} 返回满足条件的兄长节点，如果没有兄长节点满足条件，则返回null
	*/
	previousSibling: function (el,sSelector) {
		return findFirst($(el).previousSibling,'previousSibling',sSelector);
	},
	/**
	* 满足条件的最长的儿子
	* @method	firstChild
	* @param	{String} sSelector css选择器，可以为空
	* @return	{HTMLElement} 返回满足条件的最长的儿子，如果没有儿子满足条件，则返回null
	*/
	firstChild: function (el,sSelector) {
		return findFirst($(el).firstChild,'nextSibling',sSelector);
	},
	/**
	* 满足条件的最小的儿子
	* @method	lastChild
	* @param	{String} sSelector css选择器，可以为空
	* @return	{HTMLElement} 返回满足条件的最长的儿子，如果没有儿子满足条件，则返回null
	*/
	lastChild: function (el,sSelector) {
		return findFirst($(el).lastChild,'previousSibling',sSelector);
	},
	/**
	* 一个元素是否包含另一个元素
	* @method	contains
	* @param	{HTMLElement} pEl 父元素
	* @param	{HTMLElement} el 子(孙)元素
	* @return	{HTMLElement} 如果是包含关系，返回true，否则返回false
	*/
	contains: function (pEl, el) {
		pEl=$(pEl);
		el=$(el);
		return pEl.contains ? 
			pEl != el && pEl.contains(el) : 
			!!(pEl.compareDocumentPosition(el) & 16);
	},


	//--// Dom节点操作系列
	/**
	* appendChild
	* @method	appendChild
	* @see	DOMLevel1.appendChild
	*/
	appendChild: function (pEl, el) {
		return $(pEl).appendChild($(el));
	},
	/** 
	* 向element对象内部的某元素前插入element对象
	* @method	insertBefore
	* @param	{HTMLElement} el	id,Element实例或wrap
	* @param	{HTMLElement} nel	目标id,Element实例或wrap
	* @param	{HTMLElement} rel	插入到id,Element实例或wrap前
	* @return	{HTMLElement} 目标element对象
	*/
	insertBefore : function (el, nel, rel) {
		return $(el).insertBefore($(nel), rel && $(rel) || null);
	},
	/** 
	* 向element对象内部的某元素后插入element对象
	* @method	insertAfter
	* @param	{HTMLElement} el id,Element实例或wrap
	* @param	{HTMLElement} nel 目标id,Element实例或wrap
	* @param	{HTMLElement} rel 插入到id,Element实例或wrap后
	* @return	{HTMLElement} 目标element对象
	*/
	insertAfter : function (el, nel, rel) {
		return $(el).insertBefore($(nel), rel && $(rel).nextSibling || null);
	},
	/** 
	* 向element对象前插入element对象
	* @method	insertSiblingBefore
	* @param	{HTMLElement} el 元素
	* @param	{HTMLElement} nel 新元素
	* @return	{HTMLElement} 目标element对象
	*/
	insertSiblingBefore : function (el, nel) {
		el = $(el);
		return el.parentNode.insertBefore($(nel), el);
	},
	/** 
	* 向element对象后插入element对象
	* @method	insertSiblingAfter
	* @param	{HTMLElement} el 元素
	* @param	{HTMLElement} nel 新元素
	* @return	{HTMLElement} 目标element对象
	*/
	insertSiblingAfter : function (el, nel) {
		el = $(el);
		el.parentNode.insertBefore($(nel), el.nextSibling || null);
	},
	/**
	* removeChild
	* @method	removeChild
	* @see	DOMLevel1.removeChild
	*/
	removeChild: function (pEl, el) {
		return $(pEl).removeChild($(el));
	},
	/**
	* 移除元素
	* @method	removeNode
	* @param	{HTMLElement} el 待移除的HTMLElement
	* @return	{void} 无返回值
	*/
	removeNode: function (el) {
		el=$(el);
		return el.parentNode.removeChild(el);
	},
	/**
	* cloneNode
	* @method	cloneNode
	* @see	DOMLevel1.cloneNode
	*/
	cloneNode: function (el,bCloneChildren) {
		el=$(el);
		return el.cloneNode(bCloneChildren);
	},
	/** 
	* 设置element对象的属性
	* @method	setAttr
	* @param	{HTMLElement} el 目标对象
	* @param	{string} attribute 属性名称
	* @param	{string} value 属性的值
	* @param	{int} iCaseSensitive (Optional)
	* @return	{void}
	*/
	setAttr: function (el, attribute, value, iCaseSensitive) {
		el=$(el);
		el.setAttribute(attribute, value, iCaseSensitive);
	},
	/** 
	* 获取element对象的属性
	* @method	getAttr
	* @param	{HTMLElement} el 目标对象
	* @param	{string} attribute 属性名称
	* @optional	{int} iFlags
	* @return	{any}
	*/
	getAttr: function (el, attribute, iFlags) {
		el=$(el);
		return el.getAttribute(attribute, iFlags);
	},
	/** 
	* 移除元素的属性
	* @method	removeAttr
	* @param	{HTMLElement} el 目标对象
	* @param	{string} attribute	属性名称
	* @param	{int} iCaseSensitive (Optional)
	* @return	{void}
	*/
	removeAttr : function (el, attribute, iCaseSensitive) {
		el = $(el);
		return el.removeAttribute(attribute, iCaseSensitive || 0);
	},
	/**
	* 在元素的某个位置插入一段HTML
	* @method	insertAdjacentHTML
	* @param	{HTMLElement} el 参考对象
	* @param	{String} sWhere 插入位置,有四种值:beforebegin,afterbegin,beforeend,afterend.
	* @param	{String} sHTML: HTML字符串
	* @return	{void} 无返回值
	*/
	insertAdjacentHTML: function (el, sWhere, sHTML) {
		el=$(el);
		if (el.insertAdjacentHTML) {
			el.insertAdjacentHTML(sWhere, sHTML);
		} else {
			var df=create(sHTML,false,el.ownerDocument);
			NodeH.insertAdjacentElement(el,sWhere,df);
		}
	},
	/**
	* 在元素的某个位置插入一段HTML
	* @method	insertAdjacentHTML
	* @param	{HTMLElement} el 参考对象
	* @param	{String} sWhere 插入位置,有四种值:beforebegin,afterbegin,beforeend,afterend.
	* @param	{String} sHTML HTML字符串
	* @return	{void} 无返回值
	*/
	insertAdjacentElement: function (el, sWhere, target) {
		el = $(el), target = $(target);
		if (el.insertAdjacentElement) {
			el.insertAdjacentElement(type, target);
		} else {
			switch (String(sWhere).toLowerCase()) {
				case "beforebegin":
					el.parentNode.insertBefore(target, el);
					break;
				case "afterbegin":
					el.insertBefore(target, el.firstChild);
					break;
				case "beforeend":
					el.appendChild(target);
					break;
				case "afterend":
					el.parentNode.insertBefore(target, el.nextSibling);
					break;
			}
		}
		return target;
	},
	/** 
	* 获取element的value
	* @method	getValue
	* @param	{HTMLElement} el 目标对象
	* @return	{string} 元素value
	*/
	getValue : function (el) {
		el = $(el);
		return el.value;
	},

	/** 
	* 设置element的value
	* @method	setValue
	* @param	{HTMLElement} el 目标对象
	* @param	{string} value		内容
	* @return	{void} 
	*/
	setValue : function (el, value) {
		$(el).value=value;
	},

	/** 
	* 获取element的innerHTML
	* @method	getHTML
	* @param	{HTMLElement} el 目标对象
	* @return	{string} 
	*/
	getHtml : function (el) {
		el = $(el);
		return el.innerHTML;
	},

	/** 
	* 设置element的innerHTML
	* @method	setHtml
	* @param	{HTMLElement} el 目标对象
	* @param	{string} value		内容
	* @return	{void} 
	*/
	setHtml : function (el,value) {
		$(el).innerHTML=value;
	},
	
	//--// className系列
	/**
	* 判断是否包含指定的className
	* @method	hasClass
	* @param	{HTMLElement} el 参考对象
	* @param	{string} cn className
	* @return	{boolean} 如果包含该className，返回true；否则返回false
	*/
	hasClass: function  (el, cn) {
		el=$(el);
		return new RegExp('(?:^|\\s)' +cn+ '(?:\\s|$)','i').test(el.className);
	},
	/**
	* 添加一个className到指定元素上
	* @method	addClass
	* @param	{HTMLElement} el 参考对象
	* @param	{string} cn className
	* @return	{void} 无返回值
	*/
	addClass: function  (el, cn) {
		el=$(el);
		if (!NodeH.hasClass(el, cn)) {
			el.className = trim(el.className + ' '+cn);
		}
	},
	/**
	* 从元素上移除一个className
	* @method	removeClass
	* @param	{HTMLElement} el 参考对象
	* @param	{string} cn className
	* @return	{void} 无返回值
	*/
	removeClass: function  (el, cn) {
		el=$(el);
		if (NodeH.hasClass(el, cn)) {
			el.className = trim(el.className.replace(new RegExp('(?:\\s|^)' +cn+ '(?:\\s|$)','i'),' '));
		}
	},
	/**
	* 替换元素的className
	* @method	replaceClass
	* @param	{HTMLElement} el 参考对象
	* @param	{string} cn1 被替换的className
	* @param	{string} cn2 新的className
	* @return	{void} 无返回值
	*/
	replaceClass: function (el, cn1, cn2) {
		el=$(el);
		if (cn1) NodeH.removeClass(el, cn1);
		if (cn2) NodeH.addClass(el, cn2);
	},
	/** 
	* element的className1和className2切换
	* @method	toggleClass
	* @param	{HTMLElement} el 参考对象
	* @param	{string} cn1		样式名1
	* @param	{string} cn2		(Optional)样式名2
	* @return	{void}
	*/
	toggleClass : function (el, cn1, cn2) {
		cn2 = cn2 || '';
		if (NodeH.hasClass(el, cn1)) {
			NodeH.replaceClass(el, cn1, cn2);
		} else {
			NodeH.replaceClass(el, cn2, cn1);
		}
	},

	//--// CSS简易操作系列
	/**
	* 将一个元素的display属性设置为显示
	* @method	show
	* @param	{HTMLElement|array} el 参考对象
	* @param	{string} value: display值,默认为"".
	* @return	{void} 无返回值
	*/
	show: function (el, value) {
		el=$(el);
		el.style.display = value||'';
	},
	/**
	* 将一个元素的display属性设置为隐藏
	* @method	hide
	* @param	{HTMLElement|array} el 参考对象
	* @return	{void} 无返回值
	*/
	hide: function (el) {
		el=$(el);
		el.style.display = 'none';
	},
	/** 
	* 隐藏/显示element对象
	* @method	toggle
	* @param	{HTMLElement} el 参考对象
	* @param	{string} value (Optional)显示时display的值 默认为空
	* @return	{void}
	*/
	toggle : function (el, value) {
		if (NodeH.isVisible(el)) {
			NodeH.hide(el);
		} else {
			NodeH.show(el, value);
		}
	},
	/**
	* 得到元素的css属性值
	* @method	getStyle
	* @param	{HTMLElement} el 参考对象
	* @param	{String} key css属性名称
	* @return	{String|int} css属性值
	*/
	getStyle: function (el, attr) {
		el = $(el);
		var s=el.style;
		// IE uses filters for opacity
		if (attr == 'opacity' && Browser.ie ) {
			return s.filter && s.filter.indexOf('opacity=') >= 0 ?
				(parseFloat( s.filter.match(/opacity=([^)]*)/)[1] ) / 100):1;
		}
		var result=s[camelize(camelize(attr))];
		return (!result || result == 'auto') ? null : result;
	},
	/**
	* 设置样式，有两种调用形式：setStyle(el, attr, val),setStyle(el,op)
	* @method	setStyle
	* @param	{HTMLElement} el 参考对象
	* @param	{String|Json} attr css属性名称或属性json,如果是json,则不需要第三个参数.
	* @param	{String|int} val css属性值,
	* @return	{void} 无返回值
	*/
	setStyle: function (el, attr, val) {
		var op= {};
		if(typeof attr == 'string') op[attr]=val;
		else op=attr;
		el=$(el);
		for (var prop in op) {
			if ('opacity'==prop && Browser.ie){
				el.style['filter'] = 'alpha(opacity=' +(op[prop]*100)+ ')';
			}
			else {
				el.style[camelize(prop)] = op[prop];
			}
		}
	},
	/**
	* 得到元素的实际css属性值,包括从其它dom或css里承得来的
	* @method	getCurrentStyle
	* @param	{HTMLElement} el 参考对象
	* @param	{String} key css属性名称
	* @return	{String|int} css属性值
	*/
	getCurrentStyle: function  (el, attr) {
		el = $(el);
		var val=null;
		var dv=document.defaultView;
		if (dv && dv.getComputedStyle) {
			var css = dv.getComputedStyle(el, null);
			val = css ? css.getPropertyValue(decamelize(attr)) : null;
		} else if (el.currentStyle) {
			var s=el.currentStyle;
			if(attr=='opacity') {
				return s.filter && s.filter.indexOf('opacity=') >= 0 ?
				(parseFloat( s.filter.match(/opacity=([^)]*)/)[1] ) / 100):1;
			}
			val = el.currentStyle[camelize(attr)];
		}
		if((val == 'auto') && (NodeH.getCurrentStyle(el,'display') != 'none')){
			var idx=-1;
			if(attr=='height') idx=0;
			if(attr=='width') idx=1;
			if(idx>-1){
				val=el[camelize('offset-'+attr)];
				var bd=NodeH.borderWidth(el);
				var pd=NodeH.paddingWidth(el);
				val=(val-bd[idx]-bd[idx+2]-pd[idx]-pd[idx+2])+'px';
			}
		}
		return val;
	},

	//-//box系列(包括top/left/width/height/border/margin/padding等)
	/** 
	* 判断element对象是否可见
	* @method	isVisible
	* @param	{HTMLElement} el		参考对象
	* @return	{boolean} 判断结果
	*/
	isVisible : function (el) {
		el = $(el);
		return !!(el.offsetHeight || el.offestWidth);
	},
	/**
	* 得到元素的实际left与top。
	* @method	getXY
	* @param	{HTMLElement} el 参考对象
	* @return	{Array} 返回数组：[x,y]
	*/
	getXY: (function() {
		if (Browser.ie) {
			// IE
			return function (el) {
				var box     = el.getBoundingClientRect();
				var rect    = getDocRect(el.ownerDocument.parentWindow);
				var offsetX = box.left - 2 + rect.scrollLeft,
					offsetY = box.top - 2 + rect.scrollTop;			
				return [offsetX, offsetY];
			};
		} else {
			return function(el) { 
				// manually calculate by crawling up offsetParents
				var pos = [el.offsetLeft, el.offsetTop];
				var bd=el.ownerDocument.body;
				var patterns = {
					HYPHEN: /(-[a-z])/i, // to normalize get/setStyle
					ROOT_TAG: /^body|html$/i // body for quirks mode, html for standards
				};

				// safari: subtract body offsets if el is abs (or any offsetParent), unless body is offsetParent
				var accountForBody =false ;
				var pEl=el.offsetParent;
				while (pEl) {
					pos[0] += pEl.offsetLeft;
					pos[1] += pEl.offsetTop;
					if (Browser.safari && NodeH.getCurrentStyle(pEl,'position') == 'absolute') { 
						accountForBody = true;
					}
					pEl = pEl.offsetParent;
				}

				if (accountForBody) { 
					//safari doubles in this case
					pos[0] -= bd.offsetLeft;
					pos[1] -= bd.offsetTop;
				}

				pEl = el.parentNode;

				// account for any scrolled ancestors
				while ( pEl && pEl.tagName && !patterns.ROOT_TAG.test(pEl.tagName) ) {
					if (pEl.scrollTop || pEl.scrollLeft) {
						pos[0] -= pEl.scrollLeft;
						pos[1] -= pEl.scrollTop;
					}
					pEl = pEl.parentNode; 
				}

				return pos;
			};

		}

	})(),
	/**
	* 设置元素的位置
	* @method	setXY
	* @param	{HTMLElement} el 目标对象
	* @param	{int} x left
	* @param	{int} y top
	* @return	{void}
	*/
	setXY: function (el, x, y) {
		el=$(el);
		if (x!=null) el.style.left = x +'px';
		if (y!=null) el.style.top = y +'px';
	},
	/** 
	* 获取元素的宽高
	* @method	getSize
	* @param	{HTMLElement} el 目标对象
	* @return	{object} width,height
	*/
	getSize : function (el) {
		el = $(el);
		return { width : el.offsetWidth, height : el.offsetHeight };
	},
	/** 
	* 设置元素的offset宽高
	* @method	setSize
	* @param	{HTMLElement} el 目标对象
	* @param	{int} w			(Optional)宽 默认不设置
	* @param	{int} h			(Optional)高 默认不设置
	* @return	{void}
	*/
	setSize : function (el, w, h) {
		el = $(el);
		w = parseFloat (w, 10);
		h = parseFloat (h, 10);

		if (isNaN(w) && isNaN(h)) return;

		var borders = NodeH.borderWidth(el);
		var paddings = NodeH.paddingWidth(el);

		if ( !isNaN(w) ) NodeH.setStyle(el, 'width', Math.max(+w - borders[1] - borders[3] - paddings[1] - paddings[3], 0) + 'px');
		if ( !isNaN(h) ) NodeH.setStyle(el, 'height', Math.max(+h - borders[0] - borders[2] - paddings[1] - paddings[2], 0) + 'px');
	},

	/** 
	* 设置元素的宽高
	* @method	setInnerSize
	* @param	{HTMLElement} el 目标对象
	* @param	{int} w			(Optional)宽 默认不设置
	* @param	{int} h			(Optional)高 默认不设置
	* @return	{void}
	*/
	setInnerSize : function (el, w, h) {
		el = $(el);
		w = parseFloat (w, 10);
		h = parseFloat (h, 10);

		if ( !isNaN(w) ) NodeH.setStyle(el, 'width', w + 'px');
		if ( !isNaN(h) ) NodeH.setStyle(el, 'height', h + 'px');
	},
	/**
	* 得到border宽度
	* @method	borderWidth
	* @param	{HTMLElement} el 参考对象
	* @return	{Array} 返回border宽度数组，分别为[上，右，下，左]
	*/
	borderWidth: function (el) {
		el = $(el);
		return [
			$F(NodeH.getCurrentStyle(el,'border-top-width')),
			$F(NodeH.getCurrentStyle(el,'border-right-width')),
			$F(NodeH.getCurrentStyle(el,'border-bottom-width')),
			$F(NodeH.getCurrentStyle(el,'border-left-width'))];
	},
	/**
	* 得到padding宽度
	* @method	paddingWidth
	* @param	{HTMLElement} el 参考对象
	* @return	{Array} 返回padding宽度数组，分别为[上，右，下，左]
	*/
	paddingWidth: function (el) {
		el = $(el);
		return [
			$F(NodeH.getCurrentStyle(el,'padding-top')),
			$F(NodeH.getCurrentStyle(el,'padding-right')),
			$F(NodeH.getCurrentStyle(el,'padding-bottom')),
			$F(NodeH.getCurrentStyle(el,'padding-left'))];
	},
	/**
	* 得到margin宽度
	* @method	marginWidth
	* @param	{HTMLElement} el 参考对象
	* @return	{Array} 返回margin宽度数组，分别为[上，右，下，左]
	*/
	marginWidth: function(el) {
		el = $(el);
		return [
			$F(NodeH.getCurrentStyle(el,'margin-top')),
			$F(NodeH.getCurrentStyle(el,'margin-right')),
			$F(NodeH.getCurrentStyle(el,'margin-bottom')),
			$F(NodeH.getCurrentStyle(el,'margin-left'))];
	},
	/**
	* 得到元素的rect属性。
	* @method	getRect
	* @param	{HTMLElement} el 参考对象
	* @return	{Json} 返回描述对象大小位置的Json对象：{left:x, top:y, width: w, height: h}
	*/
	getRect: function (el) {
		el = $(el);
		var p = NodeH.getXY(el);
		var x = p[0];
		var y = p[1];
		var w = el.offsetWidth; 
		var h = el.offsetHeight;
		return {
			'width' : w,    'height': h,
			'left'  : x,    'top'   : y,
			'bottom': y+h,  'right' : x+w
		};
	},
	/**
	* 设置元素的offset宽高和xy坐标
	* @method	setRect
	* @param	{HTMLElement} el: 目标对象
	* @param	{int} x left
	* @param	{int} y top
	* @param	{int} w 宽度
	* @param	{int} h 高度
	* @param	{boolean} ignoreBorder 宽度与高度是否忽略border,默认为true
	* @return	{void}
	*/
	setRect: function setRect (el, x, y, w, h,ignoreBorder) {
		NodeH.setXY(el, x, y);
		NodeH.setSize(el, w, h);
	},
	/** 
	* 设置元素的宽高和xy坐标
	* @method	setRect
	* @param	{HTMLElement} el		目标对象
	* @param	{int} x (Optional) x坐标 默认不设置
	* @param	{int} y (Optional) y坐标 默认不设置
	* @param	{int} w	(Optional) 宽 默认不设置
	* @param	{int} h (Optional) 高 默认不设置
	* @return	{void}
	*/
	setInnerRect : function (el, x, y, w, h) {
		NodeH.setXY(el, x, y);
		NodeH.setInnerSize(el, w, h);
	},
	/**
	* 设置一个元素全屏
	* @method	setFullscreen
	* @param	{HTMLElement} el 目标对象
	* @param	{window} win window对象，默认为当前window
	* @return	{void}
	*/
	setFullscreen: function (el) {
		var rect = getDocRect();
		var x, y, w, h;
		x = y = 0;
		w = rect.scrollWidth;
		h = rect.scrollHeight;
		setRect ($(el), x, y, w, h);
	},

	/**
	* 设置元素绝对水平垂直居中
	* @method	setCenter
	* @param	{HTMLElement} el 目标对象
	* @param	{int} w 宽度
	* @param	{int} h 高度
	* @param	{int} x 如果有值，则优选于center-x;
	* @param	{int} y 如果有值，则优选于middle-y;
	* @return	{void}
	*/
	setCenter: function (el, w, h, x, y) {
		var rect = getDocRect();
		if(x==null) x = (rect.width-w)/2  + rect.scrollLeft;
		x=Math.max(Math.min(x,rect.scrollLeft+rect.width-w),rect.scrollLeft);
		if(y==null) y = (rect.height-h)/2 + rect.scrollTop;
		y=Math.max(Math.min(y,rect.scrollTop+rect.height-h),rect.scrollTop);
		NodeH.setXY($(el), x, y);
	},

	//--// set/get
	/** 
	* 为元素设置属性值
	* @method	set
	* @param	{HTMLElement} el 目标对象
	* @param	{string} attr 属性名
	* @param	{any} value 属性值
	* @return	{void}  
	*/
	set:function(el,attr,value){
		$(el)[attr]=value;
	},
	/** 
	* 获取元素属性值
	* @method	get
	* @param	{HTMLElement} el 目标对象
	* @param	{string} attr 属性名
	* @return	{any}  
	*/
	get:function(el,attr,subAttrs){
		return $(el)[attr];
	},
	/**
	* 提取一个form里的post数据
	* @method	encodeURIForm
	* @param	{FORMElement} oForm form对象。
	* @param	{String} exceptNames 忽略不提交的元素名，用“,”串起来。
	* @return	{String} 由'&'连接的键值字符串（即post数据）。
	*/
	encodeURIForm: function(oForm,exceptNames){
		var els=$(oForm).elements,
			exNames=','+(exceptNames||'')+',',
			sArr=[];
		for(var i=0;i<els.length;i++){
			var el=els[i],
				name=el.name;
			if(el.disabled || !name || exNames.indexOf(','+name+',')>-1 ) continue;
			switch(el.type){
				case undefined:
				case 'button':
				case 'image':
				case 'reset':
				case 'submit': break;
				case 'radio':
				case 'checkbox':
					if(el.checked) sArr.push(name+"="+encodeURIComponent(el.value));
					break;
				case 'select-one':
					if(el.selectedIndex>-1) sArr.push(name+'='+encodeURIComponent(el.value));
					break;
				case 'select-multiple':
					var opts=el.options;
					for(var j=0;j<opts.length;j++){
						if(opts[j].selected) sArr.push(name+"="+encodeURIComponent(opts[j].value));
					}
					break;
				default: //case "text":	case "hidden":	case "password": case "textarea": 需要兼容更多，例如HTML5新增的，以及webkit的search等
					sArr.push(name+'='+encodeURIComponent(el.value));
			}
		}
		return sArr.join('&');
	},

	/**
	* 判断一个表单是否修改过.
	* @method	isFormChanged
	* @param	{FORMElement} oForm form对象。
	* @param	{String} exceptNames 忽略不提交的元素名，用“,”串起来。
	* @return	{boolean} 
	* @example	isFormChangedFun(document.frm,"ACheckbox,BRadio,CSelect");
	*/
	isFormChanged: function (oForm,exceptNames)
	{
		var els=$(oForm).elements,
			exNames=','+(exceptNames||'')+',';
		for(var i=0;i<els.length;i++){
			var el=els[i],
				name=el.name,
				j=0;
			if(el.disabled || !name || exNames.indexOf(','+name+',')>-1 ) continue;
			switch (el.type) {
				case "text":
				case "hidden":
				case "password":
				case "textarea":
					if (el.defaultValue != el.value) return true;
					break;
				case "radio":
				case "checkbox":
					if (el.defaultChecked != el.checked) return true;
					break;
				case "select-one":j=1;
				case "select-multiple":
					var opts = el.options;
					for (; j < opts.length ; j++) {
						if (opts[j].defaultSelected != opts[j].selected) return true;
					}
					break;
			}
		}
		return false;
	}
};

function $F(s) { return parseInt(s)||0; };

function findFirst(el,attr,sSelector){
	/* 
	 * @private
	 * findFirst(el,attr,sSelector): 从自己开始，递归调用属性,得到一个满足条件的属性. 
	 * @see	ancestorNode
	 * @see	previousSibling
	 * @see	nextSibling
	 * @see	firstChild
	 */
	if(!sSelector) return el;
	var f=selector2Filter(sSelector);
    while (el && !f(el)) {
      el = el[attr];
    }
	return el;
};


QW.NodeH=NodeH;
})();



/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: wangchen
*/
/** 
* @class EventTargetH EventTarget Helper，处理和事件触发目标有关的兼容问题
* @singleton
* @helper
* @namespace QW
*/
QW.EventTargetH = function () {

	var E = {};
	var $=QW.NodeH.$;


	var cache = {};
	var delegateCache = {};
	var PROPERTY_NAME = '_EventTargetH_ID';
	var index = 0;


	/** 
	* 获取key
	* @method	getKey
	* @private
	* @param	{element}	element		被观察的目标
	* @param	{string}	oldname		(Optional)事件名称
	* @param	{function}	handler		(Optional)事件处理程序
	* @return	{string}	key
	*/
	var getKey = function (element, type, handler) {
		var result = '';

		if (!element[PROPERTY_NAME]) element[PROPERTY_NAME] = ++ index;

		result += element[PROPERTY_NAME];

		if (type) {
			result += '_' + type;

			if (handler) {
				if (!handler[PROPERTY_NAME]) handler[PROPERTY_NAME] = ++ index;
				result += '_' + handler[PROPERTY_NAME];
			}
		}

		return result;
	};

	/** 
	* 获取key
	* @method	getDelegateKey
	* @private
	* @param	{element}	element		被委托的目标
	* @param	{string}	selector	(Optional)委托的目标
	* @param	{string}	oldname		(Optional)事件名称
	* @param	{function}	handler		(Optional)事件处理程序
	* @return	{string}	key
	*/
	var getDelegateKey = function (element, selector, type, handler) {
		var result = '';

		if (!element[PROPERTY_NAME]) element[PROPERTY_NAME] = ++ index;

		result += element[PROPERTY_NAME];

		if (selector) {
			result += '_' + selector.replace(/_/g, '\x01');

			if (type) {
				result += '_' + type;

				if (handler) {
					if (!handler[PROPERTY_NAME]) handler[PROPERTY_NAME] = ++ index;
					result += '_' + handler[PROPERTY_NAME];
				}
			}
		}

		return result;
	};

	/** 
	* 通过key获取事件名
	* @method	keyToName
	* @private
	* @param	{string}	key		键值
	* @return	{string}	事件名称
	*/
	var keyToName = function (key) {
		return key.split('_')[1];
	};

	/** 
	* 通过key获取事件名
	* @method	delegateKeyToName
	* @private
	* @param	{string}	key		键值
	* @return	{string}	事件名称
	*/
	var delegateKeyToName = function (key) {
		return key.split('_')[2];
	};

	/** 
	* 监听方法
	* @method	listener
	* @private
	* @param	{element}	element	监听目标
	* @param	{string}	name	事件名称
	* @param	{function}	handler	事件处理程序
	* @return	{object}	委托方法执行结果
	*/
	var listener = function (element, name, handler) {
		return function (e) {
			return fireHandler(element, e, handler, name);
		};
	};

	/** 
	* 监听方法
	* @method	delegateListener
	* @private
	* @param	{element}	element 	监听目标
	* @param	{string}	selector	选择器
	* @param	{string}	name		事件名称
	* @param	{function}	handler		事件处理程序
	* @return	{object}	委托方法执行结果
	*/
	var delegateListener = function (element, selector, name, handler) {
		return function (e) {
			var elements = [], node = e.srcElement || e.target;
			
			if (!node) return;

			if (node.nodeType == 3) node = node.parentNode;

			while (node && node != element) {
				elements.push(node);
				node = node.parentNode;
			}

			elements = QW.Selector.filter(elements, selector, element);

			for (var i = 0, l = elements.length ; i < l ; ++ i) {
				fireHandler(elements[i], e, handler, name);
			}
		};
	};

	/**
	 * 添加事件监听
	 * @method	addEventListener
	 * @param	{element}	element	监听目标
	 * @param	{string}	name	事件名称
	 * @param	{function}	handler	事件处理程序
	 * @param	{bool}		capture	(Optional)是否捕获非ie才有效
	 * @return	{void}
	 */
	E.addEventListener = function () {
		if (document.addEventListener) {
			return function (element, name, handler, capture) {
				element.addEventListener(name, handler, capture || false);
			};
		} else if (document.attachEvent) {
			return function (element, name, handler) {
				element.attachEvent('on' + name, handler);
			};
		} else {
			return function () {};
		}
	}();

	/**
	 * 移除事件监听
	 * @method	removeEventListener
	 * @private
	 * @param	{element}	element	监听目标
	 * @param	{string}	name	事件名称
	 * @param	{function}	handler	事件处理程序
	 * @param	{bool}		capture	(Optional)是否捕获非ie才有效
	 * @return	{void}
	 */
	E.removeEventListener = function () {
		if (document.removeEventListener) {
			return function (element, name, handler, capture) {
				element.removeEventListener(name, handler, capture || false);
			};
		} else if (document.detachEvent) {
			return function (element, name, handler) {
				element.detachEvent('on' + name, handler);
			};
		} else {
			return function () {};
		}
	}();

	/** 
	* 标准化事件名称
	* @method	getName
	* @private
	* @param	{string}	name	事件名称
	* @return	{string}	转换后的事件名称
	*/
	var getName = function () {
		var UA = navigator.userAgent, NAMES = {
			'mouseenter' : 'mouseover',
			'mouseleave' : 'mouseout'
		};

		if (/msie/i.test(UA)) {
			NAMES['input'] = 'propertychange';
		} else if (/firefox/i.test(UA)) {
			NAMES['mousewheel'] = 'DOMMouseScroll';
		}

		return function (name) {
			return NAMES[name] || name;
		};

	}();

	/** 
	* 事件执行入口
	* @method	fireHandler
	* @private
	* @param	{element}	element		触发事件对象
	* @param	{event}		event		事件对象
	* @param	{function}	handler		事件委托
	* @param	{string}	name		处理前事件名称
	* @return	{object}	事件委托执行结果
	*/
	var fireHandler = function (element, e, handler, name) {
		if (name == 'mouseenter' || name == 'mouseleave') {
			var target = e.relatedTarget || (e.type == 'mouseover' ? e.fromElement : e.toElement) || null;
			if (!target || target == element || (element.contains ? element.contains(target) : !!(element.compareDocumentPosition(target) & 16))) {
				return;
			}
		};
		return E.fireHandler(element, e, handler, name);
	};

	/** 
	* 事件执行入口
	* @method	fireHandler
	* @param	{element}	element		触发事件对象
	* @param	{event}		event		事件对象
	* @param	{function}	handler		事件委托
	* @param	{string}	name		处理前事件名称
	* @return	{object}	事件委托执行结果
	*/
	E.fireHandler = function (element, e, handler, name) {
		return handler.call(element, e);
	};

	/** 
	* 添加对指定事件的监听
	* @method	on
	* @param	{element}	element	监听目标
	* @param	{string}	oldname	事件名称
	* @param	{function}	handler	事件处理程序
	* @return	{boolean}	事件是否监听成功
	*/
	E.on = function (element, oldname, handler) {
		element = $(element);

		var name = getName(oldname);
		
		var key = getKey(element, oldname, handler);

		if (cache[key]) {
			return false;
		} else {
			var _listener = listener(element, oldname, handler);

			E.addEventListener(element, name, _listener);

			cache[key] = _listener;

			return true;
		}
	};

	/** 
	* 移除对指定事件的监听
	* @method	un
	* @param	{element}	element	移除目标
	* @param	{string}	oldname	(Optional)事件名称
	* @param	{function}	handler	(Optional)事件处理程序
	* @return	{boolean}	事件监听是否移除成功
	*/
	E.un = function (element, oldname, handler) {
		
		element = $(element);
		
		if (handler) {

			var name = getName(oldname);

			var key = getKey(element, oldname, handler);

			var _listener = cache[key];

			if (_listener) {
				E.removeEventListener(element, name, _listener);
				
				delete cache[key];

				return true;
			} else {
				return false;
			}
		} else {			

			var leftKey = '^' + getKey(element, oldname, handler), i, name;
			
			for (i in cache) {
				if (new RegExp(leftKey, 'i').test(i)) {
					name = keyToName(i);
					E.removeEventListener(element, getName(name), cache[i]);
					delete cache[i];
				}
			}

			return true;
		}
	};

	/** 
	* 添加事件委托
	* @method	delegate
	* @param	{element}	element		被委托的目标
	* @param	{string}	selector	委托的目标
	* @param	{string}	oldname		事件名称
	* @param	{function}	handler		事件处理程序
	* @return	{boolean}	事件监听是否移除成功
	*/
	E.delegate = function (element, selector, oldname, handler) {
		element = $(element);

		var name = getName(oldname);
		
		var key = getDelegateKey(element, selector, oldname, handler);

		if (delegateCache[key]) {
			return false;
		} else {
			var _listener = delegateListener(element, selector, oldname, handler);

			E.addEventListener(element, name, _listener);

			delegateCache[key] = _listener;

			return true;
		}
	};

	/** 
	* 移除事件委托
	* @method	undelegate
	* @param	{element}	element		被委托的目标
	* @param	{string}	selector	(Optional)委托的目标
	* @param	{string}	oldname		(Optional)事件名称
	* @param	{function}	handler		(Optional)事件处理程序
	* @return	{boolean}	事件监听是否移除成功
	*/
	E.undelegate = function (element, selector, oldname, handler) {
		element = $(element);
		
		if (handler) {

			var name = getName(oldname);

			var key = getDelegateKey(element, selector, oldname, handler);

			var _listener = delegateCache[key];

			if (_listener) {
				E.removeEventListener(element, name, _listener);
				
				delete delegateCache[key];

				return true;
			} else {
				return false;
			}
		} else {			

			var leftKey = '^' + getDelegateKey(element, selector, oldname, handler).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1'), i, name;
			
			for (i in delegateCache) {
				if (new RegExp(leftKey, 'i').test(i)) {
					name = delegateKeyToName(i);
					E.removeEventListener(element, getName(name), delegateCache[i]);
					delete delegateCache[i];
				}
			}

			return true;
		}
	};

	/** 
	* 触发对象的指定事件
	* @method	fire
	* @param	{element}	element	要触发事件的对象
	* @param	{string}	oldname	事件名称
	* @return	{void}
	*/
	E.fire = function (element, oldname) {
		element = $(element);
		var name = getName(oldname);

		if (element.fireEvent) {
			element.fireEvent('on' + name);
		} else {
			var evt = null, doc = element.ownerDocument || element;
			
			if (/mouse|click/i.test(oldname)) {
				evt = doc.createEvent('MouseEvents');
				evt.initMouseEvent(name, true, true, doc.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
			} else {
				var evt = doc.createEvent('Events');
				evt.initEvent(name, true, true, doc.defaultView);
			}
			element.dispatchEvent(evt);
		}
	};

	var extend = function (types) {
		for (var i = 0, l = types.length ; i < l ; ++ i) {
			function(type){
				E[type]=function(el,handle){
					if(handle) E.on(type,handle);
					else el[type]();
				}
			}(types[i]);
		}
	};

	/** 
	* 绑定对象的click事件或者执行click方法
	* @method	click
	* @param	{element}	element	要触发事件的对象
	* @param	{function}	handler	(Optional)事件委托
	* @return	{void}
	*/


	/** 
	* 绑定对象的submit事件或者执行submit方法
	* @method	submit
	* @param	{element}	element	要触发事件的对象
	* @param	{function}	handler	(Optional)事件委托
	* @return	{void}
	*/

	/** 
	* 绑定对象的focus事件或者执行focus方法
	* @method	focus
	* @param	{element}	element	要触发事件的对象
	* @param	{function}	handler	(Optional)事件委托
	* @return	{void}
	*/

	/** 
	* 绑定对象的blur事件或者执行blur方法
	* @method	blur
	* @param	{element}	element	要触发事件的对象
	* @param	{function}	handler	(Optional)事件委托
	* @return	{void}
	*/

	extend('submit,click,focus,blur'.split(','));

	return E;

}();

/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: wangchen
	author: JK
*/
/** 
* @class NodeW HTMLElement对象包装器
* @namespace QW
*/
(function () {
	var ObjectH = QW.ObjectH,
		mix = ObjectH.mix,
		getType = ObjectH.getType,
		push = Array.prototype.push,
		NodeH = QW.NodeH,
		$ = NodeH.$,
		query = NodeH.query;

	var NodeW=function(core) {
		if(!core) return null;
		var arg1=arguments[1];
		if(typeof core=='string'){
			if(this instanceof NodeW){//用法：var el=new NodeW(id); //不推荐本用法
				return new NodeW($(core,arg1));
			}
			else {//用法: var els=NodeW(selector)
				return new NodeW(query(arg1,core));
			}
		}
		else {
			core=$(core,arg1);
			if(this instanceof NodeW){
				this.core=core;
				var type=getType(core);
				if(type=='array'){//用法：var els=new NodeW([el1,el2]); 
					this.length=0;
					push.apply( this, core );
				}
				else{//用法: var el=new NodeW(el); 
					this.length=1;
					this[0]=core;
				}
			}
			else return new NodeW(core);//用法：var el=NodeW(el); var els=NodeW([el1,el2]); //省略"new"
		}
	};

	mix(NodeW.prototype,{
		/** 
		* 返回NodeW的第0个元素的包装
		* @method	first
		* @return	{NodeW}	
		*/
		first:function(){
			return NodeW(this[0]);
		},
		/** 
		* 返回NodeW的最后一个元素的包装
		* @method	last
		* @return	{NodeW}	
		*/
		last:function(){
			return NodeW(this[this.length-1]);
		},
		/** 
		* 返回NodeW的第i个元素的包装
		* @method	last
		* @param {int}	i 第i个元素
		* @return	{NodeW}	
		*/
		item:function(i){
			return NodeW(this[i]);
		}
	});

	QW.NodeW=NodeW;
})();


QW.NodeC={
	arrayMethods:[//部分Array的方法也会集成到NodeW里
		'map',
		'forEach',
		'filter',
		'toArray'
	],
	wrapMethods:{ //在此json里的方法，会返回带包装的结果，如果其值为-1，返回“返回值”的包装结果,否则返回第i个位置的参数的包装结果
		//来自EventTargetH
		on	: 0,
		un	: 0,
		delegate	: 0,
		undelegate	: 0,
		fire	: 0,
		click	: 0,
		submit	: 0,
		
		//来自NodeH
		//getJsAttr
		//getExAttr
		$	: -1,
		query	: -1,
		getElementsByClass	: -1,
		getElementsByTagName	: -1,
		ancestorNode	: -1,
		nextSibling	: -1,
		previousSibling	: -1,
		firstChild	: -1,
		lastChild	: -1,
		//contains
		//appendChild
		insertBefore	: -1,
		insertAfter	: -1,
		insertSiblingBefore	: -1,
		insertSiblingAfter	: -1,
		removeChild	: -1,
		removeNode	: -1,
		cloneNode	: -1,
		setAttr	: 0,
		//getAttr
		removeAttr	: 0,
		//insertAdjacentHTML
		insertAdjacentElement	: -1,
		//getValue
		setValue	: 0,
		//getHtml
		setHtml	: 0,
		//hasClass
		addClass	: 0,
		removeClass	: 0,
		replaceClass	: 0,
		toggleClass	: 0,
		show	: 0,
		hide	: 0,
		toggle	: 0,
		//getStyle
		setStyle	: 0,
		//getCurrentStyle
		//isVisible
		//getXY
		setXY	: 0,
		//getSize
		setSize	: 0,
		setInnerSize	: 0,
		//borderWidth
		//paddingWidth
		//marginWidth
		//getRect
		setRect	: 0,
		setInnerRect	: 0,
		setFullscreen	: 0,
		setCenter	: 0,
		set	: 0,
		//get
		//encodeURIForm
		//isFormChanged
		
		//来自ArrayH
		//map
		forEach	: 0,
		filter	: -1
		//toArray
	},
	gsetterMethods : { //在此json里的方法，会是一个getter与setter的混合体
		val :['getValue','setValue'],
		html : ['getHtml','setHtml'],
		attr :['','getAttr','setAttr'],
		css :['','getCurrentStyle','setStyle'],
		size : ['getSize', 'setSize'],
		xy : ['getXY', 'setXY']
	}
};



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


/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: wangchen
	author: JK
*/


/*
	Dom_Retouch
*/


(function(){
var ObjectH=QW.ObjectH,
	HelperH=QW.HelperH,
	NodeC=QW.NodeC,
	NodeW=QW.NodeW,
	EventW=QW.EventW,
	EventTargetH=QW.EventTargetH;

/*
 * EventTarget Helper onfire 方法扩展
 * @class EventTargetH
 * usehelper BB.EventTargetH
*/
EventTargetH.fireHandler = function (element, e, handler, name) {
	var we = new EventW(e);
	return handler.call(element, we);
};

/*
NodeH2 = EventTargetH+NodeH
*/

var NodeH2=ObjectH.mix({},[QW.EventTargetH,QW.NodeH]);
var NodeH2=HelperH.mul(NodeH2,true);

/**
*@class Dom 将DomU的方法，以及NodeH的方法集中到一起的一个命名空间
*@namespace QW
*/
QW.Dom={};
ObjectH.mix(QW.Dom,[QW.DomU,NodeH2]);
HelperH.gsetter(QW.Dom,NodeC.gsetterMethods);//生成gsetters


/**
*@class NodeW 用NodeH与EventTargetH，以及ArrayH来渲染NodeW
*@namespace QW
*/
var wh=HelperH.rwrap(NodeH2,NodeW,NodeC.wrapMethods);
HelperH.gsetter(wh,NodeC.gsetterMethods);//生成gsetters
ObjectH.dump(QW.ArrayH,NodeC.arrayMethods,wh);//ArrayH的部分方法也移过来


HelperH.applyTo(wh,NodeW);	//NodeW的静态方法
HelperH.methodizeTo(wh,NodeW.prototype,"core");	//NodeW的原型方法

})();




/*
* Youa Retouch
*/

QW.$=QW.NodeH.$;	// $ = getElementById
QW.W=QW.NodeW;		// W = NodeW
QW.$$=QW.NodeW.$;	// $$ = NodeW.$
QW.Env=QW.Browser;	// 
window.BB=window.QW;	//有啊用BB
QW.ObjectH.mix(window,QW);	//将QW空间变量上移一层
QW.provideDomains=[QW,window];	//改变provide方法的输出目的地

