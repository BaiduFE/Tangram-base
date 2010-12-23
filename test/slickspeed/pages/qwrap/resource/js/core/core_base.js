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