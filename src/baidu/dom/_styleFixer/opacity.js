/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_styleFixer/opacity.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */

///import baidu.dom._styleFixer;
///import baidu.browser.ie;

/**
 * 提供给setStyle与getStyle使用
 * @meta standard
 */
baidu.dom._styleFixer.opacity = baidu.browser.ie ? {
    get: function (element) {
        var filter = element.style.filter;
        return filter && filter.indexOf("opacity=") >= 0 ? (parseFloat(filter.match(/opacity=([^)]*)/)[1]) / 100) + "" : "1";
    },

    set: function (element, value) {
        var style = element.style;
        // 只能Quirks Mode下面生效??
        style.filter = (style.filter || "").replace(/alpha\([^\)]*\)/gi, "") + (value == 1 ? "" : "alpha(opacity=" + value * 100 + ")");
        // IE filters only apply to elements with "layout."
        style.zoom = 1;
    }
} : null;
