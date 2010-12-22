/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/_eventFilter/mouseleave.js
 * author: Rocy, berg
 * version: 1.0.0
 * date: 2010/11/09
 */
///import baidu.event._eventFilter;
///import baidu.event._eventFilter._crossElementBoundary;

///import baidu.fn.bind;
/**
 * 用于为非IE浏览器添加mouseleave的支持;
 * mouseleave事件仅在鼠标移出元素区域触发一次,
 *    当鼠标在元素区域内部移动的时候不会触发.
 */
baidu.event._eventFilter.mouseleave = window.attachEvent ? null : function(element,type, listener){
	return {
		type: "mouseout",
		listener: baidu.fn.bind(baidu.event._eventFilter._crossElementBoundary, this, listener)
	}
};
