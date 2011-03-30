/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/fire.js
 * author: linlingyu
 * version: 1.1.0
 * date: 2010/10/28
 */
///import baidu.event;
///import baidu.dom._g;
///import baidu.browser.ie;
///import baidu.object.extend;
///import baidu.object.values;
///import baidu.lang.isNumber;
/**
 * 触发已经注册的事件。注：在ie下不支持load和unload事件
 * @name baidu.event.fire
 * @function
 * @grammar baidu.event.fire(element, type, options)
 * @param {HTMLElement|string|window} element 目标元素或目标元素id
 * @param {string} type 事件类型
 * @param {Object} options 触发的选项
				
 * @param {Boolean} options.bubbles 是否冒泡
 * @param {Boolean} options.cancelable 是否可以阻止事件的默认操作
 * @param {window|null} options.view 指定 Event 的 AbstractView
 * @param {1|Number} options.detail 指定 Event 的鼠标单击量
 * @param {Number} options.screenX 指定 Event 的屏幕 x 坐标
 * @param {Number} options.screenY number 指定 Event 的屏幕 y 坐标
 * @param {Number} options.clientX 指定 Event 的客户端 x 坐标
 * @param {Number} options.clientY 指定 Event 的客户端 y 坐标
 * @param {Boolean} options.ctrlKey 指定是否在 Event 期间按下 ctrl 键
 * @param {Boolean} options.altKey 指定是否在 Event 期间按下 alt 键
 * @param {Boolean} options.shiftKey 指定是否在 Event 期间按下 shift 键
 * @param {Boolean} options.metaKey 指定是否在 Event 期间按下 meta 键
 * @param {Number} options.button 指定 Event 的鼠标按键
 * @param {Number} options.keyCode 指定 Event 的键盘按键
 * @param {Number} options.charCode 指定 Event 的字符编码
 * @param {HTMLElement} options.relatedTarget 指定 Event 的相关 EventTarget
 * @version 1.3
 *             
 * @returns {HTMLElement} 目标元素
 */
