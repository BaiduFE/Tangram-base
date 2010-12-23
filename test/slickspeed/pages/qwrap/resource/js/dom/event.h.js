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


