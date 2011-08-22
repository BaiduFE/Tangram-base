/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/_eventFilter/mouseenter.js
 * author: Rocy
 * version: 1.0.0
 * date: 2010/11/09
 */
///import baidu.event._eventFilter;
///import baidu.event._eventFilter._crossElementBoundary;

///import baidu.fn.bind;

/**
 * 用于为非IE浏览器添加mouseenter的支持;
 * mouseenter事件仅在鼠标进入元素区域触发一次,
 *    当鼠标在元素内部移动的时候不会多次触发.
 */
baidu.event._eventFilter.mouseenter = window.attachEvent ? null : function(element,type, listener){
	return {
		type: "mouseover",
		listener: baidu.fn.bind(baidu.event._eventFilter._crossElementBoundary, this, listener)
	}
};
