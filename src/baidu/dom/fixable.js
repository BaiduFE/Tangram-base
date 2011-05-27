/*
 * Tangram
 * Copyright 2010 Baidu Inc. All right reserved.
 */

///import baidu.dom.g;
///import baidu.dom.getAttr;
///import baidu.dom.setAttr;
///import baidu.dom.getStyle;
///import baidu.dom.getPosition;
///import baidu.dom.setStyle;
///import baidu.dom.setStyles;
///import baidu.event.on;
///import baidu.event.un;
///import baidu.browser.ie;
///import baidu.object.extend;
///import baidu.page.getViewHeight;
///import baidu.page.getViewWidth;

/**
 * 使目标元素拥有可进行与页面可见区域相对位置保持不变的移动的能力
 * @name baidu.dom.fixable
 * @function
 * @param {HTMLElement|String} element 目标元素或目标元素的id
 * @param {Object} options 配置项
 * @config {String} [vertival] 取值[top|bottom] 默认值 top
 * @config {Strgin} [horizontal] 取值[left|right] 默认值 left
 * @config {Object} offset {x:String|Number, y:String|Number}} 横向与纵向的取值
 * @config {Boolean} [autofix] 是否自动进行fix，默认值为true
 * @config {Function} onrender
 * @config {Function} onupdate
 * @config {Function} onrelease
 * @return {Object} 
 * @config {Function} render
 * @config {Function} update
 * @config {Function} release
 */

baidu.dom.fixable = function(element, options){

    var target  = baidu.g(element),
        isIE6 = baidu.browser.ie && baidu.browser.ie <= 6 ? true : false,
        isIE7 = baidu.browser.ie && baidu.browser.ie == 7 ? true : false,
        vertival = options.vertival || 'top',
        horizontal = options.horizontal || 'left',
        autofix = options.autofix || true,
        origPos,offset,isRender = false,
        onrender = options.onrender || new Function(),
        onupdate = options.onupdate || new Function(),
        onrelease = options.onrelease || new Function();

    if(!target) return;

    //获取target原始值
    origPos = _getOriginalStyle();
    //设置offset值
    offset = {y:origPos.top,x:origPos.left};
    baidu.extend(offset, options.offset || {});

    autofix && render();
   
    function _convert(){
        return {
            top : vertival == "top" ? offset.y : baidu.page.getViewHeight() - offset.y - origPos.height,
            left: horizontal == "left" ? offset.x : baidu.page.getViewWidth() - offset.x - origPos.width
        };
    }

    /**
     * 
     */
    function _handleOnMove(){
        var p = _convert(); 
        
        target.style.setExpression("left","eval((document.body.scrollLeft || document.documentElement.scrollLeft) + " + p.left + ") + 'px'");
        target.style.setExpression("top", "eval((document.body.scrollTop || document.documentElement.scrollTop) + " + p.top + ") + 'px'");
    }

    /**
     * 返回target原始position值
     * @return {Object}
     */
    function _getOriginalStyle(){
        var result = {
            position: baidu.getStyle(target,"position"),
            height: function(){
                var h = baidu.getStyle(target,"height");
                return (h != "auto") ? (/\d+/.exec(h)[0]) : target.offsetHeight;
            }(),
            width: function(){			
                var w = baidu.getStyle(target,"width");
                return (w != "auto") ? (/\d+/.exec(w)[0]) : target.offsetWidth;
            }()
        };

        result.top = (isIE6 || isIE7) ? (result.position == "static" ? baidu.dom.getPosition(target).top :  baidu.dom.getPosition(target).top - baidu.dom.getPosition(target.parentNode).top) : target.offsetTop;
        result.left = (isIE6 || isIE7) ? (result.position == "static" ? baidu.dom.getPosition(target).left :  baidu.dom.getPosition(target).left - baidu.dom.getPosition(target.parentNode).left) : target.offsetLeft;

        return result;
    }

    function _start(){
        
    }

    function render(){
        if(isRender) return;

        baidu.setStyles(target, {top:'', left:'', bottom:'', right:''});
        
        if(!isIE6){
            var style = {position:"fixed"};
            style[vertival == "top" ? "top" : "bottom"] = offset.y + "px";
            style[horizontal == "left" ? "left" : "right"] = offset.x + "px";

            baidu.setStyles(target, style);
        }else{
            baidu.setStyle(target,"position","absolute");
            _handleOnMove();
        }

        onrender();
        isRender = true;
    }

    function release(){
       if(!isRender) return;

       var style = {
           position: origPos.position,
           left: origPos.left + 'px',
           top: origPos.top + 'px'
       };

        if(isIE6){
            target.style.removeExpression("left");
            target.style.removeExpression("top");
        }
        baidu.setStyles(target, style);

        onrelease();
        isRender = false;
    }

    function update(options){
        if(!options) return;

        //更新事件
        onrender = options.onrender || onrender;
        onupdate = options.onupdate || onupdate;
        onrelease = options.onrelease || onrelease;
        
        //更新设置
        vertival = options.vertival || 'top';
        horizontal = options.horizontal || 'left';

        //更新offset
        baidu.extend(offset, options.offset || {});

        onupdate();
    }

    return {render: render, update: update, release:release};
};
