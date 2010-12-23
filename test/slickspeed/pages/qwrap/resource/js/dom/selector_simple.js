/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: JK
*/

/**
 * @class Selector CssSelector相关的几个方法
 * @singleton
 * @namespace QW
 */
(function(){
var Selector={
	/*
	 * CSS selector属性运算符
	 */
	_operators:{	//以下表达式，aa表示attr值，vv表示比较的值
		'': 'aa',//isTrue|hasValue
		'=': 'aa=="vv"',//equal
		'!=': 'aa!="vv"', //unequal
		'~=': 'aa&&(" "+aa+" ").indexOf(" vv ")>-1',//onePart
		'|=': 'aa&&(aa+"-").indexOf("vv-")==0', //firstPart
		'^=': 'aa&&aa.indexOf("vv")==0', // beginWith
		'$=': 'aa&&aa.lastIndexOf("vv")==aa.length-"vv".length', // endWith
		'*=': 'aa&&aa.indexOf(v)>-1' //contains
	},
	/*
	 * CSS 缩略写法
	 */
    _shorthands: [
		[/\#([\w\-]+)/g,'[id="$1"]'],//id缩略写法
		[/^([\w\-]+)/g, function(a,b){return '[tagName="'+b.toUpperCase()+'"]';}],//tagName缩略写法
		[/\.([\w\-]+)/g, '[className~="$1"]'],//className缩略写法
		[/^\*/g, '[tagName]']//任意tagName缩略写法
	],
	/*
	 * CSS 伪类逻辑。简版selector，不支持
	 */
	//_pseudos:{},
	/*
	 * CSS selector关系运算符。简版selector，不支持
	 */
	//_relations:{},简版selector，不支持
	/*
	 * 常用的Element属性
	 */
	_attrGetters:function(){ 
		var o={'class': 'el.className',
			'for': 'el.htmlFor',
			'href':'el.getAttribute("href",2)'};
		var attrs='name,id,className,value,selected,checked,disabled,type,tagName,readOnly'.split(',');
		for(var i=0,a;a=attrs[i];i++) o[a]="el."+a;
		return o;
	}(),
	selector2Filter:function(sSelector){
		/* 
		 * 把一个selector字符串转化成一个过滤函数.
		 * @method selector2Filter
		 * @param {string} sSelector: 过滤selector，这个selector里没有关系运算符（", >+~"）
		 * @returns {function} : 返回过滤函数。
		 * @example: 
			var fun=selector2Filter("input.aaa");alert(fun);
		 */
		return s2f(sSelector);
	},
	test:function(el,sSelector){
		/*
		 * 判断一个元素是否符合某selector.
		 * @method test 
		 * @param {HTMLElement} el: 被考察参数
		 * @param {string} sSelector: 过滤selector，这个selector里没有关系运算符（", >+~"）
		 * @returns {function} : 返回过滤函数。
		 */
		return s2f(sSelector)(el);
	},
	query:function(refEl,sSelector){
		/*
		 * 以refEl为参考，得到符合过滤条件的HTML Elements. refEl可以是element或者是document
		 * @method query
		 * @param {HTMLElement} refEl: 参考对象
		 * @param {string} sSelector: 过滤selector,
		 * @returns {array} : 返回elements数组。
		 * @example: 
			var els=query(document,"input.aaa");
			for(var i=0;i<els.length;i++ )els[i].style.backgroundColor='red';
		 */
		return querySimple(refEl||document,sSelector);
	}
};

/*
 * s2f(sSelector): 由一个selector得到一个过滤函数filter，这个selector里没有关系运算符（", >+~"）
 */
function s2f(sSelector){
	var s=sSelector,
		attrs=[];//属性数组，每一个元素都是数组，依次为：属性名／属性比较符／比较值
	for(var i=0,shorthands=Selector._shorthands,sh;sh=shorthands[i];i++)
		s=s.replace(sh[0],sh[1]);
	var reg=/\[\s*([\w\-]+)\s*([!~|^$*]?\=)?\s*(?:"([^\]]*)")?\s*\]/g; //属性选择表达式解析
	s=s.replace(reg,function(a,b,c,d){attrs.push([b,c||"",d||""]);return "";});//普通写法[foo][foo=""][foo~=""]等
	if(s.length) {throw "Unsupported Selector:\n"+sSelector+"\n"+s;}
	if(attrs.length){
		var sFun=[];
		for(var i=0,attr;attr=attrs[i];i++){//属性过滤
			var attrGetter=Selector._attrGetters[attr[0]] || 'el.getAttribute("'+attr[0]+'")';
			sFun.push(Selector._operators[attr[1]].replace(/aa/g,attrGetter).replace(/vv/g,attr[2]));
		}
		sFun='return ('+sFun.join(")&&(")+');';
		return new Function("el",sFun);
	}
	return function(el){return true;};
};
/*
备用代码，更简版s2f
function s2f(sSelector){
	var attrs=[];//属性数组，每一个元素都是数组，依次为：属性名／属性比较符／比较值
	var s=sSelector;
    var shorthands=[
		[/\#([\w\-]+)/g,function(a,b){attrs.push('el.id=="'+b+'"');return '';}],//id过滤
		[/^\*+/g,function(a,b){attrs.push('el.tagName');return '';}],//Element过滤
		[/^([\w\-]+)/g,function(a,b){attrs.push('el.tagName=="'+b.toUpperCase()+'"');return '';}],//tagName过滤
		[/\.([\w\-]+)/g,function(a,b){attrs.push('el.className && (" "+el.className+" ").indexOf(" '+b+' ")>-1');return '';}]//className过滤
	];
	for(var i=0,sh;sh=shorthands[i];i++){
		s=s.replace(sh[0],sh[1]);
	}
	if(s) throw ("Unsupported Selector:\n"+sSelector+"\n"+s);
	if(attrs.length){
		return new Function('el','return '+attrs.join('&&'));
	}
	return function(el){return true;};
};
*/

/* 
* querySimple(pEl,sSelector): 得到pEl下的符合过滤条件的HTML Elements. 
* sSelector里没有","运算符
* pEl是默认是document.body 
* @see: query。
*/
function querySimple(pEl,sSelector){
	//if(pEl.querySelectorAll) return pEl.querySelectorAll(sSelector);//JK：如果加上本句，可能会让习惯于ff调试bug的同学，把ie里的问题漏掉了。
	var tagName="*";
	sSelector=sSelector.replace(/^[\w\-]+/,function(a){tagName=a;return ""});
	var filter=s2f(sSelector);
	var els=pEl.getElementsByTagName(tagName),els2=[];
	for(var i=0,el;el=els[i];i++){
		if(filter(el)) els2.push(el);
	}
	return els2;
};

QW.Selector=Selector;

})();

