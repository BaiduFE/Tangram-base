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