(function(){
	var browser = baidu.browser,
	keys = {
		keydown : 1,
		keyup : 1,
		keypress : 1
	},
	mouses = {
		click : 1,
		dblclick : 1,
		mousedown : 1,
		mousemove : 1,
		mouseup : 1,
		mouseover : 1,
		mouseout : 1
	},
	htmls = {
		abort : 1,
		blur : 1,
		change : 1,
		error : 1,
		focus : 1,
		load : browser.ie ? 0 : 1,
		reset : 1,
		resize : 1,
		scroll : 1,
		select : 1,
		submit : 1,
		unload : browser.ie ? 0 : 1
	},
	bubblesEvents = {
		scroll : 1,
		resize : 1,
		reset : 1,
		submit : 1,
		change : 1,
		select : 1,
		error : 1,
		abort : 1
	},
	parameters = {
		"KeyEvents" : ["bubbles", "cancelable", "view", "ctrlKey", "altKey", "shiftKey", "metaKey", "keyCode", "charCode"],
		"MouseEvents" : ["bubbles", "cancelable", "view", "detail", "screenX", "screenY", "clientX", "clientY", "ctrlKey", "altKey", "shiftKey", "metaKey", "button", "relatedTarget"],
		"HTMLEvents" : ["bubbles", "cancelable"],
		"UIEvents" : ["bubbles", "cancelable", "view", "detail"],
		"Events" : ["bubbles", "cancelable"]
	};
	baidu.object.extend(bubblesEvents, keys);
	baidu.object.extend(bubblesEvents, mouses);
	function parse(array, source){//按照array的项在source中找到值生成新的obj并把source中对应的array的项删除
		var i = 0, size = array.length, obj = {};
		for(; i < size; i++){
			obj[array[i]] = source[array[i]];
			delete source[array[i]];
		}
		return obj;
	};
	function eventsHelper(type, eventType, options){//非IE内核的事件辅助
		options = baidu.object.extend({}, options);
		var param = baidu.object.values(parse(parameters[eventType], options)),
			evnt = document.createEvent(eventType);
		param.unshift(type);
		if("KeyEvents" == eventType){
			evnt.initKeyEvent.apply(evnt, param);
		}else if("MouseEvents" == eventType){
			evnt.initMouseEvent.apply(evnt, param);
		}else if("UIEvents" == eventType){
			evnt.initUIEvent.apply(evnt, param);
		}else{//HTMMLEvents, Events
			evnt.initEvent.apply(evnt, param);
		}
		baidu.object.extend(evnt, options);//把多出来的options再附加上去,这是为解决当创建一个其它event时，当用Events代替后需要把参数附加到对象上
		return evnt;
	};
	function eventObject(options){//ie内核的构建方式
		var evnt;
		if(document.createEventObject){
			evnt = document.createEventObject();
			baidu.object.extend(evnt, options);
		}
		return evnt;
	};
	function keyEvents(type, options){//keyEvents
		options = parse(parameters["KeyEvents"], options);
		var evnt;
		if(document.createEvent){
			try{//opera对keyEvents的支持极差
				evnt = eventsHelper(type, "KeyEvents", options);
			}catch(keyError){
				try{
					evnt = eventsHelper(type, "Events", options);
				}catch(evtError){
					evnt = eventsHelper(type, "UIEvents", options);
				}
			}
		}else{
			options.keyCode = options.charCode > 0 ? options.charCode : options.keyCode;
			evnt = eventObject(options);
		}
		return evnt;
	};
	function mouseEvents(type, options){//mouseEvents
		options = parse(parameters["MouseEvents"], options);
		var evnt;
		if(document.createEvent){
			evnt = eventsHelper(type, "MouseEvents", options);//mouseEvents基本浏览器都支持
			if(options.relatedTarget && !evnt.relatedTarget){
				if("mouseout" == type.toLowerCase()){
					evnt.toElement = options.relatedTarget;
				}else if("mouseover" == type.toLowerCase()){
					evnt.fromElement = options.relatedTarget;
				}
			}
		}else{
			options.button = options.button == 0 ? 1
								: options.button == 1 ? 4
									: baidu.lang.isNumber(options.button) ? options.button : 0;
			evnt = eventObject(options);
		}
		return evnt;
	};
	function htmlEvents(type, options){//htmlEvents
		options.bubbles = bubblesEvents.hasOwnProperty(type);
		options = parse(parameters["HTMLEvents"], options);
		var evnt;
		if(document.createEvent){
			try{
				evnt = eventsHelper(type, "HTMLEvents", options);
			}catch(htmlError){
				try{
					evnt = eventsHelper(type, "UIEvents", options);
				}catch(uiError){
					evnt = eventsHelper(type, "Events", options);
				}
			}
		}else{
			evnt = eventObject(options);
		}
		return evnt;
	};
	baidu.event.fire = function(element, type, options){
		var evnt;
		type = type.replace(/^on/i, "");
		element = baidu.dom._g(element);
		options = baidu.object.extend({
			bubbles : true,
			cancelable : true,
			view : window,
			detail : 1,
			screenX : 0,
			screenY : 0,
			clientX : 0,
			clientY : 0,
			ctrlKey : false,
			altKey  : false,
			shiftKey: false,
			metaKey : false,
			keyCode : 0,
			charCode: 0,
			button  : 0,
			relatedTarget : null
		}, options);
		if(keys[type]){
			evnt = keyEvents(type, options);
		}else if(mouses[type]){
			evnt = mouseEvents(type, options);
		}else if(htmls[type]){
			evnt = htmlEvents(type, options);
		}else{
		    throw(new Error(type + " is not support!"));
		}
		if(evnt){//tigger event
			if(element.dispatchEvent){
				element.dispatchEvent(evnt);
			}else if(element.fireEvent){
				element.fireEvent("on" + type, evnt);
			}
		}
	}
})();