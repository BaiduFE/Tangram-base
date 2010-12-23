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


