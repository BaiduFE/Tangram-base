/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: wangche
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


