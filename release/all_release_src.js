// Copyright (c) 2009, Baidu Inc. All rights reserved.
//
// Licensed under the BSD License
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://tangram.baidu.com/license.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.




var T,
    baidu = T = baidu || {version: "1.3.4"}; 

//提出guid，防止在与老版本Tangram混用时
//在下一行错误的修改window[undefined]
baidu.guid = "$BAIDU$";

//Tangram可能被放在闭包中
//一些页面级别唯一的属性，需要挂载在window[baidu.guid]上
window[baidu.guid] = window[baidu.guid] || {};


baidu.browser = baidu.browser || {};


baidu.browser.isGecko = /gecko/i.test(navigator.userAgent) && !/like gecko/i.test(navigator.userAgent);



baidu.browser.isStrict = document.compatMode == "CSS1Compat";


(function(){
    var ua = navigator.userAgent;
    
    if(/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua)){
        
    	baidu.browser.safari = + (RegExp['\x241'] || RegExp['\x242']);
    }
})();


if (/opera\/(\d+\.\d)/i.test(navigator.userAgent)) {

    baidu.browser.opera = + RegExp['\x241'];
}

if (/chrome\/(\d+\.\d)/i.test(navigator.userAgent)) {

    baidu.browser.chrome = + RegExp['\x241'];
}

if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
    //IE 8下，以documentMode为准
    //在百度模板中，可能会有$，防止冲突，将$1 写成 \x241

   baidu.browser.ie = baidu.ie = document.documentMode || + RegExp['\x241'];
}


try {
    if (/(\d+\.\d)/.test(external.max_version)) {

        baidu.browser.maxthon = + RegExp['\x241'];
    }
} catch (e) {}



baidu.browser.isWebkit = /webkit/i.test(navigator.userAgent);


if (/firefox\/(\d+\.\d)/i.test(navigator.userAgent)) {

    baidu.browser.firefox = + RegExp['\x241'];
}


baidu.number = baidu.number || {};


baidu.number.pad = function (source, length) {
    var pre = "",
        negative = (source < 0),
        string = String(Math.abs(source));

    if (string.length < length) {
        pre = (new Array(length - string.length + 1)).join('0');
    }

    return (negative ?  "-" : "") + pre + string;
};



baidu.number.comma = function (source, length) {
    if (!length || length < 1) {
        length = 3;
    }

    source = String(source).split(".");
    source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{'+length+'})+$)','ig'),"$1,");
    return source.join(".");
};


baidu.url = baidu.url || {};


