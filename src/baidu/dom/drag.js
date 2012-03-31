/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 *
 * path: baidu/dom/drag.js
 * author: meizz
 * modify: linlingyu
 * version: 1.1.0
 * date: 2010/06/02
 */

/**
 * 拖动指定的DOM元素
 * @name baidu.dom.drag
 * @function
 * @grammar baidu.dom.drag(element, options)
 * @param {HTMLElement|string} element 元素或者元素的id.
 * @param {Object} options 拖曳配置项.

 * @param {Array} options.range 限制drag的拖拽范围，数组中必须包含四个值，分别是上、右、下、左边缘相对上方或左方的像素距离。默认无限制.
 * @param {Number} options.interval 拖曳行为的触发频度（时间：毫秒）.
 * @param {Boolean} options.capture 鼠标拖曳粘滞.
 * @param {Object} options.mouseEvent 键名为clientX和clientY的object，若不设置此项，默认会获取当前鼠标位置.
 * @param {Function} options.ondragstart drag开始时触发.
 * @param {Function} options.ondrag drag进行中触发.
 * @param {Function} options.ondragend drag结束时触发.
 * @param {function} options.autoStop 是否在onmouseup时自动停止拖拽。默认为true.
 * @version 1.2
 * @remark
 * 要拖拽的元素必须事先设定样式的postion值，如果postion为absloute，并且没有设定top和left，拖拽开始时，无法取得元素的top和left值，这时会从[0,0]点开始拖拽

 * @see baidu.dom.draggable
 */
///import baidu.dom.g;
///import baidu.object.extend;
///import baidu.dom.getStyle;
///import baidu.page.getMousePosition;
///import baidu.event.on;
///import baidu.event.un;
///import baidu.event.preventDefault;
///import baidu.lang.isFunction;
///import baidu.lang.isObject;
///import baidu.page.getScrollLeft;
///import baidu.page.getScrollTop;


(function(){
    var target, // 被拖曳的DOM元素
        op, ox, oy, timer, left, top, lastLeft, lastTop, mozUserSelect;
    baidu.dom.drag = function(element, options){
        if(!(target = baidu.dom.g(element))){return false;}
        op = baidu.object.extend({
            autoStop: true, // false 用户手动结束拖曳 ｜ true 在mouseup时自动停止拖曳
            capture: true,  // 鼠标拖曳粘滞
            interval: 16    // 拖曳行为的触发频度（时间：毫秒）
        }, options);
        lastLeft = left = parseInt(baidu.dom.getStyle(target, 'left')) || 0;
        lastTop = top = parseInt(baidu.dom.getStyle(target, 'top')) || 0;
        setTimeout(function(){
            var mouse = baidu.page.getMousePosition();  // 得到当前鼠标坐标值
            ox = op.mouseEvent ? (baidu.page.getScrollLeft() + op.mouseEvent.clientX) : mouse.x;
            oy = op.mouseEvent ? (baidu.page.getScrollTop() + op.mouseEvent.clientY) : mouse.y;
            clearInterval(timer);
            timer = setInterval(render, op.interval);
        }, 1);
        // 这项为 true，缺省在 onmouseup 事件终止拖曳
        op.autoStop && baidu.event.on(document, 'mouseup', stop);
        // 在拖曳过程中页面里的文字会被选中高亮显示，在这里修正
        baidu.event.on(document, 'selectstart', unselect);
        // 设置鼠标粘滞
        if (op.capture && target.setCapture) {
            target.setCapture();
        } else if (op.capture && window.captureEvents) {
            window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
        }
        // fixed for firefox
        mozUserSelect = document.body.style.MozUserSelect;
        document.body.style.MozUserSelect = 'none';
        baidu.lang.isFunction(op.ondragstart)
            && op.ondragstart(target, op);
        return {
            stop: stop, dispose: stop,
            update: function(options){
                baidu.object.extend(op, options);
            }
        }
    }
    // 停止拖曳
    function stop() {
        clearInterval(timer);
        // 解除鼠标粘滞
        if (op.capture && target.releaseCapture) {
            target.releaseCapture();
        } else if (op.capture && window.captureEvents) {
            window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
        }
        // 拖曳时网页内容被框选
        document.body.style.MozUserSelect = mozUserSelect;
        baidu.event.un(document, 'selectstart', unselect);
        op.autoStop && baidu.event.un(document, 'mouseup', stop);
        // ondragend 事件
        baidu.lang.isFunction(op.ondragend)
            && op.ondragend(target, op, {left: lastLeft, top: lastTop});
    }
    // 对DOM元素进行top/left赋新值以实现拖曳的效果
    function render(e) {
        var rg = op.range || [],
            mouse = baidu.page.getMousePosition(),
            el = left + mouse.x - ox,
            et = top  + mouse.y - oy;

        // 如果用户限定了可拖动的范围
        if (baidu.lang.isObject(rg) && rg.length == 4) {
            el = Math.max(rg[3], el);
            el = Math.min(rg[1] - target.offsetWidth, el);
            et = Math.max(rg[0], et);
            et = Math.min(rg[2] - target.offsetHeight, et);
        }
        target.style.left = el + 'px';
        target.style.top  = et + 'px';
        lastLeft = el;
        lastTop = et;
        baidu.lang.isFunction(op.ondrag)
            && op.ondrag(target, op, {left: lastLeft, top: lastTop});
    }
    // 对document.body.onselectstart事件进行监听，避免拖曳时文字被选中
    function unselect(e) {
        return baidu.event.preventDefault(e, false);
    }
})();
// [TODO] 20100625 添加cursorAt属性，absolute定位的定位的元素在不设置top|left值时，初始值有问题，得动态计算
// [TODO] 20101101 在drag方法的返回对象中添加 dispose() 方法析构drag