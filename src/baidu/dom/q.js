/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/q.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */

///import baidu.dom.g;
///import baidu.string.trim;
///import baidu.string.escapeReg;

/**
 * 通过className获取元素
 * @name baidu.dom.q
 * @function
 * @grammar baidu.dom.q(className[, element, tagName])
 * @param {string} className 元素的class，只能指定单一的class，如果为空字符串或者纯空白的字符串，返回空数组。
 * @param {string|HTMLElement} [element] 开始搜索的元素，默认是document。
 * @param {string} [tagName] 要获取元素的标签名，如果没有值或者值为空字符串或者纯空白的字符串，表示不限制标签名。
 * @remark 不保证返回数组中DOM节点的顺序和文档中DOM节点的顺序一致。
 * @shortcut q,T.Q
 * @meta standard
 * @see baidu.dom.g
 *             
 * @returns {Array} 获取的元素集合，查找不到或className参数错误时返回空数组.
 */
baidu.dom.q = function (className, element, tagName) {
    var result = [], 
    trim = baidu.string.trim, 
    len, i, elements, node;

    if (!(className = trim(className))) {
        return result;
    }
    
    // 初始化element参数
    if ('undefined' == typeof element) {
        element = document;
    } else {
        element = baidu.dom.g(element);
        if (!element) {
            return result;
        }
    }
    
    // 初始化tagName参数
    tagName && (tagName = trim(tagName).toUpperCase());
    
    // 查询元素
    if (element.getElementsByClassName) {
        elements = element.getElementsByClassName(className); 
        len = elements.length;
        for (i = 0; i < len; i++) {
            node = elements[i];
            if (tagName && node.tagName != tagName) {
                continue;
            }
            result[result.length] = node;
        }
    } else {
        className = new RegExp(
                        "(^|\\s)" 
                        + baidu.string.escapeReg(className)
                        + "(\\s|\x24)");
        elements = tagName 
                    ? element.getElementsByTagName(tagName) 
                    : (element.all || element.getElementsByTagName("*"));
        len = elements.length;
        for (i = 0; i < len; i++) {
            node = elements[i];
            className.test(node.className) && (result[result.length] = node);
        }
    }

    return result;
};

// 声明快捷方法
baidu.q = baidu.Q = baidu.dom.q;
