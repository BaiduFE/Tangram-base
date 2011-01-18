/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 */

///import baidu.array.each;
///import baidu.object.each;
///import baidu.dom.setStyle;
///import baidu.dom.setStyles;
///import baidu.dom._styleFilter.px;
///import baidu.dom.create;
///import baidu.lang.isNumber;
///import baidu.event.on;
///import baidu.dom.addClass;
///import baidu.page.getMousePosition;
///import baidu.lang.isFunction;
///import baidu.dom.getPosition;
///import baidu.event.getTarget;
///import baidu.dom.remove;
///import baidu.dom.setOuter;

/**
 * 绘制可以根据鼠标行为改变HTMLElement大小的resize handle
 * @name baidu.dom.resizable
 * @function
 * @grammar baidu.dom.resizable(element[, options])
 * @param {HTMLElement|string} element 需要改变大小的元素或者元素的id.
 * @param {Object} [options] resizable参数配置
 * @config {Array} [direction] 可以改变的方向[e,se,s,ws,w,wn,n,en]
 * @config {Function} [onresizestart] 开始改变大小时触发
 * @config {Function} [onresizeend] 大小改变结束时触发
 * @config {Function} [onresize] 大小改变后时触发
 * @config {Number|String} [maxWidth] 可改变的最大宽度
 * @config {Number|String} [maxHeight] 可改变的最大高度
 * @config {Number|String} [minWidth] 可改变的最小宽度
 * @config {Number|String} [minHeight] 可改变的最小高度
 * @config {String} [classPrefix] className 前缀
 * @config {Object} [directionHandlePosition] resizHandle的位置参数
 * @return {Object} {cancel:Function} cancel函数
 * @remark  需要将元素的定位设置为absolute
 * @author lixiaopeng
 * @version 1.3
 */