baidu.url.escapeSymbol = function (source) {
    return String(source).replace(/\%/g, "%25")
                        .replace(/&/g, "%26")
                        .replace(/\+/g, "%2B")
                        .replace(/\ /g, "%20")
                        .replace(/\//g, "%2F")
                        .replace(/\#/g, "%23")
                        .replace(/\=/g, "%3D");
};



baidu.string = baidu.string || {};


baidu.string.escapeReg = function (source) {
    return String(source)
            .replace(new RegExp("([.*+?^=!:\x24{}()|[\\]\/\\\\])", "g"), '\\\x241');
};


baidu.url.getQueryValue = function (url, key) {
    var reg = new RegExp(
                        "(^|&|\\?|#)" 
                        + baidu.string.escapeReg(key) 
                        + "=([^&]*)(&|\x24)", 
                    "");
    var match = url.match(reg);
    if (match) {
        return match[2];
    }
    
    return null;
};



baidu.object = baidu.object || {};


baidu.object.each = function (source, iterator) {
    var returnValue, key, item; 
    if ('function' == typeof iterator) {
        for (key in source) {
            if (source.hasOwnProperty(key)) {
                item = source[key];
                returnValue = iterator.call(source, item, key);
        
                if (returnValue === false) {
                    break;
                }
            }
        }
    }
    return source;
};


baidu.lang = baidu.lang || {};


baidu.lang.isArray = function (source) {
    return '[object Array]' == Object.prototype.toString.call(source);
};


baidu.url.jsonToQuery = function (json, replacer_opt) {
    var result = [], 
        itemLen,
        replacer = replacer_opt || function (value) {
          return baidu.url.escapeSymbol(value);
        };
        
    baidu.object.each(json, function(item, key){
        // 这里只考虑item为数组、字符串、数字类型，不考虑嵌套的object
        if (baidu.lang.isArray(item)) {
            itemLen = item.length;
            // FIXME value的值需要encodeURIComponent转义吗？
            while (itemLen--) {
                result.push(key + '=' + replacer(item[itemLen], key));
            }
        } else {
            result.push(key + '=' + replacer(item, key));
        }
    });
    
    return result.join('&');
};




baidu.url.queryToJson = function (url) {
    var query   = url.substr(url.lastIndexOf('?') + 1),
        params  = query.split('&'),
        len     = params.length,
        result  = {},
        i       = 0,
        key, value, item, param;
    
    for (; i < len; i++) {
        param   = params[i].split('=');
        key     = param[0];
        value   = param[1];
        
        item = result[key];
        if ('undefined' == typeof item) {
            result[key] = value;
        } else if (baidu.lang.isArray(item)) {
            item.push(value);
        } else { // 这里只可能是string了
            result[key] = [item, value];
        }
    }
    
    return result;
};


baidu.cookie = baidu.cookie || {};


baidu.cookie._isValidKey = function (key) {
    // http://www.w3.org/Protocols/rfc2109/rfc2109
    // Syntax:  General
    // The two state management headers, Set-Cookie and Cookie, have common
    // syntactic properties involving attribute-value pairs.  The following
    // grammar uses the notation, and tokens DIGIT (decimal digits) and
    // token (informally, a sequence of non-special, non-white space
    // characters) from the HTTP/1.1 specification [RFC 2068] to describe
    // their syntax.
    // av-pairs   = av-pair *(";" av-pair)
    // av-pair    = attr ["=" value] ; optional value
    // attr       = token
    // value      = word
    // word       = token | quoted-string
    
    // http://www.ietf.org/rfc/rfc2068.txt
    // token      = 1*<any CHAR except CTLs or tspecials>
    // CHAR       = <any US-ASCII character (octets 0 - 127)>
    // CTL        = <any US-ASCII control character
    //              (octets 0 - 31) and DEL (127)>
    // tspecials  = "(" | ")" | "<" | ">" | "@"
    //              | "," | ";" | ":" | "\" | <">
    //              | "/" | "[" | "]" | "?" | "="
    //              | "{" | "}" | SP | HT
    // SP         = <US-ASCII SP, space (32)>
    // HT         = <US-ASCII HT, horizontal-tab (9)>
        
    return (new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24")).test(key);
};


baidu.cookie.setRaw = function (key, value, options) {
    if (!baidu.cookie._isValidKey(key)) {
        return;
    }
    
    options = options || {};
    //options.path = options.path || "/"; // meizz 20100402 设定一个初始值，方便后续的操作
    //berg 20100409 去掉，因为用户希望默认的path是当前路径，这样和浏览器对cookie的定义也是一致的
    
    // 计算cookie过期时间
    var expires = options.expires;
    if ('number' == typeof options.expires) {
        expires = new Date();
        expires.setTime(expires.getTime() + options.expires);
    }
    
    document.cookie =
        key + "=" + value
        + (options.path ? "; path=" + options.path : "")
        + (expires ? "; expires=" + expires.toGMTString() : "")
        + (options.domain ? "; domain=" + options.domain : "")
        + (options.secure ? "; secure" : ''); 
};



baidu.cookie.getRaw = function (key) {
    if (baidu.cookie._isValidKey(key)) {
        var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"),
            result = reg.exec(document.cookie);
            
        if (result) {
            return result[2] || null;
        }
    }

    return null;
};



baidu.cookie.get = function (key) {
    var value = baidu.cookie.getRaw(key);
    if ('string' == typeof value) {
        value = decodeURIComponent(value);
        return value;
    }
    return null;
};



baidu.cookie.set = function (key, value, options) {
    baidu.cookie.setRaw(key, encodeURIComponent(value), options);
};



baidu.cookie.remove = function (key, options) {
    options = options || {};
    options.expires = new Date(0);
    baidu.cookie.setRaw(key, '', options);
};


baidu.json = baidu.json || {};


baidu.json.parse = function (data) {
    //2010/12/09：更新至不使用原生parse，不检测用户输入是否正确
    return (new Function("return " + data))();
};



baidu.json.stringify = (function () {
    
    var escapeMap = {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"' : '\\"',
        "\\": '\\\\'
    };
    
    
    function encodeString(source) {
        if (/["\\\x00-\x1f]/.test(source)) {
            source = source.replace(
                /["\\\x00-\x1f]/g, 
                function (match) {
                    var c = escapeMap[match];
                    if (c) {
                        return c;
                    }
                    c = match.charCodeAt();
                    return "\\u00" 
                            + Math.floor(c / 16).toString(16) 
                            + (c % 16).toString(16);
                });
        }
        return '"' + source + '"';
    }
    
    
    function encodeArray(source) {
        var result = ["["], 
            l = source.length,
            preComma, i, item;
            
        for (i = 0; i < l; i++) {
            item = source[i];
            
            switch (typeof item) {
            case "undefined":
            case "function":
            case "unknown":
                break;
            default:
                if(preComma) {
                    result.push(',');
                }
                result.push(baidu.json.stringify(item));
                preComma = 1;
            }
        }
        result.push("]");
        return result.join("");
    }
    
    
    function pad(source) {
        return source < 10 ? '0' + source : source;
    }
    
    
    function encodeDate(source){
        return '"' + source.getFullYear() + "-" 
                + pad(source.getMonth() + 1) + "-" 
                + pad(source.getDate()) + "T" 
                + pad(source.getHours()) + ":" 
                + pad(source.getMinutes()) + ":" 
                + pad(source.getSeconds()) + '"';
    }
    
    return function (value) {
        switch (typeof value) {
        case 'undefined':
            return 'undefined';
            
        case 'number':
            return isFinite(value) ? String(value) : "null";
            
        case 'string':
            return encodeString(value);
            
        case 'boolean':
            return String(value);
            
        default:
            if (value === null) {
                return 'null';
            } else if (value instanceof Array) {
                return encodeArray(value);
            } else if (value instanceof Date) {
                return encodeDate(value);
            } else {
                var result = ['{'],
                    encode = baidu.json.stringify,
                    preComma,
                    item;
                    
                for (var key in value) {
                    if (Object.prototype.hasOwnProperty.call(value, key)) {
                        item = value[key];
                        switch (typeof item) {
                        case 'undefined':
                        case 'unknown':
                        case 'function':
                            break;
                        default:
                            if (preComma) {
                                result.push(',');
                            }
                            preComma = 1;
                            result.push(encode(key) + ':' + encode(item));
                        }
                    }
                }
                result.push('}');
                return result.join('');
            }
        }
    };
})();




baidu.json.encode = baidu.json.stringify;



baidu.json.decode = baidu.json.parse;



baidu.date = baidu.date || {};




baidu.date.format = function (source, pattern) {
    if ('string' != typeof pattern) {
        return source.toString();
    }

    function replacer(patternPart, result) {
        pattern = pattern.replace(patternPart, result);
    }
    
    var pad     = baidu.number.pad,
        year    = source.getFullYear(),
        month   = source.getMonth() + 1,
        date2   = source.getDate(),
        hours   = source.getHours(),
        minutes = source.getMinutes(),
        seconds = source.getSeconds();

    replacer(/yyyy/g, pad(year, 4));
    replacer(/yy/g, pad(year.toString().slice(2), 2));
    replacer(/MM/g, pad(month, 2));
    replacer(/M/g, month);
    replacer(/dd/g, pad(date2, 2));
    replacer(/d/g, date2);

    replacer(/HH/g, pad(hours, 2));
    replacer(/H/g, hours);
    replacer(/hh/g, pad(hours % 12, 2));
    replacer(/h/g, hours % 12);
    replacer(/mm/g, pad(minutes, 2));
    replacer(/m/g, minutes);
    replacer(/ss/g, pad(seconds, 2));
    replacer(/s/g, seconds);

    return pattern;
};




baidu.date.parse = function (source) {
    var reg = new RegExp("^\\d+(\\-|\\/)\\d+(\\-|\\/)\\d+\x24");
    if ('string' == typeof source) {
        if (reg.test(source) || isNaN(Date.parse(source))) {
            var d = source.split(/ |T/),
                d1 = d.length > 1 
                        ? d[1].split(/[^\d]/) 
                        : [0, 0, 0],
                d0 = d[0].split(/[^\d]/);
            return new Date(d0[0] - 0, 
                            d0[1] - 1, 
                            d0[2] - 0, 
                            d1[0] - 0, 
                            d1[1] - 0, 
                            d1[2] - 0);
        } else {
            return new Date(source);
        }
    }
    
    return new Date();
};



baidu.dom = baidu.dom || {};


baidu.dom._styleFilter = baidu.dom._styleFilter || [];


baidu.dom._styleFilter[baidu.dom._styleFilter.length] = {
    get: function (key, value) {
        if (/color/i.test(key) && value.indexOf("rgb(") != -1) {
            var array = value.split(",");

            value = "#";
            for (var i = 0, color; color = array[i]; i++){
                color = parseInt(color.replace(/[^\d]/gi, ''), 10).toString(16);
                value += color.length == 1 ? "0" + color : color;
            }

            value = value.toUpperCase();
        }

        return value;
    }
};



baidu.dom._styleFilter.filter = function (key, value, method) {
    for (var i = 0, filters = baidu.dom._styleFilter, filter; filter = filters[i]; i++) {
        if (filter = filter[method]) {
            value = filter(key, value);
        }
    }

    return value;
};



baidu.dom._styleFilter[baidu.dom._styleFilter.length] = {
    set: function (key, value) {
        if (value.constructor == Number 
            && !/zIndex|fontWeight|opacity|zoom|lineHeight/i.test(key)){
            value = value + "px";
        }

        return value;
    }
};




baidu.dom._styleFixer = baidu.dom._styleFixer || {};




baidu.dom._styleFixer.display = baidu.browser.ie && baidu.browser.ie < 8 ? { // berg: 修改到<8，因为ie7同样存在这个问题，from 先伟
    set: function (element, value) {
        element = element.style;
        if (value == 'inline-block') {
            element.display = 'inline';
            element.zoom = 1;
        } else {
            element.display = value;
        }
    }
} : baidu.browser.firefox && baidu.browser.firefox < 3 ? {
    set: function (element, value) {
        element.style.display = value == 'inline-block' ? '-moz-inline-box' : value;
    }
} : null;




baidu.dom._styleFixer["float"] = baidu.browser.ie ? "styleFloat" : "cssFloat";




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

            
            for (var i=0; i < 256; i++) {
                i == 32 ? (o.innerHTML = "&nbsp;") : setText(o, String.fromCharCode(i));
                cache[i] = o.offsetWidth;
            }

            
            setText(o, "\u4e00");
            cache[256] = o.offsetWidth;
            setText(o, "\u4e00\u4e00");
            cache[257] = o.offsetWidth - cache[256] * 2;
            cache[258] = cache[".".charCodeAt(0)] * 3 + cache[257] * 3;

            element.removeChild(o);
        }

        for (
            
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

            
            element.innerHTML = "";
        }
    }

    return {
		get: function (element, style) {
            var browser = baidu.browser;
			return (browser.opera ? style.OTextOverflow : browser.firefox ? element._baiduOverflow: style.textOverflow) || "clip";
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




baidu.dom.g = function (id) {
    if ('string' == typeof id || id instanceof String) {
        return document.getElementById(id);
    } else if (id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
        return id;
    }
    return null;
};

// 声明快捷方法
baidu.g = baidu.G = baidu.dom.g;






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


baidu.dom.setAttr = function (element, key, value) {
    element = baidu.dom.g(element);

    if ('style' == key){
        element.style.cssText = value;
    } else {
        key = baidu.dom._NAME_ATTRS[key] || key;
        element.setAttribute(key, value);
    }

    return element;
};

// 声明快捷方法
baidu.setAttr = baidu.dom.setAttr;


baidu.dom.setAttrs = function (element, attributes) {
    element = baidu.dom.g(element);

    for (var key in attributes) {
        baidu.dom.setAttr(element, key, attributes[key]);
    }

    return element;
};

// 声明快捷方法
baidu.setAttrs = baidu.dom.setAttrs;




baidu.dom.getAttr = function (element, key) {
    element = baidu.dom.g(element);

    if ('style' == key){
        return element.style.cssText;
    }

    key = baidu.dom._NAME_ATTRS[key] || key;
    return element.getAttribute(key);
};

// 声明快捷方法
baidu.getAttr = baidu.dom.getAttr;




baidu.dom._matchNode = function (element, direction, start) {
    element = baidu.dom.g(element);

    for (var node = element[start]; node; node = node[direction]) {
        if (node.nodeType == 1) {
            return node;
        }
    }

    return null;
};


baidu.dom.prev = function (element) {
    return baidu.dom._matchNode(element, 'previousSibling', 'previousSibling');
};





(function () {
    var trimer = new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g");
    
    baidu.string.trim = function (source) {
        return String(source)
                .replace(trimer, "");
    };
})();

// 声明快捷方法
baidu.trim = baidu.string.trim;


baidu.dom.addClass = function (element, className) {
    element = baidu.dom.g(element);
    var classArray = className.split(/\s+/),
        result = element.className,
        classMatch = " " + result + " ",
        i = 0,
        l = classArray.length;

    for (; i < l; i++){
         if ( classMatch.indexOf( " " + classArray[i] + " " ) < 0 ) {
             result += ' ' + classArray[i];
         }
    }

    element.className = result;
    return element;
};

// 声明快捷方法
baidu.addClass = baidu.dom.addClass;





baidu.dom.hasClass = function (element, className) {
    element = baidu.dom.g(element);
    var classArray = baidu.string.trim(className).split(/\s+/), 
        len = classArray.length;

    className = element.className.split(/\s+/).join(" ");

    while (len--) {
        if(!(new RegExp("(^| )" + classArray[len] + "( |\x24)")).test(className)){
            return false;
        }
    }
    return true;
};




baidu.lang.isString = function (source) {
    return '[object String]' == Object.prototype.toString.call(source);
};

// 声明快捷方法
baidu.isString = baidu.lang.isString;


baidu.dom._g = function (id) {
    if (baidu.lang.isString(id)) {
        return document.getElementById(id);
    }
    return id;
};

// 声明快捷方法
baidu._g = baidu.dom._g;


baidu.dom.contains = function (container, contained) {

    var g = baidu.dom._g;
    container = g(container);
    contained = g(contained);

    //fixme: 无法处理文本节点的情况(IE)
    return container.contains
        ? container != contained && container.contains(contained)
        : !!(container.compareDocumentPosition(contained) & 16);
};



baidu.dom.getDocument = function (element) {
    element = baidu.dom.g(element);
    return element.nodeType == 9 ? element : element.ownerDocument || element.document;
};




baidu.dom.removeClass = function (element, className) {
    element = baidu.dom.g(element);

    var oldClasses = element.className.split(/\s+/),
        newClasses = className.split(/\s+/),
        lenOld,
        lenDel = newClasses.length,
        j,
        i = 0;
    //考虑到同时删除多个className的应用场景概率较低,故放弃进一步性能优化 
    // by rocy @1.3.4
    for (; i < lenDel; ++i){
        for(j = 0, lenOld = oldClasses.length; j < lenOld; ++j){
            if(oldClasses[j] == newClasses[i]){
            	oldClasses.splice(j, 1);
            	break;
            }
        }
    }
    element.className = oldClasses.join(' ');
    return element;
};

// 声明快捷方法
baidu.removeClass = baidu.dom.removeClass;






baidu.dom.children = function (element) {
    element = baidu.dom.g(element);

    for (var children = [], tmpEl = element.firstChild; tmpEl; tmpEl = tmpEl.nextSibling) {
        if (tmpEl.nodeType == 1) {
            children.push(tmpEl);
        }
    }
    
    return children;    
};







 
 //todo:考虑以后去掉下划线支持？
baidu.string.toCamelCase = function (source) {
    //提前判断，提高getStyle等的效率 thanks xianwei
    if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
        return source;
    }
    return source.replace(/[-_][^-_]/g, function (match) {
        return match.charAt(1).toUpperCase();
    });
};


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


baidu.dom.setStyles = function (element, styles) {
    element = baidu.dom.g(element);

    for (var key in styles) {
        baidu.dom.setStyle(element, key, styles[key]);
    }

    return element;
};

// 声明快捷方法
baidu.setStyles = baidu.dom.setStyles;





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










baidu.dom.getStyle = function (element, key) {
    var dom = baidu.dom;

    element = dom.g(element);
    key = baidu.string.toCamelCase(key);
    var value = element.style[key];

    // 在取不到值的时候，用fixer进行修正
    if (!value) {
        var fixer = dom._styleFixer[key],
        	
            // TODO
            // 1. 应当优先使用getComputedStyle，再使用currentStyle
            // 2. 无法解决px/em单位统一的问题（IE）
            // 3. 无法解决样式值为非数字值的情况（medium等 IE）
    	    style = element.currentStyle || (baidu.browser.ie ? element.style : getComputedStyle(element, null));
            
        value = fixer && fixer.get ? fixer.get(element, style) : style[fixer || key];
    }
    
    
    if (fixer = dom._styleFilter) {
        value = fixer.filter(key, value, 'get');
    }

    return value;
};

// 声明快捷方法
baidu.getStyle = baidu.dom.getStyle;







baidu.dom.getPosition = function (element) {
    element = baidu.dom.g(element);
    var doc = baidu.dom.getDocument(element), 
        browser = baidu.browser,
        getStyle = baidu.dom.getStyle,
    // Gecko 1.9版本以下用getBoxObjectFor计算位置
    // 但是某些情况下是有bug的
    // 对于这些有bug的情况
    // 使用递归查找的方式
        BUGGY_GECKO_BOX_OBJECT = browser.isGecko > 0 && 
                                 doc.getBoxObjectFor &&
                                 getStyle(element, 'position') == 'absolute' &&
                                 (element.style.top === '' || element.style.left === ''),
        pos = {"left":0,"top":0},
        viewport = (browser.ie && !browser.isStrict) ? doc.body : doc.documentElement,
        parent,
        box;
    
    if(element == viewport){
        return pos;
    }


    if(element.getBoundingClientRect){ // IE and Gecko 1.9+
        
    	//当HTML或者BODY有border width时, 原生的getBoundingClientRect返回值是不符合预期的
    	//考虑到通常情况下 HTML和BODY的border只会设成0px,所以忽略该问题.
        box = element.getBoundingClientRect();

        pos.left = Math.floor(box.left) + Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
        pos.top  = Math.floor(box.top)  + Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop);
	    
        // IE会给HTML元素添加一个border，默认是medium（2px）
        // 但是在IE 6 7 的怪异模式下，可以被html { border: 0; } 这条css规则覆盖
        // 在IE7的标准模式下，border永远是2px，这个值通过clientLeft 和 clientTop取得
        // 但是。。。在IE 6 7的怪异模式，如果用户使用css覆盖了默认的medium
        // clientTop和clientLeft不会更新
        pos.left -= doc.documentElement.clientLeft;
        pos.top  -= doc.documentElement.clientTop;
        
        var htmlDom = doc.body,
            // 在这里，不使用element.style.borderLeftWidth，只有computedStyle是可信的
            htmlBorderLeftWidth = parseInt(getStyle(htmlDom, 'borderLeftWidth')),
            htmlBorderTopWidth = parseInt(getStyle(htmlDom, 'borderTopWidth'));
        if(browser.ie && !browser.isStrict){
            pos.left -= isNaN(htmlBorderLeftWidth) ? 2 : htmlBorderLeftWidth;
            pos.top  -= isNaN(htmlBorderTopWidth) ? 2 : htmlBorderTopWidth;
        }
    
    } else { // safari/opera/firefox
        parent = element;

        do {
            pos.left += parent.offsetLeft;
            pos.top  += parent.offsetTop;
      
            // safari里面，如果遍历到了一个fixed的元素，后面的offset都不准了
            if (browser.isWebkit > 0 && getStyle(parent, 'position') == 'fixed') {
                pos.left += doc.body.scrollLeft;
                pos.top  += doc.body.scrollTop;
                break;
            }
            
            parent = parent.offsetParent;
        } while (parent && parent != element);

        // 对body offsetTop的修正
        if(browser.opera > 0 || (browser.isWebkit > 0 && getStyle(element, 'position') == 'absolute')){
            pos.top  -= doc.body.offsetTop;
        }

        // 计算除了body的scroll
        parent = element.offsetParent;
        while (parent && parent != doc.body) {
            pos.left -= parent.scrollLeft;
            // see https://bugs.opera.com/show_bug.cgi?id=249965
//            if (!b.opera || parent.tagName != 'TR') {
            if (!browser.opera || parent.tagName != 'TR') {
                pos.top -= parent.scrollTop;
            }
            parent = parent.offsetParent;
        }
    }

    return pos;
};


baidu.dom.intersect = function (element1, element2) {
    var g = baidu.dom.g, 
        getPosition = baidu.dom.getPosition, 
        max = Math.max, 
        min = Math.min;

    element1 = g(element1);
    element2 = g(element2);

    var pos1 = getPosition(element1),
        pos2 = getPosition(element2);

    return max(pos1.left, pos2.left) <= min(pos1.left + element1.offsetWidth, pos2.left + element2.offsetWidth)
        && max(pos1.top, pos2.top) <= min(pos1.top + element1.offsetHeight, pos2.top + element2.offsetHeight);
};




baidu.dom.last = function (element) {
    return baidu.dom._matchNode(element, 'previousSibling', 'lastChild');
};







baidu.dom.ready = function () {
    var isReady = false,
        readyBound = false,
        readyList = [];

    function ready() {
        if (!isReady) {
            isReady = true;
            for (var i = 0, j = readyList.length; i < j; i++) {
                    readyList[i]();
            }
        }
    }

    // 本函数代码逻辑来自Jquery，thanks Jquery
    function bindReady() {
        if (readyBound) {
            return;
        }
        readyBound = true;

        var doc = document,
            w = window,
            opera = baidu.browser.opera;

        // Mozilla, Opera (see further below for it) and webkit nightlies currently support this event
        if (doc.addEventListener) {
            // Use the handy event callback
            doc.addEventListener("DOMContentLoaded", opera ? function () {
                if (isReady) {
                    return;
                }
                for (var i = 0; i < doc.styleSheets.length; i++) {
                    if (doc.styleSheets[i].disabled) {
                        setTimeout( arguments.callee, 0 );
                        return;
                    }
                }
                // and execute any waiting functions
                ready();
            } : ready, false);
        } else if (baidu.browser.ie && w == top) {
            // If IE is used and is not in a frame
            // Continually check to see if the doc is ready
            (function () {
                if (isReady) {
                    return;
                }

                try {
                    // If IE is used, use the trick by Diego Perini
                    // http://javascript.nwbox.com/IEContentLoaded/
                    doc.documentElement.doScroll("left");
                } catch (error) {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                // and execute any waiting functions
                ready();
            })();
        } else if (baidu.browser.safari) {
            var numStyles;
            (function () {
                if (isReady) {
                    return;
                }
                if (doc.readyState != "loaded" && doc.readyState != "complete") {
                    setTimeout( arguments.callee, 0 );
                    return;
                }
                if (numStyles === undefined) {
                    numStyles = 0;
                    var s1 = doc.getElementsByTagName('style'),
                        s2 = doc.getElementsByTagName('link');
                    if (s1) {
                        numStyles += s1.length;
                    }
                    if (s2) {
                        for (var i = 0, j = s2.length; i < j; i ++) {
                            if (s2[i].getAttribute("rel") == "stylesheet") {
                                numStyles ++;
                            }
                        }
                    }
                }
                if (doc.styleSheets.length != numStyles) {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                ready();
            })();
        }

        // A fallback to window.onload, that will always work
        w.attachEvent ? w.attachEvent("onload", ready) : w.addEventListener("load", ready, false);
    }

    return function (callback) {
        bindReady();
        isReady ? callback() : (readyList[readyList.length] = callback);
    };
}();



baidu.dom.getAncestorByTag = function (element, tagName) {
    element = baidu.dom.g(element);
    tagName = tagName.toUpperCase();

    while ((element = element.parentNode) && element.nodeType == 1) {
        if (element.tagName == tagName) {
            return element;
        }
    }

    return null;
};




baidu.dom.getWindow = function (element) {
    element = baidu.dom.g(element);
    var doc = baidu.dom.getDocument(element);
    
    // 没有考虑版本低于safari2的情况
    // @see goog/dom/dom.js#goog.dom.DomHelper.prototype.getWindow
    return doc.parentWindow || doc.defaultView || null;
};



baidu.dom.getAncestorBy = function (element, method) {
    element = baidu.dom.g(element);

    while ((element = element.parentNode) && element.nodeType == 1) {
        if (method(element)) {
            return element;
        }
    }

    return null;
};



baidu.dom.hide = function (element) {
    element = baidu.dom.g(element);
    element.style.display = "none";

    return element;
};

// 声明快捷方法
baidu.hide = baidu.dom.hide;




baidu.dom.next = function (element) {
    return baidu.dom._matchNode(element, 'nextSibling', 'nextSibling');
};



baidu.dom.show = function (element) {
    element = baidu.dom.g(element);
    element.style.display = "";

    return element;
};

// 声明快捷方法
baidu.show = baidu.dom.show;



baidu.dom.toggle = function (element) {
    element = baidu.dom.g(element);
    element.style.display = element.style.display == "none" ? "" : "none";

    return element;
};



baidu.dom.insertAfter = function (newElement, existElement) {
    var g, existParent;
    g = baidu.dom._g;
    newElement = g(newElement);
    existElement = g(existElement);
    existParent = existElement.parentNode;
    
    if (existParent) {
        existParent.insertBefore(newElement, existElement.nextSibling);
    }
    return newElement;
};



baidu.dom.first = function (element) {
    return baidu.dom._matchNode(element, 'nextSibling', 'firstChild');
};



baidu.dom.insertBefore = function (newElement, existElement) {
    var g, existParent;
    g = baidu.dom._g;
    newElement = g(newElement);
    existElement = g(existElement);
    existParent = existElement.parentNode;

    if (existParent) {
        existParent.insertBefore(newElement, existElement);
    }

    return newElement;
};



baidu.dom.insertHTML = function (element, position, html) {
    element = baidu.dom.g(element);
    var range,begin;

    if (element.insertAdjacentHTML) {
        element.insertAdjacentHTML(position, html);
    } else {
        // 这里不做"undefined" != typeof(HTMLElement) && !window.opera判断，其它浏览器将出错？！
        // 但是其实做了判断，其它浏览器下等于这个函数就不能执行了
        range = element.ownerDocument.createRange();
        // FF下range的位置设置错误可能导致创建出来的fragment在插入dom树之后html结构乱掉
        // 改用range.insertNode来插入html, by wenyuxiang @ 2010-12-14.
        position = position.toUpperCase();
        if (position == 'AFTERBEGIN' || position == 'BEFOREEND') {
            range.selectNodeContents(element);
            range.collapse(position == 'AFTERBEGIN');
        } else {
            begin = position == 'BEFOREBEGIN';
            range[begin ? 'setStartBefore' : 'setEndAfter'](element);
            range.collapse(begin);
        }
        range.insertNode(range.createContextualFragment(html));
    }
    return element;
};

baidu.insertHTML = baidu.dom.insertHTML;




baidu.dom.remove = function (element) {
    element = baidu.dom._g(element);
	var tmpEl = element.parentNode;
    //去掉了对ie下的特殊处理：创建一个div，appendChild，然后div.innerHTML = ""
    tmpEl && tmpEl.removeChild(element);
};




baidu.dom.getAncestorByClass = function (element, className) {
    element = baidu.dom.g(element);
    className = new RegExp("(^|\\s)" + baidu.string.trim(className) + "(\\s|\x24)");

    while ((element = element.parentNode) && element.nodeType == 1) {
        if (className.test(element.className)) {
            return element;
        }
    }

    return null;
};





window[baidu.guid]._instances = window[baidu.guid]._instances || {};


baidu.lang.instance = function (guid) {
    return window[baidu.guid]._instances[guid] || null;
};



baidu.lang.isNumber = function (source) {
    return '[object Number]' == Object.prototype.toString.call(source);
};

baidu.lang.guid = function() {
    return "TANGRAM__" + (window[baidu.guid]._counter ++).toString(36);
};

window[baidu.guid]._counter = window[baidu.guid]._counter || 1;




baidu.lang.isFunction = function (source) {
    // chrome下,'function' == typeof /a/ 为true.
    return '[object Function]' == Object.prototype.toString.call(source);
};


baidu.lang.Class = function(guid) {
    this.guid = guid || baidu.lang.guid();
    window[baidu.guid]._instances[this.guid] = this;
};
window[baidu.guid]._instances = window[baidu.guid]._instances || {};


baidu.lang.Class.prototype.dispose = function(){
    delete window[baidu.guid]._instances[this.guid];

    for(var property in this){
        if (!baidu.lang.isFunction(this[property])) {
            delete this[property];
        }
    }
    this.disposed = true;   // 20100716
};


baidu.lang.Class.prototype.toString = function(){
    return "[object " + (this._className || "Object" ) + "]";
};



baidu.lang.inherits = function (subClass, superClass, className) {
    var key, proto, 
        selfProps = subClass.prototype, 
        clazz = new Function();
        
    clazz.prototype = superClass.prototype;
    proto = subClass.prototype = new clazz();
    for (key in selfProps) {
        proto[key] = selfProps[key];
    }
    subClass.prototype.constructor = subClass;
    subClass.superClass = superClass.prototype;

    // 类名标识，兼容Class的toString，基本没用
    if ("string" == typeof className) {
        proto._className = className;
    }
};

// 声明快捷方法
baidu.inherits = baidu.lang.inherits;



baidu.lang.isElement = function (source) {
    return !!(source && source.nodeName && source.nodeType == 1);
};



baidu.lang.module = function(name, module, owner) {
    var packages = name.split('.'),
        len = packages.length - 1,
        packageName,
        i = 0;

    // 如果没有owner，找当前作用域，如果当前作用域没有此变量，在window创建
    if (!owner) {
        try {
            if (!(new RegExp('^[a-zA-Z_\x24][a-zA-Z0-9_\x24]*\x24')).test(packages[0])) {
                throw '';
            }
            owner = eval(packages[0]);
            i = 1;
        }catch (e) {
            owner = window;
        }
    }

    for (; i < len; i++) {
        packageName = packages[i];
        if (!owner[packageName]) {
            owner[packageName] = {};
        }
        owner = owner[packageName];
    }

    if (!owner[packages[len]]) {
        owner[packages[len]] = module;
    }
};




baidu.lang.decontrol = function(guid) {
    var m = window[baidu.guid];
    m._instances && (delete m._instances[guid]);
};







baidu.lang.Event = function (type, target) {
    this.type = type;
    this.returnValue = true;
    this.target = target || null;
    this.currentTarget = null;
};


baidu.lang.Class.prototype.addEventListener = function (type, handler, key) {
    if (!baidu.lang.isFunction(handler)) {
        return;
        // throw("addEventListener:" + handler + " is not a function");
    }

    !this.__listeners && (this.__listeners = {});

    var t = this.__listeners, id;
    if (typeof key == "string" && key) {
        if (/[^\w\-]/.test(key)) {
            throw("nonstandard key:" + key);
        } else {
            handler.hashCode = key; 
            id = key;
        }
    }
    type.indexOf("on") != 0 && (type = "on" + type);

    typeof t[type] != "object" && (t[type] = {});
    id = id || baidu.lang.guid();
    handler.hashCode = id;
    t[type][id] = handler;
};
 

baidu.lang.Class.prototype.removeEventListener = function (type, handler) {
    if (baidu.lang.isFunction(handler)) {
        handler = handler.hashCode;
    } else if (!baidu.lang.isString(handler)) {
        return;
    }

    !this.__listeners && (this.__listeners = {});

    type.indexOf("on") != 0 && (type = "on" + type);

    var t = this.__listeners;
    if (!t[type]) {
        return;
    }
    t[type][handler] && delete t[type][handler];
};


baidu.lang.Class.prototype.dispatchEvent = function (event, options) {
    if (baidu.lang.isString(event)) {
        event = new baidu.lang.Event(event);
    }
    !this.__listeners && (this.__listeners = {});

    // 20100603 添加本方法的第二个参数，将 options extend到event中去传递
    options = options || {};
    for (var i in options) {
        event[i] = options[i];
    }

    var i, t = this.__listeners, p = event.type;
    event.target = event.target || this;
    event.currentTarget = this;

    p.indexOf("on") != 0 && (p = "on" + p);

    baidu.lang.isFunction(this[p]) && this[p].apply(this, arguments);

    if (typeof t[p] == "object") {
        for (i in t[p]) {
            t[p][i].apply(this, arguments);
        }
    }
    return event.returnValue;
};



baidu.lang.isObject = function (source) {
    return 'function' == typeof source || !!(source && 'object' == typeof source);
};

// 声明快捷方法
baidu.isObject = baidu.lang.isObject;




baidu.event = baidu.event || {};


baidu.event.getPageX = function (event) {
    var result = event.pageX,
        doc = document;
    if (!result && result !== 0) {
        result = (event.clientX || 0) 
                    + (doc.documentElement.scrollLeft 
                        || doc.body.scrollLeft);
    }
    return result;
};



baidu.event.getPageY = function (event) {
    var result = event.pageY,
        doc = document;
    if (!result && result !== 0) {
        result = (event.clientY || 0) 
                    + (doc.documentElement.scrollTop 
                        || doc.body.scrollTop);
    }
    return result;
};



baidu.event.stopPropagation = function (event) {
   if (event.stopPropagation) {
       event.stopPropagation();
   } else {
       event.cancelBubble = true;
   }
};



baidu.event.preventDefault = function (event) {
   if (event.preventDefault) {
       event.preventDefault();
   } else {
       event.returnValue = false;
   }
};


baidu.event.stop = function (event) {
    var e = baidu.event;
    e.stopPropagation(event);
    e.preventDefault(event);
};



 
baidu.event.getTarget = function (event) {
    return event.target || event.srcElement;
};





baidu.event.EventArg = function (event, win) {
    win = win || window;
    event = event || win.event;
    var doc = win.document;
    
    this.target =  (event.target) || event.srcElement;
    this.keyCode = event.which || event.keyCode;
    for (var k in event) {
        var item = event[k];
        // 避免拷贝preventDefault等事件对象方法
        if ('function' != typeof item) {
            this[k] = item;
        }
    }
    
    if (!this.pageX && this.pageX !== 0) {
        this.pageX = (event.clientX || 0) 
                        + (doc.documentElement.scrollLeft 
                            || doc.body.scrollLeft);
        this.pageY = (event.clientY || 0) 
                        + (doc.documentElement.scrollTop 
                            || doc.body.scrollTop);
    }
    this._event = event;
};


baidu.event.EventArg.prototype.preventDefault = function () {
    if (this._event.preventDefault) {
        this._event.preventDefault();
    } else {
        this._event.returnValue = false;
    }
    return this;
};


baidu.event.EventArg.prototype.stopPropagation = function () {
    if (this._event.stopPropagation) {
        this._event.stopPropagation();
    } else {
        this._event.cancelBubble = true;
    }
    return this;
};


baidu.event.EventArg.prototype.stop = function () {
    return this.stopPropagation().preventDefault();
};



baidu.event._listeners = baidu.event._listeners || [];



baidu.event.on = function (element, type, listener) {
    type = type.replace(/^on/i, '');
    element = baidu.dom._g(element);

    var realListener = function (ev) {
            // 1. 这里不支持EventArgument,  原因是跨frame的事件挂载
            // 2. element是为了修正this
            listener.call(element, ev);
        },
        lis = baidu.event._listeners,
        filter = baidu.event._eventFilter,
        afterFilter,
        realType = type;
    type = type.toLowerCase();
    // filter过滤
    if(filter && filter[type]){
        afterFilter = filter[type](element, type, realListener);
        realType = afterFilter.type;
        realListener = afterFilter.listener;
    }
    
    // 事件监听器挂载
    if (element.addEventListener) {
        element.addEventListener(realType, realListener, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + realType, realListener);
    }
  
    // 将监听器存储到数组中
    lis[lis.length] = [element, type, listener, realListener, realType];
    return element;
};

// 声明快捷方法
baidu.on = baidu.event.on;



baidu.event.get = function (event, win) {
    return new baidu.event.EventArg(event, win);
};




baidu.event.un = function (element, type, listener) {
    element = baidu.dom._g(element);
    type = type.replace(/^on/i, '').toLowerCase();
    
    var lis = baidu.event._listeners, 
        len = lis.length,
        isRemoveAll = !listener,
        item,
        realType, realListener;
    
    //如果将listener的结构改成json
    //可以节省掉这个循环，优化性能
    //但是由于un的使用频率并不高，同时在listener不多的时候
    //遍历数组的性能消耗不会对代码产生影响
    //暂不考虑此优化
    while (len--) {
        item = lis[len];
        
        // listener存在时，移除element的所有以listener监听的type类型事件
        // listener不存在时，移除element的所有type类型事件
        if (item[1] === type
            && item[0] === element
            && (isRemoveAll || item[2] === listener)) {
           	realType = item[4];
           	realListener = item[3];
            if (element.removeEventListener) {
                element.removeEventListener(realType, realListener, false);
            } else if (element.detachEvent) {
                element.detachEvent('on' + realType, realListener);
            }
            lis.splice(len, 1);
        }
    }
    
    return element;
};

// 声明快捷方法
baidu.un = baidu.event.un;


baidu.event.getKeyCode = function (event) {
    return event.which || event.keyCode;
};


baidu.ajax = baidu.ajax || {};



baidu.fn = baidu.fn || {};


baidu.fn.blank = function () {};


baidu.ajax.request = function (url, options) {
	options = options || {};
    var data        = options.data || "",
        async       = !(options.async === false),
        username    = options.username || "",
        password    = options.password || "",
        method      = (options.method || "GET").toUpperCase(),
        headers     = options.headers || {},
        eventHandlers = {},
        key, xhr;
    
    function stateChangeHandler() {
        if (xhr.readyState == 4) {
            try {
                var stat = xhr.status;
            } catch (ex) {
                // 在请求时，如果网络中断，Firefox会无法取得status
                fire('failure');
                return;
            }
            
            fire(stat);
            
            // http://www.never-online.net/blog/article.asp?id=261
            // case 12002: // Server timeout      
            // case 12029: // dropped connections
            // case 12030: // dropped connections
            // case 12031: // dropped connections
            // case 12152: // closed by server
            // case 13030: // status and statusText are unavailable
            
            // IE error sometimes returns 1223 when it 
            // should be 204, so treat it as success
            if ((stat >= 200 && stat < 300)
                || stat == 304
                || stat == 1223) {
                fire('success');
            } else {
                fire('failure');
            }
            
            
            window.setTimeout(
                function() {
                    // 避免内存泄露.
                    // 由new Function改成不含此作用域链的 baidu.fn.blank 函数,
                    // 以避免作用域链带来的隐性循环引用导致的IE下内存泄露. By rocy 2011-01-05 .
                    xhr.onreadystatechange = baidu.fn.blank;
                    if (async) {
                        xhr = null;
                    }
                }, 0);
        }
    }
    
    
    function getXHR() {
        if (window.ActiveXObject) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {}
            }
        }
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
    }
    
    
    function fire(type) {
        type = 'on' + type;
        var handler = eventHandlers[type],
            globelHandler = baidu.ajax[type];
        
        // 不对事件类型进行验证
        if (handler) {
            if (type != 'onsuccess') {
                handler(xhr);
            } else {
                handler(xhr, xhr.responseText);
            }
        } else if (globelHandler) {
            //onsuccess不支持全局事件
            if (type == 'onsuccess') {
                return;
            }
            globelHandler(xhr);
        }
    }
    
    
   
    
    for (key in options) {
        // 将options参数中的事件参数复制到eventHandlers对象中
        // 这里复制所有options的成员，eventHandlers有冗余
        // 但是不会产生任何影响，并且代码紧凑
        eventHandlers[key] = options[key];
    }
    
    //2010/11/26: 修改X-Request-By = 'baidu.ajax'成下面一句，与业界（jquery, yui, sencha, mootools）接轨。
    headers['X-Request-With'] = 'XMLHttpRequest';
    
    
    try {
        xhr = getXHR();
        
        if (method == 'GET') {
            if (data) {
                url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
                data = null;
            }
            if(options['noCache'])
                url += '&b' + (new Date()).getTime() + '=1';
        }
        
        if (username) {
            xhr.open(method, url, async, username, password);
        } else {
            xhr.open(method, url, async);
        }
        
        if (async) {
            xhr.onreadystatechange = stateChangeHandler;
        }
        
        // 在open之后再进行http请求头设定
        if (method == 'POST') {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        
        for (key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }
        
        fire('beforerequest');
        xhr.send(data);
        
        if (!async) {
            stateChangeHandler();
        }
    } catch (ex) {
        fire('failure');
    }
    
    return xhr;
};


baidu.ajax.post = function (url, data, onsuccess) {
    return baidu.ajax.request(
        url, 
        {
            'onsuccess': onsuccess,
            'method': 'POST',
            'data': data
        }
    );
};





baidu.ajax.get = function (url, onsuccess) {
    return baidu.ajax.request(url, {'onsuccess': onsuccess});
};




baidu.ajax.form = function (form, options) {
    options = options || {};
    var elements    = form.elements,
        len         = elements.length,
        method      = form.getAttribute('method'),
        url         = form.getAttribute('action'),
        replacer    = options.replacer || function (value, name) {
            return value;
        },
        sendOptions = {},
        data = [],
        i, item, itemType, itemName, itemValue, 
        opts, oi, oLen, oItem;
        
    
    function addData(name, value) {
        data.push(name + '=' + value);
    }
    
    // 复制发送参数选项对象
    for (i in options) {
        if (options.hasOwnProperty(i)) {
            sendOptions[i] = options[i];
        }
    }
    
    for (i = 0; i < len; i++) {
        item = elements[i];
        itemName = item.name;
        
        // 处理：可用并包含表单name的表单项
        if (!item.disabled && itemName) {
            itemType = item.type;
            itemValue = item.value;
        
            switch (itemType) {
            // radio和checkbox被选中时，拼装queryString数据
            case 'radio':
            case 'checkbox':
                if (!item.checked) {
                    break;
                }
                
            // 默认类型，拼装queryString数据
            case 'textarea':
            case 'text':
            case 'password':
            case 'hidden':
            case 'select-one':
                addData(itemName, replacer(itemValue, itemName));
                break;
                
            // 多行选中select，拼装所有选中的数据
            case 'select-multiple':
                opts = item.options;
                oLen = opts.length;
                for (oi = 0; oi < oLen; oi++) {
                    oItem = opts[oi];
                    if (oItem.selected) {
                        addData(itemName, replacer(oItem.value, itemName));
                    }
                }
                break;
            }
        }
    }
    
    // 完善发送请求的参数选项
    sendOptions.data = data.join('&');
    sendOptions.method = form.getAttribute('method') || 'POST';
    
    // 发送请求
    return baidu.ajax.request(url, sendOptions);
};


baidu.sio = baidu.sio || {};



baidu.sio._removeScriptTag = function(scr){
    if (scr.clearAttributes) {
        scr.clearAttributes();
    } else {
        for (var attr in scr) {
            if (scr.hasOwnProperty(attr)) {
                delete scr[attr];
            }
        }
    }
    if(scr && scr.parentNode){
        scr.parentNode.removeChild(scr);
    }
    scr = null;
};


baidu.sio.callByBrowser = function (url, opt_callback, opt_options) {
    var scr = document.createElement("SCRIPT"),
        scriptLoaded = 0,
        options = opt_options || {},
        charset = options['charset'],
        callback = opt_callback || function(){};
    
    // IE和opera支持onreadystatechange
    // safari、chrome、opera支持onload
    scr.onload = scr.onreadystatechange = function () {
        // 避免opera下的多次调用
        if (scriptLoaded) {
            return;
        }
        
        var readyState = scr.readyState;
        if ('undefined' == typeof readyState
            || readyState == "loaded"
            || readyState == "complete") {
            scriptLoaded = 1;
            try {
                callback();
            } finally {
                baidu.sio._removeScriptTag(scr);
            }
        }
    };
    
    scr.setAttribute('type', 'text/javascript');
    charset && scr.setAttribute('charset', charset);
    scr.setAttribute('src', url);
    document.getElementsByTagName("head")[0].appendChild(scr);
};





baidu.sio.callByServer = function(url, callback, opt_options) {
    var scr = document.createElement('SCRIPT'),
        prefix = 'bd__cbs__',
        callbackName,
        callbackImpl,
        options = opt_options || {},
        charset = options['charset'],
        queryField = options['queryField'] || 'callback';

    if (baidu.lang.isFunction(callback)) {
        callbackName = prefix + Math.floor(Math.random() * 2147483648).toString(36);
        window[callbackName] = function() {
            try {
                callback.apply(window, arguments);
                window[callbackName] = null;
                delete window[callbackName];
            } catch (exception) {
                // ignore the exception
            } finally {
                baidu.sio._removeScriptTag(scr);
            }
        };
    } else {
        // XXX 如果callback是一个字符串的话，就需要保证url是唯一的，不要去改变它
        // TODO 当调用了callback之后，无法删除动态创建的script标签
        callbackName = callback;
    }

    url = url.replace((new RegExp('(\\?|&)callback=[^&]*')), '\x241' + queryField + '=' + callbackName);
    if (url.search(new RegExp('(\\?|&)' + queryField + '=/')) < 0) {
        url += (url.indexOf('?') < 0 ? '?' : '&') + queryField + '=' + callbackName;
    }

    scr.setAttribute('type', 'text/javascript');
    charset && scr.setAttribute('charset', charset);
    scr.setAttribute('src', url);
    document.getElementsByTagName('head')[0].appendChild(scr);
};


baidu.swf = baidu.swf || {};


baidu.swf.version = (function () {
    var n = navigator;
    if (n.plugins && n.mimeTypes.length) {
        var plugin = n.plugins["Shockwave Flash"];
        if (plugin && plugin.description) {
            return plugin.description
                    .replace(/([a-zA-Z]|\s)+/, "")
                    .replace(/(\s)+r/, ".") + ".0";
        }
    } else if (window.ActiveXObject && !window.opera) {
        for (var i = 10; i >= 2; i--) {
            try {
                var c = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.' + i);
                if (c) {
                    var version = c.GetVariable("$version");
                    return version.replace(/WIN/g,'').replace(/,/g,'.');
                }
            } catch(e) {}
        }
    }
})();




baidu.string.encodeHTML = function (source) {
    return String(source)
                .replace(/&/g,'&amp;')
                .replace(/</g,'&lt;')
                .replace(/>/g,'&gt;')
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
};

baidu.encodeHTML = baidu.string.encodeHTML;


baidu.swf.createHTML = function (options) {
    options = options || {};
    var version = baidu.swf.version, 
        needVersion = options['ver'] || '6.0.0', 
        vUnit1, vUnit2, i, k, len, item, tmpOpt = {},
        encodeHTML = baidu.string.encodeHTML;
    
    // 复制options，避免修改原对象
    for (k in options) {
        tmpOpt[k] = options[k];
    }
    options = tmpOpt;
    
    // 浏览器支持的flash插件版本判断
    if (version) {
        version = version.split('.');
        needVersion = needVersion.split('.');
        for (i = 0; i < 3; i++) {
            vUnit1 = parseInt(version[i], 10);
            vUnit2 = parseInt(needVersion[i], 10);
            if (vUnit2 < vUnit1) {
                break;
            } else if (vUnit2 > vUnit1) {
                return ''; // 需要更高的版本号
            }
        }
    } else {
        return ''; // 未安装flash插件
    }
    
    var vars = options['vars'],
        objProperties = ['classid', 'codebase', 'id', 'width', 'height', 'align'];
    
    // 初始化object标签需要的classid、codebase属性值
    options['align'] = options['align'] || 'middle';
    options['classid'] = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
    options['codebase'] = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0';
    options['movie'] = options['url'] || '';
    delete options['vars'];
    delete options['url'];
    
    // 初始化flashvars参数的值
    if ('string' == typeof vars) {
        options['flashvars'] = vars;
    } else {
        var fvars = [];
        for (k in vars) {
            item = vars[k];
            if (item) {
                fvars.push(k + "=" + encodeURIComponent(item));
            }
        }
        options['flashvars'] = fvars.join('&');
    }
    
    // 构建IE下支持的object字符串，包括属性和参数列表
    var str = ['<object '];
    for (i = 0, len = objProperties.length; i < len; i++) {
        item = objProperties[i];
        str.push(' ', item, '="', encodeHTML(options[item]), '"');
    }
    str.push('>');
    var params = {
        'wmode'             : 1,
        'scale'             : 1,
        'quality'           : 1,
        'play'              : 1,
        'loop'              : 1,
        'menu'              : 1,
        'salign'            : 1,
        'bgcolor'           : 1,
        'base'              : 1,
        'allowscriptaccess' : 1,
        'allownetworking'   : 1,
        'allowfullscreen'   : 1,
        'seamlesstabbing'   : 1,
        'devicefont'        : 1,
        'swliveconnect'     : 1,
        'flashvars'         : 1,
        'movie'             : 1
    };
    
    for (k in options) {
        item = options[k];
        k = k.toLowerCase();
        if (params[k] && item) {
            str.push('<param name="' + k + '" value="' + encodeHTML(item) + '" />');
        }
    }
    
    // 使用embed时，flash地址的属性名是src，并且要指定embed的type和pluginspage属性
    options['src']  = options['movie'];
    options['name'] = options['id'];
    delete options['id'];
    delete options['movie'];
    delete options['classid'];
    delete options['codebase'];
    options['type'] = 'application/x-shockwave-flash';
    options['pluginspage'] = 'http://www.macromedia.com/go/getflashplayer';
    
    
    // 构建embed标签的字符串
    str.push('<embed');
    // 在firefox、opera、safari下，salign属性必须在scale属性之后，否则会失效
    // 经过讨论，决定采用BT方法，把scale属性的值先保存下来，最后输出
    var salign;
    for (k in options) {
        item = options[k];
        if (item) {
            if ((new RegExp("^salign\x24", "i")).test(k)) {
                salign = item;
                continue;
            }
            
            str.push(' ', k, '="', encodeHTML(item), '"');
        }
    }
    
    if (salign) {
        str.push(' salign="', encodeHTML(salign), '"');
    }
    str.push('></embed></object>');
    
    return str.join('');
};






baidu.array = baidu.array || {};


baidu.array.remove = function (source, condition) {
    var len = source.length,
        iterator = condition;
    
    if ('function' != typeof condition) {
        iterator = function (item) {
            return condition === item;
        };
    }
    
    while (len--) {
        if (true === iterator.call(source, source[len], len)) {
            source.splice(len, 1);
        }
    }
    return source;
};





baidu.lang.toArray = function (source) {
    if (source === null || source === undefined)
        return [];
    if (baidu.lang.isArray(source))
        return source;

    // The strings and functions also have 'length'
    if (typeof source.length !== 'number' || typeof source === 'string' || baidu.lang.isFunction(source)) {
        return [source];
    }

    //nodeList, IE 下调用 [].slice.call(nodeList) 会报错
    if (source.item) {
        var l = source.length, array = new Array(l);
        while (l--)
            array[l] = source[l];
        return array;
    }

    return [].slice.call(source);
};

baidu.swf.getMovie = function (name) {
	//ie9下, Object标签和embed标签嵌套的方式生成flash时,
	//会导致document[name]多返回一个Object元素,而起作用的只有embed标签
	var movie = document[name], ret;
    return baidu.browser.ie == 9 ?
    	movie && movie.length ? 
    		(ret = baidu.array.remove(baidu.lang.toArray(movie),function(item){
    			return item.tagName.toLowerCase() != "embed";
    		})).length == 1 ? ret[0] : ret
    		: movie
    	: movie || window[name];
};



baidu.swf.create = function (options, target) {
    options = options || {};
    var html = baidu.swf.createHTML(options) 
               || options['errorMessage'] 
               || '';
                
    if (target && 'string' == typeof target) {
        target = document.getElementById(target);
    }
    
    if (target) {
        target.innerHTML = html;
    } else {
        document.write(html);
    }
};



baidu.extend =
baidu.object.extend = function (target, source) {
    for (var p in source) {
        if (source.hasOwnProperty(p)) {
            target[p] = source[p];
        }
    }
    
    return target;
};




baidu.object.keys = function (source) {
    var result = [], resultLen = 0, k;
    for (k in source) {
        if (source.hasOwnProperty(k)) {
            result[resultLen++] = k;
        }
    }
    return result;
};



baidu.object.values = function (source) {
    var result = [], resultLen = 0, k;
    for (k in source) {
        if (source.hasOwnProperty(k)) {
            result[resultLen++] = source[k];
        }
    }
    return result;
};





baidu.object.clone  = (function(buildInObject){
    return function (source) {
        var result = source, i, len;
        if (!source
            || source instanceof Number
            || source instanceof String
            || source instanceof Boolean) {
            return result;
        } else if (baidu.lang.isArray(source)) {
            result = [];
            var resultLen = 0;
            for (i = 0, len = source.length; i < len; i++) {
                result[resultLen++] = baidu.object.clone(source[i]);
            }
        } else if (baidu.lang.isObject(source)) {
            if(buildInObject[Object.prototype.toString.call(source)]){
                return result;
            }
            result = {};
            for (i in source) {
                if (source.hasOwnProperty(i)) {
                    result[i] = baidu.object.clone(source[i]);
                }
            }
        }
        return result;
    };
})({
    // buildInObject, 用于处理无法遍历Date等对象的问题
    '[object Function]': 1,
    '[object RegExp]'  : 1,
    '[object Date]'    : 1,
    '[object Error]'   : 1 
});



baidu.string.getByteLength = function (source) {
    return String(source).replace(/[^\x00-\xff]/g, "ci").length;
};



baidu.string.decodeHTML = function (source) {
    var str = String(source)
                .replace(/&quot;/g,'"')
                .replace(/&lt;/g,'<')
                .replace(/&gt;/g,'>')
                .replace(/&amp;/g, "&");
    //处理转义的中文和实体字符
    return str.replace(/&#([\d]+);/g, function(_0, _1){
        return String.fromCharCode(parseInt(_1, 10));
    });
};

baidu.decodeHTML = baidu.string.decodeHTML;



baidu.string.format = function (source, opts) {
    source = String(source);
    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
    if(data.length){
	    data = data.length == 1 ? 
	    	
	    	(opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
	    	: data;
    	return source.replace(/#\{(.+?)\}/g, function (match, key){
	    	var replacer = data[key];
	    	// chrome 下 typeof /a/ == 'function'
	    	if('[object Function]' == toString.call(replacer)){
	    		replacer = replacer(key);
	    	}
	    	return ('undefined' == typeof replacer ? '' : replacer);
    	});
    }
    return source;
};

// 声明快捷方法
baidu.format = baidu.string.format;



baidu.string.wbr = function (source) {
    return String(source)
        .replace(/(?:<[^>]+>)|(?:&#?[0-9a-z]{2,6};)|(.{1})/gi, '$&<wbr>')
        .replace(/><wbr>/g, '>');
};




baidu.string.subByte = function (source, length) {
    source = String(source);
    if (length < 0 || baidu.string.getByteLength(source) <= length) {
        return source;
    }
    
    //thanks 加宽提供优化方法
    source = source.substr(0,length).replace(/([^\x00-\xff])/g,"\x241 ")//双字节字符替换成两个
        .substr(0,length)//截取长度
        .replace(/[^\x00-\xff]$/,"")//去掉临界双字节字符
        .replace(/([^\x00-\xff]) /g,"\x241");//还原
    return source;

};



baidu.string.toHalfWidth = function (source) {
    return String(source).replace(/[\uFF01-\uFF5E]/g, 
        function(c){
            return String.fromCharCode(c.charCodeAt(0) - 65248);
        }).replace(/\u3000/g," ");
};





baidu.page = baidu.page || {};


baidu.page.getHeight = function () {
    var doc = document,
        body = doc.body,
        html = doc.documentElement,
        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

    return Math.max(html.scrollHeight, body.scrollHeight, client.clientHeight);
};




baidu.page.loadCssFile = function (path) {
    var element = document.createElement("link");
    
    element.setAttribute("rel", "stylesheet");
    element.setAttribute("type", "text/css");
    element.setAttribute("href", path);

    document.getElementsByTagName("head")[0].appendChild(element);        
};



baidu.page.getScrollLeft = function () {
    var d = document;
    return window.pageXOffset || d.documentElement.scrollLeft || d.body.scrollLeft;
};



baidu.page.getViewWidth = function () {
    var doc = document,
        client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;

    return client.clientWidth;
};



baidu.page.loadJsFile = function (path) {
    var element = document.createElement('script');

    element.setAttribute('type', 'text/javascript');
    element.setAttribute('src', path);
    element.setAttribute('defer', 'defer');

    document.getElementsByTagName("head")[0].appendChild(element);    
};



baidu.page.getWidth = function () {
    var doc = document,
        body = doc.body,
        html = doc.documentElement,
        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

    return Math.max(html.scrollWidth, body.scrollWidth, client.clientWidth);
};



baidu.page.getScrollTop = function () {
    var d = document;
    return window.pageYOffset || d.documentElement.scrollTop || d.body.scrollTop;
};



baidu.page.getViewHeight = function () {
    var doc = document,
        client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;

    return client.clientHeight;
};




baidu.array.filter = function (source, iterator) {
    var result = [],
        resultIndex = 0,
        len = source.length,
        item,
        i;
    
    if ('function' == typeof iterator) {
        for (i = 0; i < len; i++) {
            item = source[i];
            if (true === iterator.call(source, item, i)) {
                // resultIndex用于优化对result.length的多次读取
                result[resultIndex++] = item;
            }
        }
    }
    
    return result;
};



baidu.array.unique = function (source, compareFn) {
    var len = source.length,
        result = source.slice(0),
        i, datum;
        
    if ('function' != typeof compareFn) {
        compareFn = function (item1, item2) {
            return item1 === item2;
        };
    }
    
    // 从后往前双重循环比较
    // 如果两个元素相同，删除后一个
    while (--len > 0) {
        datum = result[len];
        i = len;
        while (i--) {
            if (compareFn(datum, result[i])) {
                result.splice(len, 1);
                break;
            }
        }
    }

    return result;
};



baidu.array.indexOf = function (source, condition, position) {
    var len = source.length,
        iterator = condition;
        
    // 参考ecma262的String.prototype.indexOf实现
    // 为undefined时归0，否则进行ToInteger(参见ecma262 3rd 9.4)
    position = Number(position) || 0;
    position = position < 0 ? Math.ceil(position) : Math.floor(position); 
    position = Math.min(Math.max(position, 0), len);
    
    if ('function' != typeof condition) {
        iterator = function (item) {
            return condition === item;
        };
    }
    
    for ( ; position < len; position++) {
        if (true === iterator.call(source, source[position], position)) {
            return position;
        }
    }
    
    return -1;
};




 
baidu.array.each = function (source, iterator) {
    var returnValue, item, i, len = source.length;
    
    if ('function' == typeof iterator) {
        for (i = 0; i < len; i++) {
            item = source[i];
            returnValue = iterator.call(source, item, i);
    
            if (returnValue === false) {
                break;
            }
        }
    }
    return source;
};

// 声明快捷方法
baidu.each = baidu.array.each;



baidu.array.find = function (source, iterator) {
    var item, i, len = source.length;
    
    if ('function' == typeof iterator) {
        for (i = 0; i < len; i++) {
            item = source[i];
            if (true === iterator.call(source, item, i)) {
                return item;
            }
        }
    }
    
    return null;
};




baidu.array.lastIndexOf = function (source, condition) {
    var len = source.length,
        iterator = condition;
    
    if ('function' != typeof condition) {
        iterator = function (item) {
            return condition === item;
        };
    }
    
    while (len--) {
        if (true === iterator.call(source, source[len], len)) {
            return len;
        }
    }
    
    return -1;
};



baidu.array.removeAt = function (source, index) {
    return source.splice(index, 1)[0];
};
























baidu.lang.createClass = function(constructor, options) {
    options = options || {};
    var superClass = options.superClass || baidu.lang.Class;

    // 创建新类的真构造器函数
    var fn = function(){
        // 继承父类的构造器
        if(superClass != baidu.lang.Class){
            superClass.apply(this, arguments);
        }else{
            superClass.call(this);
        }
        constructor.apply(this, arguments);
    };

    fn.options = options.options || {};

    var C = function(){},
        cp = constructor.prototype;
    C.prototype = superClass.prototype;

    // 继承父类的原型（prototype)链
    var fp = fn.prototype = new C();

    // 继承传参进来的构造器的 prototype 不会丢
    for (var i in cp) fp[i] = cp[i];

    typeof options.className == "string" && (fp._className = options.className);

    // 修正这种继承方式带来的 constructor 混乱的问题
    fp.constructor = cp.constructor;

    // 给类扩展出一个静态方法，以代替 baidu.object.extend()
    fn.extend = function(json){
        for (var i in json) {
            fn.prototype[i] = json[i];
        }
        return fn;  // 这个静态方法也返回类对象本身
    };

    return fn;
};





baidu.lang.createSingle = function (json) {
    var c = new baidu.lang.Class();

    for (var key in json) {
        c[key] = json[key];
    }
    return c;
};



baidu.string.filterFormat = function (source, opts) {
    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
    if(data.length){
	    data = data.length == 1 ? 
	    	
	    	(opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
	    	: data;
    	return source.replace(/#\{(.+?)\}/g, function (match, key){
		    var filters, replacer, i, len, func;
		    if(!data) return '';
	    	filters = key.split("|");
	    	replacer = data[filters[0]];
	    	// chrome 下 typeof /a/ == 'function'
	    	if('[object Function]' == toString.call(replacer)){
	    		replacer = replacer(filters[0]);
	    	}
	    	for(i=1,len = filters.length; i< len; ++i){
	    		func = baidu.string.filterFormat[filters[i]];
	    		if('[object Function]' == toString.call(func)){
	    			replacer = func(replacer);
	    		}
	    	}
	    	return ( ('undefined' == typeof replacer || replacer === null)? '' : replacer);
    	});
    }
    return source;
};


baidu.string.filterFormat.escapeJs = function(str){
	if(!str || 'string' != typeof str) return str;
	var i,len,charCode,ret = [];
	for(i=0, len=str.length; i < len; ++i){
		charCode = str.charCodeAt(i);
		if(charCode > 255){
			ret.push(str.charAt(i));
		} else{
			ret.push('\\x' + charCode.toString(16));
		}
	}
	return ret.join('');
};
baidu.string.filterFormat.js = baidu.string.filterFormat.escapeJs;


baidu.string.filterFormat.escapeString = function(str){
	if(!str || 'string' != typeof str) return str;
	return str.replace(/["'<>\\\/`]/g, function($0){
	   return '&#'+ $0.charCodeAt(0) +';';
	});
};

baidu.string.filterFormat.e = baidu.string.filterFormat.escapeString;


baidu.string.filterFormat.toInt = function(str){
	return parseInt(str, 10) || 0;
};
baidu.string.filterFormat.i = baidu.string.filterFormat.toInt;











(function(){

 baidu.page.getMousePosition = function(){
 return {
x : baidu.page.getScrollLeft() + xy.x,
y : baidu.page.getScrollTop() + xy.y
};
};

var xy = {x:0, y:0};
// 监听当前网页的 mousemove 事件以获得鼠标的实时坐标
baidu.event.on(document, "onmousemove", function(e){
    e = window.event || e;
    xy.x = e.clientX;
    xy.y = e.clientY;
    });

})();








(function(){
    var target, // 被拖曳的DOM元素
        op, ox, oy, //timer, 
        top, left, mozUserSelect,
        lastLeft, lastTop,
        isFunction = baidu.lang.isFunction,
        timer;
    
    baidu.dom.drag = function(element, options) {
        //每次开始拖拽的时候重置lastTop和lastLeft
        lastTop = lastLeft = null;
        
        if (!(target = baidu.dom.g(element))) return false;
        op = baidu.object.extend({
            autoStop:true   // false 用户手动结束拖曳 ｜ true 在mouseup时自动停止拖曳
            ,capture : true // 鼠标拖曳粘滞
            ,interval : 20  // 拖曳行为的触发频度（时间：毫秒）
        }, options);

        top = parseInt(baidu.dom.getStyle(target, "top")) || 0;
        left= parseInt(baidu.dom.getStyle(target, "left"))|| 0;

        if(op.mouseEvent){
            // [2010/11/16] 可以不依赖getMousePosition，直接通过一个可选参数获得鼠标位置
            ox = baidu.page.getScrollLeft() + op.mouseEvent.clientX;
            oy = baidu.page.getScrollTop() + op.mouseEvent.clientY;
        }else{
            var xy = baidu.page.getMousePosition();    // 得到当前鼠标坐标值
            ox = xy.x;
            oy = xy.y;
        }

        timer = setInterval(render, op.interval);

        // 这项为 true，缺省在 onmouseup 事件终止拖曳
        op.autoStop && baidu.event.on(document, "mouseup", stop);
        
        // 在拖曳过程中页面里的文字会被选中高亮显示，在这里修正
        baidu.event.on(document.body, "selectstart", unselect);

        // 设置鼠标粘滞
        if (op.capture && target.setCapture) {
            target.setCapture();
        } else if (op.capture && window.captureEvents) {
            window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
        }
        //baidu.on(target,"mousemove",render);

        // fixed for firefox
        mozUserSelect = document.body.style.MozUserSelect;
        document.body.style.MozUserSelect = "none";

        // ondragstart 事件
        if(isFunction(op.ondragstart)){
            op.ondragstart(target, op);
        }

        return {stop : stop, update : update};
    };

    
    function update(options){
        baidu.extend(op, options);
    }

    
    function stop() {
        clearTimeout(timer);

        // 解除鼠标粘滞
        if (op.capture && target.releaseCapture) {
            target.releaseCapture();
        } else if (op.capture && window.releaseEvents) {
            window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
        }

        // 拖曳时网页内容被框选
        document.body.style.MozUserSelect = mozUserSelect;
        baidu.event.un(document.body, "selectstart", unselect);
        op.autoStop && baidu.event.un(document, "mouseup", stop);

        // ondragend 事件
        if(isFunction(op.ondragend)){
            op.ondragend(target, op);
        }
    }

    // 对DOM元素进行top/left赋新值以实现拖曳的效果
    function render(e) {
        var rg = op.range,
            xy = baidu.page.getMousePosition(),
            el = left + xy.x - ox,
            et = top  + xy.y - oy;

        // 如果用户限定了可拖动的范围
        if (typeof rg == "object" && rg && rg.length == 4) {
            el = Math.max(rg[3], el);
            el = Math.min(rg[1] - target.offsetWidth,  el);
            et = Math.max(rg[0], et);
            et = Math.min(rg[2] - target.offsetHeight, et);
        }
        target.style.top = et + "px";
        target.style.left = el + "px";

        if((lastLeft !== el || lastTop !== et) && (lastLeft !== null || lastTop !== null) ){
            if(isFunction(op.ondrag)){
                op.ondrag(target, op);   
            }
        }
        lastLeft = el;
        lastTop = et;
    }

    // 对document.body.onselectstart事件进行监听，避免拖曳时文字被选中
    function unselect(e) {
        return baidu.event.preventDefault(e, false);
    }
})();













baidu.dom.draggable = function(element, options) {
    options = baidu.object.extend({toggle: function() {return true}}, options || {});
    options.autoStop = true;
    element = baidu.dom.g(element);
    options.handler = options.handler || element;
    var manager,
        events = ['ondragstart', 'ondrag', 'ondragend'],
        i = events.length - 1,
        eventName,
        dragSingle,
        draggableSingle = {
            dispose: function() {
                dragSingle && dragSingle.stop();
                baidu.event.un(options.handler, 'onmousedown', handlerMouseDown);
                baidu.lang.Class.prototype.dispose.call(draggableSingle);
            }
        },
        me = this;

    //如果存在ddManager, 将事件转发到ddManager中
    if (manager = baidu.dom.ddManager) {
        for (; i >= 0; i--) {
            eventName = events[i];
            options[eventName] = (function(eventName) {
                var fn = options[eventName];
                return function() {
                    baidu.lang.isFunction(fn) && fn.apply(me, arguments);
                    manager.dispatchEvent(eventName, {DOM: element});
                }
            })(eventName);
        }
    }


    // 拖曳只针对有 position 定位的元素
    if (element) {
        function handlerMouseDown(e) {
            var event = options.mouseEvent = window.event || e;
            if (event.button > 1 //只支持鼠标左键拖拽; 左键代码: IE为1,W3C为0
                // 可以通过配置项里的这个开关函数暂停或启用拖曳功能
                || (baidu.lang.isFunction(options.toggle) && !options.toggle())) {
                return;
            }
            if (baidu.dom.getStyle(element, 'position') == 'static') {
                baidu.dom.setStyle(element, 'position', 'relative');
            }
            if (baidu.lang.isFunction(options.onbeforedragstart)) {
                options.onbeforedragstart(element);
            }
            dragSingle = baidu.dom.drag(element, options);
            draggableSingle.stop = dragSingle.stop;
            draggableSingle.update = dragSingle.update;
            //防止ff下出现禁止拖拽的图标
            baidu.event.preventDefault(event);
        }

        // 对拖曳的扳机元素监听 onmousedown 事件，以便进行拖曳行为
        baidu.event.on(options.handler, 'onmousedown', handlerMouseDown);
    }
    return {
        cancel: function() {
            draggableSingle.dispose();
        }
    };
};






(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var match,
			type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName( "*" );
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var found, item,
					filter = Expr.filter[ type ],
					left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !/\W/.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !/\W/.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			return context.getElementsByTagName( match[1] );
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace(/\\/g, "");
		},

		TAG: function( match, curLoop ) {
			return match[1].toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			return "text" === elem.type;
		},
		radio: function( elem ) {
			return "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return "checkbox" === elem.type;
		},

		file: function( elem ) {
			return "file" === elem.type;
		},
		password: function( elem ) {
			return "password" === elem.type;
		},

		submit: function( elem ) {
			return "submit" === elem.type;
		},

		image: function( elem ) {
			return "image" === elem.type;
		},

		reset: function( elem ) {
			return "reset" === elem.type;
		},

		button: function( elem ) {
			return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					var first = match[2],
						last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// If the nodes are siblings (or identical) we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");

    //2010/12/28 berg:
    //add try-catch
    //in IE 5.5, createComment cause a JS error
    try{
	div.appendChild( document.createComment("") );
    }catch(e){}

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Make sure that attribute selectors are quoted
			query = query.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				if ( context.nodeType === 9 ) {
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector,
		pseudoWorks = false;

	try {
		// This should fail with an exception
		// Gecko does not error, returns false instead
		matches.call( document.documentElement, "[test!='']:sizzle" );
	
	} catch( pseudoError ) {
		pseudoWorks = true;
	}

	if ( matches ) {
		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						return matches.call( node, expr );
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE

baidu.dom.query = Sizzle;

})();






baidu.page.createStyleSheet = function(options){
    var op = options || {},
        doc = op.document || document,
        s;

    if (baidu.browser.ie) {
        //修复ie下会请求一个undefined的bug  berg 2010/08/27 
        if(!op.url)
            op.url = "";
        return doc.createStyleSheet(op.url, op.index);
    } else {
        s = "<style type='text/css'></style>";
        op.url && (s="<link type='text/css' rel='stylesheet' href='"+op.url+"'/>");
        baidu.dom.insertHTML(doc.getElementsByTagName("HEAD")[0],"beforeEnd",s);
        //如果用户传入了url参数，下面访问sheet.rules的时候会报错
        if(op.url){
            return null;
        }

        var sheet = doc.styleSheets[doc.styleSheets.length - 1],
            rules = sheet.rules || sheet.cssRules;
        return {
            self : sheet
            ,rules : sheet.rules || sheet.cssRules
            ,addRule : function(selector, style, i) {
                if (sheet.addRule) {
                    return sheet.addRule(selector, style, i);
                } else if (sheet.insertRule) {
                    isNaN(i) && (i = rules.length);
                    return sheet.insertRule(selector +"{"+ style +"}", i);
                }
            }
            ,removeRule : function(i) {
                if (sheet.removeRule) {
                    sheet.removeRule(i);
                } else if (sheet.deleteRule) {
                    isNaN(i) && (i = 0);
                    sheet.deleteRule(i);
                }
            }
        }
    }
};








baidu.dom.create = function(tagName, opt_attributes) {
    var el = document.createElement(tagName),
        attributes = opt_attributes || {};
    return baidu.dom.setAttrs(el, attributes);
};



baidu.dom.empty = function (element) {
    element = baidu.dom.g(element);
    
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
    //todo：删除元素上绑定的事件等?

    return element;
};



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




baidu.dom.hasAttr = function (element, name){
    element = baidu.g(element);
    var attr = element.attributes.getNamedItem(name);
    return !!( attr && attr.specified );
};





baidu.dom.toggleClass = function (element, className) {
    if(baidu.dom.hasClass(element, className)){
        baidu.dom.removeClass(element, className);
    }else{
        baidu.dom.addClass(element, className);
    }
};










baidu.e = baidu.element = function(node){
    var gNode = baidu._g(node);
    if(!gNode && baidu.dom.query){
        gNode = baidu.dom.query(node);
    }
    return new baidu.element.Element(gNode);
};

/// FIXME 居然用上面这种方式定义baidu.element;





baidu.fn.methodize = function (func, attr) {
    return function(){
        return func.apply(this, [(attr ? this[attr] : this)].concat([].slice.call(arguments)));
    };
};



baidu.fn.multize = function (func, recursive) {
    var newFunc = function(){
        var list = arguments[0],
            fn = recursive ? newFunc : func,
            ret = [],
            moreArgs = [].slice.call(arguments,0),
            i = 0,
            len,
            r;

        if(list instanceof Array){
            for(len = list.length; i < len; i++){
                moreArgs[0]=list[i];
                r = fn.apply(this, moreArgs);
                ret.push(r); 	
            }
            return ret;
        }else{
            return func.apply(this, arguments);
        }
    }
    return newFunc;
};



baidu.element._wrapFunction = function(func, index){
    return baidu.fn.methodize(wrapReturnValue(baidu.fn.multize(func), baidu.element.Element, index), '_dom');

    
    function wrapReturnValue(func, wrapper, index){
        index = index | 0;
        return function(){
            var ret = func.apply(this, arguments); 

            if(index > 0){
                return new wrapper(arguments[index - 1]);
            }
            if(!index){
                return new wrapper(ret);
            }

            return ret;
        }
    }
};


baidu.element.Element = function(node){
    if(!baidu.element._init){
        // FIXME 为啥这么做呢?
        baidu.element._initChain();
        baidu.element._init = true;
    }
    
    
    this._dom = baidu.lang.toArray(node);
};


baidu.element.Element.prototype.each = function(iterator) {
    // 每一个iterator接受到的都是封装好的node
    baidu.array.each(this._dom, function(node){
        iterator.call(this, new baidu.element.Element(node));
    });
};


baidu.element._initChain = function(){ //将dom/event包下的东西挂到prototype里面
    var proto = baidu.element.Element.prototype,
        wrapFn = baidu.element._wrapFunction;

    //返回值是第一个参数的包装
    baidu.each(("draggable droppable resizable").split(' '),
              function(fn){
                  proto[fn] =  wrapFn(baidu.dom[fn], 1);
              });

    //直接返回返回值
    baidu.each(("remove getText contains getAttr getPosition getStyle hasClass intersect hasAttr").split(' '),
              function(fn){
                  proto[fn] = proto[fn.replace(/^get[A-Z]/g, stripGet)] = wrapFn(baidu.dom[fn], -1);
              });

    //包装返回值
    baidu.each(("addClass empty hide show insertAfter insertBefore insertHTML removeClass " + 
              "setAttr setAttrs setStyle setStyles show toggleClass toggle children next first " + 
              "getAncestorByClass getAncestorBy getAncestorByTag getDocument getParent getWindow " +
              "last next prev g q query removeStyle setBorderBoxSize setOuterWidth setOuterHeight " +
              "setBorderBoxWidth setBorderBoxHeight setPosition").split(' '),
              function(fn){
                  proto[fn] = proto[fn.replace(/^get[A-Z]/g, stripGet)] = wrapFn(baidu.dom[fn], 0);
              });

    //包装event中的on 和 un
    baidu.each(("on un").split(' '), function(fn){
        proto[fn] = wrapFn(baidu.event[fn], 0);
    });
  
    
    //包装event的快捷方式
    baidu.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
                "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
                "change select submit keydown keypress keyup error").split(' '), function(fnName){
        proto[fnName] = function(fn){
            return this.on(fnName, fn);
        };
    });


    
    function stripGet(match) {  
        return match.charAt(3).toLowerCase();
    }
};






baidu.lang.Class.prototype.addEventListeners = function (events, fn) {
    if(typeof fn == 'undefined'){
        for(var i in events){
            this.addEventListener(i, events[i]);
        }
    }else{
        events = events.split(',');
        var i = 0, len = events.length, event;
        for(; i < len; i++){
            this.addEventListener(baidu.trim(events[i]), fn);
        }
    }
};







baidu.array.hash = function(keys, values) {
    var o = {}, vl = values && values.length, i = 0, l = keys.length;
    for (; i < l; i++) {
        o[keys[i]] = (vl && vl > i) ? values[i] : true;
    }
    return o;
};



baidu.dom.ddManager = baidu.lang.createSingle({
	_targetsDroppingOver:{}
});







//TODO: 添加对 accept, hoverclass 等参数的支持.

baidu.dom.droppable = function(element, options){
	options = options || {};
	var manager = baidu.dom.ddManager,
		target = baidu.dom.g(element),
	    guid = baidu.lang.guid(),
		//拖拽进行时判断
		_dragging = function(event){
			var _targetsDroppingOver = manager._targetsDroppingOver,
			    eventData = {trigger:event.DOM,reciever: target};
			//判断被拖拽元素和容器是否相撞
			if(baidu.dom.intersect(target, event.DOM)){
				//进入容器区域
				if(! _targetsDroppingOver[guid]){
					//初次进入
					(typeof options.ondropover == 'function') && options.ondropover.call(target,eventData);
					manager.dispatchEvent("ondropover", eventData);
					_targetsDroppingOver[guid] = true;
				}
			} else {
				//出了容器区域
				if(_targetsDroppingOver[guid]){
					(typeof options.ondropout == 'function') && options.ondropout.call(target,eventData);
					manager.dispatchEvent("ondropout", eventData);
				}
				delete _targetsDroppingOver[guid];
			}
		},
		//拖拽结束时判断
		_dragend = function(event){
			var eventData = {trigger:event.DOM,reciever: target};
			if(baidu.dom.intersect(target, event.DOM)){
				typeof options.ondrop == 'function' && options.ondrop.call(target, eventData);
				manager.dispatchEvent("ondrop", eventData);
			}
			delete manager._targetsDroppingOver[guid];
		};
	//事件注册,return object提供事件解除
	manager.addEventListener("ondrag", _dragging);
	manager.addEventListener("ondragend", _dragend);
	return {
		cancel : function(){
			manager.removeEventListener("ondrag", _dragging);
			manager.removeEventListener("ondragend",_dragend);
		}
	};
};




 
// todo: 1. 只支持现代浏览器，有一些老浏览器可能不支持; 2. 有部分属性无法被正常移除
baidu.dom.removeStyle = function (){
    var ele = document.createElement("DIV"),
        fn,
        _g = baidu.dom._g;
    
    if (ele.style.removeProperty) {// W3C, (gecko, opera, webkit)
        fn = function (el, st){
            el = _g(el);
            el.style.removeProperty(st);
            return el;
        };
    } else if (ele.style.removeAttribute) { // IE
        fn = function (el, st){
            el = _g(el);
            el.style.removeAttribute(baidu.string.toCamelCase(st));
            return el;
        };
    }
    ele = null;
    return fn;
}();

























baidu.dom.setBorderBoxSize= function (element, size) {
    var result = {};
    function getNumericalStyle(element, name){
        return parseFloat(baidu.getStyle(element, name)) || 0;
    }
    
    if(baidu.browser.isStrict){
        if(size.width){
            result.width = parseFloat(size.width)  -
                           getNumericalStyle(element, 'paddingLeft') - 
                           getNumericalStyle(element, 'paddingRight') - 
                           getNumericalStyle(element, 'borderLeftWidth') -
                           getNumericalStyle(element, 'borderRightWidth');
            result.width < 0 && (result.width = 0);
        }
        if(size.height){
            result.height = parseFloat(size.height) -
                            getNumericalStyle(element, 'paddingTop') - 
                            getNumericalStyle(element, 'paddingBottom') - 
                            getNumericalStyle(element, 'borderTopWidth') - 
                            getNumericalStyle(element, 'borderBottomWidth');
            result.height < 0 && (result.height = 0);
        }
    }
    return baidu.dom.setStyles(element, result);
};


baidu.dom.setOuterHeight = 
baidu.dom.setBorderBoxHeight = function (element, height) {
    return baidu.dom.setBorderBoxSize(element, {height : height});
};




baidu.dom.setOuterWidth = 
baidu.dom.setBorderBoxWidth = function (element, width) {
    return baidu.dom.setBorderBoxSize(element, {width : width});
};



baidu.dom.resizable = function(element,options) {
    var target,
        op,
        resizeHandle = {},
        directionHandlePosition,
        orgStyles = {},
        range, mozUserSelect,
        orgCursor,
        offsetParent,
        currentEle,
        timer,
        handlePosition;

    if (!(target = baidu.dom.g(element)) && baidu.getStyle(target, 'position') == 'static') {
        return false;
    }
    offsetParent = target.offsetParent;
    
    
    op = baidu.extend({
        direction: ['e', 's', 'se'],
        minWidth: 16,
        minHeight: 16,
        classPrefix: 'tangram',
        directionHandlePosition: {}
    }, options);

    
    handlePosition = baidu.extend({
        'e' : {'right': '-5px', 'top': '0px', 'width': '7px', 'height': target.offsetHeight},
        's' : {'left': '0px', 'bottom': '-5px', 'height': '7px', 'width': target.offsetWidth},
        'n' : {'left': '0px', 'top': '-5px', 'height': '7px', 'width': target.offsetWidth},
        'w' : {'left': '-5px', 'top': '0px', 'height': target.offsetHeight, 'width': '7px'},
        'se': {'right': '1px', 'bottom': '1px', 'height': '16px', 'width': '16px'},
        'sw': {'left': '1px', 'bottom': '1px', 'height': '16px', 'width': '16px'},
        'ne': {'right': '1px', 'top': '1px', 'height': '16px', 'width': '16px'},
        'nw': {'left': '1px', 'top': '1px', 'height': '16px', 'width': '16px'}
    },op.directionHandlePosition);

    
    baidu.each(['minHeight', 'minWidth', 'maxHeight', 'maxWidth'], function(style) {
        op[style] && (op[style] = parseFloat(op[style]));
    });

    
    range = [
        op.minWidth || 0,
        op.maxWidth || Number.MAX_VALUE,
        op.minHeight || 0,
        op.maxHeight || Number.MAX_VALUE
    ];

    
    baidu.each(op.direction, function(key) {
        var className = op.classPrefix.split(' ');
        className[0] = className[0] + '-resizable-' + key;

        var ele = baidu.dom.create('div', {
            className: className.join(' ')
        }),
        styles = handlePosition[key];

        styles['cursor'] = key + '-resize';
        styles['position'] = 'absolute';
        baidu.setStyles(ele, styles);
        ele.key = key;
        ele.style.MozUserSelect = 'none';

        target.appendChild(ele);
        resizeHandle[key] = ele;

        baidu.on(ele, 'mousedown', start);
    });

    
    function cancel(){
        currentEle && stop();
        baidu.object.each(resizeHandle,function(item){
            baidu.un(item,"mousedown",start);
            baidu.dom.remove(item);
        });
    }

    
    function start(e){
        var ele = baidu.event.getTarget(e),
            key = ele.key;
        currentEle = ele;

        if (ele.setCapture) {
            ele.setCapture();
        } else if (window.captureEvents) {
            window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
        }

        
        orgCursor = baidu.getStyle(document.body, 'cursor');
        baidu.setStyle(document.body, 'cursor', key + '-resize');
        baidu.on(document, 'mouseup',stop);
        baidu.on(document.body, 'selectstart', unselect);
        mozUserSelect = document.body.style.MozUserSelect;
        document.body.style.MozUserSelect = 'none';

        
        var orgMousePosition = baidu.page.getMousePosition();
        orgStyles = getOrgStyle();
        timer = setInterval(function(){
            render(key,orgMousePosition);
        }, 20);

        baidu.lang.isFunction(op.onresizestart) && op.onresizestart();
        baidu.event.preventDefault(e);
    }

    
    function stop() {
        if (currentEle.releaseCapture) {
            currentEle.releaseCapture();
        } else if (window.releaseEvents) {
            window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
        }

        
        baidu.un(document, 'mouseup',stop);
        baidu.un(document, 'selectstart', unselect);
        document.body.style.MozUserSelect = mozUserSelect;
        baidu.un(document.body, 'selectstart', unselect);

        clearInterval(timer);
        baidu.setStyle(document.body, 'cursor',orgCursor);
        currentEle = null;
        
        baidu.lang.isFunction(op.onresizeend) && op.onresizeend();
    }

    
    function render(key,orgMousePosition) {
        var xy = baidu.page.getMousePosition(),
            width = orgStyles['width'],
            height = orgStyles['height'],
            top = orgStyles['top'],
            left = orgStyles['left'],
            styles;

        if (key.indexOf('e') >= 0) {
            width = Math.max(xy.x - orgMousePosition.x + orgStyles['width'], range[0]);
            width = Math.min(width, range[1]);
        }else if (key.indexOf('w') >= 0) {
            width = Math.max(orgMousePosition.x - xy.x + orgStyles['width'], range[0]);
            width = Math.min(width, range[1]);
            left = orgStyles['left'] - (width - orgStyles['width']);
        }

        if (key.indexOf('s') >= 0) {
            height = Math.max(xy.y - orgMousePosition.y + orgStyles['height'], range[2]);
            height = Math.min(height, range[3]);
        }else if (key.indexOf('n') >= 0) {
            height = Math.max(orgMousePosition.y - xy.y + orgStyles['height'], range[2]);
            height = Math.min(height, range[3]);
            top = orgStyles['top'] - (height - orgStyles['height']);
        }
         
        styles = {'width': width, 'height': height, 'top': top, 'left': left};
        baidu.dom.setOuterHeight(target,height);
        baidu.dom.setOuterWidth(target,width);
        baidu.setStyles(target,{"top":top,"left":left});

        resizeHandle['n'] && baidu.setStyle(resizeHandle['n'], 'width', width);
        resizeHandle['s'] && baidu.setStyle(resizeHandle['s'], 'width', width);
        resizeHandle['e'] && baidu.setStyle(resizeHandle['e'], 'height', height);
        resizeHandle['w'] && baidu.setStyle(resizeHandle['w'], 'height', height);

        baidu.lang.isFunction(op.onresize) && op.onresize({current:styles,original:orgStyles});
    }

    
    function unselect(e) {
        return baidu.event.preventDefault(e, false);
    }

    
    function getOrgStyle() {
        var offset_parent = baidu.dom.getPosition(target.offsetParent),
            offset_target = baidu.dom.getPosition(target),
            top,
            left;
       
        if(target.offsetParent == document.body){
            top = offset_target.top;
            left = offset_target.left;
        }else{
            top =  offset_target.top - offset_parent.top;
            left = offset_target.left - offset_parent.left;
        }
        baidu.setStyles(target,{top:top,left:left});

        return {
            width:target.offsetWidth,
            height:target.offsetHeight,
            top:top,
            left:left
        };
    }
    
    return {cancel:cancel};
};





baidu.fn.bind = function(func, scope) {
    var xargs = arguments.length > 2 ? [].slice.call(arguments, 2) : null;
    return function () {
        var fn = baidu.lang.isString(func) ? scope[func] : func,
            args = (xargs) ? xargs.concat([].slice.call(arguments, 0)) : arguments;
        return fn.apply(scope || fn, args);
    };
};





baidu.lang.isBoolean = function(o) {
    return typeof o === 'boolean';
};



baidu.lang.isDate = function(o) {
    // return o instanceof Date;
    return {}.toString.call(o) === "[object Date]" && o.toString() !== 'Invalid Date' && !isNaN(o);
};


baidu.event._eventFilter = baidu.event._eventFilter || {};







baidu.event._eventFilter._crossElementBoundary = function(listener, e){
    var related = e.relatedTarget,
        current = e.currentTarget;
    if(typeof related == 'undefined'){
        return listener.call(current, e);
    }
    if(
       related === false || 
       // 如果current和related都是body，contains函数会返回false
       current == related ||
       // Firefox有时会把XUL元素作为relatedTarget
       // 这些元素不能访问parentNode属性
       // thanks jquery & mootools
       related.prefix == 'xul' ||
       //如果current包含related，说明没有经过current的边界
       baidu.dom.contains(current, related)
      ){
        return ;
    }
    return listener.call(current, e);
};




baidu.event._eventFilter.mouseenter = window.attachEvent ? null : function(element,type, listener){
	return {
		type: "mouseover",
		listener: baidu.fn.bind(baidu.event._eventFilter._crossElementBoundary, this, listener)
	}
};





baidu.event._eventFilter.mouseleave = window.attachEvent ? null : function(element,type, listener){
	return {
		type: "mouseout",
		listener: baidu.fn.bind(baidu.event._eventFilter._crossElementBoundary, this, listener)
	}
};







(function(){
	var browser = baidu.browser,
	keys = {
		keydown : 1,
		keyup : 1,
		keypress : 1
	},
	mouses = {
		click : 1,
		dblclick : 1,
		mousedown : 1,
		mousemove : 1,
		mouseup : 1,
		mouseover : 1,
		mouseout : 1
	},
	htmls = {
		abort : 1,
		blur : 1,
		change : 1,
		error : 1,
		focus : 1,
		load : browser.ie ? 0 : 1,
		reset : 1,
		resize : 1,
		scroll : 1,
		select : 1,
		submit : 1,
		unload : browser.ie ? 0 : 1
	},
	bubblesEvents = {
		scroll : 1,
		resize : 1,
		reset : 1,
		submit : 1,
		change : 1,
		select : 1,
		error : 1,
		abort : 1
	},
	parameters = {
		"KeyEvents" : ["bubbles", "cancelable", "view", "ctrlKey", "altKey", "shiftKey", "metaKey", "keyCode", "charCode"],
		"MouseEvents" : ["bubbles", "cancelable", "view", "detail", "screenX", "screenY", "clientX", "clientY", "ctrlKey", "altKey", "shiftKey", "metaKey", "button", "relatedTarget"],
		"HTMLEvents" : ["bubbles", "cancelable"],
		"UIEvents" : ["bubbles", "cancelable", "view", "detail"],
		"Events" : ["bubbles", "cancelable"]
	};
	baidu.object.extend(bubblesEvents, keys);
	baidu.object.extend(bubblesEvents, mouses);
	function parse(array, source){//按照array的项在source中找到值生成新的obj并把source中对应的array的项删除
		var i = 0, size = array.length, obj = {};
		for(; i < size; i++){
			obj[array[i]] = source[array[i]];
			delete source[array[i]];
		}
		return obj;
	};
	function eventsHelper(type, eventType, options){//非IE内核的事件辅助
		options = baidu.object.extend({}, options);
		var param = baidu.object.values(parse(parameters[eventType], options)),
			evnt = document.createEvent(eventType);
		param.unshift(type);
		if("KeyEvents" == eventType){
			evnt.initKeyEvent.apply(evnt, param);
		}else if("MouseEvents" == eventType){
			evnt.initMouseEvent.apply(evnt, param);
		}else if("UIEvents" == eventType){
			evnt.initUIEvent.apply(evnt, param);
		}else{//HTMMLEvents, Events
			evnt.initEvent.apply(evnt, param);
		}
		baidu.object.extend(evnt, options);//把多出来的options再附加上去,这是为解决当创建一个其它event时，当用Events代替后需要把参数附加到对象上
		return evnt;
	};
	function eventObject(options){//ie内核的构建方式
		var evnt;
		if(document.createEventObject){
			evnt = document.createEventObject();
			baidu.object.extend(evnt, options);
		}
		return evnt;
	};
	function keyEvents(type, options){//keyEvents
		options = parse(parameters["KeyEvents"], options);
		var evnt;
		if(document.createEvent){
			try{//opera对keyEvents的支持极差
				evnt = eventsHelper(type, "KeyEvents", options);
			}catch(keyError){
				try{
					evnt = eventsHelper(type, "Events", options);
				}catch(evtError){
					evnt = eventsHelper(type, "UIEvents", options);
				}
			}
		}else{
			options.keyCode = options.charCode > 0 ? options.charCode : options.keyCode;
			evnt = eventObject(options);
		}
		return evnt;
	};
	function mouseEvents(type, options){//mouseEvents
		options = parse(parameters["MouseEvents"], options);
		var evnt;
		if(document.createEvent){
			evnt = eventsHelper(type, "MouseEvents", options);//mouseEvents基本浏览器都支持
			if(options.relatedTarget && !evnt.relatedTarget){
				if("mouseout" == type.toLowerCase()){
					evnt.toElement = options.relatedTarget;
				}else if("mouseover" == type.toLowerCase()){
					evnt.fromElement = options.relatedTarget;
				}
			}
		}else{
			options.button = options.button == 0 ? 1
								: options.button == 1 ? 4
									: baidu.lang.isNumber(options.button) ? options.button : 0;
			evnt = eventObject(options);
		}
		return evnt;
	};
	function htmlEvents(type, options){//htmlEvents
		options.bubbles = bubblesEvents.hasOwnProperty(type);
		options = parse(parameters["HTMLEvents"], options);
		var evnt;
		if(document.createEvent){
			try{
				evnt = eventsHelper(type, "HTMLEvents", options);
			}catch(htmlError){
				try{
					evnt = eventsHelper(type, "UIEvents", options);
				}catch(uiError){
					evnt = eventsHelper(type, "Events", options);
				}
			}
		}else{
			evnt = eventObject(options);
		}
		return evnt;
	};
	baidu.event.fire = function(element, type, options){
		var evnt;
		type = type.replace(/^on/i, "");
		element = baidu.dom._g(element);
		options = baidu.object.extend({
			bubbles : true,
			cancelable : true,
			view : window,
			detail : 1,
			screenX : 0,
			screenY : 0,
			clientX : 0,
			clientY : 0,
			ctrlKey : false,
			altKey  : false,
			shiftKey: false,
			metaKey : false,
			keyCode : 0,
			charCode: 0,
			button  : 0,
			relatedTarget : null
		}, options);
		if(keys[type]){
			evnt = keyEvents(type, options);
		}else if(mouses[type]){
			evnt = mouseEvents(type, options);
		}else if(htmls[type]){
			evnt = htmlEvents(type, options);
		}else{
		    throw(new Error(type + " is not support!"));
		}
		if(evnt){//tigger event
			if(element.dispatchEvent){
				element.dispatchEvent(evnt);
			}else if(element.fireEvent){
				element.fireEvent("on" + type, evnt);
			}
		}
	}
})();





baidu.event.once = function(element, type, listener){
    element = baidu.dom._g(element);
    function onceListener(event){
        listener.call(element,event);
        baidu.event.un(element, type, onceListener);
    } 
    
    baidu.event.on(element, type, onceListener);
    return element;
};



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




baidu.array.map = function(source, iterator) {
    var results = [],
        i = 0,
        l = source.length;
    for (; i < l; i++) {
        results[i] = iterator(source[i], i);
    }
    return results;
};



baidu.dom.getParent = function (element) {
    element = baidu.dom._g(element);
    //parentElement在IE下准确，parentNode在ie下可能不准确
    return element.parentElement || element.parentNode || null;
};










baidu.dom.setPosition = function (element, position) {
    return baidu.dom.setStyles(element, {
        left : position.left - (parseFloat(baidu.dom.getStyle(element, "margin-left")) || 0),
        top : position.top - (parseFloat(baidu.dom.getStyle(element, "margin-top")) || 0)
    });
};







 
baidu.element.extend = function(json){
    var e = baidu.element;
    baidu.object.each(json, function(item, key){
        e.Element.prototype[key] = e._wrapFunction(item, -1);
    });
};




baidu.number.randomInt = function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
};



baidu.object.map = function (source, iterator) {
    var results = {};
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            results[key] = iterator(source[key], key);
        }
    }
    return results;
};





baidu.array.contains = function(source, obj) {
    return (baidu.array.indexOf(source, obj) >= 0);
};



baidu.array.empty = function(source) {
    source.length = 0;
};



baidu.array.every = function(source, iterator) {
    var i = 0,
        len = source.length;
    for (; i < len; i++) {
        if (!iterator.call(source, source[i], i)) {
            return false;
        }
    }
    return true;
};



baidu.array.reduce = function(source, iterator, initializer) {
    var result = initializer,
        i = 0,
        l = source.length;
    for (; i < l; i++) {
        result = iterator(result, source[i]);
    }
    return result;
};



baidu.array.some = function(source, iterator) {
    var i = 0,
        len = source.length;
    for (; i < len; i++) {
        if (iterator.call(source, source[i], i)) {
            return true;
        }
    }
    return false;
};






baidu.page.load = function(resources, options){
	//TODO failure, 整体onload能不能每个都调用; resources.charset
	options = options || {};
	var self = baidu.page.load,
		cache = self._cache = self._cache || {},
		parallel = options.parallel;
	
	function allLoadedChecker(){
		for(var i=0, len=resources.length; i < len; ++i){
            if(!cache[resources[i].url]){
            	return;
            }
		}
		options.onload();
	};
	
	function loadByDom(res, callback){
		var node, loaded;
		switch (res.type) {
			case "css" :
				node = document.createElement("link");
				node.setAttribute("rel", "stylesheet");
				node.setAttribute("type", "text/css");
				break;
			case "js" :
				node = document.createElement("script");
				node.setAttribute('type', 'text/javascript');
				node.charset = res.charset || 'UTF8';
				break;
			case "html" :
				node = document.createElement("iframe");
				node.frameBorder = "none";
				break;
			default :
				return;
		};
    	// HTML,JS works on all browsers, CSS works only on IE.
		node.onload = node.onreadystatechange = function() {
			if ( !loaded && (!this.readyState ||
					this.readyState === "loaded" || this.readyState === "complete") ) {
				loaded = true;
				// 防止内存泄露
				node.onload = node.onreadystatechange = null;
				callback.call(window, node);
			}
		};
		//CSS has no onload event on firefox and webkit platform, so hack it.
		if(res.type == 'css'){
			(function(){
				//避免重复加载
				if(loaded) return;
				try {
					node.sheet.cssRule;
				} catch (e) {
					setTimeout(arguments.callee, 20);
					return;
				}
				loaded = true;
				callback.call(window, node);
			})();
		}
		
		node.href = node.src = res.url;
		document.body.appendChild(node);
	}
	
	//兼容第一个参数直接是资源地址.
	typeof resources == 'string' &&	(resources = [{url: resources}]);
	
	//避免递归出错,添加容错.
	if(! (resources && resources.length)) return;
	
	baidu.each(resources,function(res){
		var url = res.url,
			shouldContinue = !!parallel,
			cacheData,
			callback = function(textOrNode){
				var next;
				//ajax存入responseText,dom存入节点,用于保证onload的正确执行.
				cache[res.url] = textOrNode;
				typeof res.onload == 'function' && (next = res.onload.call(window,textOrNode));
				if(next === false) return;
				//串行时递归执行,options在递归的时候,现有的两个可选参数都不需要,所以不传第二个参数.
				!parallel && self(resources.slice(1));
				typeof options.onload == 'function' && allLoadedChecker();
			};
		//默认用后缀名, 并防止后缀名大写
		res.type = (res.type || url.substr(url.lastIndexOf(".") + 1)).toLowerCase();
		//默认html格式用ajax请求,其他都使用dom标签方式请求.
		res.requestType = res.requestType || (res.type == "html" ? "ajax" : "dom");
		
		if(cacheData = cache[res.url]){
			callback.call(window, cacheData);
			return shouldContinue;
		}
		
		if(res.requestType.toLowerCase() == "dom"){
			loadByDom(res, callback);
		}else{//ajax
			baidu.ajax.get(res.url, function(xhr, responseText){callback(responseText);});
		}
		//串行模式,通过callback方法执行后续
		return shouldContinue;
	});
};











baidu.page.lazyLoadImage = function(options) {
    options = options || {};
    options.preloadHeight = options.preloadHeight || 0;

    baidu.dom.ready(function() {
        var imgs = document.getElementsByTagName('IMG'),
                targets = imgs,
                len = imgs.length,
                i = 0,
                viewOffset = getLoadOffset(),
                srcAttr = 'data-tangram-ori-src',
                target;
        //避免循环中每次都判断className
        if (options.className) {
            targets = [];
            for (; i < len; ++i) {
                if (baidu.dom.hasClass(imgs[i], options.className)) {
                    targets.push(imgs[i]);
                }
            }
        }
        //计算需要加载图片的页面高度
        function getLoadOffset() {
            return baidu.page.getScrollTop() + baidu.page.getViewHeight() + options.preloadHeight;
        }
        //加载可视图片
        for (i = 0, len = targets.length; i < len; ++i) {
            target = targets[i];
            if (baidu.dom.getPosition(target).top > viewOffset) {
                target.setAttribute(srcAttr, target.src);
                options.placeHolder ? target.src = options.placeHolder : target.removeAttribute('src');
            }
        }
        //处理延迟加载
        var loadNeeded = function() {
            var viewOffset = getLoadOffset(),
                imgSrc,
                finished = true,
                i = 0,
                len = targets.length;
            for (; i < len; ++i) {
                target = targets[i];
                imgSrc = target.getAttribute(srcAttr);
                imgSrc && (finished = false);
                if (baidu.dom.getPosition(target).top < viewOffset && imgSrc) {
                    target.src = imgSrc;
                    target.removeAttribute(srcAttr);
                    baidu.lang.isFunction(options.onlazyload) && options.onlazyload(target);
                }
            }
            //当全部图片都已经加载, 去掉事件监听
            finished && baidu.un(window, 'scroll', loadNeeded);
        };

        baidu.on(window, 'scroll', loadNeeded);
    });
};






(function() {
var isPlainObject = function(source) {
        return baidu.lang.isObject(source) && !baidu.lang.isFunction(source);
    };

function mergeItem(target, source, index, overwrite, recursive) {
    if (source.hasOwnProperty(index)) {
        if (recursive && isPlainObject(target[index])) {
            // 如果需要递归覆盖，就递归调用merge
            baidu.object.merge(
                target[index],
                source[index],
                {
                    'overwrite': overwrite,
                    'recursive': recursive
                }
            );
        } else if (overwrite || !(index in target)) {
            // 否则只处理overwrite为true，或者在目标对象中没有此属性的情况
            target[index] = source[index];
        }
    }
}

baidu.object.merge = function(target, source, opt_options) {
    var i = 0,
        options = opt_options || {},
        overwrite = options['overwrite'],
        whiteList = options['whiteList'],
        recursive = options['recursive'],
        len;

    // 只处理在白名单中的属性
    if (whiteList && whiteList.length) {
        len = whiteList.length;
        for (; i < len; ++i) {
            mergeItem(target, source, whiteList[i], overwrite, recursive);
        }
    } else {
        for (i in source) {
            mergeItem(target, source, i, overwrite, recursive);
        }
    }

    return target;
};
})();


