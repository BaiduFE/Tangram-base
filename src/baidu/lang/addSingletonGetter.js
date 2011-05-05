/*
 * tangram
 * copyright 2011 baidu inc. all rights reserved.
 *
 * path: baidu/lang/addSingletonGetter.js
 * author: leeight
 * version: 1.1.0
 * date: 2011/04/30
 */

///import baidu.lang;

/**
 * 给构造函数添加一个{@code getInstance}的方法，调用这个方法的时候就一直返回
 * 同一个实例.
 * @param {!Function} ctor 需要处理的构造函数.
 * @see goog.addSingletonGetter
 */
baidu.lang.addSingletonGetter = function(ctor) {
    ctor.getInstance = function() {
        return ctor.instance_ || (ctor.instance_ = new ctor());
    };
};






















/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
