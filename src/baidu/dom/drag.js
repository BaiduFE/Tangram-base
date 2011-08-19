/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/drag.js
 * author: meizz, berg, lxp
 * version: 1.1.0
 * date: 2010/06/02
 */

///import baidu.dom.g;
///import baidu.dom.getStyle;
///import baidu.event.on;
///import baidu.event.un;
///import baidu.event.preventDefault;
///import baidu.object.extend;
///import baidu.page.getMousePosition;

///import baidu.page.getScrollLeft;
///import baidu.page.getScrollTop;

///import baidu.lang.isFunction;
///import baidu.dom.getPosition;

/**
 * 拖动指定的DOM元素
 * @name baidu.dom.drag
 * @function
 * @grammar baidu.dom.drag(element, options)
 * @param {HTMLElement|string} element 元素或者元素的id
 * @param {Object} options 拖曳配置项
                
 * @param {Array} options.range 限制drag的拖拽范围，数组中必须包含四个值，分别是上、右、下、左边缘相对上方或左方的像素距离。默认无限制
 * @param {Number} options.interval 拖曳行为的触发频度（时间：毫秒）
 * @param {Boolean} options.capture 鼠标拖曳粘滞
 * @param {Object} options.mouseEvent 键名为clientX和clientY的object，若不设置此项，默认会获取当前鼠标位置
 * @param {Function} options.ondragstart drag开始时触发
 * @param {Function} options.ondrag drag进行中触发
 * @param {Function} options.ondragend drag结束时触发
 * @param {function} options.autoStop 是否在onmouseup时自动停止拖拽。默认为true
 * @version 1.2
 * @remark
 * 
            要拖拽的元素必须事先设定样式的postion值，如果postion为absloute，并且没有设定top和left，拖拽开始时，无法取得元素的top和left值，这时会从[0,0]点开始拖拽
        
 * @see baidu.dom.draggable
 */
/**
 * 拖曳DOM元素
 * @param   {HTMLElement|ID}    element 被拖曳的元素
 * @param   {JSON}              options 拖曳配置项
 *          {autoStop, interval, capture, range, ondragstart, ondragend, ondrag, mouseEvent}
 */
(function(){
    var target, // 被拖曳的DOM元素
        op, ox, oy, //timer, 
        top, left, mozUserSelect,
        lastLeft, lastTop,
        isFunction = baidu.lang.isFunction,
        timer,
        offset_parent,offset_target;
    
    baidu.dom.drag = function(element, options) {
        //每次开始拖拽的时候重置lastTop和lastLeft
        lastTop = lastLeft = null;
        
        if (!(target = baidu.dom.g(element))) return false;
        op = baidu.object.extend({
            autoStop:true   // false 用户手动结束拖曳 ｜ true 在mouseup时自动停止拖曳
            ,capture : true // 鼠标拖曳粘滞
            ,interval : 16  // 拖曳行为的触发频度（时间：毫秒）
            ,handler : target
        }, options);

        offset_parent = baidu.dom.getPosition(target.offsetParent);
        offset_target = baidu.dom.getPosition(target);
       
        if(baidu.getStyle(target,'position') == "absolute"){
            top =  offset_target.top - (target.offsetParent == document.body ? 0 : offset_parent.top);
            left = offset_target.left - (target.offsetParent == document.body ? 0 :offset_parent.left);
        }else{
            top = parseFloat(baidu.getStyle(target,"top")) || -parseFloat(baidu.getStyle(target,"bottom")) || 0;
            left = parseFloat(baidu.getStyle(target,"left")) || -parseFloat(baidu.getStyle(target,"right")) || 0; 
        }

        if(op.mouseEvent){
            // [2010/11/16] 可以不依赖getMousePosition，直接通过一个可选参数获得鼠标位置
            ox = baidu.page.getScrollLeft() + op.mouseEvent.clientX;
            oy = baidu.page.getScrollTop() + op.mouseEvent.clientY;
        }else{
            var xy = baidu.page.getMousePosition();    // 得到当前鼠标坐标值
            ox = xy.x;
            oy = xy.y;
        }

        //timer = setInterval(render, op.interval);

        // 这项为 true，缺省在 onmouseup 事件终止拖曳
        op.autoStop && baidu.event.on(op.handler, "mouseup", stop);
        op.autoStop && baidu.event.on(window, "mouseup", stop);
        
        // 在拖曳过程中页面里的文字会被选中高亮显示，在这里修正
        baidu.event.on(document, "selectstart", unselect);

        // 设置鼠标粘滞
        if (op.capture && op.handler.setCapture) {
            op.handler.setCapture();
        } else if (op.capture && window.captureEvents) {
            window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
        }
        //baidu.on(target,"mousemove",render);

        // fixed for firefox
        mozUserSelect = document.body.style.MozUserSelect;
        document.body.style.MozUserSelect = "none";

        // ondragstart 事件
        if(isFunction(op.ondragstart)){
            op.ondragstart(target, op);
        }
        
        timer = setInterval(render, op.interval);
        return {stop : stop, update : update};
    };

    /**
     * 更新当前拖拽对象的属性
     */
    function update(options){
        baidu.extend(op, options);
    }

    /**
     * 手动停止拖拽
     */
    function stop() {
        clearInterval(timer);

        // 解除鼠标粘滞
        if (op.capture && op.handler.releaseCapture) {
            op.handler.releaseCapture();
        } else if (op.capture && window.releaseEvents) {
            window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
        }

        // 拖曳时网页内容被框选
        document.body.style.MozUserSelect = mozUserSelect;
        baidu.event.un(document, "selectstart", unselect);
        op.autoStop && baidu.event.un(op.handler, "mouseup", stop);
        op.autoStop && baidu.event.un(window, "mouseup", stop);

        // ondragend 事件
        if(isFunction(op.ondragend)){
            op.ondragend(target, op);
        }
    }

    // 对DOM元素进行top/left赋新值以实现拖曳的效果
    function render(e) {
        var rg = op.range,
            xy = baidu.page.getMousePosition(),
            el = left + xy.x - ox,
            et = top  + xy.y - oy;

        // 如果用户限定了可拖动的范围
        if (typeof rg == "object" && rg && rg.length == 4) {
            el = Math.max(rg[3], el);
            el = Math.min(rg[1] - target.offsetWidth,  el);
            et = Math.max(rg[0], et);
            et = Math.min(rg[2] - target.offsetHeight, et);
        }
        target.style.top = et + "px";
        target.style.left = el + "px";

        if((lastLeft !== el || lastTop !== et) && (lastLeft !== null || lastTop !== null) ){
            if(isFunction(op.ondrag)){
                op.ondrag(target, op);   
            }
        }
        lastLeft = el;
        lastTop = et;
    }

    // 对document.body.onselectstart事件进行监听，避免拖曳时文字被选中
    function unselect(e) {
        return baidu.event.preventDefault(e, false);
    }
})();
