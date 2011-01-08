/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/object/extend.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/30
 */

///import baidu.object;

/**
 * 将源对象的所有属性拷贝到目标对象中
 * @name baidu.object.extend
 * @function
 * @grammar baidu.object.extend(target, source)
 * @param {Object} target 目标对象
 * @param {Object} source 源对象
 * @remark
 * 
1.目标对象中，与源对象key相同的成员将会被覆盖。<br>
2.源对象的prototype成员不会拷贝。
		
 * @shortcut extend
 * @meta standard
 *             
 * @returns {Object} 目标对象
 */
baidu.object.extend = function (target, source) {
    for (var p in source) {
        if (source.hasOwnProperty(p)) {
            target[p] = source[p];
        }
    }
    
    return target;
};

// 声明快捷方法
baidu.extend = baidu.object.extend;
