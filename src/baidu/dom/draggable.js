/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 */

///import baidu.dom.g;
///import baidu.dom.drag;
///import baidu.dom.getStyle;
///import baidu.dom.setStyle;
///import baidu.event.on;
///import baidu.event.un;
///import baidu.event.preventDefault;
///import baidu.object.extend;

///import baidu.lang.isFunction;
///import baidu.lang.Class;


/**
 * 让一个DOM元素可拖拽
 * @name baidu.dom.draggable
 * @function
 * @grammar baidu.dom.draggable(element[, options])
 * @param  {string|HTMLElement}   element 		        元素或者元素的ID.
 * @param  {Object} 		      [options] 			选项.
 * @config {Array} 		          [range] 		        限制drag的拖拽范围，数组中必须包含四个值，分别是上、右、下、左边缘相对上方或左方的像素距离。默认无限制.
 * @config {Number} 	          [interval] 	        拖曳行为的触发频度（时间：毫秒）.
 * @config {Boolean} 	          [capture] 	        鼠标拖曳粘滞.
 * @config {Object} 	          [mouseEvent] 	        键名为clientX和clientY的object，若不设置此项，默认会获取当前鼠标位置.
 * @config {Function} 	          [onbeforedragstart]   drag开始前触发（即鼠标按下时）.
 * @config {Function} 	          [ondragstart]         drag开始时触发.
 * @config {Function} 	          [ondrag] 		        drag进行中触发.
 * @config {Function} 	          [ondragend] 	        drag结束时触发.
 * @config {HTMLElement}          [handler] 	        用于拖拽的手柄，比如dialog的title.
 * @config {Function} 	          [toggle] 		        在每次ondrag的时候，会调用这个方法判断是否应该停止拖拽。如果此函数返回值为false，则停止拖拽.
 * @version 1.2
 * @remark    要拖拽的元素必须事先设定样式的postion值，如果postion为absloute，并且没有设定top和left，拖拽开始时，无法取得元素的top和left值，这时会从[0,0]点开始拖拽<br>如果要拖拽的元素是static定位，会被改成relative定位方式。
 * @see baidu.dom.drag
 * @returns {Draggable Instance} 拖拽实例，包含cancel方法，可以停止拖拽.
 */

baidu.dom.draggable = function(element, options) {
    options = baidu.object.extend({toggle: function() {return true}}, options || {});
    options.autoStop = true;
    element = baidu.dom.g(element);
    options.handler = options.handler || element;
    var manager,
        events = ['ondragstart', 'ondrag', 'ondragend'],
        i = events.length - 1,
        eventName,
        dragSingle,
        draggableSingle = {
            dispose: function() {
                dragSingle && dragSingle.stop();
                baidu.event.un(options.handler, 'onmousedown', handlerMouseDown);
                baidu.lang.Class.prototype.dispose.call(draggableSingle);
            }
        },
        me = this;

    //如果存在ddManager, 将事件转发到ddManager中
    if (manager = baidu.dom.ddManager) {
        for (; i >= 0; i--) {
            eventName = events[i];
            options[eventName] = (function(eventName) {
                var fn = options[eventName];
                return function() {
                    baidu.lang.isFunction(fn) && fn.apply(me, arguments);
                    manager.dispatchEvent(eventName, {DOM: element});
                }
            })(eventName);
        }
    }


    // 拖曳只针对有 position 定位的元素
    if (element) {
        function handlerMouseDown(e) {
            var event = options.mouseEvent = window.event || e;
            if (event.button > 1 //只支持鼠标左键拖拽; 左键代码: IE为1,W3C为0
                // 可以通过配置项里的这个开关函数暂停或启用拖曳功能
                || (baidu.lang.isFunction(options.toggle) && !options.toggle())) {
                return;
            }
            if (baidu.dom.getStyle(element, 'position') == 'static') {
                baidu.dom.setStyle(element, 'position', 'relative');
            }
            if (baidu.lang.isFunction(options.onbeforedragstart)) {
                options.onbeforedragstart(element);
            }
            dragSingle = baidu.dom.drag(element, options);
            draggableSingle.stop = dragSingle.stop;
            draggableSingle.update = dragSingle.update;
            //防止ff下出现禁止拖拽的图标
            baidu.event.preventDefault(event);
        }

        // 对拖曳的扳机元素监听 onmousedown 事件，以便进行拖曳行为
        baidu.event.on(options.handler, 'onmousedown', handlerMouseDown);
    }
    return {
        cancel: function() {
            draggableSingle.dispose();
        }
    };
};
