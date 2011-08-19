/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path: baidu/fn/abstractMethod.js
 * author: leeight
 * version: 1.0.0
 * date: 2011/04/29
 */

///import baidu.fn;

/**
 * 定义一个抽象方法
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be
 *   overridden.
 * @see goog.abstractMethod
 */
baidu.fn.abstractMethod = function() {
    throw Error('unimplemented abstract method');
};
