/*
 * Tangram
 * Copyright 2009 Baidu, Inc. All rights reserved.
 * 
 * path: baidu/dom/setOuter.js
 * author: berg
 * version: 1.0
 * date: 2010/12/15
 */

///import baidu.dom;
///import baidu.dom.setStyles;
///import baidu.dom.getStyle;
///import baidu.dom._styleFilter.px;

///import baidu.browser.isStrict;

/**
 * 设置元素的outerHeight和outerWidth，暂时只支持元素的padding/border/height/width使用同一种计量单位的情况。不支持：1. 非数字值(medium)，2. em/px在不同的属性中混用。
 * @name baidu.dom.setOuter
 * @function
 * @grammar baidu.dom.setOuter(element, styles)
 * @param {HTMLElement|string} element 元素或DOM元素的id
 * @param {object} styles 包含height和width键名的对象，表示要设置的height和width
 *
 * @return {HTMLElement}  设置好的元素
 */
 //(TODO，在getStyle里面做统一filter)
baidu.dom.setOuter = function (element, styles) {
    function getNumericalStyle(name){
        //global element;
        return parseFloat(baidu.getStyle(element, name)) || 0;
    }
    
    if(baidu.browser.isStrict){
        if(styles.width){
            styles.width -= getNumericalStyle('paddingLeft') + 
                            getNumericalStyle('paddingRight') + 
                            getNumericalStyle('borderLeftWidth') + 
                            getNumericalStyle('borderRightWidth');
        }
        if(styles.height){
            styles.height -= getNumericalStyle('paddingTop') + 
                             getNumericalStyle('paddingBottom') + 
                             getNumericalStyle('borderTopWidth') + 
                             getNumericalStyle('borderBottomWidth');
        }
    }
    return baidu.dom.setStyles(element, styles);
};
