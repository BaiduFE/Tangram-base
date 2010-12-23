/*
 * Tangram
 * Copyright 2010 Baidu Inc. All right reserved.
 * 
 * path: baidu/dom/element.js
 * author: berg
 * version: 1.0.0
 * date: 2010-07-12
 */

///import baidu.dom._g;

///import baidu.lang.isString;

///import baidu.array.each;
///import baidu.lang.isArray;
///import baidu.event;


/**
 * @namespace baidu.element 通过该方法封装的对象可使用dom、event方法集合以及each方法进行链式调用。
 */
baidu.e = baidu.element = function(node){
    var gNode = baidu._g(node);
    if(!gNode && baidu.dom.query){
        gNode = baidu.dom.query(node);
    }
    return new baidu.element.Element(gNode);
};

///import baidu.element._wrapFunction;

/**
 * Element类，所有扩展到链条上的方法都会被放在这里面
 * @name baidu.element.Element
 * @grammar baidu.element.Element(node)
 * @param {DOMElement|NodeList} node   目标元素，可以是数组或者单个node节点
 * @returns {ElementObj} 包装后的DOM对象
 * @version 1.3
 */
baidu.element.Element = function(node){
    if(!baidu.element._init){
        baidu.element._initChain();
        baidu.element._init = true;
    }
    var me = this;
    me._dom = [];
    if(baidu.lang.isArray(node)){
        baidu.each(node, function(eachNode, key){
            me._dom[key] = eachNode;
        });
    }else{
        me._dom[0] = node; 
    }
};

baidu.element.Element.prototype = {
    /**
     *
     * 以每一个匹配的元素作为上下文执行传递进来的函数，方便用户自行遍历dom。
     * @name baidu.element.each
     * @function
     * @grammar baidu.element(node).each(iterator)
     * @param {Function} iterator 遍历Dom时调用的方法
     * @version 1.3
     * @shortcut e
     * @returns {baidu.element} Element对象
     */
    each : function(iterator){
        //每一个iterator接受到的都是封装好的node
        baidu.array.each(this._dom, function(node){
            iterator.call(this, (new baidu.element.Element(node)));
        });
    }
    
};
/**
 * element对象包装了dom包下的除了drag和ready,create,ddManager之外的大部分方法。这样做的目的是提供更为方便的链式调用操作。其中doms代指dom包下的方法名。
 * @name baidu.element.doms
 * @function
 * @grammar baidu.element(node).doms
 * @param 详见dom包下相应方法的参数。
 * @version 1.3
 * @shortcut e
 * @returns {baidu.element} Element对象
 */
baidu.element._initChain = function(){ //将dom/event包下的东西挂到prototype里面
    var proto = baidu.element.Element.prototype,
        wrapFn = baidu.element._wrapFunction;

    //返回值是第一个参数的包装
    baidu.each(("draggable droppable resizable").split(' '),
              function(fn){
                  proto[fn] =  wrapFn(baidu.dom[fn], 1);
              });

    //直接返回返回值
    baidu.each(("remove getText contains getAttr getPosition getStyle hasClass intersect hasAttr").split(' '),
              function(fn){
                  proto[fn] = proto[fn.replace(/^get[A-Z]/g, stripGet)] = wrapFn(baidu.dom[fn], -1);
              });

    //包装返回值
    baidu.each(("addClass empty hide show insertAfter insertBefore insertHTML removeClass " + 
              "setAttr setAttrs setStyle setStyles show toggleClass toggle children next first " + 
              "getAncestorByClass getAncestorBy getAncestorByTag getDocument getParent getWindow " +
              "last next prev g q query removeStyle setOuter setOuterWidth setOuterHeight setPosition").split(' '),
              function(fn){
                  proto[fn] = proto[fn.replace(/^get[A-Z]/g, stripGet)] = wrapFn(baidu.dom[fn], 0);
              });

    //包装event中的on 和 un
    baidu.each(("on un").split(' '), function(fn){
        proto[fn] = wrapFn(baidu.event[fn], 0);
    });
	/** 
	 * 方法提供了事件绑定的快捷方式，事件发生时会触发传递进来的函数。events代指事件方法的总和。
	 * @name baidu.element.events 
	 * @function
	 * @grammar baidu.element(node).events(fn)
	 * @param {Function} fn 事件触发时要调用的方法
	 * @version 1.3
	 * @remark 包装event的快捷方式具体包括blur、focus、focusin、focusout、load 、resize 、scroll 、unload 、click、 dblclick、mousedown 、mouseup 、mousemove、 mouseover 、mouseout 、mouseenter、 mouseleave、change 、select 、submit 、keydown、 keypress 、keyup、 error。
     * @shortcut e
	 * @returns {baidu.element} Element对象
	 */
    //包装event的快捷方式
    baidu.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
                "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
                "change select submit keydown keypress keyup error").split(' '), function(fnName){
        proto[fnName] = function(fn){
            return this.on(fnName, fn);
        };
    });


    /**
     * 把get去掉
     * 链里面的方法可以不以get开头调用
     * 如 baidu.element("myDiv").parent() == baidu.element("myDiv").getParent();
     * TODO: 合并getter和setter. baidu.e('myDiv').style() &  baidu.e('myDiv').style('width', '100');
     */
    function stripGet(match) {  
        return match.charAt(3).toLowerCase();
    }
};
