/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_NAME_ATTRS.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/2
 */

///import baidu.dom;
///import baidu.browser.ie;

/**
 * 提供给setAttr与getAttr方法作名称转换使用
 * ie6,7下class要转换成className
 * @meta standard
 */

baidu.dom._NAME_ATTRS = (function () {
    var result = {
        'cellpadding': 'cellPadding',
        'cellspacing': 'cellSpacing',
        'colspan': 'colSpan',
        'rowspan': 'rowSpan',
        'valign': 'vAlign',
        'usemap': 'useMap',
        'frameborder': 'frameBorder'
    };
    
    if (baidu.browser.ie < 8) {
        result['for'] = 'htmlFor';
        result['class'] = 'className';
    } else {
        result['htmlFor'] = 'for';
        result['className'] = 'class';
    }
    
    return result;
})();
