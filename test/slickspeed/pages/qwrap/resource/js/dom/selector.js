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
