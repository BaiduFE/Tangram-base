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

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

/**
 * 声明baidu包
 * @author: allstar, erik, meizz, berg
 */
var T,
    baidu = T = baidu || {version: "1.3.7"}; 

//提出guid，防止在与老版本Tangram混用时
//在下一行错误的修改window[undefined]
baidu.guid = "$BAIDU$";

//Tangram可能被放在闭包中
//一些页面级别唯一的属性，需要挂载在window[baidu.guid]上
window[baidu.guid] = window[baidu.guid] || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/ajax.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/11/13
 */


/**
 * @namespace baidu.ajax 对XMLHttpRequest请求的封装。
*/
baidu.ajax = baidu.ajax || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: baidu/fn.js
 * author: berg
 * version: 1.0.0
 * date: 2010/11/02
 */


/**
 * @namespace baidu.fn 对方法的操作，解决内存泄露问题。
 */
baidu.fn = baidu.fn || {};
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */



/**
 * 这是一个空函数，用于需要排除函数作用域链干扰的情况.
 * @author rocy
 * @name baidu.fn.blank
 * @function
 * @grammar baidu.fn.blank()
 * @meta standard
 * @version 1.3.3
 */
baidu.fn.blank = function () {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 发送一个ajax请求
 * @author: allstar, erik, berg
 * @name baidu.ajax.request
 * @function
 * @grammar baidu.ajax.request(url[, options])
 * @param {string} 	url 发送请求的url
 * @param {Object} 	[options] 发送请求的选项参数
				
 * @config {String} 	[method] 			请求发送的类型。默认为GET
 * @config {Boolean}  [async] 			是否异步请求。默认为true（异步）
 * @config {String} 	[data] 				需要发送的数据。如果是GET请求的话，不需要这个属性
 * @config {Object} 	[headers] 			要设置的http request header
 * @config {number}   [timeout]       超时时间，单位ms
 * @config {String} 	[username] 			用户名
 * @config {String} 	[password] 			密码
 * @config {Function} [onsuccess] 		请求成功时触发，function(XMLHttpRequest xhr, string responseText)。
 * @config {Function} [onfailure] 		请求失败时触发，function(XMLHttpRequest xhr)。
 * @config {Function} [onbeforerequest]	发送请求之前触发，function(XMLHttpRequest xhr)。
 * @config {Function} [on{STATUS_CODE}] 	当请求为相应状态码时触发的事件，如on302、on404、on500，function(XMLHttpRequest xhr)。3XX的状态码浏览器无法获取，4xx的，可能因为未知问题导致获取失败。
 * @config {Boolean}  [noCache] 			是否需要缓存，默认为false（缓存），1.1.1起支持。
 * 
 * @meta standard
 * @see baidu.ajax.get,baidu.ajax.post,baidu.ajax.form
 *             
 * @returns {XMLHttpRequest} 发送请求的XMLHttpRequest对象
 */
baidu.ajax.request = function (url, options) {
	options = options || {};
    var data        = options.data || "",
        async       = !(options.async === false),
        username    = options.username || "",
        password    = options.password || "",
        method      = (options.method || "GET").toUpperCase(),
        headers     = options.headers || {},
        // 基本的逻辑来自lili同学提供的patch
        timeout     = options.timeout || 0,
        eventHandlers = {},
        tick, key, xhr;

    /**
     * readyState发生变更时调用
     * 
     * @ignore
     */
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
            
            /*
             * NOTE: Testing discovered that for some bizarre reason, on Mozilla, the
             * JavaScript <code>XmlHttpRequest.onreadystatechange</code> handler
             * function maybe still be called after it is deleted. The theory is that the
             * callback is cached somewhere. Setting it to null or an empty function does
             * seem to work properly, though.
             * 
             * On IE, there are two problems: Setting onreadystatechange to null (as
             * opposed to an empty function) sometimes throws an exception. With
             * particular (rare) versions of jscript.dll, setting onreadystatechange from
             * within onreadystatechange causes a crash. Setting it from within a timeout
             * fixes this bug (see issue 1610).
             * 
             * End result: *always* set onreadystatechange to an empty function (never to
             * null). Never set onreadystatechange from within onreadystatechange (always
             * in a setTimeout()).
             */
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
    
    /**
     * 获取XMLHttpRequest对象
     * 
     * @ignore
     * @return {XMLHttpRequest} XMLHttpRequest对象
     */
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
    
    /**
     * 触发事件
     * 
     * @ignore
     * @param {String} type 事件类型
     */
    function fire(type) {
        type = 'on' + type;
        var handler = eventHandlers[type],
            globelHandler = baidu.ajax[type];
        
        // 不对事件类型进行验证
        if (handler) {
            if (tick) {
              clearTimeout(tick);
            }

            if (type != 'onsuccess') {
                handler(xhr);
            } else {
                //处理获取xhr.responseText导致出错的情况,比如请求图片地址.
                try {
                    xhr.responseText;
                } catch(error) {
                    return handler(xhr);
                }
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
    
    headers['X-Requested-With'] = 'XMLHttpRequest';
    
    
    try {
        xhr = getXHR();
        
        if (method == 'GET') {
            if (data) {
                url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
                data = null;
            }
            if(options['noCache'])
                url += (url.indexOf('?') >= 0 ? '&' : '?') + 'b' + (+ new Date) + '=1';
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
        // FIXME 是否需要添加; charset=UTF-8呢
        if (method == 'POST') {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        
        for (key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }
        
        fire('beforerequest');

        if (timeout) {
          tick = setTimeout(function(){
            xhr.onreadystatechange = baidu.fn.blank;
            xhr.abort();
            fire("timeout");
          }, timeout);
        }
        xhr.send(data);
        
        if (!async) {
            stateChangeHandler();
        }
    } catch (ex) {
        fire('failure');
    }
    
    return xhr;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/ajax/get.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */




/**
 * 发送一个get请求
 * @name baidu.ajax.get
 * @function
 * @grammar baidu.ajax.get(url[, onsuccess])
 * @param {string} 	url 		发送请求的url地址
 * @param {Function} [onsuccess] 请求成功之后的回调函数，function(XMLHttpRequest xhr, string responseText)
 * @meta standard
 * @see baidu.ajax.post,baidu.ajax.request
 *             
 * @returns {XMLHttpRequest} 	发送请求的XMLHttpRequest对象
 */
baidu.ajax.get = function (url, onsuccess) {
    return baidu.ajax.request(url, {'onsuccess': onsuccess});
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/ajax/post.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */




/**
 * 发送一个post请求
 * @name baidu.ajax.post
 * @function
 * @grammar baidu.ajax.post(url, data[, onsuccess])
 * @param {string} 	url 		发送请求的url地址
 * @param {string} 	data 		发送的数据
 * @param {Function} [onsuccess] 请求成功之后的回调函数，function(XMLHttpRequest xhr, string responseText)
 * @meta standard
 * @see baidu.ajax.get,baidu.ajax.request
 *             
 * @returns {XMLHttpRequest} 	发送请求的XMLHttpRequest对象
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: baidu/array.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * @namespace baidu.array 操作数组的方法。
 */

baidu.array = baidu.array || {};

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/array/each.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * 遍历数组中所有元素
 * @name baidu.array.each
 * @function
 * @grammar baidu.array.each(source, iterator[, thisObject])
 * @param {Array} source 需要遍历的数组
 * @param {Function} iterator 对每个数组元素进行调用的函数，该函数有两个参数，第一个为数组元素，第二个为数组索引值，function (item, index)。
 * @param {Object} [thisObject] 函数调用时的this指针，如果没有此参数，默认是当前遍历的数组
 * @remark
 * each方法不支持对Object的遍历,对Object的遍历使用baidu.object.each 。
 * @shortcut each
 * @meta standard
 *             
 * @returns {Array} 遍历的数组
 */
 
baidu.each = baidu.array.forEach = baidu.array.each = function (source, iterator, thisObject) {
    var returnValue, item, i, len = source.length;
    
    if ('function' == typeof iterator) {
        for (i = 0; i < len; i++) {
            item = source[i];
            //TODO
            //此处实现和标准不符合，标准中是这样说的：
            //If a thisObject parameter is provided to forEach, it will be used as the this for each invocation of the callback. If it is not provided, or is null, the global object associated with callback is used instead.
            returnValue = iterator.call(thisObject || source, item, i);
    
            if (returnValue === false) {
                break;
            }
        }
    }
    return source;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 从数组中筛选符合条件的元素
 * @name baidu.array.filter
 * @function
 * @grammar baidu.array.filter(source, iterator[, thisObject])
 * @param {Array} source 需要筛选的数组
 * @param {Function} iterator 对每个数组元素进行筛选的函数，该函数有两个参数，第一个为数组元素，第二个为数组索引值，function (item, index)，函数需要返回true或false
 * @param {Object} [thisObject] 函数调用时的this指针，如果没有此参数，默认是当前遍历的数组
 * @meta standard
 * @see baidu.array.find
 *             
 * @returns {Array} 符合条件的数组项集合
 */

baidu.array.filter = function (source, iterator, thisObject) {
    var result = [],
        resultIndex = 0,
        len = source.length,
        item,
        i;
    
    if ('function' == typeof iterator) {
        for (i = 0; i < len; i++) {
            item = source[i];
            //TODO
            //和标准不符，see array.each
            if (true === iterator.call(thisObject || source, item, i)) {
                // resultIndex用于优化对result.length的多次读取
                result[resultIndex++] = item;
            }
        }
    }
    
    return result;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/array/remove.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/30
 */



/**
 * 移除数组中的项
 * @name baidu.array.remove
 * @function
 * @grammar baidu.array.remove(source, match)
 * @param {Array} source 需要移除项的数组
 * @param {Any|Function} match 要移除的项
 * @meta standard
 * @see baidu.array.removeAt
 *             
 * @returns {Array} 移除后的数组
 */
baidu.array.remove = function (source, match) {
    var len = source.length;
        
    while (len--) {
        if (len in source && source[len] === match) {
            source.splice(len, 1);
        }
    }
    return source;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/array/removeAt.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/30
 */



/**
 * 移除数组中的项
 * @name baidu.array.removeAt
 * @function
 * @grammar baidu.array.removeAt(source, index)
 * @param {Array} source 需要移除项的数组
 * @param {number} index 要移除项的索引位置
 * @see baidu.array.remove
 * @meta standard
 * @returns {Any} 被移除的数组项
 */
baidu.array.removeAt = function (source, index) {
    return source.splice(index, 1)[0];
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * @namespace baidu.browser 判断浏览器类型和特性的属性。
 */
baidu.browser = baidu.browser || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/firefox.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */



if (/firefox\/(\d+\.\d)/i.test(navigator.userAgent)) {
/**
 * 判断是否为firefox浏览器
 * @property firefox firefox版本号
 * @grammar baidu.browser.firefox
 * @meta standard
 * @see baidu.browser.ie,baidu.browser.safari,baidu.browser.opera,baidu.browser.chrome   
 */
    baidu.browser.firefox = + RegExp['\x241'];
}
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/ie.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */


if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
    //IE 8下，以documentMode为准
    //在百度模板中，可能会有$，防止冲突，将$1 写成 \x241
/**
 * 判断是否为ie浏览器
 * @property ie ie版本号
 * @grammar baidu.browser.ie
 * @meta standard
 * @shortcut ie
 * @see baidu.browser.firefox,baidu.browser.safari,baidu.browser.opera,baidu.browser.chrome,baidu.browser.maxthon 
 */
   baidu.browser.ie = baidu.ie = document.documentMode || + RegExp['\x241'];
}
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/isGecko.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */



/**
 * 判断是否为gecko内核
 * @property isGecko 
 * @grammar baidu.browser.isGecko
 * @meta standard
 * @see baidu.browser.isWebkit
 */
baidu.browser.isGecko = /gecko/i.test(navigator.userAgent) && !/like gecko/i.test(navigator.userAgent);
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/isStrict.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */



/**
 * 判断是否严格标准的渲染模式
 * @property isStrict 
 * @grammar baidu.browser.isStrict
 * @meta standard
 */
baidu.browser.isStrict = document.compatMode == "CSS1Compat";
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/isWebkit.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */



/**
 * 判断是否为webkit内核
 * @property isWebkit 
 * @grammar baidu.browser.isWebkit
 * @meta standard
 * @see baidu.browser.isGecko
 */
baidu.browser.isWebkit = /webkit/i.test(navigator.userAgent);
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/opera.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */



if (/opera\/(\d+\.\d)/i.test(navigator.userAgent)) {
/**
 * 判断是否为opera浏览器
 * @property opera opera版本号
 * @grammar baidu.browser.opera
 * @meta standard
 * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.safari,baidu.browser.chrome 
 */
    baidu.browser.opera = + RegExp['\x241'];
}
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/safari.js
 * author: allstar, rocy
 * version: 1.1.0
 * date: 2009/11/23
 */



(function(){
    var ua = navigator.userAgent;
    /*
     * 兼容浏览器为safari或ipad,其中,一段典型的ipad UA 如下:
     * Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10
     */
    if(/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua)){
        /**
         * 判断是否为safari浏览器, 支持ipad
         * @property safari safari版本号
         * @grammar baidu.browser.safari
         * @meta standard
         * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.opera,baidu.browser.chrome   
         */
    	baidu.browser.safari = + (RegExp['\x241'] || RegExp['\x242']);
    }
})();
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/cookie.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/02
 */


/**
 * @namespace baidu.cookie 操作cookie的方法。
 */
baidu.cookie = baidu.cookie || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/cookie/_isValidKey.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */



/**
 * 验证字符串是否合法的cookie键名
 * 
 * @param {string} source 需要遍历的数组
 * @meta standard
 * @return {boolean} 是否合法的cookie键名
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/cookie/getRaw.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */



/**
 * 获取cookie的值，不对值进行解码
 * @name baidu.cookie.getRaw
 * @function
 * @grammar baidu.cookie.getRaw(key)
 * @param {string} key 需要获取Cookie的键名
 * @meta standard
 * @see baidu.cookie.get,baidu.cookie.setRaw
 *             
 * @returns {string|null} 获取的Cookie值，获取不到时返回null
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/cookie/get.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */



/**
 * 获取cookie的值，用decodeURIComponent进行解码
 * @name baidu.cookie.get
 * @function
 * @grammar baidu.cookie.get(key)
 * @param {string} key 需要获取Cookie的键名
 * @remark
 * <b>注意：</b>该方法会对cookie值进行decodeURIComponent解码。如果想获得cookie源字符串，请使用getRaw方法。
 * @meta standard
 * @see baidu.cookie.getRaw,baidu.cookie.set
 *             
 * @returns {string|null} cookie的值，获取不到时返回null
 */
baidu.cookie.get = function (key) {
    var value = baidu.cookie.getRaw(key);
    if ('string' == typeof value) {
        value = decodeURIComponent(value);
        return value;
    }
    return null;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/cookie/setRaw.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */



/**
 * 设置cookie的值，不对值进行编码
 * @name baidu.cookie.setRaw
 * @function
 * @grammar baidu.cookie.setRaw(key, value[, options])
 * @param {string} key 需要设置Cookie的键名
 * @param {string} value 需要设置Cookie的值
 * @param {Object} [options] 设置Cookie的其他可选参数
 * @config {string} [path] cookie路径
 * @config {Date|number} [expires] cookie过期时间,如果类型是数字的话, 单位是毫秒
 * @config {string} [domain] cookie域名
 * @config {string} [secure] cookie是否安全传输
 * @remark
 * 
<b>options参数包括：</b><br>
path:cookie路径<br>
expires:cookie过期时间，Number型，单位为毫秒。<br>
domain:cookie域名<br>
secure:cookie是否安全传输
		
 * @meta standard
 * @see baidu.cookie.set,baidu.cookie.getRaw
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/cookie/remove.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */



/**
 * 删除cookie的值
 * @name baidu.cookie.remove
 * @function
 * @grammar baidu.cookie.remove(key, options)
 * @param {string} key 需要删除Cookie的键名
 * @param {Object} options 需要删除的cookie对应的 path domain 等值
 * @meta standard
 */
baidu.cookie.remove = function (key, options) {
    options = options || {};
    options.expires = new Date(0);
    baidu.cookie.setRaw(key, '', options);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/cookie/set.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */



/**
 * 设置cookie的值，用encodeURIComponent进行编码
 * @name baidu.cookie.set
 * @function
 * @grammar baidu.cookie.set(key, value[, options])
 * @param {string} key 需要设置Cookie的键名
 * @param {string} value 需要设置Cookie的值
 * @param {Object} [options] 设置Cookie的其他可选参数
 * @config {string} [path] cookie路径
 * @config {Date|number} [expires] cookie过期时间,如果类型是数字的话, 单位是毫秒
 * @config {string} [domain] cookie域名
 * @config {string} [secure] cookie是否安全传输
 * @remark
 * 
1. <b>注意：</b>该方法会对cookie值进行encodeURIComponent编码。如果想设置cookie源字符串，请使用setRaw方法。<br><br>
2. <b>options参数包括：</b><br>
path:cookie路径<br>
expires:cookie过期时间，Number型，单位为毫秒。<br>
domain:cookie域名<br>
secure:cookie是否安全传输
		
 * @meta standard
 * @see baidu.cookie.setRaw,baidu.cookie.get
 */
baidu.cookie.set = function (key, value, options) {
    baidu.cookie.setRaw(key, encodeURIComponent(value), options);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */


/**
 * @namespace baidu.dom 操作dom的方法。
 */
baidu.dom = baidu.dom || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_NAME_ATTRS.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/2
 */




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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/02
 */


/**
 * @namespace baidu.lang 对语言层面的封装，包括类型判断、模块扩展、继承基类以及对象自定义事件的支持。
*/
baidu.lang = baidu.lang || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/isString.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/30
 */



/**
 * 判断目标参数是否string类型或String对象
 * @name baidu.lang.isString
 * @function
 * @grammar baidu.lang.isString(source)
 * @param {Any} source 目标参数
 * @shortcut isString
 * @meta standard
 * @see baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isElement,baidu.lang.isBoolean,baidu.lang.isDate
 *             
 * @returns {boolean} 类型判断结果
 */
baidu.lang.isString = function (source) {
    return '[object String]' == Object.prototype.toString.call(source);
};

// 声明快捷方法
baidu.isString = baidu.lang.isString;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/g.js
 * author: allstar, erik, berg
 * version: 1.3
 * date: 2010-07-07
 */




/**
 * 从文档中获取指定的DOM元素
 * **内部方法**
 * 
 * @param {string|HTMLElement} id 元素的id或DOM元素
 * @meta standard
 * @return {HTMLElement} DOM元素，如果不存在，返回null，如果参数不合法，直接返回参数
 */
baidu.dom._g = function (id) {
    if (baidu.lang.isString(id)) {
        return document.getElementById(id);
    }
    return id;
};

// 声明快捷方法
baidu._g = baidu.dom._g;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/g.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/11/17
 */



/**
 * 从文档中获取指定的DOM元素
 * @name baidu.dom.g
 * @function
 * @grammar baidu.dom.g(id)
 * @param {string|HTMLElement} id 元素的id或DOM元素
 * @shortcut g,T.G
 * @meta standard
 * @see baidu.dom.q
 *             
 * @returns {HTMLElement|null} 获取的元素，查找不到时返回null,如果参数不合法，直接返回参数
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_matchNode.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/18
 */




/**
 * 从目标元素指定的方向搜索元素
 *
 * @param {HTMLElement|string} element   目标元素或目标元素的id
 * @param {string}             direction 遍历的方向名称，取值为previousSibling,nextSibling
 * @param {string}             start     遍历的开始位置，取值为firstChild,lastChild,previousSibling,nextSibling
 * @meta standard
 * @return {HTMLElement} 搜索到的元素，如果没有找到，返回 null
 */
baidu.dom._matchNode = function (element, direction, start) {
    element = baidu.dom.g(element);

    for (var node = element[start]; node; node = node[direction]) {
        if (node.nodeType == 1) {
            return node;
        }
    }

    return null;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_styleFilters.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * 提供给setStyle与getStyle使用
 */
baidu.dom._styleFilter = baidu.dom._styleFilter || [];

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_styleFilter/color.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * 提供给setStyle与getStyle使用
 * @meta standard
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_styleFilter/filter.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * 为获取和设置样式的过滤器
 * @private
 * @meta standard
 */
baidu.dom._styleFilter.filter = function (key, value, method) {
    for (var i = 0, filters = baidu.dom._styleFilter, filter; filter = filters[i]; i++) {
        if (filter = filter[method]) {
            value = filter(key, value);
        }
    }

    return value;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_styleFilter/px.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * 提供给setStyle与getStyle使用
 * @meta standard
 */
baidu.dom._styleFilter[baidu.dom._styleFilter.length] = {
    set: function (key, value) {
        if (value.constructor == Number 
            && !/zIndex|fontWeight|opacity|zoom|lineHeight/i.test(key)){
            value = value + "px";
        }

        return value;
    }
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_styleFixer.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */



/**
 * 提供给setStyle与getStyle使用
 */
baidu.dom._styleFixer = baidu.dom._styleFixer || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_styleFixer/display.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/24
 */





/**
 * 提供给setStyle与getStyle使用
 * @meta standard
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All right reserved.
 * 
 * path: baidu/dom/_styleFixer/float.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */



/**
 * 提供给setStyle与getStyle使用
 * @meta standard
 */
baidu.dom._styleFixer["float"] = baidu.browser.ie ? "styleFloat" : "cssFloat";
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_styleFixer/opacity.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */




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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */


/**
 * @namespace baidu.string 操作字符串的方法。
 */
baidu.string = baidu.string || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/trim.js
 * author: dron, erik
 * version: 1.1.0
 * date: 2009/11/15
 */



/**
 * 删除目标字符串两端的空白字符
 * @name baidu.string.trim
 * @function
 * @grammar baidu.string.trim(source)
 * @param {string} source 目标字符串
 * @remark
 * 不支持删除单侧空白字符
 * @shortcut trim
 * @meta standard
 *             
 * @returns {string} 删除两端空白字符后的字符串
 */

(function () {
    var trimer = new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g");
    
    baidu.string.trim = function (source) {
        return String(source)
                .replace(trimer, "");
    };
})();

// 声明快捷方法
baidu.trim = baidu.string.trim;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All right reserved.
 * 
 * path: baidu/dom/addClass.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/2
 */




/**
 * 为目标元素添加className
 * @name baidu.dom.addClass
 * @function
 * @grammar baidu.dom.addClass(element, className)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} className 要添加的className，允许同时添加多个class，中间使用空白符分隔
 * @remark
 * 使用者应保证提供的className合法性，不应包含不合法字符，className合法字符参考：http://www.w3.org/TR/CSS2/syndata.html。
 * @shortcut addClass
 * @meta standard
 * @see baidu.dom.removeClass
 * 	
 * 	            
 * @returns {HTMLElement} 目标元素
 */
baidu.dom.addClass = function (element, className) {
    element = baidu.dom.g(element);
    var classArray = className.split(/\s+/),
        result = element.className,
        classMatch = " " + result + " ",
        i = 0,
        l = classArray.length;

    for (; i < l; i++){
         if ( classMatch.indexOf( " " + classArray[i] + " " ) < 0 ) {
             result += (result ? ' ' : '') + classArray[i];
         }
    }

    element.className = result;
    return element;
};

// 声明快捷方法
baidu.addClass = baidu.dom.addClass;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/children.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */




/**
 * 获取目标元素的直接子元素列表
 * @name baidu.dom.children
 * @function
 * @grammar baidu.dom.children(element)
 * @param {HTMLElement|String} element 目标元素或目标元素的id
 * @meta standard
 *             
 * @returns {Array} 目标元素的子元素列表，没有子元素时返回空数组
 */
baidu.dom.children = function (element) {
    element = baidu.dom.g(element);

    for (var children = [], tmpEl = element.firstChild; tmpEl; tmpEl = tmpEl.nextSibling) {
        if (tmpEl.nodeType == 1) {
            children.push(tmpEl);
        }
    }
    
    return children;    
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/contains.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */



/**
 * 判断一个元素是否包含另一个元素
 * @name baidu.dom.contains
 * @function
 * @grammar baidu.dom.contains(container, contained)
 * @param {HTMLElement|string} container 包含元素或元素的id
 * @param {HTMLElement|string} contained 被包含元素或元素的id
 * @meta standard
 * @see baidu.dom.intersect
 *             
 * @returns {boolean} contained元素是否被包含于container元素的DOM节点上
 */
baidu.dom.contains = function (container, contained) {

    var g = baidu.dom._g;
    container = g(container);
    contained = g(contained);

    //fixme: 无法处理文本节点的情况(IE)
    return container.contains
        ? container != contained && container.contains(contained)
        : !!(container.compareDocumentPosition(contained) & 16);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/setAttr.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */




/**
 * 设置目标元素的attribute值
 * @name baidu.dom.setAttr
 * @function
 * @grammar baidu.dom.setAttr(element, key, value)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} key 要设置的attribute键名
 * @param {string} value 要设置的attribute值
 * @remark
 * 
            设置object的自定义属性时，由于浏览器限制，无法设置。
        
 * @shortcut setAttr
 * @meta standard
 * @see baidu.dom.getAttr,baidu.dom.setAttrs
 *             
 * @returns {HTMLElement} 目标元素
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/setAttrs.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */




/**
 * 批量设置目标元素的attribute值
 * @name baidu.dom.setAttrs
 * @function
 * @grammar baidu.dom.setAttrs(element, attributes)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {Object} attributes 要设置的attribute集合
 * @shortcut setAttrs
 * @meta standard
 * @see baidu.dom.setAttr,baidu.dom.getAttr
 *             
 * @returns {HTMLElement} 目标元素
 */
baidu.dom.setAttrs = function (element, attributes) {
    element = baidu.dom.g(element);

    for (var key in attributes) {
        baidu.dom.setAttr(element, key, attributes[key]);
    }

    return element;
};

// 声明快捷方法
baidu.setAttrs = baidu.dom.setAttrs;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All right reserved.
 */


/**
 * 创建 Element 对象。
 * @author berg
 * @name baidu.dom.create
 * @function
 * @grammar baidu.dom.create(tagName[, options])
 * @param {string} tagName 标签名称.
 * @param {Object} opt_attributes 元素创建时拥有的属性，如style和className.
 * @version 1.3
 * @meta standard
 * @return {HTMLElement} 创建的 Element 对象
 */
baidu.dom.create = function(tagName, opt_attributes) {
    var el = document.createElement(tagName),
        attributes = opt_attributes || {};
    return baidu.dom.setAttrs(el, attributes);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/first.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/11/18
 */



/**
 * 获取目标元素的第一个元素节点
 * @name baidu.dom.first
 * @function
 * @grammar baidu.dom.first(element)
 * @param {HTMLElement|String} element 目标元素或目标元素的id
 * @see baidu.dom.last,baidu.dom.prev,baidu.dom.next
 * @meta standard
 * @returns {HTMLElement|null} 目标元素的第一个元素节点，查找不到时返回null
 */
baidu.dom.first = function (element) {
    return baidu.dom._matchNode(element, 'nextSibling', 'firstChild');
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getAttr.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */




/**
 * 获取目标元素的属性值
 * @name baidu.dom.getAttr
 * @function
 * @grammar baidu.dom.getAttr(element, key)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} key 要获取的attribute键名
 * @shortcut getAttr
 * @meta standard
 * @see baidu.dom.setAttr,baidu.dom.setAttrs
 *             
 * @returns {string|null} 目标元素的attribute值，获取不到时返回null
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getDocument.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */



/**
 * 获取目标元素所属的document对象
 * @name baidu.dom.getDocument
 * @function
 * @grammar baidu.dom.getDocument(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @meta standard
 * @see baidu.dom.getWindow
 *             
 * @returns {HTMLDocument} 目标元素所属的document对象
 */
baidu.dom.getDocument = function (element) {
    element = baidu.dom.g(element);
    return element.nodeType == 9 ? element : element.ownerDocument || element.document;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */





/**
 * 获取目标元素的computed style值。如果元素的样式值不能被浏览器计算，则会返回空字符串（IE）
 *
 * @author berg
 * @name baidu.dom.getComputedStyle
 * @function
 * @grammar baidu.dom.getComputedStyle(element, key)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} key 要获取的样式名
 *
 * @see baidu.dom.getStyle
 *             
 * @returns {string} 目标元素的computed style值
 */

baidu.dom.getComputedStyle = function(element, key){
    element = baidu.dom._g(element);
    var doc = baidu.dom.getDocument(element),
        styles;
    if (doc.defaultView && doc.defaultView.getComputedStyle) {
        styles = doc.defaultView.getComputedStyle(element, null);
        if (styles) {
            return styles[key] || styles.getPropertyValue(key);
        }
    }
    return ''; 
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/toCamelCase.js
 * author: erik, berg
 * version: 1.2
 * date: 2010-06-22
 */



/**
 * 将目标字符串进行驼峰化处理
 * @name baidu.string.toCamelCase
 * @function
 * @grammar baidu.string.toCamelCase(source)
 * @param {string} source 目标字符串
 * @remark
 * 支持单词以“-_”分隔
 * @meta standard
 *             
 * @returns {string} 驼峰化处理后的字符串
 */
 
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */







/**
 * 获取目标元素的样式值
 * @name baidu.dom.getStyle
 * @function
 * @grammar baidu.dom.getStyle(element, key)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} key 要获取的样式名
 * @remark
 * 
 * 为了精简代码，本模块默认不对任何浏览器返回值进行归一化处理（如使用getStyle时，不同浏览器下可能返回rgb颜色或hex颜色），也不会修复浏览器的bug和差异性（如设置IE的float属性叫styleFloat，firefox则是cssFloat）。<br />
 * baidu.dom._styleFixer和baidu.dom._styleFilter可以为本模块提供支持。<br />
 * 其中_styleFilter能对颜色和px进行归一化处理，_styleFixer能对display，float，opacity，textOverflow的浏览器兼容性bug进行处理。	
 * @shortcut getStyle
 * @meta standard
 * @see baidu.dom.setStyle,baidu.dom.setStyles, baidu.dom.getComputedStyle
 *             
 * @returns {string} 目标元素的样式值
 */
// TODO
// 1. 无法解决px/em单位统一的问题（IE）
// 2. 无法解决样式值为非数字值的情况（medium等 IE）
baidu.dom.getStyle = function (element, key) {
    var dom = baidu.dom;

    element = dom.g(element);
    key = baidu.string.toCamelCase(key);
    //computed style, then cascaded style, then explicitly set style.
    var value = element.style[key] ||
                (element.currentStyle ? element.currentStyle[key] : "") || 
                dom.getComputedStyle(element, key);

    // 在取不到值的时候，用fixer进行修正
    if (!value) {
        var fixer = dom._styleFixer[key];
        if(fixer){
            value = fixer.get ? fixer.get(element) : baidu.dom.getStyle(element, fixer);
        }
    }
    
    /* 检查结果过滤器 */
    if (fixer = dom._styleFilter) {
        value = fixer.filter(key, value, 'get');
    }

    return value;
};

// 声明快捷方法
baidu.getStyle = baidu.dom.getStyle;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getPosition.js
 * author: berg
 * version: 1.2.0
 * date: 2010/12/16
 *
 * thanks google closure & jquery
 * 本函数部分思想来自：http://code.google.com/p/doctype/wiki/ArticlePageOffset
 */










/**
 * 获取目标元素相对于整个文档左上角的位置
 * @name baidu.dom.getPosition
 * @function
 * @grammar baidu.dom.getPosition(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @meta standard
 *             
 * @returns {Object} 目标元素的位置，键值为top和left的Object。
 */
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
    /*
     * 因为firefox 3.6和4.0在特定页面下(场景待补充)都会出现1px偏移,所以暂时移除该逻辑分支
     * 如果 2.0版本时firefox仍存在问题,该逻辑分支将彻底移除. by rocy 2011-01-20
    } else if (doc.getBoxObjectFor && !BUGGY_GECKO_BOX_OBJECT){ // gecko 1.9-

        // 1.9以下的Gecko，会忽略ancestors的scroll值
        // https://bugzilla.mozilla.org/show_bug.cgi?id=328881 and
        // https://bugzilla.mozilla.org/show_bug.cgi?id=330619

        box = doc.getBoxObjectFor(element);
        var vpBox = doc.getBoxObjectFor(viewport);
        pos.left = box.screenX - vpBox.screenX;
        pos.top  = box.screenY - vpBox.screenY;
        */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/hasClass.js
 * author: berg
 * version: 1.0
 * date: 2010-07-06
 */






/**
 * 判断元素是否拥有指定的className
 * @name baidu.dom.hasClass
 * @function
 * @grammar baidu.dom.hasClass(element, className)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} className 要判断的className，可以是用空格拼接的多个className
 * @version 1.2
 * @remark
 * 对于参数className，支持空格分隔的多个className
 * @see baidu.dom.addClass, baidu.dom.removeClass
 * @meta standard
 * @returns {Boolean} 是否拥有指定的className，如果要查询的classname有一个或多个不在元素的className中，返回false
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/hide.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */



/**
 * 隐藏目标元素
 * @name baidu.dom.hide
 * @function
 * @grammar baidu.dom.hide(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @shortcut hide
 * @meta standard
 * @see baidu.dom.show,baidu.dom.toggle
 *             
 * @returns {HTMLElement} 目标元素
 */
baidu.dom.hide = function (element) {
    element = baidu.dom.g(element);
    element.style.display = "none";

    return element;
};

// 声明快捷方法
baidu.hide = baidu.dom.hide;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/insertAfter.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * 将目标元素添加到基准元素之后
 * @name baidu.dom.insertAfter
 * @function
 * @grammar baidu.dom.insertAfter(newElement, existElement)
 * @param {HTMLElement|string} newElement 被添加的目标元素
 * @param {HTMLElement|string} existElement 基准元素
 * @meta standard
 * @see baidu.dom.insertBefore
 *             
 * @returns {HTMLElement} 被添加的目标元素
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/insertBefore.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/11/17
 */



/**
 * 将目标元素添加到基准元素之前
 * @name baidu.dom.insertBefore
 * @function
 * @grammar baidu.dom.insertBefore(newElement, existElement)
 * @param {HTMLElement|string} newElement 被添加的目标元素
 * @param {HTMLElement|string} existElement 基准元素
 * @meta standard
 * @see baidu.dom.insertAfter
 *             
 * @returns {HTMLElement} 被添加的目标元素
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/insertHTML.js
 * author: allstar, erik, berg,wenyuxiang,lixiaopeng
 * version: 1.1.2
 * date: 2010-07-13
 */



/**
 * 在目标元素的指定位置插入HTML代码
 * @name baidu.dom.insertHTML
 * @function
 * @grammar baidu.dom.insertHTML(element, position, html)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} position 插入html的位置信息，取值为beforeBegin,afterBegin,beforeEnd,afterEnd
 * @param {string} html 要插入的html
 * @remark
 * 
 * 对于position参数，大小写不敏感<br>
 * 参数的意思：beforeBegin&lt;span&gt;afterBegin   this is span! beforeEnd&lt;/span&gt; afterEnd <br />
 * 此外，如果使用本函数插入带有script标签的HTML字符串，script标签对应的脚本将不会被执行。
 * 
 * @shortcut insertHTML
 * @meta standard
 *             
 * @returns {HTMLElement} 目标元素
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/next.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/18
 */



/**
 * 获取目标元素的下一个兄弟元素节点
 * @name baidu.dom.next
 * @function
 * @grammar baidu.dom.next(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @see baidu.dom.first,baidu.dom.last,baidu.dom.prev
 * @meta standard
 * @returns {HTMLElement|null} 目标元素的下一个兄弟元素节点，查找不到时返回null
 */
baidu.dom.next = function (element) {
    return baidu.dom._matchNode(element, 'nextSibling', 'nextSibling');
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/escapeReg.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */



/**
 * 将目标字符串中可能会影响正则表达式构造的字符串进行转义。
 * @name baidu.string.escapeReg
 * @function
 * @grammar baidu.string.escapeReg(source)
 * @param {string} source 目标字符串
 * @remark
 * 给以下字符前加上“\”进行转义：.*+?^=!:${}()|[]/\
 * @meta standard
 *             
 * @returns {string} 转义后的字符串
 */
baidu.string.escapeReg = function (source) {
    return String(source)
            .replace(new RegExp("([.*+?^=!:\x24{}()|[\\]\/\\\\])", "g"), '\\\x241');
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/q.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */





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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */






/**
 * 使函数在页面dom节点加载完毕时调用
 * @author allstar
 * @name baidu.dom.ready
 * @function
 * @grammar baidu.dom.ready(callback)
 * @param {Function} callback 页面加载完毕时调用的函数.
 * @remark
 * 如果有条件将js放在页面最底部, 也能达到同样效果，不必使用该方法。
 * @meta standard
 */
(function() {

    var ready = baidu.dom.ready = function() {
        var readyBound = false,
            readyList = [];

        function ready() {
            if (!ready.isReady) {
                ready.isReady = true;
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
                doc.addEventListener('DOMContentLoaded', opera ? function() {
                    if (ready.isReady) {
                        return;
                    }
                    for (var i = 0; i < doc.styleSheets.length; i++) {
                        if (doc.styleSheets[i].disabled) {
                            setTimeout(arguments.callee, 0);
                            return;
                        }
                    }
                    // and execute any waiting functions
                    ready();
                } : ready, false);
            } else if (baidu.browser.ie && w == top) {
                // If IE is used and is not in a frame
                // Continually check to see if the doc is ready
                (function() {
                    if (ready.isReady) {
                        return;
                    }

                    try {
                        // If IE is used, use the trick by Diego Perini
                        // http://javascript.nwbox.com/IEContentLoaded/
                        doc.documentElement.doScroll('left');
                    } catch (error) {
                        setTimeout(arguments.callee, 0);
                        return;
                    }
                    // and execute any waiting functions
                    ready();
                })();
            } else if (baidu.browser.safari) {
                var numStyles;
                (function() {
                    if (ready.isReady) {
                        return;
                    }
                    if (doc.readyState != 'loaded' && doc.readyState != 'complete') {
                        setTimeout(arguments.callee, 0);
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
                            for (var i = 0, j = s2.length; i < j; i++) {
                                if (s2[i].getAttribute('rel') == 'stylesheet') {
                                    numStyles++;
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
            w.attachEvent ? w.attachEvent('onload', ready) : w.addEventListener('load', ready, false);
        }

        bindReady();

        return function(callback) {
            ready.isReady ? callback() : (readyList[readyList.length] = callback);
        };
    }();

    ready.isReady = false;
})();
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/remove.js
 * author: allstar,berg
 * version: 1.1.0
 * date: 2009/11/17
 */




/**
 * 从DOM树上移除目标元素
 * @name baidu.dom.remove
 * @function
 * @grammar baidu.dom.remove(element)
 * @param {HTMLElement|string} element 需要移除的元素或元素的id
 * @remark
 * <b>注意：</b>对于移除的dom元素，IE下会释放该元素的空间，继续使用该元素的引用进行操作将会引发不可预料的问题。
 * @meta standard
 */
baidu.dom.remove = function (element) {
    element = baidu.dom._g(element);
	var tmpEl = element.parentNode;
    //去掉了对ie下的特殊处理：创建一个div，appendChild，然后div.innerHTML = ""
    tmpEl && tmpEl.removeChild(element);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/removeClass.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */




/**
 * 移除目标元素的className
 * @name baidu.dom.removeClass
 * @function
 * @grammar baidu.dom.removeClass(element, className)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} className 要移除的className，允许同时移除多个class，中间使用空白符分隔
 * @remark
 * 使用者应保证提供的className合法性，不应包含不合法字符，className合法字符参考：http://www.w3.org/TR/CSS2/syndata.html。
 * @shortcut removeClass
 * @meta standard
 * @see baidu.dom.addClass
 *             
 * @returns {HTMLElement} 目标元素
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/setStyle.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/18
 */






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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/setStyles.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/18
 */




/**
 * 批量设置目标元素的style样式值
 * @name baidu.dom.setStyles
 * @function
 * @grammar baidu.dom.setStyles(element, styles)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {Object} styles 要设置的样式集合
 * @shortcut setStyles
 * @meta standard
 * @see baidu.dom.setStyle,baidu.dom.getStyle
 *             
 * @returns {HTMLElement} 目标元素
 */
baidu.dom.setStyles = function (element, styles) {
    element = baidu.dom.g(element);

    for (var key in styles) {
        baidu.dom.setStyle(element, key, styles[key]);
    }

    return element;
};

// 声明快捷方法
baidu.setStyles = baidu.dom.setStyles;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 显示目标元素，即将目标元素的display属性还原成默认值。默认值可能在stylesheet中定义，或者是继承了浏览器的默认样式值
 * @author allstar, berg
 * @name baidu.dom.show
 * @function
 * @grammar baidu.dom.show(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @remark
 * 注意1：如果在CSS中定义此元素的样式为display:none
 * 在调用本函数以后，会将display属性仍然还原成none，元素仍然无法显示。
 * 注意2：如果这个元素的display属性被设置成inline
 * （由element.style.display或者HTML中的style属性设置）
 * 调用本方法将清除此inline属性，导致元素的display属性变成继承值
 * 因此，针对上面两种情况，建议使用dom.setStyle("display", "something")
 * 来明确指定要设置的display属性值。
 * 
 * @shortcut show
 * @meta standard
 * @see baidu.dom.hide,baidu.dom.toggle
 *             
 * @returns {HTMLElement} 目标元素
 */
baidu.dom.show = function (element) {
    element = baidu.dom.g(element);
    element.style.display = "";

    return element;
};

// 声明快捷方法
baidu.show = baidu.dom.show;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/toggle.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */



/**
 * 改变目标元素的显示/隐藏状态
 * @name baidu.dom.toggle
 * @function
 * @grammar baidu.dom.toggle(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @meta standard
 * @see baidu.dom.show,baidu.dom.hide
 *             
 * @returns {HTMLElement} 目标元素
 */
baidu.dom.toggle = function (element) {
    element = baidu.dom.g(element);
    element.style.display = element.style.display == "none" ? "" : "none";

    return element;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * @namespace baidu.event 屏蔽浏览器差异性的事件封装。
 * @property target 	事件的触发元素
 * @property pageX 		鼠标事件的鼠标x坐标
 * @property pageY 		鼠标事件的鼠标y坐标
 * @property keyCode 	键盘事件的键值
 */
baidu.event = baidu.event || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/EventArg.js
 * author: erik
 * version: 1.1.0
 * date: 2010/01/11
 */



/**
 * 事件对象构造器，屏蔽浏览器差异的事件类
 * @name baidu.event.EventArg
 * @function
 * @grammar baidu.event.EventArg(event[, win])
 * @param {Event}   event   事件对象
 * @param {Window}  [win]	窗口对象，默认为window
 * @meta standard
 * @remark 1.1.0开始支持
 * @see baidu.event.get
 * @constructor
 */
baidu.event.EventArg = function (event, win) {
    win = win || window;
    event = event || win.event;
    var doc = win.document;
    
    this.target = /** @type {Node} */ (event.target) || event.srcElement;
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

/**
 * 阻止事件的默认行为
 * @name preventDefault
 * @grammar eventArgObj.preventDefault()
 * @returns {baidu.event.EventArg} EventArg对象
 */
baidu.event.EventArg.prototype.preventDefault = function () {
    if (this._event.preventDefault) {
        this._event.preventDefault();
    } else {
        this._event.returnValue = false;
    }
    return this;
};

/**
 * 停止事件的传播
 * @name stopPropagation
 * @grammar eventArgObj.stopPropagation()
 * @returns {baidu.event.EventArg} EventArg对象
 */
baidu.event.EventArg.prototype.stopPropagation = function () {
    if (this._event.stopPropagation) {
        this._event.stopPropagation();
    } else {
        this._event.cancelBubble = true;
    }
    return this;
};

/**
 * 停止事件
 * @name stop
 * @grammar eventArgObj.stop()
 * @returns {baidu.event.EventArg} EventArg对象
 */
baidu.event.EventArg.prototype.stop = function () {
    return this.stopPropagation().preventDefault();
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/_listeners.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/23
 */



/**
 * 事件监听器的存储表
 * @private
 * @meta standard
 */
baidu.event._listeners = baidu.event._listeners || [];
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/get.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/23
 */



/**
 * 获取扩展的EventArg对象
 * @name baidu.event.get
 * @function
 * @grammar baidu.event.get(event[, win])
 * @param {Event} event 事件对象
 * @param {window} [win] 触发事件元素所在的window
 * @meta standard
 * @see baidu.event.EventArg
 *             
 * @returns {EventArg} 扩展的事件对象
 */
baidu.event.get = function (event, win) {
    return new baidu.event.EventArg(event, win);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/getTarget.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/17
 */



/**
 * 获取事件的触发元素
 * @name baidu.event.getTarget
 * @function
 * @grammar baidu.event.getTarget(event)
 * @param {Event} event 事件对象
 * @meta standard
 * @returns {HTMLElement} 事件的触发元素
 */
 
baidu.event.getTarget = function (event) {
    return event.target || event.srcElement;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/on.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/16
 */




/**
 * 为目标元素添加事件监听器
 * @name baidu.event.on
 * @function
 * @grammar baidu.event.on(element, type, listener)
 * @param {HTMLElement|string|window} element 目标元素或目标元素id
 * @param {string} type 事件类型
 * @param {Function} listener 需要添加的监听器
 * @remark
 * 
1. 不支持跨浏览器的鼠标滚轮事件监听器添加<br>
2. 改方法不为监听器灌入事件对象，以防止跨iframe事件挂载的事件对象获取失败
    
 * @shortcut on
 * @meta standard
 * @see baidu.event.un
 *             
 * @returns {HTMLElement|window} 目标元素
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/preventDefault.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/23
 */



/**
 * 阻止事件的默认行为
 * @name baidu.event.preventDefault
 * @function
 * @grammar baidu.event.preventDefault(event)
 * @param {Event} event 事件对象
 * @meta standard
 * @see baidu.event.stop,baidu.event.stopPropagation
 */
baidu.event.preventDefault = function (event) {
   if (event.preventDefault) {
       event.preventDefault();
   } else {
       event.returnValue = false;
   }
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/un.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/16
 */




/**
 * 为目标元素移除事件监听器
 * @name baidu.event.un
 * @function
 * @grammar baidu.event.un(element, type, listener)
 * @param {HTMLElement|string|window} element 目标元素或目标元素id
 * @param {string} type 事件类型
 * @param {Function} listener 需要移除的监听器
 * @shortcut un
 * @meta standard
 * @see baidu.event.on
 *             
 * @returns {HTMLElement|window} 目标元素
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/json.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/02
 */


/**
 * @namespace baidu.json 操作json对象的方法。
 */
baidu.json = baidu.json || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/json/parse.js
 * author: erik, berg
 * version: 1.2
 * date: 2009/11/23
 */



/**
 * 将字符串解析成json对象。注：不会自动祛除空格
 * @name baidu.json.parse
 * @function
 * @grammar baidu.json.parse(data)
 * @param {string} source 需要解析的字符串
 * @remark
 * 该方法的实现与ecma-262第五版中规定的JSON.parse不同，暂时只支持传入一个参数。后续会进行功能丰富。
 * @meta standard
 * @see baidu.json.stringify,baidu.json.decode
 *             
 * @returns {JSON} 解析结果json对象
 */
baidu.json.parse = function (data) {
    //2010/12/09：更新至不使用原生parse，不检测用户输入是否正确
    return (new Function("return (" + data + ")"))();
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/json/stringify.js
 * author: erik
 * version: 1.1.0
 * date: 2010/01/11
 */



/**
 * 将json对象序列化
 * @name baidu.json.stringify
 * @function
 * @grammar baidu.json.stringify(value)
 * @param {JSON} value 需要序列化的json对象
 * @remark
 * 该方法的实现与ecma-262第五版中规定的JSON.stringify不同，暂时只支持传入一个参数。后续会进行功能丰富。
 * @meta standard
 * @see baidu.json.parse,baidu.json.encode
 *             
 * @returns {string} 序列化后的字符串
 */
baidu.json.stringify = (function () {
    /**
     * 字符串处理时需要转义的字符表
     * @private
     */
    var escapeMap = {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"' : '\\"',
        "\\": '\\\\'
    };
    
    /**
     * 字符串序列化
     * @private
     */
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
    
    /**
     * 数组序列化
     * @private
     */
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
    
    /**
     * 处理日期序列化时的补零
     * @private
     */
    function pad(source) {
        return source < 10 ? '0' + source : source;
    }
    
    /**
     * 日期序列化
     * @private
     */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/guid.js
 * author: meizz
 * version: 1.1.0
 * date: 2010/02/04
 */

/**
 * 返回一个当前页面的唯一标识字符串。
 * @name baidu.lang.guid
 * @function
 * @grammar baidu.lang.guid()
 * @version 1.1.1
 * @meta standard
 *             
 * @returns {String} 当前页面的唯一标识字符串
 */

(function(){
    //不直接使用window，可以提高3倍左右性能
    var guid = window[baidu.guid];

    baidu.lang.guid = function() {
        return "TANGRAM__" + (guid._counter ++).toString(36);
    };

    guid._counter = guid._counter || 1;
})();
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/_instances.js
 * author: meizz, erik
 * version: 1.1.0
 * date: 2009/12/1
 */




/**
 * 所有类的实例的容器
 * key为每个实例的guid
 * @meta standard
 */

window[baidu.guid]._instances = window[baidu.guid]._instances || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/isFunction.js
 * author: rocy
 * version: 1.1.2
 * date: 2010/06/12
 */



/**
 * 判断目标参数是否为function或Function实例
 * @name baidu.lang.isFunction
 * @function
 * @grammar baidu.lang.isFunction(source)
 * @param {Any} source 目标参数
 * @version 1.2
 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isElement,baidu.lang.isBoolean,baidu.lang.isDate
 * @meta standard
 * @returns {boolean} 类型判断结果
 */
baidu.lang.isFunction = function (source) {
    // chrome下,'function' == typeof /a/ 为true.
    return '[object Function]' == Object.prototype.toString.call(source);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/Class.js
 * author: meizz, erik
 * version: 1.1.0
 * date: 2009/12/1
 */





/**
 * 
 * @class  Tangram继承机制提供的一个基类，用户可以通过继承baidu.lang.Class来获取它的属性及方法。
 * @name 	baidu.lang.Class
 * @grammar baidu.lang.Class(guid)
 * @param 	{string}	guid	对象的唯一标识
 * @meta standard
 * @remark baidu.lang.Class和它的子类的实例均包含一个全局唯一的标识guid。guid是在构造函数中生成的，因此，继承自baidu.lang.Class的类应该直接或者间接调用它的构造函数。<br>baidu.lang.Class的构造函数中产生guid的方式可以保证guid的唯一性，及每个实例都有一个全局唯一的guid。
 * @meta standard
 * @see baidu.lang.inherits,baidu.lang.Event
 */
baidu.lang.Class = function(guid) {
    this.guid = guid || baidu.lang.guid();
    window[baidu.guid]._instances[this.guid] = this;
};
window[baidu.guid]._instances = window[baidu.guid]._instances || {};

/**
 * 释放对象所持有的资源，主要是自定义事件。
 * @name dispose
 * @grammar obj.dispose()
 * TODO: 将_listeners中绑定的事件剔除掉
 */
baidu.lang.Class.prototype.dispose = function(){
    delete window[baidu.guid]._instances[this.guid];

    for(var property in this){
        if (!baidu.lang.isFunction(this[property])) {
            delete this[property];
        }
    }
    this.disposed = true;   // 20100716
};

/**
 * 重载了默认的toString方法，使得返回信息更加准确一些。
 * @return {string} 对象的String表示形式
 */
baidu.lang.Class.prototype.toString = function(){
    return "[object " + (this._className || "Object" ) + "]";
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/Event.js
 * author: meizz, erik, berg
 * version: 1.1.1
 * date: 2009/11/24
 * modify: 2010/04/19 berg
 */






/**
 * 
 * @class   自定义的事件对象。
 * @name 	baidu.lang.Event
 * @grammar baidu.lang.Event(type[, target])
 * @param 	{string} type	 事件类型名称。为了方便区分事件和一个普通的方法，事件类型名称必须以"on"(小写)开头。
 * @param 	{Object} [target]触发事件的对象
 * @meta standard
 * @remark 引入该模块，会自动为Class引入3个事件扩展方法：addEventListener、removeEventListener和dispatchEvent。
 * @meta standard
 * @see baidu.lang.Class
 */
baidu.lang.Event = function (type, target) {
    this.type = type;
    this.returnValue = true;
    this.target = target || null;
    this.currentTarget = null;
};

/**
 * 注册对象的事件监听器。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
 * @grammar obj.addEventListener(type, handler[, key])
 * @param 	{string}   type         自定义事件的名称
 * @param 	{Function} handler      自定义事件被触发时应该调用的回调函数
 * @param 	{string}   [key]		为事件监听函数指定的名称，可在移除时使用。如果不提供，方法会默认为它生成一个全局唯一的key。
 * @remark 	事件类型区分大小写。如果自定义事件名称不是以小写"on"开头，该方法会给它加上"on"再进行判断，即"click"和"onclick"会被认为是同一种事件。 
 */
baidu.lang.Class.prototype.addEventListener = function (type, handler, key) {
    if (!baidu.lang.isFunction(handler)) {
        return;
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
 
/**
 * 移除对象的事件监听器。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
 * @grammar obj.removeEventListener(type, handler)
 * @param {string}   type     事件类型
 * @param {Function|string} handler  要移除的事件监听函数或者监听函数的key
 * @remark 	如果第二个参数handler没有被绑定到对应的自定义事件中，什么也不做。
 */
baidu.lang.Class.prototype.removeEventListener = function (type, handler) {
    if (typeof handler != "undefined") {
        if ( (baidu.lang.isFunction(handler) && ! (handler = handler.hashCode))
            || (! baidu.lang.isString(handler))
        ){
            return;
        }
    }

    !this.__listeners && (this.__listeners = {});

    type.indexOf("on") != 0 && (type = "on" + type);

    var t = this.__listeners;
    if (!t[type]) {
        return;
    }
    if (typeof handler != "undefined") {
        t[type][handler] && delete t[type][handler];
    } else {
        for(var guid in t[type]){
            delete t[type][guid];
        }
    }
};

/**
 * 派发自定义事件，使得绑定到自定义事件上面的函数都会被执行。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
 * @grammar obj.dispatchEvent(event, options)
 * @param {baidu.lang.Event|String} event 	Event对象，或事件名称(1.1.1起支持)
 * @param {Object} 					options 扩展参数,所含属性键值会扩展到Event对象上(1.2起支持)
 * @remark 处理会调用通过addEventListenr绑定的自定义事件回调函数之外，还会调用直接绑定到对象上面的自定义事件。例如：<br>
myobj.onMyEvent = function(){}<br>
myobj.addEventListener("onMyEvent", function(){});
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/inherits.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/24
 */



/**
 * 为类型构造器建立继承关系
 * @name baidu.lang.inherits
 * @function
 * @grammar baidu.lang.inherits(subClass, superClass[, className])
 * @param {Function} subClass 子类构造器
 * @param {Function} superClass 父类构造器
 * @param {string} className 类名标识
 * @remark
 * 
使subClass继承superClass的prototype，因此subClass的实例能够使用superClass的prototype中定义的所有属性和方法。<br>
这个函数实际上是建立了subClass和superClass的原型链集成，并对subClass进行了constructor修正。<br>
<strong>注意：如果要继承构造函数，需要在subClass里面call一下，具体见下面的demo例子</strong>
	
 * @shortcut inherits
 * @meta standard
 * @see baidu.lang.Class
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/instance.js
 * author: meizz, erik
 * version: 1.1.0
 * date: 2009/12/1
 */



/**
 * 根据参数(guid)的指定，返回对应的实例对象引用
 * @name baidu.lang.instance
 * @function
 * @grammar baidu.lang.instance(guid)
 * @param {string} guid 需要获取实例的guid
 * @meta standard
 *             
 * @returns {Object|null} 如果存在的话，返回;否则返回null。
 */
baidu.lang.instance = function (guid) {
    return window[baidu.guid]._instances[guid] || null;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/isArray.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/30
 */



/**
 * 判断目标参数是否Array对象
 * @name baidu.lang.isArray
 * @function
 * @grammar baidu.lang.isArray(source)
 * @param {Any} source 目标参数
 * @meta standard
 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isElement,baidu.lang.isBoolean,baidu.lang.isDate
 *             
 * @returns {boolean} 类型判断结果
 */
baidu.lang.isArray = function (source) {
    return '[object Array]' == Object.prototype.toString.call(source);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/isElement.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/30
 */



/**
 * 判断目标参数是否为Element对象
 * @name baidu.lang.isElement
 * @function
 * @grammar baidu.lang.isElement(source)
 * @param {Any} source 目标参数
 * @meta standard
 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isBoolean,baidu.lang.isDate
 *             
 * @returns {boolean} 类型判断结果
 */
baidu.lang.isElement = function (source) {
    return !!(source && source.nodeName && source.nodeType == 1);
};

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 判断目标参数是否number类型或Number对象
 * @name baidu.lang.isNumber
 * @function
 * @grammar baidu.lang.isNumber(source)
 * @param {Any} source 目标参数
 * @meta standard
 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isArray,baidu.lang.isElement,baidu.lang.isBoolean,baidu.lang.isDate
 *             
 * @returns {boolean} 类型判断结果
 * @remark 用本函数判断NaN会返回false，尽管在Javascript中是Number类型。
 */
baidu.lang.isNumber = function (source) {
    return '[object Number]' == Object.prototype.toString.call(source) && isFinite(source);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/isObject.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/30
 */



/**
 * 判断目标参数是否为Object对象
 * @name baidu.lang.isObject
 * @function
 * @grammar baidu.lang.isObject(source)
 * @param {Any} source 目标参数
 * @shortcut isObject
 * @meta standard
 * @see baidu.lang.isString,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isElement,baidu.lang.isBoolean,baidu.lang.isDate
 *             
 * @returns {boolean} 类型判断结果
 */
baidu.lang.isObject = function (source) {
    return 'function' == typeof source || !!(source && 'object' == typeof source);
};

// 声明快捷方法
baidu.isObject = baidu.lang.isObject;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 增加自定义模块扩展,默认创建在当前作用域
 * @author erik, berg
 * @name baidu.lang.module
 * @function
 * @grammar baidu.lang.module(name, module[, owner])
 * @param {string} name 需要创建的模块名.
 * @param {Any} module 需要创建的模块对象.
 * @param {Object} [owner] 模块创建的目标环境，默认为window.
 * @remark
 *
            从1.1.1开始，module方法会优先在当前作用域下寻找模块，如果无法找到，则寻找window下的模块

 * @meta standard
 */
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
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/toArray.js
 * author: berg
 * version: 1.0
 * date: 2010-07-05
 */





/**
 * 将一个变量转换成array
 * @name baidu.lang.toArray
 * @function
 * @grammar baidu.lang.toArray(source)
 * @param {mix} source 需要转换成array的变量
 * @version 1.3
 * @meta standard
 * @returns {array} 转换后的array
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/object.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */


/**
 * @namespace baidu.object 操作原生对象的方法。
 */
baidu.object = baidu.object || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */





/**
 * 判断一个对象是不是字面量对象，即判断这个对象是不是由{}或者new Object类似方式创建
 * 
 * @name baidu.object.isPlain
 * @function
 * @grammar baidu.object.isPlain(source)
 * @param {Object} source 需要检查的对象
 * @remark
 * 事实上来说，在Javascript语言中，任何判断都一定会有漏洞，因此本方法只针对一些最常用的情况进行了判断
 *             
 * @returns {Boolean} 检查结果
 */
baidu.object.isPlain  = function(obj){
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        key;
    if ( !obj ||
         //一般的情况，直接用toString判断
         Object.prototype.toString.call(obj) !== "[object Object]" ||
         //IE下，window/document/document.body/HTMLElement/HTMLCollection/NodeList等DOM对象上一个语句为true
         //isPrototypeOf挂在Object.prototype上的，因此所有的字面量都应该会有这个属性
         //对于在window上挂了isPrototypeOf属性的情况，直接忽略不考虑
         !('isPrototypeOf' in obj)
       ) {
        return false;
    }

    //判断new fun()自定义对象的情况
    //constructor不是继承自原型链的
    //并且原型中有isPrototypeOf方法才是Object
    if ( obj.constructor &&
        !hasOwnProperty.call(obj, "constructor") &&
        !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
        return false;
    }
    //判断有继承的情况
    //如果有一项是继承过来的，那么一定不是字面量Object
    //OwnProperty会首先被遍历，为了加速遍历过程，直接看最后一项
    for ( key in obj ) {}
    return key === undefined || hasOwnProperty.call( obj, key );
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */





/**
 * 对一个object进行深度拷贝
 * 
 * @author berg
 * @name baidu.object.clone
 * @function
 * @grammar baidu.object.clone(source)
 * @param {Object} source 需要进行拷贝的对象
 * @remark
 * 对于Object来说，只拷贝自身成员，不拷贝prototype成员
 * @meta standard
 *             
 * @returns {Object} 拷贝后的新对象
 */
baidu.object.clone  = function (source) {
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
    } else if (baidu.object.isPlain(source)) {
        result = {};
        for (i in source) {
            if (source.hasOwnProperty(i)) {
                result[i] = baidu.object.clone(source[i]);
            }
        }
    }
    return result;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 将源对象的所有属性拷贝到目标对象中
 * @author erik
 * @name baidu.object.extend
 * @function
 * @grammar baidu.object.extend(target, source)
 * @param {Object} target 目标对象
 * @param {Object} source 源对象
 * @see baidu.array.merge
 * @remark
 * 
1.目标对象中，与源对象key相同的成员将会被覆盖。<br>
2.源对象的prototype成员不会拷贝。
		
 * @shortcut extend
 * @meta standard
 *             
 * @returns {Object} 目标对象
 */
baidu.extend =
baidu.object.extend = function (target, source) {
    for (var p in source) {
        if (source.hasOwnProperty(p)) {
            target[p] = source[p];
        }
    }
    
    return target;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/page.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/17
 */


/**
 * @namespace baidu.page 对页面层面的封装，包括页面的高宽属性、以及外部css和js的动态添加。
 */
baidu.page = baidu.page || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/page/getScrollTop.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/17
 */



/**
 * 获取纵向滚动量
 * @name baidu.page.getScrollTop
 * @function
 * @grammar baidu.page.getScrollTop()
 * @see baidu.page.getScrollLeft
 * @meta standard
 * @returns {number} 纵向滚动量
 */
baidu.page.getScrollTop = function () {
    var d = document;
    return window.pageYOffset || d.documentElement.scrollTop || d.body.scrollTop;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/page/getViewHeight.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/20
 */



/**
 * 获取页面视觉区域高度
 * @name baidu.page.getViewHeight
 * @function
 * @grammar baidu.page.getViewHeight()
 * @see baidu.page.getViewWidth
 * @meta standard
 * @returns {number} 页面视觉区域高度
 */
baidu.page.getViewHeight = function () {
    var doc = document,
        client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;

    return client.clientHeight;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/page/getViewWidth.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/20
 */



/**
 * 获取页面视觉区域宽度
 * @name baidu.page.getViewWidth
 * @function
 * @grammar baidu.page.getViewWidth()
 * @see baidu.page.getViewHeight
 *             
 * @returns {number} 页面视觉区域宽度
 */
baidu.page.getViewWidth = function () {
    var doc = document,
        client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;

    return client.clientWidth;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/sio.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/16
 */


/**
 * @namespace baidu.sio 使用动态script标签请求服务器资源，包括由服务器端的回调和浏览器端的回调。
 */
baidu.sio = baidu.sio || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 删除script的属性，再删除script标签，以解决修复内存泄漏的问题
 * 
 * @param {HTMLElement} src script节点
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 
 * @param {HTMLElement} src script节点
 * @param {String} url script节点的地址
 * @param {String} [charset] 编码
 */
baidu.sio._createScriptTag = function(scr, url, charset){
    scr.setAttribute('type', 'text/javascript');
    charset && scr.setAttribute('charset', charset);
    scr.setAttribute('src', url);
    document.getElementsByTagName('head')[0].appendChild(scr);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */





/**
 * 通过script标签加载数据，加载完成由浏览器端触发回调
 * @name baidu.sio.callByBrowser
 * @function
 * @grammar baidu.sio.callByBrowser(url, opt_callback, opt_options)
 * @param {string} url 加载数据的url
 * @param {Function=} opt_callback 数据加载结束时调用的函数
 * @param {Object=} opt_options 其他可选项
 * @config {String} [charset] script的字符集
 * @config {Integer} [timeOut] 超时时间，超过这个时间将不再响应本请求，并触发onfailure函数
 * @config {Function} [onfailure] timeOut设定后才生效，到达超时时间时触发本函数
 * @remark
 * 1、与callByServer不同，callback参数只支持Function类型，不支持string。
 * 2、如果请求了一个不存在的页面，callback函数在IE/opera下也会被调用，因此使用者需要在onsuccess函数中判断数据是否正确加载。
 * @meta standard
 * @see baidu.sio.callByServer
 */
baidu.sio.callByBrowser = function (url, opt_callback, opt_options) {
    var scr = document.createElement("SCRIPT"),
        scriptLoaded = 0,
        options = opt_options || {},
        charset = options['charset'],
        callback = opt_callback || function(){},
        timeOut = options['timeOut'] || 0,
        timer;
    
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
                clearTimeout(timer);
            } finally {
                scr.onload = scr.onreadystatechange = null;
                baidu.sio._removeScriptTag(scr);
            }
        }
    };

    if( timeOut ){
        timer = setTimeout(function(){
            scr.onload = scr.onreadystatechange = null;
            baidu.sio._removeScriptTag(scr);
            options.onfailure && options.onfailure();
        }, timeOut);
    }
    
    baidu.sio._createScriptTag(scr, url, charset);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */







/**
 * 通过script标签加载数据，加载完成由服务器端触发回调
 * @name baidu.sio.callByServer
 * @function
 * @grammar baidu.sio.callByServer(url, callback[, opt_options])
 * @param {string} url 加载数据的url.
 * @param {Function|string} callback 服务器端调用的函数或函数名。如果没有指定本参数，将在URL中寻找options['queryField']做为callback的方法名.
 * @param {Object} opt_options 加载数据时的选项.
 * @config {string} [charset] script的字符集
 * @config {string} [queryField] 服务器端callback请求字段名，默认为callback
 * @config {Integer} [timeOut] 超时时间(单位：ms)，超过这个时间将不再响应本请求，并触发onfailure函数
 * @config {Function} [onfailure] timeOut设定后才生效，到达超时时间时触发本函数
 * @remark
 * 如果url中已经包含key为“options['queryField']”的query项，将会被替换成callback中参数传递或自动生成的函数名。
 * @meta standard
 * @see baidu.sio.callByBrowser
 */
baidu.sio.callByServer = function(url, callback, opt_options) {
    var scr = document.createElement('SCRIPT'),
        prefix = 'bd__cbs__',
        callbackName,
        callbackImpl,
        options = opt_options || {},
        charset = options['charset'],
        queryField = options['queryField'] || 'callback',
        timeOut = options['timeOut'] || 0,
        timer,
        reg = new RegExp('(\\?|&)' + queryField + '=([^&]*)'),
        matches;

    if (baidu.lang.isFunction(callback)) {
        callbackName = prefix + Math.floor(Math.random() * 2147483648).toString(36);
        window[callbackName] = getCallBack(0);
    } else if(baidu.lang.isString(callback)){
        // 如果callback是一个字符串的话，就需要保证url是唯一的，不要去改变它
        // TODO 当调用了callback之后，无法删除动态创建的script标签
        callbackName = callback;
    } else {
        if (matches = reg.exec(url)) {
            callbackName = matches[2];
        }
    }

    if( timeOut ){
        timer = setTimeout(getCallBack(1), timeOut);
    }

    //如果用户在URL中已有callback，用参数传入的callback替换之
    url = url.replace(reg, '\x241' + queryField + '=' + callbackName);
    
    if (url.search(reg) < 0) {
        url += (url.indexOf('?') < 0 ? '?' : '&') + queryField + '=' + callbackName;
    }
    baidu.sio._createScriptTag(scr, url, charset);

    /*
     * 返回一个函数，用于立即（挂在window上）或者超时（挂在setTimeout中）时执行
     */
    function getCallBack(onTimeOut){
        /*global callbackName, callback, scr, options;*/
        return function(){
            try {
                if( onTimeOut ){
                    options.onfailure && options.onfailure();
                }else{
                    callback.apply(window, arguments);
                    clearTimeout(timer);
                }
                window[callbackName] = null;
                delete window[callbackName];
            } catch (exception) {
                // ignore the exception
            } finally {
                baidu.sio._removeScriptTag(scr);
            }
        }
    }
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/decodeHTML.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */



/**
 * 对目标字符串进行html解码
 * @name baidu.string.decodeHTML
 * @function
 * @grammar baidu.string.decodeHTML(source)
 * @param {string} source 目标字符串
 * @shortcut decodeHTML
 * @meta standard
 * @see baidu.string.encodeHTML
 *             
 * @returns {string} html解码后的字符串
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/encodeHTML.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */



/**
 * 对目标字符串进行html编码
 * @name baidu.string.encodeHTML
 * @function
 * @grammar baidu.string.encodeHTML(source)
 * @param {string} source 目标字符串
 * @remark
 * 编码字符有5个：&<>"'
 * @shortcut encodeHTML
 * @meta standard
 * @see baidu.string.decodeHTML
 *             
 * @returns {string} html编码后的字符串
 */
baidu.string.encodeHTML = function (source) {
    return String(source)
                .replace(/&/g,'&amp;')
                .replace(/</g,'&lt;')
                .replace(/>/g,'&gt;')
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
};

baidu.encodeHTML = baidu.string.encodeHTML;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/format.js
 * author: dron, erik
 * version: 1.1.0
 * date: 2009/11/30
 */



/**
 * 对目标字符串进行格式化
 * @name baidu.string.format
 * @function
 * @grammar baidu.string.format(source, opts)
 * @param {string} source 目标字符串
 * @param {Object|string...} opts 提供相应数据的对象或多个字符串
 * @remark
 * 
opts参数为“Object”时，替换目标字符串中的#{property name}部分。<br>
opts为“string...”时，替换目标字符串中的#{0}、#{1}...部分。
		
 * @shortcut format
 * @meta standard
 *             
 * @returns {string} 格式化后的字符串
 */
baidu.string.format = function (source, opts) {
    source = String(source);
    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
    if(data.length){
	    data = data.length == 1 ? 
	    	/* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/getByteLength.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */



/**
 * 获取目标字符串在gbk编码下的字节长度
 * @name baidu.string.getByteLength
 * @function
 * @grammar baidu.string.getByteLength(source)
 * @param {string} source 目标字符串
 * @remark
 * 获取字符在gbk编码下的字节长度, 实现原理是认为大于127的就一定是双字节。如果字符超出gbk编码范围, 则这个计算不准确
 * @meta standard
 * @see baidu.string.subByte
 *             
 * @returns {number} 字节长度
 */
baidu.string.getByteLength = function (source) {
    return String(source).replace(/[^\x00-\xff]/g, "ci").length;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/swf.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/16
 */


/**
 * @namespace baidu.swf 操作flash对象的方法，包括创建flash对象、获取flash对象以及判断flash插件的版本号。
*/
baidu.swf = baidu.swf || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/swf/version.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/17
 */



/**
 * 浏览器支持的flash插件版本
 * @property version 浏览器支持的flash插件版本
 * @grammar baidu.swf.version 
 * @meta standard
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/swf/createHTML.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/17
 */




/**
 * 创建flash对象的html字符串
 * @name baidu.swf.createHTML
 * @function
 * @grammar baidu.swf.createHTML(options)
 * 
 * @param {Object} 	options 					创建flash的选项参数
 * @param {string} 	options.id 					要创建的flash的标识
 * @param {string} 	options.url 				flash文件的url
 * @param {String} 	options.errorMessage 		未安装flash player或flash player版本号过低时的提示
 * @param {string} 	options.ver 				最低需要的flash player版本号
 * @param {string} 	options.width 				flash的宽度
 * @param {string} 	options.height 				flash的高度
 * @param {string} 	options.align 				flash的对齐方式，允许值：middle/left/right/top/bottom
 * @param {string} 	options.base 				设置用于解析swf文件中的所有相对路径语句的基本目录或URL
 * @param {string} 	options.bgcolor 			swf文件的背景色
 * @param {string} 	options.salign 				设置缩放的swf文件在由width和height设置定义的区域内的位置。允许值：l/r/t/b/tl/tr/bl/br
 * @param {boolean} options.menu 				是否显示右键菜单，允许值：true/false
 * @param {boolean} options.loop 				播放到最后一帧时是否重新播放，允许值： true/false
 * @param {boolean} options.play 				flash是否在浏览器加载时就开始播放。允许值：true/false
 * @param {string} 	options.quality 			设置flash播放的画质，允许值：low/medium/high/autolow/autohigh/best
 * @param {string} 	options.scale 				设置flash内容如何缩放来适应设置的宽高。允许值：showall/noborder/exactfit
 * @param {string} 	options.wmode 				设置flash的显示模式。允许值：window/opaque/transparent
 * @param {string} 	options.allowscriptaccess 	设置flash与页面的通信权限。允许值：always/never/sameDomain
 * @param {string} 	options.allownetworking 	设置swf文件中允许使用的网络API。允许值：all/internal/none
 * @param {boolean} options.allowfullscreen 	是否允许flash全屏。允许值：true/false
 * @param {boolean} options.seamlesstabbing 	允许设置执行无缝跳格，从而使用户能跳出flash应用程序。该参数只能在安装Flash7及更高版本的Windows中使用。允许值：true/false
 * @param {boolean} options.devicefont 			设置静态文本对象是否以设备字体呈现。允许值：true/false
 * @param {boolean} options.swliveconnect 		第一次加载flash时浏览器是否应启动Java。允许值：true/false
 * @param {Object} 	options.vars 				要传递给flash的参数，支持JSON或string类型。
 * 
 * @see baidu.swf.create
 * @meta standard
 * @returns {string} flash对象的html字符串
 */
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
            fvars.push(k + "=" + encodeURIComponent(item));
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/swf/create.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/17
 */



/**
 * 在页面中创建一个flash对象
 * @name baidu.swf.create
 * @function
 * @grammar baidu.swf.create(options[, container])
 * 
 * @param {Object} 	options 					创建flash的选项参数
 * @param {string} 	options.id 					要创建的flash的标识
 * @param {string} 	options.url 				flash文件的url
 * @param {String} 	options.errorMessage 		未安装flash player或flash player版本号过低时的提示
 * @param {string} 	options.ver 				最低需要的flash player版本号
 * @param {string} 	options.width 				flash的宽度
 * @param {string} 	options.height 				flash的高度
 * @param {string} 	options.align 				flash的对齐方式，允许值：middle/left/right/top/bottom
 * @param {string} 	options.base 				设置用于解析swf文件中的所有相对路径语句的基本目录或URL
 * @param {string} 	options.bgcolor 			swf文件的背景色
 * @param {string} 	options.salign 				设置缩放的swf文件在由width和height设置定义的区域内的位置。允许值：l/r/t/b/tl/tr/bl/br
 * @param {boolean} options.menu 				是否显示右键菜单，允许值：true/false
 * @param {boolean} options.loop 				播放到最后一帧时是否重新播放，允许值： true/false
 * @param {boolean} options.play 				flash是否在浏览器加载时就开始播放。允许值：true/false
 * @param {string} 	options.quality 			设置flash播放的画质，允许值：low/medium/high/autolow/autohigh/best
 * @param {string} 	options.scale 				设置flash内容如何缩放来适应设置的宽高。允许值：showall/noborder/exactfit
 * @param {string} 	options.wmode 				设置flash的显示模式。允许值：window/opaque/transparent
 * @param {string} 	options.allowscriptaccess 	设置flash与页面的通信权限。允许值：always/never/sameDomain
 * @param {string} 	options.allownetworking 	设置swf文件中允许使用的网络API。允许值：all/internal/none
 * @param {boolean} options.allowfullscreen 	是否允许flash全屏。允许值：true/false
 * @param {boolean} options.seamlesstabbing 	允许设置执行无缝跳格，从而使用户能跳出flash应用程序。该参数只能在安装Flash7及更高版本的Windows中使用。允许值：true/false
 * @param {boolean} options.devicefont 			设置静态文本对象是否以设备字体呈现。允许值：true/false
 * @param {boolean} options.swliveconnect 		第一次加载flash时浏览器是否应启动Java。允许值：true/false
 * @param {Object} 	options.vars 				要传递给flash的参数，支持JSON或string类型。
 * 
 * @param {HTMLElement|string} [container] 		flash对象的父容器元素，不传递该参数时在当前代码位置创建flash对象。
 * @meta standard
 * @see baidu.swf.createHTML,baidu.swf.getMovie
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/swf/getMovie.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/16
 */





/**
 * 获得flash对象的实例
 * @name baidu.swf.getMovie
 * @function
 * @grammar baidu.swf.getMovie(name)
 * @param {string} name flash对象的名称
 * @see baidu.swf.create
 * @meta standard
 * @returns {HTMLElement} flash对象的实例
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/url.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/16
 */


/**
 * @namespace baidu.url 操作url的方法。
 */
baidu.url = baidu.url || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/url/getQueryValue.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/16
 */




/**
 * 根据参数名从目标URL中获取参数值
 * @name baidu.url.getQueryValue
 * @function
 * @grammar baidu.url.getQueryValue(url, key)
 * @param {string} url 目标URL
 * @param {string} key 要获取的参数名
 * @meta standard
 * @see baidu.url.jsonToQuery
 *             
 * @returns {string|null} - 获取的参数值，其中URI编码后的字符不会被解码，获取不到时返回null
 */
baidu.url.getQueryValue = function (url, key) {
    var reg = new RegExp(
                        "(^|&|\\?|#)" 
                        + baidu.string.escapeReg(key) 
                        + "=([^&#]*)(&|\x24|#)", 
                    "");
    var match = url.match(reg);
    if (match) {
        return match[2];
    }
    
    return null;
};
