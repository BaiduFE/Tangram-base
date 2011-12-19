/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/register.js
 * author: meizz, dron
 * version: 2.0
 * date: 2011/11/29
 */

///import baidu.global.get;
///import baidu.global.set;

/**
 * 根据参数(guid)的指定，返回对应的实例对象引用
 * @name baidu.lang.register
 * @function
 * @grammar baidu.lang.register(Class, pluginFn)
 * @param   {Class}     Class   		接受注册的载体 类
 * @param   {Function}  constructorHook 运行在载体类构造器里钩子函数
 * @param	{JSON}		methods			挂载到载体类原型链上的方法集
 * @meta standard
 *             
 */
baidu.lang.register = function (Class, constructorHook, methods) {
    var key = Class.prototype.__type + baidu.version;
    var go = baidu.global.get(key);
    if (baidu.toString.call(go) != "Array") {
        go = baidu.global.set(key, []);
    }
    go[go.length] = constructorHook;

    for (var method in methods) {
    	Class.prototype[method] = methods[method];
    }
};

// 20111129	meizz	添加第三个参数，可以直接挂载方法到目标类原型链上