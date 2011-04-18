/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */


///import baidu.swf;
///import baidu.swf.getMovie;
///import baidu.lang.createClass;

/**
 * baidu.swf.Proxy
 * @name baidu.swf.Proxy
 * @constructor
 * @param {string} id Flash的元素id.object标签id, embed标签name.
 * @param {string} property Flash的方法或者属性名称，用来检测Flash是否初始化好了.
 * @param {Function=} opt_loadedHandler 初始化之后的回调函数.
 * @remark Flash对应的DOM元素必须已经存在, 否则抛错. 可以使用baidu.swf.create预先创建Flash对应的DOM元素.
 * @author liyubei@baidu.com (leeight)
 */
baidu.swf.Proxy = baidu.lang.createClass(function(id, property, opt_loadedHandler) {
    this._id = id;
    this._property = property;
    this._loadedHandler = opt_loadedHandler || null;
    this.initialized = false;
    /**
     * 页面上的Flash对象
     * @type {HTMLElement}
     */
    this._flash = null;
    this._init();
}).extend({
    /**
     * 获取flash对象.
     * @return {HTMLElement} Flash对象.
     */
    getFlash : function() {
        return (this._flash || (this._flash = baidu.swf.getMovie(this._id)));
    },
    /**
     * 初始化
     * @private
     */
    _init : function() {
        if (! this._property) {
            return;
        }
        var flash = this.getFlash(),
            property = this._property,
            loadedHandler = this._loadedHandler,
            timer = setInterval(function() {
                try {
                    /** @preserveTry */
                    if (flash[property]) {
                        this.initialized = true;
                        clearInterval(timer);
                        if (loadedHandler) {
                            loadedHandler();
                        }
                    }
                } catch (e) {
                }
            }, 100);
    },
    /**
     * 判断Flash是否初始化完成,可以与js进行交互.
     */
    isReady : function(){
        return this.initialized;  
    },
    /**
     * 调用Flash中的某个方法
     * @param {string} methodName 方法名.
     * @param {...*} var_args 方法的参数.
     */
    call : function(methodName, var_args) {
        try {
            var flash = this.getFlash(),
                args = Array.prototype.slice.call(arguments);

            args.shift();
            if (flash[methodName]) {
                flash[methodName].apply(flash, args);
            }
        } catch (e) {
        }
    }
});
