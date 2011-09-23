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
///import baidu.lang.toArray;
///import baidu.event;

///import baidu.fn.methodize;
///import baidu.fn.wrapReturnValue;
///import baidu.fn.multize;


/**
 * 通过该方法封装的对象可使用dom、event方法集合以及each方法进行链式调用
 * @namespace baidu.element
 */
baidu.element = function(node){
    var gNode = baidu._g(node);
    if(!gNode && baidu.dom.query){
        gNode = baidu.dom.query(node);
    }
    return new baidu.element.Element(gNode);
};
// 声明快捷方法
baidu.e = baidu.element;

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
        //由于element可能会在其他代码之前加载，因此用这个方法来延迟加载
        baidu.element._makeChain();
        baidu.element._init = true;
    }
    /**
     * @private
     * @type {Array.<Node>}
     */
    this._dom = (node.tagName || '').toLowerCase() == 'select' ? 
    	[node] : baidu.lang.toArray(node);
};

/**
 * 以每一个匹配的元素作为上下文执行传递进来的函数，方便用户自行遍历dom。
 * @name baidu.element.each
 * @function
 * @grammar baidu.element(node).each(iterator)
 * @param {Function} iterator 遍历Dom时调用的方法
 * @version 1.3
 */
baidu.element.Element.prototype.each = function(iterator) {
    // 每一个iterator接受到的都是封装好的node
    baidu.array.each(this._dom, function(node, i){
        iterator.call(node, node, i);
    });
};

/*
 * 包装静态方法，使其变成一个链条方法。
 * 先把静态方法multize化，让其支持接受数组参数，
 * 然后包装返回值，返回值是一个包装类
 * 最后把静态方法methodize化，让其变成一个对象方法。
 *
 * @param {Function}    func    要包装的静态方法
 * @param {number}      index   包装函数的第几个返回值
 *
 * @return {function}   包装后的方法，能直接挂到Element的prototype上。
 * @private
 */
baidu.element._toChainFunction = function(func, index, joinArray){
    return baidu.fn.methodize(baidu.fn.wrapReturnValue(baidu.fn.multize(func, 0, 1), baidu.element.Element, index), '_dom');
};

/**
 * element对象包装了dom包下的除了drag和ready,create,ddManager之外的大部分方法。这样做的目的是提供更为方便的链式调用操作。其中doms代指dom包下的方法名。
 * @name baidu.element.doms
 * @function
 * @grammar baidu.element(node).doms
 * @param 详见dom包下相应方法的参数。
 * @version 1.3
 * @private
 */
baidu.element._makeChain = function(){ //将dom/event包下的东西挂到prototype里面
    var proto = baidu.element.Element.prototype,
        fnTransformer = baidu.element._toChainFunction;

    //返回值是第一个参数的包装
    baidu.each(("draggable droppable resizable fixable").split(' '),
              function(fn){
                  proto[fn] =  fnTransformer(baidu.dom[fn], 1);
              });

    //直接返回返回值
    baidu.each(("remove getText contains getAttr getPosition getStyle hasClass intersect hasAttr getComputedStyle").split(' '),
              function(fn){
                  proto[fn] = proto[fn.replace(/^get[A-Z]/g, stripGet)] = fnTransformer(baidu.dom[fn], -1);
              });

    //包装返回值
    //包含
    //1. methodize
    //2. multize，结果如果是数组会被展平
    //3. getXx == xx
    baidu.each(("addClass empty hide show insertAfter insertBefore insertHTML removeClass " + 
              "setAttr setAttrs setStyle setStyles show toggleClass toggle next first " + 
              "getAncestorByClass getAncestorBy getAncestorByTag getDocument getParent getWindow " +
              "last next prev g removeStyle setBorderBoxSize setOuterWidth setOuterHeight " +
              "setBorderBoxWidth setBorderBoxHeight setPosition children query").split(' '),
              function(fn){
                  proto[fn] = proto[fn.replace(/^get[A-Z]/g, stripGet)] = fnTransformer(baidu.dom[fn], 0);
              });

    //对于baidu.dom.q这种特殊情况，将前两个参数调转
    //TODO：需要将这种特殊情况归纳到之前的情况中
    proto['q'] = proto['Q'] = fnTransformer(function(arg1, arg2){
        return baidu.dom.q.apply(this, [arg2, arg1].concat([].slice.call(arguments, 2)));
    }, 0);

    //包装event中的on 和 un
    baidu.each(("on un").split(' '), function(fn){
        proto[fn] = fnTransformer(baidu.event[fn], 0);
    });
  
    /** 
     * 方法提供了事件绑定的快捷方式，事件发生时会触发传递进来的函数。events代指事件方法的总和。
     * @name baidu.element.events 
     * @function
     * @grammar baidu.element(node).events(fn)
     * @param {Function} fn 事件触发时要调用的方法
     * @version 1.3
     * @remark 包装event的快捷方式具体包括blur、focus、focusin、focusout、load 、resize 、scroll 、unload 、click、 dblclick、mousedown 、mouseup 、mousemove、 mouseover 、mouseout 、mouseenter、 mouseleave、change 、select 、submit 、keydown、 keypress 、keyup、 error。
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
