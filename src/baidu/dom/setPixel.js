/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * author: meizz
 * create: 2011-12-14
 */

///import baidu.dom;
///import baidu.dom.g;

/**
 * 给元素样式（比如width）赋值时，如果是数字则添加单位(px)，如果是其它值直接赋
 * @grammar baidu.dom.setPixel(el, style, n)
 * @param	{HTMLElement}	el 		DOM元素
 * @param 	{String}		style 	样式属性名
 * @param	{Number|String} n 		被赋的值
 */
baidu.dom.setPixel = function (el, style, n) {
	typeof n != "undefined" &&
	(baidu.dom.g(el).style[style] = n +(!isNaN(n) ? "px" : ""));
};
