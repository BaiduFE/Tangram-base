/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_styleFixer/textOverflow.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */

///import baidu.dom._styleFixer;
///import baidu.dom.getStyle;
///import baidu.browser.firefox;
///import baidu.browser.opera;

/**
 * 提供给setStyle与getStyle使用，在做textOverflow时会向element对象中添加,_baiduOverflow, _baiduHTML两个属性保存原始的innerHTML信息
 */
baidu.dom._styleFixer.textOverflow = (function () {
    var fontSizeCache = {};

    function pop(list) {
        var o = list.length;
        if (o > 0) {
            o = list[o - 1];
            list.length--;
        } else {
            o = null;
        }
        return o;
    }

    function setText(element, text) {
        element[baidu.browser.firefox ? "textContent" : "innerText"] = text;
    }

    function count(element, width, ellipsis) {
        /* 计算cache的名称 */
        var o = baidu.browser.ie ? element.currentStyle || element.style : getComputedStyle(element, null),
            fontWeight = o.fontWeight,
            cacheName =
                "font-family:" + o.fontFamily + ";font-size:" + o.fontSize
                + ";word-spacing:" + o.wordSpacing + ";font-weight:" + ((parseInt(fontWeight) || 0) == 401 ? 700 : fontWeight)
                + ";font-style:" + o.fontStyle + ";font-variant:" + o.fontVariant,
            cache = fontSizeCache[cacheName];

        if (!cache) {
            o = element.appendChild(document.createElement("div"));

            o.style.cssText = "float:left;" + cacheName;
            cache = fontSizeCache[cacheName] = [];

            /* 计算ASCII字符的宽度cache */
            for (var i=0; i < 256; i++) {
                i == 32 ? (o.innerHTML = "&nbsp;") : setText(o, String.fromCharCode(i));
                cache[i] = o.offsetWidth;
            }

            /* 计算非ASCII字符的宽度、字符间距、省略号的宽度,\u4e00是汉字一的编码*/
            setText(o, "\u4e00");
            cache[256] = o.offsetWidth;
            setText(o, "\u4e00\u4e00");
            cache[257] = o.offsetWidth - cache[256] * 2;
            cache[258] = cache[".".charCodeAt(0)] * 3 + cache[257] * 3;

            element.removeChild(o);
        }

        for (
            /* wordWidth是每个字符或子节点计算之前的宽度序列 */
            var node = element.firstChild, charWidth = cache[256], wordSpacing = cache[257], ellipsisWidth = cache[258],
                wordWidth = [], ellipsis = ellipsis ? ellipsisWidth : 0;
            node;
            node = node.nextSibling
        ) {
            if (width < ellipsis) {
                element.removeChild(node);
            }
            else if (node.nodeType == 3) {
                for (var i = 0, text = node.nodeValue, length = text.length; i < length; i++) {
                    o = text.charCodeAt(i);
                    /* 计算增加字符后剩余的长度 */
                    wordWidth[wordWidth.length] = [width, node, i];
                    width -= (i ? wordSpacing : 0) + (o < 256 ? cache[o] : charWidth);
                    if (width < ellipsis) {
                        break;
                    }
                }
            }
            else {
                o = node.tagName;
                if (o == "IMG" || o == "TABLE") {
                    /* 特殊元素直接删除 */
                    o = node;
                    node = node.previousSibling;
                    element.removeChild(o);
                }
                else {
                    wordWidth[wordWidth.length] = [width, node];
                    width -= node.offsetWidth;
                }
            }
        }

        if (width < ellipsis) {
            /* 过滤直到能得到大于省略号宽度的位置 */
            while (o = pop(wordWidth)) {
                width = o[0];
                node = o[1];
                o = o[2];
                if (node.nodeType == 3) {
                    if (width >= ellipsisWidth) {
                        node.nodeValue = node.nodeValue.substring(0, o) + "...";
                        return true;
                    }
                    else if (!o) {
                        element.removeChild(node);
                    }
                }
                else if (count(node, width, true)) {
                    return true;
                }
                else {
                    element.removeChild(node);
                }
            }

            /* 能显示的宽度小于省略号的宽度，直接不显示 */
            element.innerHTML = "";
        }
    }

    return {
		get: function (element) {
            var browser = baidu.browser,
                getStyle = dom.getStyle;
			return (browser.opera ?
                        getStyle("OTextOverflow") :
                        browser.firefox ?
                            element._baiduOverflow :
                            getStyle("textOverflow")) ||
                   "clip";
		},

		set: function (element, value) {
            var browser = baidu.browser;
			if (element.tagName == "TD" || element.tagName == "TH" || browser.firefox) {
				element._baiduHTML && (element.innerHTML = element._baiduHTML);

				if (value == "ellipsis") {
					element._baiduHTML = element.innerHTML;
					var o = document.createElement("div"), width = element.appendChild(o).offsetWidth;
					element.removeChild(o);
					count(element, width);
				}
				else {
					element._baiduHTML = "";
				}
			}

			o = element.style;
			browser.opera ? (o.OTextOverflow = value) : browser.firefox ? (element._baiduOverflow = value) : (o.textOverflow = value);
		}
    };
})();
