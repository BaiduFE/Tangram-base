
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/_eventFilter/_crossElementBoundary.js
 * author: Rocy, berg
 * version: 1.0.0
 * date: 2010/12/16
 */

///import baidu.event._eventFilter;

///import baidu.dom.contains;
///import baidu.dom.getDocument;
/**
 * 事件仅在鼠标进入/离开元素区域触发一次，当鼠标在元素区域内部移动的时候不会触发，用于为非IE浏览器添加mouseleave/mouseenter支持。
 * 
 * @name baidu.event._eventFilter._crossElementBoundary
 * @function
 * @grammar baidu.event._eventFilter._crossElementBoundary(listener, e)
 * 
 * @param {function} listener	要触发的函数
 * @param {DOMEvent} e 			DOM事件
 */

baidu.event._eventFilter._crossElementBoundary = function(listener, e){
    var related = e.relatedTarget,
        current = e.currentTarget;
    if(
       related === false || 
       // 如果current和related都是body，contains函数会返回false
       current == related ||
       // Firefox有时会把XUL元素作为relatedTarget
       // 这些元素不能访问parentNode属性
       // thanks jquery & mootools
       (related && (related.prefix == 'xul' ||
       //如果current包含related，说明没有经过current的边界
       baidu.dom.contains(current, related)))
      ){
        return ;
    }
    return listener.call(current, e);
};
