/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getText.js
 * author: berg
 * version: 1.0
 * date: 2010/07/16 
 */

///import baidu.dom._g;

/**
 * 获得元素中的文本内容。
 * @name baidu.dom.getText
 * @function
 * @grammar baidu.dom.getText(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @version 1.3
 *             
 * @returns {String} 元素中文本的内容      
 */
baidu.dom.getText = function (element) {
    var ret = "", childs, i=0, l;

    element = baidu._g(element);

    //  text 和 CDATA 节点，取nodeValue
    if ( element.nodeType === 3 || element.nodeType === 4 ) {
        ret += element.nodeValue;
    } else if ( element.nodeType !== 8 ) {// 8 是 comment Node
        childs = element.childNodes;
        for(l = childs.length; i < l; i++){
            ret += baidu.dom.getText(childs[i]);
        }
    }

    return ret;
};
