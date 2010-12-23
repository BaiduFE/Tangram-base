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