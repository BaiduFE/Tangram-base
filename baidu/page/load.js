
/*
 * Tangram
 * Copyright 2009 Baidu, Inc. All rights reserved.
 * 
 * path: baidu/page/load.js
 * author: rocy
 * version: 1.0.0
 * date: 2010/11/29
 */

///import baidu.page;
///import baidu.array.each;
///import baidu.ajax.get;

/**
 * 
 * 加载一组资源，支持多种格式资源的串/并行加载，支持每个文件有单独回调函数。
 * 
 * @name baidu.page.load
 * @function
 * @grammar baidu.page.load(resources[, options])
 * 
 * @param {Array} 	resources 				资源描述数组，单个resource含如下属性
 * @param {String}	resources.url   		链接地址
 * @param {String}	[resources.type]  		取值["css","js","html"]，默认参考文件后缀
 * @param {String}	[resources.requestType] 取值["dom","ajax"]，默认js和css用dom标签，html用ajax
 * @param {Function}resources.onload  		当前resource加载完成的回调函数，若requestType为ajax，参数为xhr(可能失效)，responseText；若requestType为dom，无参数，执行时this为相应dom标签。
 * 
 * @param {Object} 	[options] 				可选参数 
 * @param {Function}[options.onload]  		资源全部加载完成的回调函数，无参数。
 * @param {Boolean}	[options.parallel]  	是否并行加载，默认为false，串行。
 * 
 * 
 * @remark
 * 	//串行实例
 * 	baidu.page.load([
 * 		{ url : "http://img.baidu.com/js/tangram-1.3.2.js" },
 * 		{url : "http://xxx.baidu.com/xpath/logicRequire.js",
 * 			onload : fnOnRequireLoaded
 * 		},
 * 		{ url : "http://xxx.baidu.com/xpath/target.js" }
 * 	],{
 * 		onload : fnWhenTargetOK
 * 	});
 * 	//并行实例
 * 	baidu.page.load([
 * 		{ 
 * 			url : "http://xxx.baidu.com/xpath/template.html",
 * 			onload : fnExtractTemplate
 * 		},
 * 		{ url : "http://xxx.baidu.com/xpath/style.css"},
 * 		{ 
 * 			url : "http://xxx.baidu.com/xpath/import.php?f=baidu.*",
 * 			type : "js"
 * 		},
 * 		{
 * 			url : "http://xxx.baidu.com/xpath/target.js",
 * 		},
 * 		{
 * 			url : "http://xxx.baidu.com/xpath/jsonData.js",
 * 			requestType : "ajax",
 * 			onload : fnExtractData
 * 		}
 * 	],{
 * 		parallel : true,
 * 		onload : fnWhenEverythingIsOK
 * });
 */
//Todo: {String} resources.charset NOT SUPPORTED YET! resource的charset，默认UTF8。
baidu.page.load = function(resources, options){
	//TODO failure, 整体onload能不能每个都调用
	options = options || {};
	var self = baidu.page.load,
		cache = self._cache = self._cache || {},
		parallel = options.parallel;
	
	function allLoadedChecker(){
		baidu.each(resources, function(res){
			if(!cache[res.url]){
				return;
			}
		});
		options.onload();
	};
	
	function loadByDom(res, callback){
		var node, loaded;
		switch (res.type) {
			case "css" :
				node = document.createElement("link");
				node.setAttribute("rel", "stylesheet");
				node.setAttribute("type", "text/css");
				break;
			case "js" :
				node = document.createElement("script");
				node.setAttribute('type', 'text/javascript');
				node.charset = res.charset || 'UTF8';
				break;
			case "html" :
				node = document.createElement("iframe");
				node.frameBorder = "none";
				break;
			default :
				return;
		};
    	// HTML,JS works on all browsers, CSS works only on IE.
		node.onload = node.onreadystatechange = function() {
			if ( !loaded && (!this.readyState ||
					this.readyState === "loaded" || this.readyState === "complete") ) {
				loaded = true;
				// 防止内存泄露
				node.onload = node.onreadystatechange = null;
				callback.call(window, node);
			}
		};
		//CSS has no onload event on firefox and webkit platform, so hack it.
		if(res.type == 'css'){
			(function(){
				//避免重复加载
				if(loaded) return;
				try {
					node.sheet.cssRule;
				} catch (e) {
					setTimeout(arguments.callee, 20);
					return;
				}
				loaded = true;
				callback.call(window, node);
			})();
		}
		
		node.href = node.src = res.url;
		document.body.appendChild(node);
	}
	
	//兼容第一个参数直接是资源地址.
	typeof resources == 'string' &&	(resources = [{url: resources}]);
	
	//避免递归出错,添加容错.
	if(! (resources && resources.length)) return;
	
	baidu.each(resources,function(res){
		var url = res.url,
			shouldContinue = !!parallel,
			cacheData,
			callback = function(textOrNode){
				var next;
				//ajax存入responseText,dom存入节点,用于保证onload的正确执行.
				cache[res.url] = textOrNode;
				typeof res.onload == 'function' && (next = res.onload.call(window,textOrNode));
				if(next === false) return;
				//串行时递归执行,options在递归的时候,现有的两个可选参数都不需要,所以不传第二个参数.
				!parallel && self(resources.slice(1));
				typeof options.onload == 'function' && allLoadedChecker();
			};
		//默认用后缀名, 并防止后缀名大写
		res.type = (res.type || url.substr(url.lastIndexOf(".") + 1)).toLowerCase();
		//默认html格式用ajax请求,其他都使用dom标签方式请求.
		res.requestType = res.requestType || (res.type == "html" ? "ajax" : "dom");
		
		if(cacheData = cache[res.url]){
			callback.call(window, cacheData);
			return shouldContinue;
		}
		
		if(res.requestType.toLowerCase() == "dom"){
			loadByDom(res, callback);
		}else{//ajax
			baidu.ajax.get(res.url, function(xhr, responseText){callback(responseText);});
		}
		//串行模式,通过callback方法执行后续
		return shouldContinue;
	});
};