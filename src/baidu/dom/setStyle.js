/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/setStyle.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/18
 */

///import baidu.dom.g;
///import baidu.dom._styleFixer;
///import baidu.dom._styleFilter.filter;
///import baidu.string.toCamelCase;

/**
 * 设置目标元素的style样式值
 * @name baidu.dom.setStyle
 * @function
 * @grammar baidu.dom.setStyle(element, key, value)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} key 要设置的样式名
 * @param {string} value 要设置的样式值
 * @remark
 * 
            为了精简代码，本模块默认不对任何浏览器返回值进行归一化处理（如使用getStyle时，不同浏览器下可能返回rgb颜色或hex颜色），也不会修复浏览器的bug和差异性（如设置IE的float属性叫styleFloat，firefox则是cssFloat）。<br />
baidu.dom._styleFixer和baidu.dom._styleFilter可以为本模块提供支持。<br />
其中_styleFilter能对颜色和px进行归一化处理，_styleFixer能对display，float，opacity，textOverflow的浏览器兼容性bug进行处理。
		
 * @shortcut setStyle
 * @meta standard
 * @see baidu.dom.getStyle,baidu.dom.setStyles
 *             
 * @returns {HTMLElement} 目标元素
 */
baidu.dom.setStyle = function (element, key, value) {
    var dom = baidu.dom, fixer;
    
    // 放弃了对firefox 0.9的opacity的支持
    element = dom.g(element);
    key = baidu.string.toCamelCase(key);

    if (fixer = dom._styleFilter) {
        value = fixer.filter(key, value, 'set');
    }

    fixer = dom._styleFixer[key];
    (fixer && fixer.set) ? fixer.set(element, value) : (element.style[fixer || key] = value);

    return element;
};

// 声明快捷方法
baidu.setStyle = baidu.dom.setStyle;
