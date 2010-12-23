/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.string.formatColor
 * @version: 2010-01-23
 */

///import baidu.string;

/**
 * 将各种浏览器里的颜色值转换成 #RRGGBB 的格式
 * @name baidu.string.formatColor
 * @function
 * @grammar baidu.string.formatColor(color)
 * @param {string} color 颜色值字符串
 * @version 1.3
 *             
 * @returns {string} #RRGGBB格式的字符串或空
 */
(function(){
    // 将正则表达式预创建，可提高效率
    var reg1 = /^\#[\da-f]{6}$/i,
        reg2 = /^rgb\((\d+), (\d+), (\d+)\)$/,
        keyword = {
            black: '#000000',
            silver: '#c0c0c0',
            gray: '#808080',
            white: '#ffffff',
            maroon: '#800000',
            red: '#ff0000',
            purple: '#800080',
            fuchsia: '#ff00ff',
            green: '#008000',
            lime: '#00ff00',
            olive: '#808000',
            yellow: '#ffff0',
            navy: '#000080',
            blue: '#0000ff',
            teal: '#008080',
            aqua: '#00ffff'
        };

    baidu.string.formatColor = function(color) {
        if(reg1.test(color)) {
            // #RRGGBB 直接返回
            return color;
        } else if(reg2.test(color)) {
            // 非IE中的 rgb(0, 0, 0)
            for (var s, i=1, color="#"; i<4; i++) {
                s = parseInt(RegExp["\x24"+ i]).toString(16);
                color += ("00"+ s).substr(s.length);
            }
            return color;
        } else if(/^\#[\da-f]{3}$/.test(color)) {
            // 简写的颜色值: #F00
            var s1 = color.charAt(1),
                s2 = color.charAt(2),
                s3 = color.charAt(3);
            return "#"+ s1 + s1 + s2 + s2 + s3 + s3;
        }else if(keyword[color])
            return keyword[color];
        
        return "";
    };
})();