baidu.dom.resizable = function(element,options) {
    var target,
        op,
        resizeHandle = {},
        directionHandlePosition,
        orgStyles = {},
        range, mozUserSelect,
        orgCursor,
        offsetParent,
        currentEle;

    if (!(target = baidu.dom.g(element)) && baidu.getStyle(target, 'position') == 'static') {
        return false;
    }
    offsetParent = target.offsetParent;
    
    /*
     * 必要参数的扩展
     * resize handle以方向命名
     * 顺时针的顺序为
     * north northwest west southwest south southeast east northeast
     */
    op = baidu.extend({
        direction: ['e', 's', 'se'],
        minWidth: 16,
        minHeight: 16,
        classPrefix: 'tangram',
        directionHandlePosition: {}
    }, options);

    /*
     * resizeHandle的位置参数
     */
    handlePosition = baidu.extend({
        'e' : {'right': '-5px', 'top': '0px', 'width': '7px', 'height': target.offsetHeight},
        's' : {'left': '0px', 'bottom': '-5px', 'height': '7px', 'width': '100%'},
        'n' : {'left': '0px', 'top': '-5px', 'height': '7px', 'width': '100%'},
        'w' : {'left': '-5px', 'top': '0px', 'height': target.offsetHeight, 'width': '7px'},
        'se': {'right': '1px', 'bottom': '1px', 'height': '16px', 'width': '16px'},
        'sw': {'left': '1px', 'bottom': '1px', 'height': '16px', 'width': '16px'},
        'ne': {'right': '1px', 'top': '1px', 'height': '16px', 'width': '16px'},
        'nw': {'left': '1px', 'top': '1px', 'height': '16px', 'width': '16px'}
    },op.directionHandlePosition);

    /*
     * 必要参数转换
     */
    baidu.each(['minHeight', 'minWidth', 'maxHeight', 'maxWidth'], function(style) {
        op[style] && (op[style] = parseFloat(op[style]));
    });

    /*
     * {Array[Number]} rangeObject
     * minWidth,maxWidth,minHeight,maxHeight
     */
    range = [
        op.minWidth || 0,
        op.maxWidth || Number.MAX_VALUE,
        op.minHeight || 0,
        op.maxHeight || Number.MAX_VALUE
    ];

    /*
     * 创建resizeHandle
     */
    baidu.each(op.direction, function(key) {
        var className = op.classPrefix.split(' ');
        className[0] = className[0] + '-resizable-' + key;

        var ele = baidu.dom.create('div', {
            className: className.join(' ')
        }),
        styles = handlePosition[key];

        styles['cursor'] = key + '-resize';
        styles['position'] = 'absolute';
        baidu.setStyles(ele, styles);
        ele.key = key;
        ele.style.MozUserSelect = 'none';

        target.appendChild(ele);
        resizeHandle[key] = ele;

        baidu.on(ele, 'mousedown', start);
    });

    /**
     * cancel resizeHandle
     * @public
     * @return  void
     */
    function cancel(){
        currentEle && stop();
        baidu.object.each(resizeHandle,function(item){
            baidu.un(item,"mousedown",start);
            baidu.dom.remove(item);
        });
    }

    /**
     * resizeHandle相应mousedown事件的函数
     * @param {Event} e
     * @return void
     */
    function start(e){
        var ele = baidu.event.getTarget(e),
            key = ele.key;
        currentEle = ele;

        if (ele.setCapture) {
            ele.setCapture();
        } else if (window.captureEvents) {
            window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
        }

        /*
         * 给body设置相应的css属性
         * 添加事件监听
         */
        orgCursor = baidu.getStyle(document.body, 'cursor');
        baidu.setStyle(document.body, 'cursor', key + '-resize');
        baidu.on(document, 'mouseup',stop);
        baidu.on(document.body, 'selectstart', unselect);
        mozUserSelect = document.body.style.MozUserSelect;
        document.body.style.MozUserSelect = 'none';

        /*
         * 获取鼠标坐标
         * 偏移量计算
         */
        var orgMousePosition = baidu.page.getMousePosition();
        orgStyles = getOrgStyle();
        timer = setInterval(function(){
            render(key,orgMousePosition);
        }, 20);

        baidu.lang.isFunction(op.onresizestart) && op.onresizestart();

    }

    /**
     * 当鼠标按键抬起时终止对鼠标事件的监听
     * @private
     * @return void
     */
    function stop() {
        if (currentEle.releaseCapture) {
            currentEle.releaseCapture();
        } else if (window.releaseEvents) {
            window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
        }

        /*
         * 删除事件监听
         * 还原css属性设置
         */
        baidu.un(document, 'mouseup',stop);
        baidu.un(document, 'selectstart', unselect);
        document.body.style.MozUserSelect = mozUserSelect;
        baidu.un(document.body, 'selectstart', unselect);

        clearInterval(timer);
        baidu.setStyle(document.body, 'cursor',orgCursor);
        currentEle = null;
        
        baidu.lang.isFunction(op.onresizeend) && op.onresizeend();

        vOffset = hOffset = 0;
    }

    /**
     * 根据鼠标移动的距离来绘制target
     * @private
     * @param {String} key handle的direction字符串
     * @param {Object} orgMousePosition 鼠标坐标{x,y}
     * @return void
     */
    function render(key,orgMousePosition) {
        var xy = baidu.page.getMousePosition(),
            width = orgStyles['width'],
            height = orgStyles['height'],
            top = orgStyles['top'],
            left = orgStyles['left'],
            styles;

        if (key.indexOf('e') >= 0) {
            width = Math.max(xy.x - orgMousePosition.x + orgStyles['width'], range[0]);
            width = Math.min(width, range[1]);
        }else if (key.indexOf('w') >= 0) {
            width = Math.max(orgMousePosition.x - xy.x + orgStyles['width'], range[0]);
            width = Math.min(width, range[1]);
            left = orgStyles['left'] - (width - orgStyles['width']);
        }

        if (key.indexOf('s') >= 0) {
            height = Math.max(xy.y - orgMousePosition.y + orgStyles['height'], range[2]);
            height = Math.min(height, range[3]);
        }else if (key.indexOf('n') >= 0) {
            height = Math.max(orgMousePosition.y - xy.y + orgStyles['height'], range[2]);
            height = Math.min(height, range[3]);
            top = orgStyles['top'] - (height - orgStyles['height']);
        }
         
        styles = {'width': width, 'height': height, 'top': top, 'left': left};
        baidu.dom.setOuter(target,styles);

        /*
         * ie6 fix
         * 在ie中resize的时候，若高度改变，resizeHandle.e和resizeHandle.w的高度不会改变
         */
        resizeHandle['e'] && baidu.setStyle(resizeHandle['e'], 'height', height);
        resizeHandle['w'] && baidu.setStyle(resizeHandle['w'], 'height', height);


        baidu.lang.isFunction(op.onresize) && op.onresize({current:styles,original:orgStyles});
    }

    /**
     * 阻止文字被选中
     * @private
     * @param {Event} e
     * @return {Boolean}
     */
    function unselect(e) {
        return baidu.event.preventDefault(e, false);
    }

    /**
     * 获取target的原始宽高
     * @private
     * @return {Object} {width,height,top,left}
     */
    function getOrgStyle() {
        var offset_parent = baidu.dom.getPosition(target.offsetParent),
            offset_target = baidu.dom.getPosition(target),
            top,
            left;
       
        if(target.offsetParent == document.body){
            top = offset_target.top;
            left = offset_target.left;
        }else{
            top =  offset_target.top - offset_parent.top;
            left = offset_target.left - offset_parent.left;
        }
        baidu.setStyles(target,{top:top,left:left});

        return {
            width:target.offsetWidth,
            height:target.offsetHeight,
            top:top,
            left:left
        };
    }

    function getStyleNum(style) {                                                         
        var result = parseInt(baidu.getStyle(target, style));                                    
        result = isNaN(result) ? 0 : result;                                                
        result = baidu.lang.isNumber(result) ? result : 0;                                  
        return result;                                                                      
    } 
    
    return {cancel:cancel};
};
