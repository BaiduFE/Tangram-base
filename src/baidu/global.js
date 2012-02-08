/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * version: 1.4.0
 * date: 2011/07/05
 */

///import baidu;

/**
 * @namespace baidu.global 操作global对象的方法。
 * @author meizz
 */
baidu.global = baidu.global || {};

// 将全局存放在的变量都集中到一个地方
window[baidu.guid].global = window[baidu.guid].global || {};