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
 * @namespace T Tangram七巧板
 * @name T
 * @version 1.5.2.2
*/

/**
 * 声明baidu包
 * @author: allstar, erik, meizz, berg
 */
var T,
    baidu = T = baidu || {version: "1.5.2.2"}; 

//提出guid，防止在与老版本Tangram混用时
//在下一行错误的修改window[undefined]
baidu.guid = "$BAIDU$";

//Tangram可能被放在闭包中
//一些页面级别唯一的属性，需要挂载在window[baidu.guid]上
baidu.$$ = window[baidu.guid] = window[baidu.guid] || {global:{}};
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
 * 对XMLHttpRequest请求的封装
 * @namespace baidu.ajax
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
 * 对方法的操作，解决内存泄露问题
 * @namespace baidu.fn
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
 * @return {Function} 一个空函数
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
 * @param {Object} 	options 发送请求的选项参数
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
baidu.ajax.request = function (url, opt_options) {
    var options     = opt_options || {},
        data        = options.data || "",
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
            xhr.setRequestHeader("Content-Type",
                (headers['Content-Type'] || "application/x-www-form-urlencoded"));
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
 * path: baidu/url.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/16
 */


/**
 * 操作url的方法
 * @namespace baidu.url
 */
baidu.url = baidu.url || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 对字符串进行%#&+=以及和\s匹配的所有字符进行url转义
 * @name baidu.url.escapeSymbol
 * @function
 * @grammar baidu.url.escapeSymbol(source)
 * @param {string} source 需要转义的字符串.
 * @return {string} 转义之后的字符串.
 * @remark
 * 用于get请求转义。在服务器只接受gbk，并且页面是gbk编码时，可以经过本转义后直接发get请求。
 *
 * @return {string} 转义后的字符串
 */
baidu.url.escapeSymbol = function(source) {
    
    //TODO: 之前使用\s来匹配任意空白符
    //发现在ie下无法匹配中文全角空格和纵向指标符\v，所以改\s为\f\r\n\t\v以及中文全角空格和英文空格
    //但是由于ie本身不支持纵向指标符\v,故去掉对其的匹配，保证各浏览器下效果一致
    return String(source).replace(/[#%&+=\/\\\ \　\f\r\n\t]/g, function(all) {
        return '%' + (0x100 + all.charCodeAt()).toString(16).substring(1).toUpperCase();
    });
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/ajax/form.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */





/**
 * 将一个表单用ajax方式提交
 * @name baidu.ajax.form
 * @function
 * @grammar baidu.ajax.form(form[, options])
 * @param {HTMLFormElement} form             需要提交的表单元素
 * @param {Object} 	[options] 					发送请求的选项参数
 * @config {Boolean} [async] 			是否异步请求。默认为true（异步）
 * @config {String} 	[username] 			用户名
 * @config {String} 	[password] 			密码
 * @config {Object} 	[headers] 			要设置的http request header
 * @config {Function} [replacer] 			对参数值特殊处理的函数,replacer(string value, string key)
 * @config {Function} [onbeforerequest] 	发送请求之前触发，function(XMLHttpRequest xhr)。
 * @config {Function} [onsuccess] 		请求成功时触发，function(XMLHttpRequest xhr, string responseText)。
 * @config {Function} [onfailure] 		请求失败时触发，function(XMLHttpRequest xhr)。
 * @config {Function} [on{STATUS_CODE}] 	当请求为相应状态码时触发的事件，如on302、on404、on500，function(XMLHttpRequest xhr)。3XX的状态码浏览器无法获取，4xx的，可能因为未知问题导致获取失败。
	
 * @see baidu.ajax.request
 *             
 * @returns {XMLHttpRequest} 发送请求的XMLHttpRequest对象
 */
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
        
    /**
     * 向缓冲区添加参数数据
     * @private
     */
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
            itemValue = baidu.url.escapeSymbol(item.value);
        
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
    sendOptions.method = form.getAttribute('method') || 'GET';
    
    // 发送请求
    return baidu.ajax.request(url, sendOptions);
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
 * 操作数组的方法
 * @namespace baidu.array
 */

baidu.array = baidu.array || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/array/indexOf.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * 查询数组中指定元素的索引位置
 * @name baidu.array.indexOf
 * @function
 * @grammar baidu.array.indexOf(source, match[, fromIndex])
 * @param {Array} source 需要查询的数组
 * @param {Any} match 查询项
 * @param {number} [fromIndex] 查询的起始位索引位置，如果为负数，则从source.length+fromIndex往后开始查找
 * @see baidu.array.find,baidu.array.lastIndexOf
 *             
 * @returns {number} 指定元素的索引位置，查询不到时返回-1
 */
baidu.array.indexOf = function (source, match, fromIndex) {
    var len = source.length,
        iterator = match;
        
    fromIndex = fromIndex | 0;
    if(fromIndex < 0){//小于0
        fromIndex = Math.max(0, len + fromIndex)
    }
    for ( ; fromIndex < len; fromIndex++) {
        if(fromIndex in source && source[fromIndex] === match) {
            return fromIndex;
        }
    }
    
    return -1;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 判断一个数组中是否包含给定元素
 * @name baidu.array.contains
 * @function
 * @grammar baidu.array.contains(source, obj)
 * @param {Array} source 需要判断的数组.
 * @param {Any} obj 要查找的元素.
 * @return {boolean} 判断结果.
 * @author berg
 */
baidu.array.contains = function(source, obj) {
    return (baidu.array.indexOf(source, obj) >= 0);
};

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
 * 清空一个数组
 * @name baidu.array.empty
 * @function
 * @grammar baidu.array.empty(source)
 * @param {Array} source 需要清空的数组.
 * @author berg
 */
baidu.array.empty = function(source) {
    source.length = 0;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 判断一个数组中是否所有元素都满足给定条件
 * @name baidu.array.every
 * @function
 * @grammar baidu.array.every(source, iterator[,thisObject])
 * @param {Array} source 需要判断的数组.
 * @param {Function} iterator 判断函数.
 * @param {Object} [thisObject] 函数调用时的this指针，如果没有此参数，默认是当前遍历的数组
 * @return {boolean} 判断结果.
 * @see baidu.array.some
 */
baidu.array.every = function(source, iterator, thisObject) {
    var i = 0,
        len = source.length;
    for (; i < len; i++) {
        if (i in source && !iterator.call(thisObject || source, source[i], i)) {
            return false;
        }
    }
    return true;
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
 * path: baidu/array/find.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * 从数组中寻找符合条件的第一个元素
 * @name baidu.array.find
 * @function
 * @grammar baidu.array.find(source, iterator)
 * @param {Array} source 需要查找的数组
 * @param {Function} iterator 对每个数组元素进行查找的函数，该函数有两个参数，第一个为数组元素，第二个为数组索引值，function (item, index)，函数需要返回true或false
 * @see baidu.array.filter,baidu.array.indexOf
 *             
 * @returns {Any|null} 符合条件的第一个元素，找不到时返回null
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 将两个数组参数合并成一个类似hashMap结构的对象，这个对象使用第一个数组做为key，使用第二个数组做为值，如果第二个参数未指定，则把对象的所有值置为true。
 * @name baidu.array.hash
 * @function
 * @grammar baidu.array.hash(keys[, values])
 * @param {Array} keys 作为key的数组
 * @param {Array} [values] 作为value的数组，未指定此参数时，默认值将对象的值都设为true。
 *             
 * @returns {Object} 合并后的对象{key : value}
 */
baidu.array.hash = function(keys, values) {
    var o = {}, vl = values && values.length, i = 0, l = keys.length;
    for (; i < l; i++) {
        o[keys[i]] = (vl && vl > i) ? values[i] : true;
    }
    return o;
};

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/array/lastIndexOf.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/14
 */



/**
 * 从后往前，查询数组中指定元素的索引位置
 * @name baidu.array.lastIndexOf
 * @function
 * @grammar baidu.array.lastIndexOf(source, match)
 * @param {Array} source 需要查询的数组
 * @param {Any} match 查询项
 * @param {number} [fromIndex] 查询的起始位索引位置，如果为负数，则从source.length+fromIndex往前开始查找
 * @see baidu.array.indexOf
 *             
 * @returns {number} 指定元素的索引位置，查询不到时返回-1
 */

baidu.array.lastIndexOf = function (source, match, fromIndex) {
    var len = source.length;

    fromIndex = fromIndex | 0;

    if(!fromIndex || fromIndex >= len){
        fromIndex = len - 1;
    }
    if(fromIndex < 0){
        fromIndex += len;
    }
    for(; fromIndex >= 0; fromIndex --){
        if(fromIndex in source && source[fromIndex] === match){
            return fromIndex;
        }
    }
    
    return -1;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 遍历数组中所有元素，将每一个元素应用方法进行转换，并返回转换后的新数组。
 * @name baidu.array.map
 * @function
 * @grammar baidu.array.map(source, iterator[, thisObject])
 * @param {Array}    source   需要遍历的数组.
 * @param {Function} iterator 对每个数组元素进行处理的函数.
 * @param {Object} [thisObject] 函数调用时的this指针，如果没有此参数，默认是当前遍历的数组
 * @return {Array} map后的数组.
 * @see baidu.array.reduce
 */
baidu.array.map = function(source, iterator, thisObject) {
    var results = [],
        i = 0,
        l = source.length;
    for (; i < l; i++) {
        results[i] = iterator.call(thisObject || source, source[i], i);
    }
    return results;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 遍历数组中所有元素，将每一个元素应用方法进行合并，并返回合并后的结果。
 * @name baidu.array.reduce
 * @function
 * @grammar baidu.array.reduce(source, iterator[, initializer])
 * @param {Array}    source 需要遍历的数组.
 * @param {Function} iterator 对每个数组元素进行处理的函数，函数接受四个参数：上一次reduce的结果（或初始值），当前元素值，索引值，整个数组.
 * @param {Object}   [initializer] 合并的初始项，如果没有此参数，默认用数组中的第一个值作为初始值.
 * @return {Array} reduce后的值.
 * @version 1.3.4
 * @see baidu.array.reduce
 */
baidu.array.reduce = function(source, iterator, initializer) {
    var i = 0,
        l = source.length,
        found = 0;

    if( arguments.length < 3){
        //没有initializer的情况，找到第一个可用的值
        for(; i < l; i++){
            initializer = source[i++];
            found = 1;
            break;
        }
        if(!found){
            return ;
        }
    }

    for (; i < l; i++) {
        if( i in source){
            initializer = iterator(initializer, source[i] , i , source);
        }
    }
    return initializer;
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
 * @param {Any} match 要移除的项
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
 */



/**
 * 判断一个数组中是否有部分元素满足给定条件
 * @name baidu.array.some
 * @function
 * @grammar baidu.array.some(source, iterator[,thisObject])
 * @param {Array} source 需要判断的数组.
 * @param {Function} iterator 判断函数.
 * @param {Object} [thisObject] 函数调用时的this指针，如果没有此参数，默认是当前遍历的数组
 * @return {boolean} 判断结果.
 * @see baidu.array.every
 */
baidu.array.some = function(source, iterator, thisObject) {
    var i = 0,
        len = source.length;
    for (; i < len; i++) {
        if (i in source && iterator.call(thisObject || source, source[i], i)) {
            return true;
        }
    }
    return false;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/array/unique.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * 过滤数组中的相同项。如果两个元素相同，会删除后一个元素。
 * @name baidu.array.unique
 * @function
 * @grammar baidu.array.unique(source[, compareFn])
 * @param {Array} source 需要过滤相同项的数组
 * @param {Function} [compareFn] 比较两个数组项是否相同的函数,两个数组项作为函数的参数。
 *             
 * @returns {Array} 过滤后的新数组
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */


/**
 * 对异步调用的封装
 * @namespace baidu.async
 * @author rocy
 */
baidu.async = baidu.async || {};
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
 * 操作原生对象的方法
 * @namespace baidu.object
 */
baidu.object = baidu.object || {};
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
 * path: baidu/lang.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/02
 */


/**
 * 对语言层面的封装，包括类型判断、模块扩展、继承基类以及对象自定义事件的支持。
 * @namespace baidu.lang
 */
baidu.lang = baidu.lang || {};
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
 */



/**
 * 判断给定object是否包含Deferred主要特征.
 * @param {Object} obj 待判定object.
 * @return {Boolean} 判定结果, true 则该object符合Deferred特征.
 * @private 
 * @author rocy
 */
baidu.async._isDeferred = function(obj) {
    var isFn = baidu.lang.isFunction;
    return obj && isFn(obj.success) && isFn(obj.then)
        && isFn(obj.fail) && isFn(obj.cancel);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */






/**
 * 用于支持异步处理, 使同步异步的调用风格统一.
 * @class
 * @private
 * @grammar new baidu.async.Deferred()
 * @remark
 * 示例:
    function someAsync(){
        var deferred = new baidu.async.Deferred();
        setTimeout(function(){
            afterSomeOperation();
            if(someReason){
                deferred.resolve(someValue);
            } else {
                deferred.reject(someError);
            }
        },100);
        return deferred;
    }
    //用类似同步的方式调用异步操作.
    someAsync().then(onSuccess, onFail);
    //onSuccess或onFail可以确保在正确的时间点执行.

 * @author rocy
 */
baidu.async.Deferred = function() {
    var me = this;
    baidu.extend(me, {
        _fired: 0,
        _firing: 0,
        _cancelled: 0,
        _resolveChain: [],
        _rejectChain: [],
        _result: [],
        _isError: 0
    });

    function fire() {
        if (me._cancelled || me._firing) {
            return;
        }
        //如果已有nextDeferred对象,则转移到nextDeferred上.
        if (me._nextDeferred) {
            me._nextDeferred.then(me._resolveChain[0], me._rejectChain[0]);
            return;
        }
        me._firing = 1;
        var chain = me._isError ? me._rejectChain : me._resolveChain,
            result = me._result[me._isError ? 1 : 0];
        // 此处使用while而非for循环,是为了避免firing时插入新函数.
        while (chain[0] && (! me._cancelled)) {
            //所有函数仅调用一次.
            //TODO: 支持传入 this 和 arguments, 而不是仅仅一个值.
            try {
                var chainResult = chain.shift().call(me, result);
                //若方法返回Deferred,则将剩余方法延至Deferred中执行
                if (baidu.async._isDeferred(chainResult)) {
                    me._nextDeferred = chainResult;
                    [].push.apply(chainResult._resolveChain, me._resolveChain);
                    [].push.apply(chainResult._rejectChain, me._rejectChain);
                    chain = me._resolveChain = [];
                    me._rejectChain = [];
                }
            } catch (error) {
                throw error;
            } finally {
                me._fired = 1;
                me._firing = 0;
            }
        }
    }


    /**
     * 调用onSuccess链.使用给定的value作为函数参数.
     * @param {*} value 成功结果.
     * @return {baidu.async.Deferred} this.
     */
    me.resolve = me.fireSuccess = function(value) {
        me._result[0] = value;
        fire();
        return me;
    };

    /**
     * 调用onFail链. 使用给定的error作为函数参数.
     * @param {Error} error 失败原因.
     * @return {baidu.async.Deferred} this.
     */
    me.reject = me.fireFail = function(error) {
        me._result[1] = error;
        me._isError = 1;
        fire();
        return me;
    };

    /**
     * 添加onSuccess和onFail方法到各自的链上. 如果该deferred已触发,则立即执行.
     * @param {Function} onSuccess 该deferred成功时的回调函数.第一个形参为成功时结果.
     * @param {Function} onFail 该deferred失败时的回调函数.第一个形参为失败时结果.
     * @return {baidu.async.Deferred} this.
     */
    me.then = function(onSuccess, onFail) {
        me._resolveChain.push(onSuccess);
        me._rejectChain.push(onFail);
        if (me._fired) {
            fire();
        }
        return me;
    };
    
    /**
     * 添加方法到onSuccess链上. 如果该deferred已触发,则立即执行.
     * @param {Function} onSuccess 该deferred成功时的回调函数.第一个形参为成功时结果.
     * @return {baidu.async.Deferred} this.
     */
    me.success = function(onSuccess) {
        return me.then(onSuccess, baidu.fn.blank);
    };

    /**
     * 添加方法到onFail链上. 如果该deferred已触发,则立即执行.
     * @param {Function} onFail 该deferred失败时的回调函数.第一个形参为失败时结果.
     * @return {baidu.async.Deferred} this.
     */
    me.fail = function(onFail) {
        return me.then(baidu.fn.blank, onFail);
    };
     
    /**
     * 中断该deferred, 使其失效.
     */
    me.cancel = function() {
        me._cancelled = 1;
    };
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 支持异步的ajax.get封装.
 * @grammar baidu.async.Deferred(url)
 * @param {String} url 请求地址.
 * @version 1.3.9 
 * @return {baidu.async.Deferred} Deferred对象,支持链式调用.
 */
baidu.async.get = function(url){
    var deferred = new baidu.async.Deferred();
    baidu.ajax.request(url, {
        onsuccess: function(xhr, responseText) {
            deferred.resolve({xhr: xhr, responseText: responseText}); 
        },
        onfailure: function(xhr) {
            deferred.reject({xhr: xhr});
        }
    });
    return deferred;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 支持异步的ajax.post封装.
 * @grammar baidu.async.post(url, data)
 * @param {String} url 请求地址.
 * @param {String} data 请求数据.
 * @version 1.3.9 
 * @return {baidu.async.Deferred} Deferred对象,支持链式调用.
 */
baidu.async.post = function(url, data){
    var deferred = new baidu.async.Deferred();
    baidu.ajax.request(url, {
        method: 'POST',
        data: data,
        onsuccess: function(xhr, responseText) {
            deferred.resolve({xhr: xhr, responseText: responseText}); 
        },
        onfailure: function(xhr) {
            deferred.reject({xhr: xhr});
        }
    });
    return deferred;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 保证onResolve或onReject可以按序执行. 若第一个参数为deferred,则deferred完成后执行.否则立即执行onResolve,并传入第一个参数.
 * @grammar baidu.async.when(deferredOrValue, onResolve, onReject)
 * @param {baidu.async.Deferred|*} deferredOrValue deferred实例或任意值.
 * @param {Function} onResolve 成功时的回调函数.若第一个参数不是Deferred实例,则立即执行此方法.
 * @param {Function} onReject 失败时的回调函数.
 * @version 1.3.9 
 * @remark
 * 示例一:异步调用: baidu.async.when(asyncLoad(), onResolve, onReject).then(nextSuccess, nextFail);
 * 示例二:同步异步不确定的调用: baidu.async.when(syncOrNot(), onResolve, onReject).then(nextSuccess, nextFail);
 * 示例三:同步接异步的调用: baidu.async.when(sync(), onResolve, onReject).then(asyncSuccess, asyncFail).then(afterAllSuccess, afterAllFail);
 * @return {baidu.async.Deferred} deferred.
 */
baidu.async.when = function(deferredOrValue, onResolve, onReject) {
    if (baidu.async._isDeferred(deferredOrValue)) {
        deferredOrValue.then(onResolve, onReject);
        return deferredOrValue;
    }
    var deferred = new baidu.async.Deferred();
    deferred.then(onResolve, onReject).resolve(deferredOrValue);
    return deferred;
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
 * 判断浏览器类型和特性的属性
 * @namespace baidu.browser
 */
baidu.browser = baidu.browser || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 判断是否为chrome浏览器
 * @grammar baidu.browser.chrome
 * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.safari,baidu.browser.opera   
 * @property chrome chrome版本号
 * @return {Number} chrome版本号
 */
baidu.browser.chrome = /chrome\/(\d+\.\d+)/i.test(navigator.userAgent) ? + RegExp['\x241'] : undefined;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 判断是否为firefox浏览器
 * @property firefox firefox版本号
 * @grammar baidu.browser.firefox
 * @meta standard
 * @see baidu.browser.ie,baidu.browser.safari,baidu.browser.opera,baidu.browser.chrome
 * @return {Number} firefox版本号
 */
baidu.browser.firefox = /firefox\/(\d+\.\d+)/i.test(navigator.userAgent) ? + RegExp['\x241'] : undefined;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



//IE 8下，以documentMode为准
//在百度模板中，可能会有$，防止冲突，将$1 写成 \x241
/**
 * 判断是否为ie浏览器
 * @name baidu.browser.ie
 * @field
 * @grammar baidu.browser.ie
 * @returns {Number} IE版本号
 */
baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || + RegExp['\x241']) : undefined;
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
 * @returns {Boolean} 布尔值
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
 * @returns {Boolean} 布尔值
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
 * @returns {Boolean} 布尔值
 */
baidu.browser.isWebkit = /webkit/i.test(navigator.userAgent);
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/maxthon.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */



try {
    if (/(\d+\.\d+)/.test(external.max_version)) {
/**
 * 判断是否为maxthon浏览器
 * @property maxthon maxthon版本号
 * @grammar baidu.browser.maxthon
 * @see baidu.browser.ie
 * @returns {Number} maxthon版本号
 */
        baidu.browser.maxthon = + RegExp['\x241'];
    }
} catch (e) {}
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/browser/opera.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/23
 */



/**
 * 判断是否为opera浏览器
 * @property opera opera版本号
 * @grammar baidu.browser.opera
 * @meta standard
 * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.safari,baidu.browser.chrome
 * @returns {Number} opera版本号
 */

/**
 * opera 从10开始不是用opera后面的字符串进行版本的判断
 * 在Browser identification最后添加Version + 数字进行版本标识
 * opera后面的数字保持在9.80不变
 */
baidu.browser.opera = /opera(\/| )(\d+(\.\d+)?)(.+?(version\/(\d+(\.\d+)?)))?/i.test(navigator.userAgent) ?  + ( RegExp["\x246"] || RegExp["\x242"] ) : undefined;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



(function(){
    var ua = navigator.userAgent;
    /*
     * 兼容浏览器为safari或ipad,其中,一段典型的ipad UA 如下:
     * Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10
     */
    
    /**
     * 判断是否为safari浏览器, 支持ipad
     * @property safari safari版本号
     * @grammar baidu.browser.safari
     * @meta standard
     * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.opera,baidu.browser.chrome   
     */
    baidu.browser.safari = /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua) ? + (RegExp['\x241'] || RegExp['\x242']) : undefined;
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
 * 操作cookie的方法
 * @namespace baidu.cookie
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
 * path: baidu/date.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/04
 */


/**
 * 操作日期的方法
 * @namespace baidu.date
 */
baidu.date = baidu.date || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/number.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/2
 */


/**
 * 操作number的方法
 * @namespace baidu.number
 */
baidu.number = baidu.number || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/number/pad.js
 * author: dron, erik, berg
 * version: 1.1.0
 * date: 20100412
 */



/**
 * 对目标数字进行0补齐处理
 * @name baidu.number.pad
 * @function
 * @grammar baidu.number.pad(source, length)
 * @param {number} source 需要处理的数字
 * @param {number} length 需要输出的长度
 *             
 * @returns {string} 对目标数字进行0补齐处理后的结果
 */
baidu.number.pad = function (source, length) {
    var pre = "",
        negative = (source < 0),
        string = String(Math.abs(source));

    if (string.length < length) {
        pre = (new Array(length - string.length + 1)).join('0');
    }

    return (negative ?  "-" : "") + pre + string;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/date/format.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/04
 */




/**
 * 对目标日期对象进行格式化
 * @name baidu.date.format
 * @function
 * @grammar baidu.date.format(source, pattern)
 * @param {Date} source 目标日期对象
 * @param {string} pattern 日期格式化规则
 * @remark
 * 
<b>格式表达式，变量含义：</b><br><br>
hh: 带 0 补齐的两位 12 进制时表示<br>
h: 不带 0 补齐的 12 进制时表示<br>
HH: 带 0 补齐的两位 24 进制时表示<br>
H: 不带 0 补齐的 24 进制时表示<br>
mm: 带 0 补齐两位分表示<br>
m: 不带 0 补齐分表示<br>
ss: 带 0 补齐两位秒表示<br>
s: 不带 0 补齐秒表示<br>
yyyy: 带 0 补齐的四位年表示<br>
yy: 带 0 补齐的两位年表示<br>
MM: 带 0 补齐的两位月表示<br>
M: 不带 0 补齐的月表示<br>
dd: 带 0 补齐的两位日表示<br>
d: 不带 0 补齐的日表示
		
 *             
 * @returns {string} 格式化后的字符串
 */

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
    replacer(/yy/g, pad(parseInt(year.toString().slice(2), 10), 2));
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/date/parse.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/04
 */



/**
 * 将目标字符串转换成日期对象
 * @name baidu.date.parse
 * @function
 * @grammar baidu.date.parse(source)
 * @param {string} source 目标字符串
 * @remark
 * 
对于目标字符串，下面这些规则决定了 parse 方法能够成功地解析： <br>
<ol>
<li>短日期可以使用“/”或“-”作为日期分隔符，但是必须用月/日/年的格式来表示，例如"7/20/96"。</li>
<li>以 "July 10 1995" 形式表示的长日期中的年、月、日可以按任何顺序排列，年份值可以用 2 位数字表示也可以用 4 位数字表示。如果使用 2 位数字来表示年份，那么该年份必须大于或等于 70。 </li>
<li>括号中的任何文本都被视为注释。这些括号可以嵌套使用。 </li>
<li>逗号和空格被视为分隔符。允许使用多个分隔符。 </li>
<li>月和日的名称必须具有两个或两个以上的字符。如果两个字符所组成的名称不是独一无二的，那么该名称就被解析成最后一个符合条件的月或日。例如，"Ju" 被解释为七月而不是六月。 </li>
<li>在所提供的日期中，如果所指定的星期几的值与按照该日期中剩余部分所确定的星期几的值不符合，那么该指定值就会被忽略。例如，尽管 1996 年 11 月 9 日实际上是星期五，"Tuesday November 9 1996" 也还是可以被接受并进行解析的。但是结果 date 对象中包含的是 "Friday November 9 1996"。 </li>
<li>JScript 处理所有的标准时区，以及全球标准时间 (UTC) 和格林威治标准时间 (GMT)。</li> 
<li>小时、分钟、和秒钟之间用冒号分隔，尽管不是这三项都需要指明。"10:"、"10:11"、和 "10:11:12" 都是有效的。 </li>
<li>如果使用 24 小时计时的时钟，那么为中午 12 点之后的时间指定 "PM" 是错误的。例如 "23:15 PM" 就是错误的。</li> 
<li>包含无效日期的字符串是错误的。例如，一个包含有两个年份或两个月份的字符串就是错误的。</li>
</ol>
		
 *             
 * @returns {Date} 转换后的日期对象
 */

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
 * 操作dom的方法
 * @namespace baidu.dom 
 */
baidu.dom = baidu.dom || {};
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
 * @param {string|HTMLElement} id 元素的id或DOM元素.
 * @shortcut g,T.G
 * @meta standard
 * @see baidu.dom.q
 *
 * @return {HTMLElement|null} 获取的元素，查找不到时返回null,如果参数不合法，直接返回参数.
 */
baidu.dom.g = function(id) {
    if (!id) return null; //修改IE下baidu.dom.g(baidu.dom.g('dose_not_exist_id'))报错的bug，by Meizz, dengping
    if ('string' == typeof id || id instanceof String) {
        return document.getElementById(id);
    } else if (id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
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
 * path: baidu/string.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */


/**
 * 操作字符串的方法
 * @namespace baidu.string
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
 * @returns {HTMLElement} 创建的 Element 对象
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
baidu.lang.guid = function() {
    return "TANGRAM$" + baidu.$$._counter ++;
};

//不直接使用window，可以提高3倍左右性能
baidu.$$._counter = baidu.$$._counter || 1;


// 20111129	meizz	去除 _counter.toString(36) 这步运算，节约计算量
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
 * Tangram继承机制提供的一个基类，用户可以通过继承baidu.lang.Class来获取它的属性及方法。
 * @class
 * @name 	baidu.lang.Class
 * @grammar baidu.lang.Class(guid)
 * @param 	{string}	guid	对象的唯一标识
 * @meta standard
 * @remark baidu.lang.Class和它的子类的实例均包含一个全局唯一的标识guid。guid是在构造函数中生成的，因此，继承自baidu.lang.Class的类应该直接或者间接调用它的构造函数。<br>baidu.lang.Class的构造函数中产生guid的方式可以保证guid的唯一性，及每个实例都有一个全局唯一的guid。
 * @meta standard
 * @see baidu.lang.inherits,baidu.lang.Event
 */
baidu.lang.Class = function() {
    this.guid = baidu.lang.guid();

    !this.__decontrolled && (baidu.$$._instances[this.guid] = this);
};

baidu.$$._instances = baidu.$$._instances || {};

/**
 * 释放对象所持有的资源，主要是自定义事件。
 * @name dispose
 * @grammar obj.dispose()
 * TODO: 将_listeners中绑定的事件剔除掉
 */
baidu.lang.Class.prototype.dispose = function(){
    delete baidu.$$._instances[this.guid];

    // this.__listeners && (for (var i in this.__listeners) delete this.__listeners[i]);

    for(var property in this){
        typeof this[property] != "function" && delete this[property];
    }
    this.disposed = true;   // 20100716
};

/**
 * 重载了默认的toString方法，使得返回信息更加准确一些。
 * 20111219 meizz 为支持老版本的className属性，以后统一改成 __type
 * @return {string} 对象的String表示形式
 */
baidu.lang.Class.prototype.toString = function(){
    return "[object " + (this.__type || this._className || "Object") + "]";
};

/**
 * 按唯一标识guid字符串取得实例对象
 *
 * @param   {String}    guid
 * @return  {object}            实例对象
 */
 window["baiduInstance"] = function(guid) {
     return baidu.$$._instances[guid];
 }

//  2011.11.23  meizz   添加 baiduInstance 这个全局方法，可以快速地通过guid得到实例对象
//  2011.11.22  meizz   废除创建类时指定guid的模式，guid只作为只读属性
//  2011.11.22  meizz   废除 baidu.lang._instances 模块，由统一的global机制完成；
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/Class/removeEventListener.js
 * author: meizz
 * version: 1.6.0
 * date: 2011/11/23
 * modify: 2011/11/23
 */



 
/**
 * 移除对象的事件监听器。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
 * 事件移除操作是一个不常用的方法，如果你有需求再import调入，可以节约代码
 * 可能通过参数走不同的分支：不传handler会移除某类事件监听；如果连type都不传那就移除当前实例的全部事件监听
 *
 * @grammar obj.removeEventListener(type, handler)
 * @param {string}   type     事件类型
 * @param {Function} handler  要移除的事件监听函数或者监听函数的key
 * @remark 	如果第二个参数handler没有被绑定到对应的自定义事件中，什么也不做。
 */
baidu.lang.Class.prototype.un =
baidu.lang.Class.prototype.removeEventListener = function (type, handler) {
    var i,
        t = this.__listeners;
    if (!t) return;

    // remove all event listener
    if (typeof type == "undefined") {
        for (i in t) {
            delete t[i];
        }
        return;
    }

    type.indexOf("on") && (type = "on" + type);

    // 移除某类事件监听
    if (typeof handler == "undefined") {
        delete t[type];
    } else if (t[type]) {
        // [TODO delete 2013] 支持按 key 删除注册的函数
        typeof handler=="string" && (handler=t[type][handler]) && delete t[type][handler];

        for (i = t[type].length - 1; i >= 0; i--) {
            if (t[type][i] === handler) {
                t[type].splice(i, 1);
            }
        }
    }
};

// 2011.12.19 meizz 为兼容老版本的按 key 删除，添加了一行代码
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/Event.js
 * author: meizz, erik, berg
 * version: 1.6.0
 * date: 2009/11/24
 * modify: 2011/11/24 meizz
 */





/**
 * 自定义的事件对象。
 * @class
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
 * 派发自定义事件，使得绑定到自定义事件上面的函数都会被执行。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
 * @grammar obj.dispatchEvent(event, options)
 * @param {baidu.lang.Event|String} event 	Event对象，或事件名称(1.1.1起支持)
 * @param {Object} 					options 扩展参数,所含属性键值会扩展到Event对象上(1.2起支持)
 * @remark 处理会调用通过addEventListenr绑定的自定义事件回调函数之外，还会调用直接绑定到对象上面的自定义事件。例如：<br>
myobj.onMyEvent = function(){}<br>
myobj.addEventListener("onMyEvent", function(){});
 */
baidu.lang.Class.prototype.fire =
baidu.lang.Class.prototype.dispatchEvent = function (event, options) {
    baidu.lang.isString(event) && (event = new baidu.lang.Event(event));

    !this.__listeners && (this.__listeners = {});

    // 20100603 添加本方法的第二个参数，将 options extend到event中去传递
    options = options || {};
    for (var i in options) {
        event[i] = options[i];
    }

    var i, n, me = this, t = me.__listeners, p = event.type;
    event.target = event.target || (event.currentTarget = me);

    // 支持非 on 开头的事件名
    p.indexOf("on") && (p = "on" + p);

    typeof me[p] == "function" && me[p].apply(me, arguments);

    if (typeof t[p] == "object") {
        for (i=0, n=t[p].length; i<n; i++) {
            t[p][i] && t[p][i].apply(me, arguments);
        }
    }
    return event.returnValue;
};

/**
 * 注册对象的事件监听器。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
 * @grammar obj.addEventListener(type, handler[, key])
 * @param   {string}   type         自定义事件的名称
 * @param   {Function} handler      自定义事件被触发时应该调用的回调函数
 * @return  {Function}              将用户注入的监听函数返回，以便移除事件监听，特别适用于匿名函数。
 * @remark  事件类型区分大小写。如果自定义事件名称不是以小写"on"开头，该方法会给它加上"on"再进行判断，即"click"和"onclick"会被认为是同一种事件。 
 */
baidu.lang.Class.prototype.on =
baidu.lang.Class.prototype.addEventListener = function (type, handler, key) {
    if (typeof handler != "function") {
        return;
    }

    !this.__listeners && (this.__listeners = {});

    var i, t = this.__listeners;

    type.indexOf("on") && (type = "on" + type);

    typeof t[type] != "object" && (t[type] = []);

    // 避免函数重复注册
    for (i = t[type].length - 1; i >= 0; i--) {
        if (t[type][i] === handler) return handler;
    };

    t[type].push(handler);

    // [TODO delete 2013] 2011.12.19 兼容老版本，2013删除此行
    key && typeof key == "string" && (t[type][key] = handler);

    return handler;
};

//  2011.12.19  meizz   很悲剧，第三个参数 key 还需要支持一段时间，以兼容老版本脚本
//  2011.11.24  meizz   事件添加监听方法 addEventListener 移除第三个参数 key，添加返回值 handler
//  2011.11.23  meizz   事件handler的存储对象由json改成array，以保证注册函数的执行顺序
//  2011.11.22  meizz   将 removeEventListener 方法分拆到 baidu.lang.Class.removeEventListener 中，以节约主程序代码
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/createSingle.js
 * author: meizz, berg
 * version: 1.1.2
 * date: 2010-05-13
 */






/**
 * 创建一个baidu.lang.Class的单例实例
 * @name baidu.lang.createSingle
 * @function
 * @grammar baidu.lang.createSingle(json)
 * @param {Object} json 直接挂载到这个单例里的预定属性/方法
 * @version 1.2
 * @see baidu.lang.Class
 *             
 * @returns {Object} 一个实例
 */
baidu.lang.createSingle = function (json) {
    var c = new baidu.lang.Class();

    for (var key in json) {
        c[key] = json[key];
    }
    return c;
};

/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/dragManager.js
 * author: rocy
 * version: 1.4.0
 * date: 2010/10/14
 */




/**
 * 拖曳管理器
 * @function
 * @param   {HTMLElement|ID}    element 被拖曳的元素
 * @param   {JSON}              options 拖曳配置项 {toggle, autoStop, interval, capture, range, ondragstart, ondragend, ondrag}
 * @return {DOMElement}                 可拖拽的元素
 * @private
 */
baidu.dom.ddManager = baidu.lang.createSingle({
	_targetsDroppingOver:{}
});
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

// 20111204 meizz   去掉一个无用的import baidu.browser.ie
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
    if (!value || value == 'auto') {
        var fixer = dom._styleFixer[key];
        if(fixer){
            value = fixer.get ? fixer.get(element, key, value) : baidu.dom.getStyle(element, fixer);
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
 * path: baidu/event.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * 屏蔽浏览器差异性的事件封装
 * @namespace baidu.event
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
 * @returns {HTMLElement|window} 目标元素
 */
baidu.event.on = /**@function*/function (element, type, listener) {
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
 * path: baidu/page.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/17
 */


/**
 * 对页面层面的封装，包括页面的高宽属性、以及外部css和js的动态添加
 * @namespace baidu.page
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
/**
 * 获取横向滚动量
 * @name baidu.page.getScrollLeft
 * @function
 * @grammar baidu.page.getScrollLeft()
 * @see baidu.page.getScrollTop
 *             
 * @returns {number} 横向滚动量
 */
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/page/getScrollLeft.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/17
 */



/**
 * 获取横向滚动量
 * 
 * @return {number} 横向滚动量
 */
baidu.page.getScrollLeft = function () {
    var d = document;
    return window.pageXOffset || d.documentElement.scrollLeft || d.body.scrollLeft;
};
/**
 * 获得页面里的目前鼠标所在的坐标
 * @name baidu.page.getMousePosition
 * @function
 * @grammar baidu.page.getMousePosition()
 * @version 1.2
 *             
 * @returns {object} 鼠标坐标值{x:[Number], y:[Number]}
 */
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path: baidu/page/getMousePosition.js
 * author: meizz
 * version: 1.1.0
 * date: 2010/06/02
 */




/**
 * 取得当前页面里的目前鼠标所在的坐标（x y）
 *
 * @return  {JSON}  当前鼠标的坐标值({x, y})
 */
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
 * Copyright 2010 Baidu Inc. All rights reserved.
 *
 * path: baidu/dom/drag.js
 * author: meizz
 * modify: linlingyu
 * version: 1.1.0
 * date: 2010/06/02
 */

/**
 * 拖动指定的DOM元素
 * @name baidu.dom.drag
 * @function
 * @grammar baidu.dom.drag(element, options)
 * @param {HTMLElement|string} element 元素或者元素的id.
 * @param {Object} options 拖曳配置项.

 * @param {Array} options.range 限制drag的拖拽范围，数组中必须包含四个值，分别是上、右、下、左边缘相对上方或左方的像素距离。默认无限制.
 * @param {Number} options.interval 拖曳行为的触发频度（时间：毫秒）.
 * @param {Boolean} options.capture 鼠标拖曳粘滞.
 * @param {Object} options.mouseEvent 键名为clientX和clientY的object，若不设置此项，默认会获取当前鼠标位置.
 * @param {Function} options.ondragstart drag开始时触发.
 * @param {Function} options.ondrag drag进行中触发.
 * @param {Function} options.ondragend drag结束时触发.
 * @param {function} options.autoStop 是否在onmouseup时自动停止拖拽。默认为true.
 * @version 1.2
 * @remark
 * 要拖拽的元素必须事先设定样式的postion值，如果postion为absloute，并且没有设定top和left，拖拽开始时，无法取得元素的top和left值，这时会从[0,0]点开始拖拽

 * @see baidu.dom.draggable
 */













(function(){
    var target, // 被拖曳的DOM元素
        op, ox, oy, timer, left, top, lastLeft, lastTop, mozUserSelect;
    baidu.dom.drag = function(element, options){
        if(!(target = baidu.dom.g(element))){return false;}
        op = baidu.object.extend({
            autoStop: true, // false 用户手动结束拖曳 ｜ true 在mouseup时自动停止拖曳
            capture: true,  // 鼠标拖曳粘滞
            interval: 16    // 拖曳行为的触发频度（时间：毫秒）
        }, options);
        lastLeft = left = parseInt(baidu.dom.getStyle(target, 'left')) || 0;
        lastTop = top = parseInt(baidu.dom.getStyle(target, 'top')) || 0;
        setTimeout(function(){
            var mouse = baidu.page.getMousePosition();  // 得到当前鼠标坐标值
            ox = op.mouseEvent ? (baidu.page.getScrollLeft() + op.mouseEvent.clientX) : mouse.x;
            oy = op.mouseEvent ? (baidu.page.getScrollTop() + op.mouseEvent.clientY) : mouse.y;
            clearInterval(timer);
            timer = setInterval(render, op.interval);
        }, 1);
        // 这项为 true，缺省在 onmouseup 事件终止拖曳
        op.autoStop && baidu.event.on(document, 'mouseup', stop);
        // 在拖曳过程中页面里的文字会被选中高亮显示，在这里修正
        baidu.event.on(document, 'selectstart', unselect);
        // 设置鼠标粘滞
        if (op.capture && target.setCapture) {
            target.setCapture();
        } else if (op.capture && window.captureEvents) {
            window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
        }
        // fixed for firefox
        mozUserSelect = document.body.style.MozUserSelect;
        document.body.style.MozUserSelect = 'none';
        baidu.lang.isFunction(op.ondragstart)
            && op.ondragstart(target, op);
        return {
            stop: stop, dispose: stop,
            update: function(options){
                baidu.object.extend(op, options);
            }
        }
    }
    // 停止拖曳
    function stop() {
        clearInterval(timer);
        // 解除鼠标粘滞
        if (op.capture && target.releaseCapture) {
            target.releaseCapture();
        } else if (op.capture && window.captureEvents) {
            window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
        }
        // 拖曳时网页内容被框选
        document.body.style.MozUserSelect = mozUserSelect;
        baidu.event.un(document, 'selectstart', unselect);
        op.autoStop && baidu.event.un(document, 'mouseup', stop);
        // ondragend 事件
        baidu.lang.isFunction(op.ondragend)
            && op.ondragend(target, op, {left: lastLeft, top: lastTop});
    }
    // 对DOM元素进行top/left赋新值以实现拖曳的效果
    function render(e) {
        var rg = op.range || [],
            mouse = baidu.page.getMousePosition(),
            el = left + mouse.x - ox,
            et = top  + mouse.y - oy;

        // 如果用户限定了可拖动的范围
        if (baidu.lang.isObject(rg) && rg.length == 4) {
            el = Math.max(rg[3], el);
            el = Math.min(rg[1] - target.offsetWidth, el);
            et = Math.max(rg[0], et);
            et = Math.min(rg[2] - target.offsetHeight, et);
        }
        target.style.left = el + 'px';
        target.style.top  = et + 'px';
        lastLeft = el;
        lastTop = et;
        baidu.lang.isFunction(op.ondrag)
            && op.ondrag(target, op, {left: lastLeft, top: lastTop});
    }
    // 对document.body.onselectstart事件进行监听，避免拖曳时文字被选中
    function unselect(e) {
        return baidu.event.preventDefault(e, false);
    }
})();
// [TODO] 20100625 添加cursorAt属性，absolute定位的定位的元素在不设置top|left值时，初始值有问题，得动态计算
// [TODO] 20101101 在drag方法的返回对象中添加 dispose() 方法析构drag
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
    (fixer && fixer.set) ? fixer.set(element, value, key) : (element.style[fixer || key] = value);

    return element;
};

// 声明快捷方法
baidu.setStyle = baidu.dom.setStyle;
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 */














/**
 * 让一个DOM元素可拖拽
 * @name baidu.dom.draggable
 * @function
 * @grammar baidu.dom.draggable(element[, options])
 * @param  {string|HTMLElement}   element 		        元素或者元素的ID.
 * @param  {Object} 		      [options] 			选项.
 * @config {Array} 		          [range] 		        限制drag的拖拽范围，数组中必须包含四个值，分别是上、右、下、左边缘相对上方或左方的像素距离。默认无限制.
 * @config {Number} 	          [interval] 	        拖曳行为的触发频度（时间：毫秒）.
 * @config {Boolean} 	          [capture] 	        鼠标拖曳粘滞.
 * @config {Object} 	          [mouseEvent] 	        键名为clientX和clientY的object，若不设置此项，默认会获取当前鼠标位置.
 * @config {Function} 	          [onbeforedragstart]   drag开始前触发（即鼠标按下时）.
 * @config {Function} 	          [ondragstart]         drag开始时触发.
 * @config {Function} 	          [ondrag] 		        drag进行中触发.
 * @config {Function} 	          [ondragend] 	        drag结束时触发.
 * @config {HTMLElement}          [handler] 	        用于拖拽的手柄，比如dialog的title.
 * @config {Function} 	          [toggle] 		        在每次ondrag的时候，会调用这个方法判断是否应该停止拖拽。如果此函数返回值为false，则停止拖拽.
 * @version 1.2
 * @remark    要拖拽的元素必须事先设定样式的postion值，如果postion为absloute，并且没有设定top和left，拖拽开始时，无法取得元素的top和left值，这时会从[0,0]点开始拖拽.
 * @see baidu.dom.drag
 * @returns {Draggable Instance} 拖拽实例，包含cancel方法，可以停止拖拽.
 */

baidu.dom.draggable = function(element, options) {
    options = baidu.object.extend({toggle: function() {return true}}, options);
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
            options.mouseEvent = {clientX: event.clientX, clientY: event.clientY};
            if (event.button > 1 //只支持鼠标左键拖拽; 左键代码: IE为1,W3C为0
                // 可以通过配置项里的这个开关函数暂停或启用拖曳功能
                || (baidu.lang.isFunction(options.toggle) && !options.toggle())) {
                return;
            }
//            if (baidu.dom.getStyle(element, 'position') == 'static') {
//                baidu.dom.setStyle(element, 'position', 'relative');
//            }
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
 * path: baidu/dom/intersect.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/12/02
 */




/**
 * 检查两个元素是否相交
 * @name baidu.dom.intersect
 * @function
 * @grammar baidu.dom.intersect(element1, element2)
 * @param {HTMLElement|string} element1 要检查的元素或元素的id
 * @param {HTMLElement|string} element2 要检查的元素或元素的id
 * @see baidu.dom.contains
 *             
 * @returns {boolean} 两个元素是否相交的检查结果
 */
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
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/droppable.js
 * author: rocy
 * version: 1.4.0
 * date: 2010/10/14
 */








//TODO: 添加对 accept, hoverclass 等参数的支持.
/**
 * 让一个DOM元素可以容纳被拖拽的DOM元素
 * @name baidu.dom.droppable
 * @function
 * @grammar baidu.dom.droppable(element[, options])
 * @param {HTMLElement|string} element 容器元素或者容器元素的ID
 * @param {Object} [options] 选项，拖拽元素对于容器元素的事件
                
 * @config {Function} [ondrop] 当元素放到容器元素内部触发
 * @config {Function} [ondropover] 当元素在容器元素上方时触发
 * @config {Function} [ondropout] 当元素移除容器元素时触发
 * @version 1.3
 * @remark
 * 
            需要将元素和容器元素的定位都设置为absolute
        
 * @see baidu.dom.droppable
 *             
 * @returns {Function} cancel取消拖拽
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/empty.js
 * author: berg
 * version: 1.0
 * date: 2010-07-06
 */

/**
 * 删除一个节点下面的所有子节点。
 * @name baidu.dom.empty
 * @function
 * @grammar baidu.dom.empty(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @version 1.3
 *             
 * @returns {HTMLElement} 目标元素
        
 */



baidu.dom.empty = function (element) {
    element = baidu.dom.g(element);
    
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
    //todo：删除元素上绑定的事件等?

    return element;
};
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
 * Copyright 2010 Baidu Inc. All right reserved.
 */
















/**
 * 使目标元素拥有可进行与页面可见区域相对位置保持不变的移动的能力
 * @name baidu.dom.fixable
 * @grammar baidu.dom.fixable(element, options)
 * @param {HTMLElement|String} element 目标元素或目标元素的id
 * @param {Object} options 配置项
 * @config {String} [vertival] 取值[top|bottom] 默认值 top
 * @config {Strgin} [horizontal] 取值[left|right] 默认值 left
 * @config {Object} [offset] {x:String|Number, y:String|Number}} 横向与纵向的取值
 * @config {Boolean} [autofix] 是否自动进行fix，默认值为true
 * @config {Function} [onrender] 当被渲染时候触发
 * @config {Function} [onupdate] 当位置被更新的时候触发
 * @config {Function} [onrelease] 当被释放的时候触发
 * @returns {Object} 返回值一个对象，有三个方法：render、update、release
 */
baidu.dom.fixable = /**@function*/function(element, options){

    var target  = baidu.g(element),
        isUnderIE7 = baidu.browser.ie && baidu.browser.ie <= 7 ? true : false,
        vertival = options.vertival || 'top',
        horizontal = options.horizontal || 'left',
        autofix = typeof options.autofix != 'undefined' ? options.autofix : true,
        origPos,offset,isRender = false,
        onrender = options.onrender || new Function(),
        onupdate = options.onupdate || new Function(),
        onrelease = options.onrelease || new Function();

    if(!target) return;

    //获取target原始值
    origPos = _getOriginalStyle();
    //设置offset值
    offset = {
        y: isUnderIE7 ? (origPos.position == "static" ? baidu.dom.getPosition(target).top :  baidu.dom.getPosition(target).top - baidu.dom.getPosition(target.parentNode).top) : target.offsetTop,
        x: isUnderIE7 ? (origPos.position == "static" ? baidu.dom.getPosition(target).left :  baidu.dom.getPosition(target).left - baidu.dom.getPosition(target.parentNode).left) : target.offsetLeft
    };
    baidu.extend(offset, options.offset || {});

    autofix && render();
   
    function _convert(){
        return {
            top : vertival == "top" ? offset.y : baidu.page.getViewHeight() - offset.y - origPos.height,
            left: horizontal == "left" ? offset.x : baidu.page.getViewWidth() - offset.x - origPos.width
        };
    }

    /**
     * 
     */
    function _handleOnMove(){
        var p = _convert(); 
        
        target.style.setExpression("left","eval((document.body.scrollLeft || document.documentElement.scrollLeft) + " + p.left + ") + 'px'");
        target.style.setExpression("top", "eval((document.body.scrollTop || document.documentElement.scrollTop) + " + p.top + ") + 'px'");
    }

    /**
     * 返回target原始position值
     * @return {Object}
     */
    function _getOriginalStyle(){
        var result = {
            position: baidu.getStyle(target,"position"),
            height: function(){
                var h = baidu.getStyle(target,"height");
                return (h != "auto") ? (/\d+/.exec(h)[0]) : target.offsetHeight;
            }(),
            width: function(){			
                var w = baidu.getStyle(target,"width");
                return (w != "auto") ? (/\d+/.exec(w)[0]) : target.offsetWidth;
            }()
        };

        _getValue('top', result);
        _getValue('left', result);
        _getValue('bottom', result);
        _getValue('right', result);
        
        return result;
    }

    function _getValue(position, options){
        var result;

        if(options.position == 'static'){
            options[position] = '';   
        }else{
            result = baidu.getStyle(target, position);
            if(result == 'auto' || result == '0px' ){
                options[position] = '';
            }else{
                options[position] = result;
            }
        }
    }

    function render(){
        if(isRender) return;

        baidu.setStyles(target, {top:'', left:'', bottom:'', right:''});
        
        if(!isUnderIE7){
            var style = {position:"fixed"};
            style[vertival == "top" ? "top" : "bottom"] = offset.y + "px";
            style[horizontal == "left" ? "left" : "right"] = offset.x + "px";

            baidu.setStyles(target, style);
        }else{
            baidu.setStyle(target,"position","absolute");
            _handleOnMove();
        }

        onrender();
        isRender = true;
    }

    function release(){
       if(!isRender) return;

       var style = {
           position: origPos.position,
           left: origPos.left == '' ? 'auto' : origPos.left,
           top: origPos.top == '' ? 'auto' : origPos.top,
           bottom: origPos.bottom == '' ? 'auto' : origPos.bottom,
           right: origPos.right == '' ?  'auto' : origPos.right
       };

        if(isUnderIE7){
            target.style.removeExpression("left");
            target.style.removeExpression("top");
        }
        baidu.setStyles(target, style);

        onrelease();
        isRender = false;
    }

    function update(options){
        if(!options) return;

        //更新事件
        onrender = options.onrender || onrender;
        onupdate = options.onupdate || onupdate;
        onrelease = options.onrelease || onrelease;
        
        //更新设置
        vertival = options.vertival || 'top';
        horizontal = options.horizontal || 'left';

        //更新offset
        baidu.extend(offset, options.offset || {});

        onupdate();
    }

    return {render: render, update: update, release:release};
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getAncestorBy.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * 获取目标元素符合条件的最近的祖先元素
 * @name baidu.dom.getAncestorBy
 * @function
 * @grammar baidu.dom.getAncestorBy(element, method)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {Function} method 判断祖先元素条件的函数，function (element)
 * @see baidu.dom.getAncestorByTag,baidu.dom.getAncestorByClass
 *             
 * @returns {HTMLElement|null} 符合条件的最近的祖先元素，查找不到时返回null
 */
baidu.dom.getAncestorBy = function (element, method) {
    element = baidu.dom.g(element);

    while ((element = element.parentNode) && element.nodeType == 1) {
        if (method(element)) {
            return element;
        }
    }

    return null;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getAncestorByClass.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */




/**
 * 获取目标元素指定元素className最近的祖先元素
 * @name baidu.dom.getAncestorByClass
 * @function
 * @grammar baidu.dom.getAncestorByClass(element, className)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} className 祖先元素的class，只支持单个class
 * @remark 使用者应保证提供的className合法性，不应包含不合法字符，className合法字符参考：http://www.w3.org/TR/CSS2/syndata.html。
 * @see baidu.dom.getAncestorBy,baidu.dom.getAncestorByTag
 *             
 * @returns {HTMLElement|null} 指定元素className最近的祖先元素，查找不到时返回null
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getAncestorByTag.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */



/**
 * 获取目标元素指定标签的最近的祖先元素
 * @name baidu.dom.getAncestorByTag
 * @function
 * @grammar baidu.dom.getAncestorByTag(element, tagName)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} tagName 祖先元素的标签名
 * @see baidu.dom.getAncestorBy,baidu.dom.getAncestorByClass
 *             
 * @returns {HTMLElement|null} 指定标签的最近的祖先元素，查找不到时返回null
 */
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
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * author: meizz
 * create: 20111204
 */




/**
 * 获取目标元素的 currentStyle 值，兼容非IE浏览器
 * 某些样式名称或者值需要hack的话，需要别外处理！
 * @author meizz
 * @name baidu.dom.getCurrentStyle
 * @function
 * @grammar baidu.dom.currentStyle(element, key)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} key 要获取的样式名
 *
 * @see baidu.dom.getStyle
 *             
 * @returns {string} 目标元素的computed style值
 */

baidu.dom.getCurrentStyle = function(element, key){
    element = baidu.dom.g(element);

    return element.style[key] ||
        (element.currentStyle ? element.currentStyle[key] : "") || 
        baidu.dom.getComputedStyle(element, key);
};

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All right reserved.
 * 
 * path: baidu/dom/getParent.js
 * author: berg
 * version: 1.0.0
 * date: 2010/12/02
 */



/**
 * 获得元素的父节点
 * @name baidu.dom.getParent
 * @function
 * @grammar baidu.dom.getParent(element)
 * @param {HTMLElement|string} element   目标元素或目标元素的id
 * @returns {HTMLElement|null} 父元素，如果找不到父元素，返回null
 */
baidu.dom.getParent = function (element) {
    element = baidu.dom._g(element);
    //parentElement在IE下准确，parentNode在ie下可能不准确
    return element.parentElement || element.parentNode || null;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getText.js
 * author: berg
 * version: 1.0
 * date: 2010/07/16 
 */



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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/getWindow.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/02
 */




/**
 * 获取目标元素所属的window对象
 * @name baidu.dom.getWindow
 * @function
 * @grammar baidu.dom.getWindow(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @see baidu.dom.getDocument
 *             
 * @returns {window} 目标元素所属的window对象
 */
baidu.dom.getWindow = function (element) {
    element = baidu.dom.g(element);
    var doc = baidu.dom.getDocument(element);
    
    // 没有考虑版本低于safari2的情况
    // @see goog/dom/dom.js#goog.dom.DomHelper.prototype.getWindow
    return doc.parentWindow || doc.defaultView || null;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/hasAttr.js
 * author: berg
 * version: 1.0
 * date: 2010/07/16 
 */



/**
 * 查询一个元素是否包含指定的属性
 * @name baidu.dom.hasAttr
 * @function
 * @grammar baidu.dom.hasAttr(element, name)
 * @param {DOMElement|string} element DOM元素或元素的id
 * @param {string} name 要查找的属性名
 * @version 1.3
 *             
 * @returns {Boolean} 是否包含此属性        
 */

baidu.dom.hasAttr = function (element, name){
    element = baidu.g(element);
    var attr = element.attributes.getNamedItem(name);
    return !!( attr && attr.specified );
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

    // 对于 textNode 节点来说没有 className
    if(!element || !element.className) return false;

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

    //在opera中insertAdjacentHTML方法实现不标准，如果DOMNodeInserted方法被监听则无法一次插入多element
    //by lixiaopeng @ 2011-8-19
    if (element.insertAdjacentHTML && !baidu.browser.opera) {
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
 * path: baidu/dom/last.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/18
 */



/**
 * 获取目标元素的最后一个元素节点
 * @name baidu.dom.last
 * @function
 * @grammar baidu.dom.last(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @see baidu.dom.first,baidu.dom.prev,baidu.dom.next
 *             
 * @returns {HTMLElement|null} 目标元素的最后一个元素节点，查找不到时返回null
 */
baidu.dom.last = function (element) {
    return baidu.dom._matchNode(element, 'previousSibling', 'lastChild');
};
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



/**
 * 设置HTML元素的不透明性，跨浏览器种类兼容处理
 * 
 * @author: meizz
 * @version: 2011-07-11
 * @namespace: baidu.dom.opacity
 * @grammar baidu.dom.opacity(element, opacity)
 * @param {String|HTMLElement}  element 定位插入的HTML的目标DOM元素
 * @param {Number}              opacity 不透明度
 */
baidu.dom.opacity = function(element, opacity){
    element = baidu.dom.g(element);

    if (!baidu.browser.ie) {
        element.style.opacity = opacity;
        element.style.KHTMLOpacity = opacity;
    } else {
        element.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity:"+
            Math.floor(opacity * 100) +")";
    }
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/prev.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/18
 */



/**
 * 获取目标元素的上一个兄弟元素节点
 * @name baidu.dom.prev
 * @function
 * @grammar baidu.dom.prev(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @see baidu.dom.first,baidu.dom.last,baidu.dom.next
 *             
 *             
 * @returns {HTMLElement|null} 目标元素的上一个兄弟元素节点，查找不到时返回null
 */
baidu.dom.prev = function (element) {
    return baidu.dom._matchNode(element, 'previousSibling', 'previousSibling');
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


/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */


/**
 * 提供css选择器功能   选择器支持所有的<a href="http://www.w3.org/TR/css3-selectors/">css3选择器</a> ，核心实现采用sizzle。baidu.dom.query.matches 请参考<a href="http://wiki.github.com/jeresig/sizzle/" target="_blank">sizzle 文档</a> 
 * @name baidu.dom.query
 * @function
 * @grammar baidu.dom.query(selector[, context, results])
 * @param {String} selector 选择器定义
 * @param {HTMLElement | DOMDocument} [context] 查找的上下文
 * @param {Array} [results] 查找的结果会追加到这个数组中
 * @version 1.5
 * @remark
 * 
            选择器支持所有的<a href="http://www.w3.org/TR/css3-selectors/">css3选择器</a> ，核心实现采用sizzle。可参考<a href="https://github.com/jquery/sizzle/wiki/Sizzle-Home" target="_blank">sizzle 文档</a>
        
 * @see baidu.dom.g, baidu.dom.q,
 * @returns {Array}        包含所有筛选出的DOM元素的数组
 */

(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	expando = "sizcache" + (Math.random() + '').replace('.', ''),
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rReturn = /\r\n/g,
	rNonWord = /\W/;

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
			set = posProcess( parts[0] + parts[1], context, seed );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set, seed );
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
	var set, i, len, match, type, left;

	if ( !expr ) {
		return [];
	}

	for ( i = 0, len = Expr.order.length; i < len; i++ ) {
		type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		type, found, item, filter, left,
		i, pass,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				filter = Expr.filter[ type ];
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
					for ( i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							pass = not ^ found;

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

/**
 * Utility function for retreiving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
var getText = Sizzle.getText = function( elem ) {
    var i, node,
		nodeType = elem.nodeType,
		ret = "";

	if ( nodeType ) {
		if ( nodeType === 1 ) {
			// Use textContent || innerText for elements
			if ( typeof elem.textContent === 'string' ) {
				return elem.textContent;
			} else if ( typeof elem.innerText === 'string' ) {
				// Replace IE's carriage returns
				return elem.innerText.replace( rReturn, '' );
			} else {
				// Traverse it's children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
	} else {

		// If no nodeType, this is expected to be an array
		for ( i = 0; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			if ( node.nodeType !== 8 ) {
				ret += getText( node );
			}
		}
	}
	return ret;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
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
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
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

			if ( isPartStr && !rNonWord.test( part ) ) {
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

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
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

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
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
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

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
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
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
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

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
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
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
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
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
				return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;

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
			var first, last,
				doneName, parent, cache,
				count, diff,
				type = match[1],
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
					first = match[2];
					last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					doneName = match[0];
					parent = elem.parentNode;
	
					if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
						count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent[ expando ] = doneName;
					}
					
					diff = elem.nodeIndex - last;

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
			return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Sizzle.attr ?
					Sizzle.attr( elem, name ) :
					Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				!type && Sizzle.attr ?
				result != null :
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
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
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
	div.appendChild( document.createComment("") );

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

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
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
							oldContext.removeAttribute( "id" );
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
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );
	
		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
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
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem[ expando ] = doneName;
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
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem[ expando ] = doneName;
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

var posProcess = function( selector, context, seed ) {
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
		Sizzle( selector, root[i], tmpSet, seed );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE

baidu.dom.query = Sizzle;

})();
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
            readyList = [],
            DOMContentLoaded;

        if (document.addEventListener) {
            DOMContentLoaded = function() {
                document.removeEventListener('DOMContentLoaded', DOMContentLoaded, false);
                ready();
            };

        } else if (document.attachEvent) {
            DOMContentLoaded = function() {
                if (document.readyState === 'complete') {
                    document.detachEvent('onreadystatechange', DOMContentLoaded);
                    ready();
                }
            };
        }
        /**
         * @private
         */
        function ready() {
            if (!ready.isReady) {
                ready.isReady = true;
                for (var i = 0, j = readyList.length; i < j; i++) {
                    readyList[i]();
                }
            }
        }
        /**
         * @private
         */
        function doScrollCheck(){
            try {
                document.documentElement.doScroll("left");
            } catch(e) {
                setTimeout( doScrollCheck, 1 );
                return;
            }   
            ready();
        }
        /**
         * @private
         */
        function bindReady() {
            if (readyBound) {
                return;
            }
            readyBound = true;

            if (document.readyState === 'complete') {
                ready.isReady = true;
            } else {
                if (document.addEventListener) {
                    document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);
                    window.addEventListener('load', ready, false);
                } else if (document.attachEvent) {
                    document.attachEvent('onreadystatechange', DOMContentLoaded);
                    window.attachEvent('onload', ready);

                    var toplevel = false;

                    try {
                        toplevel = window.frameElement == null;
                    } catch (e) {}

                    if (document.documentElement.doScroll && toplevel) {
                        doScrollCheck();
                    }
                }
            }
        }
        bindReady();

        return function(callback) {
            ready.isReady ? callback() : readyList.push(callback);
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
 * Copyright 2010 Baidu Inc. All rights reserved.
 *
 * path: baidu/dom/removeStyle.js
 * author: wenyuxiang, berg
 * version: 1.0.1
 * date: 2010/9/10
 */




/**
 * 删除元素的某个样式
 * @name baidu.dom.removeStyle
 * @function
 * @grammar baidu.dom.removeStyle(element, styleName)
 * @param {HTMLElement|String} element 需要删除样式的元素或者元素id
 * @param {string} styleName 需要删除的样式名字
 * @version 1.3
 * @see baidu.dom.setStyle
 *             
 * @returns {HTMLElement} 目标元素
 */
 
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/object/each.js
 * author: berg
 * version: 1.1.1
 * date: 2010-04-19
 */



/**
 * 遍历Object中所有元素，1.1.1增加
 * @name baidu.object.each
 * @function
 * @grammar baidu.object.each(source, iterator)
 * @param {Object} source 需要遍历的Object
 * @param {Function} iterator 对每个Object元素进行调用的函数，function (item, key)
 * @version 1.1.1
 *             
 * @returns {Object} 遍历的Object
 */
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
 */









/**
 * 按照border-box模型设置元素的height和width值。只支持元素的padding/border/height/width使用同一种计量单位的情况。<br/> 不支持：<br/> 1. 非数字值(medium)<br/> 2. em/px在不同的属性中混用
 * @name baidu.dom.setBorderBoxSize
 * @author berg
 * @function
 * @grammar baidu.dom.setBorderBoxSize(element, size)
 * @param {HTMLElement|string} element 元素或DOM元素的id
 * @param {object} size 包含height和width键名的对象
 *
 * @see baidu.dom.setBorderBoxWidth, baidu.dom.setBorderBoxHeight
 *
 * @return {HTMLElement}  设置好的元素
 */
baidu.dom.setBorderBoxSize = /**@function*/function (element, size) {
    var result = {};
    size.width && (result.width = parseFloat(size.width));
    size.height && (result.height = parseFloat(size.height));

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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 按照border-box模型设置元素的height值
 * 
 * @author berg
 * @name baidu.dom.setBorderBoxHeight
 * @function
 * @grammar baidu.dom.setBorderBoxHeight(element, height)
 * 
 * @param {HTMLElement|string} element DOM元素或元素的id
 * @param {number|string} height 要设置的height
 *
 * @return {HTMLElement}  设置好的元素
 * @see baidu.dom.setBorderBoxWidth, baidu.dom.setBorderBoxSize
 * @shortcut dom.setOuterHeight
 */
baidu.dom.setOuterHeight = 
baidu.dom.setBorderBoxHeight = function (element, height) {
    return baidu.dom.setBorderBoxSize(element, {height : height});
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 按照border-box模型设置元素的width值
 * 
 * @author berg
 * @name baidu.dom.setBorderBoxWidth
 * @function
 * @grammar baidu.dom.setBorderBoxWidth(element, width)
 * 
 * @param {HTMLElement|string} 	element DOM元素或元素的id
 * @param {number|string} 		width 	要设置的width
 *
 * @return {HTMLElement}  设置好的元素
 * @see baidu.dom.setBorderBoxHeight, baidu.dom.setBorderBoxSize
 * @shortcut dom.setOuterWidth
 */
baidu.dom.setOuterWidth = 
baidu.dom.setBorderBoxWidth = function (element, width) {
    return baidu.dom.setBorderBoxSize(element, {width : width});
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 */






















/**
 * 绘制可以根据鼠标行为改变HTMLElement大小的resize handle
 * @name baidu.dom.resizable
 * @function
 * @grammar baidu.dom.resizable(element[, options])
 * @param {HTMLElement|string} element 需要改变大小的元素或者元素的id.
 * @param {Object} [options] resizable参数配置
 * @config {Array} [direction] 可以改变的方向[e,se,s,ws,w,wn,n,en]
 * @config {Function} [onresizestart] 开始改变大小时触发
 * @config {Function} [onresizeend] 大小改变结束时触发
 * @config {Function} [onresize] 大小改变后时触发
 * @config {Number|String} [maxWidth] 可改变的最大宽度
 * @config {Number|String} [maxHeight] 可改变的最大高度
 * @config {Number|String} [minWidth] 可改变的最小宽度
 * @config {Number|String} [minHeight] 可改变的最小高度
 * @config {String} [classPrefix] className 前缀
 * @config {Object} [directionHandlePosition] resizHandle的位置参数
 * @return {Object} {cancel:Function} cancel函数
 * @remark  需要将元素的定位设置为absolute
 * @author lixiaopeng
 * @version 1.3
 */
baidu.dom.resizable = /**@function*/function(element,options) {
    var target,
        op,
        resizeHandle = {},
        directionHandlePosition,
        orgStyles = {},
        range, mozUserSelect,
        orgCursor,
        offsetParent,
        currentEle,
        handlePosition,
        timer,
        isCancel = false,
        isResizabled = false,
        defaultOptions = {
            direction: ['e', 's', 'se'],
            minWidth: 16,
            minHeight: 16,
            classPrefix: 'tangram',
            directionHandlePosition: {}
        };

        
    if (!(target = baidu.dom.g(element)) && baidu.getStyle(target, 'position') == 'static') {
        return false;
    }
    offsetParent = target.offsetParent;
    var orgPosition = baidu.getStyle(target,'position');

    /*
     * 必要参数的扩展
     * resize handle以方向命名
     * 顺时针的顺序为
     * north northwest west southwest south southeast east northeast
     */
    op = baidu.extend(defaultOptions, options);

    /*
     * 必要参数转换
     */
    baidu.each(['minHeight', 'minWidth', 'maxHeight', 'maxWidth'], function(style) {
        op[style] && (op[style] = parseFloat(op[style]));
    });

    /*
     * {Array[Number]} rangeObject
     * minWidth,maxWidth,minHeight,maxHeight
     */
    range = [
        op.minWidth || 0,
        op.maxWidth || Number.MAX_VALUE,
        op.minHeight || 0,
        op.maxHeight || Number.MAX_VALUE
    ];

    render(); 

    /**
     * 绘制resizable handle 
     */
    function render(){
      
        //位置属性
        handlePosition = baidu.extend({
            'e' : {'right': '-5px', 'top': '0px', 'width': '7px', 'height': target.offsetHeight},
            's' : {'left': '0px', 'bottom': '-5px', 'height': '7px', 'width': target.offsetWidth},
            'n' : {'left': '0px', 'top': '-5px', 'height': '7px', 'width': target.offsetWidth},
            'w' : {'left': '-5px', 'top': '0px', 'height':target.offsetHeight , 'width': '7px'},
            'se': {'right': '1px', 'bottom': '1px', 'height': '16px', 'width': '16px'},
            'sw': {'left': '1px', 'bottom': '1px', 'height': '16px', 'width': '16px'},
            'ne': {'right': '1px', 'top': '1px', 'height': '16px', 'width': '16px'},
            'nw': {'left': '1px', 'top': '1px', 'height': '16px', 'width': '16px'}
        },op.directionHandlePosition);
        
        //创建resizeHandle
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

            baidu.on(ele, 'mousedown',start);
        });

        isCancel = false;
    }

    /**
     * cancel resizeHandle
     * @public
     * @return  void
     */
    function cancel(){
        currentEle && stop();
        baidu.object.each(resizeHandle,function(item){
            baidu.un(item,"mousedown",start);
            baidu.dom.remove(item);
        });
        isCancel = true;    
    }

    /**
     * update resizable
     * @public 
     * @param {Object} options
     * @return null
     */
    function update(options){
        if(!isCancel){
            op = baidu.extend(op,options || {});
            cancel();
            render();
        }
    }

    /**
     * resizeHandle相应mousedown事件的函数
     * @param {Event} e
     * @return void
     */
    function start(e){
		isResizabled && stop();
        var ele = baidu.event.getTarget(e),
            key = ele.key;
        currentEle = ele;
		isResizabled = true;
		
        if (ele.setCapture) {
            ele.setCapture();
        } else if (window.captureEvents) {
            window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
        }

        /*
         * 给body设置相应的css属性
         * 添加事件监听
         */
        orgCursor = baidu.getStyle(document.body, 'cursor');
        baidu.setStyle(document.body, 'cursor', key + '-resize');
        baidu.on(document.body, 'mouseup',stop);
        baidu.on(document.body, 'selectstart', unselect);
        mozUserSelect = document.body.style.MozUserSelect;
        document.body.style.MozUserSelect = 'none';

        /*
         * 获取鼠标坐标
         * 偏移量计算
         */
        var orgMousePosition = baidu.page.getMousePosition();
        orgStyles = _getOrgStyle();
        timer = setInterval(function(){
            resize(key,orgMousePosition);
        }, 20);

        baidu.lang.isFunction(op.onresizestart) && op.onresizestart();
        baidu.event.preventDefault(e);
    }

    /**
     * 当鼠标按键抬起时终止对鼠标事件的监听
     * @private
     * @return void
     */
    function stop() {
        if (currentEle && currentEle.releaseCapture) {
            currentEle.releaseCapture();
        } else if (window.releaseEvents) {
            window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
        }

        /*
         * 删除事件监听
         * 还原css属性设置
         */
        baidu.un(document.body, 'mouseup',stop);
        baidu.un(document, 'selectstart', unselect);
        document.body.style.MozUserSelect = mozUserSelect;
        baidu.un(document.body, 'selectstart', unselect);

        clearInterval(timer);
        baidu.setStyle(document.body, 'cursor',orgCursor);
        currentEle = null;
		isResizabled = false;
        baidu.lang.isFunction(op.onresizeend) && op.onresizeend();
    }

    /**
     * 根据鼠标移动的距离来绘制target
     * @private
     * @param {String} key handle的direction字符串
     * @param {Object} orgMousePosition 鼠标坐标{x,y}
     * @return void
     */
    function resize(key,orgMousePosition) {
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
            left -= width - orgStyles['width'];
       }

        if (key.indexOf('s') >= 0) {
            height = Math.max(xy.y - orgMousePosition.y + orgStyles['height'], range[2]);
            height = Math.min(height, range[3]);
        }else if (key.indexOf('n') >= 0) {
            height = Math.max(orgMousePosition.y - xy.y + orgStyles['height'], range[2]);
            height = Math.min(height, range[3]);
            top -= height - orgStyles['height'];
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

    /**
     * 阻止文字被选中
     * @private
     * @param {Event} e
     * @return {Boolean}
     */
    function unselect(e) {
        return baidu.event.preventDefault(e, false);
    }

    /**
     * 获取target的原始宽高
     * @private
     * @return {Object} {width,height,top,left}
     */
    function _getOrgStyle() {
        var offset_parent = baidu.dom.getPosition(target.offsetParent),
            offset_target = baidu.dom.getPosition(target),
            top,
            left;
       
        if(orgPosition == "absolute"){
            top =  offset_target.top - (target.offsetParent == document.body ? 0 : offset_parent.top);
            left = offset_target.left - (target.offsetParent == document.body ? 0 :offset_parent.left);
        }else{
            top = parseFloat(baidu.getStyle(target,"top")) || -parseFloat(baidu.getStyle(target,"bottom")) || 0;
            left = parseFloat(baidu.getStyle(target,"left")) || -parseFloat(baidu.getStyle(target,"right")) || 0; 
        }
        baidu.setStyles(target,{top:top,left:left});

        return {
            width:target.offsetWidth,
            height:target.offsetHeight,
            top:top,
            left:left
        };
    }
    
    return {cancel:cancel,update:update,enable:render};
};
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * author: meizz
 * create: 2011-12-14
 */




/**
 * 给元素样式（比如width）赋值时，如果是数字则添加单位(px)，如果是其它值直接赋
 * @grammar baidu.dom.setPixel(el, style, n)
 * @param	{HTMLElement}	el 		DOM元素
 * @param 	{String}		style 	样式属性名
 * @param	{Number|String} n 		被赋的值
 */
baidu.dom.setPixel = function (el, style, n) {
	typeof n != "undefined" &&
	(baidu.dom.g(el).style[style] = n +(!isNaN(n) ? "px" : ""));
};

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/setPosition.js
 * author: berg
 * version: 1.0.0
 * date: 2010/12/14
 */









/**
 * 设置目标元素的top和left值到用户指定的位置
 * 
 * @name baidu.dom.setPosition
 * @function
 * @grammar baidu.dom.setPosition(element, position)
 * 
 * @param {HTMLElement|string}	element 	目标元素或目标元素的id
 * @param {object} 				position 	位置对象 {top: {number}, left : {number}}
 *
 * @return {HTMLElement}  进行设置的元素
 */
baidu.dom.setPosition = function (element, position) {
    return baidu.dom.setStyles(element, {
        left : position.left - (parseFloat(baidu.dom.getStyle(element, "margin-left")) || 0),
        top : position.top - (parseFloat(baidu.dom.getStyle(element, "margin-top")) || 0)
    });
};
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
 * path: baidu/dom/toggleClass.js
 * author: berg
 * version: 1.0
 * date: 2010-07-06
 */

/**
 * 添加或者删除一个节点中的指定class，如果已经有就删除，否则添加
 * @name baidu.dom.toggleClass
 * @function
 * @grammar baidu.dom.toggleClass(element, className)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {String} className 指定的className。允许同时添加多个class，中间使用空白符分隔
 * @version 1.3
 * @remark
 * 
 * 传入多个class时，只要其中有一个class不在当前元素中，则添加所有class，否则删除所有class。
 */





baidu.dom.toggleClass = function (element, className) {
    if(baidu.dom.hasClass(element, className)){
        baidu.dom.removeClass(element, className);
    }else{
        baidu.dom.addClass(element, className);
    }
};
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
 * path: baidu/dom/_styleFixer/size.js
 * author: qiaoyue
 * version: 1.1.0
 * date: 2012/03/16
 */



/**
 * 提供给getStyle使用
 * @meta standard
 */
baidu.dom._styleFixer.width = baidu.dom._styleFixer.height = {
    get: function(element, key, value) {
        var key = key.replace(/^[a-z]/, function($1){
	            return $1.toUpperCase();
	        }),
        	val = element['client' + key] || element['offset' + key];

        return val > 0 ? val + 'px' : !value || value == 'auto' ? 0 + 'px' : val;
    },

    set: function(element, value, key){
    	element.style[key] = value;
    }
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/dom/_styleFixer/textOverflow.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/17
 */






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
 * path: baidu/fn/methodize.js
 * author: berg
 * version: 1.0.0
 * date: 2010/11/02 
 */



/**
 * 将一个静态函数变换成一个对象的方法，使其的第一个参数为this，或this[attr]
 * @name baidu.fn.methodize
 * @function
 * @grammar baidu.fn.methodize(func[, attr])
 * @param {Function}	func	要方法化的函数
 * @param {string}		[attr]	属性
 * @version 1.3
 * @returns {Function} 已方法化的函数
 */
baidu.fn.methodize = function (func, attr) {
    return function(){
        return func.apply(this, [(attr ? this[attr] : this)].concat([].slice.call(arguments)));
    };
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 包装函数的返回值，使其在能按照index指定的方式返回。<br/>如果其值为-1，直接返回返回值。 <br/>如果其值为0，返回"返回值"的包装结果。<br/> 如果其值大于0，返回第i个位置的参数的包装结果（从1开始计数）
 * @author berg
 * @name baidu.fn.wrapReturnValue
 * @function
 * @grammar baidu.fn.wrapReturnValue(func, wrapper, mode)
 * @param {function} func    需要包装的函数
 * @param {function} wrapper 包装器
 * @param {number} mode 包装第几个参数
 * @version 1.3.5
 * @return {function} 包装后的函数
 */
baidu.fn.wrapReturnValue = function (func, wrapper, mode) {
    mode = mode | 0;
    return function(){
        var ret = func.apply(this, arguments); 
        if(!mode){
            return new wrapper(ret);
        }
        if(mode > 0){
            return new wrapper(arguments[mode - 1]);
        }
        return ret;
    }
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/fn/multize.js
 * author: berg
 * version: 1.0.0
 * date: 2010/11/02 
 */



/**
 * 对函数进行集化，使其在第一个参数为array时，结果也返回一个数组
 * @name baidu.fn.multize
 * @function
 * @grammar baidu.fn.multize(func[, recursive])
 * @param {Function}	func 		需要包装的函数
 * @param {Boolean}		[recursive] 是否递归包装（如果数组里面一项仍然是数组，递归），可选
 * @param {Boolean}		[joinArray] 将操作的结果展平后返回（如果返回的结果是数组，则将多个数组合成一个），可选
 * @version 1.3
 *
 * @returns {Function} 已集化的函数
 */
baidu.fn.multize = /**@function*/function (func, recursive, joinArray) {
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
                if (joinArray) {
                    if (r) {
                        //TODO: 需要去重吗？
                        ret = ret.concat(r);
                    }
                } else {
                    ret.push(r); 	
                }
            }
            return ret;
        }else{
            return func.apply(this, arguments);
        }
    }
    return newFunc;
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All right reserved.
 * 
 * path: baidu/dom/element.js
 * author: berg
 * version: 1.0.0
 * date: 2010-07-12
 */














/**
 * 通过该方法封装的对象可使用dom、event方法集合以及each方法进行链式调用
 * @namespace baidu.element
 */
baidu.element = function(node){
    var gNode = baidu._g(node);
    if(!gNode && baidu.dom.query){
        gNode = baidu.dom.query(node);
    }
    return new baidu.element.Element(gNode);
};
// 声明快捷方法
baidu.e = baidu.element;

/**
 * Element类，所有扩展到链条上的方法都会被放在这里面
 * @name baidu.element.Element
 * @grammar baidu.element.Element(node)
 * @param {DOMElement|NodeList} node   目标元素，可以是数组或者单个node节点
 * @returns {ElementObj} 包装后的DOM对象
 * @version 1.3
 */
baidu.element.Element = function(node){
    if(!baidu.element._init){
        //由于element可能会在其他代码之前加载，因此用这个方法来延迟加载
        baidu.element._makeChain();
        baidu.element._init = true;
    }
    /**
     * @private
     * @type {Array.<Node>}
     */
    this._dom = (node.tagName || '').toLowerCase() == 'select' ? 
    	[node] : baidu.lang.toArray(node);
};

/**
 * 以每一个匹配的元素作为上下文执行传递进来的函数，方便用户自行遍历dom。
 * @name baidu.element.each
 * @function
 * @grammar baidu.element(node).each(iterator)
 * @param {Function} iterator 遍历Dom时调用的方法
 * @version 1.3
 */
baidu.element.Element.prototype.each = function(iterator) {
    // 每一个iterator接受到的都是封装好的node
    baidu.array.each(this._dom, function(node, i){
        iterator.call(node, node, i);
    });
};

/*
 * 包装静态方法，使其变成一个链条方法。
 * 先把静态方法multize化，让其支持接受数组参数，
 * 然后包装返回值，返回值是一个包装类
 * 最后把静态方法methodize化，让其变成一个对象方法。
 *
 * @param {Function}    func    要包装的静态方法
 * @param {number}      index   包装函数的第几个返回值
 *
 * @return {function}   包装后的方法，能直接挂到Element的prototype上。
 * @private
 */
baidu.element._toChainFunction = function(func, index, joinArray){
    return baidu.fn.methodize(baidu.fn.wrapReturnValue(baidu.fn.multize(func, 0, 1), baidu.element.Element, index), '_dom');
};

/**
 * element对象包装了dom包下的除了drag和ready,create,ddManager之外的大部分方法。这样做的目的是提供更为方便的链式调用操作。其中doms代指dom包下的方法名。
 * @name baidu.element.doms
 * @function
 * @grammar baidu.element(node).doms
 * @param 详见dom包下相应方法的参数。
 * @version 1.3
 * @private
 */
baidu.element._makeChain = function(){ //将dom/event包下的东西挂到prototype里面
    var proto = baidu.element.Element.prototype,
        fnTransformer = baidu.element._toChainFunction;

    //返回值是第一个参数的包装
    baidu.each(("draggable droppable resizable fixable").split(' '),
              function(fn){
                  proto[fn] =  fnTransformer(baidu.dom[fn], 1);
              });

    //直接返回返回值
    baidu.each(("remove getText contains getAttr getPosition getStyle hasClass intersect hasAttr getComputedStyle").split(' '),
              function(fn){
                  proto[fn] = proto[fn.replace(/^get[A-Z]/g, stripGet)] = fnTransformer(baidu.dom[fn], -1);
              });

    //包装返回值
    //包含
    //1. methodize
    //2. multize，结果如果是数组会被展平
    //3. getXx == xx
    baidu.each(("addClass empty hide show insertAfter insertBefore insertHTML removeClass " + 
              "setAttr setAttrs setStyle setStyles show toggleClass toggle next first " + 
              "getAncestorByClass getAncestorBy getAncestorByTag getDocument getParent getWindow " +
              "last next prev g removeStyle setBorderBoxSize setOuterWidth setOuterHeight " +
              "setBorderBoxWidth setBorderBoxHeight setPosition children query").split(' '),
              function(fn){
                  proto[fn] = proto[fn.replace(/^get[A-Z]/g, stripGet)] = fnTransformer(baidu.dom[fn], 0);
              });

    //对于baidu.dom.q这种特殊情况，将前两个参数调转
    //TODO：需要将这种特殊情况归纳到之前的情况中
    proto['q'] = proto['Q'] = fnTransformer(function(arg1, arg2){
        return baidu.dom.q.apply(this, [arg2, arg1].concat([].slice.call(arguments, 2)));
    }, 0);

    //包装event中的on 和 un
    baidu.each(("on un").split(' '), function(fn){
        proto[fn] = fnTransformer(baidu.event[fn], 0);
    });
  
    /** 
     * 方法提供了事件绑定的快捷方式，事件发生时会触发传递进来的函数。events代指事件方法的总和。
     * @name baidu.element.events 
     * @function
     * @grammar baidu.element(node).events(fn)
     * @param {Function} fn 事件触发时要调用的方法
     * @version 1.3
     * @remark 包装event的快捷方式具体包括blur、focus、focusin、focusout、load 、resize 、scroll 、unload 、click、 dblclick、mousedown 、mouseup 、mousemove、 mouseover 、mouseout 、mouseenter、 mouseleave、change 、select 、submit 、keydown、 keypress 、keyup、 error。
     * @returns {baidu.element} Element对象
     */
    //包装event的快捷方式
    baidu.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
                "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + 
                "change select submit keydown keypress keyup error").split(' '), function(fnName){
        proto[fnName] = function(fn){
            return this.on(fnName, fn);
        };
    });


    /**
     * 把get去掉
     * 链里面的方法可以不以get开头调用
     * 如 baidu.element("myDiv").parent() == baidu.element("myDiv").getParent();
     * TODO: 合并getter和setter. baidu.e('myDiv').style() &  baidu.e('myDiv').style('width', '100');
     */
    function stripGet(match) {  
        return match.charAt(3).toLowerCase();
    }
};

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/element/extend.js
 * author: berg
 * version: 1.0.0
 * date: 2010/12/16
 */







 /**
 * 为element对象扩展一个方法。
 * @name baidu.element.extend
 * @function
 * @grammar baidu.element.extend(json)
 * @param {Object} json 要扩展的方法名以及方法
 * @version 1.3
 * @shortcut e
 * @returns {baidu.element.Element} Element对象
 *
 */
baidu.element.extend = function(json){
    var e = baidu.element;
    baidu.object.each(json, function(item, key){
        e.Element.prototype[key] = baidu.element._toChainFunction(item, -1);
    });
};
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
 * @class
 * @grammar baidu.event.EventArg(event[, win])
 * @param {Event}   event   事件对象
 * @param {Window}  [win]	窗口对象，默认为window
 * @meta standard
 * @remark 1.1.0开始支持
 * @see baidu.event.get
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
 * path: baidu/object/values.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */



/**
 * 获取目标对象的值列表
 * @name baidu.object.values
 * @function
 * @grammar baidu.object.values(source)
 * @param {Object} source 目标对象
 * @see baidu.object.keys
 *             
 * @returns {Array} 值列表
 */
baidu.object.values = function (source) {
    var result = [], resultLen = 0, k;
    for (k in source) {
        if (source.hasOwnProperty(k)) {
            result[resultLen++] = source[k];
        }
    }
    return result;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/fire.js
 * author: linlingyu
 * version: 1.1.0
 * date: 2010/10/28
 */






/**
 * 触发已经注册的事件。注：在ie下不支持load和unload事件
 * @name baidu.event.fire
 * @function
 * @grammar baidu.event.fire(element, type, options)
 * @param {HTMLElement|string|window} element 目标元素或目标元素id
 * @param {string} type 事件类型
 * @param {Object} options 触发的选项
				
 * @param {Boolean} options.bubbles 是否冒泡
 * @param {Boolean} options.cancelable 是否可以阻止事件的默认操作
 * @param {window|null} options.view 指定 Event 的 AbstractView
 * @param {1|Number} options.detail 指定 Event 的鼠标单击量
 * @param {Number} options.screenX 指定 Event 的屏幕 x 坐标
 * @param {Number} options.screenY number 指定 Event 的屏幕 y 坐标
 * @param {Number} options.clientX 指定 Event 的客户端 x 坐标
 * @param {Number} options.clientY 指定 Event 的客户端 y 坐标
 * @param {Boolean} options.ctrlKey 指定是否在 Event 期间按下 ctrl 键
 * @param {Boolean} options.altKey 指定是否在 Event 期间按下 alt 键
 * @param {Boolean} options.shiftKey 指定是否在 Event 期间按下 shift 键
 * @param {Boolean} options.metaKey 指定是否在 Event 期间按下 meta 键
 * @param {Number} options.button 指定 Event 的鼠标按键
 * @param {Number} options.keyCode 指定 Event 的键盘按键
 * @param {Number} options.charCode 指定 Event 的字符编码
 * @param {HTMLElement} options.relatedTarget 指定 Event 的相关 EventTarget
 * @version 1.3
 *             
 * @returns {HTMLElement} 目标元素
 */
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
 * path: baidu/event/getEvent.js
 * author: xiadengping
 * version: 1.6.0
 * date: 2011/12/08
 */



/**
 * 获取事件对象
 * @name baidu.event.getEvent
 * @function
 * @param {Event} event event对象，目前没有使用这个参数，只是保留接口。by dengping.
 * @grammar baidu.event.getEvent()
 * @meta standard
 * @return {Event} event对象.
 */

baidu.event.getEvent = function(event) {
    if (window.event) {
        return window.event;
    } else {
        var f = arguments.callee;
        do { //此处参考Qwrap框架 see http://www.qwrap.com/ by dengping
            if (/Event/.test(f.arguments[0])) {
                return f.arguments[0];
            }
        } while (f = f.caller);
        return null;
    }
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/getKeyCode.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/23
 */


/**
 * 获取键盘事件的键值
 * @name baidu.event.getKeyCode
 * @function
 * @grammar baidu.event.getKeyCode(event)
 * @param {Event} event 事件对象
 *             
 * @returns {number} 键盘事件的键值
 */
baidu.event.getKeyCode = function (event) {
    return event.which || event.keyCode;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/getPageX.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/16
 */



/**
 * 获取鼠标事件的鼠标x坐标
 * @name baidu.event.getPageX
 * @function
 * @grammar baidu.event.getPageX(event)
 * @param {Event} event 事件对象
 * @see baidu.event.getPageY
 *             
 * @returns {number} 鼠标事件的鼠标x坐标
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/getPageY.js
 * author: erik
 * version: 1.1.0
 * date: 2009/12/16
 */



/**
 * 获取鼠标事件的鼠标y坐标
 * @name baidu.event.getPageY
 * @function
 * @grammar baidu.event.getPageY(event)
 * @param {Event} event 事件对象
 * @see baidu.event.getPageX
 *             
 * @returns {number} 鼠标事件的鼠标y坐标
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/once.js
 * author: wangcheng
 * version: 1.1.0
 * date: 2010/10/29
 */





/**
 * 为目标元素添加一次事件绑定
 * @name baidu.event.once
 * @function
 * @grammar baidu.event.once(element, type, listener)
 * @param {HTMLElement|string} element 目标元素或目标元素id
 * @param {string} type 事件类型
 * @param {Function} listener 需要添加的监听器
 * @version 1.3
 * @see baidu.event.un,baidu.event.on
 *             
 * @returns {HTMLElement} 目标元素
 */
baidu.event.once = /**@function*/function(element, type, listener){
    element = baidu.dom._g(element);
    function onceListener(event){
        listener.call(element,event);
        baidu.event.un(element, type, onceListener);
    } 
    
    baidu.event.on(element, type, onceListener);
    return element;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/stopPropagation.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/23
 */



/**
 * 阻止事件传播
 * @name baidu.event.stopPropagation
 * @function
 * @grammar baidu.event.stopPropagation(event)
 * @param {Event} event 事件对象
 * @see baidu.event.stop,baidu.event.preventDefault
 */
baidu.event.stopPropagation = function (event) {
   if (event.stopPropagation) {
       event.stopPropagation();
   } else {
       event.cancelBubble = true;
   }
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/stop.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/23
 */




/**
 * 停止事件
 * @name baidu.event.stop
 * @function
 * @grammar baidu.event.stop(event)
 * @param {Event} event 事件对象
 * @see baidu.event.stopPropagation,baidu.event.preventDefault
 */
baidu.event.stop = function (event) {
    var e = baidu.event;
    e.stopPropagation(event);
    e.preventDefault(event);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/_eventFilter.js
 * author: rocy
 * version: 1.0.0
 * date: 2010/10/29
 */


baidu.event._eventFilter = baidu.event._eventFilter || {};

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/_eventFilter/_crossElementBoundary.js
 * author: Rocy, berg
 * version: 1.0.0
 * date: 2010/12/16
 */





/**
 * 事件仅在鼠标进入/离开元素区域触发一次，当鼠标在元素区域内部移动的时候不会触发，用于为非IE浏览器添加mouseleave/mouseenter支持。
 * 
 * @name baidu.event._eventFilter._crossElementBoundary
 * @function
 * @grammar baidu.event._eventFilter._crossElementBoundary(listener, e)
 * 
 * @param {function} listener	要触发的函数
 * @param {DOMEvent} e 			DOM事件
 */

baidu.event._eventFilter._crossElementBoundary = function(listener, e){
    var related = e.relatedTarget,
        current = e.currentTarget;
    if(
       related === false || 
       // 如果current和related都是body，contains函数会返回false
       current == related ||
       // Firefox有时会把XUL元素作为relatedTarget
       // 这些元素不能访问parentNode属性
       // thanks jquery & mootools
       (related && (related.prefix == 'xul' ||
       //如果current包含related，说明没有经过current的边界
       baidu.dom.contains(current, related)))
      ){
        return ;
    }
    return listener.call(current, e);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/fn/bind.js
 * author: berg
 * version: 1.0.0
 * date: 2010/11/02 
 */





/** 
 * 为对象绑定方法和作用域
 * @name baidu.fn.bind
 * @function
 * @grammar baidu.fn.bind(handler[, obj, args])
 * @param {Function|String} handler 要绑定的函数，或者一个在作用域下可用的函数名
 * @param {Object} obj 执行运行时this，如果不传入则运行时this为函数本身
 * @param {args* 0..n} args 函数执行时附加到执行时函数前面的参数
 * @version 1.3
 *
 * @returns {Function} 封装后的函数
 */
baidu.fn.bind = function(func, scope) {
    var xargs = arguments.length > 2 ? [].slice.call(arguments, 2) : null;
    return function () {
        var fn = baidu.lang.isString(func) ? scope[func] : func,
            args = (xargs) ? xargs.concat([].slice.call(arguments, 0)) : arguments;
        return fn.apply(scope || fn, args);
    };
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/_eventFilter/mouseenter.js
 * author: Rocy
 * version: 1.0.0
 * date: 2010/11/09
 */





/**
 * 用于为非IE浏览器添加mouseenter的支持;
 * mouseenter事件仅在鼠标进入元素区域触发一次,
 *    当鼠标在元素内部移动的时候不会多次触发.
 */
baidu.event._eventFilter.mouseenter = window.attachEvent ? null : function(element,type, listener){
	return {
		type: "mouseover",
		listener: baidu.fn.bind(baidu.event._eventFilter._crossElementBoundary, this, listener)
	}
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/event/_eventFilter/mouseleave.js
 * author: Rocy, berg
 * version: 1.0.0
 * date: 2010/11/09
 */




/**
 * 用于为非IE浏览器添加mouseleave的支持;
 * mouseleave事件仅在鼠标移出元素区域触发一次,
 *    当鼠标在元素区域内部移动的时候不会触发.
 */
baidu.event._eventFilter.mouseleave = window.attachEvent ? null : function(element,type, listener){
	return {
		type: "mouseout",
		listener: baidu.fn.bind(baidu.event._eventFilter._crossElementBoundary, this, listener)
	}
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: baidu/event/_unload.js
 * author: erik, berg
 * version: 1.1.0
 * date: 2009/12/16
 */




/**
 * 卸载所有事件监听器
 * @private
 */
baidu.event._unload = function() {
    var lis = baidu.event._listeners,
        len = lis.length,
        standard = !!window.removeEventListener,
        item, el;

    while (len--) {
        item = lis[len];
        //20100409 berg: 不解除unload的绑定，保证用户的事件一定会被执行
        //否则用户挂载进入的unload事件也可能会在这里被删除
        if (item[1] == 'unload') {
            continue;
        }
        //如果el被移除，不做判断将导致js报错
        if (!(el = item[0])) {
            continue;
        }
        if (el.removeEventListener) {
            el.removeEventListener(item[1], item[3], false);
        } else if (el.detachEvent) {
            el.detachEvent('on' + item[1], item[3]);
        }
    }

    if (standard) {
        window.removeEventListener('unload', baidu.event._unload, false);
    } else {
        window.detachEvent('onunload', baidu.event._unload);
    }
};

// 在页面卸载的时候，将所有事件监听器移除
if (window.attachEvent) {
    window.attachEvent('onunload', baidu.event._unload);
} else {
    window.addEventListener('unload', baidu.event._unload, false);
}
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path: baidu/fn/abstractMethod.js
 * author: leeight
 * version: 1.0.0
 * date: 2011/04/29
 */



/**
 * 定义一个抽象方法
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be
 *   overridden.
 * @see goog.abstractMethod
 */
baidu.fn.abstractMethod = function() {
    throw Error('unimplemented abstract method');
};
﻿/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: baidu/fn.js
 * author: qiaoyue
 * version: 1.0.0
 * date: 2011/12/23
 */


/**
 * 对form的操作，解决表单数据问题
 * @namespace baidu.form
 */
baidu.form = baidu.form || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/form/json.js
 * author: qiaoyue
 * version: 1.1.0
 * date: 2011/12/23
 */




/**
 * josn化表单数据
 * @name baidu.form.json
 * @function
 * @grammar baidu.form.json(form[, replacer])
 * @param {HTMLFormElement} form        需要提交的表单元素
 * @param {Function} replacer           对参数值特殊处理的函数,replacer(string value, string key)
	           
 * @returns {data} 表单数据js对象
 */
baidu.form.json = function (form, replacer) {
    var elements = form.elements,
        replacer = replacer || function (value, name) {
            return value;
        },
        data = {},
        item, itemType, itemName, itemValue, 
        opts, oi, oLen, oItem;
        
    /**
     * 向缓冲区添加参数数据
     * @private
     */
    function addData(name, value) {
        var val = data[name];
        if(val){
            val.push || ( data[name] = [val] );
            data[name].push(value);
        }else{
            data[name] = value;
        }
    }
    
    for (var i = 0, len = elements.length; i < len; i++) {
        item = elements[i];
        itemName = item.name;
        
        // 处理：可用并包含表单name的表单项
        if (!item.disabled && itemName) {
            itemType = item.type;
            itemValue = baidu.url.escapeSymbol(item.value);
        
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
            case 'file':
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

    return data;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/form/serialize.js
 * author: qiaoyue
 * version: 1.1.0
 * date: 2011/12/23
 */




/**
 * 序列化表单数据
 * @name baidu.form.serialize
 * @function
 * @grammar baidu.form.serialize(form[, replacer])
 * @param {HTMLFormElement} form        需要提交的表单元素
 * @param {Function} replacer           对参数值特殊处理的函数,replacer(string value, string key)
	           
 * @returns {data} 表单数据数组
 */
baidu.form.serialize = function (form, replacer) {
    var elements = form.elements,
        replacer = replacer || function (value, name) {
            return value;
        },
        data = [],
        item, itemType, itemName, itemValue, 
        opts, oi, oLen, oItem;
        
    /**
     * 向缓冲区添加参数数据
     * @private
     */
    function addData(name, value) {
        data.push(name + '=' + value);
    }
    
    for (var i = 0, len = elements.length; i < len; i++) {
        item = elements[i];
        itemName = item.name;
        
        // 处理：可用并包含表单name的表单项
        if (!item.disabled && itemName) {
            itemType = item.type;
            itemValue = baidu.url.escapeSymbol(item.value);
        
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
            case 'file':
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

    return data;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * version: 1.4.0
 * date: 2011/07/05
 */



/**
 * @namespace baidu.global 操作global对象的方法。
 * @author meizz
 */
baidu.global = baidu.global || {};

// 将全局存放在的变量都集中到一个地方
window[baidu.guid].global = window[baidu.guid].global || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * version: 1.4.0
 * date: 2011/07/05
 */



/**
 * @namespace baidu.global.get 取得global全局对象里存储的信息。
 * @author meizz
 *
 * @param   {string}    key     信息对应的 key 值
 * @return  {object}            信息
 */
(function(){
    var global = window[baidu.guid].global;

    baidu.global.get = function(key) {
        return global[key];
    };
})();
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * version: 1.4.0
 * date: 2011/07/05
 */



/**
 * @namespace baidu.global.set 向global全局对象里存储信息。
 * @author meizz
 *
 * @param   {string}    key         信息对应的 key 值
 * @param   {object}    value       被存储的信息
 * @param   {boolean}   protected_  保护原值不被覆盖，默认值 false 可覆盖
 * @return  {object}                信息
 */
(function(){
    var global = window[baidu.guid].global;

    baidu.global.set = function(key, value, protected_) {
        var b = !protected_ || (protected_ && typeof global[key] == "undefined");

        b && (global[key] = value);
        return global[key];
    };
})();
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * author: meizz
 * version: 2.0
 * date: 2011.12.22
 */





/**
 * @namespace baidu.global.getZIndex 全局统一管理 z-index。
 *
 * @param   {String}    key 	信息对应的 key 值(popup | dialog)
 * @param   {Number}    step 	z-index 增长的步长
 * @return  {Number}            z-index
 */
baidu.global.getZIndex = function(key, step) {
	var zi = baidu.global.get("zIndex");
	if (key) {
		zi[key] = zi[key] + (step || 1);
	}
	return zi[key];
};
baidu.global.set("zIndex", {popup : 50000, dialog : 1000}, true);
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
 * 操作json对象的方法
 * @namespace baidu.json
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
 * path: baidu/json/decode.js
 * author: erik, cat
 * version: 1.3.4
 * date: 2010/12/23
 */



/**
 * 将字符串解析成json对象，为过时接口，今后会被baidu.json.parse代替
 * @name baidu.json.decode
 * @function
 * @grammar baidu.json.decode(source)
 * @param {string} source 需要解析的字符串
 * @meta out
 * @see baidu.json.encode,baidu.json.parse
 *             
 * @returns {JSON} 解析结果json对象
 */
baidu.json.decode = baidu.json.parse;
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
 * path: baidu/json/encode.js
 * author: erik, cat
 * version: 1.3.4
 * date: 2010/12/23
 */



/**
 * 将json对象序列化，为过时接口，今后会被baidu.json.stringify代替
 * @name baidu.json.encode
 * @function
 * @grammar baidu.json.encode(value)
 * @param {JSON} value 需要序列化的json对象
 * @meta out
 * @see baidu.json.decode,baidu.json.stringify
 *             
 * @returns {string} 序列化后的字符串
 */
baidu.json.encode = baidu.json.stringify;
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/Class/addEventListeners.js
 * author: berg
 * version: 1.0
 * date: 2010-07-05
 */




/**
 * 添加多个自定义事件。
 * @grammar obj.addEventListeners(events, fn)
 * @param 	{object}   events       json对象，key为事件名称，value为事件被触发时应该调用的回调函数
 * @param 	{Function} fn	        要挂载的函数
 * @version 1.3
 */
/* addEventListeners("onmyevent,onmyotherevent", fn);
 * addEventListeners({
 *      "onmyevent"         : fn,
 *      "onmyotherevent"    : fn1
 * });
 */
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
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.lang.createClass
 * @version: 1.6.0
 * @modify: 2011.11.24 meizz
 */





/**
 * 创建一个类，包括创造类的构造器、继承基类Class
 * @name baidu.lang.createClass
 * @function
 * @grammar baidu.lang.createClass(constructor[, options])
 * @param {Function} constructor 类的构造器函数
 * @param {Object} [options] 
                
 * @config {string} [type] 类名
 * @config {Function} [superClass] 父类，默认为baidu.lang.Class
 * @version 1.2
 * @remark
 * 
            使用createClass能方便的创建一个带有继承关系的类。同时会为返回的类对象添加extend方法，使用obj.extend({});可以方便的扩展原型链上的方法和属性
        
 * @see baidu.lang.Class,baidu.lang.inherits
 *             
 * @returns {Object} 一个类对象
 */

baidu.lang.createClass = /**@function*/function(constructor, options) {
    options = options || {};
    var superClass = options.superClass || baidu.lang.Class;

    // 创建新类的真构造器函数
    var fn = function(){
        var me = this;

        // 20101030 某类在添加该属性控制时，guid将不在全局instances里控制
        options.decontrolled && (me.__decontrolled = true);

        // 继承父类的构造器
        superClass.apply(me, arguments);

        // 全局配置
        for (i in fn.options) me[i] = fn.options[i];

        constructor.apply(me, arguments);

        for (var i=0, reg=fn["\x06r"]; reg && i<reg.length; i++) {
            reg[i].apply(me, arguments);
        }
    };

    // [TODO delete 2013] 放置全局配置，这个全局配置可以直接写到类里面
    fn.options = options.options || {};

    var C = function(){},
        cp = constructor.prototype;
    C.prototype = superClass.prototype;

    // 继承父类的原型（prototype)链
    var fp = fn.prototype = new C();

    // 继承传参进来的构造器的 prototype 不会丢
    for (var i in cp) fp[i] = cp[i];

    // 20111122 原className参数改名为type
    var type = options.className || options.type;
    typeof type == "string" && (fp.__type = type);

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

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
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

//	[TODO]	meizz	在2012年版本中将删除此模块
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/decontrol.js
 * author: meizz
 * version: 1.1.0
 * $date$
 */



/**
 * 解除instance中对指定类实例的引用关系。
 * @name baidu.lang.decontrol
 * @function
 * @grammar baidu.lang.decontrol(guid)
 * @param {string} guid 类的唯一标识
 * @version 1.1.1
 * @see baidu.lang.instance
 */
baidu.lang.decontrol = function(guid) {
    var m = window[baidu.guid];
    m._instances && (delete m._instances[guid]);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 事件中心
 * @class
 * @name baidu.lang.eventCenter
 * @author rocy
 */
baidu.lang.eventCenter = baidu.lang.eventCenter || baidu.lang.createSingle();

/**
 * 注册全局事件监听器。
 * @name baidu.lang.eventCenter.addEventListener
 * @function
 * @grammar baidu.lang.eventCenter.addEventListener(type, handler[, key])
 * @param 	{string}   type         自定义事件的名称
 * @param 	{Function} handler      自定义事件被触发时应该调用的回调函数
 * @param 	{string}   [key]		为事件监听函数指定的名称，可在移除时使用。如果不提供，方法会默认为它生成一个全局唯一的key。
 * @remark 	事件类型区分大小写。如果自定义事件名称不是以小写"on"开头，该方法会给它加上"on"再进行判断，即"click"和"onclick"会被认为是同一种事件。 
 */

/**
 * 移除全局事件监听器。
 * @name baidu.lang.eventCenter.removeEventListener
 * @grammar baidu.lang.eventCenter.removeEventListener(type, handler)
 * @function
 * @param {string}   type     事件类型
 * @param {Function|string} handler  要移除的事件监听函数或者监听函数的key
 * @remark 	如果第二个参数handler没有被绑定到对应的自定义事件中，什么也不做。
 */

/**
 * 派发全局自定义事件，使得绑定到全局自定义事件上面的函数都会被执行。
 * @name baidu.lang.eventCenter.dispatchEvent
 * @grammar baidu.lang.eventCenter.dispatchEvent(event, options)
 * @function
 * @param {baidu.lang.Event|String} event 	Event对象，或事件名称(1.1.1起支持)
 * @param {Object} 					options 扩展参数,所含属性键值会扩展到Event对象上(1.2起支持)
 */
/*
 * tangram
 * copyright 2011 baidu inc. all rights reserved.
 *
 * path: baidu/lang/getModule.js
 * author: leeight
 * version: 1.1.0
 * date: 2011/04/29
 */



/**
 * 根据变量名或者命名空间来查找对象
 * @function
 * @grammar baidu.lang.getModule(name, opt_obj)
 * @param {string} name 变量或者命名空间的名字.
 * @param {Object=} opt_obj 从这个对象开始查找，默认是window;
 * @return {?Object} 返回找到的对象，如果没有找到返回null.
 * @see goog.getObjectByName
 */
baidu.lang.getModule = function(name, opt_obj) {
    var parts = name.split('.'),
        cur = opt_obj || window,
        part;
    for (; part = parts.shift(); ) {
        if (cur[part] != null) {
            cur = cur[part];
        } else {
          return null;
        }
    }

    return cur;
};



















/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
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
 * @grammar baidu.lang.inherits(subClass, superClass[, type])
 * @param {Function} subClass 子类构造器
 * @param {Function} superClass 父类构造器
 * @param {string} type 类名标识
 * @remark
 * 
使subClass继承superClass的prototype，因此subClass的实例能够使用superClass的prototype中定义的所有属性和方法。<br>
这个函数实际上是建立了subClass和superClass的原型链集成，并对subClass进行了constructor修正。<br>
<strong>注意：如果要继承构造函数，需要在subClass里面call一下，具体见下面的demo例子</strong>
	
 * @shortcut inherits
 * @meta standard
 * @see baidu.lang.Class
 */
baidu.lang.inherits = function (subClass, superClass, type) {
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
    typeof type == "string" && (proto.__type = type);

    subClass.extend = function(json) {
        for (var i in json) proto[i] = json[i];
        return subClass;
    }
    
    return subClass;
};

// 声明快捷方法
baidu.inherits = baidu.lang.inherits;

//  2011.11.22  meizz   为类添加了一个静态方法extend()，方便代码书写
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
 * path: baidu/lang/isBoolean.js
 * author: berg
 * version: 1.0.0
 * date: 2010/10/12
 */



/**
 * 判断目标参数是否Boolean对象
 * @name baidu.lang.isBoolean
 * @function
 * @grammar baidu.lang.isBoolean(source)
 * @param {Any} source 目标参数
 * @version 1.3
 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isElement,baidu.lang.isArray,baidu.lang.isDate
 *             
 * @returns {boolean} 类型判断结果
 */
baidu.lang.isBoolean = function(o) {
    return typeof o === 'boolean';
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/isDate.js
 * author: berg
 * version: 1.0.0
 * date: 2010/10/12 
 */



/**
 * 判断目标参数是否为Date对象
 * @name baidu.lang.isDate
 * @function
 * @grammar baidu.lang.isDate(source)
 * @param {Any} source 目标参数
 * @version 1.3
 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isBoolean,baidu.lang.isElement
 *             
 * @returns {boolean} 类型判断结果
 */
baidu.lang.isDate = function(o) {
    // return o instanceof Date;
    return {}.toString.call(o) === "[object Date]" && o.toString() !== 'Invalid Date' && !isNaN(o);
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
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: baidu/lang/register.js
 * author: meizz, dron
 * version: 1.6.0
 * date: 2011/11/29
 */



/**
 * 向某个类注册插件
 * @name baidu.lang.register
 * @function
 * @grammar baidu.lang.register(Class, constructorHook, methods)
 * @param   {Class}     Class   		接受注册的载体 类
 * @param   {Function}  constructorHook 运行在载体类构造器里钩子函数
 * @param	{JSON}		methods			挂载到载体类原型链上的方法集，可选
 * @meta standard
 *             
 */
baidu.lang.register = function (Class, constructorHook, methods) {
    var reg = Class["\x06r"] || (Class["\x06r"] = []);
    reg[reg.length] = constructorHook;

    for (var method in methods) {
    	Class.prototype[method] = methods[method];
    }
};

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
// 20111129	meizz	添加第三个参数，可以直接挂载方法到目标类原型链上
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/number/comma.js
 * author: dron, erik, berg
 * version: 1.2.0
 * date: 2010/09/07 
 */



/**
 * 为目标数字添加逗号分隔
 * @name baidu.number.comma
 * @function
 * @grammar baidu.number.comma(source[, length])
 * @param {number} source 需要处理的数字
 * @param {number} [length] 两次逗号之间的数字位数，默认为3位
 *             
 * @returns {string} 添加逗号分隔后的字符串
 */
baidu.number.comma = function (source, length) {
    if (!length || length < 1) {
        length = 3;
    }

    source = String(source).split(".");
    source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{'+length+'})+$)','ig'),"$1,");
    return source.join(".");
};

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/number/randomInt.js
 * author: berg
 * version: 1.0.0
 * date: 2010/12/14
 */



/**
 * 生成随机整数，范围是[min, max]
 * @name baidu.number.randomInt
 * @function
 * @grammar baidu.number.randomInt(min, max) 
 * 
 * @param 	{number} min 	随机整数的最小值
 * @param 	{number} max 	随机整数的最大值
 * @return 	{number} 		生成的随机整数
 */
baidu.number.randomInt = function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
};
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
 * tangram
 * copyright 2011 baidu inc. all rights reserved.
 *
 * path: baidu/object/isEmpty.js
 * author: leeight
 * version: 1.1.0
 * date: 2011/04/30
 */



/**
 * 检测一个对象是否是空的，需要注意的是：如果污染了Object.prototype或者Array.prototype，那么baidu.object.isEmpty({})或者baidu.object.isEmpty([])可能返回的就是false.
 * @function
 * @grammar baidu.object.isEmpty(obj)
 * @param {Object} obj 需要检测的对象.
 * @return {boolean} 如果是空的对象就返回true.
 */
baidu.object.isEmpty = function(obj) {
    for (var key in obj) {
        return false;
    }
    
    return true;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/object/keys.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */



/**
 * 获取目标对象的键名列表
 * @name baidu.object.keys
 * @function
 * @grammar baidu.object.keys(source)
 * @param {Object} source 目标对象
 * @see baidu.object.values
 *             
 * @returns {Array} 键名列表
 */
baidu.object.keys = function (source) {
    var result = [], resultLen = 0, k;
    for (k in source) {
        if (source.hasOwnProperty(k)) {
            result[resultLen++] = k;
        }
    }
    return result;
};

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/object/map.js
 * author: berg
 * version: 1.1.0
 * date: 2010/12/14
 */



/**
 * 遍历object中所有元素，将每一个元素应用方法进行转换，返回转换后的新object。
 * @name baidu.object.map
 * @function
 * @grammar baidu.object.map(source, iterator)
 * 
 * @param 	{Array}    source   需要遍历的object
 * @param 	{Function} iterator 对每个object元素进行处理的函数
 * @return 	{Array} 			map后的object
 */
baidu.object.map = function (source, iterator) {
    var results = {};
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            results[key] = iterator(source[key], key);
        }
    }
    return results;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */





/*
 * 默认情况下，所有在源对象上的属性都会被非递归地合并到目标对象上
 * 并且如果目标对象上已有此属性，不会被覆盖
 */
/**
 * 合并源对象的属性到目标对象。
 *
 * @name baidu.object.merge
 * @function
 * @grammar baidu.object.merge(target, source[, opt_options])
 *
 * @param {Function} target 目标对象.
 * @param {Function} source 源对象.
 * @param {Object} opt_options optional merge选项.
 * @config {boolean} overwrite optional 如果为真，源对象属性会覆盖掉目标对象上的已有属性，默认为假.
 * @config {string[]} whiteList optional 白名单，默认为空，如果存在，只有在这里的属性才会被处理.
 * @config {boolean} recursive optional 是否递归合并对象里面的object，默认为否.
 * @return {object} merge后的object.
 * @see baidu.object.extend
 * @author berg
 */
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
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.page.createStyleSheet
 * @version: 2010-06-12
 */





/**
 * 在页面中创建样式表对象
 * @name baidu.page.createStyleSheet
 * @function
 * @grammar baidu.page.createStyleSheet(options)
 * @param {Object} options 配置信息
                
 * @param {Document} options.document 指定在哪个document下创建，默认是当前文档
 * @param {String} options.url css文件的URL
 * @param {Number} options.index 在文档里的排序索引（注意，仅IE下有效）
 * @version 1.2
 * @remark
 *  ie 下返回值styleSheet的addRule方法不支持添加逗号分隔的css rule.
 * 
 * @see baidu.page.createStyleSheet.StyleSheet
 *             
 * @returns {baidu.page.createStyleSheet.StyleSheet} styleSheet对象(注意: 仅IE下,其他浏览器均返回null)
 */
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
/*
 * styleSheet对象 有两个方法 
 *  addRule(selector, style, i)
 *  removeRule(i)
 *  这两个方法已经做了浏览器兼容处理
 * 一个集合
 *  rules
 */
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/page/getHeight.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/03
 */



/**
 * 获取页面高度
 * @name baidu.page.getHeight
 * @function
 * @grammar baidu.page.getHeight()
 * @see baidu.page.getWidth
 *             
 * @returns {number} 页面高度
 */
baidu.page.getHeight = function () {
    var doc = document,
        body = doc.body,
        html = doc.documentElement,
        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

    return Math.max(html.scrollHeight, body.scrollHeight, client.clientHeight);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/page/getWidth.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/03
 */



/**
 * 获取页面宽度
 * @name baidu.page.getWidth
 * @function
 * @grammar baidu.page.getWidth()
 * @see baidu.page.getHeight
 * @meta standard
 * @returns {number} 页面宽度
 */
baidu.page.getWidth = function () {
    var doc = document,
        body = doc.body,
        html = doc.documentElement,
        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

    return Math.max(html.scrollWidth, body.scrollWidth, client.clientWidth);
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 */











/**
 * 延迟加载图片. 默认只加载可见高度以上的图片, 随着窗口滚动加载剩余图片.注意: 仅支持垂直方向.
 * @name baidu.page.lazyLoadImage
 * @function
 * @grammar baidu.page.lazyLoadImage([options])
 * @param {Object} options
 * @param {String} [options.className] 延迟加载的IMG的className,如果不传入该值将延迟加载所有IMG.
 * @param {Number} [options.preloadHeight] 预加载的高度, 可见窗口下该高度内的图片将被加载.
 * @param {String} [options.placeHolder] 占位图url.
 * @param {Function} [options.onlazyload] 延迟加载回调函数,在实际加载时触发.
 * @author rocy
 */
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

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: baidu/page/load.js
 * author: rocy
 * version: 1.0.0
 * date: 2010/11/29
 */









/**
 *
 * 加载一组资源，支持多种格式资源的串/并行加载，支持每个文件有单独回调函数。
 *
 * @name baidu.page.load
 * @function
 * @grammar baidu.page.load(resources[, options])
 *
 * @param {Array} resources               资源描述数组，单个resource含如下属性.
 * @param {String} resources.url           链接地址.
 * @param {String} [resources.type]        取值["css","js","html"]，默认参考文件后缀.
 * @param {String} [resources.requestType] 取值["dom","ajax"]，默认js和css用dom标签，html用ajax.
 * @param {Function} resources.onload        当前resource加载完成的回调函数，若requestType为ajax，参数为xhr(可能失效)，responseText；若requestType为dom，无参数，执行时this为相应dom标签。.
 *
 * @param {Object} [options]               可选参数.
 * @param {Function} [options.onload]        资源全部加载完成的回调函数，无参数。.
 * @param {Boolean} [options.parallel]      是否并行加载，默认为false，串行。.
 * @param {Boolean} [ignoreAllLoaded]       全部加载之后不触发回调事件.主要用于内部实现.
 *
 *
 * @remark
 *  //串行实例
 *  baidu.page.load([
 *      { url : "http://img.baidu.com/js/tangram-1.3.2.js" },
 *      {url : "http://xxx.baidu.com/xpath/logicRequire.js",
 *          onload : fnOnRequireLoaded
 *      },
 *      { url : "http://xxx.baidu.com/xpath/target.js" }
 *  ],{
 *      onload : fnWhenTargetOK
 *  });
 *  //并行实例
 *  baidu.page.load([
 *      {
 *          url : "http://xxx.baidu.com/xpath/template.html",
 *          onload : fnExtractTemplate
 *      },
 *      { url : "http://xxx.baidu.com/xpath/style.css"},
 *      {
 *          url : "http://xxx.baidu.com/xpath/import.php?f=baidu.*",
 *          type : "js"
 *      },
 *      {
 *          url : "http://xxx.baidu.com/xpath/target.js",
 *      },
 *      {
 *          url : "http://xxx.baidu.com/xpath/jsonData.js",
 *          requestType : "ajax",
 *          onload : fnExtractData
 *      }
 *  ],{
 *      parallel : true,
 *      onload : fnWhenEverythingIsOK
 * });
 */
baidu.page.load = /**@function*/function(resources, options, ignoreAllLoaded) {
    //TODO failure, 整体onload能不能每个都调用; resources.charset
    options = options || {};
    var self = baidu.page.load,
        cache = self._cache = self._cache || {},
        loadingCache = self._loadingCache = self._loadingCache || {},
        parallel = options.parallel;

    function allLoadedChecker() {
        for (var i = 0, len = resources.length; i < len; ++i) {
            if (! cache[resources[i].url]) {
                setTimeout(arguments.callee, 10);
                return;
            }
        }
        options.onload();
    };

    function loadByDom(res, callback) {
        var node, loaded, onready;
        switch (res.type.toLowerCase()) {
            case 'css' :
                node = document.createElement('link');
                node.setAttribute('rel', 'stylesheet');
                node.setAttribute('type', 'text/css');
                break;
            case 'js' :
                node = document.createElement('script');
                node.setAttribute('type', 'text/javascript');
                node.setAttribute('charset', res.charset || self.charset);
                break;
            case 'html' :
                node = document.createElement('iframe');
                node.frameBorder = 'none';
                break;
            default :
                return;
        }

        // HTML,JS works on all browsers, CSS works only on IE.
        onready = function() {
            if (!loaded && (!this.readyState ||
                    this.readyState === 'loaded' ||
                    this.readyState === 'complete')) {
                loaded = true;
                // 防止内存泄露
                baidu.un(node, 'load', onready);
                baidu.un(node, 'readystatechange', onready);
                //node.onload = node.onreadystatechange = null;
                callback.call(window, node);
            }
        };
        baidu.on(node, 'load', onready);
        baidu.on(node, 'readystatechange', onready);
        //CSS has no onload event on firefox and webkit platform, so hack it.
        if (res.type == 'css') {
            (function() {
                //避免重复加载
                if (loaded) return;
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
        document.getElementsByTagName('head')[0].appendChild(node);
    }

    //兼容第一个参数直接是资源地址.
    baidu.lang.isString(resources) && (resources = [{url: resources}]);

    //避免递归出错,添加容错.
    if (! (resources && resources.length)) return;

    function loadResources(res) {
        var url = res.url,
            shouldContinue = !!parallel,
            cacheData,
            callback = function(textOrNode) {
                //ajax存入responseText,dom存入节点,用于保证onload的正确执行.
                cache[res.url] = textOrNode;
                delete loadingCache[res.url];

                if (baidu.lang.isFunction(res.onload)) {
                    //若返回false, 则停止接下来的加载.
                    if (false === res.onload.call(window, textOrNode)) {
                        return;
                    }
                }
                //串行时递归执行
                !parallel && self(resources.slice(1), options, true);
                if ((! ignoreAllLoaded) && baidu.lang.isFunction(options.onload)) {
                    allLoadedChecker();
                }
            };
        //默认用后缀名, 并防止后缀名大写
        res.type = res.type || url.replace(/^[^\?#]+\.(css|js|html)(\?|#| |$)[^\?#]*/i, '$1'); //[bugfix]修改xxx.js?v这种情况下取不到js的问题。 
        //默认html格式用ajax请求,其他都使用dom标签方式请求.
        res.requestType = res.requestType || (res.type == 'html' ? 'ajax' : 'dom');

        if (cacheData = cache[res.url]) {
            callback(cacheData);
            return shouldContinue;
        }
        if (!options.refresh && loadingCache[res.url]) {
            setTimeout(function() {loadResources(res);}, 10);
            return shouldContinue;
        }
        loadingCache[res.url] = true;
        if (res.requestType.toLowerCase() == 'dom') {
            loadByDom(res, callback);
        }else {//ajax
            baidu.ajax.get(res.url, function(xhr, responseText) {callback(responseText);});
        }
        //串行模式,通过callback方法执行后续
        return shouldContinue;
    };

    baidu.each(resources, loadResources);
};
//默认编码设置为UTF8
baidu.page.load.charset = 'UTF8';
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/page/loadCssFile.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/20
 */



/**
 * 动态在页面上加载一个外部css文件
 * @name baidu.page.loadCssFile
 * @function
 * @grammar baidu.page.loadCssFile(path)
 * @param {string} path css文件路径
 * @see baidu.page.loadJsFile
 */

baidu.page.loadCssFile = function (path) {
    var element = document.createElement("link");
    
    element.setAttribute("rel", "stylesheet");
    element.setAttribute("type", "text/css");
    element.setAttribute("href", path);

    document.getElementsByTagName("head")[0].appendChild(element);        
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/page/loadJsFile.js
 * author: allstar
 * version: 1.1.0
 * date: 2009/11/20
 */



/**
 * 动态在页面上加载一个外部js文件
 * @name baidu.page.loadJsFile
 * @function
 * @grammar baidu.page.loadJsFile(path)
 * @param {string} path js文件路径
 * @see baidu.page.loadCssFile
 */
baidu.page.loadJsFile = function (path) {
    var element = document.createElement('script');

    element.setAttribute('type', 'text/javascript');
    element.setAttribute('src', path);
    element.setAttribute('defer', 'defer');

    document.getElementsByTagName("head")[0].appendChild(element);    
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 判断平台类型和特性的属性
 * @namespace baidu.platform
 * @author jz
 */
baidu.platform = baidu.platform || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 判断是否为android平台
 * @property android 是否为android平台
 * @grammar baidu.platform.android
 * @meta standard
 * @see baidu.platform.x11,baidu.platform.windows,baidu.platform.macintosh,baidu.platform.iphone,baidu.platform.ipad
 * @return {Boolean} 布尔值
 * @author jz
 */
baidu.platform.isAndroid = /android/i.test(navigator.userAgent);
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 判断是否为ipad平台
 * @property ipad 是否为ipad平台
 * @grammar baidu.platform.ipad
 * @meta standard
 * @see baidu.platform.x11,baidu.platform.windows,baidu.platform.macintosh,baidu.platform.iphone,baidu.platform.android
 * @return {Boolean} 布尔值 
 * @author jz
 */
baidu.platform.isIpad = /ipad/i.test(navigator.userAgent);
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 判断是否为iphone平台
 * @property iphone 是否为iphone平台
 * @grammar baidu.platform.iphone
 * @meta standard
 * @see baidu.platform.x11,baidu.platform.windows,baidu.platform.macintosh,baidu.platform.ipad,baidu.platform.android
 * @return {Boolean} 布尔值
 * @author jz
 */
baidu.platform.isIphone = /iphone/i.test(navigator.userAgent);
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 判断是否为macintosh平台
 * @property macintosh 是否为macintosh平台
 * @grammar baidu.platform.macintosh
 * @meta standard
 * @see baidu.platform.x11,baidu.platform.windows,baidu.platform.iphone,baidu.platform.ipad,baidu.platform.android
 * @return {Boolean} 布尔值 
 * @author jz
 */
baidu.platform.isMacintosh = /macintosh/i.test(navigator.userAgent);
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 判断是否为windows平台
 * @property windows 是否为windows平台
 * @grammar baidu.platform.windows
 * @meta standard
 * @see baidu.platform.x11,baidu.platform.macintosh,baidu.platform.iphone,baidu.platform.ipad,baidu.platform.android
 * @return {Boolean} 布尔值 
 * @author jz
 */
baidu.platform.isWindows = /windows/i.test(navigator.userAgent);
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 判断是否为x11平台
 * @property x11 是否为x11平台
 * @grammar baidu.platform.x11
 * @meta standard
 * @see baidu.platform.windows,baidu.platform.macintosh,baidu.platform.iphone,baidu.platform.ipad,baidu.platform.android
 * @return {Boolean} 布尔值 
 * @author jz
 */
baidu.platform.isX11 = /x11/i.test(navigator.userAgent);
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
 * 使用动态script标签请求服务器资源，包括由服务器端的回调和浏览器端的回调
 * @namespace baidu.sio
 */
baidu.sio = baidu.sio || {};
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
 * 通过script标签加载数据，加载完成由浏览器端触发回调
 * @name baidu.sio.callByBrowser
 * @function
 * @grammar baidu.sio.callByBrowser(url, opt_callback, opt_options)
 * @param {string} url 加载数据的url
 * @param {Function|string} opt_callback 数据加载结束时调用的函数或函数名
 * @param {Object} opt_options 其他可选项
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
baidu.sio.callByServer = /**@function*/function(url, callback, opt_options) {
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
 * Copyright 2011 Baidu Inc. All rights reserved.
 */



/**
 * 通过请求一个图片的方式令服务器存储一条日志
 * @function
 * @grammar baidu.sio.log(url)
 * @param {string} url 要发送的地址.
 * @author: int08h,leeight
 */
baidu.sio.log = function(url) {
  var img = new Image(),
      key = 'tangram_sio_log_' + Math.floor(Math.random() *
            2147483648).toString(36);

  // 这里一定要挂在window下
  // 在IE中，如果没挂在window下，这个img变量又正好被GC的话，img的请求会abort
  // 导致服务器收不到日志
  window[key] = img;

  img.onload = img.onerror = img.onabort = function() {
    // 下面这句非常重要
    // 如果这个img很不幸正好加载了一个存在的资源，又是个gif动画
    // 则在gif动画播放过程中，img会多次触发onload
    // 因此一定要清空
    img.onload = img.onerror = img.onabort = null;

    window[key] = null;

    // 下面这句非常重要
    // new Image创建的是DOM，DOM的事件中形成闭包环引用DOM是典型的内存泄露
    // 因此这里一定要置为null
    img = null;
  };

  // 一定要在注册了事件之后再设置src
  // 不然如果图片是读缓存的话，会错过事件处理
  // 最后，对于url最好是添加客户端时间来防止缓存
  // 同时服务器也配合一下传递Cache-Control: no-cache;
  img.src = url;
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
 * path: baidu/string/filterFormat.js
 * author: rocy
 * version: 1.1.2
 * date: 2010/06/10
 */



/**
 * 对目标字符串进行格式化,支持过滤
 * @name baidu.string.filterFormat
 * @function
 * @grammar baidu.string.filterFormat(source, opts)
 * @param {string} source 目标字符串
 * @param {Object|string...} opts 提供相应数据的对象
 * @version 1.2
 * @remark
 * 
在 baidu.string.format的基础上,增加了过滤功能. 目标字符串中的#{url|escapeUrl},<br/>
会替换成baidu.string.filterFormat["escapeUrl"](opts.url);<br/>
过滤函数需要之前挂载在baidu.string.filterFormat属性中.
		
 * @see baidu.string.format,baidu.string.filterFormat.escapeJs,baidu.string.filterFormat.escapeString,baidu.string.filterFormat.toInt
 * @returns {string} 格式化后的字符串
 */
baidu.string.filterFormat = function (source, opts) {
    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
    if(data.length){
	    data = data.length == 1 ? 
	    	/* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
	    	(opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
	    	: data;
    	return source.replace(/#\{(.+?)\}/g, function (match, key){
		    var filters, replacer, i, len, func;
		    if(!data) return '';
	    	filters = key.split("|");
	    	replacer = data[filters[0]];
	    	// chrome 下 typeof /a/ == 'function'
	    	if('[object Function]' == toString.call(replacer)){
	    		replacer = replacer(filters[0]/*key*/);
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/filterFormat/escapeJs.js
 * author: rocy
 * version: 1.1.2
 * date: 2010/06/12
 */


/**
 * 对js片段的字符做安全转义,编码低于255的都将转换成\x加16进制数
 * @name baidu.string.filterFormat.escapeJs
 * @function
 * @grammar baidu.string.filterFormat.escapeJs(source)
 * @param {String} source 待转义字符串
 * 
 * @see baidu.string.filterFormat,baidu.string.filterFormat.escapeString,baidu.string.filterFormat.toInt
 * @version 1.2
 * @return {String} 转义之后的字符串
 */
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/filterFormat/escapeString.js
 * author: rocy
 * version: 1.1.2
 * date: 2010/06/12
 */


/**
 * 对字符串做安全转义,转义字符包括: 单引号,双引号,左右小括号,斜杠,反斜杠,上引号.
 * @name baidu.string.filterFormat.escapeString
 * @function
 * @grammar baidu.string.filterFormat.escapeString(source)
 * @param {String} source 待转义字符串
 * 
 * @see baidu.string.filterFormat,baidu.string.filterFormat.escapeJs,baidu.string.filterFormat.toInt
 * @version 1.2
 * @return {String} 转义之后的字符串
 */
baidu.string.filterFormat.escapeString = function(str){
	if(!str || 'string' != typeof str) return str;
	return str.replace(/["'<>\\\/`]/g, function($0){
	   return '&#'+ $0.charCodeAt(0) +';';
	});
};

baidu.string.filterFormat.e = baidu.string.filterFormat.escapeString;
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/filterFormat/toInt.js
 * author: rocy
 * version: 1.1.2
 * date: 2010/06/12
 */


/**
 * 对数字做安全转义,确保是十进制数字;否则返回0.
 * @name baidu.string.filterFormat.toInt
 * @function
 * @grammar baidu.string.filterFormat.toInt(source)
 * @param {String} source 待转义字符串
 * 
 * @see baidu.string.filterFormat,baidu.string.filterFormat.escapeJs,baidu.string.filterFormat.escapeString
 * @version 1.2
 * @return {Number} 转义之后的数字
 */
baidu.string.filterFormat.toInt = function(str){
	return parseInt(str, 10) || 0;
};
baidu.string.filterFormat.i = baidu.string.filterFormat.toInt;
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
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.string.formatColor
 * @version: 2010-01-23
 */



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
 * tangram
 * copyright 2011 baidu inc. all rights reserved.
 *
 * path: baidu/string/stripTags.js
 * author: leeight
 * version: 1.1.0
 * date: 2011/04/30
 */



/**
 * 去掉字符串中的html标签
 * @function
 * @grammar baidu.string.stripTags(source)
 * @param {string} source 要处理的字符串.
 * @return {String}
 */
baidu.string.stripTags = function(source) {
    return String(source || '').replace(/<[^>]+>/g, '');
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/subByte.js
 * author: dron, erik, berg
 * version: 1.2
 * date: 2010-06-30
 */



/**
 * 对目标字符串按gbk编码截取字节长度
 * @name baidu.string.subByte
 * @function
 * @grammar baidu.string.subByte(source, length)
 * @param {string} source 目标字符串
 * @param {number} length 需要截取的字节长度
 * @param {string} [tail] 追加字符串,可选.
 * @remark
 * 截取过程中，遇到半个汉字时，向下取整。
 * @see baidu.string.getByteLength
 *             
 * @returns {string} 字符串截取结果
 */
baidu.string.subByte = function (source, length, tail) {
    source = String(source);
    tail = tail || '';
    if (length < 0 || baidu.string.getByteLength(source) <= length) {
        return source + tail;
    }
    
    //thanks 加宽提供优化方法
    source = source.substr(0,length).replace(/([^\x00-\xff])/g,"\x241 ")//双字节字符替换成两个
        .substr(0,length)//截取长度
        .replace(/[^\x00-\xff]$/,"")//去掉临界双字节字符
        .replace(/([^\x00-\xff]) /g,"\x241");//还原
    return source + tail;

};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/toHalfWidth.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/15
 */


/**
 * 将目标字符串中常见全角字符转换成半角字符
 * @name baidu.string.toHalfWidth
 * @function
 * @grammar baidu.string.toHalfWidth(source)
 * @param {string} source 目标字符串
 * @remark
 * 
将全角的字符转成半角, 将“&amp;#xFF01;”至“&amp;#xFF5E;”范围的全角转成“&amp;#33;”至“&amp;#126;”, 还包括全角空格包括常见的全角数字/空格/字母, 用于需要同时支持全半角的转换, 具体转换列表如下("空格"未列出)：<br><br>

！ => !<br>
＂ => "<br>
＃ => #<br>
＄ => $<br>
％ => %<br>
＆ => &<br>
＇ => '<br>
（ => (<br>
） => )<br>
＊ => *<br>
＋ => +<br>
， => ,<br>
－ => -<br>
． => .<br>
／ => /<br>
０ => 0<br>
１ => 1<br>
２ => 2<br>
３ => 3<br>
４ => 4<br>
５ => 5<br>
６ => 6<br>
７ => 7<br>
８ => 8<br>
９ => 9<br>
： => :<br>
； => ;<br>
＜ => <<br>
＝ => =<br>
＞ => ><br>
？ => ?<br>
＠ => @<br>
Ａ => A<br>
Ｂ => B<br>
Ｃ => C<br>
Ｄ => D<br>
Ｅ => E<br>
Ｆ => F<br>
Ｇ => G<br>
Ｈ => H<br>
Ｉ => I<br>
Ｊ => J<br>
Ｋ => K<br>
Ｌ => L<br>
Ｍ => M<br>
Ｎ => N<br>
Ｏ => O<br>
Ｐ => P<br>
Ｑ => Q<br>
Ｒ => R<br>
Ｓ => S<br>
Ｔ => T<br>
Ｕ => U<br>
Ｖ => V<br>
Ｗ => W<br>
Ｘ => X<br>
Ｙ => Y<br>
Ｚ => Z<br>
［ => [<br>
＼ => \<br>
］ => ]<br>
＾ => ^<br>
＿ => _<br>
｀ => `<br>
ａ => a<br>
ｂ => b<br>
ｃ => c<br>
ｄ => d<br>
ｅ => e<br>
ｆ => f<br>
ｇ => g<br>
ｈ => h<br>
ｉ => i<br>
ｊ => j<br>
ｋ => k<br>
ｌ => l<br>
ｍ => m<br>
ｎ => n<br>
ｏ => o<br>
ｐ => p<br>
ｑ => q<br>
ｒ => r<br>
ｓ => s<br>
ｔ => t<br>
ｕ => u<br>
ｖ => v<br>
ｗ => w<br>
ｘ => x<br>
ｙ => y<br>
ｚ => z<br>
｛ => {<br>
｜ => |<br>
｝ => }<br>
～ => ~<br>
		
 *             
 * @returns {string} 转换后的字符串
 */

baidu.string.toHalfWidth = function (source) {
    return String(source).replace(/[\uFF01-\uFF5E]/g, 
        function(c){
            return String.fromCharCode(c.charCodeAt(0) - 65248);
        }).replace(/\u3000/g," ");
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/string/wbr.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/30
 */



/**
 * 为目标字符串添加wbr软换行
 * @name baidu.string.wbr
 * @function
 * @grammar baidu.string.wbr(source)
 * @param {string} source 目标字符串
 * @remark
 * 
1.支持html标签、属性以及字符实体。<br>
2.任意字符中间都会插入wbr标签，对于过长的文本，会造成dom节点元素增多，占用浏览器资源。
3.在opera下，浏览器默认css不会为wbr加上样式，导致没有换行效果，可以在css中加上 wbr:after { content: "\00200B" } 解决此问题
		
 *             
 * @returns {string} 添加软换行后的字符串
 */
baidu.string.wbr = function (source) {
    return String(source)
        .replace(/(?:<[^>]+>)|(?:&#?[0-9a-z]{2,6};)|(.{1})/gi, '$&<wbr>')
        .replace(/><wbr>/g, '>');
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
 * 操作flash对象的方法，包括创建flash对象、获取flash对象以及判断flash插件的版本号
 * @namespace baidu.swf
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
 * @return {String} 版本号
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
        for (var i = 12; i >= 2; i--) {
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
        if (params[k] && (item || item === false || item === 0)) {
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
        if (item || item === false || item === 0) {
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
    baidu.dom.insertHTML( target || document.body ,'beforeEnd',html );
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
 * Copyright 2011 Baidu Inc. All rights reserved.
 */






/**
 * Js 调用 Flash方法的代理类.
 * @function
 * @name baidu.swf.Proxy
 * @grammar new baidu.swf.Proxy(id, property, [, loadedHandler])
 * @param {string} id Flash的元素id.object标签id, embed标签name.
 * @param {string} property Flash的方法或者属性名称，用来检测Flash是否初始化好了.
 * @param {Function} loadedHandler 初始化之后的回调函数.
 * @remark Flash对应的DOM元素必须已经存在, 否则抛错. 可以使用baidu.swf.create预先创建Flash对应的DOM元素.
 * @author liyubei@baidu.com (leeight)
 */
baidu.swf.Proxy = function(id, property, loadedHandler) {
    /**
     * 页面上的Flash对象
     * @type {HTMLElement}
     */
    var me = this,
        flash = this._flash = baidu.swf.getMovie(id),
        timer;
    if (! property) {
        return this;
    }
    timer = setInterval(function() {
        try {
            /** @preserveTry */
            if (flash[property]) {
                me._initialized = true;
                clearInterval(timer);
                if (loadedHandler) {
                    loadedHandler();
                }
            }
        } catch (e) {
        }
    }, 100);
};
/**
 * 获取flash对象.
 * @return {HTMLElement} Flash对象.
 */
baidu.swf.Proxy.prototype.getFlash = function() {
    return this._flash;
};
/**
 * 判断Flash是否初始化完成,可以与js进行交互.
 */
baidu.swf.Proxy.prototype.isReady = function() {
    return !! this._initialized;
};
/**
 * 调用Flash中的某个方法
 * @param {string} methodName 方法名.
 * @param {...*} var_args 方法的参数.
 */
baidu.swf.Proxy.prototype.call = function(methodName, var_args) {
    try {
        var flash = this.getFlash(),
            args = Array.prototype.slice.call(arguments);

        args.shift();
        if (flash[methodName]) {
            flash[methodName].apply(flash, args);
        }
    } catch (e) {
    }
};
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/url/jsonToQuery.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/16
 */





/**
 * 将json对象解析成query字符串
 * @name baidu.url.jsonToQuery
 * @function
 * @grammar baidu.url.jsonToQuery(json[, replacer])
 * @param {Object} json 需要解析的json对象
 * @param {Function=} replacer_opt 对值进行特殊处理的函数，function (value, key)
 * @see baidu.url.queryToJson,baidu.url.getQueryValue
 *             
 * @return {string} - 解析结果字符串，其中值将被URI编码，{a:'&1 '} ==> "a=%261%20"。
 */
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
            // value的值需要encodeURIComponent转义吗？
            // FIXED 优化了escapeSymbol函数
            while (itemLen--) {
                result.push(key + '=' + replacer(item[itemLen], key));
            }
        } else {
            result.push(key + '=' + replacer(item, key));
        }
    });
    
    return result.join('&');
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/url/queryToJson.js
 * author: erik
 * version: 1.1.0
 * date: 2009/11/16
 */




/**
 * 解析目标URL中的参数成json对象
 * @name baidu.url.queryToJson
 * @function
 * @grammar baidu.url.queryToJson(url)
 * @param {string} url 目标URL
 * @see baidu.url.jsonToQuery
 *             
 * @returns {Object} - 解析为结果对象，其中URI编码后的字符不会被解码，'a=%20' ==> {a:'%20'}。
 */
baidu.url.queryToJson = function (url) {
    var query   = url.substr(url.lastIndexOf('?') + 1),
        params  = query.split('&'),
        len     = params.length,
        result  = {},
        i       = 0,
        key, value, item, param;
    
    for (; i < len; i++) {
        if(!params[i]){
            continue;
        }
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
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */


/**
 * 对一些数据处理提供的类
 * @namespace baidu.data
 */
baidu.data = baidu.data || {};
/**
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 */





/**
 * Field构造函数
 * @class
 * @public
 * @grammar new baidu.data.Field(options)
 * @param {Object} options 参数
 * @config {Object} options.define 定义参数，包含{fieldType,defaultValue}
 * @config {Object} options.validation 条件限制，是否有长度，最大值，最小值等限制，类型见baidu.validator
 * @return {baidu.data.Field} Field 实例
 */
baidu.data.Field = baidu.data.Field || (function(){
    
    /**
     * Field构造函数
     * @private
     * @param {Object} options 参数
     * @config {Object} options.define 定义参数，包含{fieldType,defaultValue},
     * @config {String} options.name
     * @config {Object} options.validation 条件限制，是否有长度，最大值，最小值等限制，类型见baidu.validator
     */
    var Field = function(options, dataModel){
        var me = this,
            define = options.define || {};
       
        me._defaultValue = typeof define.defaultValue != 'undefined' ? define.defaultValue : me._defaultValue;
        me._type = define.type || ''; 
        
        me._validation = options.validation || [];
        me._validation.push({
        	'rule': me._type
        });
        
        me._dataModel = dataModel;
        me._name = options.name;
        me._validator = me._dataModel._validator;
    };

    Field.prototype = {

        /**
         * @lends baidu.data.Field.prototype
         */

        _defaultValue: '',
        _name: '',
        

        /**
         * 根据index值设置数据,当index相同的值存在时，会直接进行覆盖
         * @public
         * @param {Object} data, 可选
         * @return {Boolean}
         */
        set: function(index, data){
            var me = this,
                result = {
                    'result': true
                };
            
            if(typeof data == 'undefined'){
                
                me._set(index, me._defaultValue);
            
            }else if(me._validator){
               
                result = me._validator.test(data, me._validation);
                result.result && me._set(index, data);   
            
            }else{   
                me._set(index, data); 
            }
            
            return result;
        },

        _set: function(index, data){
            var me = this;

            data = baidu.object.clone(data);
            me._dataModel._data[index] = me._dataModel._data[index] || {};
            me._dataModel._data[index][me._name] = data;
        }
    };

    return Field;

})();
/**
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 */


















/**
 * DataModel实体类
 * @class
 * @grammar new baidu.data.DataModel(options);
 * @public
 * @param {Object} options 设置项
 * @config {Object} options.fields 通过ModalManager.defineDM定义的数据结构
 * @config {Number} options.recodeLength cancel操作的记录数
 * @config {baidu.data.Validator} validator
 * @return {baidu.data.DataModel} DataModel 实例
 */
baidu.data.DataModel = baidu.data.DataModel || (function(){

    var CLONE = baidu.object.clone,
        ARRAYEACH = baidu.array.each,
        OBJECTEACH = baidu.object.each;

    var dataAction = {
        'ADD':'ADD',
        'REMOVE': 'REMOVE',
        'UPDATE': 'UPDATE',
        'NULL': 'NULL'
    };

    /**
     * 创建Field实例
     * @private
     * @param {Object} fields config
     * @param {baidu.data.DataModel} dataModel
     */
    function _createField(fields, dataModel){
        var fields = fields || {};

        OBJECTEACH(fields, function(config, fieldName){
            baidu.extend(config,{
                name: fieldName
            });
            dataModel._fields[fieldName] = new baidu.data.Field(config, dataModel);
        });
    };

    /**
     * DataModel实体类
     * @private
     * @param {Object} options 设置项
     * @config {Object} options.fields 通过ModalManager.defineDM定义的数据结构
     * @config {Number} options.recodeLength cancel操作的记录数
     * @config {baidu.data.Validator} validator
     */
    var dataModel = function(options){
       
        var me = this,
            options = options || {};
            
        /**
         * 存储Field实例的名值对
         * @private
         * @attribute
         */
        me._fields = {};
        
        /**
         * 数据值
         * @private
         * @attribute
         */
        me._data = {};

        me._actionQueue = [];
        me._recodeLength = options.recodeLength || me.recodeLength;
        
        me._validator = options.validator;
        _createField(options.fields || {}, me);
    };
        
    
    dataModel.prototype = 
    /**
     *  @lends baidu.data.DataModel.prototype
     */
    {
      
        /**
         * 数据存储索引
         * @private
         * @attribute
         */
        _index: 0,

        /**
         * 记录长度，默认值为5
         * @public
         * @attribute
         */
        _recodeLength: 5,

        /**
         * lastAction 压如队列
         * @private
         * @param {String} action
         * @return {Null}
         */
        _setLastAction:function(action, lastData, lastChange){
            var me = this;

            me._actionQueue.push({
                'action': action,
                'lastData': lastData,
                'lastChange': lastChange
            });

            me._actionQueue.length > me._recodeLength && me._actionQueue.shift();
        },

        /**
         * 获取新的id
         * @private
         * @attribute
         * @return {Number}
         */
        _getNewId: function(){
            return this._index++;           
        },
        
        /**
         * 回滚id
         * @private
         * @attribute
         */
        _revertId: function(){
        	this._index--;
        },

        /**
         * 根据传入的index数组返回数据
         * @private
         * @param {String|String[]} where
         * @param {Number|Number[]} indexArr
         * @return {Object}
         */
        _getDataByIndex: function(where, indexArr){
            var result = {},
                me = this;

            ARRAYEACH(indexArr, function(index){
                result[index] = me._getDataByName(where, me._data[index]);
            });

            return result;
        },
        
        /**
         * 根据传入的function返回数据
         * @private
         * @param {String|String[]} where
         * @param {Function} fun
         * @return {Object}
         */
        _getDataByFunction: function(where, fun){
            var me = this,
                result = {};
            
            OBJECTEACH(me._data, function(eachData, dataIndex){
                if(fun(eachData)){
                    result[dataIndex] = me._getDataByName(where, eachData);
                }
            });

            return result;

        },

        /**
         * 根据where从单行数据中取出所致定的数据
         * @private
         * @param {Array|String} where
         * @param {Object} data
         * @return {Object}
         */
        _getDataByName: function(where, data){
            var me = this,
                result = {};

            if(where == '*'){
                return CLONE(data); 
            }

            baidu.lang.isString(where) && (where = where.split(','));
            ARRAYEACH(where, function(name){
                result[name] = data[name];
            });
            return CLONE(result);
        },

        /**
         * 根据条件判断函数获取数据中符合要求的id
         * @private
         * @param {Function|Number[]|Number} condition
         * @return {Number[]}
         */
        _getConditionId: function(condition){
            var me = this,
                result = [];

            if(condition == '*')
                return baidu.object.keys(me._data);

            if(baidu.lang.isNumber(condition)){
                return [condition];
            }

            if(baidu.lang.isArray(condition)){
                return condition;
            }

            if(baidu.lang.isFunction(condition)){
                OBJECTEACH(me._data, function(eachData, dataIndex){
                    condition(eachData) && result.push(dataIndex);
                });    
                return result;
            }

            return result;
        },
        
        /**
         * 添加新数据
         * @public
         * @param {Object} 数据值，可以名值对
         * @return {fail:[], success[]} fail数据为添加失败的数据的index,success数组为成功插入的数据的索引值 
         */
        add: function(data){
            var me = this,
                data = data || {},
                result = {
                    fail: [],
                    success: []
                }, 
                tmpResult, tmpNames,
                dataIndex,length,
                lastData = {}, lastChange = {};

            if(baidu.object.isEmpty(data)) return result; 

            if(!baidu.lang.isArray(data)) data = [data];
            
            baidu.each(data, function(eachData, index){

                tmpResult = true;
                tmpNames = [];
                dataIndex = me._getNewId();
            
                OBJECTEACH(me._fields, function(field, name){
                    tmpResult = field.set(dataIndex, eachData[name]);
                    tmpResult.result ? tmpNames.push(name) : result.fail.push(index); 
                    return tmpResult.result;
                });

                if(!tmpResult.result){
                    delete(me._data[dataIndex]);
                    me._revertId();
                }else{

                    lastData[dataIndex] = 'undefined';
                    lastChange[dataIndex] = CLONE(me._data[dataIndex]);

                    result.success.push(dataIndex);
                }
            });

            result.success.length > 0 && me._setLastAction(dataAction.ADD, lastData, lastChange);

            return result;
        },
      
        
        /**
         * 按条件查找并返回数据
         * @public
         * @param {String} where 查找那些field的数值,以','分割，支持'*'
         * @param {Function|Number|Number[]} condition 查找条件方法,或者包含index的数组或者index
         * @return {Object}
         */
        select: function(where, condition){
            var me = this,
                result = [],
                index;

            if(me._data.length == 0){
                return result;
            }

            index = me._getConditionId(condition);
            result = me._getDataByIndex(where, index);

            return result;
        },
        
        

        /**
         * 根据条件设置field的值
         * @public
         * @param {Object} data
         * @param {Function|Number[]|Number} condition 查找条件方法,或者包含index的数组或者index
         * @return {Number} 跟新的行数
        */
        update: function(data, condition){
            var me = this,
                resultId = [],
                tmpResult,
                tmpNames = [],
                result = 0,
                dataIndex,
                lastData = {}, lastChange = {};
           
            if(baidu.object.isEmpty(data)){
                return result;
            } 

            data = CLONE(data);
            resultId = me._getConditionId(condition);
            //第一次更新时做数据验证
            if(resultId.length > 0){
               dataIndex = resultId.shift();
               lastData[dataIndex] = CLONE(me._data[dataIndex]);
               
               OBJECTEACH(data, function(item, name){
                   tmpResult = me._fields[name].set(dataIndex, item);
                   tmpResult && tmpNames.push(name);
                   return tmpResult;
               });
               if(!tmpResult){
                   me._data[dataIndex] = lastData;
                   return result;
               }

               lastChange[dataIndex] = me._data[dataIndex];

               result++;
            }
            
            ARRAYEACH(resultId, function(dataIndex){
                
                lastData[dataIndex] = CLONE(me._data[dataIndex]);
                
                OBJECTEACH(data, function(item, name){
                    me._data[dataIndex][name] = item;
                });
                
                lastChange[dataIndex] = me._data[dataIndex];
                result++;
            });

            result > 0 && me._setLastAction(dataAction.UPDATE, lastData, lastChange);
            return result;
         },

        /**
         * 删除数据
         * @public
         * @param {Function|Number[]|Number} condition 查找条件方法,或者包含index的数组或者index
         * @return {Number} 被删除行数
         */
        remove: function(condition){
            var me = this,
                resultId = me._getConditionId(condition),
                result = 0,data,
                lastData = {}, lastChange = {};

            if(resultId.length == 0){
                return result;
            }
            
            baidu.each(resultId, function(dataIndex){
               
                lastChange[dataIndex] = lastData[dataIndex] = CLONE(me._data[dataIndex]);
                
                result++;
                delete(me._data[dataIndex]);
            });
           
            result > 0 && me._setLastAction(dataAction.REMOVE, lastData, lastChange);
            return result;
        },

        /**
         * 回复上次操作之前的结果
         * @public
         */
        cancel: function(){
            var me = this,
                lastAction,
                result = {
                    row: 0,
                    cancelAction: dataAction.NULL,
                    lastChange: {}
                };
            
            if(me._actionQueue.length == 0)
               return result;

            lastAction = me._actionQueue.pop();
            result.lastChange = lastAction.lastChange;
            switch (lastAction.action){
                case dataAction.ADD:
                    OBJECTEACH(lastAction.lastData, function(data, dataIndex){
                        delete(me._data[dataIndex]);
                        result.row ++;
                    });
                    result.cancelAction = dataAction.ADD;
                    break;
                case dataAction.REMOVE:
                    OBJECTEACH(lastAction.lastData, function(data, dataIndex){
                        me._data[dataIndex] = data;
                        result.row ++;
                    });
                    result.cancelAction = dataAction.REMOVE;
                    break;
                case dataAction.UPDATE:
                    OBJECTEACH(lastAction.lastData, function(data, dataIndex){
                        me._data[dataIndex] = data;
                        result.row ++;
                    });
                    result.cancelAction = dataAction.UPDATE;
                    break;
                default:
                    return result;
            };

            return result;
        },

        /**
         * 返回最后一次修改时所涉及的数据
         * @public
         * @return {Object}
         */
        getLastChange: function(){
            var me = this;
                data = me._actionQueue.length > 0 ? CLONE(me._actionQueue[me._actionQueue.length - 1].lastChange) : [];
            
            return data; 
        }
    };

    return dataModel;
})();
/**
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * @path:data/dataSource.js
 * @author:walter
 * @version:1.0.0
 * @date:2010-11-30
 */



/**
 * 数据源类
 * @namespace baidu.data.dataSource
 */
baidu.data.dataSource = baidu.dataSource = baidu.data.dataSource || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */


/**
 * 提供json,xml,html的基本处理方法
 * @namespace baidu.parser
 */
baidu.parser = baidu.parser || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



baidu.parser.type = {
    'XML': 'Xml',
    'JSON': 'Json',
    'HTML': 'Html'
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 工厂方法，创建对应type的parser实例
 * @public
 * @param {baidu.parser.type} type
 * @param {Object} options
 */
baidu.parser.create = function(type, options){
    var type = type || '',
        options = options || {};

    if(baidu.parser[type]){
        return new baidu.parser[type](options);
    }

    return null;
};
/**
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * @path:data/dataSource/DataSource.js
 * @author:Walter
 * @version:1.0.0
 * @date:2010-11-30
 */







/**
 * 数据源类
 * @class
 * @grammar new baidu.data.dataSource.DataSource(options)
 * @param {Object}      [options]              config参数
 * @config {Number}     [maxCache = 10]       缓存数据的最大个数
 * @config {Boolean}    [cache = true]        是否使用缓存
 * @config {baidu.parser.type} [dataType = '']    传入的数据为何种类型，当该值传入时会试图创建对应的parser
 * @config {Function}   [transition]          转换数据算法
 * @return {baidu.data.dataSource.DataSource} 数据源类
 * @private
 */
baidu.data.dataSource.DataSource = baidu.lang.createClass(function(options){
    this._cacheData = {};
    baidu.object.extend(this, options);
    
    this.addEventListener("onbeforeget", function(evt){
        var me = this, 
			data;
        if (me.cache && (data = me._cacheData[evt.key]) && evt.onsuccess) {
            evt.onsuccess.call(me, data);
        }
        
        evt.returnValue = !!data;
    });
}, {
    type: "baidu.data.dataSource.DataSource"
}).extend(
    /**
     *  @lends baidu.data.dataSource.DataSource.prototype
     */
    {
    
	maxCache: 100,
    
	cache: true,

    dataType: '',

    /**
     * 更新配置
     * @param {Object} options
     */
    update: function(options){
        var me = this;
        baidu.object.extend(me, options);
    },
    
    /**
     * 
     * 获取数据
     * @interface 
     * @param {Object} options 配置信息
     */
    get: function(options){
    
    },

    /**
     * 存储数据接口,由具体的dataSource实现
     */
    set: function(){},
    
    /**
     * 转换数据格式并调用回调函数
     * @private 
     * @param {Object} options
     * @return {Object} 返回数据
     */
    _get: function(options){
        var me = this, 
			data;
       
        //创建parser
        function createParser(type, data){
            var parser = null;

            if(type){
                parser = baidu.parser.create(type);
                parser && parser.load(data);
                return parser ? parser : data;
            }

            return  data;
        };

        data = createParser(me.dataType, me.source);
        data = me.transition.call(me, data);
        
        me.cache && options.key && data && me._addCacheData(options.key, data);
        options.onsuccess && options.onsuccess.call(me, data);
        return data;
    },
    
    /**
	 * 转换数据格式
     * @function 
     * @param  {Object} source 数据源
     * @return {Object} source 转换格式后的数据源
     */
    transition: function(source){
        return source;
    },
    
    /**
     * 增加缓存数据
     * @privite 
     * @param {Object} key    数据键值对Key值
     * @param {Object} value  数据键值对value值
     */
    _addCacheData: function(key, value){
        var me = this, 
			keySet = baidu.object.keys(me._cacheData);
        while (me.maxCache > 0 && keySet.length >= me.maxCache) {
            delete me._cacheData[keySet.shift()];
        }
        if (me.maxCache > 0) {
            me._cacheData[key] = value;
        }
    }
});
/**
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * @path:data/dataSource/ajax.js
 * @author:Walter
 * @version:1.0.0
 * @date:2010-11-30
 */





/**
 * 异步调用数据源类
 * @function
 * @grammar baidu.data.dataSource.ajax(url, options)
 * @param {String}     url                           数据源地址
 * @param {Object}     [options]                     配置
 * @config {Number} maxCache 缓存数据的最大个数，默认10
 * @config {Boolean} cache 是否使用缓存，默认开启
 * @config {Function} transition 转换数据算法  
 * @config {Function} onbeforeget beforeget事件
 */
baidu.data.dataSource.ajax = function(url, options){
    options = baidu.object.extend({
        url: url
    }, options || {});
	
    var dataSource = new baidu.data.dataSource.DataSource(options);
	
	/**
	 * 获取数据
	 * @param {Object}    options                 配置
	 * @param {String}    [options.key = url + param]     用于存取缓存
	 * @param {String}    [options.method = 'GET']        请求的类型
	 * @param {Object}    [options.param]                 需要发送的数据
	 * @param {Function}  [options.onsuccess]             加载成功回调函数
	 * @param {Function}  [options.onfailure]             加载失败回调函数
	 * @param {Object}    [options.ajaxOption]            request参数
	 */
    dataSource.get = function(options){
        var me = this;
        options = options || {};
        options.key = options.key || (me.url + (options.param ? "?" + baidu.json.stringify(options.param) : ""));
        if (!me.dispatchEvent("onbeforeget", options)) {
            baidu.ajax.request(options.key, me.ajaxOption ||
            {
                method: options.method || 'get',
                data: options.param,
                onsuccess: function(xhr, responseText){
                    me.source = responseText;
                    me._get(options);
                },
                onfailure: function(xhr){
                    options.onfailure && options.onfailure.call(me, xhr);
                }
            });
        }
    };
    return dataSource;
};
/**
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * @path:data/dataSource/local.js
 * @author:Walter
 * @version:1.0.0
 * @date:2010-11-30
 */



/**
 * 本地数据源类
 * @function
 * @grammar baidu.data.dataSource.local(source, options)
 * @param {Object}     source                        数据源
 * @param {Object}     [options]                     配置
 * @config {Number} maxCache 缓存数据的最大个数，默认10
 * @config {Boolean} cache 是否使用缓存，默认开启
 * @config {Function} transition 转换数据算法  
 * @config {Function} onbeforeget beforeget事件
 */
baidu.data.dataSource.local = function(source, options){
    options = baidu.object.extend({
        source: source
    }, options || {});
    
    var dataSource = new baidu.data.dataSource.DataSource(options);
    
    /**
     * 获取数据
     * @param {Object}    options                 配置
     * @param {String}    [options.key = 'local']     用于存取缓存
     * @param {Function}  [options.onsuccess]             加载成功回调函数
     */
    dataSource.get = function(options){
        var me = this, 
			data;
        options = baidu.object.extend({
            'key': 'local'
        }, options || {});
        
        if (!me.dispatchEvent("onbeforeget", options)) {
            data = me._get(options);
        }
        return data;
    };
    return dataSource;
};
/**
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * @path:data/dataSource/sio.js
 * @author:Walter
 * @version:1.0.0
 * @date:2010-11-30
 */





/**
 * 跨域数据源类
 * @function
 * @grammar baidu.data.dataSource.sio(url, options)
 * @param {String}     url                           数据源地址
 * @param {Object}     [options]                     配置
 * @config {Number} maxCache 缓存数据的最大个数，默认10
 * @config {Boolean} cache 是否使用缓存，默认开启
 * @config {Function} transition 转换数据算法  
 * @config {Function} onbeforeget beforeget事件
 */
baidu.data.dataSource.sio = function(url, options){
    options = baidu.object.extend({
        url: url
    }, options || {});
	
    var dataSource = new baidu.data.dataSource.DataSource(options);
	
	/**
	 * 获取数据
	 * @param {Object}    options                 配置
	 * @param {String}    [options.key = url + param]            用于存取缓存
	 * @param {String}    [options.callByType = 'server']        请求的类型
	 * @param {Object}    [options.param]                        需要发送的数据
	 * @param {Function}  [options.onsuccess]                    加载成功回调函数
	 */
    dataSource.get = function(options){
        var me = this;
        options = options || {};
        options.key = options.key || (me.url + (options.param ? "?" + baidu.json.stringify(options.param) : ""));
        if (options.callByType && options.callByType.toLowerCase() == "browser") {
            options.callByType = "callByBrowser";
        }
        else {
            options.callByType = "callByServer";
        }
        if (!me.dispatchEvent("onbeforeget", options)) {
            baidu.sio[options.callByType](options.key, function(){
                me._get(options);
            });
        }
    };
    return dataSource;
};
/**
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 */









/**
 * 数据仓库类
 * @class
 * @public
 * @grammar new baidu.data.DataStore(options)
 * @param {String|baidu.data.DataModel} dataModel DataModel实例
 * @param {String|baidu.data.dataSource.DataSource} dataSource DataSource实例
 * @param {String|Function} action {'append','replace','merge',Function} 当完成load时，向DataModel中填写数据时使用的策略,默认为append
 * @param {Array[String]} mergeFields 当action 为merge时，合并数据时使用的依据变量
 * @param {Boolean} usingLocal 当merge时出现数据冲突，以local为主还是remote数据为主,默认为本地.action为Function时，该选项不无效
 * @return {baidu.data.DataStore} DataStore 实例
 *  */
baidu.data.DataStore = (function(){
   
    var actionType = {
        'APPEND': 'APPEND',
        'REPLACE': 'REPLACE',
        'MERGE': 'MERGE'
    };

    var dataAction = {
        'ADD': 'ADD',
        'REMOVE': 'REMOVE',
        'UPDATE': 'UPDATE'
    };
    
    /**
     * 数据仓库类
     * @class
     * @private
     * @param {baidu.data.DataModel} dataModel DataModel实例
     * @param {baidu.data.dataSource.DataSource} dataSource DataSource实例
     * @param {String|Function} action {'APPEND','REPLACE','MERGE',Function} 当完成load时，向DataModel中填写数据时使用的策略,默认为append
     * @param {Array[String]} mergeFields 当action 为merge时，合并数据时使用的依据变量
     * @param {Boolean} usingLocal 当merge时出现数据冲突，以local为主还是remote数据为主,默认为本地.action为Function时，该选项不无效
     */
    return baidu.lang.createClass(function(options){
        var me = this,
            dataModel = options.dataModel,
            dataSource = options.dataSource,
            action = options.action,
            sync = options.sync;

        dataModel && (me._dataModel = dataModel);
        dataSource && (me._dataSource = dataSource);
        typeof sync != 'undefined' && (me._sync = sync);
       
        if(!action){
            me._action = 'APPEND';
        }else{
            
            if(baidu.lang.isFunction(action))
                me._action = action;
            else{
                me._action = actionType[action] ? actionType[action] : 'APPEND';
            }
        }

        me._mergeFields = options.mergeFields || [];
        me._usingLocal = typeof options.usingLocal != 'undefined' ? options.usingLocal : me._usingLocal;
        
    
    }).extend({
        
        /**
         *  @lends baidu.data.DataStore.prototype
         */ 

        /**
         * DataModel实例
         * @private
         * @property
         */
        _dataModel: null,
        
        /**
         * DataSource 实例
         * @private
         * @property
         */
        _dataSource: null,

       /**
        * @private
        * @property
        */
        _action: 'APPEND',
       
        /**
         * @private
         * @property
         */
        _usingLocal: true,
       
        /**
         * 是否在操作DataSource时同步更新DataModel
         * @private
         * @property
         */
        _sync: false,

        /**
         * 设DataModel实例
         * @public
         * @param {DataModel} dataModel
         * @return {Boolean}
         */
        setDataModel:function(dataModel){
            
            if(dataModel instanceof baidu.data.DataModel){
                this._dataModel = dataModel;
                return true;
            }
            return false;
        },

        /**
         * 获取DataModel
         * @public
         * @return {DataModel|Null}
         */
        getDataModel: function(){
            return this._dataModel;      
        },

        /**
         * 获取当前使用的DataSource
         * @public
         * @return {Null|DataSource} dataSource
         */
        getDataSource: function(){
            return this._dataSource;
        },

        /**
         * 设置DataSource
         * @public
         * @param {DataSource} dataSource
         * @return {Boolean}
         */
        setDataSource: function(dataSource){
            if(dataSource instanceof baidu.data.dataSource.DataSource){
                this._dataSource = dataSource;
                return true;
            }
            return false;              
        },

        /**
         * 设置是DataSource数据保持同步
         * @pubic
         * @param {Boolean} sync 是否同步
         */
        setSnyc: function(sync){
            this._sync = sync;  
        },

        //TODO: 如何处理数据冲突
        /**
         * DataSource从其数据源拉取数据
         * @param {Object} options
         * @See baidu.data.dataSource
         * @param {Boolean} sync
         * @param {baidu.parser.type} 请求的数据类型，如不提供此参数，则不会向自定义函数传入经过parser包装对象，传入原始数据
         */
        load: function(options, sync, type){

            var me = this,
                dataSource = me._dataSource,
                dataModel = me._dataModel,
                sync = typeof sync != 'undefined' ? sync : me._sync,
                success = options.onsuccess || baidu.fn.blank,
                failture = options.onfailture || baidu.fn.blank,
                tmpData = [];
        
            if(!dataSource) return;

            if(sync){
                options.onsuccess = function(data){
                    switch (me._action){
                        case 'APPEND':
                            success.call(me, dataModel.add(data));
                            break;
                        case 'REPLACE':
                            dataModel.remove('*');
                            success.call(me, dataModel.add(data));
                            break;
                        case 'MERGE':
                       
                            //TODO: 看日后需求，如果需要将无冲突项进行append到dm中，在此处添加部分逻辑
                            (me._mergeFields.length != 0) && baidu.each(data, function(item){
                                dataModel.update(item, function(dataLine){
                                    var result = true;
                                    baidu.each(me._mergeFields, function(name){
                                        result = (dataLine[name] == item[name]);
                                        return result;
                                    });

                                    return result;
                                });
                            });
                            success.call(me, data);
                            break;
                        default: 
                            success.call(me, me._action.call(me, data));
                    }     
                };

                options.onfailture = function(){
                    failture.apply(me, arguments);    
                };
            }

            dataSource.get(options);
        },

        //TODO: save数据如何给出？？？？
        /**
         * DataSource commit数据
         * @public
         * @param {Object} options
         * @param {String} dataType 'ALL|LC' 默认值为'LC'
         * @see baidu.data.dataSource.DataSource.commit
         */
        save: function(options, dataType){
            var me = this,
                dataModel = me._dataModel,
                dataSource = me._dataSource,
                dataType= dataType || 'LC';

            dataSource.set(
                options, 
                dataType == 'ALL' ? dataModel.select('*') : dataModel.getLastChange()
            );
        },

        /**
         * 向DataModel中写入新的数据
         * @public
         * @param {Object} data
         * @see baidu.data.DataModel.add
         * @return {fail:Number[], success:Number[]} fail数据为添加失败的数据的index,success数组为成功插入的数据的索引值 
         */
        add: function(data){
            var me = this,
                result = me._dataModel.add(data);
           
            me.dispatchEvent('onadd', {
                row: result.success.length,
                data: (result.success.length > 0 ? me._dataModel.getLastChange() : {})
            })

            return result;
        },

        /**
         * 从DataModel中取出数据
         * @public
         * @param {String} where
         * @param {Function|Number[]|Number} condition 查找条件方法或者包含index的数组或者index
         * @see baidu.data.DataModel.select
         * @return {Object}
         */
        select: function(where, condition){
            var where = where || '*',
                condition = (typeof condition != 'undefined' ? condition : '*'); 
            
            return this._dataModel.select(where, condition);
        },

        /**
         * 更新数据
         * @public
         * @param {Object} data
         * @param {Function|Number[]|Number} condition 查找条件方法或者包含index的数组或者index
         * @see baidu.data.DataModel.select
         * @return {Number} 受到影响的数据行数
         */
        update: function(data, condition){
            var me = this,
                data = data || {},
                condition = (typeof condition != 'undefined' ? condition : '*'),
                row = me._dataModel.update(data, condition);

            me.dispatchEvent('onupdate',{
                row: row,
                data: (row ? me._dataModel.getLastChange() : {})
                
            });

            return row;
        },

        
        /**
         * 删除DataModel中的数据
         * @public
         * @param {Function|Number[]|Number} condition 查找条件方法或者包含index的数组或者index
         * @See baidu.data.dataModel.remove
         * @return {Number} 被删除的数据
         */
        remove: function(condition){
            var me = this,
                condition = (typeof condition != 'undefined' ? condition : '*'),
                row = me._dataModel.remove(condition);

            me.dispatchEvent('ondelete', {
                row: row,
                data: (row ? me._dataModel.getLastChange() : {})
            });

            return row;
        },

        /**
         * 撤销上一次所做的修改
         * @public
         * @return {Number} 受影响的行数
         */
        cancel: function(){
            var me = this,
                result = me._dataModel.cancel();

            me.dispatchEvent('oncancel',{
                cancelAction: result.cancelAction,
                row: result.row,
                lastChange: result.lastChange
            });

            return result.row;
        }
    }); 
})();
/**
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 */





/**
 * DataModel管理类
 * @class
 * @public
 * @grammar new baidu.data.ModelManager([options])
 * @return {baidu.data.ModelManager} ModelManager 实例
 */
baidu.data.ModelManager = baidu.data.ModelManager || (function(){
 
    var _DMDefine = {},
        _DMInstanceByType = {},
        _DMInstanceByIndex = {},
        _index = 0,
        _default = {
            'string': '',
            'number': 0,
            'boolean': true
        };
    	_validator = null;

    /**
     * 返回该类型的default值
     * @private
     * @param {String} type
     * @return {Object}
     */
    function _getDefualtValue(type){
        return (_default[type] || '');
    };

    /**
     * DataModel管理类
     */
    var modelManager = function(options){};
    
    modelManager.prototype = 
    
        /**
         *  @lends baidu.data.ModelManager.prototype
         */

    {
    	
    	
    	/**
    	 * 设置validator
    	 * @param {baidu.data.Validator} validator
    	 * */	
    	setValidator: function(validator){
    		_validator = validator;
    	},	
    	
        /**
         * 对DataModel数据结构进行定义
         * @public
         * @param {String} type DataModel类型的唯一标识符
         * @param {Object} options 设置项
         * @config {Array} options.fields 数据字段设置，{name[String],type[String],defaultValue{Object}}
         * @config {Array} options.validations 验证方式,{type{String},field{String},config}
         */
        defineDM: function(type, options){
            var options = options || [],
                fields = options.fields = options.fields || [],
                validations = options.validations = options.validations || [],
                result = {},
                fieldName = '',
                fieldType = '',
                defaultValue = null;
           
            baidu.each(fields, function(field){
                fieldName = field['name'];
                fieldType = field['type'] || 'string';
                defaultValue = typeof field.defaultValue != 'undefined' ? field.defaultValue : _getDefualtValue(fieldType);
                
                result[fieldName] = {
                    'define': {
                        'type': fieldType,
                        'defaultValue': defaultValue
                    },
                    'validation': []
                };
            });

            baidu.each(validations, function(validation){
                fieldName = validation['field'];
                delete(validation['field']);
                result[fieldName]['validation'] = validation.val || [];
            });

            _DMDefine[type] = result;
        },

        /**
         * 创建DataModel实例
         * @public
         * @param {String} type DataModel类型唯一标识
         * @param {Object} options 创建DataModel使用的参数
         * @see baidu.data.DataModel
         * @return {Array} [index,DataModel]
         */
        createDM: function(type, options){
            options = baidu.extend({
                fields: _DMDefine[type] || {},
                validator: _validator
            }, options);

            var DM = new baidu.data.DataModel(options);
            
            _DMInstanceByType[type] || (_DMInstanceByType[type] = {});
            _DMInstanceByType[type][_index] = DM;
            _DMInstanceByIndex[_index] = DM;

            return [_index++, DM];
        },

        /**
         * 通过标识获取DataModel
         * @public
         * @param {Number} index DataModel的index
         * @return {baidu.data.DataModel}
         */
        getDMByIndex: function(index){
           return _DMInstanceByIndex[index] || null; 
        },

        /**
         * 通过DataModel类型唯一标识符获取DataModel实例
         * @public
         * @param {String} type 类型唯一标识
         * @return {Object}
         */
        getDMByType: function(type){
            return _DMInstanceByType[type] || [];
        }
    };

    return new modelManager();
})();
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */












/**
 * 一个本地存储对象，使用key-value的方式来存值，不具备夸浏览器通信功能，根据浏览器的不同自动选择userData或是localStorage或是cookie来存值.
 * @Object
 * @grammar baidu.data.storage
 * @return {baidu.data.storage}
 */
baidu.data.storage = (function() {
    var _guid = baidu.lang.guid(),
        _status = {//状态说明
            SUCCESS: 0,
            FAILURE: 1,
            OVERFLOW: 2
        };
    function _getKey(key) {
        //escape spaces in name，单下划线替换为双下划线，空格替换为_s
        return key.replace(/[_\s]/g, function(matcher) {
            return matcher == '_' ? '__' : '_s';
        });
    }

    function _getElement() {
        return baidu.dom.g(_guid + '-storage');
    }

    function _getInstance() {
        var _storage;
        if (window.ActiveXObject && baidu.browser.ie < 9) { //IE9不再支持userData，暂时采用版本判断的临时方法解决。by xiadengping
            _storage = _createUserData();
        }else if (window.localStorage) {
            _storage = _createLocalStorage();
        }else {
            _storage = _createCookie();
        }
        return _storage;
    }

    /**
     * 将userData进行包装并返回一个只包含三个方法的对象
     * @return {Object} 一个对象，包括set, get, del接口.
     * @private
     */
    function _createUserData() {
        baidu.dom.insertHTML(document.body,
            'beforeEnd',
            baidu.string.format('<div id="#{id}" style="display:none;"></div>',
                {id: _guid + '-storage'})
        );
        _getElement().addBehavior('#default#userData');
        return {
//            size: 64 * 1024,
            set: function(key, value, callback, options) {
                var status = _status.SUCCESS,
                    ele = _getElement(),
                    newKey = _getKey(key),
                    time = options && options.expires ? options.expires
                        : new Date().getTime() + 365 * 24 * 60 * 60 * 1000;//默认保存一年时间
                //bugfix 若expires是毫秒数，先要new Date().getTime()再加上毫秒数。 
                //另外time有可能是字符串，需要变成数字。by xiadengping
                if (baidu.lang.isDate(time)) {
                    time = time.getTime();
                } else {
                    time = new Date().getTime() + (time - 0);
                }
                ele.expires = new Date(time).toUTCString();
                try {
                    ele.setAttribute(newKey, value);
                    ele.save(newKey);
                }catch (e) {
                    status = _status.OVERFLOW;//存储时抛出异常认为是溢出
                }
                ele = null;
                callback && callback.call(this, status, value);
            },
            get: function(key, callback) {
                var status = _status.SUCCESS,
                    ele = _getElement(),
                    newKey = _getKey(key),
                    val = null;
                try {
                    ele.load(newKey);
                    val = ele.getAttribute(newKey);//若过期则返回null
                }catch (e) {
                    status = _status.FAILURE;
                    throw 'baidu.data.storage.get error!';
                }
                callback && callback.call(this, status, val);
            },
            del: function(key, callback) {
                var status = _status.SUCCESS,
                    ele = _getElement(),
                    newKey = _getKey(key),
                    val;
                try {
                    ele.load(newKey);
                    val = ele.getAttribute(newKey);
                    if (val) {
                        //315532799000 是格林威治时间1979年12月31日23时59分59秒。这是删除UserData的最靠前的一个有效expires时间了，再往前一毫秒，expires = new Date(315532798999).toUTCString(); 就删不掉userdata了，可以认为是IE的一个bug
                        ele.removeAttribute(newKey);
                        ele.expires = new Date(315532799000).toUTCString();
                        ele.save(newKey);
                    }else {
                        status = _status.FAILURE;
                    }
                }catch (e) {
                    status = _status.FAILURE;
                }
                callback && callback.call(this, status, val);
            }
        };
    }

    /**
     * 将localstorage进行包装并返回一个只包含三个方法的对象
     * @return {Object} 一个对象，包括set, get, del接口.
     * @private
     */
    function _createLocalStorage() {
        return {
//            size: 10 * 1024 * 1024,
            set: function(key, value, callback, options) {
                var status = _status.SUCCESS,
                    storage = window.localStorage,
                    newKey = _getKey(key),
                    time = options && options.expires ? options.expires : 0;
                //bugfix 若expires是毫秒数，先要new Date().getTime()再加上毫秒数。
                //另外time有可能是字符串，需要变成数字。by xiadengping
                if (baidu.lang.isDate(time)) {
                    time = time.getTime();
                } else if (time > 0) {
                    time = new Date().getTime() + (time - 0);
                }
                
                try {
                    storage.setItem(newKey, time + '|' + value);
                }catch (e) {
                    status = _status.OVERFLOW;
                }
                callback && callback.call(this, status, value);
            },
            get: function(key, callback) {
                var status = _status.SUCCESS,
                    storage = window.localStorage,
                    newKey = _getKey(key),
                    val = null,
                    index,
                    time;
                try {
                    val = storage.getItem(newKey);
                }catch (e) {
                    status = _status.FAILURE;
                }
                if (val) {
                    index = val.indexOf('|');
                    time = parseInt(val.substring(0, index), 10);
                    if (new Date(time).getTime() > new Date().getTime()
                        || time == 0) {
                        val = val.substring(index + 1, val.length);
                    }else {
                        val = null;
                        status = _status.FAILURE;
                        this.del(key);
                    }
                }else {
                    status = _status.FAILURE;
                }
                callback && callback.call(this, status, val);
            },
            del: function(key, callback) {
                var status = _status.SUCCESS,
                    storage = window.localStorage,
                    newKey = _getKey(key),
                    val = null;
                try {
                    val = storage.getItem(newKey);
                }catch (e) {
                    status = _status.FAILURE;
                }
                if (val) {
                    val = val.substring(val.indexOf('|') + 1, val.length);
                    status = _status[val ? 'SUCCESS' : 'FAILURE'];
                    val && storage.removeItem(newKey);
                }else {
                    status = _status.FAILURE;
                }
                callback && callback.call(this, status, val);
            }
        };
    }

    /**
     * 将baidu.cookie进行包装并返回一个只包含三个方法的对象
     * @return {Object} 一个对象，包括set, get, del接口.
     * @private
     */
    function _createCookie() {
        return {
//            size: 4 * 1024,
            set: function(key, value, callback, options) {
                baidu.cookie.set(_getKey(key), value, options);
                callback && callback.call(me, _status.SUCCESS, value);
            },

            get: function(key, callback) {
                var val = baidu.cookie.get(_getKey(key));
                callback && callback.call(me, _status[val ? 'SUCCESS' : 'FAILURE'], val);
            },
            del: function(key, callback) {
                var newKey = _getKey(key),
                    val = baidu.cookie.get(newKey);
                baidu.cookie.remove(newKey);
                callback && callback.call(me, _status[val ? 'SUCCESS' : 'FAILURE'], val);
            }
        };
    }


    return /**@lends baidu.data.storage.prototype*/{
        /**
         * 将一个键值对存入到本地存储中
         * @function
         * @grammar baidu.data.storage.set(key, value, callback, options)
         * @param {String} key 一个键名.
         * @param {String} value 一个值.
         * @param {Function} callback 一个回调函数，函数的第一参数返回该次存储的状态码，各状码表示{0: 成功, 1: 失败, 2: 溢出}，第二参数返回当次的value.
         * @param {Object} options config参数.
         * @config {Date|Number} expires 设置一个过期时间，值的类型必须是一个Date对象或是一个毫秒数
         */
        set: function(key, value, callback, options) {
            var me = this;
            !me._storage && (me._storage = _getInstance());
            me._storage.set.apply(me._storage, arguments);
        },

        /**
         * 依据一个键名称来取得本地存储中的值
         * @function
         * @grammar baidu.data.storage.get(key, callback)
         * @param {String} key 一个键名称.
         * @param {Function} callback 一个回调函数，函数的第一参数返回该次存储的状态码，各状码表示{0: 成功, 1: 失败, 2: 溢出}，第二参数返回当次的value.
         */
        get: function(key, callback) {
            var me = this;
            !me._storage && (me._storage = _getInstance());
            me._storage.get.apply(me._storage, arguments);
        },

        /**
         * 根据一个键名称来删除在本地存储中的值
         * @function
         * @grammar baidu.data.storage.remove(key, callback)
         * @param {String} key 一个键名称.
         * @param {Function} callback 一个回调函数，函数的第一参数返回该次存储的状态码，各状码表示{0: 成功, 1: 失败, 2: 溢出}，第二参数返回当次的value.
         */
        remove: function(key, callback) {
            var me = this;
            !me._storage && (me._storage = _getInstance());
            me._storage.del.apply(me._storage, arguments);
        }
    };
})();
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */
















/**
 * 数据验证组件
 * @class
 * @grammar new baidu.data.Validator(options)
 * @param {Object} validations 每个验证规则的具体配置
 *  {
 *     val1: [
 *               {rule: "length", conf: {len:20}},
 *               {rule:"email" }
 *           ],
 *     val2: [
 *               {rule: "remote", conf: {url:'#', onsuccess: function(){}, onfailure: function(){}}}
 *           ]
 *  }
 * @return {baidu.data.Validator} Validator实例
 */
baidu.data.Validator = baidu.lang.createClass(function(options){

    var me = this;
    me._validations = options || {};
    
    //用来保存用户自定义的验证函数
    me._rules = {}; 

}).extend(

    /**
     * @lends baidu.data.Validator.prototype
     */

{
    /**
     * 对多个数据进行验证
     * @public
     * @param {Array} values 需要验证的数据项，例如：
     *  [
     *      [28, "isAge"], 
     *      ["chengyang", "isNick"], 
     *      ["chengyang", "isName"]
     *  ]
     * @return {Object} 验证反馈（包括该组数据的验证结果和验证失败的具体情况），例如：
     *  {
     *     result: resultType;
     *     detail: [{
     *          index: 0;
     *          type: "numberRange"
     *      }, {
     *          index: 2;
     *          type: "length"
     *      }]
     *  }，验证结果resultType是一个枚举，他的值分别是success: 表示所有值都验证通过, failure: 表示存在验证不通过的值, successwithoutremote: 表示除了使用remote方式验证的值，其他的都验证通过
     */
    validate: function(values){
        var me = this, value, validation, 
            feedback = {
                'result': [],
                'detail': []
            },
            itemResult,
            resultType = baidu.data.Validator.validatorResultTypes;
        
        if(values.length <= 0){
            return;
        }
       
       //逐个验证
        baidu.array.each(values, function(item, index){
            value = item[0];
            validation = item[1];
            itemResult = me._validations[validation] ? me._singleValidate(value, me._validations[validation]) : {'result': false};
            if(itemResult['result'] != true){
                feedback['detail'].push({
                    'index': index,
                    'rule': itemResult.rule || validation
                });
            }
            feedback['result'].push(itemResult['result']);
        });
        
        feedback['result'] = me._wrapResult(feedback['result']);
        
        return feedback;
    },
    
    /**
     * 将数组形式的验证结果包装成validatorResultTypes中的枚举类型
     * @private
     * @param {Object} result 验证结果
     */
    _wrapResult: function(result){
        var me = this,
            resultTypes = baidu.data.Validator.validatorResultTypes;
        if(baidu.array.contains(result, false)){
            result = resultTypes['FAILURE'];
        }else if(!baidu.array.contains(result, false) && baidu.array.contains(result, 'loading')){
            result = resultTypes['SUCCESSWITHOUTREMOTE'];
        }else{
            result = resultTypes['SUCCESS'];
        }
        return result;
    },
    
    /**
     * 对单个数据项进行验证（内部使用）
     * @private
     * @param {String | Number} value 待验证项的值
     * @param {Array} validation 验证规则名称
     * @return {Boolean} 验证结果
     */
    _singleValidate: function(value, validation){
        var me = this, ruleType, rule, itemResult = {'result': true}, remoteConf;//TODO 如果一个值同时使用多个remote方式验证，会出错
        
        baidu.each(validation, function(val){
            ruleType = val.rule;
            if(ruleType == 'remote'){
                remoteConf = val.conf;
            }else{
                rule = me._getRule(ruleType);
                if(!rule(value, val.conf)){
                    itemResult['result'] = false;
                    itemResult['rule'] = ruleType;
                }
            }
        });
        
        //如果除remote以外的验证都返回true，则调用remote验证；如果有一项为false，则无须进行remote验证
        if(!itemResult['result']){
            return itemResult;
        }
        
        if(remoteConf){
            me._remote(value, remoteConf);
            itemResult['result'] = 'loading';
            itemResult['rule'] = 'remote';
        }
        return itemResult;
    },

    /**
     * 对单个数据项进行验证
     * @public
     * @param {String | Number} value 待验证项的值
     * @param {String} rule 验证规则
     * @param {Object} conf 配置项
     * @return {Object} 验证结果
     */
    test: function(value, rule, conf){
        var me = this, validation,tmpVal = [];
        
        if(me._validations[rule]){
            validation = me._validations[rule];
        }else if(me._getRule(rule)){
            validation = [{
                'rule': rule, 
                'conf': conf
            }];
        }else if(baidu.lang.isArray(rule)){
        	
        	baidu.each(rule, function(name){
        		if(me._validations[name.rule]){
        			tmpVal = tmpVal.concat(me._validations[name.rule]);
        		}else{
        			tmpVal.push(name);
        		}
        		
        	});
        	return me._singleValidate(value, tmpVal);
        }else{
            return false;
        }
        
        return me._singleValidate(value, validation);
    },
    
    /**
     * 添加一条规则
     * @public
     * @param {String} name 规则名称
     * @param {Array} validation 验证规则
     */
    addValidation: function(name, validation){
        var me = this;
        me._validations[name] = validation || [];
    },
    
    /**
     * 调用远程接口对数据项进行验证
     * @private
     * @param {String | Number} value 待验证项的值
     * @param {Object} option 参数
     */
    _remote: function(value, option){
        var url = option.url,
            key = option.key,//需要在配置项中指定待验证项对应的key
            option = baidu.object.clone(option),
            me = this;
            
        if(option.method.toUpperCase() == 'GET'){//如果是get方式，直接在URL后面加上参数
            var junctor = url.indexOf('?') < 0 ? '?' : '&';
            url = url + junctor + key + '=' + encodeURIComponent(value);
        }else{
            option.data = key + '=' + encodeURIComponent(value);
        }
        
        if(option.callback){//如果只提供了callback方法，则将其作为onsuccess和onfailure的回调方法
            option['onsuccess'] = option['onfailure'] = function(xhr, responseText){
                option.callback(value, xhr, responseText);//callback方法中需要返回验证的结果（true或者false）
            };
        }else{
            if(option.onsuccess){
                var successCache = option.onsuccess;
                option['onsuccess'] = function(xhr, responseText){
                    successCache(value, xhr, responseText);//onsuccess方法中需要返回验证的结果（true或者false）
                };
            }
            if(option.onfailure){
                var failureCache = option.onfailure;
                option['onfailure'] = function(xhr){
                    failureCache(value, xhr);//onfailure方法中需要返回验证的结果（true或者false）
                };
            }
        }
        baidu.ajax.request(url, option);
    },
    
    /**
     * 添加一条规则
     * @public
     * @param {String} name 规则名
     * @param {Function} handler 执行规则的函数
     */
    addRule: function(name, handler){
        var me = this;
        
        me._rules[name] = handler || baidu.fn.blank;
        me.dispatchEvent('onAddRule', {
            'name': name, 
            'handler': handler
        });
    },
    
    /**
     * 根据规则名取得对应的规则函数
     * @private
     * @param {String} name 规则名
     * @return {Function} 验证函数
     */
    _getRule: function(name){
        var me = this,
            rules = baidu.data.Validator.validatorRules || {};
        
        //先从用户自定义的rules中查找，再从内置的rules中查找
        return me._rules[name] || rules[name] || null;
    }
});

/**
 * 用于存储返回值的枚举类
 * @private
 */
baidu.data.Validator.validatorResultTypes = {
    'SUCCESS': 'success',   //表示所有值都验证通过
    'FAILURE': 'failure',   //表示存在验证不通过的值
    'SUCCESSWITHOUTREMOTE': 'successwithoutremote' //表示除了使用remote方式验证的值，其他的都验证通过
};
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 * Code from EXT
 */














/**
 * 默认提供以下常用验证：require, length, equalTo, lengthRange, numberRange, email, url
 * @Object
 * @name baidu.data.Validator.validatorRules
 * @grammar baidu.data.Validator.validatorRules
 * @return {baidu.data.Validator.validatorRules} validatorRules 实例
 */
baidu.data.Validator.validatorRules = (function(){
    var rules = {
        
        /**
         * Returns true if the given value is empty.
         * @param {String} value The value to validate
         * @return {Boolean} True if the validation passed
         */
        require: function(value){
            return baidu.string.trim(value) !== '';
        },
        
        /**
         * Returns true if the given value`s length is equal to the given length.
         * @param {String} value The value to validate
         * @param {Object} conf Config object 
         * @return {Boolean} True if the validation passed
         */
        length: function(value, conf){
            return value.length == conf.len;
        },
        
        /**
         * Returns true if the given value is equal to the reference value.
         * @param {String || Number} value The value to validate
         * @param {Object} conf Config object 
         * @return {Boolean} True if the validation passed
         */
        equalTo: function(value, conf){
            return value === conf.refer;
        },
        
        /**
         * Returns true if the given value`s length is between the configured min and max length.
         * @param {String || Number} value The value to validate
         * @param {Object} conf Config object 
         * @return {Boolean} True if the validation passed
         */
        lengthRange: function(value, conf){
            var len = value.length,
                min = conf.min,
                max = conf.max;
            if((min && len<min) || (max && len>max)){
                return false;
            }else{
                return true;
            }
        },
        
        /**
         * Returns true if the given value is between the configured min and max values.
         * @param {String || Number} value The value to validate
         * @param {Object} conf Config object 
         * @return {Boolean} True if the validation passed
         */
        numberRange: function(value, conf){
            var min = conf.min,
                max = conf.max;
            if((min && value<min) || (max && value>max)){
                return false;
            }else{
                return true;
            }
        },
        
        /**
         * Returns true if the given value is in the correct email format.
         * @param {String || Number} value The value to validate
         * @return {Boolean} True if the validation passed
         */
        email: function(value){
            return /^[\w!#\$%'\*\+\-\/=\?\^`{}\|~]+([.][\w!#\$%'\*\+\-\/=\?\^`{}\|~]+)*@[-a-z0-9]{1,20}[.][a-z0-9]{1,10}([.][a-z]{2})?$/i.test(value);
        },
        
        /**
         * Returns true if the given value is in the correct url format.
         * @param {String || Number} value The value to validate
         * @return {Boolean} True if the validation passed
         */
        url: function(value){
            return /^(https?|ftp|rmtp|mms):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i.test(value);
        }
    },
    
    //将baidu.lang中的is***部分添加到_rules中
    ruleNames = ['array', 'boolean', 'date', 'function', 'number', 'object', 'string'];
    baidu.each(ruleNames, function(item){
        rules[item] = baidu.lang['is' + item.substr(0,1).toUpperCase() + item.substr(1)];
    });

    return rules;
})();
﻿/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */








/**
 * XPC(cross page channel) 跨域通信模块
 * @name baidu.data.XPC
 * @function
 * @grammar new baidu.data.XPC(true, url[, {timeout:1000}])
 * @param {boolean} isParent 确定当前页面角色，如果是父页面，则为true，跨域的子页面为false，默认值为false.
 * @param {string} url 在对方域下部署的子页面，如果isParent为true，则此参数为必须，否则可以省略.
 * @param {number} timeout 设置超时时间(ms)，超过这个时间视为初始化失败，默认值是3000.
 * @author zhangyunlong
 */
baidu.data.XPC = baidu.lang.createClass(function(isParent, url, options) {

    options = options || {};

    //浏览器特性检查，判断是否支持postMessage，一次运行得到结果
    this._canUsePostMessage = (typeof window.postMessage === 'function' || typeof window.postMessage === 'object');
    //确定角色，父页面为true，子页面为false或undefined
    this._isParent = isParent;
    //初始化完毕标志位
    this.ready = false;
    //当前页面domain，形如(http://www.example.com)
    this.currentDomain = this._getDomainByUrl(location.href);
    //父页面的初始化过程
    if (isParent && url) {
        //创建iframe
        this._channel = this._createIframe(url);
        //设置对方域
        this.targetDomain = this._getDomainByUrl(url);
        this.source = (this._channel.contentWindow || this._channel);
        //页面载入完毕后，由父页面先发送初始化消息
        baidu.on(this._channel, 'load', baidu.fn.bind(function() {this.send('init');}, this));
        //设置超时时间，默认为30秒
        timeout = parseInt(options.timeout) || 30000;
        this._timer = setTimeout(baidu.fn.bind(function() {
            this.dispatchEvent(this._createEvent('error', 'Tiemout.'));
        }, this), timeout);
    } else if (!isParent) {
        //子页面初始化过程
        this.targetDomain = null;
        this.source = window.parent;
        //子页面允许与之通信的父页面domain列表
        this.allowDomains = options.allowDomains || ['*'];
    } else {
        //初始化失败，派发错误消息
        this.dispatchEvent(this._createEvent('error', 'need url.'));
    }

    var handler = baidu.fn.bind('_onMessage', this);

    if (this._canUsePostMessage) {
        baidu.on(window, 'message', handler);
    } else {
        try {
            //IE6-7通过opener对象挂载父子页面互调方法进行通信，这里不排除身份伪造漏洞，使用时请注意，目前没有很好的方法fix
            var win = isParent ? this.source : window,
                opener = win.opener || {},
                handlerNames = ['parentReceiveHandler', 'childReceiveHandler'],
                receiveHandlerName = handlerNames[isParent ? 0 : 1],
                sendHandlerName = handlerNames[isParent ? 1 : 0];
            opener.xpc = opener.xpc || {};
            opener.xpc[receiveHandlerName] = handler;
            this._sendHandlerName = sendHandlerName;
            this._xpc = opener.xpc;
            win.opener = opener;
        } catch (e) {
            this.dispatchEvent(this._createEvent('error', e.message));
        }
    }
}).extend(
/**@lends baidu.data.XPC.prototype*/
{
    //创建iframe，并返回DOM引用
    _createIframe: function(url) {
        var ifrm = document.createElement('IFRAME');
        //firefox下，动态创建的iframe会从缓存中读取页面，通过将空白页指定给iframe的src属性来修正该问题
        ifrm.src = 'about:blank';
        ifrm.frameBorder = 0;
        baidu.dom.setStyles(ifrm, {
            position: 'absolute',
            left: '-10000px',
            top: '-10000px',
            width: '10px',
            height: '10px'
        });
        document.body.appendChild(ifrm);
        ifrm.src = url;
        return ifrm;
    },
    _createEvent: function(type, data) {
        return {
            type: type,
            data: data
        };
    },
    _checkDomain: function(domain) {
        if (this._isParent) {
            return domain === this.targetDomain;
        } else {
            var arr = this.allowDomains,
                len = arr.length;
            while (len--) {
                var tmp = arr[len];
                if (tmp === '*' || tmp === domain) {
                    return true;
                }
            }
            return false;
        }
    },
    //根据url获取domain信息
    _getDomainByUrl: function(url) {
        var a = document.createElement('A');
        a.href = url;
        //IE8将www.a.com:80和www.a.com认为是不同domain
        return a.protocol + '\/\/' + a.hostname + ((parseInt(a.port) || 80) === 80 ? '' : ':' + a.port);
    },
    _onMessage: function(evt) {
        evt = evt || window.event;
        if (this._checkDomain(evt.origin)) {
            this.source = evt.source;
            this.targetDomain = evt.origin;
            if (this.ready) {
                this.dispatchEvent(this._createEvent('message', evt.data));
            } else {
                //初始化进行一次握手
                if (this._isParent) {
                    //清除超时计时器
                    clearTimeout(this._timer);
                    delete this._timer;
                } else {
                    this.send('init');
                }
                //派发初始化事件
                this.ready = true;
                this.dispatchEvent(this._createEvent('ready'));
            }
        }
    },
    /**
     * 发送消息方法。
     * @function
     * @param {string} msg 要发送的消息.
     */
    send: function(msg) {
        if (this._canUsePostMessage) {
            this.source.postMessage(msg, this.targetDomain);
        } else {
            var e = {
                type: 'message',
                data: msg,
                origin: this.currentDomain,
                source: window
            };
            this._xpc[this._sendHandlerName](e);
        }
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */


/**
 * 使用flash资源封装的一些功能
 * @namespace baidu.flash
 */
baidu.flash = baidu.flash || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */












baidu.flash._Base = (function(){
   
    var prefix = 'bd__flash__';

    /**
     * 创建一个随机的字符串
     * @private
     * @return {String}
     */
    function _createString(){
        return  prefix + Math.floor(Math.random() * 2147483648).toString(36);
    };
   
    /**
     * 检查flash状态
     * @private
     * @param {Object} target flash对象
     * @return {Boolean}
     */
    function _checkReady(target){
        if(typeof target !== 'undefined' && typeof target.flashInit !== 'undefined' && target.flashInit()){
            return true;
        }else{
            return false;
        }
    };

    /**
     * 调用之前进行压栈的函数
     * @private
     * @param {Array} callQueue 调用队列
     * @param {Object} target flash对象
     * @return {Null}
     */
    function _callFn(callQueue, target){
        var result = null;
        
        callQueue = callQueue.reverse();
        baidu.each(callQueue, function(item){
            result = target.call(item.fnName, item.params);
            item.callBack(result);
        });
    };

    /**
     * 为传入的匿名函数创建函数名
     * @private
     * @param {String|Function} fun 传入的匿名函数或者函数名
     * @return {String}
     */
    function _createFunName(fun){
        var name = '';

        if(baidu.lang.isFunction(fun)){
            name = _createString();
            window[name] = function(){
                fun.apply(window, arguments);
            };

            return name;
        }else if(baidu.lang.isString){
            return fun;
        }
    };

    /**
     * 绘制flash
     * @private
     * @param {Object} options 创建参数
     * @return {Object} 
     */
    function _render(options){
        if(!options.id){
            options.id = _createString();
        }
        
        var container = options.container || '';
        delete(options.container);
        
        baidu.swf.create(options, container);
        
        return baidu.swf.getMovie(options.id);
    };

    return function(options, callBack){
        var me = this,
            autoRender = (typeof options.autoRender !== 'undefined' ? options.autoRender : true),
            createOptions = options.createOptions || {},
            target = null,
            isReady = false,
            callQueue = [],
            timeHandle = null,
            callBack = callBack || [];

        /**
         * 将flash文件绘制到页面上
         * @public
         * @return {Null}
         */
        me.render = function(){
            target = _render(createOptions);
            
            if(callBack.length > 0){
                baidu.each(callBack, function(funName, index){
                    callBack[index] = _createFunName(options[funName] || new Function());
                });    
            }
            me.call('setJSFuncName', [callBack]);
        };

        /**
         * 返回flash状态
         * @return {Boolean}
         */
        me.isReady = function(){
            return isReady;
        };

        /**
         * 调用flash接口的统一入口
         * @param {String} fnName 调用的函数名
         * @param {Array} params 传入的参数组成的数组,若不许要参数，需传入空数组
         * @param {Function} [callBack] 异步调用后将返回值作为参数的调用回调函数，如无返回值，可以不传入此参数
         * @return {Null}
        */
        me.call = function(fnName, params, callBack){
            if(!fnName) return;
            callBack = callBack || new Function();
    
            var result = null;
    
            if(isReady){
                result = target.call(fnName, params);
                callBack(result);
            }else{
                callQueue.push({
                    fnName: fnName,
                    params: params,
                    callBack: callBack
                });
    
                (!timeHandle) && (timeHandle = setInterval(_check, 200));
            }
        };
    
        /**
         * 为传入的匿名函数创建函数名
         * @public
         * @param {String|Function} fun 传入的匿名函数或者函数名
         * @return {String}
         */
        me.createFunName = function(fun){
            return _createFunName(fun);    
        };

        /**
         * 检查flash是否ready， 并进行调用
         * @private
         * @return {Null}
         */
        function _check(){
            if(_checkReady(target)){
                clearInterval(timeHandle);
                timeHandle = null;
                _call();

                isReady = true;
            }               
        };

        /**
         * 调用之前进行压栈的函数
         * @private
         * @return {Null}
         */
        function _call(){
            _callFn(callQueue, target);
            callQueue = [];
        }

        autoRender && me.render(); 
    };
})();
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */







/**
 * 创建flash based avatarMaker
 * @class
 * @grammar baidu.flash.avatarMaker(options)
 * @param {Object} createOptions 创建flash时需要的参数，请参照baidu.swf.create文档
 * @config {Object} vars 创建avatarMaker时所需要的参数
 * @config {String} [vars.locale] 地区,现在支持vi、th、ar三种，分别是越南语、泰语和阿拉伯语，当使用阿拉伯语时，界面会变成rtl形式,默认为[zh-cn]
 * @config {String} [vars.bigFileName] 80*80图片文件数据字段名，默认为'bigFile'
 * @config {String} [vars.middleFileName] 60*60图片文件数据字段名，默认为'middleFile'
 * @config {String} [vars.smallFileName] 60*60图片文件数据字段名，默认为’smallFile‘
 * @config {Number} [vars.imageQuality] 图片的压缩质量0-100， 默认为 80
 * @config {String} uploadURL 上传图片到的url地址
 * @config {Function|String} tipHandler js提示函数，当flash发生异常，调用此函数显示出错信息。该函数接收一个String类型的参数，为需要显示的文字 
 * @config {Function|String} uploadCallBack 上传之后的回调函数
 */
baidu.flash.avatarMaker = baidu.flash.avatarMaker || function(options){
    var me = this,
        options = options || {},
        _uploadURL = options.uploadURL,
        _flash = new baidu.flash._Base(options, [
                'uploadCallBack',
                'tipHandler'
            ]);
    /**
     * 开始上传头像
     * @public
     * @param {String} [uploadURL] 上传路径
     * @return {Null}
     */
    me.upload = function(uploadURL){
        _flash.call('upload', [uploadURL || _uploadURL]);
    };
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */










/**
 * 创建flash based fileUploader
 * @class
 * @grammar baidu.flash.fileUploader(options)
 * @param {Object} options
 * @config {Object} createOptions 创建flash时需要的参数，请参照baidu.swf.create文档
 * @config {String} createOptions.width
 * @config {String} createOptions.height
 * @config {Number} maxNum 最大可选文件数
 * @config {Function|String} selectFile
 * @config {Function|String} exceedMaxSize
 * @config {Function|String} deleteFile
 * @config {Function|String} uploadStart
 * @config {Function|String} uploadComplete
 * @config {Function|String} uploadError
 * @config {Function|String} uploadProgress
 */
baidu.flash.fileUploader = baidu.flash.fileUploader || function(options){
    var me = this,
        options = options || {};
    
    options.createOptions = baidu.extend({
        wmod: 'transparent'
    },options.createOptions || {});
    
    var _flash = new baidu.flash._Base(options, [
        'selectFile',
        'exceedMaxSize',
        'deleteFile',
        'uploadStart',
        'uploadComplete',
        'uploadError', 
        'uploadProgress'
    ]);

    _flash.call('setMaxNum', options.maxNum ? [options.maxNum] : [1]);

    /**
     * 设置当鼠标移动到flash上时，是否变成手型
     * @public
     * @param {Boolean} isCursor
     * @return {Null}
     */
    me.setHandCursor = function(isCursor){
        _flash.call('setHandCursor', [isCursor || false]);
    };

    /**
     * 设置鼠标相应函数名
     * @param {String|Function} fun
     */
    me.setMSFunName = function(fun){
        _flash.call('setMSFunName',[_flash.createFunName(fun)]);
    }; 

    /**
     * 执行上传操作
     * @param {String} url 上传的url
     * @param {String} fieldName 上传的表单字段名
     * @param {Object} postData 键值对，上传的POST数据
     * @param {Number|Array|null|-1} [index]上传的文件序列
     *                            Int值上传该文件
     *                            Array一次串行上传该序列文件
     *                            -1/null上传所有文件
     * @return {Null}
     */
    me.upload = function(url, fieldName, postData, index){

        if(typeof url !== 'string' || typeof fieldName !== 'string') return;
        if(typeof index === 'undefined') index = -1;

        _flash.call('upload', [url, fieldName, postData, index]);
    };

    /**
     * 取消上传操作
     * @public
     * @param {Number|-1} index
     */
    me.cancel = function(index){
        if(typeof index === 'undefined') index = -1;
        _flash.call('cancel', [index]);
    };

    /**
     * 删除文件
     * @public
     * @param {Number|Array} [index] 要删除的index，不传则全部删除
     * @param {Function} callBack
     * @param 
     * */
    me.deleteFile = function(index, callBack){

        var callBackAll = function(list){
                callBack && callBack(list);
            };

        if(typeof index === 'undefined'){
            _flash.call('deleteFilesAll', [], callBackAll);
            return;
        };
        
        if(typeof index === 'Number') index = [index];
        index.sort(function(a,b){
            return b-a;
        });
        baidu.each(index, function(item){
            _flash.call('deleteFileBy', item, callBackAll);
        });
    };

    /**
     * 添加文件类型，支持macType
     * @public
     * @param {Object|Array[Object]} type {description:String, extention:String}
     * @return {Null};
     */
    me.addFileType = function(type){
        var type = type || [[]];
        
        if(type instanceof Array) type = [type];
        else type = [[type]];
        _flash.call('addFileTypes', type);
    };
    
    /**
     * 设置文件类型，支持macType
     * @public
     * @param {Object|Array[Object]} type {description:String, extention:String}
     * @return {Null};
     */
    me.setFileType = function(type){
        var type = type || [[]];
        
        if(type instanceof Array) type = [type];
        else type = [[type]];
        _flash.call('setFileTypes', type);
    };

    /**
     * 设置可选文件的数量限制
     * @public
     * @param {Number} num
     * @return {Null}
     */
    me.setMaxNum = function(num){
        _flash.call('setMaxNum', [num]);
    };

    /**
     * 设置可选文件大小限制，以兆M为单位
     * @public
     * @param {Number} num,0为无限制
     * @return {Null}
     */
    me.setMaxSize = function(num){
        _flash.call('setMaxSize', [num]);
    };

    /**
     * @public
     */
    me.getFileAll = function(callBack){
        _flash.call('getFilesAll', [], callBack);
    };

    /**
     * @public
     * @param {Number} index
     * @param {Function} [callBack]
     */
    me.getFileByIndex = function(index, callBack){
        _flash.call('getFileByIndex', [], callBack);
    };

    /**
     * @public
     * @param {Number} index
     * @param {function} [callBack]
     */
    me.getStatusByIndex = function(index, callBack){
        _flash.call('getStatusByIndex', [], callBack);
    };
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */






/**
 * 创建flash based imageUploader
 * @class
 * @grammar baidu.flash.imageUploader(options)
 * @param {Object} createOptions 创建flash时需要的参数，请参照baidu.swf.create文档
 * @config {Object} vars 创建imageUploader时所需要的参数
 * @config {Number} vars.gridWidth 每一个预览图片所占的宽度，应该为flash寛的整除
 * @config {Number} vars.gridHeight 每一个预览图片所占的高度，应该为flash高的整除
 * @config {Number} vars.picWidth 单张预览图片的宽度
 * @config {Number} vars.picHeight 单张预览图片的高度
 * @config {String} vars.uploadDataFieldName POST请求中图片数据的key,默认值'picdata'
 * @config {String} vars.picDescFieldName POST请求中图片描述的key,默认值'picDesc'
 * @config {Number} vars.maxSize 文件的最大体积,单位'MB'
 * @config {Number} vars.compressSize 上传前如果图片体积超过该值，会先压缩
 * @config {Number} vars.maxNum:32 最大上传多少个文件
 * @config {Number} vars.compressLength 能接受的最大边长，超过该值会等比压缩
 * @config {String} vars.url 上传的url地址
 * @config {Number} vars.mode mode == 0时，是使用滚动条，mode == 1时，拉伸flash, 默认值为0
 * @see baidu.swf.createHTML
 * @param {String} backgroundUrl 背景图片路径
 * @param {String} listBacgroundkUrl 布局控件背景
 * @param {String} buttonUrl 按钮图片不背景
 * @param {String|Function} selectFileCallback 选择文件的回调
 * @param {String|Function} exceedFileCallback文件超出限制的最大体积时的回调
 * @param {String|Function} deleteFileCallback 删除文件的回调
 * @param {String|Function} startUploadCallback 开始上传某个文件时的回调
 * @param {String|Function} uploadCompleteCallback 某个文件上传完成的回调
 * @param {String|Function} uploadErrorCallback 某个文件上传失败的回调
 * @param {String|Function} allCompleteCallback 全部上传完成时的回调
 * @param {String|Function} changeFlashHeight 改变Flash的高度，mode==1的时候才有用
 */ 
baidu.flash.imageUploader = baidu.flash.imageUploader || function(options){
   
    var me = this,
        options = options || {},
        _flash = new baidu.flash._Base(options, [
            'selectFileCallback', 
            'exceedFileCallback', 
            'deleteFileCallback', 
            'startUploadCallback',
            'uploadCompleteCallback',
            'uploadErrorCallback',
            'allCompleteCallback',
            'changeFlashHeight'
        ]);
    /**
     * 开始或回复上传图片
     * @public
     * @return {Null}
     */
    me.upload = function(){
        _flash.call('upload');
    };

    /**
     * 暂停上传图片
     * @public
     * @return {Null}
     */
    me.pause = function(){
        _flash.call('pause');
    };
};
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */








/**
 * 验证规则组件，提供各种基础验证，默认的验证方式有以下几种：required(必填)，remote(Ajax验证)，email(电子邮件验证)，number(数字验证)，maxlength(最大长度验证)，minlength(最小长度验证)，rangelength(长度范围验证)，equal(等于验证)，telephone(电话号码)
 * @name baidu.form.ValidRule
 * @class
 * @grammar new baidu.form.ValidRule()
 * @return {baidu.form.ValidRule} validator对象
 */
baidu.form.ValidRule = baidu.form.ValidRule || baidu.lang.createClass(function(){
    var me = this;
        me._rules = {
            required: function(val){//必填 true:表示有值, false:表示空或无值
                return !!(val && !/^(?:\s|\u3000)+$/.test(val));
            },
            remote: function(xhr, val){
                return !!(val && val.toLowerCase() == 'true');
            },
            email: /^[\w!#\$%'\*\+\-\/=\?\^`{}\|~]+([.][\w!#\$%'\*\+\-\/=\?\^`{}\|~]+)*@[-a-z0-9]{1,20}[.][a-z0-9]{1,10}([.][a-z]{2})?$/i,
            number: /^(?:[1-9]\d+|\d)(?:\.\d+)?$/,
            maxlength: function(val, opt){
                return val.length <= opt;
            },
            minlength: function(val, opt){
                return val.length >= opt;
            },
            rangelength: function(val, opt){
                return val.length >= opt[0] && val.length <= opt[1];
            },
            equal: function(val, opt){
                return val === (baidu.lang.isFunction(opt) ? opt() : opt);
            },
            telephone: /^(((?:[\+0]\d{1,3}-[1-9]\d{1,2})|\d{3,4})-)?\d{5,8}$/
        };
}).extend(
/**
 *  @lends baidu.form.ValidRule.prototype
 */
{
    /**
     * 根据规则名称取得对应的规则，参数可选，没有参数则返回所有规则的对象
     * @param {String} name 已知的规则名称
     * @private
     */
    _getRule: function(name){
        var me = this;
        return baidu.lang.isString(name) ? me._rules[name] : me._rules;
    },
    
    /**
     * 用一个验证方法对一个已经存在的值进行验证，并将结果返回到回调中。说明：如果是一个remote验证，则是一个ajax验证，请让服务器返回true或是false来表示验证结果
     * @param {String} name 验证方法的名称，如：required,email等
     * @param {String} val 需要被验证的字符串值，如果是remote该参数可以忽视
     * @param {Function} callback 验证结束的回调，第一参数为验证结果
     * @param {Object} options 表示验证需要的参数，如当验证类型是maxlength时，需要options是{param:10}
     */
    match: function(name, val, callback, options){
        var me = this,
            rule = me._getRule(name),
            param = options && options.param;
        if('remote' == name.toLowerCase()){
            baidu.lang.isString(param) && (param = {url: param});
            param = baidu.object.extend({}, param);
            param.data && baidu.lang.isFunction(param.data)
                && (param.data = param.data(val));
            param.onsuccess = param.onfailure = function(xhr, responseText){
                callback(rule(xhr, responseText));
            }
            baidu.ajax.request(param.url, param);
        }else{
            callback(baidu.lang.isFunction(rule) ? rule(val, param)
                : rule.test(val));
        }
    },
    
    /**
     * 增加一条验证规则
     * @param {String} name 验证规则的名称
     * @param {Function|RegExp} handler 执行验证的函数或是正则表达式，如果是函数，需要返回一个boolean
     */
    addRule: function(name, handler){
        this._rules[name] = handler;
    }
});
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */

















/**
 *
 *
 * 拆分方法，将baidu.data.form中方法拆分到baidu.validator.Validator中
 * 当前文件保留，但使用上述类中验证方法进行验证
 * 当前文件中方法只进行对form表单的事件绑定，message显示等操作
 *
 *
 *
 * */






/**
 * 表单验证组件
 * @name baidu.form.Validator
 * @class
 * @grammar new baidu.form.Validator(form, fieldRule, options)
 * @param {HTMLElement|String} form 一个表单对象的引用或是该id的字符串标识
 * @param {Object} fieldRule 对验证规则的配置，一个验证域需要的配置包括验证域名称，验证规则，提示信息(可选，需要Validator$message支持)，提示信息存放容器(可选，需要Validator$message支持)，验证触发事件(可选)，一个完整的配置大致如：fieldName: {rule: {required: {param: true, message: {success: 'success msg', failure: 'failure msg'}}, maxlength: {param: 50, message: 'failure msg'}, email: true}, messageContainer: 'myMsgElement', eventName: 'keyup,blur'}
 * @param {Object} options 参数描述
 * @config {String} validateEvent 描述全局的各个验证域的触发验证事件，如'blur,click'，默认是blur
 * @config {Boolean} validateOnSubmit 描述是否当提交表单时做验证，默认是true.
 * @config {Function} onvalidatefield 验证单个验证域结束时的触发事件，function(event){}，event.field返回当次验证域的名称，event.resultList返回验证失败的项目数组(当验证成功时该数组长度为0)，各个项是json数据，格式如：{type: 类型, field: 被验证域名称}.
 * @config {Function} onvalidate 验证全部验证域结束时的触发事件，function(event){}，event.resultList返回验证失败的项目数组(当验证成功时该数组长度为0)，各个项是json数据，格式如：{type: 类型, field: 被验证域名称}.
 * @return {baidu.form.Validator} validator对象
 */
baidu.form.Validator = baidu.lang.createClass(function(form, fieldRule, options){
    var me = this,
        fn = baidu.form.Validator,
        count = fn._addons.length,
        i = 0,
        eventNameList;
    me._form = baidu.dom.g(form);
    me._fieldRule = fieldRule;
    me._validRule = new baidu.form.ValidRule();
    baidu.object.extend(me, options);
    eventNameList = me.validateEvent.split(',');
    //添加事件
    function addEvent(eventName, key){
        var entry = {
            element: key ? me._form.elements[key] : me._form,
            eventName: eventName,
            handler: baidu.fn.bind('_onEventHandler', me, key)
        };
        baidu.event.on(entry.element, entry.eventName, entry.handler);
        me.addEventListener('ondispose', function(){
            baidu.event.un(entry.element, entry.eventName, entry.handler);
        });
    }
    baidu.object.each(me._fieldRule, function(value, key){
        baidu.array.each(baidu.lang.isString(value.eventName) ? value.eventName.split(',')
            : eventNameList,
            function(item){
                addEvent(item, key);
            });
    });
    me.validateOnSubmit && addEvent('onsubmit');
    //插件机制
    for(; i < count; i++){
        fn._addons[i](me);
    }
}).extend(
/**
 *  @lends baidu.form.Validator.prototype
 */
{
    validateEvent: 'blur',
    validateOnSubmit: true,
    /**
     * 所有注册验证事件的侦听器
     * @param {String} key 单个验证域的名称
     * @param {Event} evt 浏览器事件对象
     * @private
     */
    _onEventHandler: function(key, evt){
        var me = this;
        if(!key){//如果是submit
            baidu.event.preventDefault(evt);
            me.validate(function(val, list){
                val && me._form.submit();
            });
            return;
        }
        me.validateField(key);
    },
    
    /**
     * 添加一条规则到当前的验证器中
     * @param {String} name 规则名称
     * @param {Functioin|RegExp} handler 验证函数或是验证正则表达式，当是函数时需要在实现在显示返回一个boolean值
     * @param {Object|String} message 验证结果的提示信息，如：{success: 'success msg', failure: 'failure msg'}，当只有传入字符串时表示只有failure的提示
     */
    addRule: function(name, handler, message){
        var me = this;
        me._validRule.addRule(name, handler);
        me.dispatchEvent('onaddrule', {name: name, handler: handler, message: message});
    },
    
    /**
     * 对所有表单进行验证，并把验证结果返回在callback函数中
     * @param {Function} callback 验证结束后的回调函数，第一参数表示验证结果，第二参数表示验证的失败项数组，各个项的json格式如：{type: 类型, field: 被验证域名称}
     */
    validate: function(callback){
        var me = this,
            keyList = baidu.object.keys(me._fieldRule),
            resultList = [],
            count = 0;
        baidu.array.each(keyList, function(item){
            me.validateField(item, function(val, list){
                resultList = resultList.concat(list);
                if(count++ >= keyList.length - 1){
                    baidu.lang.isFunction(callback)
                        && callback(resultList.length <= 0, resultList);
                    me.dispatchEvent('onvalidate', {resultList: resultList});
                }
            });
       });
    },
    
    /**
     * 对单个验证域进行验证，结果返回在callback回调函数中
     * @param {String} name 单个验证域的名称
     * @param {Function} callback 验证结束后的回调函数，第一参数表示验证结果，第二参数表示验证的失败项数组，各个项的json格式如：{type: 类型, field: 被验证域名称}
     */
    validateField: function(name, callback){
        var me = this, entry,
            rules = me._fieldRule[name].rule,//一定需要有rule
            value = me._form.elements[name].value,
            keyList = baidu.array.filter(baidu.object.keys(rules),
                function(item){//过滤一些不需要的验证
                    entry = rules[item];
                    return (value || item == 'required')
                        && (entry.hasOwnProperty('param') ? entry.param : entry) !== false;
               }),
            resultList = [],
            count = 0;
        function finish(){//当所有都验证完了以后
            if(count++ >= keyList.length - 1){
                me.dispatchEvent('validatefield', {field: name, resultList: resultList});
                baidu.lang.isFunction(callback)
                    && callback(resultList.length <= 0, resultList);
            }
        }
        keyList.length == 0 && finish();//当keyList是空数组的时候表示没有需要验证的，则先提交
        baidu.array.each(keyList, function(item){
            entry = rules[item];
            me._validRule.match(item, value,
                function(val){
                    !val && resultList.push({type: item, field: name, result: val});
                    finish();
                },
                {param: entry.hasOwnProperty('param') ? entry.param : entry});
        });
    },
    
    /**
     * 析构函数
     */
    dispose: function(){
        var me = this;
        me.dispatchEvent('ondispose');
        baidu.lang.Class.prototype.dispose.call(me);
    }
});
//构造函数插件器
baidu.form.Validator._addons = [];
/**
 * @private
 */
baidu.form.Validator.register = function(fn){
    typeof fn == 'function'
        && baidu.form.Validator._addons.push(fn);
}
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */











/**
 * 为表单验证提供信息提示功能，有关信息提示的配置请参考Validator的构造函数参数说明.
 * @param {Object} optioins 参数
 * @config {Boolean} showMessage 是否需要显示提示信息，默认是true
 */
baidu.form.Validator.register(function(me){
    if(!me.showMessage){return;}
    me._defaultId = baidu.lang.guid();
    me._defaultMessage = {
        required: 'This field is required.',
        remote: 'Please fix this field.',
        email: 'Please enter a valid email address.',
        number: 'Please enter a valid number.',
        maxlength: 'Please enter no more than #{param} characters.',
        minlength: 'Please enter at least #{param} characters.',
        rangelength: 'Please enter a value between #{param[0]} and #{param[1]} characters long.',
        equal: 'Please enter the same value again.',
        telephone: 'Please enter a valid telephone number.'
    };
    me.addEventListener('onaddrule', function(evt){
        me._defaultMessage[evt.name] = evt.message;
    });
    me.addEventListener('onvalidatefield', function(evt){
        var element = me._getContentElement(evt.field),
            val = evt.resultList.length <= 0,
            key = val ? baidu.object.keys(me._fieldRule[evt.field].rule).pop()
                : evt.resultList[0].type,
            fieldRule = me._fieldRule[evt.field].rule[key],
            msg = fieldRule.message;
        !msg && (msg = me._defaultMessage[key]);
        msg = val ? (msg.success || '') : (msg.failure || msg);
        baidu.dom.addClass(element, 'tangram-' + me.uiType + '-' + (val ? 'success' : 'failure'));
        baidu.dom.addClass(element, 'tangram-' + me.uiType + '-' + evt.field + '-' + (val ? 'success' : 'failure'));
        baidu.dom.removeClass(element, 'tangram-' + me.uiType + '-' + (val ? 'failure' : 'success'));
        baidu.dom.removeClass(element, 'tangram-' + me.uiType + '-' + evt.field + '-' + (val ? 'failure' : 'success'));
        element.innerHTML = baidu.string.format(msg, {//这里扩展性不是很好啊
            param: fieldRule.param,
            'param[0]': baidu.lang.isArray(fieldRule.param) ? fieldRule.param[0] : '',
            'param[1]': baidu.lang.isArray(fieldRule.param) ? fieldRule.param[1] : ''
        });
    });
});
baidu.object.extend(baidu.form.Validator.prototype, 
/**
 *  @lends baidu.form.Validator.prototype
 */
{
    showMessage: true,
    uiType: 'validator',
    tplDOM: '<label id="#{id}" class="#{class}"></label>',
    
    /**
     * 取得一个存放信息提示的容器，如果该容器不存在则创建一个容器
     * @param {String} field 验证域的名称
     * @return {HTMLElement} 返回一个DOM容器对象
     * @private
     */
    _getContentElement: function(field){
        var me = this,
            rsid = me._defaultId + '_' + field,
            element = baidu.dom.g(rsid),
            container = baidu.dom.g(me._fieldRule[field].messageContainer);
        if(!element){
            baidu.dom.insertHTML(container || me._form.elements[field],
                container ? 'beforeEnd' : 'afterEnd',
                baidu.string.format(me.tplDOM, {
                    id: rsid,
                    'class': 'tangram-' + me.uiType
                }));
            element = baidu.dom.g(rsid);
        }
        return element;
    },
    
    /**
     * 取得一个验证域对应的信息提示容器，如果该容器不存在返回空值
     * @param {String} field 验证域的name
     * @return {HTMLElement} 存放信息提示的容器
     */
    getMessageContainer: function(field){
        return baidu.dom.g(this._defaultId + '_' + field);
    }
})
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */


/**
 * 提供各种公共的动画功能
 * @namespace baidu.fx
 */
baidu.fx = baidu.fx || {} ;
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.Timeline
 * @create: 2010-01-23
 * @version: 2010-07-13
 */







/**
 * 提供一个按时间进程的时间线类
 *
 * 本类提供两个方法：
 *  cancel()    取消操作
 *  end()       直接结束
 *
 * 使用本类时需要实现五个接口：
 *  initialize()            用于类初始化时的操作
 *  transition(percent)    重新计算时间线进度曲线
 *  finish()                用于类结束时时的操作
 *  render(schedule)        每个脉冲在DOM上的效果展现
 *  restore()               效果被取消时作的恢复操作
 *
 * @config {Number} interval 脉冲间隔时间（毫秒）
 * @config {Number} duration 时间线总时长（毫秒）
 * @config {Number} percent  时间线进度的百分比
 */
 
 
 
/**
 * 提供一个按时间进程的时间线类
 * @class
 * @grammar new baidu.fx.Timeline(options)
 * @param {Object} options 参数
 * @config {Number} interval 脉冲间隔时间（毫秒）
 * @config {Number} duration 时间线总时长（毫秒）
 * @config {Number} percent  时间线进度的百分比
 */
baidu.fx.Timeline = function(options){
    baidu.lang.Class.call(this);

    this.interval = 16;
    this.duration = 500;
    this.dynamic  = true;

    baidu.object.extend(this, options);
};
baidu.lang.inherits(baidu.fx.Timeline, baidu.lang.Class, "baidu.fx.Timeline").extend({
/**
 *  @lends baidu.fx.Timeline.prototype
 */
    /**
     * 启动时间线
     * @return {instance} 类实例
     */
    launch : function(){
        var me = this;
        me.dispatchEvent("onbeforestart");

        /**
        * initialize()接口，当时间线初始化同步进行的操作
        */
        typeof me.initialize =="function" && me.initialize();

        me["\x06btime"] = new Date().getTime();
        me["\x06etime"] = me["\x06btime"] + (me.dynamic ? me.duration : 0);
        me["\x06pulsed"]();

        return me;
    }

    /**
     * 每个时间脉冲所执行的程序
     * @ignore
     * @private
     */
    ,"\x06pulsed" : function(){
        var me = this;
        var now = new Date().getTime();
        // 当前时间线的进度百分比
        me.percent = (now - me["\x06btime"]) / me.duration;
        me.dispatchEvent("onbeforeupdate");

        // 时间线已经走到终点
        if (now >= me["\x06etime"]){
            typeof me.render == "function" && me.render(me.transition(me.percent = 1));

            // [interface run] finish()接口，时间线结束时对应的操作
            typeof me.finish == "function" && me.finish();

            me.dispatchEvent("onafterfinish");
            me.dispose();
            return;
        }

        /**
        * [interface run] render() 用来实现每个脉冲所要实现的效果
        * @param {Number} schedule 时间线的进度
        */
        typeof me.render == "function" && me.render(me.transition(me.percent));
        me.dispatchEvent("onafterupdate");

        me["\x06timer"] = setTimeout(function(){me["\x06pulsed"]()}, me.interval);
    }
    /**
     * 重新计算 schedule，以产生各种适合需求的进度曲线
     * @function
     * @param {Function} percent 
     */
    ,transition: function(percent) {
        return percent;
    }

    /**
     * 撤销当前时间线的操作，并引发 restore() 接口函数的操作
     * @function
     */
    ,cancel : function() {
        this["\x06timer"] && clearTimeout(this["\x06timer"]);
        this["\x06etime"] = this["\x06btime"];

        // [interface run] restore() 当时间线被撤销时的恢复操作
        typeof this.restore == "function" && this.restore();
        this.dispatchEvent("oncancel");

        this.dispose();
    }

    /**
     * 直接将时间线运行到结束点
     */
    ,end : function() {
        this["\x06timer"] && clearTimeout(this["\x06timer"]);
        this["\x06etime"] = this["\x06btime"];
        this["\x06pulsed"]();
    }
});
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.create
 * @version: 2010-01-23
 */




/**
 * 效果基类。
 * @function
 * @grammar baidu.fx.collapse(element, options, fxName)
 * @param     {HTMLElement}           element            添加效果的DOM元素
 * @param     {JSON}                  options            时间线的配置参数对象
 * @config    {Function}              transition         function(schedule){return schedule;},时间线函数
 * @config    {Function}              onbeforestart      function(){},//效果开始前执行的回调函数
 * @config    {Function}              onbeforeupdate     function(){},//每次刷新画面之前会调用的回调函数
 * @config    {Function}              onafterupdate      function(){},//每次刷新画面之后会调用的回调函数
 * @config    {Function}              onafterfinish      function(){},//效果结束后会执行的回调函数
 * @config    {Function}              oncancel           function(){},//效果被撤销时的回调函数
 * @param     {String}                fxName             效果名（可选）
 * @return {baidu.fx.Timeline}  时间线类的一个实例
 */
baidu.fx.create = function(element, options, fxName) {
    var timeline = new baidu.fx.Timeline(options);

    timeline.element = element;
    timeline.__type = fxName || timeline.__type;
    timeline["\x06original"] = {};   // 20100708
    var catt = "baidu_current_effect";

    /**
     * 将实例的guid记录到DOM元素上，以便多个效果叠加时的处理
     */
    timeline.addEventListener("onbeforestart", function(){
        var me = this, guid;
        me.attribName = "att_"+ me.__type.replace(/\W/g, "_");
        guid = me.element.getAttribute(catt);
        me.element.setAttribute(catt, (guid||"") +"|"+ me.guid +"|", 0);

        if (!me.overlapping) {
            (guid = me.element.getAttribute(me.attribName)) 
                && window[baidu.guid]._instances[guid].cancel();

            //在DOM元素上记录当前效果的guid
            me.element.setAttribute(me.attribName, me.guid, 0);
        }
    });

    /**
     * 打扫dom元素上的痕迹，删除元素自定义属性
     */
    timeline["\x06clean"] = function(e) {
    	var me = this, guid;
        if (e = me.element) {
            e.removeAttribute(me.attribName);
            guid = e.getAttribute(catt);
            guid = guid.replace("|"+ me.guid +"|", "");
            if (!guid) e.removeAttribute(catt);
            else e.setAttribute(catt, guid, 0);
        }
    };

    /**
     * 在时间线结束时净化对DOM元素的污染
     */
    timeline.addEventListener("oncancel", function() {
        this["\x06clean"]();
        this["\x06restore"]();
    });

    /**
     * 在时间线结束时净化对DOM元素的污染
     */
    timeline.addEventListener("onafterfinish", function() {
        this["\x06clean"]();
        this.restoreAfterFinish && this["\x06restore"]();
    });

    /**
     * 保存原始的CSS属性值 20100708
     */
    timeline.protect = function(key) {
        this["\x06original"][key] = this.element.style[key];
    };

    /**
     * 时间线结束，恢复那些被改过的CSS属性值
     */
    timeline["\x06restore"] = function() {
        var o = this["\x06original"],
            s = this.element.style,
            v;
        for (var i in o) {
            v = o[i];
            if (typeof v == "undefined") continue;

            s[i] = v;    // 还原初始值

            // [TODO] 假如以下语句将来达不到要求时可以使用 cssText 操作
            if (!v && s.removeAttribute) s.removeAttribute(i);    // IE
            else if (!v && s.removeProperty) s.removeProperty(i); // !IE
        }
    };

    return timeline;
};


/**
 * fx 的所有 【属性、方法、接口、事件】 列表
 *
 * property【七个属性】                 默认值 
 *  element             {HTMLElement}           效果作用的DOM元素
 *  interval            {Number}        16      脉冲间隔时间（毫秒）
 *  duration            {Number}        500     时间线总时长（毫秒）
 *  percent             {Number}                时间线进度的百分比
 *  dynamic             {Boolean}       true    是否渐进式动画还是直接显示结果
 *  overlapping         {Boolean}       false   效果是否允许互相叠加
 *  restoreAfterFinish  {Boolean}       false   效果结束后是否打扫战场
 *
 * method【三个方法】
 *  end()       直接结束
 *  cancel()    取消操作
 *  protect()   保存元素原始的CSS属性值，以便自动 restore 操作
 *
 * event【四个事件】
 *  onbeforestart()
 *  onbeforeupdate()
 *  onafterupdate()
 *  onafterfinish()
 *
 * interface【五个接口】
 *  initialize()            用于类初始化时的操作
 *  transition(percent)     重新计算时间线进度曲线
 *  finish()                用于类结束时时的操作
 *  restore()               效果结束后的恢复操作
 *  render(schedule)        每个脉冲在DOM上的效果展现
 */
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.collapse
 * @version: 2010-01-23
 */






/**
 * 从下向上收拢DOM元素的效果。
 * @function
 * @grammar baidu.fx.collapse(element, options)
 * @param     {string|HTMLElement}    element            元素或者元素的ID
 * @param     {Object}                options            选项。参数的详细说明如下表所示
 * @config    {Number}                duration           500,//效果持续时间，默认值为500ms
 * @config    {Number}                interval           16, //动画帧间隔时间，默认值为16ms
 * @config    {String}                orientation        动画收拢方向，取值：vertical（默认），horizontal
 * @config    {Function}              transition         function(schedule){return schedule;},时间线函数
 * @config    {Function}              onbeforestart      function(){},//效果开始前执行的回调函数
 * @config    {Function}              onbeforeupdate     function(){},//每次刷新画面之前会调用的回调函数
 * @config    {Function}              onafterupdate      function(){},//每次刷新画面之后会调用的回调函数
 * @config    {Function}              onafterfinish      function(){},//效果结束后会执行的回调函数
 * @config    {Function}              oncancel           function(){},//在onafterfinish与oncancel时默认调用
 * @see baidu.fx.expand
 */

baidu.fx.collapse = function(element, options) {
    if (!(element = baidu.dom.g(element))) return null;

    var e = element, 
        value, 
        attr,
        attrHV = {
            "vertical": {
                value: 'height',
                offset: 'offsetHeight',
                stylesValue: ["paddingBottom","paddingTop","borderTopWidth","borderBottomWidth"]
            },
            "horizontal": {
                value: 'width',
                offset: 'offsetWidth',
                stylesValue: ["paddingLeft","paddingRight","borderLeftWidth","borderRightWidth"]
            }
        };

    var fx = baidu.fx.create(e, baidu.object.extend({
        orientation: 'vertical'
        
        //[Implement Interface] initialize
        ,initialize : function() {
            attr = attrHV[this.orientation];
            this.protect(attr.value);
            this.protect("overflow");
            this.restoreAfterFinish = true;
            value = e[attr.offset];
            e.style.overflow = "hidden";
        }

        //[Implement Interface] transition
        ,transition : function(percent) {return Math.pow(1 - percent, 2);}

        //[Implement Interface] render
        ,render : function(schedule) {
            e.style[attr.value] = Math.floor(schedule * value) +"px";
        }

        //[Implement Interface] finish
        ,finish : function(){baidu.dom.hide(e);}
    }, options || {}), "baidu.fx.expand_collapse");

    return fx.launch();
};

// [TODO] 20100509 在元素绝对定位时，收缩到最后时会有一次闪烁
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @create: 2010-07-16
 * @namespace: baidu.fx.current
 */




/**
 * 获取DOM元素正在运行的效果实例列表
 * @function
 * @grammar baidu.fx.current(element)
 * @param     {string|HTMLElement}     element     被查询的DOM元素或元素id
 * @see baidu.fx.current
 * @returns {Array} 效果对象
 */
baidu.fx.current = function(element) {
    if (!(element = baidu.dom.g(element))) return null;
    var a, guids, reg = /\|([^\|]+)\|/g;

    // 可以向<html>追溯
    do {if (guids = element.getAttribute("baidu_current_effect")) break;}
    while ((element = element.parentNode) && element.nodeType == 1);

    if (!guids) return null;

    if ((a = guids.match(reg))) {
        //fix
        //在firefox中使用g模式，会出现ture与false交替出现的问题
        reg = /\|([^\|]+)\|/;
        
        for (var i=0; i<a.length; i++) {
            reg.test(a[i]);
            a[i] = window[baidu.guid]._instances[RegExp["\x241"]];
        }
    }
    return a;
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.expand
 * @version: 2010-01-23
 */










 
/**
 * 自上而下展开DOM元素的效果。
 * @function
 * @grammar baidu.fx.expand(element, options)
 * @param     {string|HTMLElement}    element            元素或者元素的ID
 * @param     {Object}                options            选项。参数的详细说明如下表所示
 * @config    {Number}                duration           500,//效果持续时间，默认值为500ms
 * @config    {Number}                interval           16, //动画帧间隔时间，默认值为16ms
 * @config    {String}                orientation        动画展开方向，取值：vertical（默认），horizontal
 * @config    {Function}              transition         function(schedule){return schedule;},时间线函数
 * @config    {Function}              onbeforestart      function(){},//效果开始前执行的回调函数
 * @config    {Function}              onbeforeupdate     function(){},//每次刷新画面之前会调用的回调函数
 * @config    {Function}              onafterupdate      function(){},//每次刷新画面之后会调用的回调函数
 * @config    {Function}              onafterfinish      function(){},//效果结束后会执行的回调函数
 * @config    {Function}              oncancel           function(){},//效果被撤销时的回调函数
 * @see baidu.fx.collapse
 */

baidu.fx.expand = function(element, options) {
    if (!(element = baidu.dom.g(element))) return null;

    var e = element, 
        value, 
        attr,
        attrHV = {
            "vertical": {
                value: 'height',
                offset: 'offsetHeight',
                stylesValue: ["paddingBottom","paddingTop","borderTopWidth","borderBottomWidth"]
            },
            "horizontal": {
                value: 'width',
                offset: 'offsetWidth',
                stylesValue: ["paddingLeft","paddingRight","borderLeftWidth","borderRightWidth"]
            }
        };

    var fx = baidu.fx.create(e, baidu.object.extend({
        orientation: 'vertical'
        
        //[Implement Interface] initialize
        ,initialize : function() {
            attr = attrHV[this.orientation];
            baidu.dom.show(e);
            this.protect(attr.value);
            this.protect("overflow");
            this.restoreAfterFinish = true;
            value = e[attr.offset];
            
            function getStyleNum(d,style){
                var result = parseInt(baidu.getStyle(d,style));
                result = isNaN(result) ? 0 : result;
                result = baidu.lang.isNumber(result) ? result : 0;
                return result;
            }
            
            baidu.each(attr.stylesValue, function(item){
                value -= getStyleNum(e,item);
            });
            e.style.overflow = "hidden";
            e.style[attr.value] = "1px";
        }

        //[Implement Interface] transition
        ,transition : function(percent) {return Math.sqrt(percent);}

        //[Implement Interface] render
        ,render : function(schedule) {
            e.style[attr.value] = Math.floor(schedule * value) +"px";
        }
    }, options || {}), "baidu.fx.expand_collapse");

    return fx.launch();
};
/*
 * JavaScript framework: mz
 * Copyright (c) 2010 meizz, http://www.meizz.com/
 *
 * http://www.meizz.com/mz/license/ MIT-style license
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software
 */








 
/**
 * 控制元素的透明度 渐变
 * @function
 * @grammar baidu.fx.opacity(element, options)
 * @param       {String|Object}           element               元素或者元素的ID
 * @param       {Object}                  options               选项。参数的详细说明如下表所示
 * @config      {Number}                  from                  0,//效果起始值。介于0到1之间的一个数字，默认为0。
 * @config      {Number}                  to                    1,//效果结束值。介于0到1之间的一个数字，默认为1。
 * @config      {Number}                  duration              500,//效果持续时间，默认值为500ms。
 * @config      {Number}                  interval              16, //动画帧间隔时间，默认值为16ms。
 * @config      {Function}                transition            function(schedule){return schedule;},时间线函数
 * @config      {Function}                onbeforestart         function(){},//效果开始前执行的回调函数
 * @config      {Function}                onbeforeupdate        function(){},//每次刷新画面之前会调用的回调函数
 * @config      {Function}                onafterupdate         function(){},//每次刷新画面之后会调用的回调函数
 * @config      {Function}                onafterfinish         function(){},//效果结束后会执行的回调函数
 * @config      {Function}                oncancel              function(){},//效果被撤销时的回调函数
 */

baidu.fx.opacity = function(element, options) {
    if (!(element = baidu.dom.g(element))) return null;

    options = baidu.object.extend({from: 0,to: 1}, options||{});

    var e = element;

    var fx = baidu.fx.create(e, baidu.object.extend({
        //[Implement Interface] initialize
        initialize : function() {
            baidu.dom.show(element);

            if (baidu.browser.ie < 9) {
                this.protect("filter");
            } else {
                this.protect("opacity");
                this.protect("KHTMLOpacity");
            }

            this.distance = this.to - this.from;
        }

        //[Implement Interface] render
        ,render : function(schedule) {
            var n = this.distance * schedule + this.from;

            if(!(baidu.browser.ie < 9)) {
                e.style.opacity = n;
                e.style.KHTMLOpacity = n;
            } else {
                e.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity:"+
                    Math.floor(n * 100) +")";
            }
        }
    }, options), "baidu.fx.opacity");

    return fx.launch();
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.fadeIn
 * @version: 2010-01-23
 */




 
/**
 * 渐现渐变效果。注意，如果元素的visibility属性如果为hidden，效果将表现不出来。
 * @function
 * @grammar baidu.fx.fadeIn(element, options)
 * @param      {string|HTMLElement}     element            元素或者元素的ID
 * @param      {Object}                 options            选项。参数的详细说明如下表所示
 * @config     {Number}                 duration           500,//效果持续时间，默认值为500ms
 * @config     {Number}                 interval           16, //动画帧间隔时间，默认值为16ms
 * @config     {Function}               transition         function(schedule){return schedule;},时间线函数
 * @config     {Function}               onbeforestart      function(){},//效果开始前执行的回调函数
 * @config     {Function}               onbeforeupdate     function(){},//每次刷新画面之前会调用的回调函数
 * @config     {Function}               onafterupdate      function(){},//每次刷新画面之后会调用的回调函数
 * @config     {Function}               onafterfinish      function(){},//效果结束后会执行的回调函数
 * @config     {Function}               oncancel           function(){},//效果被撤销时的回调函数
 * @see baidu.fx.fadeOut
 */

baidu.fx.fadeIn = function(element, options) {
    if (!(element = baidu.dom.g(element))) return null;

    var fx = baidu.fx.opacity(element,
        baidu.object.extend({from:0, to:1, restoreAfterFinish:true}, options||{})
    );
    fx.__type = "baidu.fx.fadeIn";

    return fx;
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.fadeOut
 * @version: 2010-01-23
 */





 
/**
 * 渐隐渐变效果，效果执行结束后会将元素完全隐藏起来。
 * @function
 * @grammar baidu.fx.fadeOut(element, options)
 * @param {string|HTMLElement} element 元素或者元素的ID
 * @param {Object} options 选项。参数的详细说明如下表所示
 * @config     {Number}                 duration           500,//效果持续时间，默认值为500ms
 * @config     {Number}                 interval           16, //动画帧间隔时间，默认值为16ms
 * @config     {Function}               transition         function(schedule){return schedule;},时间线函数
 * @config     {Function}               onbeforestart      function(){},//效果开始前执行的回调函数
 * @config     {Function}               onbeforeupdate     function(){},//每次刷新画面之前会调用的回调函数
 * @config     {Function}               onafterupdate      function(){},//每次刷新画面之后会调用的回调函数
 * @config     {Function}               onafterfinish      function(){},//效果结束后会执行的回调函数
 * @config     {Function}               oncancel           function(){},//效果被撤销时的回调函数
 * @see baidu.fx.fadeIn
 * @remark
 * 1.0.0开始支持
 */
baidu.fx.fadeOut = function(element, options) {
    if (!(element = baidu.dom.g(element))) return null;

    var fx = baidu.fx.opacity(element,
        baidu.object.extend({from:1, to:0, restoreAfterFinish:true}, options||{})
    );
    fx.addEventListener("onafterfinish", function(){baidu.dom.hide(this.element);});
    fx.__type = "baidu.fx.fadeOut";

    return fx;
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @create: 2010-07-15
 * @namespace: baidu.fx.getTransition
 */




/**
 * 获取线型函数
 * @function
 * @grammar baidu.fx.getTransition(name)
 * @param   {String}    name    transition的名称
 * @return  {function}          线型函数
 */
baidu.fx.getTransition = function(name) {
    var a = baidu.fx.transitions;
    if (!name || typeof a[name] != "string") name = "linear";
    return new Function("percent", a[name]);
};

baidu.fx.transitions = {
    none : "return 0"
    ,full : "return 1"
    ,linear : "return percent"  // 斜线
    ,reverse : "return 1 - percent" // 反斜线
    ,parabola : "return Math.pow(percent, 2)"   // 抛物线
    ,antiparabola : "return 1 - Math.pow(1 - percent, 2)"   // 反抛物线
    ,sinoidal : "return (-Math.cos(percent * Math.PI)/2) + 0.5" // 正弦波
    ,wobble : "return (-Math.cos(percent * Math.PI * (9 * percent))/2) + 0.5"   // 摇晃
    ,spring : "return 1 - (Math.cos(percent * 4.5 * Math.PI) * Math.exp(-percent * 6))" // 弹性阴尼
};

/*
//from: http://github.com/madrobby/scriptaculous/blob/master/src/effects.js

Transitions: {
    linear: Prototype.K,
    sinoidal: function(pos) {
      return (-Math.cos(pos*Math.PI)/2) + .5;
    },
    reverse: function(pos) {
      return 1-pos;
    },
    flicker: function(pos) {
      var pos = ((-Math.cos(pos*Math.PI)/4) + .75) + Math.random()/4;
      return pos > 1 ? 1 : pos;
    },
    wobble: function(pos) {
      return (-Math.cos(pos*Math.PI*(9*pos))/2) + .5;
    },
    pulse: function(pos, pulses) {
      return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
    },
    spring: function(pos) {
      return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
    },
    none: function(pos) {
      return 0;
    },
    full: function(pos) {
      return 1;
    }
}

Fx.Transitions.extend({

	Pow: function(p, x){
		return Math.pow(p, x[0] || 6);
	},

	Expo: function(p){
		return Math.pow(2, 8 * (p - 1));
	},

	Circ: function(p){
		return 1 - Math.sin(Math.acos(p));
	},

	Sine: function(p){
		return 1 - Math.sin((1 - p) * Math.PI / 2);
	},

	Back: function(p, x){
		x = x[0] || 1.618;
		return Math.pow(p, 2) * ((x + 1) * p - x);
	},

	Bounce: function(p){
		var value;
		for (var a = 0, b = 1; 1; a += b, b /= 2){
			if (p >= (7 - 4 * a) / 11){
				value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
				break;
			}
		}
		return value;
	},

	Elastic: function(p, x){
		return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x[0] || 1) / 3);
	}

});

['Quad', 'Cubic', 'Quart', 'Quint'].each(function(transition, i){
	Fx.Transitions[transition] = new Fx.Transition(function(p){
		return Math.pow(p, [i + 2]);
	});
});


//*/
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.highlight
 * @create: 2010-01-23
 * @version: 2010-07-07
 */








 
/**
 * 这个方法改变DOM元素的背景色，实现高亮的效果。
 * @function
 * @grammar baidu.fx.highlight(element, options)
 * @param      {string|HTMLElement}     element            元素或者元素的ID
 * @param      {Object}                 options            选项。参数的详细说明如下表所示
 * @config     {String}                 beginColor         渐变开始时的背景色，如果设置了背景色则以设置的颜色为默认开始颜色，否则默认为'#FFFF00'
 * @config     {String}                 endColor           渐变结束时的背景色，如果设置了背景色则以设置的颜色为默认结束颜色，否则默认为'#FFFFFF'
 * @config     {String}                 finalColor         渐变结束时的背景色，如果设置了背景色则以设置的颜色为结束时背景色，否则默认为endColor值
 * @config     {String}                 textColor          渐变结束时的背景色，如果设置了背景色则以设置的颜色为结束时文本的颜色，否则默认为原文本色值
 * @config     {Number}                 duration           500,//效果持续时间，默认值为500ms
 * @config     {Number}                 interval           16, //动画帧间隔时间，默认值为16ms
 * @config     {Function}               transition         function(schedule){return schedule;},时间线函数
 * @config     {Function}               onbeforestart      function(){},//效果开始前执行的回调函数
 * @config     {Function}               onbeforeupdate     function(){},//每次刷新画面之前会调用的回调函数
 * @config     {Function}               onafterupdate      function(){},//每次刷新画面之后会调用的回调函数
 * @config     {Function}               onafterfinish      function(){},//效果结束后会执行的回调函数
 * @config     {Function}               oncancel           function(){},//效果被撤销时的回调函数
 */
baidu.fx.highlight = function(element, options) {
    if (!(element = baidu.dom.g(element))) return null;

    var e = element;

    var fx = baidu.fx.create(e, baidu.object.extend({
        //[Implement Interface] initialize
        initialize : function() {
            var me = this,
                CS = baidu.dom.getStyle,
                FC = baidu.string.formatColor,
                color = FC(CS(e, "color")) || "#000000",
                bgc   = FC(CS(e, "backgroundColor"));

            // 给用户指定的四个配置参数做一个保护值
            me.beginColor = me.beginColor || bgc || "#FFFF00";
            me.endColor   = me.endColor   || bgc || "#FFFFFF";
            me.finalColor = me.finalColor || me.endColor || me.element.style.backgroundColor;
            me.textColor == color && (me.textColor = "");

            this.protect("color");
            this.protect("backgroundColor");

            me.c_b = []; me.c_d = []; me.t_b = []; me.t_d = [];
            for (var n, i=0; i<3; i++) {
                n = 2 * i + 1;
                me.c_b[i]=parseInt(me.beginColor.substr(n, 2), 16);
                me.c_d[i]=parseInt(me.endColor.substr(n, 2), 16) - me.c_b[i];

                // 如果指定了文字的颜色，则文字颜色也渐变
                if (me.textColor) {
                    me.t_b[i]=parseInt(color.substr(n, 2), 16);
                    me.t_d[i]=parseInt(me.textColor.substr(n,2),16)-me.t_b[i];
                }
            }
        }

        //[Implement Interface] render
        ,render : function(schedule) {
            for (var me=this, a="#", b="#", n, i=0; i<3; i++) {
                n = Math.round(me.c_b[i] + me.c_d[i] * schedule).toString(16);
                a += ("00"+ n).substr(n.length);

                // 如果指定了文字的颜色，则文字颜色也渐变
                if (me.textColor) {
                    n = Math.round(me.t_b[i]+me.t_d[i]*schedule).toString(16);
                    b += ("00"+ n).substr(n.length);
                }
            }
            e.style.backgroundColor = a;
            me.textColor && (e.style.color = b);
        }

        //[Implement Interface] finish
        ,finish : function(){
            this.textColor && (e.style.color = this.textColor);
            e.style.backgroundColor = this.finalColor;
        }
    }, options || {}), "baidu.fx.highlight");

    return fx.launch();
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.mask
 * @version: 2010-05-20
 */







/**
 * 面具遮罩效果。注意：只适用于绝对定位的DOM元素.
 * @function
 * @grammar baidu.fx.mask(element, options)
 * @param       {string|HTMLElement}      element           元素或者元素的ID
 * @param       {Object}                  options           选项。参数的详细说明如下表所示
 * @config      {String}                  startOrigin       "0px 0px",//起始坐标描述。"x y"：x方向和y方向坐标。取值包括像素(含px字符)，百分比，top、left、center、bottom、right，默认"0px 0px"。
 * @config      {Number}                  from              0,//效果起始值。介于0到1之间的一个数字，默认为0。
 * @config      {Number}                  to                1,//效果结束值。介于0到1之间的一个数字，默认为1。
 * @config      {Number}                  duration          500,//效果持续时间，默认值为500ms。
 * @config      {Number}                  interval          16, //动画帧间隔时间，默认值为16ms。
 * @config      {Function}                transition        function(schedule){return schedule;},时间线函数
 * @config      {Function}                onbeforestart     function(){},//效果开始前执行的回调函数
 * @config      {Function}                onbeforeupdate    function(){},//每次刷新画面之前会调用的回调函数
 * @config      {Function}                onafterupdate     function(){},//每次刷新画面之后会调用的回调函数
 * @config      {Function}                onafterfinish     function(){},//效果结束后会执行的回调函数
 * @config      {Function}                oncancel          function(){},//效果被撤销时的回调函数
 */
baidu.fx.mask = function(element, options) {
    // mask 效果只适用于绝对定位的DOM元素
    if (!(element = baidu.dom.g(element)) ||
        baidu.dom.getStyle(element, "position") != "absolute")
        return null;

    var e = element, original = {};
    options = options || {};

    // [startOrigin] "0px 0px" "50% 50%" "top left"
    var r = /^(\d+px|\d?\d(\.\d+)?%|100%|left|center|right)(\s+(\d+px|\d?\d(\.\d+)?%|100%|top|center|bottom))?/i;
    !r.test(options.startOrigin) && (options.startOrigin = "0px 0px");

    var options = baidu.object.extend({restoreAfterFinish:true, from:0, to:1}, options || {});

    var fx = baidu.fx.create(e, baidu.object.extend({
        //[Implement Interface] initialize
        initialize : function() {
            e.style.display = "";
            this.protect("clip");
            original.width = e.offsetWidth;
            original.height = e.offsetHeight;

            // 计算效果起始点坐标
            r.test(this.startOrigin);
            var t1 = RegExp["\x241"].toLowerCase(),
                t2 = RegExp["\x244"].toLowerCase(),
                ew = this.element.offsetWidth,
                eh = this.element.offsetHeight,
                dx, dy;

            if (/\d+%/.test(t1)) dx = parseInt(t1, 10) / 100 * ew;
            else if (/\d+px/.test(t1)) dx = parseInt(t1);
            else if (t1 == "left") dx = 0;
            else if (t1 == "center") dx = ew / 2;
            else if (t1 == "right") dx = ew;

            if (!t2) dy = eh / 2;
            else {
                if (/\d+%/.test(t2)) dy = parseInt(t2, 10) / 100 * eh;
                else if (/\d+px/.test(t2)) dy = parseInt(t2);
                else if (t2 == "top") dy = 0;
                else if (t2 == "center") dy = eh / 2;
                else if (t2 == "bottom") dy = eh;
            }
            original.x = dx;
            original.y = dy;
        }

        //[Implement Interface] render
        ,render : function(schedule) {
            var n = this.to * schedule + this.from * (1 - schedule),
                top = original.y * (1 - n) +"px ",
                left = original.x * (1 - n) +"px ",
                right = original.x * (1 - n) + original.width * n +"px ",
                bottom = original.y * (1 - n) + original.height * n +"px ";
            e.style.clip = "rect("+ top + right + bottom + left +")";
        }

        //[Implement Interface] finish
        ,finish : function(){
            if (this.to < this.from) e.style.display = "none";
        }
    }, options), "baidu.fx.mask");

    return fx.launch();
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.move
 * @version: 2010-06-04
 */







 
/**
 * 移动元素，将参数元素移动到指定位置。注意：对static定位的DOM元素无效。
 * @function
 * @grammar baidu.fx.move(element, options)
 * @param       {string|HTMLElement}      element           元素或者元素的ID
 * @param       {Object}                  options           选项。参数的详细说明如下表所示
 * @config      {Number}                  x                 0,//横坐标移动的偏移量，默认值为0px。
 * @config      {Number}                  y                 0,//纵坐标移动的偏移量，默认值为0px。
 * @config      {Number}                  duration          500,//效果持续时间，默认值为500ms。
 * @config      {Number}                  interval          16, //动画帧间隔时间，默认值为16ms。
 * @config      {Function}                transition        function(schedule){return schedule;},时间线函数
 * @config      {Function}                onbeforestart     function(){},//效果开始前执行的回调函数
 * @config      {Function}                onbeforeupdate    function(){},//每次刷新画面之前会调用的回调函数
 * @config      {Function}                onafterupdate     function(){},//每次刷新画面之后会调用的回调函数
 * @config      {Function}                onafterfinish     function(){},//效果结束后会执行的回调函数
 * @config      {Function}                oncancel          function(){},//效果被撤销时的回调函数
 * @remark
 * 1.0.0开始支持
 */
baidu.fx.move = function(element, options) {
    if (!(element = baidu.dom.g(element))
        || baidu.dom.getStyle(element, "position") == "static") return null;
    
    options = baidu.object.extend({x:0, y:0}, options || {});
    if (options.x == 0 && options.y == 0) return null;

    var fx = baidu.fx.create(element, baidu.object.extend({
        //[Implement Interface] initialize
        initialize : function() {
            this.protect("top");
            this.protect("left");

            this.originX = parseInt(baidu.dom.getStyle(element, "left"))|| 0;
            this.originY = parseInt(baidu.dom.getStyle(element, "top")) || 0;
        }

        //[Implement Interface] transition
        ,transition : function(percent) {return 1 - Math.pow(1 - percent, 2);}

        //[Implement Interface] render
        ,render : function(schedule) {
            element.style.top  = (this.y * schedule + this.originY) +"px";
            element.style.left = (this.x * schedule + this.originX) +"px";
        }
    }, options), "baidu.fx.move");

    return fx.launch();
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.moveBy
 * @version: 2010-06-04
 */







 
/**
 * 移动渐变效果。这个效果会使目标元素移动指定的距离。注意: 对static定位的DOM元素无效。
 * @function
 * @grammar baidu.fx.moveBy(element, distance, options)
 * @param       {string|HTMLElement}      element               元素或者元素的ID
 * @param       {Array|Object}            distance              偏移距离。若为数组，索引0为x方向，索引1为y方向；若为Object，键x为x方向，键y为y方向；单位：px，默认值为：0。
 * @param       {Object}                  options               选项。参数的详细说明如下表所示
 * @config      {Number}                  duration              500,//效果持续时间，默认值为500ms。
 * @config      {Number}                  interval              16, //动画帧间隔时间，默认值为16ms。
 * @config      {Function}                restore               restore方法,在onafterfinish与oncancel时默认调用
 * @config      {Boolean}                 restoreAfterFinish    默认为true，在onafterfinish与oncancel事件中调用restore方法。
 * @config      {Function}                transition            function(schedule){return schedule;},时间线函数
 * @config      {Function}                onbeforestart         function(){},//效果开始前执行的回调函数
 * @config      {Function}                onbeforeupdate        function(){},//每次刷新画面之前会调用的回调函数
 * @config      {Function}                onafterupdate         function(){},//每次刷新画面之后会调用的回调函数
 * @config      {Function}                onafterfinish         function(){},//效果结束后会执行的回调函数
 * @config      {Function}                oncancel              function(){},//效果被撤销时的回调函数
 * @remark
 * 1.0.0开始支持
 * @see baidu.fx.moveBy
 */
baidu.fx.moveBy = function(element, distance, options) {
    if (!(element = baidu.dom.g(element))
        || baidu.dom.getStyle(element, "position") == "static"
        || typeof distance != "object") return null;

    var d = {};
    d.x = distance[0] || distance.x || 0;
    d.y = distance[1] || distance.y || 0;

    var fx = baidu.fx.move(element, baidu.object.extend(d, options||{}));

    return fx;
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.moveTo
 * @version: 2010-06-07
 */






 
/**
 * 移动渐变效果，该效果使元素移动到指定的位置。注意：对static定位的DOM元素无效。
 * @function
 * @grammar baidu.fx.moveTo(element, point, options)
 * @param       {string|HTMLElement}      element               元素或者元素的ID
 * @param       {Array|Object}            point                 目标点坐标。若为数组，索引0为x方向，索引1为y方向；若为Object，键x为x方向，键y为y方向；单位：px，默认值：元素本来的坐标。
 * @param       {Object}                  options               选项。参数的详细说明如下表所示
 * @config      {Number}                  duration              500,//效果持续时间，默认值为500ms。
 * @config      {Number}                  interval              16, //动画帧间隔时间，默认值为16ms。
 * @config      {Function}                transition            function(schedule){return schedule;},时间线函数
 * @config      {Function}                onbeforestart         function(){},//效果开始前执行的回调函数
 * @config      {Function}                onbeforeupdate        function(){},//每次刷新画面之前会调用的回调函数
 * @config      {Function}                onafterupdate         function(){},//每次刷新画面之后会调用的回调函数
 * @config      {Function}                onafterfinish         function(){},//效果结束后会执行的回调函数
 * @config      {Function}                oncancel              function(){},//效果被撤销时的回调函数
 * @remark
 * 1.0.0开始支持
 * @see baidu.fx.moveTo
 */
baidu.fx.moveTo = function(element, point, options) {
    if (!(element = baidu.dom.g(element))
        || baidu.dom.getStyle(element, "position") == "static"
        || typeof point != "object") return null;

    var p = [point[0] || point.x || 0,point[1] || point.y || 0];
    var x = parseInt(baidu.dom.getStyle(element, "left")) || 0;
    var y = parseInt(baidu.dom.getStyle(element, "top"))  || 0;

    var fx = baidu.fx.move(element, baidu.object.extend({x: p[0]-x, y: p[1]-y}, options||{}));

    return fx;
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.scale
 * @version: 2010-06-07
 */










/**
 * 将元素放大或缩小的效果。
 * @function
 * @grammar baidu.fx.scale(element, options)
 * @param       {string|HTMLElement}      element               元素或者元素的ID
 * @param       {Object}                  options               选项。参数的详细说明如下表所示
 * @config      {String}                  transformOrigin       "0px 0px",//起始坐标描述。"x y"：x方向和y方向坐标，取值包括像素(含px字符，百分比，top、left、center、bottom、right，默认"0px 0px"。
 * @config      {Number}                  from                  效果起始值，介于0到1之间的一个数字。
 * @config      {Number}                  to                    效果结束值，介于0到1之间的一个数字。
 * @config      {Number}                  duration              500,//效果持续时间，默认值为500ms。
 * @config      {Number}                  interval              16, //动画帧间隔时间，默认值为16ms。
 * @config      {Function}                transition            function(schedule){return schedule;},时间线函数
 * @config      {Boolean}                 fade                  true，//渐变，默认为true
 * @config      {Function}                onbeforestart         function(){},//效果开始前执行的回调函数
 * @config      {Function}                onbeforeupdate        function(){},//每次刷新画面之前会调用的回调函数
 * @config      {Function}                onafterupdate         function(){},//每次刷新画面之后会调用的回调函数
 * @config      {Function}                onafterfinish         function(){},//效果结束后会执行的回调函数
 * @config      {Function}                oncancel              function(){},//效果被撤销时的回调函数
 */
baidu.fx.scale = function(element, options) {
    if (!(element = baidu.dom.g(element))) return null;
    options = baidu.object.extend({from : 0.1,to : 1}, options || {});

    // "0px 0px" "50% 50%" "top left"
    var r = /^(-?\d+px|\d?\d(\.\d+)?%|100%|left|center|right)(\s+(-?\d+px|\d?\d(\.\d+)?%|100%|top|center|bottom))?/i;
    !r.test(options.transformOrigin) && (options.transformOrigin = "0px 0px");

    var original = {},
        fx = baidu.fx.create(element, baidu.object.extend({
        fade: true,
            
        //[Implement Interface] initialize
        initialize : function() {
            baidu.dom.show(element);
            var me = this,
                o = original,
                s = element.style,
                save    = function(k){me.protect(k)};

            // IE浏览器使用 zoom 样式放大
            if (baidu.browser.ie) {
                save("top");
                save("left");
                save("position");
                save("zoom");
                save("filter");

                this.offsetX = parseInt(baidu.dom.getStyle(element, "left")) || 0;
                this.offsetY = parseInt(baidu.dom.getStyle(element, "top"))  || 0;

                if (baidu.dom.getStyle(element, "position") == "static") {
                    s.position = "relative";
                }

                // IE 的ZOOM没有起始点，以下代码就是实现起始点
                r.test(this.transformOrigin);
                var t1 = RegExp["\x241"].toLowerCase(),
                    t2 = RegExp["\x244"].toLowerCase(),
                    ew = this.element.offsetWidth,
                    eh = this.element.offsetHeight,
                    dx, dy;

                if (/\d+%/.test(t1)) dx = parseInt(t1, 10) / 100 * ew;
                else if (/\d+px/.test(t1)) dx = parseInt(t1);
                else if (t1 == "left") dx = 0;
                else if (t1 == "center") dx = ew / 2;
                else if (t1 == "right") dx = ew;

                if (!t2) dy = eh / 2;
                else {
                    if (/\d+%/.test(t2)) dy = parseInt(t2, 10) / 100 * eh;
                    else if (/\d+px/.test(t2)) dy = parseInt(t2);
                    else if (t2 == "top") dy = 0;
                    else if (t2 == "center") dy = eh / 2;
                    else if (t2 == "bottom") dy = eh;
                }

                // 设置初始的比例
                s.zoom = this.from;
                o.cx = dx; o.cy = dy;   // 放大效果起始原点坐标
            } else {
                save("WebkitTransform");
                save("WebkitTransformOrigin");   // Chrome Safari
                save("MozTransform");
                save("MozTransformOrigin");         // Firefox Mozllia
                save("OTransform");
                save("OTransformOrigin");             // Opera 10.5 +
                save("transform");
                save("transformOrigin");               // CSS3
                save("opacity");
                save("KHTMLOpacity");

                // 设置初始的比例和效果起始点
                s.WebkitTransform =
                    s.MozTransform =
                    s.OTransform =
                    s.transform = "scale("+ this.from +")";

                s.WebkitTransformOrigin = 
                    s.MozTransformOrigin = 
                    s.OTransformOrigin =
                    s.transformOrigin = this.transformOrigin;
            }
        }

        //[Implement Interface] render
        ,render : function(schedule) {
            var s = element.style,
                b = this.to == 1,
                b = typeof this.opacityTrend == "boolean" ? this.opacityTrend : b,
                p = b ? this.percent : 1 - this.percent,
                n = this.to * schedule + this.from * (1 - schedule);

            if (baidu.browser.ie) {
                s.zoom = n;
                if(this.fade){
                    s.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity:"+
                        Math.floor(p * 100) +")";
                }
                
                // IE 下得计算 transform-origin 变化
                s.top = this.offsetY + original.cy * (1 - n);
                s.left= this.offsetX + original.cx * (1 - n);
            } else {
                s.WebkitTransform =
                    s.MozTransform =
                    s.OTransform =
                    s.transform = "scale("+ n +")";
                if(this.fade){
                    s.KHTMLOpacity = s.opacity = p;
                }
            }
        }
    }, options), "baidu.fx.scale");

    return fx.launch();
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.zoomOut
 * @version: 2010-06-07
 */







 
/**
 * 将元素缩小的消失效果。
 * @function
 * @grammar baidu.fx.zoomOut(element, options)
 * @param     {string|HTMLElement}    element            元素或者元素的ID
 * @param     {Object}                options            选项。参数的详细说明如下表所示
 * @config    {String}                transformOrigin    "0px 0px",//起始坐标描述。"x y"：x方向和y方向坐标，取值包括像素(含px字符)，百分比，top、left、center、bottom、right，默认"0px 0px"。
 * @config    {Number}                from               1,//效果起始值。介于0到1之间的一个数字，默认为1。
 * @config    {Number}                to                 0.1,//效果结束值。介于0到1之间的一个数字，默认为0.1。
 * @config    {Number}                duration           500,//效果持续时间，默认值为500ms。
 * @config    {Number}                interval           16, //动画帧间隔时间，默认值为16ms。
 * @config    {Function}              transition         function(schedule){return schedule;},时间线函数
 * @config    {Function}              onbeforestart      function(){},//效果开始前执行的回调函数
 * @config    {Function}              onbeforeupdate     function(){},//每次刷新画面之前会调用的回调函数
 * @config    {Function}              onafterupdate      function(){},//每次刷新画面之后会调用的回调函数
 * @config    {Function}              onafterfinish      function(){},//效果结束后会执行的回调函数
 * @config    {Function}              oncancel           function(){},//效果被撤销时的回调函数
 */
baidu.fx.zoomOut = function(element, options) {
    if (!(element = baidu.dom.g(element))) return null;

    options = baidu.object.extend({
        to:0.1
        ,from:1
        ,opacityTrend:false
        ,restoreAfterFinish:true
        ,transition:function(n){return 1 - Math.pow(1 - n, 2);}
    },  options||{});

    var effect = baidu.fx.scale(element, options);
    effect.addEventListener("onafterfinish", function(){baidu.dom.hide(this.element);});

    return effect;
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.puff
 * @create: 2010-07-14
 * @version: 2010-07-14
 */



/**
 * 将DOM元素放大，关逐渐透明消失。
 * @function
 * @grammar baidu.fx.puff(element, options)
 * @param       {string|HTMLElement}      element               元素或者元素的ID
 * @param       {Object}                  options               选项。参数的详细说明如下表所示
 * @config      {Number}                  duration              800,//效果持续时间，默认值为800ms。
 * @config      {Number}                  to                    1.8,//放大倍数，默认1.8。
 * @config      {Function}                transition            function(schedule){return schedule;},时间线函数
 * @config      {Function}                onbeforestart         function(){},//效果开始前执行的回调函数
 * @config      {Function}                onbeforeupdate        function(){},//每次刷新画面之前会调用的回调函数
 * @config      {Function}                onafterupdate         function(){},//每次刷新画面之后会调用的回调函数
 * @config      {Function}                onafterfinish         function(){},//效果结束后会执行的回调函数
 * @config      {Function}                oncancel              function(){},//效果被撤销时的回调函数
 * @remark
 * 1.0.0开始支持
 * @see baidu.fx.puff
 */
baidu.fx.puff = function(element, options) {
    return baidu.fx.zoomOut(element,
        baidu.object.extend({
            to:1.8
            ,duration:800
            ,transformOrigin:"50% 50%"
        }, options||{})
    );
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.pulsate
 * @version: 2010-01-23
 */






 
/**
 * 心跳闪现效果。
 * @function
 * @grammar baidu.fx.pulsate(element, loop, options)
 * @param       {string|HTMLElement}      element               元素或者元素的ID
 * @param       {Number}                  loop                  心跳次数，小于0则为永远跳动，默认为0次。
 * @param       {Object}                  options               选项。参数的详细说明如下表所示
 * @config      {Number}                  duration              500,//效果持续时间，默认值为500ms。
 * @config      {Number}                  interval              16, //动画帧间隔时间，默认值为16ms。
 * @config      {Function}                transition            function(schedule){return schedule;},时间线函数
 * @config      {Function}                onbeforestart         function(){},//效果开始前执行的回调函数
 * @config      {Function}                onbeforeupdate        function(){},//每次刷新画面之前会调用的回调函数
 * @config      {Function}                onafterupdate         function(){},//每次刷新画面之后会调用的回调函数
 * @config      {Function}                onafterfinish         function(){},//效果结束后会执行的回调函数
 * @config      {Function}                oncancel              function(){},//效果被撤销时的回调函数
 */
baidu.fx.pulsate = function(element, loop, options) {
    if (!(element = baidu.dom.g(element))) return null;
    if (isNaN(loop) || loop == 0) return null;

    var e = element;

    var fx = baidu.fx.create(e, baidu.object.extend({
        //[Implement Interface] initialize
        initialize : function() {this.protect("visibility");}

        //[Implement Interface] transition
        ,transition : function(percent) {return Math.cos(2*Math.PI*percent);}

        //[Implement Interface] render
        ,render : function(schedule) {
            e.style.visibility = schedule > 0 ? "visible" : "hidden";
        }

        //[Implement Interface] finish
        ,finish : function(){
            setTimeout(function(){
                baidu.fx.pulsate(element, --loop, options);
            }, 10);
        }
    }, options), "baidu.fx.pulsate");

    return fx.launch();
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.remove
 * @version: 2010-01-23
 */






 
/**
 * 删除元素的时候使用fadeOut效果
 * @function
 * @grammar baidu.fx.remove(element, options)
 * @param       {string|HTMLElement}      element               元素或者元素的ID
 * @param       {Object}                  options               选项。参数的详细说明如下表所示
 * @config      {Number}                  duration              500,//效果持续时间，默认值为500ms。
 * @config      {Number}                  interval              16, //动画帧间隔时间，默认值为16ms。
 * @config      {Function}                transition            function(schedule){return schedule;},时间线函数
 * @config      {Function}                onbeforestart         function(){},//效果开始前执行的回调函数
 * @config      {Function}                onbeforeupdate        function(){},//每次刷新画面之前会调用的回调函数
 * @config      {Function}                onafterupdate         function(){},//每次刷新画面之后会调用的回调函数
 * @config      {Function}                onafterfinish         function(){},//效果结束后会执行的回调函数
 * @config      {Function}                oncancel              function(){},//效果被撤销时的回调函数
 */

baidu.fx.remove = function(element, options) {
    var afterFinish = options.onafterfinish ? options.onafterfinish : new Function();
    
    return baidu.fx.fadeOut(element, baidu.object.extend(options||{}, {
        onafterfinish: function(){
            baidu.dom.remove(this.element);
            afterFinish.call(this);
        }
    }));
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @create: 2010-07-14
 * @namespace: baidu.fx.scrollBy
 * @version: 2010-07-14
 */





 
/**
 * 按指定量移动滚动条。
 * @function
 * @grammar baidu.fx.scrollBy(element, distance, options)
 * @param       {string|HTMLElement}      element               元素或者元素的ID
 * @param       {Array|JSON}              distance              移动的距离 [,] | {x,y}，支持数组与JSON格式
 * @param       {Object}                  options               选项。参数的详细说明如下表所示
 * @config      {Number}                  duration              500,//效果持续时间，默认值为500ms。
 * @config      {Number}                  interval              16, //动画帧间隔时间，默认值为16ms。
 * @config      {Function}                transition            function(schedule){return schedule;},时间线函数
 * @config      {Function}                onbeforestart         function(){},//效果开始前执行的回调函数
 * @config      {Function}                onbeforeupdate        function(){},//每次刷新画面之前会调用的回调函数
 * @config      {Function}                onafterupdate         function(){},//每次刷新画面之后会调用的回调函数
 * @config      {Function}                onafterfinish         function(){},//效果结束后会执行的回调函数
 * @config      {Function}                oncancel              function(){},//效果被撤销时的回调函数
 */
baidu.fx.scrollBy = function(element, distance, options) {
    if (!(element = baidu.dom.g(element)) || typeof distance != "object") return null;
    
    var d = {}, mm = {};
    d.x = distance[0] || distance.x || 0;
    d.y = distance[1] || distance.y || 0;

    var fx = baidu.fx.create(element, baidu.object.extend({
        //[Implement Interface] initialize
        initialize : function() {
            var t = mm.sTop   = element.scrollTop;
            var l = mm.sLeft  = element.scrollLeft;

            mm.sx = Math.min(element.scrollWidth - element.clientWidth - l, d.x);
            mm.sy = Math.min(element.scrollHeight- element.clientHeight- t, d.y);
        }

        //[Implement Interface] transition
        ,transition : function(percent) {return 1 - Math.pow(1 - percent, 2);}

        //[Implement Interface] render
        ,render : function(schedule) {
            element.scrollTop  = (mm.sy * schedule + mm.sTop);
            element.scrollLeft = (mm.sx * schedule + mm.sLeft);
        }

        ,restore : function(){
            element.scrollTop   = mm.sTop;
            element.scrollLeft  = mm.sLeft;
        }
    }, options), "baidu.fx.scroll");

    return fx.launch();
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @create: 2010-07-14
 * @namespace: baidu.fx.scrollTo
 * @version: 2010-07-14
 */




 
/**
 * 滚动条滚动到指定位置。
 * @function
 * @grammar baidu.fx.scrollTo(element, point, options)
 * @param     {string|HTMLElement}    element            元素或者元素的ID
 * @param     {Array|JSON}            point              移动的距离 [,] | {x,y}，支持数组与JSON格式
 * @param     {Object}                options            选项。参数的详细说明如下表所示
 * @config    {Number}                duration           500,//效果持续时间，默认值为500ms。
 * @config    {Number}                interval           16, //动画帧间隔时间，默认值为16ms。
 * @config    {Function}              transition         function(schedule){return schedule;},时间线函数
 * @config    {Function}              onbeforestart      function(){},//效果开始前执行的回调函数
 * @config    {Function}              onbeforeupdate     function(){},//每次刷新画面之前会调用的回调函数
 * @config    {Function}              onafterupdate      function(){},//每次刷新画面之后会调用的回调函数
 * @config    {Function}              onafterfinish      function(){},//效果结束后会执行的回调函数
 * @config    {Function}              oncancel           function(){},//效果被撤销时的回调函数
 */
baidu.fx.scrollTo = function(element, point, options) {
    if (!(element = baidu.dom.g(element)) || typeof point != "object") return null;
    
    var d = {};
    d.x = (point[0] || point.x || 0) - element.scrollLeft;
    d.y = (point[1] || point.y || 0) - element.scrollTop;

    return baidu.fx.scrollBy(element, d, options);
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.shake
 * @version: 2010-01-23
 */







 
/**
 * 颤动的效果。
 * 说明：在效果执行过程中会修改DOM元素的position属性，可能会对包含的DOM元素带来影响
 * @function
 * @grammar baidu.fx.shake(element, offset, options)
 * @param     {string|HTMLElement}    element            元素或者元素的ID
 * @param     {Array|Object}          offset             震动范围。若为数组，索引0为x方向，索引1为y方向；若为Object，键x为x方向，键y为y方向；单位：px，默认值：元素本来的坐标。
 * @param     {Object}                options            选项。参数的详细说明如下表所示
 * @config    {Number}                duration           500,//效果持续时间，默认值为500ms。
 * @config    {Number}                interval           16, //动画帧间隔时间，默认值为16ms。
 * @config    {Function}              transition         function(schedule){return schedule;},时间线函数
 * @config    {Function}              onbeforestart      function(){},//效果开始前执行的回调函数
 * @config    {Function}              onbeforeupdate     function(){},//每次刷新画面之前会调用的回调函数
 * @config    {Function}              onafterupdate      function(){},//每次刷新画面之后会调用的回调函数
 * @config    {Function}              onafterfinish      function(){},//效果结束后会执行的回调函数
 * @config    {Function}              oncancel           function(){},//效果被撤销时的回调函数
 */
baidu.fx.shake = function(element, offset, options) {
    if (!(element = baidu.dom.g(element))) return null;

    var e = element;
    offset = offset || [];
    function tt() {
        for (var i=0; i<arguments.length; i++) {
            if (!isNaN(arguments[i])) return arguments[i];
        }
    }

    var fx = baidu.fx.create(e, baidu.object.extend({
        //[Implement Interface] initialize
        initialize : function() {
            this.protect("top");
            this.protect("left");
            this.protect("position");
            this.restoreAfterFinish = true;

            if (baidu.dom.getStyle(e, "position") == "static") {
                e.style.position = "relative";
            }
			var original = this['\x06original'];
            this.originX = parseInt(original.left|| 0);
            this.originY = parseInt(original.top || 0);
            this.offsetX = tt(offset[0], offset.x, 16);
            this.offsetY = tt(offset[1], offset.y, 5);
        }

        //[Implement Interface] transition
        ,transition : function(percent) {
            var line = 1 - percent;
            return Math.floor(line * 16) % 2 == 1 ? line : percent - 1;
        }

        //[Implement Interface] render
        ,render : function(schedule) {
            e.style.top  = (this.offsetY * schedule + this.originY) +"px";
            e.style.left = (this.offsetX * schedule + this.originX) +"px";
        }
    }, options || {}), "baidu.fx.shake");

    return fx.launch();
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.fx.zoomIn
 * @version: 2010-06-07
 */






 
/**
 * 将元素放大的展现效果。
 * @function
 * @grammar baidu.fx.zoomIn(element, options)
 * @param     {string|HTMLElement}    element            元素或者元素的ID
 * @param     {Object}                options            选项。参数的详细说明如下表所示
 * @config    {String}                transformOrigin    "0px 0px",//起始坐标描述。"x y"：x方向和y方向坐标，取值包括像素(含px字符)，百分比，top、left、center、bottom、right，默认"0px 0px"。
 * @config    {Number}                from               0.1,//效果默认起始值
 * @config    {Number}                to                 1,//效果结束默认值，输入的数值越大，图片显示的越大。
 * @config    {Number}                duration           500,//效果持续时间，默认值为500ms。
 * @config    {Number}                interval           16, //动画帧间隔时间，默认值为16ms。
 * @config    {Function}              transition         function(schedule){return schedule;},时间线函数
 * @config    {Function}              onbeforestart      function(){},//效果开始前执行的回调函数
 * @config    {Function}              onbeforeupdate     function(){},//每次刷新画面之前会调用的回调函数
 * @config    {Function}              onafterupdate      function(){},//每次刷新画面之后会调用的回调函数
 * @config    {Function}              onafterfinish      function(){},//效果结束后会执行的回调函数
 * @config    {Function}              oncancel           function(){},//效果被撤销时的回调函数
 */
baidu.fx.zoomIn = function(element, options) {
    if (!(element = baidu.dom.g(element))) return null;

    options = baidu.object.extend({
        to:1
        ,from:0.1
        ,restoreAfterFinish:true
        ,transition:function(n){return Math.pow(n, 2)}
    },  options||{});

    return baidu.fx.scale(element, options);
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */


/**
 * 提供对浏览器处理浏览历史的功能
 * @namespace baidu.history
 */
baidu.history = baidu.history || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 通过hash值的来记录页面的状态
 * 通过js改变hash的时候，浏览器会增加历史记录，并且执行回调函数
 * @name baidu.history.listen
 * @function
 * @grammar baidu.history.listen(callback)
 * @param {Function} callBack hash值变更时的回调函数.
 */
(function() {

    var _curHash,       //当前hash值，用来判断hash变化
        _frame,
        _callbackFun;   //hash变化时的回调函数

    /**
     * 用于IE更新iframe的hash值
     * @private
     * @param {String} hash
     */
    function _addHistory(hash) {
        var fdoc = _frame.contentWindow.document;
        hash = hash || '#';

        //通过open方法触发frame的onload
        fdoc.open();
        fdoc.write('\<script\>window.top.location.hash="' + hash + '";\</script\>');
        fdoc.close();
        fdoc.location.hash = hash;
    };

    /**
     * @private
     * 执行回调函数并改边hash值
     */
    function _hashChangeCallBack() {
        
        _callbackFun && _callbackFun();
        //设置当前的hash值，防止轮询再次监听到hash变化
        _curHash = (window.location.hash.replace(/^#/, '') || '');
    };

    /**
     * 判断hash是否变化
     * @private
     */
    function _checkHash() {

        var hash = location.hash.replace(/^#/, '');
        if (hash != _curHash) {
            //如果frame存在通过frame的onload事件来触发回调方法，如果不存在直接执行回调函数
            _frame ? _addHistory(hash) : _hashChangeCallBack();
        }
    };

    
    function listen(callBack) {
        _curHash = ('');
        if (callBack)
            _callbackFun = callBack;

        if (baidu.browser.ie) {

            //IE下通过创建frame来增加history
            _frame = document.createElement('iframe');
            _frame.style.display = 'none';
            document.body.appendChild(_frame);

            _addHistory(window.location.hash);
            //通过frame的onload事件触发回调函数
            _frame.attachEvent('onload', function() {
                _hashChangeCallBack();
            });
            setInterval(_checkHash, 100);

        }else if (baidu.browser.firefox < 3.6) {
            //ff3.5以下版本hash变化会自动增加历史记录，只需轮询监听hash变化调用回调函数
            setInterval(_checkHash, 100);

        }else {
            if (_curHash != location.hash.replace(/^#/, ''))
                _curHash = (window.location.hash.replace(/^#/, '') || '');   
            
            //ff3.6 chrome safari oprea11通过onhashchange实现
            window.onhashchange = _hashChangeCallBack;
        }
    };
    
    baidu.history.listen = listen;
})();
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

/**
 * 提供国际的一些接口
 * @namespace baidu.i18n
 */
baidu.i18n = baidu.i18n || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

baidu.i18n.cultures = baidu.i18n.cultures || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




baidu.i18n.cultures['en-US'] = baidu.object.extend(baidu.i18n.cultures['en-US'] || {}, {
    calendar: {
        dateFormat: 'yyyy-MM-dd',
        titleNames: '#{MM}&nbsp;#{yyyy}',
        monthNames: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dayNames: {mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun'}
    },
    
    timeZone: -5,
    whitespace: new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"),

    number: {
        group: ",",
        groupLength: 3,
        decimal: ".",
        positive: "",
        negative: "-",

        _format: function(number, isNegative){
            return baidu.i18n.number._format(number, {
                group: this.group,
                groupLength: this.groupLength,
                decimal: this.decimal,
                symbol: isNegative ? this.negative : this.positive 
            });
        }
    },

    currency: {
        symbol: '$'           
    },

    language: {
        ok: 'ok',
        cancel: 'cancel',
        signin: 'signin',
        signup: 'signup'
    }
});

baidu.i18n.currentLocale = 'en-US';
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



baidu.i18n.cultures['zh-CN'] = baidu.object.extend(baidu.i18n.cultures['zh-CN'] || {}, {
    calendar: {
        dateFormat: 'yyyy-MM-dd',
        titleNames: '#{yyyy}年&nbsp;#{MM}月',
        monthNames: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
        monthNamesShort: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        dayNames: {mon: '一', tue: '二', wed: '三', thu: '四', fri: '五', sat: '六', sun: '日'}
    },
    
    timeZone: 8,
    whitespace: new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"),
    
    number: {
        group: ",",
        groupLength: 3,
        decimal: ".",
        positive: "",
        negative: "-",

        _format: function(number, isNegative){
            return baidu.i18n.number._format(number, {
                group: this.group,
                groupLength: this.groupLength,
                decimal: this.decimal,
                symbol: isNegative ? this.negative : this.positive 
            });
        }
    },

    currency: {
        symbol: '￥'  
    },

    language: {
        ok: '确定',
        cancel: '取消',
        signin: '注册',
        signup: '登录'
    }
});

baidu.i18n.currentLocale = 'zh-CN';
﻿/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

/**
 * number
 * @name baidu.i18n.number
 * @Object
 * @grammar baidu.i18n.number
 */
baidu.i18n.number = baidu.i18n.number || /**@lends baidu.i18n.number.prototype*/{

    /**
     * 将传入的数字或者文字某种语言的格式进行格式化
     * @grammar baidu.i18n.number.format(number, sLocale, tLocale)
     * @param {String|Number} number 需要进行格式化的数字或者文字
     * @param {String} [sLocale] 可选参数，若传入的number格式为字符串，则该参数必须传入
     * @param {String} [tLocale] 目标语言
     * @return {String}
     */
    format: function(number, sLocale, tLocale){
        var me = this,
            sOpt = sLocale && baidu.i18n.cultures[sLocale].number,
            tOpt = baidu.i18n.cultures[tLocale || baidu.i18n.currentLocale].number,
            isNegative = false;

        if(typeof number === 'string'){
            
            if(number.indexOf(sOpt.negative) > -1){
                isNegative = true;
                number = number.replace(sOpt.negative, "");   
            }else if(number.indexOf(sOpt.positive) > -1){
                number = number.replace(sOpt.positive, "");
            }
            number = number.replace(new RegExp(sOpt.group,'g'), "");
        }else{
            if(number < 0){
                isNegative = true;
                number *= -1;       
            }
        }
        number = parseFloat(number);
        if(isNaN(number)){
            return 'NAN'; 
        }
        
        return tOpt._format ? tOpt._format(number, isNegative) : me._format(number, {
            group: tOpt.group || ',',
            decimal: tOpt.decimal || '.',
            groupLength: tOpt.groupLength,
            symbol: isNegative ? tOpt.negative : tOpt.positive
        });
    },

    /**
     * 格式化数字
     * @private
     * @param {Number} number 需要格式化的数字
     * @param {Object} options 格式化数字使用的参数
     * @return {String}
     */
    _format: function(number, options){
        var numberArray = String(number).split(options.decimal),
            preNum = numberArray[0].split('').reverse(),
            aftNum = numberArray[1] || '',
            len = 0,remainder = 0,
            result = '';
        
        len = parseInt(preNum.length / options.groupLength);
        remainder = preNum.length % options.groupLength;
        len = remainder == 0 ? len - 1 : len;

        for(var i = 1; i <= len; i++){
            preNum.splice(options.groupLength * i + (i - 1), 0, options.group);    
        }
        preNum = preNum.reverse();
        result = options.symbol + preNum.join('') + (aftNum.length > 0 ? options.decimal + aftNum : '');

        return result;
    }
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * currency
 * @name baidu.i18n.currency
 * @Object
 * @grammar baidu.i18n.currency
 */
baidu.i18n.currency = baidu.i18n.currency || /** @lends baidu.i18n.currency.prototype */{
    
    /**
     * 将传入的数字或者文字某种语言的货币格式进行格式化
     * @grammar baidu.i18n.currency.format(number, sLocale, tLocale)
     * @param {String|Number} number 需要进行格式化的数字或者文字
     * @param {String} [sLocale] 可选参数，若传入的number格式为字符串，则该参数必须传入
     * @param {String} [tLocale] 目标语言
     * @return {String}
     */
    format: function(number, sLocale, tLocale) {
        var me = this,
            sOpt = sLocale && baidu.i18n.cultures[sLocale].currency,
            tOpt = baidu.i18n.cultures[tLocale || baidu.i18n.currentLocale].currency,
            result;

        if(typeof number === "string"){
            number = number.replace(sOpt.symbol);
        }
        
        return tOpt.symbol + this._format(number, sLocale, tLocale);
    },

    /**
     * 按照语言的数字格式进行格式化
     * @private 
     * @param {Number | Number} number 数字
     * @param {String} [sLocale] 可选参数，若传入的number格式为字符串，则该参数必须传入
     * @param {String} [tLocale] 目标语言
     * @return {String}
     */
    _format: function(number, sLocale, tLocale){
        return baidu.i18n.number.format(number, sLocale, tLocale || baidu.i18n.currentLocale); 
    }
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */


/**
 * date
 * @name baidu.i18n.date
 * @Object
 * @grammar baidu.i18n.date
 */
baidu.i18n.date = baidu.i18n.date || /**@lends baidu.i18n.date.prototype*/{

    /**
     * 获取某年某个月的天数
     * @grammar baidu.i18n.date.getDaysInMonth(year, month)
     * @param {Number} year 年份.
     * @param {Number} month 月份.
     * @return {Number}
     */
    getDaysInMonth: function(year, month) {
        var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (month == 1 && baidu.i18n.date.isLeapYear(year)) {
            return 29;
        }
        return days[month];
    },

    /**
     * 判断传入年份是否时润年
     * @grammar baidu.i18n.date.isLeapYear(year)
     * @param {Number} year 年份.
     * @return {Boolean}
     */
    isLeapYear: function(year) {
        return !(year % 400) || (!(year % 4) && !!(year % 100));
    },

    /**
     * 将传入的date对象转换成指定地区的date对象
     * @grammar baidu.i18n.date.toLocaleDate(dateObject, sLocale, tLocale)
     * @param {Date} dateObject
     * @param {String} sLocale dateObject 的地区标识，可选参数，不传则以dateObject中获取的为准
     * @param {String} tLocale 地区名称简写字符.
     * @return {Date}
     */
    toLocaleDate: function(dateObject, sLocale, tLocale) {
        return this._basicDate(dateObject, sLocale, tLocale || baidu.i18n.currentLocale);
    },

    /**
     * 本地日历和格力高利公历相互转换的基础函数
     * @private
     * @param {Date} dateObject 需要转换的日期函数.
     * @param {String} sLocale dateObject 的地区标识，可选参数，否则以dateObject中获取的为准
     * @param {String} tlocale 传入date的地区名称简写字符，不传入则从date中计算得出.
     */
    _basicDate: function(dateObject, sLocale, tLocale) {
        var tTimeZone = baidu.i18n.cultures[tLocale || baidu.i18n.currentLocale].timeZone,
            tTimeOffset = tTimeZone * 60,
            sTimeZone,sTimeOffset,
            millisecond = dateObject.getTime();

        if(sLocale){
            sTimeZone = baidu.i18n.cultures[sLocale].timeZone;
            sTimeOffset = sTimeZone * 60;
        }else{
            sTimeOffset = -1 * dateObject.getTimezoneOffset();
            sTimeZone = sTimeOffset / 60;
        }

        return new Date(sTimeZone != tTimeZone ? (millisecond  + (tTimeOffset - sTimeOffset) * 60000) : millisecond);
    },

    /*
     * @格式化日期显示
     * @param {Date} dateObject  日期对象(必须)
     * @param {String} tLocale 给定目标locale(可选)
     * @return {String}  格式化后的日期字符串
     */
    format: function(dateObject, tLocale) {
        // 拿到对应locale的format类型配置
        var c = baidu.i18n.cultrues[tLocale || baidu.i18n.currentLocale];
        return baidu.date.format(
            baidu.i18n.date.toLocaleDate(dateObject, "", tLocale),
            c.calendar.dateFormat);
    }
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

/**
 * string
 * @name baidu.i18n.string
 * @Object
 * @grammar baidu.i18n.string
 */
baidu.i18n.string = baidu.i18n.string || /**@lends baidu.i18n.string.prototype*/{
    
    /**
     * 按照某种语言的格式去掉字符串两边的空白字符
     * @grammar baidu.i18n.string.trim(source, locale)
     * @param {String} source 需要格式化的语言
     * @param {String} [locale] 目标语言
     * @return {String}
     */
    trim: function(source, locale){
        var pat = baidu.i18n.cultures[locale || baidu.i18n.currentLocale].whitespace;
        return String(source).replace(pat,"");
    },

    /**
     * 将传入的字符串翻译成目标语言
     * @grammar baidu.i18n.string.translation(source, locale)
     * @param {String} source 需要进行翻译的字符串
     * @param {String} [locale] 目标语言
     * @return {String}
     */
    translation: function(source, locale){
        var tOpt = baidu.i18n.cultures[locale || baidu.i18n.currentLocale].language;

        return tOpt[source] || '';
    }

};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */











baidu.parser.Parser = baidu.parser.Parser || (function(){

    /**
     * 提供数据处理的基类方法
     * @class
     * @public
     * @param {Object} options
     * @config {String} method ‘GET’，'POST' 默认为GET
     * @config {Function} onload
     */
    return baidu.lang.createClass(function(options){
   
        var me = this,
            options = options || {};

        me._method = options.method || me._method;
        me.onload = options.onload || baidu.fn.blank;

    },{
        type: 'baidu.parser.Parser'
    }).extend({
        /**
         *  @lends baidu.parser.Parser.prototype
         */

        _dom: null,

        _isLoad: false,

        _method: 'GET',

        /**
         * 将通过xpath query的数据缓存起来
         * @private
        */
        _queryData: {},

        _type: '',
   
        /**
         * 加载数据，支持xml，json，html
         * @public
         * @param {String} dataString
        */
        load: function(dataString){
            var me = this;
           
            if(typeof dataString == 'undefined'){
                return;
            }

            me._isLoad = false;
            if(me._parser(dataString)){
                me._queryData = {};
                me._isLoad = true;
                me.dispatchEvent('onload');
            }
        },
   
        /**
         * 加载数据片段
         * @public
         * @param {String} fileSrc
         * @param {String} method 'GET','POST'
         * @param {String} data
         */
        loadUrl: function(fileSrc, method, data){
            var me = this,
                fileSrc = fileSrc || '',
                method = method || me._method,
                data = data || '',
                onsuccess = function(xhr, responseText){
                    if(me._parser(responseText)){
                        me._isLoad = true;
                        me._queryData = {};
                        me.dispatchEvent('onload');
                    }
                };
            
            me._isLoad = false;
            method == 'GET' ? baidu.ajax.get(fileSrc, onsuccess) : baidu.ajax.post(fileSrc, data, onsuccess);
        },

        /**
         * 通过xpath获取所需要的数据，支持html,json,xml
         * @public
         * @param {String} path
         * @param {Boolean} 是否使用之前的缓存
         * @return {Object}
        */
        query: function(path, cache){
            var me = this,
                path = path || '/',
                cache = !(cache === false),
                result = [];
    
            if(!me._isLoad)
                return result;

            if(cache && me._queryData[path]) return me._queryData[path];

            result = me._query(path);
            me._queryData[path] = result;

            return result;
        },
  
        /**
         * @private
         * @param {String} path
         * @return {Array}
         */
        _query: function(path){
            return [];
        },
        
        /**
         * 转换数据
         * @private
         * @param {String|Object} str
         * @return {Boolean}
         */
        _parser: function(){
            return false;         
        },

        /**
         * 获取数据跟节点
         * @public
         * @return {HTMLElement}
        */
        getRoot: function(){
            return this._dom;        
        }, 

        /**
         * 获取parser的类型
         * @return {baidu.parser.type}
         */
        getType: function(){
            return this._type;         
        }
    });
})();
/*
   JPath 1.0.5 - json equivalent to xpath
   Copyright (C) 2009-2011  Bryan English <bryan at bluelinecity dot com>

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

   Usage:      
      var jpath = new JPath( myjsonobj );

      var somevalue = jpath.$('book/title').json;  //results in title
         //or
      var somevalue = jpath.query('book/title');   //results in title

   Supported XPath-like Syntax:
      /tagname
      //tagname
      tagname
      * wildcard
      [] predicates
      operators ( >=, ==, <= )
      array selection
      .. 	         
      *
      and, or
      nodename[0]
      nodename[last()]
      nodename[position()]
      nodename[last()-1]
      nodename[somenode > 3]/node
      nodename[count() > 3]/node

   Tested With:
      Firefox 2-3, IE 6-7
   
   Update Log:
      1.0.1 - Bugfix for zero-based element selection
      1.0.2 - Bugfix for IE not handling eval() and returning a function
      1.0.3 - Bugfix added support for underscore and dash in query() function
                  Bugfix improper use of Array.concat which was flattening arrays
                  Added support for single equal sign in query() function
                  Added support for count() xpath function
                  Added support for and, or boolean expression in predicate blocks
                  Added support for global selector $$ and //
                  Added support for wildcard (*) selector support 
	  1.0.4 - Changed to MIT license
	  1.0.5 - Bugfix for greedy regexp
*/

function JPath( json, parent )
{ 
    this.json = json; 
    this._parent = parent; 
}

JPath.prototype = {

   /*
      Property: json
      Copy of current json segment to operate on
   */
   json: null,
   
   /*
      Property: parent
      Parent json object, null if root.
   */
   parent: null,

   /*
      Method: $
      Performs a find query on the current jpath object.

      Parameters:
        str - mixed, find query to perform. Can consist of a nodename or nodename path or function object or integer.

      Return:
        jpath - Returns the resulting jpath object after performing find query.

   */
   '$': function ( str )
   {
      var result = null;
      var working = this;
      
      if ( this.json && str !== null )
      {
         switch ( typeof(str) )
         {
            case 'function':
               result = this.f(str).json;
            break;

            case 'number':
               result = this.json[str] || null;
            break;

            case 'string':
               var names = str.split('/');     

               //foreach slash delimited node name//
               for ( var i=0; i<names.length ; i++ )
               {
                  var name = new RegExp('^' + names[i].replace(/\*/g,'.*') + '$');                  
                  var isArray = (working.json instanceof Array);
                  var a = new Array();
                  
                  //foreach working node property//
                  for ( var p in working.json )
                  {
                     if ( typeof( working.json[p] ) != 'function' )
                     {
                        if ( isArray && (arguments.callee.caller != this.$$) )
                        {
                           a = a.concat( this.findAllByRegExp( name, working.json[p] ) );
                        }
                        else if ( name.test(p) )
                        {                        
                           a.push( working.json[p] );
                        }
                     }                  
                  }

                  working = new JPath( ( a.length==0 ? null : ( ( a.length == 1) ? a[0] : a ) ), working );
               }

               return working;
            break;
         }   
      }
      
      return new JPath( result, this );
   },

   /*
      Method: $$
      Performs a global, recursive find query on the current jpath object.

      Parameters:
        str - mixed, find query to perform. Can consist of a nodename or nodename path or function object or integer.

      Return:
        jpath - Returns the resulting jpath object after performing find query.

   */   
   '$$': function( str )
   {   
      var r = this.$(str,true).json;
      var arr = new Array();
      
      if ( r instanceof Array ) 
         arr = arr.concat(r); 
      else if ( r !== null )
         arr.push(r);
         
      for ( var p in this.json )
      {
         if ( typeof( this.json[p] ) == 'object' )
         {
            arr = arr.concat( new JPath( this.json[p], this ).$$(str).json );
         }
      }
      
      return new JPath( arr, this );
   },
   
   /*
      Method: findAllByRegExp
      Looks through a list of an object properties using a regular expression

      Parameters:
         re - regular expression, to use to search with
         obj - object, the object to search through

      Returns:
         array - resulting properties
   */
   findAllByRegExp: function( re, obj )
   {
      var a = new Array();
   
      for ( var p in obj )
      {
         if ( obj instanceof Array )
         {
            a = a.concat( this.findAllByRegExp( re, obj[p] ) );
         }
         else if ( typeof( obj[p] ) != 'function' && re.test(p) )
         {
            a.push( obj[p] );
         }
      }

      return a;
   },

   /*
      Method: query (beta)
      Performs a find query on the current jpath object using a single string similar to xpath. This method
      is currently expirimental.

      Parameters:
        str - string, full xpath-like query to perform on the current object.

      Return:
        mixed - Returns the resulting json value after performing find query.

   */
   query: function( str )
   {
      var re = {
         " and ":" && ",
         " or ":" || ",
         "([\\#\\*\\@a-z\\_][\\*a-z0-9_\\-]*)(?=(?:\\s|$|\\[|\\]|\\/))" : "\$('$1').",
         "\\[([0-9])+\\]" : "\$($1).",
         "\\.\\." : "parent().",
         "\/\/" : "$",
         "(^|\\[|\\s)\\/" : "$1root().",
         "\\/" : '',
         "([^\\=\\>\\<\\!])\\=([^\\=])" : '$1==$2',
         "\\[" : "$(function(j){ with(j){return(",
         "\\]" : ");}}).",
         "\\(\\.":'(',
         "(\\.|\\])(?!\\$|\\p)":"$1json",
         "count\\(([^\\)]+)\\)":"count('$1')"
      };

      //save quoted strings//
      var quotes = /(\'|\")([^\1]*?)\1/;
      var saves = new Array();
      while ( quotes.test(str) )
      {
         saves.push( str.match(quotes)[2] ); 
         str = str.replace(quotes,'%'+ (saves.length-1) +'%');
      }

      for ( var e in re )
      {
         str = str.replace( new RegExp(e,'ig'), re[e] );
      }
      //alert('this.' + str.replace(/\%(\d+)\%/g,'saves[$1]') + ";");
      return eval('this.' + str.replace(/\%(\d+)\%/g,'saves[$1]') + ";");
   },

   /*
      Method: f
      Performs the equivilant to an xpath predicate eval on the current nodeset.

      Parameters:
        f - function, an iterator function that is executed for every json node and is expected to return a boolean
        value which determines if that particular node is selected. Alternativly you can submit a string which will be
        inserted into a prepared function.

      Return:
        jpath - Returns the resulting jpath object after performing find query.

   */
   f: function ( iterator )
   {
      var a = new Array();

      if ( typeof(iterator) == 'string' )
      {
         eval('iterator = function(j){with(j){return('+ iterator +');}}');
      }

      for ( var p in this.json )
      {
         var j = new JPath(this.json[p], this);
         j.index = p;
         if ( iterator( j ) )
         {
            a.push( this.json[p] );
         }
      }

      return new JPath( a, this );
   },

   /*
      Method: parent
      Returns the parent jpath object or itself if its the root node

      Return:
        jpath - Returns the parent jpath object or itself if its the root node

   */
   parent: function()
   {
      return ( (this._parent) ? this._parent : this );
   },

   /*
      Method: position
      Returns the index position of the current node. Only valid within a function or predicate

      Return:
        int - array index position of this json object.
   */
   position: function()
   {
      return this.index;
   },

   /*
      Method: last
      Returns true if this is the last node in the nodeset. Only valid within a function or predicate

      Return:
        booean - Returns true if this is the last node in the nodeset
   */
   last: function()
   {
      return (this.index == (this._parent.json.length-1));
   },

   /*
      Method: count
      Returns the count of child nodes in the current node

      Parameters:
         string - optional node name to count, defaults to all
      
      Return:
        booean - Returns number of child nodes found
   */
   count: function(n)
   {
      var found = this.$( n || '*').json;         
      return ( found ? ( found instanceof Array ? found.length : 1 ) : 0 );
   },

   /*
      Method: root
      Returns the root jpath object.

      Return:
        jpath - The top level, root jpath object.
   */
   root: function ()
   {
      return ( this._parent ? this._parent.root() : this );
   }

};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */









baidu.parser.Json = baidu.parser.Json || (function(){

    /**
     * JSON操作解析器
     * @public
     * @class
     */
    return function(options){
        
        var parser = new baidu.parser.Parser(options);
        parser._type = baidu.parser.type.JSON;

        baidu.extend(parser, {
       
            _jPath: null,

           /**
            * 转换数据
            * @private
            * @param {String|Object} JSON
            * @return {Boolean}
            */
            _parser: function(JSON){
                var me = this;

                if(baidu.lang.isString(JSON)){

                    try{
                        JSON = baidu.json.parse(JSON);
                    }catch(e){
                        return false;
                    }   
                }

                me._jPath = new JPath(JSON);
                me._dom = me._jPath.root();
                return true;
            },

            /**
             * 使用JPath获取数据并返回
             * @public
             * @param {String} Path
             * @return {Array}
             */
            _query: function(JPath){
                var me = this;
                return me._jPath ? me._jPath.query(JPath) : [];
            }

        });
        return parser;
    };
})();
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */






baidu.parser.Xml = baidu.parser.Xml || (function(){

    var AXO = window.ActiveXObject;
    var IMP = document.implementation && document.implementation.createDocument;

    function _createXMLDOM(){
       return new ActiveXObject('Microsoft.XMLDOM');
    };

    /**
     * 加载xmlString
     * @private
     * @param {XMLHttpRequest|DOMParser} DOMParser
     * @param {String} xmlString xml字符串数据
     * @return {XMLRoot}
     */
    function _loadXMLString(DOMParser, xmlString){
        if(AXO){
            DOMParser.async = false;
            DOMParser.loadXML(xmlString);
            DOMParser.setProperty("SelectionNamespaces", "xmlns:xsl='http://www.w3.org/1999/XSL/Transform'");
            DOMParser.setProperty("SelectionLanguage", "XPath");
            return DOMParser.documentElement;
        }else if(IMP){
            return DOMParser.parseFromString(xmlString, 'text/xml');
        }
    };

    /**
     * xml操作解析器
     * @public
     * @class
     */
    return function(options){
        
        var parser = new baidu.parser.Parser(options);
        parser._type = baidu.parser.type.XML;

        baidu.extend(parser, {
    
            _DOMParser: null,
         
            /**
             * 将字符串转换为XMLDOM
             * @private
             * @param {String} XMLString
             * @return {Boolean}
             */
            _parser: function(XMLString){
                var me = this;

                if(!me._DOMParser){
                    IMP && (me._DOMParser = new DOMParser());
                    AXO && (me._DOMParser = _createXMLDOM());
                }

                me._dom = _loadXMLString(me._DOMParser, XMLString);
                
                return me._dom ? true : false; 
            },

            /**
            * 使用xpath获取数据
            * @public
            * @param {String} XPath
            * @return {Array}
            */
            _query: function(XPath){
                var me = this,
                    result = [],
                    nod = null,
                    tmpResult;

                if(AXO){
                    result = me.getRoot().selectNodes(XPath);
                }else if(IMP){
                    tmpResult = me.getRoot().evaluate(XPath, me.getRoot(), null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                    while((nod = tmpResult.iterateNext()) != null) {   
                        result.push(nod);
                    }
                }
    
                return result;
            }
        });

        return parser;
    };

})();

/**
 * 各种页面的UI组件
 * @namespace baidu.ui
 */
baidu.ui = baidu.ui || { version: '1.3.9' };
/*
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 通过uiType找到UI类
 * @function
 * @grammar baidu.ui.getUI(uiType)
 * @param  {String} uiType  查找规则：suggestion -> baidu.ui.Suggestion，toolbar-spacer -> baidu.ui.Toolbar.Spacer.
 * @return {object} UI类
 * @author berg
 */
baidu.ui.getUI = function(uiType){
    var uiType = uiType.split('-'),
        result = baidu.ui,
        len = uiType.length,
        i = 0;

    for (; i < len; i++) {
        result = result[uiType[i].charAt(0).toUpperCase() + uiType[i].slice(1)];
    }
    return result;
};
/*
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 */





/**
 * 创建一个ui控件
 * @function
 * @grammar baidu.ui.create(UI, options)
 * @param {object|String} UI控件类或者uiType
 * @param {object} options optional 控件的初始化属性
 * @config {Boolean} autoRender 是否自动render，默认true
 * @config {String|HTMLElement} render render到的元素
 * @config {Object} parent 父控件
 * @return {Object} 创建好的控件实例
 * @author berg
 */
baidu.ui.create = function(UI, options){
    if(baidu.lang.isString(UI)){
        UI = baidu.ui.getUI(UI);
    }
    return new UI(options);
};
/*
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 */












/**
 * UI基类，所有的UI都应该从这个类中派生出去
 * @name baidu.ui.Base
 * @grammar baidu.ui.Base
 * @class
 * @return {baidu.ui.Base}
 * @author berg
 */
baidu.ui.Base = 
/**
 * @lends baidu.ui.Base.prototype
 */
{

    id : "",

    /**
     * 获得当前控件的id
     * @param {string} optional key 
     * @return {string} id
     */
    getId : function(key){
        var ui = this, idPrefix;
        //通过guid区别多实例
        idPrefix = "tangram-" + ui.uiType + '--' + (ui.id ? ui.id : ui.guid);
        return key ? idPrefix + "-" + key : idPrefix;
    },

    /**
     * 获得class，支持skin
     *
     * @param {string} optional key
     *
     * @return {string} className
     */
    getClass : function(key){
        var me = this,
            className = me.classPrefix,
            skinName = me.skin;
         if (key) {
             className += '-' + key;
             skinName += '-' + key;
         }
         if (me.skin) {
             className += ' ' + skinName;
         }
         return className;
    },

    getMain : function(){
        return baidu.g(this.mainId);
    },

    getBody : function(){
        return baidu.g(this.getId());
    },

    
    /**
     * 控件类型：如dialog
     */
    uiType : "",
    
    /**
     * 获取调用的字符串的引用前缀
     */
    getCallRef : function(){
        return "window['$BAIDU$']._instances['" + this.guid + "']";
    },

    /**
     * 获取调用的字符串
     */
    getCallString : function(fn){
        var i = 0,
            arg = Array.prototype.slice.call(arguments, 1),
            len = arg.length;
        for (; i < len; i++) {
            if (typeof arg[i] == 'string') {
                arg[i] = "'" + arg[i] +"'";
            }
        }
        //如果被闭包包起来了，用baidu.lang.instance会找到最外面的baidu函数，可能出错
        return this.getCallRef() 
                + '.' + fn + '('
                + arg.join(',') 
                + ');'; 
    },

    /**
     * 添加事件. 避免析构中漏掉注销事件.
     * @param {HTMLElement|string|window} element 目标元素或目标元素id
     * @param {string} type 事件类型
     * @param {Function} listener 需要添加的监听器
     */
    on : function(element, type, listener){
        baidu.on(element, type, listener);
        this.addEventListener("ondispose", function(){
            baidu.un(element, type, listener);
        });
    },

    /**
     * 渲染控件到指定的元素
     * @param {HTMLElement} main optional   要渲染到的元素，可选。
     *                                      如果不传此参数，则会在body下创建一个绝对定位的div做为main
     * @return  {HTMLElement} main 渲染到的元素
     */
    renderMain : function(main){
        var ui = this,
            i = 0,
            len;
        //如果被渲染过就不重复渲染
        if (ui.getMain()) {
            return ;
        }
        main = baidu.g(main);
        //如果没有main元素，创建一个在body下面的div当作main
        if(!main){
            main = document.createElement('div');
            document.body.appendChild(main);
            main.style.position = "absolute";
            //给这个元素创建一个class，方便用户控制
            main.className = ui.getClass("main");
        }
        if(!main.id){
            main.id = ui.getId("main");
        }
        ui.mainId = main.id;
        main.setAttribute('data-guid', ui.guid);

        return main;
    },

    /**
     * 销毁当前实例
     */
    dispose : function(){
        this.dispatchEvent("dispose");
        baidu.lang.Class.prototype.dispose.call(this);
    }
};
/*
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 */







/**
 * 创建一个UI控件类
 * @function
 * @grammar baidu.ui.createUI(constructor, options)
 * @param {Function} constructor ui控件构造器
 * @param {Object} options 选项
 * @return {Object} ui控件
 */
baidu.ui.createUI = function(constructor, options) {
    options = options || {};
    var superClass = options.superClass || baidu.lang.Class,
        lastInherit = superClass == baidu.lang.Class ? 1 : 0,
        i,
        n,
        ui = function(opt, _isInherits){// 创建新类的真构造器函数
            var me = this;
            opt = opt || {};
            // 继承父类的构造器，将isInherits设置成true，在后面不执行render操作
            superClass.call(me, !lastInherit ? opt : (opt.guid || ""), true);

            //扩展静态配置到this上
            baidu.object.extend(me, ui.options);
            //扩展当前options中的项到this上
            baidu.object.extend(me, opt);
            //baidu.object.merge(me, opt, {overwrite:true, recursive:true});

            me.classPrefix = me.classPrefix || "tangram-" + me.uiType.toLowerCase();

            //初始化行为
            //行为就是在控件实例上附加一些属性和方法
            for(i in baidu.ui.behavior){
                //添加行为到控件上
                if(typeof me[i] != 'undefined' && me[i]){
                    baidu.object.extend(me, baidu.ui.behavior[i]);
                    if(baidu.lang.isFunction(me[i])){
                        me.addEventListener("onload", function(){
                            baidu.ui.behavior[i].call(me[i].apply(me));
                        });
                    }else{
                        baidu.ui.behavior[i].call(me);
                    }
                }
            }

            //执行控件自己的构造器
            constructor.apply(me, arguments);

            //执行插件的构造器
            for (i=0, n=ui._addons.length; i<n; i++) {
                ui._addons[i](me);
            }
            if(opt.parent && me.setParent){
                me.setParent(opt.parent);
            }
            if(!_isInherits && opt.autoRender){ 
                me.render(opt.element);
            }
        },
        C = function(){};

    C.prototype = superClass.prototype;

    //继承父类的原型链
    var proto = ui.prototype = new C();

    //继承Base中的方法到prototype中
    for (i in baidu.ui.Base) {
        proto[i] = baidu.ui.Base[i];
    }

    /**
     * 扩展控件的prototype
     * 
     * @param {Object} json 要扩展进prototype的对象
     *
     * @return {Object} 扩展后的对象
     */
    ui.extend = function(json){
        for (i in json) {
            ui.prototype[i] = json[i];
        }
        return ui;  // 这个静态方法也返回类对象本身
    };

    //插件支持
    ui._addons = [];
    ui.register = function(f){
        if (typeof f == "function")
            ui._addons.push(f);
    };
    
    //静态配置支持
    ui.options = {};
    
    return ui;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

//依赖包

























/**
 * Dialog基类，建立一个dialog实例
 * @class Dialog类
 * @grammar new baidu.ui.Dialog(options)
 * @param     {Object}        options               选项
 * @config    {DOMElement}    content               要放到dialog中的元素，如果传此参数时同时传contentText，则忽略contentText。
 * @config    {String}        contentText           dialog中的内容
 * @config    {String|Number} width                 内容区域的宽度，默认值为400，注意，这里的内容区域指getContent()得到元素的区域，不包含title和footer。
 * @config    {String|Number} height                内容区域的高度，默认值为300
 * @config    {String|Number} top                   dialog距离页面上方的距离
 * @config    {String|Number} left                  dialog距离页面左方的距离
 * @config    {String}        titleText             dialog标题文字
 * @config    {String}        classPrefix           dialog样式的前缀
 * @config    {Number}        zIndex                dialog的zIndex值，默认值为1000
 * @config    {Function}      onopen                dialog打开时触发
 * @config    {Function}      onclose               dialog关闭时触发
 * @config    {Function}      onbeforeclose         dialog关闭前触发，如果此函数返回false，则组织dialog关闭。
 * @config    {Function}      onupdate              dialog更新内容时触发
 * @config    {Boolean}       closeOnEscape         keyboardSupport模块提供支持，当esc键按下时关闭dialog。
 * @config    {String}        closeText             closeButton模块提供支持，关闭按钮上的title。
 * @config    {Boolean}       modal                 modal模块支持，是否显示遮罩
 * @config    {String}        modalColor            modal模块支持，遮罩的颜色
 * @config    {Number}        modalOpacity          modal模块支持，遮罩的透明度
 * @config    {Number}        modalZIndex           modal模块支持，遮罩的zIndex值
 * @config    {Boolean}       draggable             draggable模块支持，是否支持拖拽
 * @config    {Function}      ondragstart           draggable模块支持，当拖拽开始时触发
 * @config    {Function}      ondrag                draggable模块支持，拖拽过程中触发
 * @config    {Function}      ondragend             draggable模块支持，拖拽结束时触发
 * @plugin    autoDispose		支持关闭后自动销毁组建
 * @plugin    button			Dialog底部按钮
 * @plugin    closeButton		支持关闭按钮
 * @plugin    coverable			支持遮盖页面的任意元素
 * @plugin    draggable       	支持被拖拽
 * @plugin    iframe	      	支持创建的content是一个iframe
 * @plugin    keyboard	      	键盘支持插件
 * @plugin    modal		      	背景遮罩插件
 * @plugin    resizable		    缩放功能插件
 */

baidu.ui.Dialog = baidu.ui.createUI(function (options){

    var me = this;
    me._content = 'initElement';
    me.content = me.content || null;
    
    me._contentText = 'initText';
    me.contentText = me.contentText || '';
    
    me._titleText = 'initText';
    me.titleText = me.titleText || '';

}).extend(
/**
 *  @lends baidu.ui.Dialog.prototype
 */
{
    //ui控件的类型，传入给UIBase **必须**
    uiType: 'dialog',
    //ui控件的class样式前缀 可选
    //classPrefix     : "tangram-dialog-",

    width: '',
    height: '',

    top: 'auto',
    left: 'auto',
    zIndex: 1000,//没有做层管理
    //用style来保证其初始状态，不会占据屏幕的位置
    tplDOM: "<div id='#{id}' class='#{class}' style='position:relative'>#{title}#{content}#{footer}</div>",
    tplTitle: "<div id='#{id}' class='#{class}'><span id='#{inner-id}' class='#{inner-class}'>#{content}</span></div>",
    tplContent: "<div id='#{id}' class='#{class}' style='overflow:hidden; position:relative'>#{content}</div>",
    tplFooter: "<div id='#{id}' class='#{class}'></div>",

    /**
     * 查询当前窗口是否处于显示状态
     * @public
     * @return {Boolean}  是否处于显示状态
     */
    isShown: function() {
        return baidu.ui.Dialog.instances[this.guid] == 'show';
    },
    
    /**
     * 获取dialog的HTML字符串
     * @private
     * @return {String} DialogHtml
     */
    getString: function() {
        var me = this,
            html,
            title = 'title',
            titleInner = 'title-inner',
            content = 'content',
            footer = 'footer';

        return baidu.format(me.tplDOM, {
            id: me.getId(),
            'class' : me.getClass(),
            title: baidu.format(
                me.tplTitle, {
                    id: me.getId(title),
                    'class' : me.getClass(title),
                    'inner-id' : me.getId(titleInner),
                    'inner-class' : me.getClass(titleInner),
                    content: me.titleText || ''
                }),
            content: baidu.format(
                me.tplContent, {
                    id: me.getId(content),
                    'class' : me.getClass(content),
                    content: me.contentText || ''
                }),
            footer: baidu.format(
                me.tplFooter, {
                    id: me.getId(footer),
                    'class' : me.getClass(footer)
            })
        });
    },

    /**
     * 绘制dialog到页面
	 * @public
     * @return {HTMLElement} mainDiv
     */
    render: function() {
        var me = this,
            main;

        //避免重复render
        if (me.getMain()) {
            return;
        }

        main = me.renderMain();

        //main.style.left =  '-10000em';
        main.innerHTML = me.getString();
        me._update();
        me._updatePosition();

        baidu.dom.setStyles(me.getMain(), {
            position: 'absolute',
            zIndex: me.zIndex,
            marginLeft: '-100000px'
        });
        //当居中时，窗口改变大小时候要重新计算位置
        me.windowResizeHandler = me.getWindowResizeHandler();
        me.on(window, 'resize', me.windowResizeHandler);

        me.dispatchEvent('onload');

        return main;
    },
    
    /**
     * 更新title，和content内容函数
     * @private
     * @param {Object} options 传入参数
     * @return null
     */
    _update:function(options){
        var me = this,
            content = me.getContent(),
            options = options || {},
            title = me.getTitleInner(),
            setText = false;
      
        if(typeof options.titleText != 'undefined'){
            //当options中存在titleText时,认为用户需要更新titleText，直接更新
            title.innerHTML = options.titleText;
            me.titleText = me._titleText = options.titleText;
        }else if (me.titleText != me._titleText){
            //当第一次创建dialog时，无论是否传入titleText，都会走入该分支
            //之后若采用dialog.titleText = '***'；dialog.update();方式更新，也会进入该分支
            title.innerHTML = me.titleText;
            me._titleText = me.titleText;
        } 

        //content优先级大于contentText
        if(typeof options.content != 'undefined'){
            //当options中存在content，认为用户需要更新content,直接更新
            content.innerHTML = '';
            me.content = options.content;
            //若content为null。则代表删除content属性
            if(options.content !== null){
                content.appendChild(options.content);
                me.content = me._content = content.firstChild;
                me.contentText = me._contentText = content.innerHTML;
                return;
            }
            setText = true;
        }else if(me.content !== me._content){
            //第一次new dialog时，进入该分支
            //若采用dialog.content = HTMLElement;dialog.update();的方式进行更新，进去该分支
            content.innerHTML = '';
            if(me.content !== null){
                content.appendChild(me.content);
                me.content = me._content = content.firstChild;
                me.contentText = me._contentText = content.innerHTML;
                return;
            }
            setText = true;
        }

        if(typeof options.contentText != 'undefined'){
            //当options中存在contentText，则认为用户要更新contentText，直接更新
            content.innerHTML = options.contentText;
            me.contentText = me._contentText = options.contentText;
            me.content = me._content = content.firstChild;
        }else if((me.contentText != me._contentText) || setText){
            //当new dialog时，无论是否传入contentText,都会进入该分支
            //若才用dialog.contentText = '***';dialog.update()进行更新，也会进入该分支
            content.innerHTML = me.contentText;
            me._contentText = me.contentText;
            me.content = me._content = content.firstChild;
        }
        
        delete(options.content);
        delete(options.contentText);
        delete(options.titleText);
        baidu.extend(me,options);
    },

    /**
     * 获得resize事件绑定的函数
     * @private
     * @return {Function}
     */
    getWindowResizeHandler: function() {
        var me = this;
        return function() {
            me._updatePosition();
        };
    },

    /**
     * 显示当前dialog
	 * @public
     */
    open: function() {
        var me = this;
        me._updatePosition();    
        me.getMain().style.marginLeft = 'auto';
        baidu.ui.Dialog.instances[me.guid] = 'show';
        me.dispatchEvent('onopen');
    },

    /**
     * 隐藏当前dialog
	 * @public
     */
    close: function() {
        var me = this;
        if (me.dispatchEvent('onbeforeclose')) {
            me.getMain().style.marginLeft = '-100000px';
            baidu.ui.Dialog.instances[me.guid] = 'hide';

            me.dispatchEvent('onclose');
        }
    },

	/**
     * 更新dialog状态 
	 * @public
     * @param     {Object}        options               选项参数
     * @config    {DOMElement}    content               要放到dialog中的元素，如果传此参数时同时传contentText，则忽略contentText。
     * @config    {String}        contentText           dialog中的内容
     * @config    {String|Number} width                 内容区域的宽度，默认值为400，注意，这里的内容区域指getContent()得到元素的区域，不包含title和footer。
     * @config    {String|Number} height                内容区域的高度，默认值为300
     * @config    {String|Number} top                   dialog距离页面上方的距离
     * @config    {String|Number} left                  dialog距离页面左方的距离
     * @config    {String}        titleText             dialog标题文字
     * @config    {String}        classPrefix           dialog样式的前缀
     * @config    {Number}        zIndex                dialog的zIndex值，默认值为1000
     * @config    {Function}      onopen                dialog打开时触发
     * @config    {Function}      onclose               dialog关闭时触发
     * @config    {Function}      onbeforeclose         dialog关闭前触发，如果此函数返回false，则组织dialog关闭。
     * @config    {Function}      onupdate              dialog更新内容时触发
     * @config    {Boolean}       closeOnEscape         keyboardSupport模块提供支持，当esc键按下时关闭dialog。
     * @config    {String}        closeText             closeButton模块提供支持，关闭按钮上的title。
     * @config    {Boolean}       modal                 modal模块支持，是否显示遮罩
     * @config    {String}        modalColor            modal模块支持，遮罩的颜色
     * @config    {Number}        modalOpacity          modal模块支持，遮罩的透明度
     * @config    {Number}        modalZIndex           modal模块支持，遮罩的zIndex值
     * @config    {Boolean}       draggable             draggable模块支持，是否支持拖拽
     * @config    {Function}      ondragstart           draggable模块支持，当拖拽开始时触发
     * @config    {Function}      ondrag                draggable模块支持，拖拽过程中触发
     * @config    {Function}      ondragend             draggable模块支持，拖拽结束时触发
     */
    update: function(options) {
        var me = this;
        me._update(options);
        me._updatePosition();
        me.dispatchEvent('onupdate');
    },

    /**
     * 获取body的寛高
     * @private
     * @return {Object} {width,height}，名值对
     */
    _getBodyOffset: function() {
        var me = this,
            bodyOffset,
            body = me.getBody(),
            content = me.getContent(),
            title = me.getTitle(),
            footer = me.getFooter();

        bodyOffset = {
            'width' : 0,
            'height' : 0
        };

        //确定取值为数字
        function getStyleNum(d,style) {
            var result = parseFloat(baidu.getStyle(d, style));
            result = isNaN(result) ? 0 : result;
            result = baidu.lang.isNumber(result) ? result : 0;
            return result;
        }
        //fix margin
        baidu.each(['marginLeft', 'marginRight'], function(item,index) {
            bodyOffset['width'] += getStyleNum(content, item);
        });

        bodyOffset['height'] += title.offsetHeight + getStyleNum(title, 'marginTop');
        bodyOffset['height'] += footer.offsetHeight + getStyleNum(footer, 'marginBottom');

        //fix margin
        var mt = getStyleNum(content, 'marginTop'), md = getStyleNum(title, 'marginBottom');
        bodyOffset['height'] += mt >= md ? mt : md;
        mt = getStyleNum(footer, 'marginTop'), md = getStyleNum(content, 'marginBottom');
        bodyOffset['height'] += mt >= md ? mt : md;

        return bodyOffset;
    },

    /**
     * 更新dialog位置及内部元素styles
     * @private
     * @return void
     * */
    _updatePosition: function() {
        var me = this,
        	bodyOffset,
            top = '',
            right = '',
            bottom = '',
            left = '',
            content = me.getContent(),
            body = me.getBody(),
            width,height;

        /*
         * 添加默认值支持
         * 当me.width或者me.height没有设置有效值时，不对其进行计算
         *
         * 暂不支持百分比形式的寛高计算
         * 在render或者window resize时保证content上的寛高必有值
         * TODO resizable如何适应dialog有默认值时的计算方法
         * 
         * 在webkit中，为保持dom的完整性，浏览器会自己计算一下css值
         * 例如：
         * content的属性为: 
         *  width:100px
         *  marginLeft:5px
         *  marginRight:5px
         *
         * body的属性为：
         *  width:110px
         *
         * 此时更改content的width值为90px
         * 在webkit中，取content的marginLeft和marginRight值分别是5px，15px
         * 而不是原有的5px，5px
         *
         * 针对这个问题，调成程序执行顺序，先取得所有相关的css属性值
         * 之后更改content的寛高，再根据content当前的offset值与之前取得的属性值进行计算，获取body的寛高值
         */

        width = parseFloat(me.width);
        height = parseFloat(me.height);
        
        bodyOffset = me._getBodyOffset();
        
        baidu.lang.isNumber(width) && baidu.dom.setOuterWidth(content,width);
        baidu.lang.isNumber(height) && baidu.dom.setOuterHeight(content,height);

        bodyOffset.width += content.offsetWidth;
        bodyOffset.height += content.offsetHeight;

        me.width && baidu.setStyle(body, 'width', bodyOffset.width);
        me.height && baidu.setStyle(body, 'height', bodyOffset.height);

        if ((me.left && me.left != 'auto') || (me.right && me.right != 'auto')) {
            //按照用户的值来设置
            left = me.left || '';
            right = me.right || '';
        } else {
            //自动居中
            left = Math.max((baidu.page.getViewWidth() - parseFloat(me.getMain().offsetWidth)) / 2 + baidu.page.getScrollLeft(), 0);
        }
        //下面的代码是上面代码的重复
        if ((me.top && me.top != 'auto') || (me.bottom && me.bottom != 'auto')) {
            top = me.top || '';
            bottom = me.bottom || '';
        } else {
            top = Math.max((baidu.page.getViewHeight() - parseFloat(me.getMain().offsetHeight)) / 2 + baidu.page.getScrollTop(), 0);
        }

        baidu.dom.setStyles(me.getMain(), {
            top: top,
            right: right,
            bottom: bottom,
            left: left
        });
    },

    /**
     * 获得title对应的dom元素
     * @public
     * @return {HTMLElement} title
     */
    getTitle: function() {
        return baidu.g(this.getId('title'));
    },

    /**
     * 获得title文字对应的dom元素
     * @public
     * @return {HTMLElement} titleInner
     */
    getTitleInner: function() {
        return baidu.g(this.getId('title-inner'));
    },

    /**
     * 获得content对应的dom元素
     * @public
     * @return {HTMLElement} content
     */
    getContent: function() {
        return baidu.g(this.getId('content'));
    },

    /**
     * 获得footer对应的dom元素
     * @public
     * @return {HTMLElement} footer
     */
    getFooter: function() {
        return baidu.g(this.getId('footer'));
    },

    /**
     * 销毁dialog实例
	 * @public
     */
    dispose: function() {
        var me = this;

        //删除实例引用
        delete baidu.ui.Dialog.instances[me.guid];
        me.dispatchEvent('dispose');
        baidu.dom.remove(me.getMain());
        baidu.lang.Class.prototype.dispose.call(me);
    }
});

baidu.ui.Dialog.instances = baidu.ui.Dialog.instances || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: ui/behavior.js
 * author: berg
 * version: 1.0.0
 * date: 2010/09/07
 */


/**
 * @namespace baidu.ui.behavior 为各个控件增加装饰器
 */
baidu.ui.behavior = baidu.ui.behavior || {};
/**
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 为ui控件提供resize的行为
 */
(function() {
    var Resizable = baidu.ui.behavior.resizable = function() {};

    Resizable.resizeableHandle = null;
    
    /**
     * 更新reiszable设置
     * 创建resize handle
     * @param {Object} options
     * @see baidu.dom.resizable
     * @return baidu.dom.resizable
     */
    Resizable.resizeCreate = function(options) {
        var me = this, target;
        options = options || {};
        if (!me.resizable) {
            return;
        }

        baidu.object.extend(me, options);
        me._resizeOption = {
            onresizestart: function() {
                me.dispatchEvent('onresizestart');
            },
            onresize: function(styles) {
                me.dispatchEvent('onresize', styles);
            },
            onresizeend: function() {
                me.dispatchEvent('onresizeend');
            }
        };
        baidu.each(['minWidth', 'minHeight', 'maxWidth', 'maxHeight'], function(item,index) {
            me[item] && (me._resizeOption[item] = me[item]);
        });

        me._resizeOption.classPrefix = options.classPrefix || me.classPrefix;
        target = options.target || me.getBody();
        me.direction && (me._resizeOption.direction = me.direction);
        me.resizeableHandle = baidu.dom.resizable(target, me._resizeOption);
    };

    /**
     * 更新resizeable handle
     * @public
     * @param {Object} options
     * @return null
     */
    Resizable.resizeUpdate = function(options){
        this.resizeableHandle.update(options); 
    };

    /**
     * 取消resizeable功能
     * @public
     * @return null
     */
    Resizable.resizeCancel = function(){
        this.resizeableHandle.cancel();
    };

    /**
     * 激活resizeable
     * @public 
     * @return null
     */
    Resizable.resizeEnable = function(){
        this.resizeableHandle.enable();
    };
})();
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */






/**
 * 为Dialog添加缩放功能
 * @name baidu.ui.Dialog.Dialog$resizable
 * @addon baidu.ui.Dialog
 * @param {Number} minWidth 可选，最小宽度.
 * @param {Number} minHeight 可选，最小高度.
 * @param {Boolean} resizable 可选，是否启用resizable.
 * @param {Array} direction 可选，允许resize的方向，默认为["s","e","se"]3方向
 */
baidu.extend(baidu.ui.Dialog.prototype, {
    resizable: true,
    minWidth: 100,
    minHeight: 100,
    direction: ['s', 'e', 'se']
});
baidu.ui.Dialog.register(function(me) {
    if (me.resizable) {
        var body,
            content,
            main,
            contentWidth, contentHeight,
            bodyWidth,bodyHeight;

        function getValue(){
            bodyWidth = body.offsetWidth;
            bodyHeight = body.offsetHeight;

            contentWidth = content.offsetWidth;
            contentHeight = content.offsetHeight;
        }

        /**
         * 注册onload事件
         * 创建resizeable handle
         */
        me.addEventListener('onload', function() {
            body = me.getBody();
            main = me.getMain();
            content = me.getContent();
            getValue();

            me.resizeCreate({target: main, classPrefix: me.classPrefix});
        });

        /**
         * 注册onresize事件
         * 当事件触发时设置content和body的OuterSize
         */
        me.addEventListener('onresize', function(styles) {
            baidu.dom.setOuterWidth(content, contentWidth + styles.current.width - styles.original.width);
            baidu.dom.setOuterHeight(content, contentHeight + styles.current.height - styles.original.height);
            
            baidu.dom.setOuterWidth(body, bodyWidth + styles.current.width - styles.original.width);
            baidu.dom.setOuterHeight(body, bodyHeight + styles.current.height - styles.original.height);
            
            me.coverable && me.Coverable_update();
        });

        /**
         * 注册onresizeend事件
         * 当事件触发时设置变量值
         */
        me.addEventListener('onresizeend', function() {
            getValue();
            me.width = contentWidth;
            me.height = contentHeight;

            baidu.setStyles(main,{height:"",width:""});
        });

        /**
         * 注册onupdate事件
         * 当事件触发时更新resizeHandle
         */
        me.addEventListener('onupdate',function() {
            getValue();
            me.resizeUpdate();
        });

        /**
         * 注册onopen事件
         * 当事件触发时更新resizeHandle
         */
        me.addEventListener('onopen',function() {
            getValue();
            me.resizeUpdate();
        });
    }
});

/**
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: ui/behavior/draggable.js
 * author: berg
 * version: 1.0.0
 * date: 2010/09/16
 */








/**
 * 为ui控件添加拖拽行为
 */
(function(){
    var Draggable = baidu.ui.behavior.draggable = function(){
        this.addEventListener("onload", function(){
            var me = this;
            me.dragUpdate();
        });
        this.addEventListener("ondispose", function(){
            var me  = this;
            baidu.un(me._dragOption.handler, "mousedown", me._dragFn);
            me._dragOption.handler = me.dragHandler = me._lastDragHandler = null;
        });
    };
    /**
     * 更新拖拽行为
     * @param {object} options 拖拽行为的选项，支持:
     * dragRange : 拖拽的范围
     * dragHandler : 拖拽手柄
     */
    Draggable.dragUpdate = function(options){
        var me = this;
        options = options || {};
        if(!me.draggable){
            return ;
        }
        //me.dragHandler != me._lastDragHandler,这个判断会造成当调用两次dragUpdate更新range时上次的事件没有被注销
        if(me._lastDragHandler && me._dragFn){
            baidu.event.un(me._lastDragHandler, "onmousedown", me._dragFn); //把上次的拖拽事件取消掉
        }
        baidu.object.extend(me, options);
        me._dragOption = {
            ondragstart : function(){
                me.dispatchEvent("ondragstart");
            },  
            ondrag : function(){
                me.dispatchEvent("ondrag");
            },
            ondragend : function(){
                me.dispatchEvent("ondragend");
            },
            autoStop : true
        };

        me._dragOption.range = me.dragRange || [];
        me._dragOption.handler = me._lastDragHandler = me.dragHandler || me.getMain();

        if (me._dragOption.handler) {
            baidu.event.on(me._dragOption.handler, "onmousedown", me._dragFn = function() {
                baidu.dom.drag(me.dragTarget || me.getMain(), me._dragOption);
            });
        }
    };
})();
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */









/**
 * 为Dialog添加拖拽功能
 * @name baidu.ui.Dialog.Dialog$draggable
 * @addon baidu.ui.Dialog
 * @param {Boolean} draggable 是否启用draggable，默认为true
 * */
baidu.ui.Dialog.prototype.draggable = true;

baidu.ui.Dialog.register(function(me){
    if(me.draggable){
        /**
         * 更新拖拽的范围，通过调用draggable行为中提供的dragUpdate实现
         * @private
         * @return void
         */
        function updateDragRange(){
            me.dragRange = [0,baidu.page.getWidth(),baidu.page.getHeight(),0];
            me.dragUpdate();
        };

        me.addEventListener("onload", function(){
            me.dragHandler = me.dragHandler || me.getTitle();

            //默认的拖拽范围是在窗口内
            if(!me.dragRange){
                updateDragRange();

                //如果用户窗口改变，拖拽的范围也要跟着变
                me.on(window, "resize", updateDragRange);
            }else{
                me.dragUpdate();
            }
        });

        me.addEventListener("ondragend", function(){
            me.left = baidu.dom.getStyle(me.getMain(), "left");
            me.top = baidu.dom.getStyle(me.getMain(), "top");
        });
    }
});
/**
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 */










(function(){
    var Coverable = baidu.ui.behavior.coverable = function() {};
    
    Coverable.Coverable_isShowing = false;
    Coverable.Coverable_iframe;
    Coverable.Coverable_container;
    Coverable.Coverable_iframeContainer;

    /**
     * 显示遮罩，当遮罩不存在时创建遮罩
     * @public
     * @return {NULL}
     */
    Coverable.Coverable_show = function(){
        var me = this;
        if(me.Coverable_iframe){
            me.Coverable_update();
            baidu.setStyle(me.Coverable_iframe, 'display', 'block'); 
            return;
        }
        
        var opt = me.coverableOptions || {},
            container = me.Coverable_container = opt.container || me.getMain(),
            opacity = opt.opacity || '0',
            color = opt.color || '',
            iframe = me.Coverable_iframe = document.createElement('iframe'),
            iframeContainer = me.Coverable_iframeContainer = document.createElement('div');

        //append iframe container
        baidu.dom.children(container).length > 0 ?
            baidu.dom.insertBefore(iframeContainer, container.firstChild):
            container.appendChild(iframeContainer);
       
        //setup iframeContainer styles
        baidu.setStyles(iframeContainer, {
            position: 'absolute',
            top: '0px',
            left: '0px'
        });
        baidu.dom.setBorderBoxSize(iframeContainer,{
            width: container.offsetWidth,
            height: container.offsetHeight
        });

        baidu.dom.setBorderBoxSize(iframe,{
            width: iframeContainer.offsetWidth
        });

        baidu.dom.setStyles(iframe,{
            zIndex  : -1,
            display  : "block",
            border: 0,
            backgroundColor: color,
            filter : 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=' + opacity + ')'
        });
        iframeContainer.appendChild(iframe);
        
        iframe.src = "javascript:void(0)";
        iframe.frameBorder = '0';
        iframe.scrolling = 'no';
        iframe.height = '97%';
        me.Coverable_isShowing = true;
    };

    /**
     * 隐藏遮罩
     * @public
     * @return {NULL}
     */
    Coverable.Coverable_hide = function(){
        var me = this,
            iframe = me.Coverable_iframe;
        
        if(!me.Coverable_isShowing){
            return;
        }
        
        baidu.setStyle(iframe, 'display', 'none');
        me.Coverable_isShowing = false;
    };

    /**
     * 更新遮罩
     * @public
     * @param {Object} options
     * @config {Number|String} opacity 透明度
     * @config {String} backgroundColor 背景色
     */
    Coverable.Coverable_update = function(options){
        var me = this,
            options = options || {},
            container = me.Coverable_container,
            iframeContainer = me.Coverable_iframeContainer,
            iframe = me.Coverable_iframe;
  
        baidu.dom.setBorderBoxSize(iframeContainer,{
            width: container.offsetWidth,
            height: container.offsetHeight
        });

        baidu.dom.setBorderBoxSize(iframe,baidu.extend({
            width: baidu.getStyle(iframeContainer, 'width')
        },options));
    };
})();
﻿/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 支持遮盖页面的任意元素
 * @name baidu.ui.Dialog.Dialog$coverable
 * @addon baidu.ui.Dialog
 */

baidu.extend(baidu.ui.Dialog.prototype,{
    coverable: true,
    coverableOptions: {}
});

baidu.ui.Dialog.register(function(me){

    if(me.coverable){

        me.addEventListeners("onopen,onload", function(){
            me.Coverable_show();
        });

        me.addEventListener("onclose", function(){
            me.Coverable_hide();
        });

        me.addEventListener("onupdate",function(){
            me.Coverable_update();
        });
    }
});
/*
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/ui/Base/setParent.js
 * author: berg
 * version: 1.0.0
 * date: 2010/12/02
 */




/**
 * 设置UI控件的父控件
 * @memberOf baidu.ui.Base.prototype
 * @param {UI} 父控件
 */
baidu.ui.Base.setParent = function(parent){
    var me = this,
        oldParent = me._parent;
    oldParent && oldParent.dispatchEvent("removechild");
    if(parent.dispatchEvent("appendchild", { child : me })){
        me._parent = parent;

        /* 
         * childName名字没有确定，暂时先不加这段代码
         * //如果有childName，skin和classPrefix以父元素为准
         *if(me.childName){
         *    if(parent.skin){
         *        me.skin = parent.skin + '-' + me.childName;
         *    }
         *    if(parent.classPrefix){
         *        me.classPrefix = parent.classPrefix + '-' + me.childName;
         *    }
         *}
         */
    }
};
/*
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/ui/Base/getParent.js
 * author: berg
 * version: 1.0.0
 * date: 2010/12/02
 */



/**
 * 获取UI控件的父控件
 * @memberOf baidu.ui.Base.prototype
 * @return {UI} 父控件
 */
baidu.ui.Base.getParent = function(){
    return this._parent || null;
};
/**
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: ui/behavior/statable.js
 * author: berg, lingyu
 * version: 1.0.0
 * date: 2010/09/04
 */












/**
 * 为ui控件添加状态管理行为
 */
(function() {
    var Statable = baidu.ui.behavior.statable = function() {
        var me = this;

        me.addEventListeners('ondisable,onenable', function(event,options) {
            var element, group,
            options = options || {},
            elementId = (options.element || me.getMain()).id,
            group = options.group;

            if (event.type == 'ondisable' && !me.getState(elementId, group)['disabled']) {
        	    me.removeState('press', elementId, group);
        	    me.removeState('hover', elementId, group);
        	    me.setState('disabled', elementId, group);
            }else if (event.type == 'onenable' && me.getState(elementId, group)['disabled']) {
                me.removeState('disabled', elementId, group);
        	}
        });
    };

    //保存实例中所有的状态，格式：group+elementId : {stateA : 1, stateB : 1}
    Statable._states = {};
    //所有可用的状态，调用者通过addState添加
    Statable._allStates = ['hover', 'press', 'disabled'];
    Statable._allEventsName = ['mouseover', 'mouseout', 'mousedown', 'mouseup'];
    Statable._eventsHandler = {
        'mouseover' : function(id, group) {
            var me = this;
            if (!me.getState(id, group)['disabled']) {
                me.setState('hover', id, group);
                return true;
            }
        },
        'mouseout' : function(id, group) {
            var me = this;
            if (!me.getState(id, group)['disabled']) {
                me.removeState('hover', id, group);
                me.removeState('press', id, group);
                return true;
            }
        },
        'mousedown' : function(id, group) {
            var me = this;
            if (!me.getState(id, group)['disabled']) {
                me.setState('press', id, group);
                return true;
            }
        },
        'mouseup' : function(id, group) {
            var me = this;
            if (!me.getState(id, group)['disabled']) {
                me.removeState('press', id, group);
                return true;
            }
        }
    };

    /**
     * 获得状态管理方法的字符串，用于插入元素的HTML字符串的属性部分
     *
     * @param {string} group optional    状态分组，同一组的相同状态会被加上相同的css.
     * @param {string} key optional 索引，在同一类中的索引.
     *
     * @return {string} 元素属性字符串.
     */
    Statable._getStateHandlerString = function(group, key) {
        var me = this,
            i = 0,
            len = me._allEventsName.length,
            ret = [],
            eventType;
        if (typeof group == 'undefined') {
            group = key = '';
        }
        for (; i < len; i++) {
            eventType = me._allEventsName[i];
            ret[i] = 'on' + eventType + '=\"' + me.getCallRef() + "._fireEvent('" + eventType + "', '" + group + "', '" + key + "', event)\"";
        }

        return ret.join(' ');
    };

    /**
     * 触发指定类型的事件
     * @param {string} eventType  事件类型.
     * @param {string} group optional    状态分组，同一组的相同状态会被加上相同的css.
     * @param {string} key 索引，在同一类中的索引.
     * @param {DOMEvent} e DOM原始事件.
     */
    Statable._fireEvent = function(eventType, group, key, e) {
        var me = this,
        	id = me.getId(group + key);
        if (me._eventsHandler[eventType].call(me, id, group)) {
            me.dispatchEvent(eventType, {
                element: id,
                group: group,
                key: key,
                DOMEvent: e
            });
        }
    };

    /**
     * 添加一个可用的状态
     * @param {string} state 要添加的状态.
     * @param {string} eventNam optional DOM事件名称.
     * @param {string} eventHandler optional DOM事件处理函数.
     */
    Statable.addState = function(state, eventName, eventHandler) {
        var me = this;
        me._allStates.push(state);
        if (eventName) {
            me._allEventsName.push(eventName);
            if (!eventHandler) {
                eventHandler = function() {return true;};
            }
            me._eventsHandler[eventName] = eventHandler;
        }
    };

    /**
     * 获得指定索引的元素的状态
     * @param {string} elementId 元素id，默认是main元素id.
     * @param {string} group optional    状态分组，同一组的相同状态会被加上相同的css.
     */
    Statable.getState = function(elementId, group) {
        var me = this,
            _states;
        group = group ? group + '-' : '';
        elementId = elementId ? elementId : me.getId();
        _states = me._states[group + elementId];
        return _states ? _states : {};
    };

    /**
     * 设置指定索的元素的状态
     * @param {string} state 枚举量 in ui._allStates.
     * @param {string} elementId optional 元素id，默认是main元素id.
     * @param {string} group optional    状态分组，同一组的相同状态会被加上相同的css.
     */
    Statable.setState = function(state, elementId, group) {
        var me = this,
            stateId,
            currentState;

        group = group ? group + '-' : '';
        elementId = elementId ? elementId : me.getId();
        stateId = group + elementId;

        me._states[stateId] = me._states[stateId] || {};
        currentState = me._states[stateId][state];
        if (!currentState) {
            me._states[stateId][state] = 1;
            baidu.addClass(elementId, me.getClass(group + state));
        }
    };

    /**
     * 移除指定索引的元素的状态
     * @param {string} state 枚举量 in ui._allStates.
     * @param {string} element optional 元素id，默认是main元素id.
     * @param {string} group optional    状态分组，同一组的相同状态会被加上相同的css.
     */
    Statable.removeState = function(state, elementId, group) {
        var me = this,
            stateId;

        group = group ? group + '-' : '';
        elementId = elementId ? elementId : me.getId();
        stateId = group + elementId;

        if (me._states[stateId]) {
            me._states[stateId][state] = 0;
            baidu.removeClass(elementId, me.getClass(group + state));
        }
    };
})();
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

//依赖包










//声明包


/**
 * button基类，创建一个button实例
 * @name baidu.ui.Button
 * @class
 * @grammar new baidu.ui.Button(options)
 * @param {Object} [options] 选项
 * @config {String}             content     按钮文本信息
 * @config {Boolean}            disabled    按钮是否有效，默认为false（有效）。
 * @config {Function}           onmouseover 鼠标悬停在按钮上时触发
 * @config {Function}           onmousedown 鼠标按下按钮时触发
 * @config {Function}           onmouseup   按钮弹起时触发
 * @config {Function}           onmouseout  鼠标移出按钮时触发
 * @config {Function}           onclick		鼠标点击按钮时触发
 * @config {Function}           onupdate	更新按钮时触发
 * @config {Function}           onload		页面加载时触发
 * @config {Function}           ondisable   当调用button的实例方法disable，使得按钮失效时触发。
 * @config {Function}           onenable    当调用button的实例方法enable，使得按钮有效时触发。
 * @returns {Button}                        Button类
 * @plugin  capture            使按钮支持capture
 * @plugin  poll               使按钮支持poll轮询
 * @remark  创建按钮控件时，会自动为控件加上四种状态的style class，分别为正常情况(tangram-button)、鼠标悬停在按钮上(tangram-button-hover)、鼠标按下按钮时(tangram-button-press)、按钮失效时(tangram-button-disable)，用户可自定义样式。
 */
baidu.ui.Button = baidu.ui.createUI(new Function).extend(
    /**
     *  @lends baidu.ui.Button.prototype
     */
    {
       
    //ui控件的类型，传入给UIBase **必须**
    uiType: 'button',
    //ui控件的class样式前缀 可选
    //classPrefix     : "tangram-button-",
    tplBody: '<div id="#{id}" #{statable} class="#{class}">#{content}</div>',
    disabled: false,
    statable: true,

    /**
     *  获得button的HTML字符串
     *  @private
     *  @return {String} 拼接的字符串
     */
    _getString: function() {
        var me = this;
        return baidu.format(me.tplBody, {
            id: me.getId(),
            statable: me._getStateHandlerString(),
            'class' : me.getClass(),
            content: me.content
        });
    },

    /**
     *  将button绘制到DOM树中。
     *  @param {HTMLElement|String} target  需要渲染到的元素
     */	
    render: function(target) {
        var me = this,
            body;
        me.addState('click', 'click', function(id, group) {
            var me = this;
            if (!me.getState(id, group)['disabled']) {
                return true;
            }
        });
        baidu.dom.insertHTML(me.renderMain(target), 'beforeEnd', me._getString());

        body = baidu.g(target).lastChild;
        if (me.title) {
            body.title = me.title;
        }

        me.disabled && me.setState('disabled');
        me.dispatchEvent('onload');
    },

    /**
     *  判断按钮是否处于失效状态。
     *  @return {Boolean} 是否失效的状态
     */
    isDisabled: function() {
        var me = this,
        	id = me.getId();
        return me.getState()['disabled'];
    },

    /**
     *  销毁实例。
     */
	dispose : function(){
		var me = this,
            body = me.getBody();
        me.dispatchEvent('dispose');
       //删除当前实例上的方法
        baidu.each(me._allEventsName, function(item,index) {
            body['on' + item] = null;
        });
        baidu.dom.remove(body);
		
        me.dispatchEvent('ondispose');
        baidu.lang.Class.prototype.dispose.call(me);
	},

    /**
     * 设置disabled属性
	 */
    disable: function() {
        var me = this,
        body = me.getBody();
        me.dispatchEvent('ondisable', {element: body});
    },

    /**
     * 删除disabled属性
	 */
    enable: function() {
        var me = this;
        body = me.getBody();
        me.dispatchEvent('onenable', {element: body});
    },

    /**
     * 触发button事件
     * @param {String} eventName   要触发的事件名称
     * @param {Object} e           事件event
     */
    fire: function(eventType,e) {
        var me = this, eventType = eventType.toLowerCase();
        if (me.getState()['disabled']) {
            return;
        }
        me._fireEvent(eventType, null, null, e);
    },

    /**
     * 更新button的属性
     * @param {Object}              options     更新button的属性
	 * @config {String}             content     按钮文本信息
	 * @config {Boolean}            disabled    按钮是否有效，默认为false（有效）。
	 * @config {Function}           onmouseover 鼠标悬停在按钮上时触发
	 * @config {Function}           onmousedown 鼠标按下按钮时触发
	 * @config {Function}           onmouseup   按钮弹起时触发
	 * @config {Function}           onmouseout  鼠标移出按钮时触发
	 * @config {Function}           onclick		鼠标点击按钮时触发
	 * @config {Function}           onupdate	更新按钮时触发
	 * @config {Function}           onload		页面加载时触发
	 * @config {Function}           ondisable   当调用button的实例方法disable，使得按钮失效时触发。
	 * @config {Function}           onenable    当调用button的实例方法enable，使得按钮有效时触发。
     * 
     */
    update: function(options) {
        var me = this;
        baidu.extend(me, options);
        options.content && (me.getBody().innerHTML = options.content);

        me.dispatchEvent('onupdate');
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */








/**
  * 支持关闭按钮插件
 * @name baidu.ui.Dialog.Dialog$closeButton
 * @addon baidu.ui.Dialog
 */

baidu.extend(baidu.ui.Dialog.prototype,{
    closeText  : "",
    closeButton : true
});
baidu.ui.Dialog.register(function(me){
    
    me.closeButton && me.addEventListener("onload", function(){
        var buttonInstance = new baidu.ui.Button({
            parent : me,
            classPrefix : me.classPrefix + "-close",
            skin : me.skin ? me.skin + "-close" : "",
            onclick : function(){
                me.close();
            },
            onmousedown : function(e){
               baidu.event.stopPropagation(e.DOMEvent);
            },
            element:me.getTitle(),
            autoRender:true
        });
        me.closeButtonInstance = buttonInstance;

        me.addEventListener("ondispose",function(){
            buttonInstance.dispose();
        });
    });
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */














/**
 * ItemSet是Accordion, Tab等多item操作的抽象类
 * @class
 * @grammar 抽象类
 * @param {Object} options config参数.
 * @config {String} switchType 事件激发类型，item由什么类型的事件来打开，取值如：click, mouseover等等
 * @config {Number} defaultIndex 初始化后的默认打开项索引，默认值是0
 * @author fx
 */
baidu.ui.ItemSet = baidu.ui.createUI(function(options){
    var me = this;
    me._headIds = [];
    me._bodyIds = [];
}).extend(
/**
 * @lends baidu.ui.ItemSet.prototype
 */
{
    currentClass: 'current',//展开项的css名称
    tplHead: '',
    tplBody: '',
    switchType: 'click',//事件名称，标记为当点击时激活事件
    defaultIndex: 0,//开始的默认打开项索引
    
    /**
     * 做为子类getString()使用,通过用户传来的item对象获得item head部分的html字符串
     * @private
     * @param {Object} item 格式为{head: '', body:''}
     * @param {Number} index 插件到数组中的索引，默认插入到数组最后
     * @return {String}
     */
    _getHeadString: function(item, index){
        var me = this,
            ids = me._headIds,
            headId = me.getId('head' + baidu.lang.guid()),
            index = ids[index] ? index : ids.length;
        ids.splice(index, 0, headId);
        return baidu.string.format(me.tplHead, {
            id: headId,
            'class': me.getClass('head'),
            head: item['head']
        });
    },
    
    /**
     * 做为子类getString()使用,通过用户传来的item对象获得item body部分的html字符串
     * @private
     * @param {Object} item 格式为{head: '', body:''}
     * @param {Number} index 插件到数组中的索引，默认插入到数组最后
     * @return {String}
     */
    _getBodyString: function(item, index){
        var me = this,
            ids = me._bodyIds,
            bodyId = me.getId('body' + baidu.lang.guid()),
            index = ids[index] ? index : ids.length;
        ids.splice(index, 0, bodyId);
        
        return baidu.string.format(me.tplBody, {
            id: bodyId,
            'class': me.getClass('body'),
            body: item['body'],
            display: 'none'
        });
    },
    
    /**
     * 外部事件绑定,做为中转方法，避免dom元素与事件循环引用。
     * @private
     * @param {HTMLElement} head 
     */
    _getSwitchHandler: function(head){
        var me = this;
        //分发一个beforeswitch, 在切换之前执行.
        if(me.dispatchEvent("onbeforeswitch",{element: head}) ){
            me.switchByHead(head);
            //分发一个onswitch, 在切换之后执行
            me.dispatchEvent("onswitch");
        }
    },
    
    /**
     * 内部方法注册head的onclick或者onmouseover事件，做为内部方法给render与addItem方法重用。
     * @private
     * @param {Object} head 一个head的dom
     */
    _addSwitchEvent: function(head){
        var me = this;
        head["on"  +  me.switchType] = baidu.fn.bind("_getSwitchHandler", me, head);
    },
    
    /**
     * 渲染item到target元素中
     * @param {HTMLElement|String} target 被渲染的容器对象
     */
    render: function(target){
        var me = this;
        baidu.dom.insertHTML(me.renderMain(target),  "beforeEnd",  me.getString());
        baidu.array.each(me._headIds, function(item, index){
            var head = baidu.dom.g(item);
            me._addSwitchEvent(head);
            if(index == me.defaultIndex){
                me.setCurrentHead(head);
                baidu.dom.addClass(head, me.getClass(me.currentClass));
                me.getBodyByHead(head).style.display = '';
            }
            head = null;
        });
        me.dispatchEvent("onload");
    },
    
    /**
     * 获得所有item head元素
     * @return {Array}
     */
    getHeads: function(){
        var me = this,
            list = [];
        baidu.array.each(me._headIds, function(item){
            list.push(baidu.dom.g(item));
        });
        return list;
    },
    
    /**
     * 获得所有item body元素
     * @return {Array}
     */
    getBodies: function(){
        var me = this,
            list = [];
        baidu.array.each(me._bodyIds, function(item){
            list.push(baidu.dom.g(item));
        });
        return list;
    },
    
    /**
     * 取得当前展开的head
     * @return {HTMLElement}
     */
    getCurrentHead: function(){
        return this.currentHead;
    },
    
    /**
     * 设置当前的head
     * @param {HTMLElement} head 一个head的dom
     */
    setCurrentHead: function(head){
        this.currentHead = head;
    },
    
    /**
     * 获得指定body对应的head
     * @param {HTMLElement} head 一个head的dom
     * @return {HTMLElement}
     */
    getBodyByHead: function(head){
        var me = this,
            index = baidu.array.indexOf(me._headIds, head.id);
        return baidu.dom.g(me._bodyIds[index]);
    },
    
    /**
     * 根据索引取得对应的body
     * @param {Number} index
     * @return {HTMLElement}
     */
    getBodyByIndex: function(index){
        return baidu.dom.g(this._bodyIds[index]);
    },
    
    /**
     * 在末尾添加一项
     * @param {Object} item 格式{head: '', body: ''}
     */
    addItem: function(item){
        var me = this,
            index = me._headIds.length;
        me.insertItemHTML(item);
    },
    
    /**
     * 根据索引删除一项
     * @param {Number} index 指定一个索引来删除对应的项
     */
    removeItem: function(index){
        var me = this,
            head = baidu.dom.g(me._headIds[index]),
            body = baidu.dom.g(me._bodyIds[index]),
            curr = me.getCurrentHead();
        curr && curr.id == head.id && me.setCurrentHead(null);
        baidu.dom.remove(head);
        baidu.dom.remove(body);
        baidu.array.removeAt(me._headIds, index);
        baidu.array.removeAt(me._bodyIds, index);
    },
    
    /**
     * 除去动画效果的直接切换项
     * @private
     * @param {HTMLElement} head 一个head的dom
     */
    _switch: function(head){
        var me = this,
            oldHead = me.getCurrentHead();
        if(oldHead){
            me.getBodyByHead(oldHead).style.display = "none";
            baidu.dom.removeClass(oldHead,  me.getClass(me.currentClass));
        }
        if(head){
            me.setCurrentHead(head);
            me.getBodyByHead(head).style.display = "block";
            baidu.dom.addClass(head,  me.getClass(me.currentClass));
        }
    },
    
    /**
     * 切换到由参数指定的项
     * @param {HTMLElement} head 一个head的dom
     */
    switchByHead: function(head){
        var me = this;
        if(me.dispatchEvent("beforeswitchbyhead", {element: head}) ){
            me._switch(head);
        }
    },
    
    /**
     * 根据索引切换到指定的项
     * @param {HTMLElement} head 一个head的dom
     */
    switchByIndex: function(index){
        this.switchByHead(this.getHeads()[index]);
    },
    
    /**
     * 销毁实例的析构
     */
    dispose: function(){
        this.dispatchEvent("ondispose");
    }
});
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path :  ui/Tab.js
 * author :  berg
 * version :  1.0.0
 * date :  2010-06-11
 */














 /**
 * Tab标签组，说明：该组件继承于baidu.ui.ItemSet，相关的方法请参考ItemSet
 * @class
 * @grammar new baidu.ui.Tab(options)
 * @param      {Object} [options] 选项
 * @config {Array} items 数据项，格式如：[{head: 'text-0', body: 'content-0'}, {head: 'text-1', body: 'content-1'}...]
 * @see <a href="#baidu.ui.ItemSet">baidu.ui.ItemSet</a>
 */
 
baidu.ui.Tab = baidu.ui.createUI( function (options) {
    var me = this;
    me.items = me.items || [];//初始化防止空
}, {superClass : baidu.ui.ItemSet}).extend( 
/**
 *  @lends baidu.ui.Tab.prototype
 */
{
	//ui控件的类型 **必须**
    uiType             :  "tab", 
    tplDOM           :  "<div id='#{id}' class='#{class}'>#{heads}#{bodies}</div>", 
    tplHeads        :  "<ul id='#{id}' class='#{class}'>#{heads}</ul>", 
    tplBodies      :  "<div id='#{id}' class='#{class}'>#{bodies}</div>", 
    tplHead     :  "<li id='#{id}' bodyId='#{bodyId}' class='#{class}' ><a href='#' onclick='return false'>#{head}</a></li>", 
    tplBody   :  "<div id='#{id}' class='#{class}' style='display : #{display};'>#{body}</div>", 
	/**
	 * 获得tab的html string
	 * @private
	 * @return {HTMLString} string
	 */
	getString  :  function() {
        var me = this, 
            items = this.items, 
            bodies = [], 
            heads = [];
        baidu.each(items,  function(_item,  key) {
            bodies.push(me._getBodyString(_item, key));
            heads.push(me._getHeadString(_item, key));
        });
		return baidu.format(me.tplDOM,  {
            id       :  me.getId(), 
            "class"  :  me.getClass(), 
            heads   :  baidu.format(me.tplHeads,  {
                    id :  me.getId("head-container"), 
                    "class" :  me.getClass("head-container"), 
                    heads :  heads.join("")
                }), 
            bodies :  baidu.format(me.tplBodies,  {
                    id           :  me.getId("body-container"), 
                    "class"      :  me.getClass("body-container"), 
                    bodies       :  bodies.join("")
                }
            )
        });
	}, 
	/**
	 * 插入item html
	 * @param {Object} item     选项内容
	 * @param {int} index       选项的索引
	 */
	insertItemHTML : function(item, index) {
		var me = this,
            headIds = me._headIds,
            bodyIds = me._bodyIds,
            index = headIds[index] ? index : headIds.length,
            headContainer = baidu.dom.g(headIds[index] || me.getId('head-container')),
            bodyContainer = baidu.dom.g(bodyIds[index] || me.getId('body-container')),
            pos = headIds[index] ? 'beforeBegin' : 'beforeEnd';
        baidu.dom.insertHTML(headContainer, pos, me._getHeadString(item, index));
        baidu.dom.insertHTML(bodyContainer, pos, me._getBodyString(item, index));
        me._addSwitchEvent(baidu.dom.g(headIds[index]));
	},
    /**
	 * @private
	 * 
	 */
    insertContentHTML: function(item, index){
        var me = this;
        baidu.dom.insertHTML(me.getBodies()[index], 'beforeEnd', item);
    },
    
    /**
     * 销毁实例的析构
     */
    dispose: function(){
        var me = this;
        me.dispatchEvent('ondispose');
        baidu.dom.remove(me.getMain());
        baidu.lang.Class.prototype.dispose.call(me);
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */


/**
 * 提供一些公共工具，如log日志等
 * @namespace baidu.tools
 */
baidu.tools = baidu.tools || {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */





/**
 * 打印log
 * @class
 * @name baidu.tools.log
 * @grammar baidu.tools.log
 * @param {Object} data 需要打印的内容
 * @return {Null}
 */
(function(){
 
        //日志队列
    var _logStack = [], 

        //存放time调用的datehandle
        _timeObject = {},   
        
        /**
         * 设置的push数据时使用的timeHandler
         * 若timeInterval为零，则立即输出数据
         **/
        _timeHandler = null,

        timeInterval = 0,
    
        _logLevel = parseInt('1111',2),

        _enableDialg = false,
        _dialog = null;
     
    /**
     * 打印log
     * @class
     * @grammar baidu.tools.log
     * @param {Object} data 需要打印的内容
     * @return {Null}
     */
    function log(data){
        _log(data, 'log'); 
    };

    /**
     * 打印error
     * @memberOf baidu.tools.log.prototype
     * @param {Object} data 需要打印的内容
     * @return {Null}
     */
    log.error = function(data){
        _log(data,'error');
    };

    /**
     * 打印info
     * @memberOf baidu.tools.log.prototype
     * @param {Object} data 需要打印的内容
     * @return {Null}
     */
    log.info = function(data){
        _log(data,'info');
    };

    /**
     * 打印warn
     * @memberOf baidu.tools.log.prototype
     * @param {Object} data 需要打印的内容
     * @return {Null}
     */
    log.warn = function(data){
        _log(data,'warn');
    };

    /**
     * 设置timer
     * 若此时一寸在相同名称的计时器，则立即输出，并重新初始化
     * 若不存在，则初始化计时器
     * @memberOf baidu.tools.log.prototype
     * @param {String} name timer的标识名称
     * @return {Null}
     */
    log.time = function(name){
        var timeOld = _timeObject[name],
            timeNew = new Date().getTime();

        if(timeOld){
            _log(timeNew - timeOld, 'info');
        }
        _timeObject[name] = timeNew;
    };

    /**
     * 终止timer,并打印
     * @memberOf baidu.tools.log.prototype
     * @param {String} name timer的标识名称
     * @return {Null}
     */
    log.timeEnd = function(name){
        var timeOld = _timeObject[name],
            timeNew = new Date().getTime();

        if(timeOld){
            _log(timeNew - timeOld, 'info');
            delete(_timeObject[name]);
        }else{
            _log('timer not exist', 'error');
        }
    };

    /**
     * 开启dialog进行输出
     * @memberOf baidu.tools.log.prototype
     * @return {Null}
     */
    log.enableDialog = function(){
        
        _enableDialg = true;
        if(!_dialog && baidu.tools.log.Dialog){
            baidu.tools.log.DInstance = _dialog = new baidu.tools.log.Dialog();
        }else{
            _dialog.open();
        }
    };

    /**
     * 关闭dialog
     * @memberOf baidu.tools.log.prototype
     * @return {Null}
     */
    log.disableDialog = function(){
        
        _enableDialg = false;
        _dialog && _dialog.close();
    };
   
    /**
     * 输出log
     * @private
     * @param {String} data 需要打印的内容
     * @return {Null}
     */
    function _log (data,type){
        var me = log;

        if(_logLevel & me.logLevel[type]){
            _logStack.push({type:type,data:data});
        }

        if(timeInterval == 0){
            //如果这是time为0，则立即调用_push方法
            _push();
        }else{
            //如果timeInterval > 0
            !_timeHandler && (_timeHandler = setInterval(_push,timeInterval));
        }
    };

    /**
     * 推送log,并调用回调函数
     * @private
     * @return {Null}
     */
    function _push (){
        var me = log,
            data = _logStack;

        //清空栈
        _logStack = [];
        _dialog && _dialog.push(data);

        me.callBack(data);
    };

    /**
     * 设置log的timeInterval值
     * 当timeInterval = 0时，则当有日志需要输出时，立即输出
     * 当timeInterval > 0时，则以该timeStep为间隔时间，输出日志
     * 默认值为0
     * @param {Number} ts timeInterval
     * @return {Null}
     * @memberOf baidu.tools.log.prototype
     */
    log.setTimeInterval = function(ti){
        
        timeInterval = ti;
        
        //停止当前的计时
        if(_timeHandler && timeInterval == 0){
            clearInterval(_timeHandler);
            _timeHandler = null;
        }
    };

    
   /**
    * 设置所要记录的log的level
    * @param {String} 'log','error','info','warn'中一个或多个
    * @return {Null}
    * @memberOf baidu.tools.log.prototype
    */ 
    log.setLogLevel = function(){
        var me = log,
            logLevel = parseInt('0000',2);
            
        baidu.each(arguments,function(ll){
            logLevel = logLevel | me.logLevel[ll];
        });

        _logLevel = logLevel;
    };
   
    //日志等级
    log.logLevel = {
        'log'   : parseInt('0001', 2),
        'info'  : parseInt('0010', 2),
        'warn'  : parseInt('0100', 2),
        'error' : parseInt('1000', 2)
    };

    //回调函数
    log.callBack = baidu.fn.blank;

    baidu.log = baidu.tools.log = log;
})();
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */


























/**
 * 打印日志
 * @class
 * @grammar new baidu.tools.log.Dialog(options)
 */
baidu.tools.log.Dialog = function(options){
    var me = this,
        options = options || {};

    me.dialog = new baidu.ui.Dialog({
        width: '522',
        height: '250',
        titleText: 'tangram debug window',
        left:'380px',
        top:'130px'
    },options.dialogOptions || {});
    me.dialog.render();
    me.dialog.open();

    me.tab = new baidu.ui.Tab({
        items: [
            {head: 'all'},
            {head: 'log'},
            {head: 'info'},
            {head: 'warn'},
            {head: 'error'}
        ]
    });
    me.tab.render(me.dialog.getContent());
    me.tabIndex = {
        'all': 0,
        'log': 1,
        'info': 2,
        'warn': 3,
        'error': 4
    };
    
    //log tpl
    me.logTpl = {
        data: '<div>#{content}</div>',
        content: '<span>#{content}</span>',
        split: '<div style="height:1px; background-color:white;"></div>'
    };

    me.color = {
        log: 'black',
        info: 'yellow',
        warn: 'blue',
        error: 'red'
    };
};

baidu.tools.log.Dialog.prototype = {
   
    _verifyFunction: [
        [baidu.lang.isString,'String'],
        [baidu.lang.isNumber,'Number'],
        [baidu.lang.isDate,'Date'],
        [baidu.lang.isArray,'Array'],
        [baidu.lang.isObject,'Object']
    ],

    /**
     * 打开dialog
     * @return {Null}
     */
    open: function(){
        this.dialog.open();        
    },
    
    /**
     * 关闭dialog
     * @public
     * @return {Null}
     */
    close: function(){
        this.dialog.close();
    },

    /**
     * 向dialog中pushlog日志
     * @public
     * @return {Null}
     */
    push:function(data){
        var me =  this,
            data = data || [],
            dataString = [],
            tmpChild = [];

        baidu.each(data,function(d,i){
            dataString.push(me._getString(d));
            dataString.push(me.logTpl.split);
        });
        
        dataString = dataString.join('');
        me.tab.insertContentHTML(dataString,me.tabIndex['all']);
    },

    /**
     * 清空数据
     * @public
     * @return {Null}
     */
    clear: function(type){
        var me = this,
            type = type || "all";

        if(type == 'all'){
            baidu.object.each(me.tab.bodies,function(item,i){
                item.innerHTML = '';
            });
        }else{
            me.tab.insertContentHTML('',me.index[type]);
        }
    },

    _getString:function(data){
        var me = this,
            type= data.type,
            contentData = data.data,
            contentString = '';

        contentString = baidu.format(me.logTpl['data'],{
            content: baidu.format(me.logTpl['content'],{
                content: me._getContentString(contentData)
            })
        });

        me.tab.insertContentHTML(contentString,me.tabIndex[type]);
        me.tab.insertContentHTML(me.logTpl.split,me.tabIndex[type]);
        return contentString;
    },

    /**
     * 根据不同的数据列型生成不同的content字符串，并返回
     * @private
     * @param {Object} data content数据
     * @return {String} str
     * */
    _getContentString: function(data){
        var me = this,
            str = '';
        
        //判断数据类型
        //目前支持数据类型：
        //Array,Object,Boolean,Date,String,Number
        baidu.each(me._verifyFunction,function(fun,index){
            
            if(fun[0](data)){
                str = me['_echo' + fun[1]](data);
                return false;
            }
        }); 
        
        return str;
    },

    _echoArray: function(data){
        var me = this,
            resultStr = [];
                    
        baidu.each(data,function(item,index){
            resultStr.push(me._getContentString(item));
        });

        return '[' + resultStr.join(', ') + ']';
    },

    _echoObject: function(data){
        var me = this,
            resultStr = [];

        baidu.object.each(data,function(item,index){
            resultStr.push( index + '=' + me._getContentString(item));
        });

        return 'Object { ' + resultStr.join(', ') + ' }';          
    },

    _echoDate: function(data){
        return data.toString();       
    },

    _echoString: function(data){
        return '"' + data.toString() + '"';
    },

    _echoNumber: function(data){
        return data.toString(); 
    }
};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path: ui/Accordion.js
 * author: zhangyao
 * version: 1.0.0
 * date: 2010-09-03
 */













/**
 * 手风琴组件，说明：该组件继承于baidu.ui.ItemSet，相关的方法请参考ItemSet
 * @class
 * @grammar new baidu.ui.Accordion(options)
 * @param {Object} options 选项
 * @config {Array} items 数据项，格式如：[{head: 'text-0', body: 'content-0'}, {head: 'text-1', body: 'content-1'}...]
 * @plugin fx  手风琴的动画效果
 * @return {baidu.ui.Accordion} Accordion实例
 */
baidu.ui.Accordion = baidu.ui.createUI(function (options){
    var me = this;
    me.items = me.items || [];//初始化防止空
},{superClass:baidu.ui.ItemSet}).extend(
    /**
     *  @lends baidu.ui.Accordion.prototype
     */
    {
    //ui控件的类型 **必须**
    uiType      : "accordion",
    //ui控件的class样式前缀 可选
    //classPrefix     : "tangram-accordion-",
    target      : document.body,
    tplDOM      : "<div id='#{id}' class='#{class}'>#{items}</div>",
    tplHead     : '<div id="#{id}" bodyId="#{bodyId}" class="#{class}" >#{head}</div>',
    tplBody     : "<div id='#{id}' class='#{class}' style='display:#{display};'>#{body}</div>",
    /**
     * 获得accordion的html string
     * @return {HTMLString}string
     */
    getString : function(){
        var me = this,
            items = this.items,
            itemsStrAry = [];
        baidu.each(items, function(item, key){  
            itemsStrAry.push(me._getHeadString(item) + me._getBodyString(item));
        });
        return baidu.format(this.tplDOM, {
            id      : me.getId(),
            "class" : me.getClass(),
            items   : itemsStrAry.join("")
        });
    },
    /**
     * 插入item html
     * @param {Object} item     插入项
     * @param {number} index    索引，默认插入在最后一项
     */
    insertItemHTML:function(item, index){
        var me = this,
            ids = me._headIds,
            index = ids[index] ? index : ids.length,
            container = baidu.dom.g(ids[index]) || me.getBody(),
            pos = ids[index] ? 'beforeBegin' : 'beforeEnd';
        baidu.dom.insertHTML(container, pos, me._getHeadString(item, index));
        baidu.dom.insertHTML(container, pos, me._getBodyString(item, index));
        me._addSwitchEvent(baidu.dom.g(ids[index]));
    },
    
    /**
     * 关闭当前打开的项
     */
    collapse: function(){
        var me = this;
        if(me.dispatchEvent('beforecollapse')){
            if(me.getCurrentHead()){
                me._switch(null);
                me.setCurrentHead(null);
            }
        }
    },
    
    /**
     * 销毁实例的析构
     */
    dispose: function(){
        var me = this;
        me.dispatchEvent('ondispose');
        baidu.dom.remove(me.getMain());
        baidu.lang.Class.prototype.dispose.call(me);
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: ui/Accordion/Accordion$fx.js
 * author: zhangyao, linlingyu
 * version: 1.0.0
 * date: 2010/12/16 
 */







/**
 * 为手风琴组件添加动画效果
 * @name  baidu.ui.Accordion.Accordion$fx
 * @addon baidu.ui.Accordion
 */
baidu.ui.Accordion.register(function(me) {
//  me._fxElement = null;//用于存放当前正在进行动画的对象
    me.addEventListeners({
        beforeswitchbyhead: function(evt){
            var currHead = me.getCurrentHead(),
                currBody = currHead && me.getBodyByHead(currHead),
                switchBody = me.getBodyByHead(evt.element),
                rsid = currHead && currHead.id,
                opts,
                height;
            if(!baidu.fx.current(me._fxElement) && rsid != evt.element.id){
                me._fxElement = switchBody;
                baidu.fx.expand(switchBody, baidu.object.extend({
                    onafterfinish: function() {
                        me._switch(evt.element);
                        if(currBody){
                            currBody.style.height = switchBody.style.height;
                            currBody.style.overflow = 'auto';
                        }
                    }
                }, currBody ? {
                        onbeforestart: function() {
                            baidu.dom.removeClass(currHead, me.getClass(me.currentClass));
                            baidu.dom.addClass(evt.element, me.getClass(me.currentClass));
                            currBody.style.overflow = 'hidden';
                            currBody.style.height = parseInt(baidu.dom.getStyle(currBody, 'height')) - 1 + 'px';
                        },
                        onbeforeupdate: function() {
                            height = parseInt(baidu.dom.getStyle(switchBody, 'height'));//取得switchBody未改变的高度
                        },
                        onafterupdate: function() {
                            currBody.style.height = parseInt(baidu.dom.getStyle(currBody, 'height'))
                                - parseInt(baidu.dom.getStyle(switchBody, 'height'))
                                + height + 'px';
                        }
                } : {}));
            }
            evt.returnValue = false;
        },
        
        beforecollapse: function(evt){
            evt.returnValue = false;
            var currHead = me.getCurrentHead(),
                body = currHead && me.getBodyByHead(currHead);
            if(baidu.fx.current(me._fxElement) || !body){return}
            baidu.fx.collapse(body, {
                onafterfinish: function(){
                    me.setCurrentHead(null);
                }
            });
            
        }
    });
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: ui/decorator/Decorator.js
 * author: berg
 * version: 1.0.0
 * date: 2010/08/17
 */










/**
 * 装饰器控件基类
 * @name baidu.ui.Decorator
 * @class
 * @private
 */

baidu.ui.Decorator = baidu.ui.createUI(function(options){

}).extend({
    uiType : "decorator",

    type: 'box',

    //装饰器模板
    tpl : {
        "box" : "<table cellspacing='0' cellpadding='0' border='0' id='#{id}'>" + 
                "<tr>" + 
                "<td #{class}></td>" + 
                "<td #{class}></td>" + 
                "<td #{class}></td>" +
                "</tr>" + 
                "<tr>" + 
                //在ie中若td为空，当内容缩小时，td高度缩不去
                "<td #{class}><i style='visibility:hidden'>&nbsp;</i></td>" + 
                "<td #{class} id='#{innerWrapId}' valign='top'></td>" + 
                "<td #{class}><i style='visibility:hidden'>&nbsp;</i></td>" + 
                "</tr>" + 
                "<tr>" + 
                "<td #{class}></td>" + 
                "<td #{class}></td>" + 
                "<td #{class}></td>" + 
                "</tr>" + 
                "</table>"
    },

    //装饰器模板的Class填充列表
    tplClass : {
        "box" : ['lt', 'ct', 'rt', 'lc', 'cc', 'rc', 'lb', 'cb', 'rb']
    },

    /**
     * 获得装饰器内部ui的body元素
     */
    getInner : function(){
        return baidu.g(this.innerId);
    },
    
    getBox:function(){
        return baidu.g(this.getId('table'));
    },

    /**
     * 获得装饰器内部ui的main元素的外包装
     */
    _getBodyWrap : function(){
        return baidu.g(this.getId("body-wrap"));
    },

    /**
     *
     * 渲染装饰器
     *
     * 2010/11/15 调整实现方式，新的实现不会修改ui原来的main元素
     */
    render : function(){
        var me = this,
            decoratorMain = document.createElement('div'),
            uiMain = me.ui.getMain(),
            style = uiMain.style,
            ruleCount = 0;

        document.body.appendChild(decoratorMain);
        me.renderMain(decoratorMain),

        decoratorMain.className = me.getClass(me.type + "-main");

        decoratorMain.innerHTML = baidu.format(
            me.tpl[me.type], {
                id : me.getId('table'),
                'class' : function (value){
                    return "class='" + me.getClass(me.type + "-" + me.tplClass[me.type][ruleCount++]) + "'"
                },
                innerWrapId : me.getId("body-wrap")
            }
        );

        baidu.each(baidu.dom.children(uiMain), function(child){
            me._getBodyWrap().appendChild(child);
        });
        uiMain.appendChild(decoratorMain);

        me.innerId = uiMain.id;
        uiMain.getBodyHolder = me._getBodyWrap();
    }
    
});

/**
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: ui/behavior/decorator.js
 * author: berg
 * version: 1.1.0
 * date: 2010/11/1
 */







/**
 * 为ui控件添加装饰器
 */
(function(){
    var Decorator = baidu.ui.behavior.decorator = function(){
        this.addEventListener("onload", function(){
            var me = this,
                opt;
            baidu.each(me.decorator, function(decoratorName, i){
                opt = { ui : me , skin : me.skin };
                if(baidu.lang.isString(decoratorName)){
                    opt['type'] = decoratorName;
                }else{
                    baidu.extend(opt, decoratorName);
                }
                me._decoratorInstance[i] = new baidu.ui.Decorator(opt);
                me._decoratorInstance[i].render();
            });
        });

        this.addEventListener("ondispose", function(){
            this._decoratorInstance = [];
            baidu.each(this._decoratorInstance, function(decorator){
                decorator.dispose();
            });
        });
    };

    /**
     * 存放装饰器控件实例
     */
    Decorator._decoratorInstance = [];

    /**
     * 获取所有装饰器控件实例
     * @return {array|Decorator} 所有装饰器的数组或者单个装饰器
     */
    Decorator.getDecorator = function(){
        var instance = this._decoratorInstance;
        return instance.length > 0 ? instance : instance[0];
    };
})();
/**
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: ui/behavior/droppable.js
 * author: rocy
 * version: 1.0.0
 * date: 2010/09/16
 */



/**
 *
 * 为ui控件添加容纳拖拽控件的行为
 * ui控件初始化参数增加如下:
 * {
 * 	droppable  : 是否有drop行为
 *  dropHandler: 用于drop的DOM元素,
 *  dropOptions: 与baidu.dom.droppable的参数一致,
 *  
 * }
 */
(function(){
	var Droppable = baidu.ui.behavior.droppable = function(){
		var me = this;
		//默认仅发送事件
		me.dropOptions = baidu.extend({
            ondropover : function(event){
                me.dispatchEvent("ondropover",event);
            },
            ondropout : function(event){
                me.dispatchEvent("ondropout", event);
            },
            ondrop : function(event){
                me.dispatchEvent("ondrop", event);
            }
        },me.dropOptions);
        
		me.addEventListener("onload",function(){
			me.dropHandler = me.dropHandler || me.getBody();
			me.dropUpdate(me);
		});
	};
	
	Droppable.dropUpdate = function(options){
		var me = this;
		options && baidu.extend(me, options);
		//使已有drop失效,必须在droppable判定之前,使droppable支持动态修改
		me._theDroppable && me._theDroppable.cancel();
		if(!(me.droppable)){
			return;
		}
		me._theDroppable = baidu.dom.droppable(me.dropHandler, me.dropOptions);
	};
})();
/**
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 */






















/**
 * @author berg, lxp
 * @behavior 为ui控件添加定位行为
 *
 * 根据用户参数将元素定位到指定位置
 * TODO: 1. 用surround做触边折返场景时, 折返的大小通常是原始高宽+另一元素的高宽
 *
 * });
 */
(function() {
    var Posable = baidu.ui.behavior.posable = function() { };

    /**
     * 将控件或者指定元素的左上角放置到指定的坐标
     * @param {Array|Object} coordinate 定位坐标,相对文档左上角的坐标，可以是{x:200,y:300}格式，也可以是[200, 300]格式.
     * @param {HTMLElement|string} element optional 目标元素或目标元素的id，如果不指定，默认为当前控件的主元素.
     * @param {Object} options optional 选项，包括：position/coordinate/offset/insideScreen.
     */
    Posable.setPosition = function(coordinate, element, options) {
        element = baidu.g(element) || this.getMain();
        options = options || {};
        var me = this,
            args = [element, coordinate, options];
        me.__execPosFn(element, '_positionByCoordinate', options.once, args);
    };

    /**
     * 将元素放置到指定的坐标点
     *
     * @param {HTMLElement|string} source 要定位的元素.
     * @param {Array|Object} coordinate 定位坐标,相对文档左上角的坐标，可以是{x:200,y:300}格式，也可以是[200, 300]格式.
     * @param {Object} options optional 选项，同setPosition.
     */
    Posable._positionByCoordinate = function(source, coordinate, options, _scrollJustify) {
        coordinate = coordinate || [0, 0];
        options = options || {};
        
        var me = this,
            elementStyle = {},
            cH = baidu.page.getViewHeight(),
            cW = baidu.page.getViewWidth(),
            scrollLeft = baidu.page.getScrollLeft(),
            scrollTop  = baidu.page.getScrollTop(),
            sourceWidth = source.offsetWidth,
            sourceHeight = source.offsetHeight,
            offsetParent = source.offsetParent,
            parentPos = (!offsetParent || offsetParent == document.body) ? {left: 0, top: 0} : baidu.dom.getPosition(offsetParent);

        //兼容position大小写
        options.position = (typeof options.position !== 'undefined') ? options.position.toLowerCase() : 'bottomright';

        coordinate = _formatCoordinate(coordinate || [0, 0]);
        options.offset = _formatCoordinate(options.offset || [0, 0]);
    
        coordinate.x += (options.position.indexOf('right') >= 0 ? (coordinate.width || 0) : 0); 
        coordinate.y += (options.position.indexOf('bottom') >= 0 ? (coordinate.height || 0) : 0); 
        
        elementStyle.left = coordinate.x + options.offset.x - parentPos.left;
        elementStyle.top = coordinate.y + options.offset.y - parentPos.top;

        switch (options.insideScreen) {
           case "surround" :
                elementStyle.left += elementStyle.left < scrollLeft ? sourceWidth  + (coordinate.width || 0): 
                                    ((elementStyle.left + sourceWidth ) > (scrollLeft + cW) ? - sourceWidth - (coordinate.width || 0) : 0);
                elementStyle.top  += elementStyle.top  < scrollTop  ? sourceHeight  + (coordinate.height || 0):
                                    ((elementStyle.top  + sourceHeight) > (scrollTop  + cH) ? - sourceHeight - (coordinate.height || 0) : 0);
                break;
            case 'fix' :
                elementStyle.left = Math.max(
                        0 - parseFloat(baidu.dom.getStyle(source, 'marginLeft')) || 0,
                        Math.min(
                            elementStyle.left,
                            baidu.page.getViewWidth() - sourceWidth - parentPos.left
                            )
                        );
                elementStyle.top = Math.max(
                        0 - parseFloat(baidu.dom.getStyle(source, 'marginTop')) || 0,
                        Math.min(
                            elementStyle.top,
                            baidu.page.getViewHeight() - sourceHeight - parentPos.top
                            )
                        );
                break;
            case 'verge':
                var offset = {
                    width: (options.position.indexOf('right') > -1 ? coordinate.width : 0),//是否放在原点的下方
                    height: (options.position.indexOf('bottom') > -1 ? coordinate.height : 0)//是否放在原点的右方
                },
                optOffset = {
                    width: (options.position.indexOf('bottom') > -1 ? coordinate.width : 0),
                    height: (options.position.indexOf('right') > -1 ? coordinate.height : 0)
                };
               
                elementStyle.left -= (options.position.indexOf('right') >= 0 ? (coordinate.width || 0) : 0);
                elementStyle.top -= (options.position.indexOf('bottom') >= 0 ? (coordinate.height || 0) : 0);
                
                elementStyle.left += elementStyle.left + offset.width + sourceWidth - scrollLeft > cW - parentPos.left ?
                    optOffset.width - sourceWidth : offset.width;
                elementStyle.top += elementStyle.top + offset.height + sourceHeight - scrollTop > cH - parentPos.top ?
                    optOffset.height - sourceHeight : offset.height;
                break;
        }
        baidu.dom.setPosition(source, elementStyle);


        //如果因为调整位置令窗口产生了滚动条，重新调整一次。
        //可能出现死循环，用_scrollJustify保证重新调整仅限一次。
        if (!_scrollJustify && (cH != baidu.page.getViewHeight() || cW != baidu.page.getViewWidth())) {
            me._positionByCoordinate(source, coordinate, {}, true);
        }
        _scrollJustify || me.dispatchEvent('onpositionupdate');
    };

    /**
     * 根据参数不同，选择执行一次或者在window resize的时候再次执行某方法
     * @private
     *
     * @param {HTMLElement|string} element 根据此元素寻找window.
     * @param {string} fnName 方法名，会在this下寻找.
     * @param {Boolean} once 是否只执行一次.
     * @return {arguments} args 执行方法的参数.
     */
    Posable.__execPosFn = function(element, fnName, once, args) {
        var me = this;

        if (typeof once == 'undefined' || !once) {
            baidu.event.on(
                baidu.dom.getWindow(element),
                'resize',
                baidu.fn.bind.apply(me, [fnName, me].concat([].slice.call(args)))
            );
        }
        me[fnName].apply(me, args);
    };
    /**
     * 格式化坐标格式
     * @param {Object|array} coordinate 要调整的坐标格式.
     * @return {Object} coordinate 调整后的格式
     * 类似：{x : number, y : number}.
     */
    function _formatCoordinate(coordinate) {
        coordinate.x = coordinate[0] || coordinate.x || coordinate.left || 0;
        coordinate.y = coordinate[1] || coordinate.y || coordinate.top || 0;
        return coordinate;
    }
})();
/**
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 将控件或者指定元素与指定的元素对齐
 *
 * @param {HTMLElement|string} target 要对齐到的元素.
 * @param {HTMLElement|string} element optional 要对齐的元素或元素id，如果不指定，默认为当前控件的主元素.
 * @param {Object} options optional 选项，同setPosition方法.
 */
baidu.ui.behavior.posable.setPositionByElement =
    function(target, element, options) {
        target = baidu.g(target);
        element = baidu.g(element) || this.getMain();
        options = options || {};

        this.__execPosFn(element, '_setPositionByElement', options.once, arguments);
    };

/**
 * 将控件或者指定元素与指定的元素对齐
 * @private
 *
 * @param {HTMLElement|string} target 要对齐到的元素.
 * @param {HTMLElement|string} element optional 要对齐的元素或元素id，如果不指定，默认为当前控件的主元素.
 * @param {Object} options optional 选项，同setPosition方法.
 */
baidu.ui.behavior.posable._setPositionByElement = function(target, element, options){
    var targetPos = baidu.dom.getPosition(target);
    options.once = false;
    options.insideScreen = options.insideScreen || 'verge';
    targetPos.width = target.offsetWidth;
    targetPos.height = target.offsetHeight;
    this._positionByCoordinate(element, targetPos, options, true);
};
/**
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 将控件或者指定元素放置到当前鼠标位置
 *
 * @param {HTMLElement|string} element optional 要对齐的元素或元素id，如果不指定，默认为当前控件的主元素.
 * @param {Object} options optional 选项，同setPosition方法.
 */
baidu.ui.behavior.posable.setPositionByMouse = function(element, options) {
    var me = this;
    element = baidu.g(element) || me.getMain();
    me._positionByCoordinate(element, baidu.page.getMousePosition(), options);
};
/**
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: ui/behavior/sortable.js
 * author: fx
 * version: 1.0.0
 * date: 2010-12-21
 *
 */














//2011-2-23做了以下优化，在初始化的时候生成一个坐标与对象的键值对集合。
//再判断拖拽元素的坐标是否在键值对范围内，如果是就做排序操作。
(function() {

    var Sortable = baidu.ui.behavior.sortable = function() {
        this.addEventListener("dispose", function(){
            baidu.event.un(me.element, 'onmousedown', handlerMouseDown);
        });
    };

    /**
     * sortable : 组件公共行为，用来完成dom元素位置的交换.
     * 可以用于树的节点的排序，列表的排序等等.
     *
     *
     * @param {Array}  sortElements 被排序的元素数组.
     * @param {Array}  sortParentElement 被排序的元素的父元素，用来做事件代理的。.
     * @param {Object} options 可子定义参数.
     * sortHandlers {Array} 默认值[]  拖拽句柄数组，这个需要与elements一一对应.
     *                  如果handlers为空,那么整个sortElement都是可以进行拖拽。.
     *
     * sortDisabled {Boolean} 默认值
     *
     * sortRangeElement {HTMLElement} 默认值 null  定义拖拽的边界元素，就能在这个元素范围内进行拖拽
     *
     * sortRange {Array}    默认值[0,0,0,0] 鼠标的样式 排序的范围,排序的元素只能在这个范围进行拖拽
     *
     * onsortstart {Function}  排序开始的时候的事件
     *
     * onsort {Function}  正在排序时候的事件
     *
     * onsortend {Function}  排序结束时候的事件
     *
     */
     // TODO axis {String}   默认值 null .  坐标，当坐标为"x",元素只能水平拖拽，当坐标为"y",元素只能垂直拖拽。
     // TODO  delay {Integer}  默认值 0  当鼠标mousedown的时候延长多长时间才可以执行到onsortstart。
     //                        这个属性可以满足只点击但不排序的用户
     // TODO  useProxy 默认值 false  是否需要代理元素，在拖拽的时候是元素本身还是代理
     // 实现思路
     // 点击一组元素其中一个，在mousedown的时候将这个元素的position设为absolute,在拖动的时候判断
     // 此元素与其他元素是否相交，相交就在相交的元素下面生成一个空的占位符（宽和高与拖动元素一样），dragend的
     // 时候将此拖拽的元素替代占位符.那么排序就完成。
     // 完成此效果可以借助baidu.dom.drag来辅助实现.
     // 规则:
     // 1.这一组元素的style.position应该是一致的.
     // 2.这一组元素应该是同一html标签的元素.

    Sortable.sortUpdate = function(sortElements, sortParentElement, options) {
        var position,
            element,
            handler,
            me = this,
            rangeElementPostion,
            options = options || {};
        if (me.sortDisabled) {
            return false;
        }
        options.sortElements = sortElements;
        baidu.object.extend(me, options);
        me.sortHandlers = me.sortHandlers || me.sortElements;
        me.element = sortParentElement;
        me.sortRangeElement = baidu.g(me.sortRangeElement) || document.body;
        rangeElementPostion = baidu.dom.getPosition(me.sortRangeElement);
        //先将elements的position值存下来.在这里说明一下sortable的规则，对于elements,
        //应该是一组position值相同的元素。
        if (me.sortElements) {
            me._sortPosition = baidu.dom.getStyle(me.sortElements[0], 'position');
        }
        //设置range 上右下左
        if(!me.sortRange){
            me.sortRange = [
                rangeElementPostion.top,
                rangeElementPostion.left + me.sortRangeElement.offsetWidth,
                rangeElementPostion.top + me.sortRangeElement.offsetHeight,
                rangeElementPostion.left
            ];
        }

        baidu.event.on(me.element, 'onmousedown', mouseDownHandler);

    };

    function isInElements(elements, element) {
        var len = elements.length,
            i = 0;
        for (; i < len; i++) {
            if (elements[i] == element) {
                return true;
            }
        }
    }
    
    /*
     * 事件代理，放在sortElement的父元素上
     */
    function mouseDownHandler(event) {
        var element = baidu.event.getTarget(event),
            position = baidu.dom.getPosition(element),
            parent = element.offsetParent,
            parentPosition = (parent.tagName == 'BODY') ? {left: 0, top: 0} : baidu.dom.getPosition(parent);
            if (!isInElements(me.sortElements, element)) {
                return false;
            }
            baidu.dom.setStyles(element, {
                left: (position.left - parentPosition.left) + 'px',
                top: (position.top - parentPosition.top) + 'px',
                //如果position为relative,拖动元素，还会占有位置空间，所以在这里将
                //position设置为'absolute'
                position: 'absolute'
            });
            me._sortBlankDivId = me._sortBlankDivId || _createBlankDiv(element, me).id;
            baidu.dom.drag(element, {range: me.sortRange,
                ondragstart: function(trigger) {
                    me.sortElementsMap = _getElementsPosition(me.sortHandlers);
                    me.dispatchEvent('sortstart', {trigger: trigger});
                },
                ondrag: function(trigger) {
                    var elements = me.sortHandlers,
                        i = 0,
                        len = elements.length,
                        target,
                        position = baidu.dom.getPosition(trigger);
                    target = getTarget(
                            position.left,
                            position.top,
                            trigger.offsetWidth,
                            trigger.offsetHeight,
                            me.sortElementsMap
                        );
                    if (target != null) {
                        me._sortTarget = target;
                        baidu.dom.insertAfter(_getBlankDiv(me), target);
                    }
                    me.dispatchEvent('sort', {trigger: trigger});
                },

                ondragend: function(trigger) {
                    if (me._sortTarget) {
                        baidu.dom.insertAfter(trigger, me._sortTarget);
                        me.dispatchEvent('sortend', {trigger: trigger, reciever: me._sortTarget});
                    }
                    baidu.dom.remove(_getBlankDiv(me));
                    me._sortBlankDivId = null;
                    baidu.dom.setStyles(trigger, {position: me._sortPosition, left: '0px', top: '0px'});

                }
            });

    }

    //通过拖拽的元素的x,y坐标和宽高来定位到目标元素。
    function getTarget(left, top, width, height, map) {
        var i,
            _height,
            _width,
            _left,
            _top,
            array,
            max = Math.max,
            min = Math.min;
        for (i in map) {
            array = i.split('-');
            _left = +array[0];
            _top = +array[1];
            _width = +array[2];
            _height = +array[3];
            if (max(_left, left) <= min(_left + _width, left + width)
               && max(_top, top) <= min(_top + _height, top + height)) {
               return map[i];
            }
        }
        return null;
    }


    //取得一组元素的定位与元素的map
    function _getElementsPosition(elements) {
        var map = {},
            position;
        baidu.each(elements, function(item) {
            position = baidu.dom.getPosition(item);
            map[position.left + '-' + position.top + '-' + item.offsetWidth + '-' + item.offsetHeight] = item;
        });
        return map;
    }



    //取得空占位符的dom元素
    function _getBlankDiv(me) {
        return baidu.g(me.getId('sortBlankDiv'));
    }

    //创建一个空占位符的层
    function _createBlankDiv(trigger, me) {
        var div = baidu.dom.create('div', {
            id: me.getId('sortBlankDiv'),
            className: trigger.className
        });
        baidu.dom.setStyles(div, {
            width: trigger.offsetWidth + 'px',
            height: trigger.offsetHeight + 'px',
            borderWidth: '0px'
        });
        baidu.dom.insertBefore(div, trigger);
        return div;
    }

})();


/**
 * Tangram UI
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path: ui/behavior/statable/setStateHandler.js
 * author: berg
 * version: 1.0.0
 * date: 2010/12/14
 */




/**
 * 为statable行为添加DOM节点添加事件支持
 */

baidu.extend(baidu.ui.behavior.statable, {

    /**
     * dom的事件触发侦听器
     * @param {String} eventType 事件类型
     * @param {Object} group 状态类型，同一类型的相同状态会被加上相同的css
     * @param {Object} key 索引，在同一类中的索引
     * @param {Event} evnt 事件触发时的Event对象
     */
    _statableMouseHandler : function(eventType, group, key, evnt){
        this._fireEvent(eventType, group, key, evnt);
    },
    
    /**
     * 使用dom的形式为该节点增加事件
     * @param {html-element} element 事件源
     * @param {Object} group 状态类型，同一类型的相同状态会被加上相同的css
     * @param {Object} key 索引，在同一类中的索引
     * @memberOf {TypeName}
	 * @private
     * @return {Object} 格式：{evntName0 : handler0, evntName1 : handler1}
     */
    setStateHandler : function(element, group, key){
        var me = this, handler = {};
        if(typeof key == 'undefined'){group = key = "";}
        baidu.array.each(me._allEventsName, function(item){
            handler[item] = baidu.fn.bind("_statableMouseHandler", me, item, group, key);
            baidu.event.on(element, item, handler[item]);
        });
        me.addEventListener("dispose", function(){
            baidu.object.each(handler, function(item, key){
                baidu.event.un(element, key, item);
            });
        });
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */






/**
 * 使按钮支持capture，实现在按钮上点击并保持鼠标按着状态拖离鼠标，请在构造函数的options中定义capture参数为true来激活该状态
 * @name baidu.ui.Button.Button$capture
 * @addon baidu.ui.Button
 * @class
 * @param {Object} options options参数.
 * @config {Boolean} capture 当为true时表示需要使按钮是一个capture的按钮.
 * @author linlingyu
 */
baidu.ui.Button.register(function(me) {
    if (!me.capture) {return;}
    me.addEventListener('load', function() {
        var body = me.getBody(),
            //onMouseOut = body.onmouseout,
            mouseUpHandler = baidu.fn.bind(function(evt) {
                var target = baidu.event.getTarget(evt);
                if (target != body
                        && !baidu.dom.contains(body, target)
                        && me.getState()['press']) {
                    me.fire('mouseout', evt);
                }
            }),
            mouseOutHandler = function(evt) {
                if (!me.getState()['press']) {
                    me.fire('mouseout', evt);
                }
            };
        body.onmouseout = null;
        me.on(body, 'mouseout', mouseOutHandler);
        me.on(document, 'mouseup', mouseUpHandler);
    });
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 使按钮支持poll轮询，实现在按钮上点击并保持鼠标按着状态时连续激活事件侦听器
 * @name baidu.ui.Button.Button$poll
 * @addon baidu.ui.Button
 * @param   {Object}    options config参数.
 * @config  {Object}    poll 当为true时表示需要使按钮是一个poll的按钮，如果是一个json的描述，可以有两个可选参数：{interval: 100, time: 4}，interval表示轮询的时间间隔，time表示第一次执行和第二执行之间的时间间隔是time*interval毫秒 
 * @author linlingyu
 */
baidu.ui.Button.register(function(me) {
    if (!me.poll) {return;}
    baidu.lang.isBoolean(me.poll) && (me.poll = {});
    me.addEventListener('mousedown', function(evt) {
        var pollIdent = 0,
            interval = me.poll.interval || 100,
            timer = me.poll.time || 0;
        (function() {
            if (me.getState()['press']) {
                pollIdent++ > timer && me.onmousedown && me.onmousedown();
                me.poll.timeOut = setTimeout(arguments.callee, interval);
            }
        })();
    });
    me.addEventListener('dispose', function(){
        if(me.poll.timeOut){
            me.disable();
            window.clearTimeout(me.poll.timeOut);
        }
    });
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */






















/**
 * 创建一个简单的日历对象
 * @name baidu.ui.Calendar
 * @class
 * @grammar new baidu.ui.Calendar(options)
 * @param {Object} options config参数
 * @config {String} weekStart 定义周的第一天，取值:'Mon'|'Tue'|'Web'|'Thu'|'Fri'|'Sat'|'Sun'，默认值'Sun'
 * @config {Date} initDate 以某个本地日期打开日历，默认值是当前日期
 * @config {Array} highlightDates 设定需要高亮显示的某几个日期或日期区间，格式:[date, {start:date, end:date}, date, date...]
 * @config {Array} disableDates 设定不可使用的某几个日期或日期区间，格式:[date, {start:date, end:date}, date, date...]
 * @config {Object} flipContent 设置翻转月份按钮的内容，格式{prev: '', next: ''}
 * @config {string} language 日历显示的语言，默认为中文 
 * @config {function} onclickdate 当点击某个日期的某天时触发该事件
 * @author linlingyu
 */
baidu.ui.Calendar = baidu.ui.createUI(function(options){
    var me = this;
    me.flipContent = baidu.object.extend({prev: '&lt;', next: '&gt;'},
        me.flipContent);
    me.addEventListener('mouseup', function(evt){
        var ele = evt.element,
            date = me._dates[ele],
            beforeElement = baidu.dom.g(me._currElementId);
        //移除之前的样子
        beforeElement && baidu.dom.removeClass(beforeElement, me.getClass('date-current'));
        me._currElementId = ele;
        me._initDate = date;
        //添加现在的样式
        baidu.dom.addClass(baidu.dom.g(ele), me.getClass('date-current'));
        me.dispatchEvent('clickdate', {date: date});
    });
}).extend(
/**
 *  @lends baidu.ui.Calendar.prototype
 */
{
    uiType: 'calendar',
    weekStart: 'Sun',//定义周的第一天
    statable: true,
    language: 'zh-CN',
    
    tplDOM: '<div id="#{id}" class="#{class}">#{content}</div>',
    tplTable: '<table border="0" cellpadding="0" cellspacing="1" class="#{class}"><thead class="#{headClass}">#{head}</thead><tbody class="#{bodyClass}">#{body}</tbody></table>',
    tplDateCell: '<td id="#{id}" class="#{class}" #{handler}>#{content}</td>',
    tplTitle: '<div id="#{id}" class="#{class}"><div id="#{labelId}" class="#{labelClass}">#{text}</div><div id="#{prevId}" class="#{prevClass}"></div><div id="#{nextId}" class="#{nextClass}"></div></div>',
    
    /**
     * 对initDate, highlight, disableDates, weekStart等参数进行初始化为本地时间
     * @private
     */
    _initialize: function(){
        var me = this;
        function initDate(array){
            var arr = [];
            //格式:[date, {start:date, end:date}, date, date...]
            baidu.array.each(array, function(item){
                arr.push(baidu.lang.isDate(item) ? me._toLocalDate(item)
                    : {start: me._toLocalDate(item.start), end: me._toLocalDate(item.end)});
            });
            return arr;
        }
        me._highlightDates = initDate(me.highlightDates || []);
        me._disableDates = initDate(me.disableDates || []);
        me._initDate = me._toLocalDate(me.initDate || new Date());//这个就是css中的current
        me._currDate = new Date(me._initDate.getTime());//这个是用于随时跳转的决定页面显示什么日历的重要date
        me.weekStart = me.weekStart.toLowerCase();
    },
    
    /**
     * 根据参数取得单个日子的json
     * @param {Date} date 一个日期对象
     * @return 返回格式{id:'', 'class': '', handler:'', date: '', disable:''}
     * @private
     */
    _getDateJson: function(date){
        var me = this,
            guid = baidu.lang.guid(),
            curr = me._currDate,
            css = [],
            disabled;
        function compare(srcDate, compDate){//比较是否同一天
            //不能用毫秒数除以一天毫秒数来比较(2011/1/1 0:0:0 2011/1/1 23:59:59)
            //不能用compDate - srcDate和一天的毫秒数来比较(2011/1/1 12:0:0 2011/1/2/ 0:0:0)
            return srcDate.getDate() == compDate.getDate()
                && Math.abs(srcDate.getTime() - compDate.getTime()) < 24 * 60 * 60 * 1000;
        }
        function contains(array, date){
            var time = date.getTime();
            return baidu.array.some(array, function(item){
                if(baidu.lang.isDate(item)){
                    return compare(item, date);
                }else{
                    return compare(item.start, date)
                        || time > item.start.getTime()
                        && time <= item.end.getTime();
                }
            });
        }
        //设置非本月的日期的css
        date.getMonth() != curr.getMonth() && css.push(me.getClass('date-other'));
        //设置highlight的css
        contains(me._highlightDates, date) && css.push(me.getClass('date-highlight'));
        //设置初始化日期的css
        if(compare(me._initDate, date)){
            css.push(me.getClass('date-current'));
            me._currElementId = me.getId(guid);
        }
        //设置当天的css
        compare(me._toLocalDate(new Date()), date) && css.push(me.getClass('date-today'));
        //设置disabled disabled优先级最高，出现disable将清除上面所有的css运算
        disabled = contains(me._disableDates, date) && (css = []);
        return {
            id: me.getId(guid),
            'class': css.join('\x20'),//\x20－space
            handler: me._getStateHandlerString('', guid),
            date: date,
            disabled: disabled
        };
    },
    
    /**
     * 取得参数日期对象所对月份的天数
     * @param {Number} year 年份
     * @param {Number} month 月份
     * @private
     */
    _getMonthCount: function(year, month){
        var invoke = baidu.i18n.date.getDaysInMonth,
            monthArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            count;
        invoke && (count = invoke(year, month));
        if(!baidu.lang.isNumber(count)){
            count = 1 == month && (year % 4)
                && (year % 100 != 0 || year % 400 == 0) ? 29 : monthArr[month];
        }
        return count;
    },
    
    /**
     * 生成日期表格的字符串用于渲染日期表
     * @private
     */
    _getDateTableString: function(){
        var me = this,
            calendar = baidu.i18n.cultures[me.language].calendar,
            dayArr = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],//day index
//            curr = me._currLocalDate,//_currentLocalDate
            curr = me._currDate,
            year = curr.getFullYear(),
            month = curr.getMonth(),
            day = new Date(year, month, 1).getDay(),//取得当前第一天用来计算第一天是星期几，这里不需要转化为本地时间
            weekIndex = 0,//记录wekStart在day数组中的索引
            headArr = [],
            bodyArr = [],
            weekArray = [],
            disabledIds = me._disabledIds = [],
            i = 0,
            j = 0,
            len = dayArr.length,
            count,
            date;
        
        //运算星期标题
        for(; i < len; i++){
            dayArr[i] == me.weekStart && (weekIndex = i);
            (weekIndex > 0 ? headArr : weekArray).push('<td>', calendar.dayNames[dayArr[i]], '</td>');
        }
        headArr = headArr.concat(weekArray);
        headArr.unshift('<tr>');
        headArr.push('</tr>');
        //运算日期
        day = (day < weekIndex ? day + 7 : day) - weekIndex;//当月月初的填补天数
        count = Math.ceil((me._getMonthCount(year, month) + day) / len);
        me._dates = {};//用来存入td对象和date的对应关系在click时通过id取出date对象
        for(i = 0; i < count; i++){
            bodyArr.push('<tr>');
            for(j = 0; j < len; j++){
                date = me._getDateJson(new Date(year, month, i * len + j + 1 - day));//这里也不需要转化为本地时间
                //把被列为disable的日期先存到me._disabledIds中是为了在渲染后调用setState来管理
                me._dates[date.id] = date.date;
                date.disabled && disabledIds.push(date['id']);
                bodyArr.push(baidu.string.format(me.tplDateCell, {
                    id: date['id'],
                    'class': date['class'],
                    handler: date['handler'],
                    content: date['date'].getDate()
                }));
            }
            bodyArr.push('</tr>');
        }
        return baidu.string.format(me.tplTable, {
            'class': me.getClass('table'),
            headClass: me.getClass('week'),
            bodyClass: me.getClass('date'),
            head: headArr.join(''),
            body: bodyArr.join('')
        });
    },
    
    /**
     * 生成日期容器的字符串
     * @private
     */
    getString: function(){
        var me = this;
        return baidu.string.format(me.tplDOM, {
            id: me.getId(),
            'class': me.getClass(),
            content: baidu.string.format(me.tplDOM, {
                id: me.getId('content'),
                'class': me.getClass('content')
            })
        });
    },
    
    /**
     * 将一个非本地化的日期转化为本地化的日期对象
     * @param {Date} date 一个非本地化的日期对象
     * @private
     */
    _toLocalDate: function(date){//很多地方都需要使用到转化，为避免总是需要写一长串i18n特地做成方法吧
        return date ? baidu.i18n.date.toLocaleDate(date, null, this.language)
            : date;
    },
    
    /**
     * 渲染日期表到容器中
     * @private
     */
    _renderDate: function(){
        var me = this;
        baidu.dom.g(me.getId('content')).innerHTML = me._getDateTableString();
        //渲染后对disabled的日期进行setState管理
        baidu.array.each(me._disabledIds, function(item){
            me.setState('disabled', item);
        });
    },
    
    /**
     * 左右翻页跳转月份的基础函数
     * @param {String} pos 方向 prev || next
     * @private
     */
    _basicFlipMonth: function(pos){
        var me = this,
            curr = me._currDate,
            month = curr.getMonth() + (pos == 'prev' ? -1 : 1),
            year = curr.getFullYear() + (month < 0 ? -1 : (month > 11 ? 1 : 0));
        month = month < 0 ? 12 : (month > 11 ? 0 : month);
        curr.setYear(year);
        me.gotoMonth(month);
        me.dispatchEvent(pos + 'month', {date: new Date(curr.getTime())});
    },
    
    /**
     * 渲染日历表的标题说明，如果对标题说明有特列要求，可以覆盖方法来实现
     */
    renderTitle: function(){
        var me = this, prev, next,
            curr = me._currDate,
            calendar = baidu.i18n.cultures[me.language].calendar,
            ele = baidu.dom.g(me.getId('label')),
            txt = baidu.string.format(calendar.titleNames, {
                yyyy: curr.getFullYear(),
                MM: calendar.monthNames[curr.getMonth()],
                dd: curr.getDate()
            });
        if(ele){
            ele.innerHTML = txt;
            return;
        }
        baidu.dom.insertHTML(me.getBody(),
            'afterBegin',
            baidu.string.format(me.tplTitle, {
                id: me.getId('title'),
                'class': me.getClass('title'),
                labelId: me.getId('label'),
                labelClass: me.getClass('label'),
                text: txt,
                prevId: me.getId('prev'),
                prevClass: me.getClass('prev'),
                nextId: me.getId('next'),
                nextClass: me.getClass('next')
            })
        );
        function getOptions(pos){
            return {
                classPrefix: me.classPrefix + '-' + pos + 'btn',
                skin: me.skin ? me.skin + '-' + pos : '',
                content: me.flipContent[pos],
                poll: {time: 4},
                element: me.getId(pos),
                autoRender: true,
                onmousedown: function(){
                    me._basicFlipMonth(pos);
                }
            };
        }
        prev = new baidu.ui.Button(getOptions('prev'));
        next = new baidu.ui.Button(getOptions('next'));
        me.addEventListener('ondispose', function(){
            prev.dispose();
            next.dispose();
        });
    },
    
    /**
     * 渲染日期组件到参数指定的容器中
     * @param {HTMLElement} target 一个用来存放组件的容器对象
     */
    render: function(target){
        var me = this,
            skin = me.skin;
        if(!target || me.getMain()){return;}
        baidu.dom.insertHTML(me.renderMain(target), 'beforeEnd', me.getString());
        me._initialize();
        me.renderTitle();
        me._renderDate();
        baidu.dom.g(me.getId('content')).style.height = 
            (me.getBody().clientHeight || me.getBody().offsetHeight)
            - baidu.dom.g(me.getId('title')).offsetHeight + 'px';
        me.dispatchEvent('onload');
    },
    
    /**
     * 更新日期的参数
     * @param {Object} options 参数，具体请参照构造中的options
     */
    update: function(options){
        var me = this;
        baidu.object.extend(me, options || {});
        me._initialize();
        me.renderTitle();
        me._renderDate();
        me.dispatchEvent('onupdate');
    },
    
    /**
     * 跳转到某一天
     * @param {Date} date 一个非本地化的日期对象
     */
    gotoDate: function(date){
        var me = this;
        me._currDate = me._toLocalDate(date);
        me._initDate = me._toLocalDate(date);
        me.renderTitle();
        me._renderDate();
        me.dispatchEvent('ongotodate');
    },
    
    /**
     * 跳转到某一年
     * @param {Number} year 年份
     */
    gotoYear: function(year){
        var me = this,
            curr = me._currDate,
            month = curr.getMonth(),
            date = curr.getDate(),
            count;
        if(1 == month){//如果是二月份
            count = me._getMonthCount(year, month);
            date > count && curr.setDate(count);
        }
        curr.setFullYear(year);
        me.renderTitle();
        me._renderDate();
        me.dispatchEvent('ongotoyear');
    },
    
    /**
     * 跳转到当前年份的某个月份
     * @param {Number} month 月份，取值(0, 11)
     */
    gotoMonth: function(month){
        var me = this,
            curr = me._currDate,
            month = Math.min(Math.max(month, 0), 11),
            date = curr.getDate(),
            count = me._getMonthCount(curr.getFullYear(), month);
        date > count && curr.setDate(count);
        curr.setMonth(month);
        me.renderTitle();
        me._renderDate();
        me.dispatchEvent('ongotomonth');
    },
    
    /**
     * 取得一个本地化的当天的日期
     * @return {Date} 返回一个本地当天的时间
     */
    getToday: function(){
        return this._toLocalDate(new Date());
    },
    
    /**
     * 返回一个当前选中的当地日期对象
     * @return {Date} 返回一个本地日期对象
     */
    getDate: function(){
        return new Date(this._initDate.getTime());
    },
    
    /**
     * 用一个本地化的日期设置当前的显示日期
     * @param {Date} date 一个当地的日期对象
     */
    setDate: function(date){
        if(baidu.lang.isDate(date)){
            var me = this;
            me._initDate = date;
            me._currDate = date;
        }
    },
    
    /**
     * 翻页到上一个月份，当在年初时会翻到上一年的最后一个月份
     */
    prevMonth: function(){
        this._basicFlipMonth('prev');
    },
    
    /**
     * 翻页到下一个月份，当在年末时会翻到下一年的第一个月份
     */
    nextMonth: function(){
        this._basicFlipMonth('next');
    },
        
    /**
     * 析构函数
     */
    dispose: function(){
        var me = this;
        me.dispatchEvent('dispose');
        baidu.dom.remove(me.getMain());
        baidu.lang.Class.prototype.dispose.call(me);
    }
});
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */






















/**
 * 创建一个简单的滚动组件
 * @name baidu.ui.Carousel
 * @class
 * @grammar new baidu.ui.Carousel(options)
 * @param {Object} options config参数.
 * @config {String} orientation 描述该组件是创建一个横向滚动组件或是竖向滚动组件，取值：horizontal:横向, vertical:竖向
 * @config {Object} contentText 定义carousel组件每一项的字符数据，格式：[{content: 'text-0'}, {content: 'text-1'}, {content: 'text-2'}...]
 * @config {String} flip 定义组件的翻页方式，取值：item:一次滚动一个项, page:一次滚动一页
 * @config {Number} pageSize 描述一页显示多少个滚动项，默认值是3
 * @config {function} onload 当渲染完组件时触发该事件
 * @config {function} onbeforescroll 当开始滚动时触发该事件，该事件的event参数中可以得到四个属性：index:当前需要滚动的索引, scrollOffset:滚动到可视区域的位置, direction:滚动方向, scrollUnit:需要滚动过多少个项
 * @config {function} onafterscroll 当结束一次滚动时触发该事件，该事件的event参数中可以得到四个属性：index:当前需要滚动的索引, scrollOffset:滚动到可视区域的位置, direction:滚动方向, scrollUnit:需要滚动过多少个项
 * @config {function} onprev 当翻到前一项或前一页时触发该事件
 * @config {function} onnext 当翻到下一项或下一页时触发该事件
 * @config {function} onitemclick 当点击某个项时触发该事件
 * @config {function} onfocus 当某一项获得焦点时触发该事件
 * @plugin autoScroll 为滚动组件增加自动滚动功能
 * @plugin btn 为滚动组件添加控制按钮插件
 * @plugin cycle 为滚动组件增加无限循环滚动功能
 * @plugin fx 为滚动组件增加动画滚动功能
 * @plugin splice 为滚动组件提供动态增加或是删减滚动项功能
 * @plugin table 支持在一个滚动项中放多个图片或是其它文字内容
 * @author linlingyu
 */



baidu.ui.Carousel = baidu.ui.createUI(function(options) {
    var me = this,
        data = me.contentText || [];
    me._dataList = data.slice(0, data.length);
    me._itemIds = [];
    me._items = {};//用来存入被删除的节点，当再次被使用时可以直接拿回来,格式:{element: dom, handler: []}
    me.flip = me.flip.toLowerCase();
    me.orientation = me.orientation.toLowerCase();
}).extend(
    /**
     *  @lends baidu.ui.Carousel.prototype
     */
{
    uiType: 'carousel',
    orientation: 'horizontal',//horizontal|vertical
    //direction: 'down',//up|right|down|left
    flip: 'item',//item|page
    pageSize: 3,
    scrollIndex: 0,
    _axis: {
        horizontal: {vector: '_boundX', pos: 'left', size: 'width', offset: 'offsetWidth', client: 'clientWidth', scrollPos: 'scrollLeft'},
        vertical: {vector: '_boundY', pos: 'top', size: 'height', offset: 'offsetHeight', client: 'clientHeight', scrollPos: 'scrollTop'}
    },
    /**
     * 生成一个容器的字符串
     * @return {String}
     * @private
     */
    getString: function() {
        var me = this,
            tpl = '<div id="#{id}" class="#{class}">#{content}</div>',
            str = baidu.string.format(tpl, {
                id: me.getId('scroll'),
                'class': me.getClass('scroll')
            });
        return baidu.string.format(tpl, {
            id: me.getId(),
            'class': me.getClass(),
            content: str
        });
    },
    /**
     * 渲染滚动组件到参数指定的容器中
     * @param {HTMLElement} target 一个用来存放组件的容器对象.
     */
    render: function(target) {
        var me = this;
        if (!target || me.getMain()) {return;}
        //先把已经存在的dataList生成出来guid
        baidu.array.each(me._dataList, function(item) {
	        me._itemIds.push(baidu.lang.guid());
	    });
        baidu.dom.insertHTML(me.renderMain(target), 'beforeEnd', me.getString());
        me._renderItems();
        me._resizeView();
        me._moveToMiddle();
        me.focus(me.scrollIndex);
        me.addEventListener('onbeforeendscroll', function(evt) {
            var orie = me.orientation == 'horizontal',
                axis = me._axis[me.orientation],
                sContainer = me.getScrollContainer();
            me._renderItems(evt.index, evt.scrollOffset);
            sContainer.style[axis.size] = parseInt(sContainer.style[axis.size])
                - me['_bound' + (orie ? 'X' : 'Y')].offset
                * evt.scrollUnit + 'px';
            me._moveToMiddle();
            me._scrolling = false;
        });
        me.dispatchEvent('onload');
    },
    /**
     * 从缓存中取出滚动项按照参数的格式在页面上排列出滚动项
     * @param {Number} index 索引值.
     * @param {Number} offset 指定索引项放在页面的位置.
     * @private
     */
    _renderItems: function(index, offset) {
        var me = this,
            sContainer = me.getScrollContainer(),
            index = Math.min(Math.max(index | 0, 0), me._dataList.length - 1),
            offset = Math.min(Math.max(offset | 0, 0), me.pageSize - 1),
            count = me.pageSize,
            i = 0,
            entry;
        while (sContainer.firstChild) {//这里改用innerHTML赋空值会使js存的dom也被清空
            baidu.dom.remove(sContainer.firstChild);
        }
        for (; i < count; i++) {
            entry = me._getItemElement(index - offset + i)
            sContainer.appendChild(entry.element);
            entry.setContent();
        }
    },
    /**
     * 将滚动容器排列到中间位置
     * @private
     */
    _moveToMiddle: function() {
        if (!this._boundX) {return;}
        var me = this,
            axis = me._axis[me.orientation];
        me.getBody()[axis.scrollPos] = me.orientation == 'horizontal'
            && baidu.browser.ie == 6 ? me._boundX.marginX : 0;
    },
    /**
     * 运算可视区域的宽高(包括对margin的运算)，并运算出一个滚动单位的offsetWidth和offsetHeight
     * @private
     */
    _resizeView: function() {
        if (this._dataList.length <= 0) {return;}//没有数据
        var me = this,
            axis = me._axis[me.orientation],
            orie = me.orientation == 'horizontal',
            sContainer = me.getScrollContainer(),
            child = baidu.dom.children(sContainer),
            boundX,
            boundY;
        function getItemBound(item, type) {
            var type = type == 'x',
                bound = item[type ? 'offsetWidth' : 'offsetHeight'],
                marginX = parseInt(baidu.dom.getStyle(item, type ? 'marginLeft' : 'marginTop')),
                marginY = parseInt(baidu.dom.getStyle(item, type ? 'marginRight' : 'marginBottom'));
            isNaN(marginX) && (marginX = 0);
            isNaN(marginY) && (marginY = 0);
            return {
//                size: bound,
                offset: bound + (orie ? marginX + marginY : Math.max(marginX, marginY)),
                marginX: marginX,
                marginY: marginY
            };
        }
        me._boundX = boundX = getItemBound(child[0], 'x');//设置滚动单位
        me._boundY = boundY = getItemBound(child[0], 'y');//设置滚动单位
        sContainer.style.width = boundX.offset
            * (orie ? child.length : 1)
            + (baidu.browser.ie == 6 ? boundX.marginX : 0)
            + 'px';
        sContainer.style.height = boundY.offset
            * (orie ? 1 : child.length)
            + (orie ? 0 : boundY.marginX)
            + 'px';
        me.getBody().style[axis.size] = me[axis.vector].offset * me.pageSize
            + (orie ? 0 : Math.min(me[axis.vector].marginX, me[axis.vector].marginY)) + 'px';
    },
    
    /**
     * 根据索引的从缓存中取出对应的滚动项，如果缓存不存在该项则创建并存入缓存，空滚动项不被存入缓存
     * @param {Number} index 索引值.
     * @return {HTMLElement}
     * @private
     */
    _baseItemElement: function(index) {
        var me = this,
            itemId = me._itemIds[index],
            entry = me._items[itemId] || {},
            txt = me._dataList[index],
            element;
        if (!entry.element) {
            entry.element = element = baidu.dom.create('div', {
                id: itemId || '',
                'class': me.getClass('item')
            });
            !itemId && baidu.dom.addClass(element, me.getClass('item-empty'));
            entry.content = txt ? txt.content : '';
            if (itemId) {
                entry.handler = [
                    {evtName: 'click', handler: baidu.fn.bind('_onItemClickHandler', me, element)},
                    {evtName: 'mouseover', handler: baidu.fn.bind('_onMouseHandler', me, 'mouseover')},
                    {evtName: 'mouseout', handler: baidu.fn.bind('_onMouseHandler', me, 'mouseout')}
                ];
                baidu.array.each(entry.handler, function(item) {
                    me.on(element, item.evtName, item.handler);
                });
                me._items[itemId] = entry;
            }
            entry.setContent = function(){
                this.content && (this.element.innerHTML = this.content);
                this.content && (delete this.content);
            }
        }
        return entry;
    },
    
    /**
     * 对_baseItemElement的再包装，在循环滚动中可以被重写
     * @param {Number} index 索引值.
     * @return {HTMLElement}
     */
    _getItemElement: function(index) {
        return this._baseItemElement(index);
    },
    /**
     * 处理点击滚动项的事件触发
     * @param {HTMLElement} ele 该滚动项的容器对象.
     * @param {Event} evt 触发事件的对象.
     * @private
     */
    _onItemClickHandler: function(ele, evt) {
        var me = this;
        me.focus(baidu.array.indexOf(me._itemIds, ele.id));
        me.dispatchEvent('onitemclick');
    },
    /**
     * 处理鼠标在滚动项上划过的事件触发
     * @param {String} type mouseover或是omouseout.
     * @param {Event} evt 触发事件的对象.
     * @private
     */
    _onMouseHandler: function(type, evt) {
        this.dispatchEvent('on' + type);
    },
    /**
     * 取得当前得到焦点项在所有数据项中的索引值
     * @return {Number} 索引值.
     */
    getCurrentIndex: function() {
        return this.scrollIndex;
    },
    /**
     * 取得数据项的总数目
     * @return {Number} 总数.
     */
    getTotalCount: function() {
        return this._dataList.length;
    },
    /**
     * 根据数据的索引值取得对应在页面的DOM节点，当节点不存时返回null
     * @param {Number} index 在数据中的索引值.
     * @return {HTMLElement} 返回一个DOM节点.
     */
    getItem: function(index) {
        return baidu.dom.g(this._itemIds[index]);
    },
    /**
     * 从当前项滚动到index指定的项，并将该项放在scrollOffset的位置
     * @param {Number} index 在滚动数据中的索引.
     * @param {Number} scrollOffset 在页面的显示位置，该参数如果不填默认值取0.
     * @param {String} direction 滚动方向，取值: prev:强制滚动到上一步, next:强制滚动到下一步，当不给出该值时，会自动运算一个方向来滚动.
     */
    scrollTo: function(index, scrollOffset, direction) {
        var me = this,
            axis = me._axis[me.orientation],
            scrollOffset = Math.min(Math.max(scrollOffset | 0, 0), me.pageSize - 1),
            sContainer = me.getScrollContainer(),
            child = baidu.dom.children(sContainer),
            item = me.getItem(index),
            smartDirection = direction,
            distance = baidu.array.indexOf(child, item) - scrollOffset,
            count = Math.abs(distance),
            len = me._dataList.length,
            i = 0,
            fragment,
            vergeIndex,
            vector,
            entry;
        //当移动距离是0，没有数据，index不合法，或是正处理滚动中。以上条件都退出
        if((item && distance == 0)
            || me._dataList.length <= 0 || index < 0
            || index > me._dataList.length - 1
            || me._scrolling) {return;}
        if (!smartDirection) {//如果方法参数没有给出合理的方向，需要自动运算合理的方向
            //如果index所对项已经存在于页，则以需要移动的距离来判断方法
            //如果不存在于页面，表示是远端运动，以可视区左边第一个有id的项来和index比较大小得出方向
            smartDirection = item ? (distance < 0 ? 'prev' : (distance > 0 ? 'next' : 'keep'))
                : baidu.array.indexOf(me._itemIds,
                    baidu.array.find(child, function(ele) {return !!ele.id}).id)
                    > index ? 'prev' : 'next';
        }
        vector = smartDirection == 'prev';
        if (!item) {//如果是一个远端移动
            //算出可视区中最接近index的一个项的索引，即边界索引
            vergeIndex = baidu.array.indexOf(me._itemIds,
                child[vector ? 0 : child.length - 1].id);
            //(x + len - y) % len
            //Math(offset - (is ? 0 : pz - 1)) + count
            //以上两个公式结合以后可以运算出当前边界项之后需要动态添加多少项而可以不管他的方向性
            count = Math.abs(scrollOffset - (vector ? 0 : me.pageSize - 1))
                + ((vector ? vergeIndex : index) + len - (vector ? index : vergeIndex)) % len;
            count > me.pageSize && (count = me.pageSize);
        }
        fragment = count > 0 && document.createDocumentFragment();
        //利用循环先把要移动的项生成并插入到相应的位置
        for (; i < count; i++) {
            entry = me._getItemElement(vector ? index - scrollOffset + i
                : me.pageSize + index + i - (item && !direction ? baidu.array.indexOf(child, item)
                    : scrollOffset + count));
            fragment.appendChild(entry.element);
            entry.setContent();//为了防止内存泄露在这里渲染内容，该方法只会渲染一次
        }
        vector ? sContainer.insertBefore(fragment, child[0])
            : sContainer.appendChild(fragment);
        distance = me[axis.vector].offset * count;//me[axis.vector].offset是单个项的移动单位
        //扩大scrollContainer宽度，让上面插入的可以申展开
        sContainer.style[axis.size] = parseInt(sContainer.style[axis.size]) + distance + 'px';
        //scrollContainer改变宽度后需要对位置重新调整，让可视区保持不保
        vector && (me.getBody()[axis.scrollPos] += distance);
        me._scrolling = true;//开始滚动
        if (me.dispatchEvent('onbeforescroll', {index: index, scrollOffset: scrollOffset,
            direction: smartDirection, scrollUnit: count})) {
            me.getBody()[axis.scrollPos] += count * me[axis.vector].offset * (vector ? -1 : 1);
            me.dispatchEvent('onbeforeendscroll', {index: index, scrollOffset: scrollOffset,
                direction: smartDirection, scrollUnit: count});
            me.dispatchEvent('onafterscroll', {index: index, scrollOffset: scrollOffset,
                direction: smartDirection, scrollUnit: count});
        }
    },
    /**
     * 取得翻页的索引和索引在页面中的位置
     * @param {String} type 翻页方向，取值：prev:翻到上一步,next:翻到下一步.
     * @return {Object} {index:需要到达的索引项, scrollOffset:在页面中的位置}.
     * @private
     */
    _getFlipIndex: function(type) {
        var me = this,
            vector = me.flip == 'item',
            type = type == 'prev',
            currIndex = me.scrollIndex,
            index = currIndex + (vector ? 1 : me.pageSize) * (type ? -1 : 1),
            offset = vector ? (type ? 0 : me.pageSize - 1)
                : baidu.array.indexOf(baidu.dom.children(me.getScrollContainer()), me.getItem(currIndex));
        //fix flip page
        if (!vector && (index < 0 || index > me._dataList.length - 1)) {
            index = currIndex - offset + (type ? -1 : me.pageSize);
            offset = type ? me.pageSize - 1 : 0;
        }
        return {index: index, scrollOffset: offset};
    },
    /**
     * 翻页的基础处理方法
     * @param {String} type 翻页方向，取值：prev:翻到上一步,next:翻到下一步.
     * @private
     */
    _baseSlide: function(type) {
        if (!this.getItem(this.scrollIndex)) {return;}
        var me = this,
            sContainer = me.getScrollContainer(),
            flip = me._getFlipIndex(type);
        if(flip.index < 0 || flip.index > me._dataList.length - 1){return;}
        function moveByIndex(index, offset, type){
            me.addEventListener('onbeforeendscroll', function(evt){
                var target = evt.target;
                target.focus(evt.index);
                target.removeEventListener('onbeforeendscroll', arguments.callee);
            });
            me.scrollTo(index, offset, type);
        }
        if (me.flip == 'item') {
            me.getItem(flip.index) ? me.focus(flip.index)
                : moveByIndex(flip.index, flip.scrollOffset, type);
        }else {
            me._itemIds[flip.index]
                && moveByIndex(flip.index, flip.scrollOffset, type);
        }
    },
    /**
     * 翻到上一项或是翻到上一页
     */
    prev: function() {
        var me = this;
        me._baseSlide('prev');
        me.dispatchEvent('onprev');
    },
    /**
     * 翻到下一项或是翻到下一页
     */
    next: function() {
        var me = this;
        me._baseSlide('next');
        me.dispatchEvent('onnext');
    },
    /**
     * 是否已经处在第一项或第一页
     * @return {Boolean} true:当前已是到第一项或第一页.
     */
    isFirst: function() {
        var flip = this._getFlipIndex('prev');
        return flip.index < 0;
    },
    /**
     * 是否已经处在末项或是末页
     * @return {Boolean} true:当前已是到末项或末页.
     */
    isLast: function() {
        var flip = this._getFlipIndex('next');
        return flip.index >= this._dataList.length;
    },
    /**
     * 使当前选中的项失去焦点
     * @private
     */
    _blur: function() {
        var me = this,
            itemId = me._itemIds[me.scrollIndex];
        if (itemId) {
            baidu.dom.removeClass(me._baseItemElement(me.scrollIndex).element,
                me.getClass('item-focus'));
            me.scrollIndex = -1;
        }
    },
    /**
     * 使某一项得到焦点
     * @param {Number} index 需要得到焦点项的索引.
     */
    focus: function(index) {
        var me = this,
            itemId = me._itemIds[index],
            item = itemId && me._baseItemElement(index);//防止浪费资源创出空的element
        if (itemId) {
            me._blur();
            baidu.dom.addClass(item.element, me.getClass('item-focus'));
            me.scrollIndex = index;
            me.dispatchEvent('onfocus', {index: index});
        }
    },
    /**
     * 取得存放所有项的上层容器
     * @return {HTMLElement} 一个HTML元素.
     */
    getScrollContainer: function() {
        return baidu.dom.g(this.getId('scroll'));
    },
    /**
     * 析构函数
     */
    dispose: function() {
        var me = this;
        me.dispatchEvent('ondispose');
        baidu.dom.remove(me.getMain());
        baidu.lang.Class.prototype.dispose.call(me);
    }
});
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */





/**
 * 为滚动组件增加无限循环滚动功能
 * @name baidu.ui.Carousel.Carousel$cycle
 * @addon baidu.ui.Carousel
 * @param {Object} options config参数.
 * @config {Boolean} isCycle 是否支持循环滚动，默认支持
 * @author linlingyu
 */
baidu.ui.Carousel.register(function(me) {
    if (!me.isCycle) {return;}
    me._itemsPool = {};//重复项的缓存
    /**
     * 对core方法重写
     * @private
     */
    me._getItemElement = function(index) {//不覆盖prototype链上的方法
        var me = this,
            count = me._dataList.length,
            index = (index + count) % count,
            itemId = me._itemIds[index],
            entry = baidu.dom.g(itemId) ? me._itemsPool[itemId + '-buff']
                : me._baseItemElement(index);
        if (!entry) {//如果entry还未存在于buff中
            entry = me._itemsPool[itemId + '-buff'] = {
                element: baidu.dom.create('div', {
                    id: itemId + '-buff',
                    'class': me.getClass('item')
                }),
                content : me._dataList[index].content,
                setContent: function(){
                    this.content && (this.element.innerHTML = this.content);
                    this.content && (delete this.content);
                }
            };
        }
        return entry;
    }
    /**
     * 对core方法重写
     * @private
     */
    me._getFlipIndex = function(type) {
        var me = this,
            is = me.flip == 'item',
            type = type == 'prev',
            currIndex = me.scrollIndex,
            index = currIndex + (is ? 1 : me.pageSize) * (type ? -1 : 1),
            offset = is ? (type ? 0 : me.pageSize - 1)
                : baidu.array.indexOf(baidu.dom.children(me.getScrollContainer()), me.getItem(currIndex)),
            count = me._dataList.length;
        return {index: (index + count) % count, scrollOffset: offset};
    }

    me.addEventListener('onremoveitem', function(evt) {
        delete this._itemsPool[evt.id + '-buff'];
    });
});
baidu.ui.Carousel.prototype.isCycle = true;
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */





/**
 * 为滚动组件增加自动滚动功能
 * @name baidu.ui.Carousel.Carousel$autoScroll
 * @addon baidu.ui.Carousel.Carousel
 * @param {Object} options config参数.
 * @config {Boolean} isAutoScroll 是否支持自动滚动，默认支持
 * @config {Number} scrollInterval 以毫秒描述每次滚动的时间间隔
 * @config {String} direction 取值，up|right|down|left 描述组件的滚动方向
 * @config {Function} onautuscroll 一个事件，当触发一次autoscroll时触发该事件
 */
baidu.ui.Carousel.register(function(me){
    if(!me.isAutoScroll){return;}
    var key = me._getAutoScrollDirection();
    me.addEventListeners('onprev,onnext', function(){
        clearTimeout(me._autoScrollTimeout);//先清除上一次，防止多次运行
        me._autoScrollTimeout = setTimeout(function(){
            if(me._autoScrolling){
                me[key]();
                me.dispatchEvent('onautoscroll', {direction: key});
            }
        }, me.scrollInterval);
    });
    me.addEventListener('onload', function(evt){
        var me = evt.target;
        setTimeout(function(){
            me.startAutoScroll();
        }, me.scrollInterval);
    });
    me.addEventListener('ondispose', function(evt){
        clearTimeout(evt.target._autoScrollTimeout);
    });
});

baidu.ui.Carousel.extend(
/**
 *  @lends baidu.ui.Carousel.prototype
 */
{
    isAutoScroll: true,
    scrollInterval: 1000,
    direction: 'right',//up|right|down|left 描述组件的滚动方向
    _autoScrolling: true,
    /**
     * 取得当次设定的滚动方向字符串
     * @return {String} prev|next
     * @private
     */
    _getAutoScrollDirection: function(){
        var me = this,
            methods = {up: 'prev', right: 'next', down: 'next', left: 'prev'};
        return methods[me.direction.toLowerCase()]
            || methods[me.orientation == 'horizontal' ? 'right' : 'down'];
    },
    /**
     * 从停止状态开始自动滚动
	 * @name baidu.ui.Carousel.Carousel$autoScroll.startAutoScroll
	 * @addon baidu.ui.Carousel.Carousel$autoScroll
	 * @function 
     */
    startAutoScroll: function(){
        var me = this,
            direction = me._getAutoScrollDirection();
        me._autoScrolling = true;
        me[direction]();
        me.dispatchEvent('onautoscroll', {direction: direction});
    },
    /**
     * 停止当前自动滚动状态
	 * @name baidu.ui.Carousel.Carousel$autoScroll.stopAutoScroll
	 * @addon baidu.ui.Carousel.Carousel$autoScroll
	 * @function 
     */
    stopAutoScroll: function(){
        var me = this;
        clearTimeout(me._autoScrollTimeout);
        me._autoScrolling = false;
    }
});
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */



/**
 * 为滚动组件添加控制按钮插件
 * @name baidu.ui.Carousel.Carousel$btn
 * @addon baidu.ui.Carousel
 * @param {Object} options config参数.
 * @config {Boolean} showButton 是否显示按钮，默认显示
 * @config {Object} btnLabel 设置按钮的文字描述，参考值：{prev: 'left', next: 'right'}
 * @author linlingyu
 */
baidu.ui.Carousel.register(function(me) {
    if (!me.showButton) {return;}
    me.btnLabel = baidu.object.extend({prev: '&lt;', next: '&gt;'},
        me.btnLabel);
    me.addEventListener('onload', function() {
        baidu.dom.insertHTML(me.getMain(), 'afterBegin', baidu.string.format(me.tplBtn, {
            'class' : me.getClass('btn-base') + ' ' + me.getClass('btn-prev'),
            handler: me.getCallString('prev'),
            content: me.btnLabel.prev
        }));
        baidu.dom.insertHTML(me.getMain(), 'beforeEnd', baidu.string.format(me.tplBtn, {
            'class' : me.getClass('btn-base') + ' ' + me.getClass('btn-next'),
            handler: me.getCallString('next'),
            content: me.btnLabel.next
        }));
    });
});
//
baidu.object.extend(baidu.ui.Carousel.prototype, {
    showButton: true,//是否需要显示翻转按钮
    tplBtn: '<a class="#{class}" onclick="#{handler}" href="javascript:void(0);">#{content}</a>'
});
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */





/**
 * 为滚动组件增加动画滚动功能
 * @name baidu.ui.Carousel.Carousel$fx
 * @addon baidu.ui.Carousel
 * @param {Object} options config参数.
 * @config {Boolean} enableFx 是否支持动画插件
 * @config {Function} scrollFx 描述组件的动画执行过程，默认是baidu.fx.scrollTo
 * @config {Object} scrollFxOptions 执行动画过程所需要的参数
 * @config {Function} onbeforestartscroll 当开始执行动画时触发该事件，该事件的event参数中可以得到四个属性：index:当前需要滚动的索引, scrollOffset:滚动到可视区域的位置, direction:滚动方向, scrollUnit:需要滚动过多少个项
 * @author linlingyu
 */
baidu.ui.Carousel.register(function(me) {
    if (!me.enableFx) {return;}
    me.addEventListener('onbeforescroll', function(evt) {
        if (baidu.fx.current(me.getBody())) {return;}
        var is = evt.direction == 'prev',
            axis = me._axis[me.orientation],
            orie = me.orientation == 'horizontal',
            val = me.getBody()[axis.scrollPos] + evt.scrollUnit * me[axis.vector].offset * (is ? -1 : 1);
        me.scrollFxOptions = baidu.object.extend(me.scrollFxOptions, {
            carousel: me,
            index: evt.index,
            scrollOffset: evt.scrollOffset,
            direction: evt.direction,
            scrollUnit: evt.scrollUnit
        });
        baidu.lang.isFunction(me.scrollFx) && me.scrollFx(me.getBody(),
            {x: orie ? val : 0, y: orie ? 0 : val}, me.scrollFxOptions);
        evt.returnValue = false;
    });
});
//
baidu.ui.Carousel.extend({
    enableFx: true,
    scrollFx: baidu.fx.scrollTo,
    scrollFxOptions: {
        duration: 500,
        onbeforestart: function(evt) {
            var timeLine = evt.target;
            evt.target.carousel.dispatchEvent('onbeforestartscroll', {
                index: timeLine.index,
                scrollOffset: timeLine.scrollOffset,
                direction: timeLine.direction,
                scrollUnit: timeLine.scrollUnit
            });
        },
        
        onafterfinish: function(evt) {
            var timeLine = evt.target;
            timeLine.carousel.dispatchEvent('onbeforeendscroll', {
                index: timeLine.index,
                scrollOffset: timeLine.scrollOffset,
                direction: timeLine.direction,
                scrollUnit: timeLine.scrollUnit
            });
            timeLine.carousel.dispatchEvent('onafterscroll', {
                index: timeLine.index,
                scrollOffset: timeLine.scrollOffset,
                direction: timeLine.direction,
                scrollUnit: timeLine.scrollUnit
            });
        }
    }
});
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */










/**
 * 为滚动组件提供动态增加或是删减滚动项功能
 * @name baidu.ui.Carousel.Carousel$splice
 * @addon baidu.ui.Carousel
 */
baidu.ui.Carousel.extend(
/**
 *  @lends baidu.ui.Carousel.prototype
 */
{
    /**
     * 增加一个滚动项
     * @param {String} content 需要插入项的字符内容
     * @param {Number} index 插入位置
     * @private
     */
    _addText: function(content, index){
        var me = this,
            child = baidu.dom.children(me.getScrollContainer()),
            index = Math.min(Math.max(baidu.lang.isNumber(index) ? index : me._dataList.length, 0), me._dataList.length),
            item = me.getItem(me.scrollIndex),
            firstIndex = baidu.array.indexOf(me._itemIds, child[0].id),
            newIndex;
        
        me._dataList.splice(index, 0, {content: content});
        me._itemIds.splice(index, 0, baidu.lang.guid());
        index <= me.scrollIndex && me.scrollIndex++;
        //
        newIndex = item ? me.scrollIndex : baidu.array.indexOf(me._itemIds, child[0].id);
        index >= firstIndex && index <= firstIndex + me.pageSize - 1
            && me._renderItems(newIndex, baidu.array.indexOf(child, me.getItem(newIndex)));
    },
        /**
     * 移除索引指定的某一项
     * @param {Number} index 要移除项的索引
     * @return {HTMLElement} 当移除项存在于页面时返回该节点
     * @private
     */
    _removeItem: function(index){
        if(!baidu.lang.isNumber(index) || index < 0
            || index > this._dataList.length - 1){return;}
        var me = this,
            removeItem = me.getItem(index),
            currItem = me.getItem(me.scrollIndex),
            itemId = me._itemIds[index],
            item = me._items[itemId],
            child = baidu.dom.children(me.getScrollContainer()),
            currIndex = me.scrollIndex,
            newIndex,
            scrollOffset;
        item && baidu.array.each(item.handler, function(listener){
            baidu.event.un(item.element, listener.evtName, listener.handler);
        });
        delete me._items[itemId];
        me._dataList.splice(index, 1);
        me._itemIds.splice(index, 1);
        (me.scrollIndex > me._dataList.length - 1
            || me.scrollIndex > index) && me.scrollIndex--;
        if(removeItem){
            index == currIndex && me.focus(me.scrollIndex);
            newIndex = currItem ? me.scrollIndex : baidu.array.indexOf(me._itemIds,
                baidu.array.find(child, function(item){return item.id != itemId;}).id);
            scrollOffset = baidu.array.indexOf(child, me.getItem(newIndex));
            index <= newIndex && newIndex < me.pageSize && scrollOffset--;
            me._renderItems(newIndex, scrollOffset);
        }
        return removeItem;
    },
    /**
     * 将一个字符串的内容插入到索引指定的位置
	 * @name baidu.ui.Carousel.Carousel$splice.addText
	 * @addon baidu.ui.Carousel.Carousel$splice
	 * @function 
     * @param {String} content 需要插入项的字符内容
     * @param {Number} index 插入位置
     */
    addText: function(content, index){
        var me = this;
        me._addText(content, index);
        me.dispatchEvent('onaddtext', {index: index});
    },
    /**
     * 将一个element项的内容插入到索引指定的位置
	 * @name baidu.ui.Carousel.Carousel$splice.addItem
	 * @addon baidu.ui.Carousel.Carousel$splice
	 * @function 
     * @param {HTMLElement} element 需要插入项的元素
     * @param {Number} index 插入位置
     */
    addItem: function(element, index){
        var me = this;
        me._addText(element.innerHTML, index);
        me.dispatchEvent('onadditem', {index: index});
    },
    /**
     * 移除索引指定的某一项
	 * @name baidu.ui.Carousel.Carousel$splice.removeItem
	 * @addon baidu.ui.Carousel.Carousel$splice
	 * @function 
     * @param {Number} index 要移除项的索引
     * @return {HTMLElement} 当移除项存在于页面时返回该节点
     */
    removeItem: function(index){
        var me = this,
            item = me._removeItem(index);
        me.dispatchEvent('onremoveitem', {index: index});
        return item;
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */





















 /**
 * Table表格组件
 * @class
 * @grammar new baidu.ui.Table(options)
 * @param       {Object} options config参数
 * @config      {Object} data 生成表格的数据，格式[{id: "rsid0", content : ["column0", "column1"]}, {id : "rsid0", content : ["column0", "column1"]}], id不是必要，当有选择列时用来定义用户的checkbox的value
 * @config      {Object} columns 各个列的高级定义，格式[{index : 1, width : 100, type : "select"}, {index : 2, width : "100%", enableEdit : true}, {index : 3, width : "200px"}]
 * @plugin      btn		为翻页功能增加相关按钮
 * @plugin 		edit	支持单元格编辑
 * @plugin 		page	支持翻页
 * @plugin 		select	增加选择列
 * @plugin 		title	支持列标题
 */
baidu.ui.Table = baidu.ui.createUI(function(options){
    var me = this;
        me.data = me.data || [];        //数据
        me._rows = [];                  //所有的Row组件
//      me.columns = me.columns || [];  //列的设置信息
});
baidu.ui.Table.extend(
/**
 *  @lends baidu.ui.Table.prototype
 */
{
    uiType          : "table",
    tplBody         : '<div><table cellpadding="0" cellspacing="0" border="0" id="#{id}" class="#{class}" #{stateHandler}>#{rows}</table></div>',
    /**
     * 获得控件字符串
     * @private
     * @return {string} HTML string
     */
    getString : function(){
        var me = this;
        return baidu.format(me.tplBody, {
            id          : me.getId(),
            "class"     : me.getClass(),
            rows        : me._getRowsString()
        });
    },
    
    /**
     * 获得所有行的字符串
     * @private
     * @return {string} HTML string
     */
    _getRowsString : function(){
        var me = this,
            i = 0,
            len = me.data.length,
            rowsArr = [],
            row;
        
        for(; i < len; i++){
            row = me.getRow(i);
            if(!row){
                row = me._rows[i] = me._createRow(me.data[i]);
            }else {
                row.update(me.data[i]);
            }
            rowsArr.push(row.getString());
        }
        while(me._rows.length > me.data.length){//更新_rows中多余的数据,当update时user有可能会更新data
            me._rows.pop();
        }
        return rowsArr.join("");
    },
    
    /**
     * 渲染表格
     * @param {HTMLElement} target       目标父级元素
     */
    render : function(target){
        var me = this;
        if(!target){return;}
        baidu.dom.insertHTML(me.renderMain(target), "beforeEnd", me.getString());
        me.resizeColumn();
        me.dispatchEvent("onload");
    },
    
    /**
     * 更新表格
     * @public
     * @param     {object}                 options       选项
     * @config    {Object}                 data          生成表格的数据，格式[{id : "rsid0", content : ["column0", "column1"]}, {id : "rsid0", content : ["column0", "column1"]}], id不是必要，当有选择列时用来定义用户的checkbox的value
     * @config    {Object}                 columns       各个列的高级定义，格式[{index : 1, width : 100, type : "select"}, {index : 2, width : "100%", enableEdit : true}, {index : 3, width : "200px"}]
     * @config    {Object}                 title         定义表格列的title说明，格式：["colName0", "删除", "colName2", "colName3"]
     * @config    {Number}                 pageSize      一页显示多少行数据，默认全部显示
     */
    update : function(options){
        var me = this;
        options = options || {};
        baidu.object.extend(me, options);
        me.dispatchEvent("beforeupdate");
        me.getMain().innerHTML = me.getString();//getString会更新data
        me.resizeColumn();
        me.dispatchEvent("update");
    },
    
    /**
     * 按照columns的参数设置单元格的宽度
     * @private
     * @return {string} HTML string
     */
    resizeColumn : function(){
        var me = this,
            widthArray = [],
            row = me.getBody().rows[0];
        if(row && me.columns){
            baidu.array.each(me.columns, function(item){
                if(item.hasOwnProperty("width")){
                    baidu.dom.setStyles(row.cells[item.index], {width : item.width});
                }
            });
        }
    },
    /**
     * 创建一个行控件
     * @private
     * @param {object} options 
     * @return {baidu.ui.table.Row} 行控件
     */
    _createRow : function(options){
        options.parent = this;
        return new baidu.ui.Table.Row(options);
    },
    
    /**
     * 获得指定行控件
     * @public
     * @param {number}  index  索引
     * @return {baidu.ui.table.Row|null} 指定行控件
     */
    getRow : function(index){
        var row = this._rows[index];
        if(row && !row.disposed){
            return row;
        }
        //return this._rows[index] || null;
        return null;
    },

    /**
     * 获得表格中的行数
     * @public
     * @return {number} count 
     */
    getRowCount : function(){
        return this._rows.length;
    },
    
    /**
     * 添加行
     * @private
     * @param {Object} optoins  创建Row所需要的options
     * @param {number} index 可选参数，表示在指定的索引的row之前插入，不指定该参数将会在最后插入
     */
    _addRow : function(options, index){
        var me = this,
            index = baidu.lang.isNumber(index) ? index : me.getBody().rows.length,
            row = me._createRow(options);
        me.data.splice(index, 0, options);
        me._rows.splice(index, 0, row);
        row.insertTo(index);
        return row.getId();
    },
    
    /**
     * 添加行控件
     * @param {Object} options  创建Row所需要的options
     * @param {Number} index	在索引位置后创建Row
     */
    addRow : function(options, index){
        var me = this;
        me.dispatchEvent("addrow", {rowId : me._addRow(options, index)});
    },
    
    /**
     * 删除行
     * @private
     * @param {number} index 要删除的数据索引
     */
    _removeRow : function(index){
        var me = this,
            row = me._rows[index],
            rowId;
        if(row){
            rowId = row.getId();
            me.data.splice(index, 1);
            row.remove();
            me._rows.splice(index, 1);
            0 == index && me.resizeColumn();
        }
        return rowId;
    },
    
    /**
     * 删除行
     * @param {number} index 要删除的数据索引
     */
    removeRow : function(index){
        var me = this,
            rowId = me._removeRow(index);
        if(rowId){me.dispatchEvent("removerow", {rowId : rowId});}
    },
    
    /**
     * 获取target元素
     * @private
     * @return {HTMLElement} target
     */
    getTarget : function(){
        var me = this;
        return baidu.g(me.targetId) || me.getMain();
    },
    
    /**
     * 销毁当前实例
     */
    dispose : function(){
        var me = this;
        baidu.dom.remove(me.getId());
    }
});

/**
 * Row表格的行组件，Row组件，table的组合组件
 * @private
 * @class
 * @param       {Object}    options config参数
 * @config      {String}    id 标识该行的id，当该行存在checkbox复选框时，该id会被赋予checkbox的value
 * @config      {Array}     content 该行的单远格字符内容，如['column-1', 'column-2', 'column-3'...]
 */
baidu.ui.Table.Row = baidu.ui.createUI(function(options){
    this._cells = {};//所有生成的cell集合
    this.addState("selected");
}).extend(
/**
 * @lends baidu.ui.Table.Row.prototype
 */
{
    uiType : "table-row",
    statable : true,
    //tplBody : '<table cellpadding="0" cellspacing="0" border="0" width="#{width}" id="#{id}" class="#{class}" #{stateHandler}>#{rows}</table>',
    /**
     * 重写默认的getMain方法
     * 在Row控件中，main元素就是getId获得的元素
     * @return {HTMLElement} main main元素
     */
    getMain : function(){
        return baidu.g(this.getId());
    },

    /**
     * 获得控件字符串
     * @param {array} data 行中每一列中的数据
     */
    getString : function(){
        var me = this,
            colsArr = [],
            clazz = me.getClass("col"),
            columns = {};
        //提速
        colsArr.push("<tr id='", me.getId(), "' class='", me.getClass(), "' data-guid='", me.guid, "' ", me._getStateHandlerString(), ">");
        baidu.array.each(me.content, function(item, i){
            colsArr.push('<td>', item, '</td>');
        });
        colsArr.push("</tr>");
        return colsArr.join("");
    },
    
    /**
     * 更新当前控件
     * @param {object} options optional
     */
    update : function(options){
        var me = this,
            cols = baidu.dom.children(me.getMain());
        options = options || {};
        baidu.object.extend(me, options);
        baidu.array.each(cols, function(item, i){
            item.innerHTML = me.content[i];
        });
        me.dispatchEvent("update");
    },

    /**
     * 使用dom的方式在指定的索引位置插入一行
     * @param {Number} index 插入位置的索引
     * @memberOf {TypeName} 
     */
    insertTo : function(index){
        var me = this, row, cell;
        if(!me.getMain()){//防止多次调用
            row = me.getParent().getBody().insertRow(index);
            baidu.dom.setAttrs(row, {id : me.getId(), "class" : me.getClass(), "data-guid" : me.guid});
            me.setStateHandler(row);
            baidu.array.each(me.content, function(item, i){
                cell = row.insertCell(i);
                cell.innerHTML = item;
            });
        }
    },

    /**
     * 获得所有列元素
     * @return {array} cols
     */
    _getCols : function(){
        return baidu.dom.children(this.getId());
    },
    
    /**
     * 获得一行中所有列的字符串
     * @param {object} data  数据
     * @param {number} index  当前行的索引
     * @return {string} HTML string
     */
    _getColsString : function(data, index){
        return colsArr.join('');
    },

    /**
     * 选中当前行
     */
    select : function(){
        var me = this, id = me.getMain().id;
        if(!me.getState(id)['disabled']){
            me.setState("selected", id);
        }
    },

    /**
     * 去掉当前行的选中状态
     */
    unselect : function(){
        var me = this;
        me.removeState("selected", me.getMain().id);
    },

    /**
     * 移除当前行
     */
    remove : function(){
        var me = this;
        me.getParent().getBody().deleteRow(me.getBody().rowIndex);
        me.dispose();
    },

    /**
     * 如果指定行处于选中状态，让其取消选中状态，否则反之
     */
    toggle : function(){
        var me = this;
        if(me.getState(me.getMain().id)["selected"]){
            me.unselect();
        }else{
            me.select();
        }
    },

    /**
     * 根据索引取得单元格对象
     * @param {Number} index
     * @memberOf {TypeName} 
     * @return {baidu.ui.table.Cell} 
     */
    getCell : function(index){
        var me = this, td = me._getCols()[index], cell;
        if(td){
            if(td.id){
                cell = me._cells[td.id];
            }else{
                cell = new baidu.ui.Table.Cell({target : td});
                cell._initialize(me);
                me._cells[cell.getId()] = cell;
            }
        }
        td = null;
        return cell;
    },

    /**
     * 销毁实例
     * @memberOf {TypeName} 
     */
    dispose : function(){
        var me = this;
        me.dispatchEvent("dispose");
        baidu.lang.Class.prototype.dispose.call(me);
    }
});

/**
 * Cell单元格组件，当调用Row组件的getCell方法时该组件才会被生成
 * @private
 * @class Cell组件类
 */
baidu.ui.Table.Cell = baidu.ui.createUI(function(options){}).extend(
/**
 *  @lends baidu.ui.Table.Cell.prototype
 */
{
    uiType : 'table-cell',

    /**
     * 初始化cell并提供父级对象参数row
     * @param {Object} _parent
     * @memberOf {TypeName} 
     */
    _initialize : function(_parent){
        var me = this;
        me.setParent(_parent);
        baidu.dom.setAttrs(me.target, {id : me.getId(), "data-guid" : me.guid});
    },

    /**
     * 重写Main方法
     * @memberOf {TypeName} 
     * @return {html-td} 
     */
    getMain : function(){
        return baidu.dom.g(this.getId());
    },

    /**
     * 取得baidu.ui.table.Row对象
     * @memberOf {TypeName} 
     * @return {baidu.ui.table.Row} 
     */
    getParent : function(){
        return this._parent;
    },

    /**
     * 设置父对象
     * @param {Object} _parent
     * @memberOf {TypeName} 
     */
    setParent : function(_parent){
        this._parent = _parent;
    },

    /**
     * 取得单元格的字符串内容
     * @memberOf {TypeName} 
     * @return {string} 
     */
    getHTML : function(){
        return this.getMain().innerHTML;
    },

    /**
     * 设置单元格的字符串内容
     * @param {Object} content
     * @memberOf {TypeName} 
     */
    setHTML : function(content){
        var me = this, parent = me.getParent();
        parent.getParent().data[parent.getMain().rowIndex].content[me.getMain().cellIndex] = content;
        me.getMain().innerHTML = content;
    }
});
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */










/**
 * 支持在一个滚动项中放多个图片或是其它文字内容
 * @name baidu.ui.Carousel.Carousel$table
 * @addon baidu.ui.Carousel.Carousel
 * @param {Object} options config参数.
 * @config {Boolean} supportTable 是否支持表格项，默认支持
 * @config {Object} gridLayout 描述一个滚动项的内容是以多行多列的数据形式，例如：{row:3, col:2}
 */
baidu.ui.Carousel.register(function(me) {
    if(!me.supportTable){return;}
    me.gridLayout = baidu.object.extend({row: 3, col: 3},
        baidu.lang.isArray(me.gridLayout) ? baidu.array.hash(['row', 'col'], me.gridLayout)
            : me.gridLayout);
    me._dataList = me._formatTableData(me._dataList);
    me._tables = [];
    baidu.array.each(me._dataList, function(item, i){
        me._tables.push(new baidu.ui.Table({data: item}));
        me._dataList[i] = {content: me._tables[i].getString()};
    });
});

baidu.ui.Carousel.extend(
/**
 *  @lends baidu.ui.Carousel.prototype
 */
{
    supportTable: true,
    /**
	 * 将一维的数组通过layout格式化成二维的数据
	 * @param {Array} data 需要插入到table的数据(一维)
	 * @return {Array} 根据layout格式化后的数据(二维)
	 * @private
	 */
    _formatTableData: function(data){
        var me = this,
            layout = me.gridLayout,
            count = data.length,
            array = [],
            i = 0,
            table;
        for(; i < count; i++){
            i % (layout.row * layout.col) == 0 && array.push([]);
            table = array[array.length - 1];
            i % layout.col == 0 && table.push({content: []});
            table[table.length - 1].content.push(data[i].content);
        }
        return array;
    },
    /**
     * 在指定索引处插入一个新的多行多列表格
	 * @name baidu.ui.Carousel.Carousel$table.addTableItem
	 * @addon baidu.ui.Carousel.Carousel$table
     * @param {Object} data 需要插入的数据（一维数组），格式：[{content: 'col-0'}, {content: 'col-1'}, {content: 'col-2'}....]
     * @param {Number} index 在指定的索引处插入，默认在末端插入
     */
    addTableItem: function(data, index){
        var me = this,
            data = me._formatTableData(data),
            index = Math.min(Math.max(baidu.lang.isNumber(index) ? index : me._dataList.length, 0), me._dataList.length);
        me._tables.splice(index, 0, new baidu.ui.Table({data: data[0]}));
        me._addText(me._tables[index].getString(), index);
    },
    /**
     * 移除由索引指定的项
	 * @name baidu.ui.Carousel.Carousel$table.removeTableItem
	 * @addon baidu.ui.Carousel.Carousel$table
     * @param {Number} index 需要移除的索引项
     * @return {HTMLElement} 被移除的表格对象，不存在该对象或不存在于当前页面的返回null
     */
    removeTableItem: function(index){
        if(!baidu.lang.isNumber(index) || index < 0
            || index > this._dataList.length - 1){return;}
        var me = this;
        me._tables.splice(index, 1);
        return me._removeItem(index);
    },
    /**
     * 根据索引取得表格
	 * @name baidu.ui.Carousel.Carousel$table.getTable
	 * @addon baidu.ui.Carousel.Carousel$table
     * @param {Number} index 索引
     * @return {baidu.ui.Table} 该索引对应的表格对象，不存在该表格对象的返回null
     */
    getTable: function(index){
        return this._tables[index];
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: ui/slider/Slider.js
 * author: berg,linlingyu
 * version: 1.0.0
 * date: 2010/09/02
 */












 /**
 * 拖动条控件，可用作音乐播放进度。
 * @class
 * @grammar new baidu.ui.Slider(options)
 * @param      {String|HTMLElement}     target       存放滑块控件的元素，按钮会渲染到该元素内。
 * @param      {Object}                 [options]    选项layout
 * @config     {Number}                 value        记录滑块的当前进度值
 * @config     {Number}                 layout       滑块的布局[水平：horizontal,垂直：vertical]
 * @config     {Number}                 min          进度条最左边代表的值，默认值取0
 * @config     {Number}                 max          进度条最右边代表的值，默认值取100
 * @config     {Array}                  range        可拖动的范围，取值min到max之间，例如[30, 80]
 * @config     {Boolean}                disabled     是否禁用
 * @config     {String}                 skin         自定义样式名称前缀
 * @plugin     progressBar              支持进度条跟随滑动
 */
baidu.ui.Slider = baidu.ui.createUI(function(options){
    var me = this;
    me.range = me.range || [me.min, me.max];//初始化range
}).extend(
/**
 *  @lends baidu.ui.Slider.prototype
 */
{
    layout: 'horizontal',//滑块的布局方式 horizontal :水平  vertical:垂直
    uiType: 'slider',
    tplBody: '<div id="#{id}" class="#{class}" onmousedown="#{mousedown}" style="position:relative;">#{thumb}</div>',
    tplThumb: '<div id="#{thumbId}" class="#{thumbClass}" style="position:absolute;"></div>',
    value: 0,//初始化时，进度条所在的值
    min: 0,//进度条最左边代表的值
    max: 100,//进度条最右边代表的值
    disabled: false,
//    range: [0, 100],
    _dragOpt: {},
    _axis: {//位置换算
        horizontal: {
            mousePos: 'x',
            pos: 'left',
            size: 'width',
            clientSize: 'clientWidth',
            offsetSize: 'offsetWidth'
        },
        vertical: {
            mousePos: 'y',
            pos: 'top',
            size: 'height',
            clientSize: 'clientHeight',
            offsetSize: 'offsetHeight'
        }
    },

    /**
     * 获得slider控件字符串
     * @private
     * @return {String}  string     控件的html字符串
     */
    getString : function(){
        var me = this;
        return baidu.format(me.tplBody,{
            id          : me.getId(),
            "class"     : me.getClass(),
            mousedown   : me.getCallRef() + "._mouseDown(event)",
            thumb       : baidu.format(me.tplThumb, {
                thumbId   : me.getId("thumb"),
                thumbClass: me.getClass("thumb")
            })
        });
    },

    /**
     * 处理鼠标在滚动条上的按下事件
     * @private
     */
    _mouseDown : function(e){
        var me = this,
            axis = me._axis[me.layout],
            mousePos = baidu.page.getMousePosition(),
            mainPos = baidu.dom.getPosition(me.getBody()),
            thumb = me.getThumb(),
            target = baidu.event.getTarget(e);
        //如果点在了滑块上面，就不移动
        if(target == thumb
            || baidu.dom.contains(thumb, target)
            || me.disabled){
            return ;
        }
        me._calcValue(mousePos[axis.mousePos]
            - mainPos[axis.pos]
            - thumb[axis.offsetSize] / 2);
        me.update()
        me.dispatchEvent("slideclick");
    },
    
    /**
     * 渲染slider
     * @public
     * @param     {String|HTMLElement}   target     将渲染到的元素或元素id
     */
    render : function(target){
        var me = this;
        if(!target){return;}
        baidu.dom.insertHTML(me.renderMain(target), "beforeEnd", me.getString());
//        me.getMain().style.position = "relative";
        me._createThumb();
        me.update();
        me.dispatchEvent("onload");
    },

    /**
     * 创建滑块
     * @private
     */
    _createThumb : function(){
        var me = this, drag;
        me._dragOpt = {
            "ondragend"     : function(){
                                me.dispatchEvent("slidestop");
                            },
            "ondragstart"   : function(){
                                me.dispatchEvent("slidestart");
                            },
            "ondrag"        : function(){
                                var axis = me._axis[me.layout],
                                    len = me.getThumb().style[axis.pos];
                                me._calcValue(parseInt(len));
                                me.dispatchEvent("slide");
                            },
            range           : [0, 0, 0, 0]
        };
        me._updateDragRange();
        drag = baidu.dom.draggable(me.getThumb(), me._dragOpt);
        me.addEventListener('dispose', function(){
            drag.cancel();
        });
    },

    /**
     * 更新拖拽范围，使用户可以动态修改滑块的拖拽范围
     * @private
     */
    _updateDragRange : function(val){
        var me = this,
            axis = me._axis[me.layout],
            range = val || me.range,
            dragRange = me._dragOpt.range,
            thumb = me.getThumb();
        range = [Math.max(Math.min(range[0], me.max), me.min),
                Math.max(Math.min(range[1], me.max), me.min)];
        if(me.layout.toLowerCase() == 'horizontal'){
            dragRange[1] = me._parseValue(range[1], 'fix') + thumb[axis.offsetSize];
            dragRange[3] = me._parseValue(range[0], 'fix');
            dragRange[2] = thumb.clientHeight;
        }else{
            dragRange[0] = me._parseValue(range[0], 'fix');
            dragRange[2] = me._parseValue(range[1], 'fix') + thumb[axis.offsetSize];
            dragRange[1] = thumb.clientWidth;
        }
    },

    /**
     * 更新slider状态
     * @public
     * @param   {Object}                 [options]    选项layout
     * @config  {Number}                 value        记录滑块的当前进度值
     * @config  {Number}                 layout       滑块的布局[水平：horizontal,垂直：vertical]
     * @config  {Number}                 min          进度条最左边代表的值
     * @config  {Number}                 max          进度条最右边代表的值
     * @config  {Boolean}                disabled     是否禁用
     * @config  {String}                 skin         自定义样式名称前缀
     */
    update : function(options){
        var me = this,
            axis = me._axis[me.layout],
            body = me.getBody();
        options = options || {};
        baidu.object.extend(me, options);
        me._updateDragRange();
        me._adjustValue();
        if (me.dispatchEvent("beforesliderto", {drop: options.drop})) {
            me.getThumb().style[axis.pos] = me._parseValue(me.value, 'pix') + 'px';
            me.dispatchEvent("update");
        }
    },

    /**
     * 校准value值，保证它在range范围内
     * @private
     */
    _adjustValue : function(){
        var me = this,
            range = me.range;
        me.value = Math.max(Math.min(me.value, range[1]), range[0]);
    },

    /**
     * 将位置值转换为value，记录在当前实例中
     * @private
     * @param {number} position
     */
    _calcValue : function(pos){
        var me = this;
        me.value = me._parseValue(pos, 'value');
        me._adjustValue();
    },
    
    /**
     * 将刻度转换为像素或是将像素转换为刻度
     * @param {Number} val 刻度值或是像素
     * @param {Object} type 'pix':刻度转换为像素, 'value':像素转换为刻度
     * @private
     */
    _parseValue: function(val, type){
        var me = this,
            axis = me._axis[me.layout],
            len = me.getBody()[axis.clientSize] - me.getThumb()[axis.offsetSize];
        if(type == 'value'){
            val = (me.max - me.min) / len * val + me.min;
        }else{//to pix
            val = Math.round(len /(me.max - me.min) * (val - me.min));
        }
        return val;
    },

    /**
     * 获得当前的value
     * @public
     * @return {Number} value     当前滑块位置的值
     */
    getValue : function(){
        return this.value;
    },
    
    /**
     * 获取target元素
     * @private
     * @return {HTMLElement} target
     */
    getTarget : function(){
        return baidu.g(this.targetId);
    },
    
    /**
     * 获取滑块元素
     * @return {HTMLElement} thumb     滑块元素
     */
    getThumb : function(){
        return baidu.g(this.getId("thumb"));
    },
    /**
     * 使slider失去作用
     */
    disable: function(){
        var me = this;
        me.disabled = true;
        me._updateDragRange([me.value, me.value]);
    },
    /**
     * 启用slider
     */
    enable: function(){
        var me = this;
        me.disabled = false;
        me._updateDragRange(me.range);
    },
    /**
     * 销毁当前实例
     * @public
     */
    dispose : function(){
        var me = this;
        me.dispatchEvent('dispose');
        baidu.dom.remove(me.getId());
        me.dispatchEvent('ondispose');
        baidu.lang.Class.prototype.dispose.call(me);
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */
























/**
 * 复杂颜色拾取器
 * @name baidu.ui.ColorPalette
 * @class
 * @grammar new baidu.ui.ColorPalette(options)
 * @param {Object}  options 配置.
 * @config {Number} sliderLength 滑动条长度，默认150.
 * @config {String} coverImgSrc 调色板渐变背景图片地址.
 * @config {String} sliderImgSrc 滑动条背景图片地址.
 * @author walter
 */
baidu.ui.ColorPalette = baidu.ui.createUI(function(options) {
    var me = this;
    me.hue = 360; //色相初始值
    me.saturation = 100; //饱和度初始值
    me.brightness = 100; //亮度初始值
    me.sliderDotY = 0;  //滑动块初始值
    me.padDotY = 0; //面板调色块Y轴初始值
    me.padDotX = me.sliderLength; //面板调色块X轴初始值
}).extend(
/**
 *  @lends baidu.ui.ColorPalette.prototype
 */
{
    uiType: 'colorpalette',

    tplBody: '<div id="#{id}" class="#{class}">#{content}</div>',

    /**
     * 调色板模板
     */
    tplPad: '<div id="#{padId}" class="#{padClass}"><div id="#{coverId}" class="#{coverClass}"></div>#{padDot}</div>',

    /**
     * 滑动条模板
     */
    tplSlider: '<div id="#{sliderId}" class="#{sliderClass}"></div>',

    /**
     * 调色块模板
     */
    tplPadDot: '<div id="#{padDotId}" class="#{padDotClass}" onmousedown="#{mousedown}"></div>',

    /**
     * 颜色展示区域模板
     */
    tplShow: '<div id="#{newColorId}" class="#{newColorClass}" onclick="#{showClick}"></div><div id="#{savedColorId}" class="#{savedColorClass}" onclick="#{savedColorClick}"></div><div id="#{hexId}" class="#{hexClass}"></div><div id="#{saveId}" class="#{saveClass}" onclick="#{saveClick}"></div>',

    sliderLength: 150,

    coverImgSrc: '',

    sliderImgSrc: '',

    /**
     * 生成ColorPalette的html字符串
     *  @return {String} 生成html字符串.
     */
    getString: function() {
        var me = this,
            strArray = [];

        strArray.push(me._getPadString(),
                      me._getSliderString(),
                      me._getShowString());

        return baidu.string.format(me.tplBody, {
            id: me.getId(),
            'class': me.getClass(),
            content: strArray.join('')
        });
    },

    /**
     * 渲染控件
     * @param {Object} target 目标渲染对象.
     */
    render: function(target) {
        
        var me = this;
        if (me.getMain()) {
            return;
        }
        baidu.dom.insertHTML(me.renderMain(target),
                             'beforeEnd',
                             me.getString());
        me._createSlider();
        me._padClickHandler = baidu.fn.bind('_onPadClick', me);

        me.on(me.getPad(), 'click', me._padClickHandler);

        me._setColorImgs();
        me.setSliderDot(me.sliderDotY);
        me.setPadDot(me.padDotY, me.padDotX);
        me._saveColor();

        me.dispatchEvent('onload');
    },

    /**
     * 设置滑动条和调色板背景图片
     * @private
     */
    _setColorImgs: function() {
        var me = this,
            cover = me._getCover(),
            slider = me.getSliderBody();

        if (baidu.browser.ie) {
            me._setFilterImg(cover, me.coverImgSrc);
        }
        else {
            me._setBackgroundImg(cover, me.coverImgSrc);
        }
        me._setBackgroundImg(slider, me.sliderImgSrc);
    },

    /**
     * 设置对象背景图片
     * @private
     * @param {Object} obj 要设置的对象.
     * @param {Object} src 图片src.
     */
    _setBackgroundImg: function(obj, src) {
        if (!src) {
            return;
        }
        baidu.dom.setStyle(obj, 'background', 'url(' + src + ')');
    },

    /**
     * 设置对象fliter背景图片,此方法应用于IE系列浏览器
     * @private
     * @param {Object} obj 要设置的对象.
     * @param {Object} src 图片src.
     */
    _setFilterImg: function(obj, src) {        
        if (!src) {
            return;
        }
        baidu.dom.setStyle(obj, 'filter',
             'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' +
              src + '", sizingMethod="crop")');
    },

    /**
     * 生成调色板的html字符串
     * @private
     * @return {String} 生成html字符串.
     */
    _getPadString: function() {
        var me = this;
        return baidu.string.format(me.tplPad, {
            padId: me.getId('pad'),
            padClass: me.getClass('pad'),
            coverId: me.getId('cover'),
            coverClass: me.getClass('cover'),
            padDot: me._getPadDotString()
        });
    },

    /**
     * 生成调色块html字符串
     * @private
     * @return {String} 生成html字符串.
     */
    _getPadDotString: function() {
        var me = this;
        return baidu.string.format(me.tplPadDot, {
            padDotId: me.getId('padDot'),
            padDotClass: me.getClass('padDot'),
            mousedown: me.getCallString('_onPadDotMouseDown')
        });
    },

    /**
     * 生成滑动条html字符串
     * @private
     * @return {String} 生成html字符串.
     */
    _getSliderString: function() {
        var me = this;
        return baidu.string.format(me.tplSlider, {
            sliderId: me.getId('slider'),
            sliderClass: me.getClass('sliderMain')
        });
    },

    /**
     * 创建滑动条
     * @private
     */
    _createSlider: function() {
        var me = this,
            target = me._getSliderMain();

        me.slider = baidu.ui.create(baidu.ui.Slider, {
            autoRender: true,
            element: target,
            layout: 'vertical',
            max: me.sliderLength,
            classPrefix: me.getClass('slider'),
            onslide: function() {
                me.setSliderDot(this.value); //设置滑动块
            },
            onslideclick: function() {
                me.setSliderDot(this.value); //设置滑动块
            }
        });

    },

    /**
     * 生成颜色展示区域html字符串
     * @private
     * @return {String} 生成html字符串.
     */
    _getShowString: function() {
        var me = this;
        return baidu.string.format(me.tplShow, {
            newColorId: me.getId('newColor'),
            newColorClass: me.getClass('newColor'),
            savedColorId: me.getId('savedColor'),
            savedColorClass: me.getClass('savedColor'),
            savedColorClick: me.getCallString('_onSavedColorClick'),
            hexId: me.getId('hex'),
            hexClass: me.getClass('hex'),
            saveId: me.getId('save'),
            saveClass: me.getClass('save'),
            saveClick: me.getCallString('_saveColor')
        });
    },

    /**
     * 鼠标按下调色块事件
     * @private
     */
    _onPadDotMouseDown: function() {
        var me = this,
            pad = me.getPad(),
            position = baidu.dom.getPosition(pad);

        me.padTop = position.top; //计算调色板的offsetTop，用于_onPadDotMouseMove辅助计算
        me.padLeft = position.left; //计算调色板的offsetTop，用于_onPadDotMouseMove辅助计算

        me._movePadDotHandler = baidu.fn.bind('_onPadDotMouseMove', me);
        me._upPadDotHandler = baidu.fn.bind('_onPadDotMouseUp', me);

        baidu.event.on(document, 'mousemove', me._movePadDotHandler);
        baidu.event.on(document, 'mouseup', me._upPadDotHandler);
    },

    /**
     * 鼠标移动调色块事件
     * @private
     * @param {Object} e 鼠标事件对象.
     */
    _onPadDotMouseMove: function(e) {
        e = e || event;
        var me = this,
            pageX = baidu.event.getPageX(e),
            pageY = baidu.event.getPageY(e);

        //计算鼠标坐标相对调色板左上角距离
        me.padDotY = me._adjustValue(me.sliderLength, pageY - me.padTop);
        me.padDotX = me._adjustValue(me.sliderLength, pageX - me.padLeft);

        me.setPadDot(me.padDotY, me.padDotX); //设置调色块
    },

    /**
     * 校准value值，保证它在合理范围内
     * @private
     * @param {Number} x 范围上限,被校准的数值不能超过这个数值.
     * @param {Number} y 需要校准的数值.
     * @return {Number} 校准过的数值.
     */
    _adjustValue: function(x, y) {
        return Math.max(0, Math.min(x, y));
    },

    /**
     * 鼠标松开调色块事件
     * @private
     */
    _onPadDotMouseUp: function() {
        var me = this;
        if(!me._movePadDotHandler){return;}
        baidu.event.un(document, 'mousemove', me._movePadDotHandler);
        baidu.event.un(document, 'mouseup', me._upPadDotHandler);
    },

    /**
     * 调色板单击事件
     * @param {Object} e 鼠标事件.
     * @private
     */
    _onPadClick: function(e) {
        var me = this,
            pad = me.getPad(),
            position = baidu.dom.getPosition(pad);

        me.padTop = position.top;
        me.padLeft = position.left;

        me._onPadDotMouseMove(e); //将调色块移动到鼠标点击的位置
    },

    /**
     * savedColor 单击事件
     * @private
     */
    _onSavedColorClick: function() {
        var me = this,
            dot = me.getSliderDot(),
            position = me.savedColorPosition;

        me.setSliderDot(position.sliderDotY);
        baidu.dom.setStyle(dot, 'top', position.sliderDotY); //恢复滑动块位置
        me.setPadDot(position.padDotY, position.padDotX); //恢复调色块位置
    },

    /**
     * 获取滑动条容器对象
     * @private
     * @return {HTMLElement} dom节点.
     */
    _getSliderMain: function() {
        return baidu.dom.g(this.getId('slider'));
    },

    /**
     * 获取滑动条容器对象
     * @return {HTMLElement} dom节点.
     */
    getSliderBody: function() {
        return this.slider.getBody();
    },

    /**
     * 获取滑动块对象
     * @return {HTMLElement} dom节点.
     */
    getSliderDot: function() {
        return this.slider.getThumb();
    },

    /**
     * 获取调色板对象
     * @return {HTMLElement} dom节点.
     */
    getPad: function() {
        return baidu.dom.g(this.getId('pad'));
    },

    /**
     * 获取调色块对象
     * @return {HTMLElement} dom节点.
     */
    getPadDot: function() {
        return baidu.dom.g(this.getId('padDot'));
    },

    /**
     * 获取调色板cover图层对象
     * @private
     * @return {HTMLElement} dom节点.
     */
    _getCover: function() {
        return baidu.dom.g(this.getId('cover'));
    },

    /**
     * 设置滑动块位置
     * @param {Object} value 滑动块top位置值.
     */
    setSliderDot: function(value) {
        var me = this,
            pad = me.getPad();

        me.sliderDotY = value;
        me.hue = parseInt(360 * (me.sliderLength - value) / me.sliderLength,
                          10); //根据滑动块位置计算色相值

        baidu.dom.setStyle(pad, 'background-color', '#' + me._HSBToHex({
            h: me.hue,
            s: 100,
            b: 100
        })); //设置调色板背景颜色

        me._setNewColor();
    },

    /**
     * 设置调色块位置
     * @param {Object} top 调色块 offsetTop值.
     * @param {Object} left 调色块 offsetLeft值.
     */
    setPadDot: function(top, left) {
        var me = this,
            dot = me.getPadDot();

        me.saturation = parseInt(100 * left / 150, 10); //根据调色块top值计算饱和度
        me.brightness = parseInt(100 * (150 - top) / 150, 10); //根据调色块left值计算亮度

        baidu.dom.setStyles(dot, {
            top: top,
            left: left
        });

        me._setNewColor();
    },

    /**
     * 设置实时颜色
     * @private
     */
    _setNewColor: function() {
        var me = this,
            newColorContainer = baidu.dom.g(this.getId('newColor')),
            hexContainer = baidu.dom.g(this.getId('hex'));

        //记录当前hex格式颜色值
        me.hex = '#' + me._HSBToHex({
            h: me.hue,
            s: me.saturation,
            b: me.brightness
        });

        baidu.dom.setStyle(newColorContainer, 'background-color', me.hex);
        hexContainer.innerHTML = me.hex;
    },

    /**
     * 保存当前颜色
     * @private
     */
    _saveColor: function() {
        var me = this,
            savedColorContainer = baidu.dom.g(this.getId('savedColor'));

        baidu.dom.setStyle(savedColorContainer,
                           'background-color',
                            me.hex); //显示颜色

        me.savedColorHex = me.hex; //保存颜色值

        //保存滑动块、调色块状态
        me.savedColorPosition = {
            sliderDotY: me.sliderDotY,
            padDotY: me.padDotY,
            padDotX: me.padDotX
        };
    },

    /**
     * 获取当前颜色值
     * @return {String} 颜色值.
     */
    getColor: function() {
        return this.hex;
    },

    /**
     * 将HSB格式转成RGB格式
     * @private
     * @param {Object} hsb hsb格式颜色值.
     * @return {Object} rgb格式颜色值.
     */
    _HSBToRGB: function(hsb) {
        var rgb = {},
            h = Math.round(hsb.h),
            s = Math.round(hsb.s * 255 / 100),
            v = Math.round(hsb.b * 255 / 100);
        if (s == 0) {
            rgb.r = rgb.g = rgb.b = v;
        } else {
            var t1 = v,
                t2 = (255 - s) * v / 255,
                t3 = (t1 - t2) * (h % 60) / 60;
            if (h == 360) h = 0;
            if (h < 60) {rgb.r = t1; rgb.b = t2; rgb.g = t2 + t3;}
            else if (h < 120) {rgb.g = t1; rgb.b = t2; rgb.r = t1 - t3;}
            else if (h < 180) {rgb.g = t1; rgb.r = t2; rgb.b = t2 + t3;}
            else if (h < 240) {rgb.b = t1; rgb.r = t2; rgb.g = t1 - t3;}
            else if (h < 300) {rgb.b = t1; rgb.g = t2; rgb.r = t2 + t3;}
            else if (h < 360) {rgb.r = t1; rgb.g = t2; rgb.b = t1 - t3;}
            else {rgb.r = 0; rgb.g = 0; rgb.b = 0;}
        }

        return {
            r: Math.round(rgb.r),
            g: Math.round(rgb.g),
            b: Math.round(rgb.b)
        };
    },

    /**
     * 将rgb格式转成hex格式
     * @private
     * @param {Object} rgb rgb格式颜色值.
     * @return {String} hex格式颜色值.
     */
    _RGBToHex: function(rgb) {
        var hex = [rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16)];
        baidu.array.each(hex, function(val, nr) {
            if (val.length == 1) {
                hex[nr] = '0' + val;
            }
        });
        return hex.join('');
    },

    /**
     * 将hsb格式转成hex格式
     * @private
     * @param {Object} hsb hsb格式颜色值.
     * @return {String} hex格式颜色值.
     */
    _HSBToHex: function(hsb) {
        var me = this;
        return me._RGBToHex(me._HSBToRGB(hsb));
    },

    /**
     * 销毁 ColorPalette
     */
    dispose: function() {
        var me = this;

        
        me.dispatchEvent('ondispose');
        me.slider.dispose();

        if (me.getMain()) {
            baidu.dom.remove(me.getMain());
        }
        baidu.lang.Class.prototype.dispose.call(me);
    }

});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */















/**
 * 颜色拾取器
 * @name baidu.ui.ColorPicker
 * @class
 * @grammar new baidu.ui.ColorPicker(options)
 * @param {Object} options 配置.
 * @config {Number} gridSize 一行显示的颜色块个数，默认8.
 * @config {Function} onchosen 颜色选择事件.
 * @plugin click 支持触发模式为鼠标点击
 * @plugin more 弹出调色板插件
 * @author walter
 */
baidu.ui.ColorPicker = baidu.ui.createUI(function(options) {
    var me = this;
    me._initialized = false; //判断是否已经初始化
}).extend(
/**
 * @lends baidu.ui.ColorPicker.prototype
 */
{
    uiType: 'colorpicker',

    /**
     * colorPicker 提供选择的颜色值
     */
    colors: ('000,800000,8B4513,2F4F4F,008080,000080,4B0082,696969,' +
             'B22222,A52A2A,DAA520,006400,40E0D0,0000CD,800080,808080,' +
             'F00,FF8C00,FFD700,008000,0FF,00F,EE82EE,A9A9A9,' +
             'FFA07A,FFA500,FFFF00,00FF00,AFEEEE,ADD8E6,DDA0DD,D3D3D3,' +
             'FFF0F5,FAEBD7,FFFFE0,F0FFF0,F0FFFF,F0F8FF,E6E6FA,FFF').split(','),

    tplBody: '<div id="#{id}" class="#{class}">#{content}</div>',

    tplColor: '<a href="javascript:;" id="#{colorId}" style="#{colorStyle}" class="#{colorClass}" onclick="javascript:#{choose};return false;" #{stateHandler}></a>',

    gridSize: 8,

    position: 'bottomCenter',

    statable: true,

    posable: true,

    /**
     * 生成colorPicker的html字符串代码
     *  @return {String} 生成html字符串.
     */
    getString: function() {
        var me = this,
            strArray = ['<table>'],
            count = 0,
            length = me.colors.length;

        while (count < length) {
            strArray.push('<tr>');
            for (var i = 0; i < me.gridSize; i++) {
                strArray.push('<td>',
                              me._getColorString(me.colors[count]),
                              '</td>');
                count++;
            }
            strArray.push('</tr>');
        }
        strArray.push('</table>');

        return baidu.string.format(me.tplBody, {
            id: me.getId(),
            'class': me.getClass(),
            content: strArray.join('')
        });
    },

    /**
     * 生成颜色块的html字符串代码
     * @private
     * @param {String} color 颜色值.
     * @return {String} 生成html字符串.
     */
    _getColorString: function(color) {
        var me = this;
        return baidu.string.format(me.tplColor, {
            colorId: me.getId(color),
            colorStyle: 'background-color:#' + color,
            colorClass: me.getClass('color'),
            choose: me.getCallString('_choose', color),
            stateHandler: me._getStateHandlerString('', color)
        });
    },

    /**
     * 渲染控件
     * @param {Object} target 目标渲染对象.
     */
    render: function(target) {
        var me = this;
        target = baidu.g(target);
        if (me.getMain() || !target) {
            return;
        }
        me.targetId = target.id || me.getId('target');
        me.renderMain();
        me.dispatchEvent('onload');
    },

    /**
     * 更新colorPicker
     * @param {Object} options 需要更新的配置.
     */
    update: function(options) {
        var me = this,
            main = me.getMain(),
            target = me.getTarget();
        
        options = options || {};
        baidu.object.extend(me, options);
        main.innerHTML = me.getString();
        me.setPositionByElement(target, main, {
            position: me.position,
            once: true
        });

        me.dispatchEvent('onupdate');
    },

    /**
     * 响应颜色被选择,并发出 oncolorchosen 事件
     * @param {Object} color 颜色值.
     */
    _choose: function(color) {
        var me = this;
        me.close();
        me.dispatchEvent('onchosen', {
            color: '#' + color
        });
    },

    /**
     * 打开 colorPicker
     */
    open: function() {
        var me = this;
        if (!me._initialized) {
            me.update();
            me._initialized = true;
        }
        baidu.dom.show(me.getMain());
        baidu.ui.ColorPicker.showing = me;
        me.dispatchEvent('onopen');
    },

    /**
     * 关闭 colorPicker
     */
    close: function() {
        var me = this;
        baidu.dom.hide(me.getMain());
        me.dispatchEvent('onclose');
    },

    /**
     * 获取target元素
     * @return {HTMLElement} HTML元素.
     */
    getTarget: function() {
        return baidu.g(this.targetId);
    },

    /**
     * 销毁 colorPicker
     */
    dispose: function() {
        var me = this;
        me.dispatchEvent('ondispose');
        if (me.getMain()) {
            baidu.dom.remove(me.getMain());
        }
        baidu.lang.Class.prototype.dispose.call(me);
    }
});




//

/**
 * 获取元素所在的控件
 * @function
 * @grammar baidu.ui.get(element)
 * @param {HTMLElement|string} 要查找的元素，如果是字符串，则查找这个guid为此字符串的控件
 * @param {string} optional  type 匹配查找指定类型的控件【暂未支持】
 * @return {object} ui控件
 */
baidu.ui.get = function(element/*, type*/){
    var buid;

    //如果是string，则按照guid来找
    if(baidu.lang.isString(element)){
        return baidu.lang.instance(element);
    }else{
        /*
         *type = type.toLowerCase();
         */
        do{
            //如果元素是document
        	//加上了!element判断,防止游离节点的父节点为null的情况  rocy@2010-08-05
            if(!element || element.nodeType == 9){
                return null;
            }
            if(buid = baidu.dom.getAttr(element, "data-guid")){
                     return baidu.lang.instance(buid);
                /*
                 *if( !type || buid.toLowerCase().indexOf(type) === 0){
                 *    return baidu.lang.instance(buid);
                 *}
                 */
            }
        }while((element = element.parentNode) != document.body)
    }
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */










/**
 * 支持触发模式为鼠标点击
 * @name baidu.ui.ColorPicker.ColorPicker$click
 * @addon baidu.ui.ColorPicker
 * @author walter
 */
baidu.ui.ColorPicker.extend({
    /**
     * @param {String} type 默认为click，点击插件触发方式
	 * @private
     */
    type: 'click',

    /**
     * @param {Object} e 事件. body点击事件，点击body关闭菜单
	 * @private
     */
    bodyClick: function(e) {
        var me = this,
            target = baidu.event.getTarget(e || window.event),
            judge = function(el) {
                return el == me.getTarget();
            };

        //判断如果点击的是菜单或者target则返回，否则直接关闭菜单
        if (!target ||
            judge(target) ||
            baidu.dom.getAncestorBy(target, judge) ||
            baidu.ui.get(target) == me) {
            return;
        }
        me.close();
    }
});

baidu.ui.ColorPicker.register(function(me) {
    if (me.type != 'click') {
        return;
    }

    me._targetOpenHandler = baidu.fn.bind('open', me);
    me._bodyClickHandler = baidu.fn.bind('bodyClick', me);

    me.addEventListener('onload', function() {
        var target = me.getTarget();
        if (target) {
            baidu.on(target, 'click', me._targetOpenHandler);
            baidu.on(document, 'click', me._bodyClickHandler);
        }
    });

    me.addEventListener('ondispose', function() {
        var target = me.getTarget();
        if (target) {
            baidu.un(target, 'click', me._targetOpenHandler);
            baidu.un(document, 'click', me._bodyClickHandler);
        }
    });
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */






/**
 * 关闭后自动销毁插件
 * @name baidu.ui.Dialog.Dialog$autoDispose
 * @addon baidu.ui.Dialog
 */

baidu.extend(baidu.ui.Dialog.prototype,{
    autoDispose: true
});

baidu.ui.Dialog.register(function(me){

    if(me.autoDispose){
        me.addEventListener("onload",function(){

            //默认自动dispose
            if (typeof me.autoDispose == 'undefined' || me.autoDispose) {
                me.addEventListener('onclose', function() {
                    me.dispose();
                });
            }
        });
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */










/**
 * 允许创建底部按钮
 * @name baidu.ui.Dialog.Dialog$button
 * @addon baidu.ui.Dialog
 */
baidu.extend(baidu.ui.Dialog.prototype,{
    
    /**
     * 创建底部按钮
	 * @name baidu.ui.Dialog.Dialog$button.createButton
	 * @addon  baidu.ui.Dialog.Dialog$button
	 * @function 
     * @param {Object} option 创建按钮的options，格式与baidu.ui.Button的参数相同
     * @param {String} name 按钮的唯一标识符
     * @return void
     */
    createButton:function(option,name){
        var me = this;
        baidu.extend(option,{
            classPrefix : me.classPrefix + "-" + name,
            skin : me.skin ? me.skin + "-" + name : "",
            element : me.getFooter(),
            autoRender : true,
            parent : me
        });
        var buttonInstance = new baidu.ui.Button(option);
        me.buttonInstances[name] = buttonInstance;
    },
   
    /**
     * 删除底部按钮
	 * @name baidu.ui.Dialog.Dialog$button.removeButton
	 * @addon  baidu.ui.Dialog.Dialog$button
	 * @function 
     * @param {String} name 按钮的唯一标识符
     * @return void
     */
    removeButton:function(name){
        var me = this,
            button = me.buttonInstances[name];
        if(button){
            button.dispose();
            delete(me.buttonInstances[name]);
            delete(me.buttons[name]);
        }
    }
});
baidu.ui.Dialog.register(function(me){
    //存储button实例
    me.buttonInstances = {};
    me.language = me.language || 'zh-CN';
    
    var accept,cancel,tmpButtons = {},
        language = baidu.i18n.cultures[me.language].language;
    
    accept = {
        'content' : language['ok'],
        'onclick' : function() {
            var me = this,
                parent = me.getParent();
            parent.dispatchEvent('onaccept') && parent.close();
        }
    };
    cancel = {
        'content' : language['cancel'],
        'onclick' : function() {
            var me = this,
                parent = me.getParent();
            parent.dispatchEvent('oncancel') && parent.close();
        }
    };

    //在onLoad时创建buttons
    me.addEventListener("onload",function(){
        switch(me.type){
            case "alert":
                me.submitOnEnter = me.submitOnEnter || true;
                tmpButtons = {accept:accept};
                break;
            case "confirm":
                me.submitOnEnter = me.submitOnEnter || true;
                tmpButtons = {accept:accept,cancel:cancel};
                break;
            default:
        }
        me.buttons = baidu.extend(tmpButtons,me.buttons || {});
        baidu.object.each(me.buttons,function(opt, name){
            me.createButton(opt,name);
        });

        //注册ontener事件
        me.submitOnEnter && me.addEventListener('onenter', function(e) {
            me.buttonInstances['accept'].fire('click', e);
        });
    });

    //在dispose时同时dispose buttons
    me.addEventListener("ondispose",function(){
        baidu.object.each(me.buttons,function(opt, name){
            me.removeButton(name);
        });
    });

    //在update时同时update buttons
    me.addEventListener("onupdate",function(){
        baidu.object.each(me.buttons,function(opt, name){
            me.buttonInstances[name] ? me.buttonInstances[name].update(opt) : me.createButton(opt,name); 
        });
    });
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */












/**
 * 调色板插件
 * @name baidu.ui.ColorPicker.ColorPicker$more
 * @addon baidu.ui.ColorPicker
 * @param {Number} [options.sliderLength = 150] 滑动条长度.
 * @param {String} options.coverImgSrc 调色板背景渐变图片路径.
 * @param {String} options.sliderImgSrc 滑动条背景图片路径.
 * @param {String} [options.titleText = 'More Colors'] 标题文字.
 * @param {Object} [options.dilogOption] 填出对话框配置.
 * @param {Object} [options.more = true] 是否开启插件功能.
 * @author walter
 */
baidu.ui.ColorPicker.extend({

    sliderLength: 150,

    coverImgSrc: '',

    sliderImgSrc: '',

    titleText: 'More Colors',

    dialogOption: {},
    
    more: true,
    /**
     * 生成调色板对话框
     * @private
     */
    _createColorPaletteDialog: function() {
        var me = this;
        me.colorPaletteDialog = new baidu.ui.Dialog(baidu.object.extend({
            titleText: me.titleText,
            height: 180,
            width: 360,
            modal: true,
            type: 'confirm',
            onaccept: function() {
                me.dispatchEvent('onchosen', {
                    color: me.colorPalette.hex
                });
            },
            onclose: function(){
                me.colorPalette._onPadDotMouseUp();
            },
            draggable: true,
            autoDispose: false,
            autoOpen: false,
            autoRender: true
        }, me.dialongOption || {}));
    },

    /**
     * 生成复杂调色板
     * @private
     */
    _createColorPalette: function() {
        var me = this;
        me.colorPalette =
            baidu.ui.create(baidu.ui.ColorPalette, {
                autoRender: true,
                sliderLength: me.sliderLength,
                coverImgSrc: me.coverImgSrc,
                sliderImgSrc: me.sliderImgSrc,
                element: me.colorPaletteDialog.getContent()
            });
    }
});

baidu.ui.ColorPicker.register(function(me) {
    if(!me.more) return;
    me.addEventListener('onupdate', function() {
        var strArray = [],
            body = me.getBody();
        baidu.ui.create(baidu.ui.Button, {
            content: me.titleText,
            classPrefix: me.getClass('morecolorbutton'),
            autoRender: true,
            element: body,
            onclick: function() {
                me.colorPaletteDialog.open();
            }
        });
        me._createColorPaletteDialog();
        me._createColorPalette();
    });
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */





















/**
 * Menubar 下拉菜单
 * @class
 * @grammar new baidu.ui.Menubar(options)
 * @param {Object} [options]                             配置选项
 * @param {String} width 选项宽度，默认200
 * @param {String} height 选项高度
 * @param {Number} zIndex 菜单zIndex，默认1200
 * @param {String} position 相对位置，默认bottomCenter
 * @param {Object} data 数据项
 * @param {Number} hideDelay 鼠标移出子菜单多长时间，菜单消失，默认300
 * @param {Function} toggle 开关函数,返回false时不显示
 * @param {Function} toggle 开关函数,返回false时不显示
 * @plugin click	支持点击触发
 * @plugin fx		动画效果
 * @plugin hover	鼠标hover触发
 * @plugin icon		菜单支持图标
 */
baidu.ui.Menubar = baidu.ui.createUI(function(options){
    var me = this;
    me.items = {};//建立数据索引存储区
    me.data = options.data || [];
    me._initialized = false; //判断是否已经初始化
    me.dispatchEvent("oninit");
}).extend(
/**
 * @lends baidu.ui.Menubar.prototype
 */
{
    uiType: "menubar",
    width: 200,//这个地方不要写成字符串
    height: '',
    zIndex: 1200,
    hideDelay: 300,
    position: 'bottomCenter',
    tplBody: '<div id="#{id}" class="#{class}">#{content}</div>',
    tplBranch: '<ul id="#{ulId}">#{subitems}</ul>',
    tplItem: '<li onmouseover="#{onmouseover}" onmouseout="#{onmouseout}"><a href="#" id="#{id}" class="#{class}" onclick="#{onclick}" title="#{title}">#{content}</a>#{branch}</li>',
    tplContent: '<span class="#{contentClass}">#{content}</span>',
    tplArrow: '<span class="#{arrow}"></span>',
	/**
	 * @private
	 */
    toggle: function(){return true},
    posable: true,
    
    /**
     * 获取Menubar组件的HTML String
	 * @private
     * @return {String}
     */
    getString: function(){
        var me = this;
        return baidu.string.format(me.tplBody, {
            id: me.getId(),
            "class": me.getClass(),
            guid: me.guid,
            content: me.getItemsString(me.data, 0)
        });
    },
    
    /**
     * 生成items字符串
	 * @private
     * @param {Object} items 数据
     * @param {String} branchId 条目ID
     * @return {String}
     */
    getItemsString: function(items, branchId){
        var me = this,
            htmlArr = [];
        baidu.array.each(items, function(itemData, idx){
            var itemArr = [],
                itemId = branchId + '-' + idx;
            me.items[itemId] = itemData;//建立数据索引，方便查找item数据
                itemArr.push(baidu.string.format(me.tplContent, {
                contentClass : me.getClass("content"),
                content : itemData.content || itemData.label
            }));

            if (itemData.items) {
                itemArr.push(baidu.string.format(me.tplArrow, {
                    arrow: me.getClass("arrow")
                }));
            }

            htmlArr.push(baidu.string.format(me.tplItem, {
                id: me.getItemId(itemId),
                "class": (itemData.disabled ? (me.getClass("item") + ' ' + me.getClass("item-disabled")) : me.getClass("item")),
                onclick: me.getCallRef() + ".itemClick('"+itemId+"', event);",
                onmouseover: itemData.disabled || me.getCallRef() + ".itemMouseOver(event, '" + itemId + "')",
                onmouseout: itemData.disabled || me.getCallRef() + ".itemMouseOut(event, '" + itemId + "')",
                content: itemArr.join(''),
                branch: itemData.items ? me.getItemsString(itemData.items, itemId) : '',
                title: itemData.title
            }));
        });
        
        return baidu.string.format(me.tplBranch, {
            ulId: me.getBranchId(branchId),
            subitems: htmlArr.join('')
        });
    },
    
    /**
     * 渲染menubar
     * @param {HTMLElement} target 目标元素
     */
    render: function(target){
        var me = this;
        target = baidu.g(target);
        if(target){
            me.targetId = target.id || me.getId("target");
        }
        me.renderMain();
        me.dispatchEvent("onload");
    },
    
    /**
     * 单个条目被点击时触发
     * @param {String} idx item索引
     * @param {Event} evt 浏览器的事件对象
     */
    itemClick: function(idx, evt){
        var me = this;
        baidu.event.preventDefault(evt || window.event);
        me._close();
        me.dispatchEvent("onitemclick", me.getItemEventData(idx));
    },
    
    /**
     * 事件触发数据
     * @param {String} idx item索引
     * @return {Object}   item对象
     */
    getItemEventData: function(idx){
        return {
            value: this.getItemData(idx),
            index: idx
        };
    },
    
    /**
     * 单个条目mouseover的响应
     * @param {Object} idx     索引
     */
    itemMouseOver: function(evt, idx){
        var me = this,
            target = baidu.event.getTarget(evt),
            itemData = me.getItemData(idx), 
            itemDom = me.getItem(idx),
            subItem;
        baidu.dom.addClass(itemDom, me.getClass("item-hover"));
        if(itemData.items){//如果有子菜单，先运算子菜单的打开位置
            subItem = baidu.dom.g(me.getBranchId(idx));
            if(subItem.style.display == 'none'){
                baidu.dom.show(subItem);
                target.tagName.toUpperCase() != 'LI' && (target = baidu.dom.getAncestorByTag(target, 'LI'));//如果换了tplItem这里就会有问题;
                me.setPositionByElement(target, subItem, {
                    position: 'rightCenter',
                    once: true
                });
            }
        }
        itemData.showing = true;//记录显示状态，为延迟关闭功能使用
        me.dispatchEvent("onitemmouseover", me.getItemEventData(idx));
    },
    
    /**
     * 单个条目mouseout的响应
     * @param {Object} idx item索引
     */
    itemMouseOut: function(evt, idx){
        var me = this,
            target = baidu.event.getTarget(evt),
            itemData = me.getItemData(idx), 
            itemDom = me.getItem(idx);
        baidu.dom.removeClass(me.getItem(idx), me.getClass("item-hover"));
        itemData.showing = false;
        clearTimeout(itemData.outListener);
        itemData.outListener = setTimeout(function(){ //延迟关闭菜单
            if (!itemData.showing) {
                itemData.items && baidu.dom.hide(me.getBranchId(idx));
                me.dispatchEvent("onitemmouseout", me.getItemEventData(idx));
            }
        }, me.hideDelay);
    },
    
    /**
     * 更新menubar
     * @param {Object} options    选项
     */
    update: function(options){
        var me = this, 
            main = me.getMain(), 
            target = me.getTarget();
        options && baidu.object.extend(me, options);
        main.innerHTML = me.getString();
        
        me.dispatchEvent("onupdate");
        
        baidu.dom.setStyle(main, 'z-index', me.zIndex);
        
        var body = me.getBody();
        baidu.dom.setStyles(body, {
            height: me.height,
            width: me.width
        });
        
        baidu.dom.setStyle(me.getBranchId(0), 'width', me.width);
        baidu.dom.addClass(me.getBranchId(0), me.getClass('root'));
        
        baidu.object.each(me.items, function(item, key){
            if (item.items) {//判断是否有子菜单
                baidu.dom.setStyles(me.getBranchId(key), {
//                    left: me.width,//这句运算子标签的出现位置
                    width: me.width,
                    position: 'absolute',
                    display: 'none'
                });
            }
        });
                       
        if (target) {
            me.setPositionByElement(target, me.getMain(), {
                position: me.position,
                once: true
            });
        }
    },
    
    /**
     * 获取条目的元素id
     * @param {Number} idx 索引值
     * @return {String} id    获取item的id
     */
    getItemId: function(idx){
        return this.getId("item-" + idx);
    },
    
    /**
     * 获取子菜单容器id
     * @param {Object} idx item索引
     */
    getBranchId: function(idx){
        return this.getId("branch-" + idx);
    },
    
    /**
     * 获取指定索引值的页面元素
     * @param {Number} idx     索引
     * @return {HTMLElement} dom节点
     */
    getItem: function(idx){
        return baidu.g(this.getItemId(idx));
    },
    
    /**
     * 获取条目数据
     * @param {Number} idx 条目索引
     * @return {Object} 条目对应数据
     */
    getItemData: function(idx){
        return this.items[idx];
    },
    
    /**
     * 打开menubar
     */
    open: function(){
        var me = this,
            target = me.getTarget(),
            body = me.getBody(),
            showing;
        if (baidu.lang.isFunction(me.toggle) && !me.toggle()) {
            return;
        }
        if (!me.dispatchEvent("onbeforeopen")) 
            return;
        if (showing = baidu.ui.Menubar.showing) {
            showing.close();
        }
        body && (body.style.display = '');
        if (!me._initialized) {//如果已经初始化就不再重复update
            me.update();
            me._initialized = true;
        }else{
            if(target){
                me.setPositionByElement(target, me.getMain(), {
                    position: me.position,
                    once: true
                });
            }
        }
        me.dispatchEvent("onopen");
        baidu.ui.Menubar.showing = me;
    },
    
    /**
     * 关闭menubar
     */
    close: function(){
        var me = this,
            body = me.getBody();
        if (!body) 
            return;
        
        if (me.dispatchEvent("onbeforeclose")) {
            me._close();
            me.dispatchEvent("onclose");
        }
    },
   
    _close: function(){
        var me = this,
            body = me.getBody();
        
        baidu.ui.Menubar.showing = null;
        body.style.display = 'none';
    },

    /**
     * 销毁Menubar
     */
    dispose: function(){
        var me = this;
        me.dispatchEvent("ondispose");
        me.getMain() && baidu.dom.remove(me.getMain());
        baidu.lang.Class.prototype.dispose.call(me);
    },
    
    /**
     * 获取target元素
     * @return {HTMLElement} HTML元素
     */
    getTarget: function(){
        return baidu.g(this.targetId);
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */










/**
 * 创建一个鼠标点击触发的menubar
 * @name baidu.ui.Menubar.Menubar$click
 * @addon baidu.ui.Menubar
 */
baidu.ui.Menubar.extend({
    /**
     * 插件触发方式，默认为点击
	 * @private
     * @param {String} [options.type = 'click']
     */
    type: 'click',
    
    /**
     * body点击事件，点击body关闭菜单
	 * @private
     * @param {Object} e 事件
     */
    bodyClick: function(e){
        var me = this;
        var target = baidu.event.getTarget(e || window.event),
            judge = function(el){
                return el == me.getTarget();
            };

        //判断如果点击的是菜单或者target则返回，否则直接关闭菜单
        if (!target || judge(target) || baidu.dom.getAncestorBy(target, judge) || baidu.ui.get(target) == me) 
            return;
        me.close();
    }
});

baidu.ui.Menubar.register(function(me){
    if (me.type == 'click') {
		me.targetOpenHandler = baidu.fn.bind("open", me);
		me.bodyClickHandler = baidu.fn.bind("bodyClick", me);
		
        me.addEventListener('onload', function(){
            var target = me.getTarget();
            if (target) {
                baidu.on(target, 'click', me.targetOpenHandler);
                baidu.on(document, 'click', me.bodyClickHandler);
            }
        });
        
        me.addEventListener("ondispose", function(){
            var target = me.getTarget();
            if (target) {
                baidu.un(target, 'click', me.targetOpenHandler);
                baidu.un(document, 'click', me.bodyClickHandler);
            }
        });
    }
});
/**
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: ui/Combox.js
 * author: rocy
 * version: 1.0.0
 * date: 2010-12-17
 */














 /**
 * combox类
 * @class
 * @grammar new baidu.ui.Combox(options)
 * @param  {Object}               [options]        选项，用于创建combox。
 * @config {Element}              target           combox的触发元素
 * @config {Number|String}        width            宽度值。当指定element时，默认为element宽度；否则不设置（可以通过css指定）。
 * @config {Number|String}        height           高度值。当指定element时，默认为element宽度；否则不设置（可以通过css指定）。
 * @config {String}               skin             自定义样式前缀
 * @config {Boolean}              editable         是否可以输入
 * @config {Array}                data             储存combox每个条目的数据。每个条目数据格式: { content: 'some html string', value : ''}。
 * @config {Array|Object}         offset           偏移量，若为数组，索引0为x方向，索引1为y方向; 若为Object，键x为x方向，键y为y方向。单位：px，默认值：[0,0]。
 * @config {Number}               zIndex           浮起combox层的z-index值，默认为1200。
 * @config {Function}             onitemclick      combox中单个条目鼠标点击的回调函数，参数:{data : {value: Item对应的数据, index : Item索引值}}
 * @config {Function}             onitemclick      combox中单个条目鼠标点击的回调函数，function(evt){}，evt.index返回item的索引，evt.value返回一个json，{content: '', value: ''}
 * @config {Function}             onbeforeclose    关闭之前触发
 * @config {Function}             onclose          关闭时触发
 * @config {Function}             onbeforeopen     打开之前触发
 * @config {Function}             onopen           打开时触发
 * @config {Function}             onmouseover      悬停时触发
 * @config {Function}             onmouseout       离开时触发
 * @config {Function}             onmousedown      鼠标按下时触发
 * @config {Function}             onmouseup        鼠标抬起时触发
 * @plugin statable 状态插件，提供enable、disable行为
 * @plugin select   通过select控件的数据创建combox     
 */
baidu.ui.Combox = baidu.ui.createUI(function (options){
  var me = this;
  me.data = me.data || [];
  me.menu = me.menu || false; //下拉menu,用于判断menu是否已存在
}).extend(
/**
 *  @lends baidu.ui.Combox.prototype
 */
{
    uiType: "combox",
    editable: true,
    width: '',
    height: '',
    zIndex: 1200,
    statable: true,
    posable: true,

    /**
     * 过滤方法
	 * @public
     * @param {String} filterStr 需检索的字符串值
     * @param {Array} data 目标数据
     */
    filter: function(filterStr,data){
        var ret = [];
        baidu.array.each(data || this.data, function(dataItem){
            var strIndex = String(dataItem.value || dataItem.content).indexOf(filterStr);
            if (strIndex >= 0) {
                ret.push(dataItem);
            } 
        });
        return ret;
    },

    tplBody : ['<div id="#{id}" class="#{class}" #{stateHandler}>',
                    '<input id="#{inputid}" class="#{inputClass}" autocomplete="off" readOnly="readOnly"/>',
                    '<span id="#{arrowid}" class="#{arrowClass}"></span>',
               '</div>'].join(''),

    /**
     * 生成combox的html字符串代码
     * @private
     * @return {String} 生成html字符串
     */
    getString: function(){
        var me = this;
        return baidu.format(me.tplBody, {
            id: me.getId(),
            "class": me.getClass(),
            inputClass: me.getClass('input'),
            arrowClass: me.getClass('arrow'),
            inputid: me.getId("input"),
            arrowid: me.getId("arrow"),
            stateHandler: me._getStateHandlerString()
        });
    },

    /**
     * 渲染控件
     * @public
     * @param {Object} target 目标渲染对象
     */
    render: function(target){
        var me = this;
        if(me.getMain()){
            return ;
        }
        
        me.dispatchEvent("onbeforerender");
        baidu.dom.insertHTML(me.renderMain(target || me.target), "beforeEnd", me.getString());
        me._createMenu(); //创建下拉menu
        me._enterTipMode();
        me.position && me.setPosition(me.position, target);
        me.dispatchEvent("onload");
    },

    /**
     * 给input添加keyup、focus事件，当触发事件，下拉框弹出相关项
     * @private
     */
    _enterTipMode : function(){
        var me = this, 
            input = me.getInput();
        me._showMenuHandler = baidu.fn.bind(function(){
            var me = this;
            var input = me.getInput();
            me.menu.open();
            me.menu.update({//如果开启input可编辑模式，则智能筛选数据
                data: me.editable ? me.filter(input.value, me.data) : me.data
            });
        }, me);
        
        me.on(input, "focus", me._showMenuHandler);
        if(me.editable){
            input.readOnly = '';
            me.on(input, "keyup", me._showMenuHandler);
        }
    },

    /**
     * 创建下拉菜单
     * @private
     * @return {baidu.ui.Menubar} Menubar对象
     */
    _createMenu : function(){
        var me = this,
            body = me.getBody(),
            arrow = me.getArrow(),
            menuOptions = {
                width: me.width || body.offsetWidth,
                onitemclick: function(data){
                    me.chooseItem(data);
                },
                element: body,
                autoRender: true,
                data: me.data,
                onbeforeclose: me.onbeforeclose,
                onclose: me.onclose,
                onbeforeopen: me.onbeforeopen,
                onopen: me.onopen
            };
                 
        me.menu = baidu.ui.create(baidu.ui.Menubar, menuOptions);
        me.menu.close(true);
        
        me._showAllMenuHandler = baidu.fn.bind(function(){
            var me = this;
            me.menu.open();
            me.menu.update({
                data: me.data
            });
        }, me);
        me.on(arrow, 'click', me._showAllMenuHandler);
        return me.menu;
    },

    /**
     * 获取input元素
     * @return {HTMLElement} input元素
     */
    getInput : function(){
        return baidu.g(this.getId("input"));
    },

    /**
     * 获取下拉箭头元素
     * @return {HTMLElement} arrow元素
     */
    getArrow : function(){
        return baidu.g(this.getId("arrow"));
    },

    /**
     * 响应条目被选择,并发出 onitemclick 事件
     * @param {Object} data 选中的数据
     */
    chooseItem : function(data){
        var me = this;
        me.getInput().value = data.value.content;
        me.dispatchEvent('onitemclick', data);
    },

    /**
     * 设置input的值
     * @param {String} value 值
     */
    setValue:function(value){
        this.getInput().value = value;
    },

    /**
     * 销毁Combox
     * @public
     */
    dispose: function(){
        var me = this;
        me.menu && me.menu.dispose();
        me.getMain() && baidu.dom.remove(me.getMain());
        me.dispatchEvent('ondispose');
        baidu.lang.Class.prototype.dispose.call(me);
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */








/**
 * select插件，支持通过select控件的数据创建combox   
 * @name baidu.ui.Combox.Combox$select
 * @addon baidu.ui.Combox
 * @param   {Object}            [options]   参数对象
 * @config  {Element|String}    select      select对象的id或者element本身
 * @config  {String}            type        启动插件参数，设置为'select'
 * @author  
 */
baidu.ui.Combox.register(function(me){
    var select = me.select = baidu.dom.g(me.select),
        pos;
    if(!select
        || me.type.toLowerCase() != 'select'
        || select.tagName.toUpperCase() != 'SELECT'){return;}
    me.addEventListener('beforerender', function(){
        baidu.array.each(select.options, function(item){
            me.data.push({value: (item.value || item.innerHTML), content: item.innerHTML});
        });
        pos = baidu.dom.getPosition(select);
        me.position = {x: pos.left, y: pos.top};
        select.style.display = 'none';
        me.addEventListener('itemclick', function(data){
            select.value = data.value.value || data.value.content;
        });
    });
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */





/**
 * 状态插件，提供enable、disable行为
 * @name baidu.ui.Combox.Combox$statable
 * @addon baidu.ui.Combox
 */
baidu.ui.Combox.register(function(me){
 
    me.addEventListener('onenable', function(){
        var input = me.getInput();
            
        baidu.on(me.getArrow(), 'click', me._showAllMenuHandler);
        baidu.on(input, "focus", me._showMenuHandler);
        
        if(me.editable){
            input.readOnly = '';
            baidu.on(input, "keyup", me._showMenuHandler);
        }    
    });
	
    me.addEventListener('ondisable', function(){
        var input = me.getInput();

        baidu.un(input, "keyup", me._showMenuHandler);
        baidu.un(input, "focus", me._showMenuHandler);
        baidu.un(me.getArrow(), 'click', me._showAllMenuHandler);
        
        input.readOnly = 'readOnly';
    });
});
/*
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 */













/**
 * 创建一个 Popup 层
 * 
 * @author: meizz
 * @namespace: baidu.ui.createPopup
 * @version: 2010-06-08
 * @param   {JSON}      options     配置信息
 * @private
 */
baidu.ui.createPopup = function(options) {
    var popup = baidu.lang.createSingle({isOpen : false});
    popup.eid = "baidupopup_"+ popup.guid;

    // IE 浏览器使用系统的 window.createPopup()
    var POPUP, IFRAME,
        bodyStyle = "font-size:12px; margin:0;";
    try {baidu.browser.ie && (POPUP = window.createPopup());}catch(ex){}

    // 非 IE 浏览器使用 <iframe> 作为 popup 的载体
    if (!POPUP) {
        var str = "<iframe id='"+ popup.eid +"' scrolling='no'"+
            " frameborder='0' style='position:absolute; z-index:1001; "+
            " width:0px; height:0px; background-color:#0FFFFF'></iframe>";
        if (!document.body) {document.write(str);} else {
            baidu.dom.insertHTML(document.body, "afterbegin", str);
        }
    }

    /**
     * 启动 popup 的初始化程序
     */
    popup.render = function() {
        var me = this;
        if (POPUP) {   // window.createPopup()
            me.window = POPUP;
            me.document = POPUP.document;
            var s = me.styleSheet = me.createStyleSheet();
            s.addRule("body", bodyStyle);
            me.dispatchEvent("onready");
        } else {
            // 初始化 iframe
            initIframe();
        }
        baidu.event.on(window, "onblur", function(){
            me.focusme = false;
            if (!me.isOpen) return;
            setTimeout(function(){if(!me.focusme) me.hide()}, 100);
        });
        baidu.event.on(window, "onresize", function(){me.hide()});
        baidu.event.on(document, "onmousedown", function(){me.hide()});
    };

    function initIframe(delay) {
        IFRAME = baidu.dom.g(popup.eid);

        // 修正Firefox的一个BUG
        // Firefox 对于刚刚动态创建的 <iframe> 写入的时候无法渲染内容
        if ((!delay && baidu.browser.firefox) || !IFRAME) {
            setTimeout(function(){initIframe(true)}, 10);
            return;
        }
        popup.window = IFRAME.contentWindow;
        var d = popup.document = popup.window.document;
        var s = "<html><head><style type='text/css'>"+
            "body{"+ bodyStyle +" background-color:#FFFFFF;}\n"+
            "</style></head><body onfocus='parent[\""+ baidu.guid +"\"]._instances[\""+
            popup.guid +"\"].focusme=true'></body></html>";
        d.open(); d.write(s); d.close();
        popup.styleSheet = popup.createStyleSheet();
        popup.dispatchEvent("onready");
    }

    /**
     * 创建 popup 层里的 style sheet 对象
     */
    popup.createStyleSheet = function(op) {
        op = op || {};
        op.document = this.document;
        return baidu.page.createStyleSheet(op);
    };

    /**
     * 显示 popup 层
     */
    popup.show = function(left, top, width, height, trigger, position) {
        if (POPUP) {
            if (position == "top") top = -height;
            else top = trigger.offsetHeight;

            POPUP.show(0, top, width, height, trigger || document.body);

            this.isOpen = POPUP.isOpen;
        } else if (IFRAME) {
            baidu.dom.show(this.eid);

            if (position == "top") top -= height;
            else top = top + trigger.offsetHeight;

            this.isOpen = true;
            var s = IFRAME.style;
            s.width = width +"px";
            s.height = height +"px";
            s.top = top +"px";
            s.left = left +"px";
        }
        this.dispatchEvent("onshow");
    };

    /**
     * 显示 popup 层
     */
    popup.bind = function(trigger, width, height, position) {
        var pos = baidu.dom.getPosition(trigger);
        this.show(pos.left, pos.top, width, height, trigger, position);
    };

    /**
     * 隐藏 popup 层
     */
    popup.hide = function() {
        if (this.isOpen) {
            if (POPUP) {
                POPUP.hide();
                this.isOpen = POPUP.isOpen;
            } else if (IFRAME) {    // iframe mode
                this.isOpen = false;

                var s = IFRAME.style;
                s.width = "0px";
                s.height = "0px";
                baidu.dom.hide(this.eid);
            }
            this.dispatchEvent("onhide");
        }
    };

    /**
     * 向 popup 层写入内容
     */
    popup.write = function(str) {
        var me = this;
        this.document.body.innerHTML = str;
        //this.document.close();
    };

    return popup;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



















/*
 * popup基类，建立一个popup实例，这个类原则上不对外暴露
 * reference: http://docs.jquery.com/UI/Popup (Popup in jquery)
 */

 /**
 * popup 基类，建立一个popup实例
 * @class
 * @grammar new baidu.ui.Popup(options)
 * @param     {Object}             options               选项
 * @config    {DOMElement}         content               要放到popup中的元素，如果传此参数时同时传contentText，则忽略contentText。
 * @config    {String}             contentText           popup中的内容
 * @config    {String|Number}      width                 内容区域的宽度。注意，这里的内容区域指getContent()得到元素的区域，不包含title和footer。
 * @config    {String|Number}      height                内容区域的高度
 * @config    {String|Number}      top                   popup距离页面上方的距离
 * @config    {String|Number}      left                  popup距离页面左方的距离
 * @config    {String}             classPrefix           popup样式的前缀
 * @config    {Number}             zIndex                popup的zIndex值
 * @config    {Function}           onopen                popup打开时触发
 * @config    {Function}           onclose               popup关闭时触发
 * @config    {Function}           onbeforeclose         popup关闭前触发，如果此函数返回false，则组织popup关闭。
 * @config    {Function}           onupdate              popup更新内容时触发
 * @config    {Boolean}            closeOnEscape         keyboardSupport模块提供支持，当esc键按下时关闭popup
 * @config    {String}             closeText             closeButton模块提供支持，关闭按钮上的文字
 * @config    {Boolean}            modal                 modal模块支持，是否显示遮罩
 * @config    {String}             modalColor            modal模块支持，遮罩的颜色
 * @config    {Number}             modalOpacity          modal模块支持，遮罩的透明度
 * @config    {Number}             modalZIndex           modal模块支持，遮罩的zIndex值
 * @config    {Boolean}            draggable             draggable模块支持，是否支持拖拽
 * @config    {Function}           ondragstart           draggable模块支持，当拖拽开始时触发
 * @config    {Function}           ondrag                draggable模块支持，拖拽过程中触发
 * @config    {Function}           ondragend             draggable模块支持，拖拽结束时触发
 * @plugin 	  coverable 		   支持背景遮罩
 * @remark
 * @return {baidu.ui.Popup}                                    Popup类
 */

baidu.ui.Popup = baidu.ui.createUI(function (options){
}).extend(
/**
 *  @lends baidu.ui.Popup.prototype
 */
{
    //ui控件的类型，传入给UIBase **必须**
    uiType            : "popup",
   //ui控件的class样式前缀 可选
    //classPrefix     : "tangram-popup-",

    width           : '',
    height          : '',

    top             : 'auto',
    left            : 'auto',
    zIndex          : 1200,//没有做层管理
    //content         : null,//dom节点
    contentText     : '',

    //onopen          : function(){},
    /**
     * @private
     */
    onbeforeclose   : function(){ return true},
    //onclose         : function(){},
    //onupdate        : function(){},


    tplBody          : "<div id='#{id}' class='#{class}' style='position:relative; top:0px; left:0px;'></div>",

    /**
     * 查询当前窗口是否处于显示状态
     * @public
     * @return    {Boolean}       是否处于显示状态
     */
    isShown : function(){
        return baidu.ui.Popup.instances[this.guid] == 'show';
    },

    /**
     * @private
     */
    getString : function(){
        var me = this;
        return baidu.format(
                me.tplBody, {
                    id      : me.getId(),
                    "class" : me.getClass()
                }
            );
    },

    /**
     * render popup到DOM树
     * @private
     */
    render : function(){
        var me = this,
            main;

        //避免重复render
        if(me.getMain()){
            return ;
        }

        main = me.renderMain();
        
        main.innerHTML = me.getString();

        me._update(me);

        baidu.dom.setStyles(me.getMain(), {
            position    : "absolute",
            zIndex      : me.zIndex,
            marginLeft  : "-100000px"
        });
        
        me.dispatchEvent("onload");

        return main;
    },

    /**
     * 显示当前popup
     * @public
     * @param  {Object}             options               选项参数
     * @config {DOMElement}         content               要放到popup中的元素，如果传此参数时同时传contentText，则忽略contentText。
     * @config {String}             contentText           popup中的内容
     * @config {String|Number}      width                 内容区域的宽度。注意，这里的内容区域指getContent()得到元素的区域，不包含title和footer。
     * @config {String|Number}      height                内容区域的高度
     * @config {String|Number}      top                   popup距离页面上方的距离
     * @config {String|Number}      left                  popup距离页面左方的距离
     * @config {String}             classPrefix           popup样式的前缀
     * @config {Number}             zIndex                popup的zIndex值
     * @config {Function}           onopen                popup打开时触发
     * @config {Function}           onclose               popup关闭时触发
     * @config {Function}           onbeforeclose         popup关闭前触发，如果此函数返回false，则组织popup关闭。
     * @config {Function}           onupdate              popup更新内容时触发
     * @config {Boolean}            closeOnEscape         keyboardSupport模块提供支持，当esc键按下时关闭popup
     * @config {String}             closeText             closeButton模块提供支持，关闭按钮上的文字
     * @config {Boolean}            modal                 modal模块支持，是否显示遮罩
     * @config {String}             modalColor            modal模块支持，遮罩的颜色
     * @config {Number}             modalOpacity          modal模块支持，遮罩的透明度
     * @config {Number}             modalZIndex           modal模块支持，遮罩的zIndex值
     * @config {Boolean}            draggable             draggable模块支持，是否支持拖拽
     * @config {Function}           ondragstart           draggable模块支持，当拖拽开始时触发
     * @config {Function}           ondrag                draggable模块支持，拖拽过程中触发
     * @config {Function}           ondragend             draggable模块支持，拖拽结束时触发
     */
    open : function(options){
        var me = this;

        me._update(options);

        me.getMain().style.marginLeft = "auto";
        
        baidu.ui.Popup.instances[me.guid] = "show";

        me.dispatchEvent("onopen");
    },

    /**
     * 隐藏当前popup
     * @public
     */
    close : function(){
        var me = this;
        if(me.dispatchEvent("onbeforeclose")){
            me.getMain().style.marginLeft = "-100000px";
            baidu.ui.Popup.instances[me.guid] = "hide";
            me.dispatchEvent("onclose");
        }
    },
    
    /**
     * 更新popup状态 
     * @public
     * @param  {Object}             options               选项参数
     * @config {DOMElement}         content               要放到popup中的元素，如果传此参数时同时传contentText，则忽略contentText。
     * @config {String}             contentText           popup中的内容
     * @config {String|Number}      width                 内容区域的宽度。注意，这里的内容区域指getContent()得到元素的区域，不包含title和footer。
     * @config {String|Number}      height                内容区域的高度
     * @config {String|Number}      top                   popup距离页面上方的距离
     * @config {String|Number}      left                  popup距离页面左方的距离
     * @config {String}             classPrefix           popup样式的前缀
     * @config {Number}             zIndex                popup的zIndex值
     * @config {Function}           onopen                popup打开时触发
     * @config {Function}           onclose               popup关闭时触发
     * @config {Function}           onbeforeclose         popup关闭前触发，如果此函数返回false，则组织popup关闭。
     * @config {Function}           onupdate              popup更新内容时触发
     * @config {Boolean}            closeOnEscape         keyboardSupport模块提供支持，当esc键按下时关闭popup
     * @config {String}             closeText             closeButton模块提供支持，关闭按钮上的文字
     * @config {Boolean}            modal                 modal模块支持，是否显示遮罩
     * @config {String}             modalColor            modal模块支持，遮罩的颜色
     * @config {Number}             modalOpacity          modal模块支持，遮罩的透明度
     * @config {Number}             modalZIndex           modal模块支持，遮罩的zIndex值
     * @config {Boolean}            draggable             draggable模块支持，是否支持拖拽
     * @config {Function}           ondragstart           draggable模块支持，当拖拽开始时触发
     * @config {Function}           ondrag                draggable模块支持，拖拽过程中触发
     * @config {Function}           ondragend             draggable模块支持，拖拽结束时触发
     *
     */
    update : function(options){
        var me = this;
        me._update(options);
        me.dispatchEvent("onupdate");
    },
   
    _update: function(options){
         options = options || {};                                                                                                                          
         var me = this, contentWrapper = me.getBody();                                                                                                     
                                                                                                                                                           
         //扩展options属性                                                                                                                                 
         baidu.object.extend(me, options);                                                                                                                 
                                                                                                                                                           
         //更新内容                                                                                                                                        
         if(options.content){                                                                                                                              
             //content优先                                                                                                                                 
             if(contentWrapper.firstChild != options.content){                                                                                             
                 contentWrapper.innerHTML = "";                                                                                                            
                 contentWrapper.appendChild(options.content);                                                                                              
             }                                                                                                                                             
         }else if(options.contentText){                                                                                                                    
             //建议popup不要支持text                                                                                                                       
             contentWrapper.innerHTML = options.contentText;                                                                                               
         }                                                                                                                                                 
         me._updateSize();                                                                                                                                 
         me._updatePosition();                                                                                                                             
    },

    /**
     * 更新大小,子类可以通过同名方法覆盖;
     * 默认实现为使用参数的width和height赋值
     */
    //[Interface]
    _updateSize : function(){
        var me = this;
        baidu.dom.setStyles(me.getMain(), { width : me.width, height : me.height});
    },
    /**
     * 更新位置,子类可以通过同名方法覆盖;
     * 默认实现为使用参数的top和left赋值
     */
    //[Interface]
    _updatePosition : function(){
        var me = this;
        baidu.dom.setStyles(me.getMain(), { top : me.top, left : me.left});
    },
    /**
     * 销毁控件
     * @public
     */
    dispose : function(){
        var me = this;
        me.dispatchEvent("ondispose");
        baidu.dom.remove(me.getMain());
        baidu.lang.Class.prototype.dispose.call(me);
    }
});

baidu.ui.Popup.instances = baidu.ui.Popup.instances || [];

﻿/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 支持背景遮罩掩盖select、flash、iframe元素
 * @name baidu.ui.Popup.Popup$coverable
 * @addon baidu.ui.Popup
 */
baidu.extend(baidu.ui.Popup.prototype,{
    coverable: true,
    coverableOptions: {}
});

baidu.ui.Popup.register(function(me){

    if(me.coverable){

        me.addEventListeners("onopen,onload", function(){
            me.Coverable_show();
        });

        me.addEventListener("onclose", function(){
            me.Coverable_hide();
        });

        me.addEventListener("onupdate",function(){
            me.Coverable_update();
        });
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



















/**
 * 创建一个日历对象绑定于一个input输入域
 * @name baidu.ui.DatePicker
 * @class
 * @grammar new baidu.ui.DatePicker(options)
 * @param {Object} options config参数
 * @config {Number} width 日历组件的宽度
 * @config {Number} height 日历组件的高度
 * @config {String} format 日历组件格式化日历的格式，默认：yyyy-MM-dd
 * @config {Object} popupOptions Picker组件的浮动层由Popup组件渲染，该参数用来设置Popup的属性，具体参考Popup
 * @config {Object} calendarOptions Picker组件的日历由Calendar组件渲染，该参数来用设置Calendar的属性，具体参考Calendar
 * @config {Function} onpick 当选中某个日期时的触发事件
 * @config {String} language 当前语言，默认为中文
 */
baidu.ui.DatePicker = baidu.ui.createUI(function(options){
    var me = this;
    me.format = me.format || baidu.i18n.cultures[me.language].calendar.dateFormat || 'yyyy-MM-dd';
    me.popupOptions = baidu.object.merge(me.popupOptions || {},
        options,
        {overwrite: true, whiteList: ['width', 'height']});
    me.calendarOptions = baidu.object.merge(me.calendarOptions || {},
        options,
        {overwrite: true, whiteList: ['weekStart']});
    me._popup = new baidu.ui.Popup(me.popupOptions);
    me._calendar = new baidu.ui.Calendar(me.calendarOptions);
    me._calendar.addEventListener('clickdate', function(evt){
        me.pick(evt.date);
    });
}).extend(
/**
 *  @lends baidu.ui.DatePicker.prototype
 */
{
    uiType: 'datePicker',

    language: 'zh-CN',
    
    /**
     * 取得从input到得字符按format分析得到的日期对象
     * @private
     */
    _getInputDate: function(){
        var me = this,
            dateValue = me.input.value,
            patrn = [/yyyy|yy/, /M{1,2}/, /d{1,2}/],//只支持到年月日的格式化，需要时分秒的请扩展此数组
            len = patrn.length,
            date = [],
            regExp,
            index;
        if(!dateValue){return;}
        for(var i = 0; i < len; i++){
            if(regExp = patrn[i].exec(me.format)){
                index = regExp.index;
                date[i] = dateValue.substring(index, index + regExp[0].length);
            }
        }
        return new Date(date[0], date[1] - 1, date[2]);//需要时分秒的则扩展参数
    },
    
    /**
     * 鼠标点击的事件侦听器，主要用来隐藏日历
     * @private
     */
    _onMouseDown: function(evt){
        var me = this,
            popup = me._popup,
            target = baidu.event.getTarget(evt);
        if(target.id != me.input.id
            && !baidu.dom.contains(popup.getBody(), target)){
            me.hide();
        }
    },
    
    /**
     * 渲染日期组件到body中并绑定input
     * @param {HTMLElement} target 一个input对象，该input和组件绑定
     */
    render: function(target){
        var me = this,
            focusHandler = baidu.fn.bind('show', me),
            mouseHandler = baidu.fn.bind('_onMouseDown', me),
            keyHandler = baidu.fn.bind('hide', me),
            input = me.input = baidu.dom.g(target),
            popup = me._popup;
        if(me.getMain() || !input){
            return;
        }
        popup.render();
        me._calendar.render(popup.getBody());
        me.on(input, 'focus', focusHandler);
        me.on(input, 'keyup', keyHandler);
        me.on(document, 'click', mouseHandler);
    },
    
    /**
     * 当点击某个日期时执行pick方法来向input写入日期
     * @param {Date} date 将日期写到input中
     */
    pick: function(date){
        var me = this;
        me.input.value = baidu.date.format(date, me.format);
        me.hide();
        me.dispatchEvent('pick');
    },
    
    /**
     * 显示日历
     */
    show: function(){
        var me = this,
            pos = me.input && baidu.dom.getPosition(me.input),
            popup = me._popup,
            calendar = me._calendar,
            doc = document[baidu.browser.isStrict ? 'documentElement' : 'body'],
            inputHeight = me.input.offsetHeight,
            popupHeight = me._popup.getBody().offsetHeight;
        me._calendar.setDate(me._getInputDate() || calendar._toLocalDate(new Date()));
        me._calendar.renderTitle();
        me._calendar._renderDate();
//        me._calendar.update({initDate: me._getInputDate() || calendar._toLocalDate(new Date())});
        pos.top += (pos.top + inputHeight + popupHeight - doc.scrollTop > doc.clientHeight) ? -popupHeight
            : inputHeight;
        me._popup.open(pos);
    },
    
    /**
     * 隐藏日历
     */
    hide: function(){
        this._popup.close();
    },
    
    /**
     * 析构函数
     */
    dispose: function(){
        var me = this;
        me.dispatchEvent('dispose');
        me._calendar.dispose();
        me._popup.dispose();
        baidu.lang.Class.prototype.dispose.call(me);
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */








/**
 * 创建一个content是iframe的dialog
 * @name baidu.ui.Dialog.Dialog$iframe
 * @addon baidu.ui.Dialog
 */
baidu.ui.Dialog.register(function(me){
    if(me.type == "iframe"){
        baidu.extend(me,{
            autoRender : true,
            tplIframe: "<iframe width='100%' height='97%' frameborder='0' scrolling='no' name='#{name}' id='#{id}' class='#{class}'></iframe>",

            /**
             * 获取iframe
			 * @name baidu.ui.Dialog.Dialog$iframe.getIframe
			 * @addon baidu.ui.Dialog.Dialog$iframe
			 * @function 
             * @return {HTMLElement} iframe
             */
            getIframe: function(){
                return baidu.g(this.getId('iframe'));
            },

            /**
             * 更新iframe的Style，更新dialog
			 * @name baidu.ui.Dialog.Dialog$iframe.updateIframe
			 * @addon baidu.ui.Dialog.Dialog$iframe
			 * @function 
             * @param {Object} styles 样式名称和值组成的对象，例如{width:"500px",height:"300px"}
             * @return {Null}
             */
            updateIframe:function(styles){
                baidu.setStyles(this.getId('iframe'), styles);
                me._updatePosition();
                me.dispatchEvent('onupdate');
            }
        });
        
        var contentText,
            iframeId = me.getId('iframe'),
            iframeName = me.iframeName || iframeId,
            iframeElement,
            contentWindow,
            contentText = baidu.format(me.tplIframe,{
                name: iframeName,
                id: iframeId,
                'class': me.getClass('iframe')
            });

        me.addEventListener("onload",function(){
            me._update({contentText:contentText});
            me._updatePosition();
            iframeElement = baidu.g(iframeId);
    
            //解决iframe加载后无法准确定位dialog的问题
            me.on(iframeElement, 'onload', function() {
                me._updatePosition();
                me.dispatchEvent('onupdate');
            });
            iframeElement.src = me.iframeSrc;
        });  
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */







/**
 * 键盘支持模块，支持esc关闭最上层的dialog，enter确认alert和confirm
 * @name baidu.ui.Dialog.Dialog$keyboard
 * @addon baidu.ui.Dialog
 */
baidu.extend(baidu.ui.Dialog.prototype,{
    enableKeyboard : true,
    closeOnEscape : true
});
baidu.ui.Dialog.register(function(me){

    baidu.ui.Dialog.keyboardHandler = baidu.ui.Dialog.keyboardHandler || function(e){
        e = window.event || e;
        var keyCode = e.keyCode || e.which, onTop, eachDialog;
        
        //所有操作针对zIndex最大的dialog
        baidu.object.each(baidu.ui.Dialog.instances, function(item, key){
            if(item == "show"){
                eachDialog = baidu.lang.instance(key);
                if(!onTop || eachDialog.zIndex > onTop.zIndex){
                    onTop = eachDialog;
                }
            }
        });
        if(onTop){
            switch (keyCode){
                //esc按键触发
                case 27:
                    onTop.closeOnEscape && onTop.close();
                    break;
                //回车键触发
                case 13:
                    onTop.dispatchEvent("onenter");
                    break;
                default:
            }
        }
    };

    if(me.enableKeyboard && !baidu.ui.Dialog.keyboardEventReady){
        baidu.on(document, "keyup", baidu.ui.Dialog.keyboardHandler);
        baidu.ui.Dialog.keyboardEventReady = true;
    }
    
    //如果一个instance都没有了，才把事件删除
    me.addEventListener("ondispose", function(){
        var noInstance = true;
        baidu.object.each(baidu.ui.Dialog.instances, function(item, key){
            noInstance = false;
            return false;
        });        
        if(noInstance){
            baidu.event.un(document, "keyup", baidu.ui.Dialog.keyboardHandler);
            baidu.ui.Dialog.keyboardEventReady = false;
        }
    });
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

































//添加对flash的隐藏和显示
//在webkit中，使用iframe加div的方式遮罩wmode为window的flash会时性能下降到无法忍受的地步
//在Gecko中，使用透明的iframe无法遮住wmode为window的flash
//在其余浏览器引擎中wmode为window的flash会被遮罩，处于不可见状态
//因此，直接将wmode为window的flash隐藏，保证页面最小限度的修改


/**
 * 为控件增加遮罩.
 * @class Modal类
 * @grammar new baidu.ui.Modal()
 * @plugin coverable 支持背景遮罩
 */
baidu.ui.Modal = baidu.ui.createUI(function(options) {
    var me = this,
        container = (options && options.container) ? baidu.g(options.container) : null;

    !container && (container = document.body);
    if (!container.id) {
        container.id = me.getId('container');
    }

    me.containerId = container.id;
    me.styles = {
        color: '#000000',
        opacity: 0.6,
        zIndex: 1000
    };
    
}).extend(
/**
 *  @lends baidu.ui.Modal.prototype
 */
{
    uiType: 'modal',
    _showing: false,

    /**
     * 获取modal的Container
     * @public
     * @return {HTMLElement} container.
     */
    getContainer: function() {
        var me = this;
        return baidu.g(me.containerId);
    },

    /**
     * 渲染遮罩层
     * @public
     * @return {NULL}
     * */
    render: function() {
        var me = this,
            modalInstance,
            fixableInstance,
            style,
            main,
            id = me.containerId,
            container = baidu.g(me.containerId);

        //当该container中已经存在modal时
        //将所需参数付给当前的modalInstance
        if (modalInstance = baidu.ui.Modal.collection[id]) {
            me.mainId = modalInstance.mainId;
            main = me.getMain();
        }else {
            //如果不存在modal,则创建新的modal
            main = me.renderMain();
            if (container !== document.body) {
                container.appendChild(main);
            }else{
                fixableInstance = baidu.dom.fixable(main, {
                    autofix: false,
                    vertival: 'top',
                    horizontal: 'left',
                    offset: {x:0, y:0}
                });
            }
            //将参数写入
            baidu.ui.Modal.collection[id] = {
                mainId: me.mainId,
                instance: [],
                flash:{},
                fixableInstance: fixableInstance
            };
        }

        me.dispatchEvent('onload');
    },

    /**
     * 显示遮罩层
     * @public
     * @param  {Object} options     显示选项,任何合法的style属性.
     * @return {NULL}
     */
    show: function(options) {
        var me = this,
            container = me.getContainer(),
            main = me.getMain(),
            containerId = me.containerId,
            modalInstanceOptions = baidu.ui.Modal.collection[containerId],
            fixableInstance = modalInstanceOptions.fixableInstance,
            length = modalInstanceOptions.instance.length,
            lastTop;

        if (me._showing)
            return;

        if (length > 0) {
            lastTop = baidu.lang.instance(modalInstanceOptions.instance[length - 1]);
            lastTop && lastTop._removeHandler();
        }
        options = options || {};
        me._show(options.styles || {});
        if(fixableInstance)
            fixableInstance.render();
        main.style.display = 'block';
      
        //将在此层中隐藏flash入库
        modalInstanceOptions.flash[me.guid] = me._hideFlash();
    
        //将自己的guid加在guid最后
        modalInstanceOptions.instance.push(me.guid);
        me._showing = true;

        me.dispatchEvent('onshow');
    },

    /**
     * 更新遮罩层，绑定window.resize & window.scroll
     * @private
     * @param {Object} styles
     * @return {NULL}
     */
    _show: function(styles) {
        var me = this;

        me._getModalStyles(styles || {});
        me._update();

        if(me.getContainer() === document.body && baidu.browser.ie && baidu.browser.ie <= 7){
            me.windowHandler = me.getWindowHandle();
            baidu.on(window, 'resize', me.windowHandler);
        }
    },

    /**
     * 隐藏遮罩层
     * @public
     * @return {NULL}
     */
    hide: function() {
        var me = this;
        me._hide(); 
        me.dispatchEvent('onhide');
    },

    _hide: function(){
        var me = this,
            containerId = me.containerId,
            modalInstanceOptions = baidu.ui.Modal.collection[containerId],
            flash = modalInstanceOptions.flash[me.guid],
            main = me.getMain(),
            length = modalInstanceOptions.instance.length,
            lastTop;

         if (!me._showing)
             return;

         for (var i = 0; i < length; i++) {
             if (modalInstanceOptions.instance[i] == me.guid) {
                 modalInstanceOptions.instance.splice(i, 1);
                 break;
             }
         }
         length = modalInstanceOptions.instance.length;
         if (i == length) {
             me._removeHandler();
             if (length > 0) {
                 lastTop = baidu.lang.instance(modalInstanceOptions.instance[length - 1]);
                 lastTop && lastTop._show();
             }else {
                 main.style.display = 'none';
             }

             me._restoreFlash(flash);
         }else{
             //如果不是最后一个，就将该层对应的flash移动到下一层的数组中
             lastTop = baidu.lang.instance(modalInstanceOptions.instance[length - 1]);
             modalInstanceOptions.flash[lastTop.guid] = modalInstanceOptions.flash[lastTop.guid].concat(flash);
         }

         modalInstanceOptions.flash[me.guid] = []; 
         me._showing = false;
    },


    /**
     * 接触window.resize和window.scroll上的事件绑定
     * @private
     * @return {NULL}
     */
    _removeHandler: function() {
        var me = this;
        if(me.getContainer() === document.body && baidu.browser.ie && baidu.browser.ie <= 7){
            baidu.un(window, 'resize', me.windowHandler);
        }
    },

    /**
     * window.resize & window.scroll 事件调用的function
     * @public
     * @return {NULL}
     */
    getWindowHandle: function() {
        var me = this,
            main = me.getMain();

        return function() {
            baidu.setStyles(main, {
                width: baidu.page.getViewWidth(),
                height: baidu.page.getViewHeight()
            });
            
            if(me.getContainer() === document.body && baidu.browser.ie && baidu.browser.ie <= 7){
                //iframe 补丁
                window.top !== window.self && setTimeout(function(){
                    me._getModalStyles({});
                    me._update();
                },16);
            }
         };
    },

    /**
     * 更新遮罩层
     * @public
     * @param  {Object} options 显示选项，同show.
     * @return {NULL}
     */
    update: function(options) {
        options = options || {};
        var me = this,
            main = me.getMain(),
            modalInstanceOptions = baidu.ui.Modal.collection[me.containerId];

        options = options || {};
        baidu.extend(me, options);

        me._getModalStyles(options.styles || {});
        me._update();
        delete(options.styles);
        baidu.extend(me, options);

        me.dispatchEvent('onupdate');
    },

    /**
     * 更新样式
     * @private
     * @return {NULL}
     */
    _update: function() {
        var me = this, main = me.getMain();
        baidu.dom.setStyles(main, me.styles);
    },

    /**
     * 获取遮罩层相对container左上角的top和left
     * @private
     * @options {object} show传入的styles
     * @return {NULL}
     */
    _getModalStyles: function(styles) {
        var me = this,
            main = me.getMain(),
            container = me.getContainer(),
            offsetParentPosition,
            parentPosition, offsetParent;

        function getStyleNum(d,style) {
            var result = parseInt(baidu.getStyle(d, style));
            result = isNaN(result) ? 0 : result;
            result = baidu.lang.isNumber(result) ? result : 0;
            return result;
        }

        if (container !== document.body) {
            styles['width'] = container.offsetWidth;
            styles['height'] = container.offsetHeight;

            if (baidu.getStyle(container, 'position') == 'static') {
                offsetParent = main.offsetParent || document.body;
                offsetParentPosition = baidu.dom.getPosition(offsetParent);
                parentPosition = baidu.dom.getPosition(container);
                styles['top'] = parentPosition.top - offsetParentPosition.top + getStyleNum(offsetParent, 'marginTop');
                styles['left'] = parentPosition.left - offsetParentPosition.left + getStyleNum(offsetParent, 'marginLeft');
            }
        }else {
     
            if ( baidu.browser.ie > 7 || !baidu.browser.ie) {
                styles['width'] = '100%';
                styles['height'] = '100%';
            }else {
                styles['width'] = baidu.page.getViewWidth();
                styles['height'] = baidu.page.getViewHeight();
            }
        }

        //更新styles
        baidu.extend(me.styles, styles);
        me.styles['backgroundColor'] = me.styles['color'] || me.styles['backgroundColor'];
        delete(me.styles['color']);
    },

    /**
     * 隐藏flash
     * @private
     * @return {Null}
     */
    _hideFlash: function(){
        var me = this,
            container = me.getContainer(),
            elements = container.getElementsByTagName('object'),
            result = [];

        //只隐藏wmode = window的flash
        baidu.each(elements, function(item){
            var isWinMode = true;
            
            if(baidu.dom.getAncestorBy(item,function(element){
                if(baidu.getStyle(element, 'zIndex') > me.styles.zIndex){
                    return true;
                }
                
                return false;
            })){
                return;
            }

            baidu.each(baidu.dom.children(item), function(param){
                if(baidu.getAttr(param, 'name') == 'wmode' && baidu.getAttr(param, 'value') != 'window'){
                    isWinMode = false;
                }
            });

            if(isWinMode){
                result.push([item,baidu.getStyle(item, 'visibility')]);
                item.style.visibility = 'hidden';
            }
        });

        return result;
    },

    /**
     * 还原flash
     * @private
     * @return {Null}
     */
    _restoreFlash: function(flash){
        baidu.each(flash, function(item){
            if(item[0] != null){
                item[0].style.visibility = item[1];
            }
        });  
    },

    /**
     * 销毁
     * @public
     * @return {Null}
     */
    dispose: function(){
        var me = this;
        
        me._hide();
        me.dispatchEvent('ondispose');
        baidu.lang.Class.prototype.dispose.call(me);
    }
});

//存储所有的modal参数
baidu.ui.Modal.collection = {};
﻿/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */







/**
 * 支持背景遮罩掩盖select、flash、iframe元素
 * @name baidu.ui.Modal.Modal$coverable
 * @addon baidu.ui.Modal
 */
baidu.extend(baidu.ui.Modal.prototype,{
    coverable: true,
    coverableOptions: {}
});

baidu.ui.Modal.register(function(me){

    if(me.coverable){

        if(!baidu.browser.isWebkit && !baidu.browser.isGecko){
            me.addEventListener("onload", function(){
                me.Coverable_show();
            });

            me.addEventListeners("onshow,onupdate",function(){
                me.Coverable_update();
            });

            me.addEventListener("onhide", function(){
                me.Coverable_hide();
            })
        }
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 *支持遮罩
 * @name baidu.ui.Dialog.Dialog$modal
 * @addon baidu.ui.Dialog
 */
baidu.extend(baidu.ui.Dialog.prototype, {
    modal : true,
    modalColor : "#000000",
    modalOpacity : 0.4,
    hideModal : function(){
        var me = this;
        (me.modal && me.modalInstance) && me.modalInstance.hide();
    }
});
baidu.ui.Dialog.register(function(me){
    if(me.modal){
        me.addEventListener("onopen", function(){
            //防止一个dialog创建两个modal
            if(!me.modalInstance){
                me.modalInstance = new baidu.ui.Modal({autoRender:true});
            }

            me.modalInstance.show({
                targetUI    : me,
                styles:{
                    color       : me.modalColor,
                    opacity     : me.modalOpacity,
                    zIndex      : me.modalZIndex ? me.modalZIndex : me.zIndex - 1
                }
            });
        });

        me.addEventListener("onclose", me.hideModal);
        me.addEventListener("ondispose", me.hideModal);
    }
});
/*
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/ui/getAttribute.js
 * author: berg
 * version: 1.0.0
 * date: 2010/07/27 00:38:11
 */






/**
 *  从指定的dom元素中获取ui控件的属性值
 *  @grammar baidu.ui.getAttribute(element)
 *  @param {element} element dom元素
 *  @return {Object} params 属性值集合对象
 */

baidu.ui.getAttribute = function(element){
    var attributeName = "data-tangram",
        attrs = element.getAttribute(attributeName),
        params = {},
        len,
        trim = baidu.string.trim;

    if (attrs) {
        //element.removeAttribute(attributeName);
        attrs = attrs.split(';');
        len = attrs.length;

        for (; len--; ) {
            var s = attrs[len],
                pos = s.indexOf(':'),
                name = trim(pos >= 0 ? s.substring(0, pos) : s),
                value = pos >= 0 ? trim(s.substring(pos + 1)) || 'true' : 'true';

            params[baidu.string.toCamelCase(trim(name))] =
                /^\d+(\.\d+)?$/.test(value)
                    ? value - 0
                    : value == 'true' ? true : value == 'false' ? false : value;
        }
    }

    return params;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: ui/Input.js
 * author: zhangyao
 * version: 1.0.0
 * date: 2010-08-26
 */


//依赖包










/**
 * Input基类，创建一个input实例。
 * @class Input类
 * @grammar new baidu.ui.Input(options)
 * @param     {String|HTMLElement}     target        存放input控件的元素，input控件会渲染到该元素内。
 * @param     {Object}                 [options]     选项
 * @config    {String}                 text          input文本信息
 * @config    {Boolean}                disabled      控件是否有效，默认为false（有效）。
 * @config    {Function}               onfocus       聚焦时触发，function(evt){}，evt.DOMEvent取得浏览器的event事件
 * @config    {Function}               onblur        失去焦点时触发，function(evt){}，evt.DOMEvent取得浏览器的event事件
 * @config    {Function}               onchage       input内容改变时触发，function(evt){}，evt.DOMEvent取得浏览器的event事件
 * @config    {Function}               onkeydown     按下键盘时触发，function(evt){}，evt.DOMEvent取得浏览器的event事件
 * @config    {Function}               onkeyup       释放键盘时触发，function(evt){}，evt.DOMEvent取得浏览器的event事件
 * @config    {Function}               onmouseover   鼠标悬停在input上时触发，function(evt){}，evt.DOMEvent取得浏览器的event事件
 * @config    {Function}               onmouseout    鼠标移出input时触发，function(evt){}，evt.DOMEvent取得浏览器的event事件
 * @config    {Function}               ondisable     当调用input的实例方法disable，使得input失效时触发。
 * @config    {Function}               onenable      当调用input的实例方法enable，使得input有效时触发。
 * @config    {Function}               ondispose     销毁实例时触发
 * @returns   {Boolean}                              是否有效，true(失效)/false(有效)
 */

baidu.ui.Input = baidu.ui.createUI(new Function).extend(
/**
 *  @lends baidu.ui.Input.prototype
 */
{
    //ui控件的类型，传入给UIBase **必须**
    uiType            : "input",
    //ui控件的class样式前缀 可选
    //classPrefix     : "tangram-input-",
    tplBody         : '<input id="#{id}" class="#{class}" value="#{text}" onfocus="#{onfocus}" onblur="#{onblur}" onchange="#{onchange}" onkeydown="#{onkeydown}" onkeyup="#{onkeyup}" onmouseover="#{onmouseover}" onmouseout="#{onmouseout}" />',
    disabled		: false,
 
    /**
     * 获得input的HTML字符串。
     * @private
     * @returns {String} HTML字符串
     */
    getString : function(){
        var input = this;
        return baidu.format(input.tplBody, {
				id          : input.getId(),
                onfocus		: input.getCallRef() + "._onEventHandle('onfocus', 'focus', event);",
                onblur		: input.getCallRef() + "._onEventHandle('onblur', null, event);",
                onchange	: input.getCallRef() + "._onEventHandle('onchange', null, event);",
                onkeydown	: input.getCallRef() + "._onEventHandle('onkeydown', 'focus', event);",
                onkeyup		: input.getCallRef() + "._onEventHandle('onkeyup', 'focus', event);",
                onmouseover : input.getCallRef() + "._onEventHandle('onmouseover', 'hover', event);",
                onmouseout  : input.getCallRef() + "._onEventHandle('onmouseout', null, event);",
				text		: input.text,
            	"class"     : input.getClass(input.isDisabled() ? "disable" : "")
        });
    },

    /**
     *  将input绘制到DOM树中。target参数不可省，否则无法渲染。
	 * @public
	 * @param {String|HTMLElement} target 目标渲染对象
     */	
	render : function(target){
		if(!baidu.g(target)){
			return ;
		}
		var input = this;
        baidu.dom.insertHTML(input.renderMain(target), "beforeEnd", input.getString());
        input.getBody().disabled = input.disabled;
	},
	
	_onEventHandle : function(eventName, styleName, evt){
		var input = this;
		if(input.isDisabled()){
			return;
		}
		input._changeStyle(styleName);
		input.dispatchEvent(eventName, {
		    DOMEvent: evt
		});
	},
	
    /*
     *  触发不同事件引起input框样式改变时调用。
     *  style值为normal(tangram-input)、hover(tangram-input-hover)、disable(tangram-input-disable)、focus(tangram-input-focus)
     */ 
	_changeStyle : function(style){
		var input = this,
            body = input.getBody();
		
		baidu.dom.removeClass(
            body,
            input.getClass("hover") + " " + input.getClass("focus") + " " + input.getClass("disable")
        );

		baidu.addClass(body, input.getClass(style));
	},

    /**
     *  判断input是否处于失效状态。
	 * @public
	 * @return {Boolean}    是否处于失效状态
     */ 	
	isDisabled : function(){
		return this.disabled;
	},
	
	/**
     *  获得input文字。
	 * @public 
	 * @return {String}    输入框的文字 
     */
	getText : function(){
		var text = this.getBody().value; 
		return text;
	},
	
	

	_able : function(eventName, isDisabled, styleName){
		var input = this;
		input._changeStyle(styleName);
		input.getBody().disabled = isDisabled;
		input.disabled = isDisabled;
		input.dispatchEvent(eventName);	
	},
	
	/**
     *  使input控件有效。
	 * @public
     */ 
	enable : function(){
		this._able("onenable", false);
	},

    /**
     * 使input控件失效。
	 * @public
     */
	disable : function(){	
		this._able("ondisable", true, "disable");
	},
	
    /**
     *  销毁实例。
	 * @public
     */
	dispose : function(){
		var input = this;
		input.dispatchEvent("ondispose");
		baidu.dom.remove(input.getBody());
		baidu.lang.Class.prototype.dispose.call(input);
	}
});
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path: ui/Login.js
 * author:tianhua 
 * version: 1.0.0
 * date: 2011-02-24
 */
/**
 * Baidu登陆框
 * */




 
 
 






/**
 * 应用实现 login 备注：涉及passport的API接口参数可以参见http://fe.baidu.com/doc/zhengxin/passport/openapi_help.text
 * @name baidu.ui.Login
 * @class
 * @grammar new baidu.ui.Login(options)
 * @param  {String|DOMElement}  content               内容或者内容对应的元素
 * @param  {Object}             [options]             选项参数
 * @config {DOMElement}         content               要放到dialog中的元素，如果传此参数时同时传contentText，则忽略contentText。
 * @config {String}             contentText           dialog中的内容
 * @config {String|Number}      width                 内容区域的宽度，注意，这里的内容区域指getContent()得到元素的区域，不包含title和footer。
 * @config {String|Number}      height                内容区域的高度
 * @config {String|Number}      top                   dialog距离页面上方的距离
 * @config {String|Number}      left                  dialog距离页面左方的距离
 * @config {String}             titleText             dialog标题文字
 * @config {String}             classPrefix           dialog样式的前缀
 * @config {Number}             zIndex                dialog的zIndex值
 * @config {Function}           onopen                dialog打开时触发
 * @config {Function}           onclose               dialog关闭时触发
 * @config {Function}           onbeforeclose         dialog关闭前触发，如果此函数返回false，则组织dialog关闭。
 * @config {Function}           onupdate              dialog更新内容时触发 * @config {Boolean}            closeOnEscape         keyboardSupport模块提供支持，当esc键按下时关闭dialog。 * @config {String}             closeText             closeButton模块提供支持，关闭按钮上的title。
 * @config {Boolean}            modal                 modal模块支持，是否显示遮罩
 * @config {String}             modalColor            modal模块支持，遮罩的颜色
 * @config {Number}             modalOpacity          modal模块支持，遮罩的透明度
 * @config {Number}             modalZIndex           modal模块支持，遮罩的zIndex值
 * @config {Boolean}            draggable             draggable模块支持，是否支持拖拽
 * @config {Function}           ondragstart           draggable模块支持，当拖拽开始时触发
 * @config {Function}           ondrag                draggable模块支持，拖拽过程中触发
 * @config {Function}           ondragend             draggable模块支持，拖拽结束时触发
 * @config {Boolean}            [autoOpen]            是否一开始就打开，默认为true
 * @config {String}             loginURL              登陆地址,无须改动
 * @config {String}             regURL                注册地址,无须改动
 * @config {String}             loginJumpURL          登陆跳转地址,必须，为提交表单跨域使用，可前往 http://fe.baidu.com/~zhengxin/passport/jump.html  下载，或者线上 http://passport.baidu.com/jump.html 
 * @config {String}             regJumpURL            注册跳转地址,必须，为提交表单跨域使用，可前往 http://fe.baidu.com/~zhengxin/passport/jump.html  下载，或者线上http://passport.baidu.com/jump.html 
 * @config {String}             defaultStatus         弹出时初始状态(登录或注册),取值 ['login','reg'],默认为 login
 * @config {Function}           onLoginSuccess        登录成功回调 TODO 默认处理函数 json.un
 * @config {Function}           onLoginFailure        登录失败回调 TODO 默认处理函数, json.error
 * @config {Function}           onRegisterSuccess     注册成功回调函数
 * @config {Function}           onRegisterFailure     注册失败回调函数
 * @plugin register				应用实现tab:login
 *
 */

baidu.ui.Login = baidu.ui.createUI(function(options){ },{superClass:baidu.ui.Dialog}).extend(
/**
 * @lends baidu.ui.Login.prototype
 */
{
    		//ui控件的类型，传入给UIBase **必须**
		uiType: 'login',
    		//ui控件的class样式前缀 可选
    		classPrefix     : "tangram-dialog",
		//titleText: '登录',
		loginURL: 'http://passport.baidu.com/api/?login&time=&token=&tpl=pp',
		loginJumpURL: window.location.href,
		/**
		 * 登录成功回调 TODO 默认处理函数 json.un
		 * @private
		 */
		onLoginSuccess: function(obj, json) {},
		/**
		 * 登录失败回调 TODO 默认处理函数, json.error
		 * @private
		 */
		onLoginFailure: function(obj, json) {},
		loginContainerId: 'loginContainer',
		loginPanelId: 'loginPanel',
		tplContainer: '\
        <div id="content" class="passport-content">\
            <div id="#{idLoginPanel}" class="passport-login-panel">\
	            <div id="#{idLoginContainer}"></div>\
	            <div id="regDiv">\
                    <hr size="0" style="border-top:1px solid #AAAAAA">\
                    <div class="reg">没有百度账号？<a href="https://passport.baidu.com/?reg&tpl=mn" target="_self">立即注册百度账号</a></div>\
                </div>\
            </div>\
        </div>\
           ' ,

    getString: function() {
       var me = this,
            html,
            title = 'title',
            titleInner = 'title-inner',
            content = 'content',
            footer = 'footer';
	me.contentText = me.contentText || baidu.string.format(me.tplContainer, {
    		idLoginContainer: me.loginContainerId,
    		idLoginPanel: me.loginPanelId
    	});

	 return baidu.format(me.tplDOM, {
            id: me.getId(),
            'class' : me.getClass(),
            title: baidu.format(
                me.tplTitle, {
                    id: me.getId(title),
                    'class' : me.getClass(title),
                    'inner-id' : me.getId(titleInner),
                    'inner-class' : me.getClass(titleInner),
                    content: me.titleText || ''
                }),
            content: baidu.format(
                me.tplContent, {
                    id: me.getId(content),
                    'class' : me.getClass(content),
                    content: me.contentText || ''
                }),
            footer: baidu.format(
                me.tplFooter, {
                    id: me.getId(footer),
                    'class' : me.getClass(footer)
            })
        });

},
    
    open: function() {
    		var me = this;
    		me.renderLogin();
    		me.dispatchEvent('onopen');

    	},
   close: function() {
    		var me = this;
    		me.loginJson = me.regJson = null;
		if (me.dispatchEvent('onbeforeclose')) {
			me.getMain().style.marginLeft = '-100000px';
			baidu.ui.Login.instances[me.guid] = 'hide';
			me.dispatchEvent('onclose');
		}

    	},
   renderLogin: function() {
    		var me = this;
    		if (me.loginJson) return;
	    	baidu.sio.callByServer(me.loginURL, function(value) {
	    		var json = me.loginJson = eval(value);
		        baidu.sio.callByBrowser(json.jslink, function(value) {
		        	baidu.ui.Dialog.prototype.open.call(me);

			        me.loginDom = bdPass.LoginTemplate.render(json, me.loginContainerId, {
					   renderSafeflg: true,
					   onSuccess: me.onLoginSuccess,
					   jumpUrl: me.loginJumpURL,
					   onFailure: me.onLoginFailure
			        });
			        me.update();
		        });
	    	});
    	},
     dispose: function() {
		 var me = this;
		 //删除实例引用
		 delete baidu.ui.Login.instances[me.guid];
		 me.dispatchEvent('dispose');
		 baidu.un(window, 'resize', me.windowResizeHandler);
		 baidu.dom.remove(me.getMain());
		 baidu.lang.Class.prototype.dispose.call(me);
	 }
});
baidu.ui.Login.instances = baidu.ui.Login.instances || {};
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 */








/**
 * 应用实现tab:login&&register备注：涉及passport的API接口参数可以参见http://fe.baidu.com/doc/zhengxin/passport/openapi_help.text
 * @name baidu.ui.Login.Login$register
 * @addon baidu.ui.Login
 * @config {String}             regURL                注册地址,无须改动
 * @config {String}             regJumpURL            注册跳转地址,必须，为提交表单跨域使用，可前往 http://fe.baidu.com/~zhengxin/passport/jump.html下载，或者线上
 * @config {Function}           onRegisterSuccess     注册成功回调函数
 * @config {Function}           onRegisterFailure     注册失败回调函数
 * @config {String}             defaultStatus         弹出时初始状态(登录或注册),取值['login','reg'],默认为login
 */ 
baidu.extend(baidu.ui.Login.prototype,{

     regPanelId: 'regPanel',
     regContainerId: 'regContainer',
     //弹出时初始状态(登录或注册),取值 ['login','reg'],默认为 login
     defaultStatus: 'login',
     tabId: 'navTab',
     currentTabClass: 'act',
     registerText: "",
     register: true,
     regURL: 'http://passport.baidu.com/api/?reg&time=&token=&tpl=pp',
     regJumpURL: window.location.href,
     tplContainer : '\
		<div id="nav" class="passport-nav">\
			<ul id="#{tabId}" class="passport-nav-tab">\
				<li class="#{currentTabClass}" ><a href="##{idLoginPanel}" onclick="#{clickTabLogin};return false;" hidefocus="true" >登录</a></li>\
				<li><a href="##{idRegPanel}" onclick="#{clickTabReg};return false;" hidefocus="true" >注册</a></li>\
			</ul>\
			 <p class="clear"></p>\
		</div>\
	 	<div id="content" class="passport-content">\
			<div id="#{idLoginPanel}" class="passport-login-panel">\
				<div id="#{idLoginContainer}"></div>\
				<div id="regDiv">\
					<hr size="0" style="border-top:1px solid #AAAAAA">\
					<div class="reg">没有百度账号？<a href="##{idRegPanel}" onclick="#{clickTabReg};return false;">立即注册百度账号</a></div>\
				</div>\
			</div>\
		<div id="#{idRegPanel}" class="passport-reg-panel" style="display:none">\
			<div id="#{idRegContainer}" class="passport-reg-container"></div>\
		</div>\
		</div>'  ,

		onRegisterSuccess: function(obj,json) {}, onRegisterFailure: function(obj, json) {},
getString: function() {
       var me = this,
            html,
            title = 'title',
            titleInner = 'title-inner',
            content = 'content',
            footer = 'footer';
	me.contentText = me.contentText || baidu.string.format(me.tplContainer, {
    		clickTabLogin: me.getCallRef() + ".changeTab('login')",
    		clickTabReg: me.getCallRef() + ".changeTab('reg')",
    		idLoginContainer: me.loginContainerId,
    		idRegContainer: me.regContainerId,
    		idLoginPanel: me.loginPanelId,
    		idRegPanel: me.regPanelId,
    		tabId: me.tabId,
    		currentTabClass: me.currentTabClass
    	});

	 return baidu.format(me.tplDOM, {
            id: me.getId(),
            'class' : me.getClass(),
            title: baidu.format(
                me.tplTitle, {
                    id: me.getId(title),
                    'class' : me.getClass(title),
                    'inner-id' : me.getId(titleInner),
                    'inner-class' : me.getClass(titleInner),
                    content: me.titleText || ''
                }),
            content: baidu.format(
                me.tplContent, {
                    id: me.getId(content),
                    'class' : me.getClass(content),
                    content: me.contentText || ''
                }),
            footer: baidu.format(
                me.tplFooter, {
                    id: me.getId(footer),
                    'class' : me.getClass(footer)
            })
        });

},
  open: function() {
    		var me = this;
    		(me.defaultStatus == 'login') ?  me.renderLogin() : me.changeTab('reg');
    		 //me.renderLogin();
    		me.dispatchEvent('onopen');

    	},

     changeTab: function(type) {
        	var me = this,
		 panelIds = [me.loginPanelId, me.regPanelId],
			tabs = baidu.dom.children(me.tabId),
	         className = me.currentTabClass,
			curIndex = (type == 'login') ? 0 : 1;
		for (var i = 0; i < panelIds.length; ++i) {
			baidu.dom.removeClass(tabs[i], className); baidu.g(panelIds[i]).style.display = 'none';
		}
		baidu.dom.addClass(tabs[curIndex], className);
		baidu.g(panelIds[curIndex]).style.display = ''; 
		(type == 'reg') ?  me.renderReg() : me.renderLogin();
	},
renderReg: function() {
    		var me = this;
    		if (me.regJson) return;
	    	baidu.sio.callByServer(me.regURL, function(value) {
	    		var json = me.regJson = eval(value);
		        baidu.sio.callByBrowser(json.jslink, function(value) {
		        	baidu.ui.Dialog.prototype.open.call(me);

			        me.registerDom = bdPass.RegTemplate.render(json, me.regContainerId, {
					   renderSafeflg: true,
					   onSuccess: me.onRegisterSuccess,
					   jumpUrl: me.regJumpURL,
					   onFailure: me.onRegisterFailure
			        });
			        me.update();
		        });
	    	});
    	}

});


﻿/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */






/**
 * 为Menubar增加动画效果
 * @name baidu.ui.Menubar.Menubar$fx
 * @addon baidu.ui.Menubar
 */
baidu.ui.Menubar.extend({
    enableFx:true,
    showFx : baidu.fx.expand,
	showFxOptions : {duration:200},
	hideFx : baidu.fx.collapse,
	hideFxOptions : {duration:500,restoreAfterFinish:true}
});

baidu.ui.Menubar.register(function(me){
    
    if(me.enableFx){
       
        var fxHandle = null;

        me.addEventListener('onopen', function(){
            !baidu.ui.Menubar.showing && 'function' == typeof me.showFx && me.showFx(baidu.g(me.getId()),me.showFxOptions);
        });

        me.addEventListener('onbeforeclose',function(e){
            me.dispatchEvent("onclose");
            
            fxHandle = me.hideFx(baidu.g(me.getId()),me.hideFxOptions);
            fxHandle.addEventListener('onafterfinish',function(){
                me._close();
            });
            
            e.returnValue = false;
        });
        
        me.addEventListener('ondispose', function(){
            fxHandle && fxHandle.end(); 
        });
    }
});
/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 *
 * path: ui/Menubar/Menubar$hover.js
 * author: walter
 * version: 1.0.0
 * date: 2010-12-09
 */







/**
 * 鼠标hover触发menubar插件
 * @name baidu.ui.Menubar.Menubar$hover
 * @addon baidu.ui.Menubar
 */
baidu.ui.Menubar.extend({
   
    /**
     * 插件触发方式，默认为点击
	 * @private
     * @param {String} [options.type = 'hover']
     */
    type: 'hover',

    /**
     * 菜单显示延迟时间
	 * @private
     * @param {Number} [options.showDelay = 100]
     */
    showDelay: 100,
    
    /**
     * 菜单关闭延迟时间
	 * @private
     * @param {Number} [options.hideDelay = 500]
     */
    hideDelay: 500,
    
    /**
     * 鼠标浮动到target上显示菜单
	 * @private
     */
    targetHover: function(){
        var me = this;
        clearTimeout(me.hideHandler);
        me.showHandler = setTimeout(function(){
            me.open();
        }, me.showDelay);
    },
    
    /**
     * 鼠标移出target关闭菜单
	 * @private
     */
    targetMouseOut: function(){
        var me = this;
        clearTimeout(me.showHandler);
        clearTimeout(me.hideHandler);
        me.hideHandler = setTimeout(function(){
            me.close();
        }, me.hideDelay);
    },
	
   /**
     * 清除hideHandler
	 * @private
     */
    clearHideHandler:function(){
        clearTimeout(this.hideHandler);
    }
	
});

baidu.ui.Menubar.register(function(me){
    me.targetHoverHandler = baidu.fn.bind('targetHover', me);
    me.targetMouseOutHandler = baidu.fn.bind('targetMouseOut', me);
    me.clearHandler = baidu.fn.bind('clearHideHandler', me)

    if (me.type == 'hover') {
        me.addEventListener('onload', function(){
            var target = me.getTarget();
            if (target) {
                baidu.on(target, 'mouseover', me.targetHoverHandler);
                baidu.on(document, 'click', me.targetMouseOutHandler);
            }
        });
        
        me.addEventListener('onopen', function(){
            var target = me.getTarget(), 
                body = me.getBody();
            if (target) {
                baidu.on(body, 'mouseover', me.clearHandler);
                baidu.on(target, 'mouseout', me.targetMouseOutHandler);
                baidu.on(body, 'mouseout', me.targetMouseOutHandler);
            }
        });
        
        me.addEventListener('ondispose', function(){
            var target = me.getTarget(), 
                body = me.getBody();
            if (target) {
                baidu.un(target, 'mouseover', me.targetHoverHandler);
                baidu.un(target, 'mouseout', me.targetMouseOutHandler);
				baidu.un(document, 'click', me.targetMouseOutHandler);
            }
            if (body) {
                baidu.un(body, 'mouseover', me.clearHandler);
                baidu.un(body, 'mouseout', me.targetMouseOutHandler);
            }
        });
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */







/**
 * 支持菜单图标
 * @name baidu.ui.Menubar.Menubar$icon
 * @addon baidu.ui.Menubar
 */
baidu.ui.Menubar.extend({
    tplIcon : '<span class="#{icon}" style="#{iconStyle};"></span>',
    
    /**
     * 更新item图标
	 * @name baidu.ui.Menubar.Menubar$icon.updateIcons
	 * @addon baidu.ui.Menubar.Menubar$icon
	 * @function
     */
    updateIcons : function(){
        var me = this;
        baidu.object.each(me.items, function(item, key){
            if (me.getItem(key)) {
                baidu.dom.insertHTML(me.getItem(key), "afterBegin", baidu.string.format(me.tplIcon, {
                    icon: me.getClass("icon"),
                    iconStyle: item.icon ? ('background-position:' + item.icon) : 'background-image:none'
                }))
            }
        });
    }
});

baidu.ui.Menubar.register(function(me){
    me.addEventListener('onupdate', me.updateIcons);
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: ui/Pager.js
 * author: wenyuxiang
 * version: 1.0.6
 * date: 2010/08/02
 */










 /**
 * 生成分页功能，默认会有一个横向的页面跳转链接列表，其两端有首页，尾页，上一页，下一页。若要自定义样式（如隐藏某些部件），请使用css（注：控件中各部件的css类名都有控件的tangram类名前缀）首页：first，尾页：last，上一页：previous，下一页：next，当前页：current。若要自定义控件生成的HTML，请参考源代码中以tpl开头的模板属性，类中的属性和方法都可以通过options动态覆盖。
 * @class
 * @grammar new baidu.ui.Pager(option)
 * @param     {Object}            [options]         更新选项，若选项值不符合规则，则此次更新不予更新任何选项
 * @config    {Number}            beginPage         页码范围：起始页码，默认值1。
 * @config    {Number}            endPage           页码范围：最后页码，大于或者等于起始页码，默认值100。
 * @config    {Number}            currentPage       必须在页码范围内，若未指定currentPage且当前页码已超出页码范围，则会自动将currentPage更新到beginPage。
 * @config    {Number}            itemCount         默认显示多少个页面的链接（不包括“首页”等特殊链接），默认值10。
 * @config    {Number}            leftItemCount     当前页面链接在页面链接列表中的默认位置，必须小于itemCount，默认值4。
 * @config    {Object}            specialLabelMap   设置首页，上一页，下一页链接显示的内容。默认为{first:'首页',next:'下一页',previous:'上一页'}
 * @config    {String}            tplHref           链接显示样式，默认为"##{page}"
 * @config    {String}            tplLabel          页码显示样式，默认为"[#{page}]"
 * @config    {String}            tplCurrentLabel   选中页码的显示样式
 */
baidu.ui.Pager = baidu.ui.createUI(function (options){
    this._init.apply(this, arguments);
}).extend(
    /**
     *  @lends baidu.ui.Pager.prototype
     */
{
    uiType: 'pager',
    id: 'pager',
    tplHref: '##{page}',
    tplLabel: '[#{page}]',
    specialLabelMap: {
        'first': '首页',
        'last': '尾页',
        'previous': '上一页',
        'next': '下一页'
    },
    tplCurrentLabel: '#{page}',
    tplItem: '<a class="#{class}" page="#{page}" target="_self" href="#{href}">#{label}</a>',
    //FIXME: 用#{onclick}形式绑定事件
    //#{onclick} {onclick: me.getCallRef() + ""}
    tplBody: '<div onclick="#{onclick}" id="#{id}" class="#{class}">#{items}</div>',
    beginPage: 1,
    endPage: 100,
    //当前页面
    //currentPage: undefined,
    itemCount: 10,
    leftItemCount: 4,
    /**
     * 初始化函数
     * @param options
     * @see baidu.ui.pager.Pager#update
     */
    _init: function (options){
        var me = this;
        me.update();
    },
    // 特殊链接请使用css控制隐藏和样式
    /**
     * 更新设置
	 * @public 
     * @param      {Object}     options          更新设置
     * @config     {Number}     beginPage        开始页
     * @config     {Number}     endPage          结束页
     * @config     {Number}     currentPage      跳转目标页的索引
     * @config     {Number}     itemCount        默认列出多少个a标签
     * @config     {Function}   leftItemCount    当前页的显示位置, 有默认实现
     */
    update: function (options){
        var me = this;
        options = options || {};
        if (me.checkOptions(options)) {
            //如果用户修改currentPage，则触发gotoPage事件. 如果事件处理函数取消了跳转，则不更新currentPage;
            if (options.hasOwnProperty('currentPage') && options.currentPage != me.currentPage) {
                if (!me._notifyGotoPage(options.currentPage, false)) {
                    delete options.currentPage;
                }
            }
            me._updateNoCheck(options);
            return true;
        }
        return false;
    },
    _updateNoCheck: function (options){
        var me = this;
        baidu.object.extend(me, options);
        if (me.getMain()) {
            me._refresh();
        }
    },
    /**
     * 检查参数是否出错
     * @private
     * @param {Object} options
     */
    checkOptions: function (options){
        var me = this;
        var begin = options.beginPage || me.beginPage;
        var end = options.endPage || me.endPage;
        // TODO: trace信息
        if (end <= begin) {
            return false;
        }
        // TODO: 不应该放在这里
        if (options.hasOwnProperty('beginPage') && me.currentPage < begin) {
            me.currentPage = begin;
        }
        if (options.hasOwnProperty('endPage') && me.currentPage >= end) {
            me.currentPage = end - 1;
        }

        var current = options.currentPage || me.currentPage;
        if (current < begin || current >= end){
            return false;
        }
        return true;
    },
    /**
     * 构造链接的HTML
     * @private
     * @param page {Number}
     * @param [spec] {String} first|last...
     * @private
     */
    _genItem: function (page, spec){
        var me = this;
        return baidu.string.format(me.tplItem, {
            "class": spec ? me.getClass(spec) : '',
            page: page,
            href: baidu.string.format(me.tplHref, {
                page: page
            }),
            label: function (){
                return ( spec
                  ? (spec == "current"
                       ? baidu.string.format(me.tplCurrentLabel, { page: page })
                       : me.specialLabelMap[spec]
                     )
                  : baidu.string.format(me.tplLabel, { page: page }) );
            }
        });
    },
    /**
     * @private
     */
    _genBody: function (){
        var me = this,
            begin = me.beginPage,
            end = me.endPage,
            current = me.currentPage,
            numlist = Math.min( Math.max(end - begin + 1, 1), me.itemCount),  // 处理范围小于显示数量的情况
            leftcnt = Math.min(current - begin, me.leftItemCount), // 处理当前页面在范围的两端的情况
            leftcnt = Math.max(numlist - (end + 1 - current), leftcnt),
            startPage = current - leftcnt,
            pageMap = {
                first: begin,
                last: end,
                previous: current - 1,
                next: current + 1
            }, // 生成特殊链接
            spec = {};

        baidu.object.each(pageMap, function (s, k){
            spec[k] = me._genItem(s, k);
        });

        spec.previous = pageMap.previous < begin ? '' : spec.previous;
        spec.next = pageMap.next > end ? '' : spec.next;
        spec.first = startPage == begin ? '' : spec.first;
        spec.last = startPage + numlist > end ? '' : spec.last;
        // 生成常规链接
        var buff = [];
        for (var i=0; i<numlist; i++) {
            var page = startPage + i;
            buff[i] = me._genItem(page, page == current ? "current" : null);
        }
        return baidu.string.format(me.tplBody, {
            id: me.getId(),
            "class": me.getClass(),
            items: spec.first + spec.previous + buff.join('') + spec.next + spec.last,
            onclick: me.getCallRef() + "._handleOnClick(event, this);"
        });
    },
    /**
     * 刷新界面
     * @private
     */
    _refresh: function (){
        var me = this;
        me.getMain().innerHTML = me.getString();
    },
    /**
     * 鼠标点击链接事件
     * @private
     * @param evt
     */
    _handleOnClick: function (evt){
        evt = baidu.event.get(evt);
        var me = this,
            el = evt.target,
            page = Number(el.getAttribute('page'));
        // IE6 doesnot support Element#hasAttribute.
        // 无需checkOptions检查，因为能点到页码的都是正常值
        if (page && me._notifyGotoPage(page, true)) {
            me._updateNoCheck({ currentPage: page });
        } else {
            evt.preventDefault();
        }
    },
    _notifyGotoPage: function (page, fromClick){
        return this.dispatchEvent('ongotopage', { page: page, fromClick: fromClick });
    },
    /**
     * 跳转页面事件  参数evt.page 可以使用evt.returnValue = false来取消跳转
     * @private
     * @param evt {Object} 将要跳转到的页面的索引
     * @event
     */
    ongotopage: function (evt){
        //evt.returnValue = false;
    },
    /**
     * 获取用于生成控件的HTML
     * @private
     */
    getString: function (){
        var me = this;
        if (me.currentPage === undefined) {
            me.currentPage = me.beginPage;
        }
        return me._genBody();
    },
    /**
     * 将控件渲染到目标元素
     * @public
     * @param    {String|HTMLElement}    container     目标元素或元素id
     */
    render: function (container){
        var me = this;
        me.renderMain(container);
        me.getMain().innerHTML = me.getString();
        me.update();
        me.dispatchEvent('onload');
    },
    /**
     * 销毁控件
	 * @public
     */
    dispose: function (){
        var me = this;
        me.dispatchEvent('ondispose');
        if (me.getMain()) {
            var main = me.getMain();
            baidu.event.un(main, 'click', me._handleOnClick);
            if (main.parentNode && main.parentNode.nodeType == 1) {
                main.parentNode.removeChild(main);
            }
            me.dispose = null;
            main = null;
            baidu.lang.Class.prototype.dispose.call(me);
        } else {
            me.addEventListener('onload', function callee(){
                me.removeEventListener('onload', callee);
                me.dispose();
            });
        }
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: ui/ProgressBar.js
 * author: berg
 * version: 1.0.0
 * date: 2010/09/03
 */











/**
 *
 * 进度条控件
 * @class
 * @param {Object} options 参数
 * @config {String} layout 取值horizontal横向或是vertical竖向
 * @config {Number} value 初始值，默认是0
 */
baidu.ui.ProgressBar = baidu.ui.createUI(function(options) {
}).extend(
/**
 * @lends baidu.ui.ProgressBar.prototype
 */
{
    uiType: 'progressBar',
    tplBody: '<div id="#{id}" class="#{class}">#{bar}</div>',
    tplBar: '<div id="#{barId}" class="#{barClass}"></div>',

    //初始化时，进度条所在的值
    value: 0,

    layout: 'horizontal',

    _min: 0,
    _max: 100,
     //位置变换
    axis: {
        horizontal: {offsetSize: 'offsetWidth', size: 'width'},
        vertical: {offsetSize: 'offsetHeight', size: 'height'}
    },
    /**
     * 获得控件字符串
     * @return {string} HTML string.
     */
    getString: function() {
        var me = this;
        return baidu.format(me.tplBody, {
            id: me.getId(),
            'class' : me.getClass(),
            bar: baidu.format(me.tplBar, {
                barId: me.getId('bar'),
                barClass: me.getClass('bar')
            })
        });
    },

    /**
     * 渲染进度条
     * @param {HTMLElement} target
     */
    render: function(target) {
        var me = this,
            main;

        if (!target) {
            return;
        }

        baidu.dom.insertHTML(
            me.renderMain(target),
            'beforeEnd',
            me.getString()
        );
        me.dispatchEvent('onload');

        me.update();
    },


    /**
     * 更新progressBar状态
     * @param {object} options 参数.
     */
    update: function(options) {
        var me = this;

        options = options || {};
        baidu.object.extend(me, options);

        me.value = Math.max(Math.min(me.value, me._max), me._min);
        if (me.value == me._lastValue) {
            return;
        }
        var len = me.axis[me.layout].size;
        baidu.dom.setStyle(me.getBar(), len, me._calcPos(me.value));
        me._lastValue = me.value;

        me.dispatchEvent('update');
    },

    /**
     * 获得当前的value
     * @return {number} value.
     */
    getValue: function() {
        var me = this;
        return me.value;
    },

    /**
     * 将value转换为位置信息
     * @private
     */
    _calcPos: function(value) {
        var me = this;
        var len = me.getBody()[me.axis[me.layout].offsetSize];
        return value * (len) / (me._max - me._min);
    },

    /**
     * 禁用进度条
     */
    disable: function() {
        this.disabled = true;
    },

    /**
     * 启用进度条
     */
    enable: function() {
        this.disabled = false;
    },

    /**
     * 获取target元素
     * @return {HTMLElement} target.
     */
    getTarget: function() {
        return baidu.g(this.targetId);
    },

    /**
     * 获取进度条元素
     * @return {HTMLElement} bar.
     */
    getBar: function() {
        return baidu.g(this.getId('bar'));
    },

    /**
     * 销毁当前实例
     */
    dispose: function() {
        var me = this;
        baidu.dom.remove(me.getId());
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */









/**
 * 创建一个简单的滚动条
 * @class ScrollBar基类
 * @grammar new baidu.ui.ScrollBar(options)
 * @param   {Object}    options config参数.
 * @config  {String}    orientation 设置横向或是竖向滚动条，默认值：vertical,可取值：horizontal.
 * @config  {Number}    value       滚动条滚动的百分比值，定义域(0, 100)
 * @config  {Number}    dimension   滚动条滑块占全部内容的百分比，定义域(0, 100)
 * @config  {Number}    step        用户自定义当点击滚动按钮时每次滚动百分比距离，定义域(0, 100)
 * @config  {Function}  onscroll    当滚动时触发该事件，function(evt){}，evt.value可以取得滚动的百分比
 * @plugin  container	支持绑定一个容器
 * @author linlingyu
 */
baidu.ui.ScrollBar = baidu.ui.createUI(function(options) {
    var me = this;
        me._scrollBarSize = {width: 0, height: 0};//用来存入scrollbar的宽度和高度
}).extend(
/**
 *  @lends baidu.ui.ScrollBar.prototype
 */
{
    uiType: 'scrollbar',
    tplDOM: '<div id="#{id}" class="#{class}"></div>',
    tplThumb: '<div class="#{prev}"></div><div class="#{track}"></div><div class="#{next}"></div>',
    value: 0,//描述滑块初始值停留的百分比，定义域(0, 100)
    dimension: 10,//描述滑块占整个可滚动区域的百分比，定义域(0, 100)
    orientation: 'vertical',//横竖向的排列方式，取值 horizontal,vertical
    step: 5,//单步移动5%
    _axis: {
        horizontal: {
            size: 'width',
            unSize: 'height',
            offsetSize: 'offsetWidth',
            unOffsetSize: 'offsetHeight',
            clientSize: 'clientWidth',
            scrollPos: 'scrollLeft',
            scrollSize: 'scrollWidth'
        },
        vertical: {
            size: 'height',
            unSize: 'width',
            offsetSize: 'offsetHeight',
            unOffsetSize: 'offsetWidth',
            clientSize: 'clientHeight',
            scrollPos: 'scrollTop',
            scrollSize: 'scrollHeight'
        }
    },

    /**
     * 生成滑块的内容字符串
     * @return {String}
     * @private
     */
    getThumbString: function() {
        var me = this;
        return baidu.string.format(me.tplThumb, {
            prev: me.getClass('thumb-prev'),
            track: me.getClass('thumb-track'),
            next: me.getClass('thumb-next')
        });
    },

    /**
     * 将scrollBar的body渲染到用户给出的target
     * @param {String|HTMLElement} target 一个dom的id字符串或是dom对象.
     */
    render: function(target) {
        var me = this;
        if (!target || me.getMain()) {return;}
        baidu.dom.insertHTML(me.renderMain(target), 'beforeEnd',
            baidu.string.format(me.tplDOM, {
            id: me.getId(),
            'class': me.getClass()
        }));
        me._renderUI();
        me.dispatchEvent('load');
    },

    /**
     * 将Button和Slider渲染到body中
     * @private
     */
    _renderUI: function() {
        var me = this,
            axis = me._axis[me.orientation],
            body = me.getBody(),
            prev,
            slider,
            next;
        function options(type) {
            return{
                classPrefix: me.classPrefix + '-' +type,
                skin: me.skin ? me.skin + '-' + type : '',
                poll: {time: 4},
                onmousedown: function() {me._basicScroll(type);},
                element: body,
                autoRender: true
            };
        }
        prev = me._prev = new baidu.ui.Button(options('prev'));
        baidu.dom.insertHTML(body, 'beforeEnd', baidu.string.format(me.tplDOM, {
            id: me.getId('track'),
            'class': me.getClass('track')
        }));
        next = me._next = new baidu.ui.Button(options('next'));
        function handler(evt) {
            me.dispatchEvent('scroll', {value: Math.round(evt.target.getValue())});
        }
        slider = me._slider = new baidu.ui.Slider({
            classPrefix: me.classPrefix + '-slider',
            skin: me.skin ? me.skin + '-slider' : '',
            layout: me.orientation,
            onslide: handler,
            onslideclick: handler,
            element: baidu.dom.g(me.getId('track')),
            autoRender: true
        });
        me._scrollBarSize[axis.unSize] = next.getBody()[axis.unOffsetSize];//这里先运算出宽度，在flushUI中运算高度
        me._thumbButton = new baidu.ui.Button({
            classPrefix: me.classPrefix + '-thumb-btn',
            skin: me.skin ? me.skin + '-thumb-btn' : '',
            content: me.getThumbString(),
            capture: true,
            element: slider.getThumb(),
            autoRender: true
        });
        me.flushUI(me.value, me.dimension);
        //注册滚轮事件
        me._registMouseWheelEvt(me.getMain());
    },

    /**
     * 更新组件的外观，通过传入的value来使滚动滑块滚动到指定的百分比位置，通过dimension来更新滑块所占整个内容的百分比宽度
     * @param {Number} value 滑块滑动的百分比，定义域(0, 100).
     * @param {Number} dimension 滑块的宽点占内容的百分比，定义域(0, 100).
     */
    flushUI: function(value, dimension) {
        var me = this,
            axis = me._axis[me.orientation],
            btnSize = me._prev.getBody()[axis.offsetSize] + me._next.getBody()[axis.offsetSize],
            body = me.getBody(),
            slider = me._slider,
            thumb = slider.getThumb(),
            val;
        //当外观改变大小时
        baidu.dom.hide(body);
        val = me.getMain()[axis.clientSize];
        me._scrollBarSize[axis.size] = (val <= 0) ? btnSize : val;
        slider.getMain().style[axis.size] = (val <= 0 ? 0 : val - btnSize) + 'px';//容错处理
        thumb.style[axis.size] = Math.max(Math.min(dimension, 100), 0) + '%';
        baidu.dom.show(body);
        me._scrollTo(value);//slider-update
    },

    /**
     * 滚动内容到参数指定的百分比位置
     * @param {Number} val 一个百分比值.
     * @private
     */
    _scrollTo: function(val) {
        //slider有容错处理
        this._slider.update({value: val});
    },

    /**
     * 滚动内容到参数指定的百分比位置
     * @param {Number} val 一个百分比值.
     */
    scrollTo: function(val) {
        var me = this;
        me._scrollTo(val);
        me.dispatchEvent('scroll', {value: val});
    },

    /**
     * 根据参数实现prev和next按钮的基础滚动
     * @param {String} pos 取值prev|next.
     * @private
     */
    _basicScroll: function(pos) {
        var me = this;
        me.scrollTo(Math.round(me._slider.getValue()) + (pos == 'prev' ? -me.step : me.step));
    },

    /**
     * 滑轮事件侦听器
     * @param {Event} evt 滑轮的事件对象.
     * @private
     */
    _onMouseWheelHandler: function(evt) {
        var me = this,
            target = me.target,
            evt = evt || window.event,
            detail = evt.detail || -evt.wheelDelta;
        baidu.event.preventDefault(evt);
        me._basicScroll(detail > 0 ? 'next' : 'prev');
    },

    /**
     * 注册一个滚轮事件
     * @param {HTMLElement} target 需要注册的目标dom.
     * @private
     */
    _registMouseWheelEvt: function(target) {
//        if(this.orientation != 'vertical'){return;}
        var me = this,
            getEvtName = function() {
                var ua = navigator.userAgent.toLowerCase(),
                    //代码出处jQuery
                    matcher = /(webkit)/.exec(ua)
                        || /(opera)/.exec(ua)
                        || /(msie)/.exec(ua)
                        || ua.indexOf('compatible') < 0
                        && /(mozilla)/.exec(ua)
                        || [];
                return matcher[1] == 'mozilla' ? 'DOMMouseScroll' : 'mousewheel';
            },
            entry = me._mouseWheelEvent = {
                target: target,
                evtName: getEvtName(),
                handler: baidu.fn.bind('_onMouseWheelHandler', me)
            };
        baidu.event.on(entry.target, entry.evtName, entry.handler);
    },
    
    /**
     * 对已经注册了滚轮事件的容器进行解除.
     * @private
     */
    _cancelMouseWheelEvt: function(){
        var entry = this._mouseWheelEvent;
        if(!entry){return;}
        baidu.event.un(entry.target, entry.evtName, entry.handler);
        this._mouseWheelEvent = null;
    },

    /**
     * 设置滚动条的隐藏或显示
     * @param {Boolean} val 布尔值 true:显示, false:隐藏.
     */
    setVisible: function(val) {
        this.getMain().style.display = val ? '' : 'none';
    },

    /**
     * 取得当前是隐藏或是显示状态
     * @return {Boolean} true:显示, false:隐藏.
     */
    isVisible: function() {
        return this.getMain().style.display != 'none';
    },

    /**
     * 取得滚动条的宽度和高度
     * @return {Object} 一个json，有width和height属性.
     */
    getSize: function() {
        return this._scrollBarSize;
    },

    /**
     * 更新滚动条的外观
     * @param {Object} options 参考构造函数参数.
     */
    update: function(options) {
        var me = this;
        me.dispatchEvent('beforeupdate');//该事件是用于和插件container结合使用，不对外开放
        baidu.object.extend(me, options);
        me.flushUI(me.value, me.dimension);
        me.dispatchEvent('update');
    },

    /**
     * 销毁对象
     */
    dispose: function() {
        var me = this;
        me.dispatchEvent('dispose');
        me._cancelMouseWheelEvt();
        me._prev.dispose();
        me._thumbButton.dispose();
        me._slider.dispose();
        me._next.dispose();
        baidu.dom.remove(me.getMain());
        baidu.lang.Class.prototype.dispose.call(me);
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 让滚动条绑定一个容器
 * @name baidu.ui.ScrollBar.ScrollBar$container
 * @addon baidu.ui.ScrollBar
 * @param   {Object}                options    config参数.
 * @config  {String|HTMLElement}    container  一个容器的dom或是id的字符串
 * @author linlingyu
 */
baidu.ui.ScrollBar.register(function(me) {
    if (!me.container) {return;}
    me.addEventListeners({
        load: function() {
            me.update();
            if (me.orientation == 'vertical') {
                me._registMouseWheelEvt(me.getContainer());
            }
        },
        beforeupdate: function() {
            var me = this,
                axis = me._axis[me.orientation],
                container = me.getContainer();
            if (!container) {return;}

            me.dimension = Math.round(container[axis.clientSize]
                    / container[axis.scrollSize] * 100);
            me.value = container[axis.scrollSize] - container[axis.clientSize];
            me.value > 0 && (me.value = Math.round(container[axis.scrollPos]
                / (container[axis.scrollSize]
                - container[axis.clientSize]) * 100));
        },
        scroll: function(evt) {
            var container = me.getContainer(),
                axis = me._axis[me.orientation];
            container[axis.scrollPos] = evt.value / 100
                * (container[axis.scrollSize] - container[axis.clientSize]);
        }
    });
});
baidu.object.extend(baidu.ui.ScrollBar.prototype, {
    /**
     * 取得用户传入的需要被滚动条管理的对象
	 * @name baidu.ui.ScrollBar.ScrollBar$container.getContainer
	 * @addon baidu.ui.ScrollBar.ScrollBar$container
	 * @function
     * @return {HTMLElement}
     */
    getContainer: function() {
        return baidu.dom.g(this.container);
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */








/**
 * 创建一个panel来作为滚动条的容器
 * @class ScrollPanel基类
 * @grammar new baidu.ui.ScrollPanel(options)
 * @param   {Object}                options config参数.
 * @config  {String}                overflow 取值'overflow-y':创建竖向滚动, 'overflow-x':创建横向滚动条, 'auto':创建滚动条(默认)
 * @config  {String|HTMLElement}    container 需要被滚动条管理的容器对象
 * @author linlingyu
 */
baidu.ui.ScrollPanel = baidu.ui.createUI(function(options) {

}).extend(
/**
 *  @lends baidu.ui.ScrollPanel.prototype
 */
{
    uiType: 'scrollpanel',
    tplDOM: '<div id="#{id}" class="#{class}">#{body}</div>',
    overflow: 'auto',
    _scrollBarSize: 0,//滚动条尺寸
    _yVisible: false,//用来标示竖向滚动条的隐藏显示状态
    _xVisible: false,//用来标示横向滚动条的隐藏显示状态
    _axis: {
        y: {
            size: 'height',
            unSize: 'width',
            unScrollSize: 'scrollWidth',
            unClientSize: 'clientWidth',
            offsetSize: 'offsetHeight',
            unOffsetSize: 'offsetWidth'
        },
        x: {
            size: 'width',
            unSize: 'height',
            unScrollSize: 'scrollHeight',
            unClientSize: 'clientHeight',
            offsetSize: 'offsetWidth',
            unOffsetSize: 'offsetHeight'
        }
    },

    /**
     * 取得panel所需要body字符串
     * @private
     */
    getString: function() {
        var me = this,
            str = baidu.string.format(me.tplDOM, {
                id: me.getId('panel'),
                'class': me.getClass('panel')
            });
        str = baidu.string.format(me.tplDOM, {
            id: me.getId(),
            'class': me.getClass(),
            body: str
        });
        return baidu.string.format(me.tplDOM, {
            id: me.getId('main'),
            'class': me.getClass('main'),
            body: str
        });
    },

    /**
     * 渲染ScrollPanel到页面中
     * @param {String|HTMLElement} target ScrollPanel依附于target来渲染.
     */
    render: function(target) {
        var me = this;
        me.target = target;
        if (!target || me.getMain()) {return;}
        baidu.dom.insertHTML(me.getTarget(), 'afterEnd', me.getString());
        me.renderMain(me.getId('main'));
        me._renderUI();
        me.dispatchEvent('onload');
    },

    /**
     * 根据参数渲染ScrollBar到容器中
     * @private
     */
    _renderUI: function() {
        var me = this,
            main = me.getMain(),
            panel = me.getPanel(),
            target = me.getTarget(),
            skin = me.skin || '';
        main.style.width = target.offsetWidth + 'px';
        main.style.height = target.offsetHeight + 'px';
        panel.appendChild(target);
        function getScrollbar(pos) {
            var track = me.getId('overflow-' + pos),
                axis = me._axis[pos],
                panel = me.getPanel(),
                bar;
            baidu.dom.insertHTML(panel,
                (pos == 'y' ? 'afterEnd' : 'beforeEnd'),
                baidu.string.format(me.tplDOM, {
                    id: track,
                    'class': me.getClass('overflow-' + pos)
                }));
            track = baidu.dom.g(track);
            if ('y' == pos) {

                baidu.dom.setStyle(panel, 'float', 'left');
                baidu.dom.setStyle(track, 'float', 'left');
            }
            //
            me['_' + pos + 'Visible'] = true;
            bar = me['_' + pos + 'Scrollbar'] = new baidu.ui.ScrollBar({
                skin: skin + 'scrollbar' + '-' + pos,
                orientation: pos == 'y' ? 'vertical' : 'horizontal',
                container: me.container,
                element: track,
                autoRender: true
            });
            track.style[axis.unSize] = bar.getSize()[axis.unSize] + 'px';
            me._scrollBarSize = bar.getSize()[axis.unSize];
            bar.setVisible(false);
        }
        if (me.overflow == 'overflow-y'
            || me.overflow == 'auto') {
            getScrollbar('y');
        }
        if (me.overflow == 'overflow-x'
            || me.overflow == 'auto') {
            getScrollbar('x');
        }
        me._smartVisible();
    },

    /**
     * 根据内容智能运算容器是需要显示滚动条还是隐藏滚动条
     * @private
     */
    _smartVisible: function() {
        var me = this,
            size = {yshow: false, xshow: false};
        if (!me.getContainer()) {return}
        function getSize(orie) {//取得邦定容器的最小尺寸和内容尺寸
            var axis = me._axis[orie],
                bar = me['_' + orie + 'Scrollbar'],
                container = me.getContainer(),
                size = {};
            if (!bar || !bar.isVisible()) {
                container.style[axis.unSize] = container[axis.unClientSize]
                    - me._scrollBarSize + 'px';
            }
            size[axis.unSize] = container[axis.unClientSize];
            size['scroll' + axis.unSize] = container[axis.unScrollSize];
            return size;
        }
        function setContainerSize(orie, size) {//根据是否显示滚动条设置邦定容器的尺寸
            var axis = me._axis[orie],
                container = me.getContainer();
            if (!me['_' + orie + 'Visible']
                || !size[orie + 'show']
                || !me['_' + orie + 'Scrollbar']) {
                container.style[axis.unSize] = container[axis.unClientSize]
                    + me._scrollBarSize + 'px';
            }
        }
        function setScrollBarVisible(orie, size) {//设置滚动条的显示或隐藏
            var axis = me._axis[orie],
                container = me.getContainer(),
                scrollbar = me['_' + orie + 'Scrollbar'],
                isShow = size[orie + 'show'];
            if (scrollbar) {
                scrollbar.getMain().style[axis.size] = container[axis.offsetSize] + 'px';
                scrollbar.setVisible(me['_' + orie + 'Visible'] ? isShow : false);
                scrollbar.update();
            }
        }
        baidu.object.extend(size, getSize('y'));
        baidu.object.extend(size, getSize('x'));
        if (size.scrollwidth <= size.width + me._scrollBarSize
            && size.scrollheight <= size.height + me._scrollBarSize) {//两个都不显示
            size.yshow = size.xshow = false;
        }else if (size.scrollwidth <= size.width
            && size.scrollheight > size.height + me._scrollBarSize) {//只显示竖
            size.yshow = true;
            size.xshow = false;
        }else if (size.scrollwidth > size.width + me._scrollBarSize
            && size.scrollheight <= size.height) {//只显示横
            size.yshow = false;
            size.xshow = true;
        }else {//两个都显示
            size.yshow = size.xshow = true;
        }
        setContainerSize('y', size);
        setContainerSize('x', size);
        setScrollBarVisible('y', size);
        setScrollBarVisible('x', size);
    },

    /**
     * 设置滚动条的隐藏或是显示状态
     * @param {Boolean} val 必选，true:显示, false:隐藏.
     * @param {String} pos 可选，当有两个滚动条时可以指定只隐藏其中之一，取值'x'或'y'，不传该参数隐藏或显示全部.
     */
    setVisible: function(val, pos) {
        var me = this;
        if (pos) {
            me['_' + pos + 'Visible'] = val;
        }else {
            me._yVisible = me._xVisible = val;
        }
        me._smartVisible();
    },

    /**
     * 取得滚动条的隐藏或显示状态
     * @param {String} pos 取值'x'或是'y'来选择要取得哪个滚动条的隐藏或是显示状态.
     * @return {Boolean} 返回布尔值来标示当前的隐藏或是显示状态.
     */
    isVisible: function(pos) {
        var me = this;
        return me['_' + pos + 'Visible'];
    },

    /**
     * 取得滚动条对象
     * @param {String} pos 取值'x'或是'y'来标示需取得哪个滚动条，当不传该参数则返回所有滚动条.
     * @return {ScrollBar|Array} 返回滚动条对象或数组.
     */
    getScrollBar: function(pos) {
        var me = this,
            instance = pos ? me['_' + pos + 'Scrollbar'] : null;
        if(!instance){
            instance = (me._yScrollbar && me._xScrollbar) ? [me._yScrollbar, me._xScrollbar]
                : (me._yScrollbar || me._xScrollbar);
        }
        return instance;
    },

    /**
     * 更新所有滚动条的外观
     * @param {Object} options 参数请参考构造函数参数.
     */
    update: function(options) {
        var me = this;
        baidu.object.extend(me, options);
        me._smartVisible();
    },

    /**
     * 取得panel的dom节点
     * @return {HTMLElement}
     */
    getPanel: function() {
        return baidu.dom.g(this.getId('panel'));
    },

    /**
     * 取得用户传入的目标对象
     * @return {HTMLElement}
     */
    getTarget: function() {
        return baidu.dom.g(this.target);
    },

    /**
     * 取得用户传入的container对象
     * @return {HTMLElement}
     */
    getContainer: function() {
        return baidu.dom.g(this.container);
    },

    /**
     * 销毁对象
     */
    dispose: function() {
        var me = this,
            ybar = me._yScrollbar,
            xbar = me._xScrollbar;
        me.dispatchEvent('dispose');
        me.setVisible(false);
        me.getMain().parentNode.insertBefore(me.getTarget(), me.getMain());
        if (ybar) {ybar.dispose();}
        if (xbar) {xbar.dispose();}
        baidu.dom.remove(me.getMain());
        baidu.lang.Class.prototype.dispose.call(me);
    }
});
/*
 * Tangram
 * Copyright 2011 Baidu Inc. All rights reserved.
 */





/**
 * 为滚动面板增加自动适应功能
 * @name baidu.ui.ScrollPanel.ScrollPanel$poll
 * @addon baidu.ui.ScrollPanel
 * @param {Object} options config参数.
 * @config {Boolean} adaptive 是否支持当滚动容器大小发生变化时自适应滚动面板，默认支持
 * @author linlingyu
 */
baidu.ui.ScrollPanel.register(function(me){
    if(!me.adaptive){return;}
    me.addEventListener('onload', function(){
        var interval = 20,
            container = me.getContainer(),
            offset = {
                w: container.clientWidth,
                h: container.clientHeight
            },
            timer = setInterval(function(){
                var container = me.getContainer(),
                    prevVal = offset, newVal;
                if(prevVal.w == container.clientWidth
                    && prevVal.h == container.clientHeight){return;}
                newVal = offset = {
                    w: container.clientWidth,
                    h: container.clientHeight
                };
                function isInnerChange(orie){//测试是否是scrollPanel内部对container进行了边界设置
                    var bar = me['_' + orie + 'Scrollbar'],
                        axis = me._axis[orie],
                        visible = bar ? bar.isVisible() : false,
                        val = me.getMain()[axis.unClientSize] - me.getContainer()[axis.unOffsetSize];
                    return (visible && val == me._scrollBarSize) || (!visible && val == 0);
                }
                if(isInnerChange('y') && isInnerChange('x')){return;}
                me.flushBounds();
            }, interval);
            me.addEventListener('dispose', function(){
                clearInterval(timer);
            });
    });
});
baidu.ui.ScrollPanel.extend({
    adaptive: true,
    
    /**
     * 根据滚动容器的大小来重新刷新滚动条面板的外观
     * @name baidu.ui.ScrollPanel.ScrollPanel$adaptive.flushBounds
     * @addon baidu.ui.ScrollPanel.ScrollPanel$adaptive
     * @function
     * @param {Object} bounds 给予一个滚动容器的大小变化值，例如：{width: 320, height:240}，该参数是可选，如果给出该参数，滚动容器将以该参数来重新设置，如果不给出该参数，滚动条的外观将以当时滚动容器的大小来自适应。
     */
    flushBounds: function(bounds){
        var me = this,
            main = me.getMain(),
            container = me.getContainer(),
            defaultVisible = {y: me._yVisible, x: me._xVisible},
            _bounds = {
                w: bounds && baidu.lang.isNumber(bounds.width) ? bounds.width : container.clientWidth,
                h: bounds && baidu.lang.isNumber(bounds.height) ? bounds.height : container.clientHeight
            };
        me.setVisible(false);
        container.style.width = _bounds.w + 'px';
        container.style.height = _bounds.h + 'px';
        main.style.width = container.offsetWidth + 'px';
        main.style.height = container.offsetHeight + 'px';
        me._yVisible = defaultVisible.y;
        me._xVisible = defaultVisible.x;
        me._smartVisible();
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: ui/Slider/Slider$progressBar.js
 * author: linlingyu
 * version: 1.0.0
 * date: 2010-12-6
 */





/**
  * 和进度条结合，进度条跟随滑块的滑动
 * @name baidu.ui.Slider.Slider$progressBar
 * @addon baidu.ui.Slider
 */
baidu.ui.Slider.register(function(me){
    me.addEventListener("load", function(){
        baidu.dom.insertHTML(me.getThumb(), "beforeBegin", me.getProgressBarString());
        me.progressBar = new baidu.ui.ProgressBar({
            layout: me.layout,
            skin : me.skin ? me.skin + "-followProgressbar" : null
        });
        me.progressBar.render(me.getId("progressbar"));
        me._adjustProgressbar();
        me.addEventListener("dispose", function(){
                me.progressBar.dispose();
        });
    });
    me.addEventListeners('slide, slideclick, update', function(){
        me._adjustProgressbar();
    });
});

baidu.ui.Slider.extend({
    tplProgressbar : "<div id='#{rsid}' class='#{class}' style='position:absolute; left:0px; top:0px;'></div>",//这里position如果没有设置，会造成该div和thumb之间掉行
        
        /**
         * 根据tplProgressbar生成一个容器用来存入progressBar组件
         */
    getProgressBarString : function(){
        var me = this;
        return baidu.string.format(me.tplProgressbar, {
                rsid : me.getId("progressbar"),
                "class" : me.getClass("progressbar")
        });
    },
    
    /**
     * 当滑动thumb时，让prgressBar的长度跟随滑块
     */
    _adjustProgressbar : function(){
        var me = this,
            layout = me.layout,
            axis = me._axis[layout],
            thumb = me.getThumb(),
            thumbPos = parseInt(thumb.style[axis.pos], 10);
        if(!me.progressBar){return;}
        me.progressBar.getBar().style[me.progressBar.axis[layout].size] = (isNaN(thumbPos) ? 0 : thumbPos)
            + thumb[axis.offsetSize] / 2 + 'px';
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */











/**
 * 星级评价条
 * @class
 * @grammar new baidu.ui.StarRate(options)
 * @param {Object} [options] 选项
 * @param {Number} total 总数,默认5个
 * @param {Number} current 当前亮着的星星数
 * @param {String} classOn 星星点亮状态的className
 * @param {String} classOff 星星未点亮状态的className
 */
//TODO: 实现一个支持任意刻度的星的显示
baidu.ui.StarRate = baidu.ui.createUI(function(options){
   var me = this; 
   me.element = null; 
}).extend(
    /**
     *  @lends baidu.ui.StarRate.prototype
     */ 
    {
    uiType  : "starRate",
    // 总共需要多少个星星【可选，默认显示5个】
    total : 5,
    // 亮着的星星数【可选，默认无】
    current : 0,
    // 鼠标移出焦点区域触发函数【可选】
    //leave : function(){}
    // 鼠标经过的触发功能函数【可选】
    //hover : function(num){}
    // 点击的触发功能函数【可选】
    //click : function(num){}
    tplStar : '<span id="#{id}" class="#{className}" onmouseover="#{onmouseover}" onclick="#{onclick}"></span>',
    
    classOn : 'on',
    
    classOff : 'off',
    isDisable : false,
    /**
     * 获得控件的string
     * @private
     */
    getString : function(){
        var me = this, ret = [], i;
        for(i=0; i < me.total; ++i){
            ret.push(baidu.string.format(me.tplStar, {
                id          : me.getId(i),
                className   : i < me.current ? me.getClass(me.classOn) : me.getClass(me.classOff),
                onmouseover : me.getCallString("hoverAt",i+1),
                onclick     : me.getCallString("clickAt", i+1)
            }));
        }
        return ret.join('');
    },
    /**
     * 渲染控件
     * @public 
     * @param   {HTMLElement}   element       目标父级元素
     */
    render : function(element){
        var me = this;
            me.element = baidu.g(element);
        baidu.dom.insertHTML(me.element, "beforeEnd",me.getString());
    
        me._mouseOutHandle = baidu.fn.bind(function(){
            var me = this;
            me.starAt(me.current);
            me.dispatchEvent("onleave");
        },me);

        me.on(me.element, 'mouseout', me._mouseOutHandle);
    },

    /**
     * 指定高亮几个星星
     * @public 
     * @param   {number}  num  索引
     */
    starAt : function(num){
        var me = this, i;
        for(i=0; i < me.total; ++i){
            baidu.g(me.getId(i)).className = i < num ? me.getClass(me.classOn) : me.getClass(me.classOff);
        }
    },
    /**
     * 鼠标悬停指定高亮几个星星
     * @public 
     * @param   {number}  num  索引
     */
    hoverAt : function(num){
        if(!this.isDisable){
            this.starAt(num);
            this.dispatchEvent("onhover",{data : {index : num}});
        }
    },
    /**
     * 鼠标点击指定高亮几个星星
     * @public 
     * @param   {number}  num  索引
     */
    clickAt : function(num){
        if(!this.isDisable){
            this.current = num;
            this.dispatchEvent("onclick",{data : {index : num}});
        }
    },
    
    /**
     * 值不可更改,即不响应鼠标事件
     */
    disable : function(){
        var me = this;
        me.isDisable = true;
    },
    /**
     * disable之后的恢复
     */
    enable : function(){
        var me = this;
        me.isDisable = false;
    },
    /**
     * 销毁控件
     */
    dispose:function(){
        var me = this, i;
       
        for(i=0; i < me.total; ++i){
            baidu.dom.remove(me.getId(i));
        }
        
        me.dispatchEvent("ondispose");
        baidu.lang.Class.prototype.dispose.call(me);
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * update 2011.08.23 by zhaochengyang 'add holdHighLight option'
 */
























/**
 * Suggestion基类，建立一个Suggestion实例
 * @class
 * @grammar new baidu.ui.Suggestion(options)
 * @param  {Object}   [options]        选项.
 * @config {Function} onshow           当显示时触发。
 * @config {Function} onhide           当隐藏时触发，input或者整个window失去焦点，或者confirm以后会自动隐藏。
 * @config {Function} onconfirm        当确认条目时触发，回车后，或者在条目上按鼠标会触发确认操作。参数是event对象，其中有data属性，包括item和index值。item为当前确认的条目，index是条目索引。。
 * @config {Function} onbeforepick     使用方向键选中某一行，鼠标点击前触发。
 * @config {Function} onpick           使用方向键选中某一行，鼠标点击时触发。参数是event对象，其中有data属性，包括item和index值。item为当前确认的条目，index是条目索引。
 * @config {Function} onhighlight      当高亮时触发，使用方向键移过某一行，使用鼠标滑过某一行时会触发高亮。参数是event对象，其中有data属性，包括item和index值。item为当前确认的条目，index是条目索引。
 * @config {Function} onload
 * @config {Function} onmouseoveritem
 * @config {Function} onmouseoutitem
 * @config {Function} onmousedownitem
 * @config {Function} onitemclick
 * @config {Function} view             重新定位时，会调用这个方法来获取新的位置，传入的参数中会包括top、 left、width三个值。
 * @config {Function} getData          在需要获取数据的时候会调用此函数来获取数据，传入的参数word是用户在input中输入的数据。
 * @config {String}   prependHTML      写在下拉框列表前面的html
 * @config {String}   appendHTML       写在下拉框列表后面的html
 * @config {Boolean}  holdHighLight    鼠标移出待选项区域后，是否保持高亮元素的状态
 * @plugin coverable  支持背景遮罩
 * @plugin data		  提供数据内存缓存
 * @plugin fixWidth	  提供位置校准功能
 * @plugin input	  支持快捷键操作
 */
baidu.ui.Suggestion = baidu.ui.createUI(function(options) {
    var me = this;

    me.addEventListener('onload', function() {
        //监听suggestion外面的鼠标点击
        me.on(document, 'mousedown', me.documentMousedownHandler);

        //窗口失去焦点就hide
        me.on(window, 'blur', me.windowBlurHandler);
    });

    //初始化dom事件函数
    me.documentMousedownHandler = me._getDocumentMousedownHandler();
    me.windowBlurHandler = me._getWindowBlurHandler();

    //value为在data中的value
    me.enableIndex = [];
    //这个index指的是当前高亮条目在enableIndex中的index而非真正在data中的index
    me.currentIndex = -1;

}).extend(
/**
 *  @lends baidu.ui.Suggestion.prototype
 */
{
    uiType: 'suggestion',
    onbeforepick: new Function,
    onpick: new Function,
    onconfirm: new Function,
    onhighlight: new Function,
    onshow: new Function,
    onhide: new Function,

    /**
     * @private
     */
    getData: function() {return []},
    prependHTML: '',
    appendHTML: '',

    currentData: {},

    tplDOM: "<div id='#{0}' class='#{1}' style='position:relative; top:0px; left:0px'></div>",
    tplPrependAppend: "<div id='#{0}' class='#{1}'>#{2}</div>",
    tplBody: '<table cellspacing="0" cellpadding="2"><tbody>#{0}</tbody></table>',
    tplRow: '<tr><td id="#{0}" onmouseover="#{2}" onmouseout="#{3}" onmousedown="#{4}" onclick="#{5}" class="#{6}">#{1}</td></tr>',

    /**
     * 获得suggestion的外框HTML string
     * @private
     * @return {String}
     */
    getString: function() {
        var me = this;
        return baidu.format(
            me.tplDOM,
            me.getId(),
            me.getClass(),
            me.guid
        );
    },

    /**
     * 将suggestion渲染到dom树中
     * @public
     * @param {HTMLElement} target
     * @return {Null}
     */
    render: function(target) {
        var me = this,
            main,
            target = baidu.g(target);

        if (me.getMain() || !target) {
            return;
        }
        if (target.id) {
            me.targetId = target.id;
        }else {
            me.targetId = target.id = me.getId('input');
        }

        main = me.renderMain();

        main.style.display = 'none';
        main.innerHTML = me.getString();

        this.dispatchEvent('onload');
    },

    /**
     * 当前suggestion是否处于显示状态
     * @private
     * @return {Boolean}
     */
    _isShowing: function() {
        var me = this,
            main = me.getMain();
        return main && main.style.display != 'none';
    },

    /**
     * 把某个词放到input框中
     * @public
     * @param {String} index 条目索引.
     * @return {Null}
     */
    pick: function(index) {
        var me = this,
            currentData = me.currentData,
            word = currentData && typeof index == 'number' && typeof currentData[index] != 'undefined' ? currentData[index].value : index,
            eventData = {
                data: {
                    item: word == index ? {value: index, content: index} : currentData[index],
                    index: index
                }
            };

        if (me.dispatchEvent('onbeforepick', eventData)) {
            me.dispatchEvent('onpick', eventData);
        }
    },

    /**
     * 绘制suggestion
     * @public
     * @param {String}  word 触发sug的字符串.
     * @param {Object}  data suggestion数据.
     * @param {Boolean} [showEmpty] 如果sug数据为空是否依然显示 默认为false.
     * @return {Null}
     */
    show: function(word, data, showEmpty) {
        var i = 0,
            len = data.length,
            me = this;

        //如果返回的data对应的word不是当前的关键字，直接返回
        if(word != me.getTargetValue())
            return;
        me.enableIndex = [];
        me.currentIndex = -1;

        if (len == 0 && !showEmpty) {
            me.hide();
        } else {
            me.currentData = [];
            for (; i < len; i++) {
                if (typeof data[i].value != 'undefined') {
                    me.currentData.push(data[i]);
                }else {
                    me.currentData.push({
                        value: data[i],
                        content: data[i]
                    });
                }
                if (typeof data[i]['disable'] == 'undefined' || data[i]['disable'] == false) {
                    me.enableIndex.push(i);
                }
            }

            me.getBody().innerHTML = me._getBodyString();
            me.getMain().style.display = 'block';
            me.dispatchEvent('onshow');
        }
    },

    /**
     * 隐藏suggestion
     * @public
     * @return {Null}
     */
    hide: function() {
        var me = this;

        //如果已经是隐藏状态就不用派发后面的事件了
        if (!me._isShowing())
            return;
        
        //如果当前有选中的条目，将其放到input中
        if(me.currentIndex >= 0 && me.holdHighLight){
            var currentData = me.currentData,
                j = -1;
            for(var i=0, len=currentData.length; i<len; i++){
                if(typeof currentData[i].disable == 'undefined' || currentData[i].disable == false){
                    j++;
                    if(j == me.currentIndex)
                        me.pick(i);
                }
            }
        }
        
        me.getMain().style.display = 'none';
        me.dispatchEvent('onhide');
    },

    /**
     * 高亮某个条目
     * @public
     * @param {String} index 条目索引.
     * @return {Null}
     */
    highLight: function(index) {
        var me = this,
            enableIndex = me.enableIndex,
            item = null;

        //若需要高亮的item被设置了disable，则直接返回
        if (!me._isEnable(index)) return;

        me.currentIndex >= 0 && me._clearHighLight();
        item = me._getItem(index);
        baidu.addClass(item, me.getClass('current'));
        me.currentIndex = baidu.array.indexOf(enableIndex, index);

        me.dispatchEvent('onhighlight', {
            index: index,
            data: me.getDataByIndex(index)
        });
    },

    /**
     * 清除item高亮状态
     * @public
     * @return {Null}
     */
    clearHighLight: function() {
        var me = this,
            currentIndex = me.currentIndex,
            index = me.enableIndex[currentIndex];

        //若当前没有元素处于高亮状态，则不发出事件
        me._clearHighLight() && me.dispatchEvent('onclearhighlight', {
            index: index,
            data: me.getDataByIndex(index)
        });
    },

    /**
     * 清除suggestion中tr的背景样式
     * @private
     * @return {Boolean} bool 当前有item处于高亮状态并成功进行clear highlight,返回true，否则返回false.
     */
    _clearHighLight: function() {
        var me = this,
            currentIndex = me.currentIndex,
            enableIndex = me.enableIndex,
            item = null;

        if (currentIndex >= 0) {
            item = me._getItem(enableIndex[currentIndex]);
            baidu.removeClass(item, me.getClass('current'));
            me.currentIndex = -1;
            return true;
        }
        return false;
    },

    /**
     * confirm指定的条目
     * @public
     * @param {Number|String} index or item.
     * @param {String} source 事件来源.
     * @return {Null}
     */
    confirm: function(index, source) {
        var me = this;

        if (source != 'keyboard') {
            if (!me._isEnable(index)) return;
        }

        me.pick(index);
        me.dispatchEvent('onconfirm', {
            data: me.getDataByIndex(index) || index,
            source: source
        });
        me.currentIndex = -1;
        me.hide();
    },

    /**
     * 根据index拿到传给event的data数据
     * @private
     * @return {Object}
     * @config {HTMLElement} item
     * @config {Number} index
     */
    getDataByIndex: function(index) {

        return {
            item: this.currentData[index],
            index: index
        };
    },

    /**
     * 获得target的值
     * @public
     * @return {String}
     */
    getTargetValue: function() {
        return this.getTarget().value;
    },

    /**
     * 获得input框元素
     * @public
     * @return {HTMLElement}
     */
    getTarget: function() {
        return baidu.g(this.targetId);
    },

    /**
     * 获得指定的条目
     * @private
     * @return {HTMLElement}
     */
    _getItem: function(index) {
        return baidu.g(this.getId('item' + index));
    },

    /**
     * 渲染body部分的string
     * @private
     * @return {String}
     */
    _getBodyString: function() {

        var me = this,
            html = '',
            itemsHTML = [],
            data = me.currentData,
            len = data.length,
            i = 0;

        function getPrependAppend(name) {
            return baidu.format(
                me.tplPrependAppend,
                me.getId(name),
                me.getClass(name),
                me[name + 'HTML']
            );
        }


        html += getPrependAppend('prepend');

        for (; i < len; i++) {
            itemsHTML.push(baidu.format(
                me.tplRow,
                me.getId('item' + i),
                data[i].content,
                me.getCallRef() + '._itemOver(event, ' + i + ')',
                me.getCallRef() + '._itemOut(event, ' + i + ')',
                me.getCallRef() + '._itemDown(event, ' + i + ')',
                me.getCallRef() + '._itemClick(event, ' + i + ')',
                (typeof data[i]['disable'] == 'undefined' || data[i]['disable'] == false) ? '' : me.getClass('disable')
            ));
        }

        html += baidu.format(
            me.tplBody, 
            itemsHTML.join('')
        );
        html += getPrependAppend('append');
        return html;
    },

    /**
     * 当焦点通过鼠标或键盘移动到某个条目
     * @private
     * @param {Event} e
     * @param {Number} index
     * @return {Null}
     */
    _itemOver: function(e, index) {
        var me = this;
        baidu.event.stop(e || window.event);
        me._isEnable(index) && me.highLight(index);

        me.dispatchEvent('onmouseoveritem', {
            index: index,
            data: me.getDataByIndex(index)
        });
    },

    /**
     * 当焦点通过鼠标或键盘移出某个条目
     * @private
     * @param {Event} e
     * @param {Number} index
     * @return {Null}
     */
    _itemOut: function(e, index) {
        var me = this;
        baidu.event.stop(e || window.event);
        if(!me.holdHighLight)
            me._isEnable(index) && me.clearHighLight();

        me.dispatchEvent('onmouseoutitem', {
            index: index,
            data: me.getDataByIndex(index)
        });
    },

    /**
     * 当通过鼠标选中某个条目
     * @private
     * @param {Event} e
     * @param {Number} index
     * @return {Null}
     */
    _itemDown: function(e, index) {
        var me = this;
        baidu.event.stop(e || window.event);

        me.dispatchEvent('onmousedownitem', {
            index: index,
            data: me.getDataByIndex(index)
        });
    },

    /**
     * 当鼠标点击某个条目
     * @private
     * @param {Event} e
     * @param {Number} index
     * @return {Null}
     */
    _itemClick: function(e, index) {
        var me = this;
        baidu.event.stop(e || window.event);

        me.dispatchEvent('onitemclick', {
            index: index,
            data: me.getDataByIndex(index)
        });

        me._isEnable(index) && me.confirm(index, 'mouse');
    },

    /**
     * 判断item是否处于enable状态
     * @param {Number} index 索引，和传入的data中相同.
     * @return {Boolean}
     */
    _isEnable: function(index) {
        var me = this;
        return baidu.array.contains(me.enableIndex, index);
    },

    /**
     * 外部事件绑定
     * @private
     * @return {Function}
     */
    _getDocumentMousedownHandler: function() {
        var me = this;
        return function(e) {
            // todo : baidu.event.getTarget();
            e = e || window.event;
            var element = e.target || e.srcElement,
                ui = baidu.ui.get(element);
            //如果在target上面或者me内部
            if (element == me.getTarget() || (ui && ui.uiType == me.uiType)) {
                return;
            }
            me.hide();
        };
    },

    /**
     * 外部事件绑定
     * @private
     * @return {Function}
     */
    _getWindowBlurHandler: function() {
        var me = this;
        return function() {
            me.hide();
        };
    },

    /**
     * 销毁suggesiton
     * @public
     * @return {Null}
     */
    dispose: function() {
        var me = this;
        me.dispatchEvent('dispose');

        baidu.dom.remove(me.mainId);

        baidu.lang.Class.prototype.dispose.call(this);
    }
});
﻿/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */





/**
 * 支持背景遮罩掩盖select、flash、iframe元素
 * @name baidu.ui.Suggestion.Suggestion$coverable
 * @addon baidu.ui.Suggestion
 */
baidu.extend(baidu.ui.Suggestion.prototype, {
    coverable: true,
    coverableOptions: {}
});

baidu.ui.Suggestion.register(function(me) {

    if (me.coverable) {

        me.addEventListener('onshow', function() {
            me.Coverable_show();
        });

        me.addEventListener('onhide', function() {
            me.Coverable_hide();
        });
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 为Suggestion提供数据内存缓存，可对其扩展做本地缓存
 * @name baidu.ui.Suggestion.Suggestion$data
 * @addon baidu.ui.Suggestion
 * @author berg
 */

baidu.ui.Suggestion.extend({
    /**
     * 设置一组数据给suggestion，调用者可以选择是否立即显示这组数据: noShow
	 * @name baidu.ui.Suggestion.Suggestion$data
	 * @addon baidu.ui.Suggestion
	 * @function
	 * @param  {String}  word     关键字
	 * @param  {Array}   data     数据数组，例如["aaa","bbb"]
	 * @param  {Boolean} noShow  为true则不立即显示这组数据
     * @return {null}
     */
    setData: function(word, data, noShow) {
        var me = this;
		me.dataCache[word] = data;
        if (!noShow) {
            me.show(word, me.dataCache[word]);
        }
    }
});

baidu.ui.Suggestion.register(function(me) {
    //初始化dataCache
    me.dataCache = {},
    /*
     * 获取一个词对应的me数据
     * 通过事件返回结果
     */
    me.addEventListener('onneeddata', function(ev, word) {
        var dataCache = me.dataCache;
        if (typeof dataCache[word] == 'undefined') {
            //没有数据就去取数据
            me.getData(word);
        }else {
            //有数据就直接显示
            me.show(word, dataCache[word]);
        }
    });
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */














/**
 * 为Suggestion提供位置校准功能
 * @name  baidu.ui.Suggestion.Suggestion$fixWidth
 * @addon baidu.ui.Suggestion
 * @author berg
 */
baidu.ui.Suggestion.extend({
    posable: true,
    fixWidth: true,
    getWindowResizeHandler: function() {
        var me = this;
        return function() {
            me.adjustPosition(true);
        };
    },

	/*
     * 重新放置suggestion
     * @private
     */
    adjustPosition: function(onlyAdjustShown) {
       var me = this,
            target = me.getTarget(),
            targetPosition,
            main = me.getMain(),
            pos;

        if (!me._isShowing() && onlyAdjustShown) {
            return;
        }
        targetPosition = baidu.dom.getPosition(target),
        pos = {
                top: (targetPosition.top + target.offsetHeight - 1),
                left: targetPosition.left,
                width: target.offsetWidth
            };
        //交给用户的view函数计算
        pos = typeof me.view == 'function' ? me.view(pos) : pos;

        me.setPosition([pos.left, pos.top], null, {once: true});
        baidu.dom.setOuterWidth(main, pos.width);
    }
});
baidu.ui.Suggestion.register(function(me) {

    me.windowResizeHandler = me.getWindowResizeHandler();

    me.addEventListener('onload', function() {
        me.adjustPosition();
        //监听搜索框与suggestion弹出层的宽度是否一致。
        if (me.fixWidth) {
            me.fixWidthTimer = setInterval(function() {
                var main = me.getMain(),
                    target = me.getTarget();
                if (main.offsetWidth != 0 && target && target.offsetWidth != main.offsetWidth) {
                    me.adjustPosition();
                    main.style.display = 'block';
                }
            }, 100);
        }
        //当窗口变化的时候重新放置
        me.on(window, 'resize', me.windowResizeHandler);
    });

    //每次出现的时候都重新定位，保证用户在初始化之后修改了input的位置，也不会出现混乱
    me.addEventListener('onshow', function() {
        me.adjustPosition();
    });

    me.addEventListener('ondispose', function() {
        clearInterval(me.fixWidthTimer);
    });

});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */






/**
 * 支持快捷键操作，如上下，回车等
 * @name  baidu.ui.Suggestion.Suggestion$input
 * @addon baidu.ui.Suggestion
 */
baidu.ui.Suggestion.register(function(me) {
    var target,

        //每次轮询获得的value
        oldValue = '',

        //一打开页面就有的input value
        keyValue,

        //使用pick方法上框的input value
        pickValue,
        mousedownView = false,
        stopCircleTemporary = false;
    
    function initKeyValue(){
        setTimeout(function(){//防止opera和ie回退时自动打开sug
            keyValue = me.getTarget().value;
        }, 20);
    }

    me.addEventListener('onload', function() {
        target = this.getTarget();

        initKeyValue();
        
        me.on(window, 'onload', initKeyValue);

        //生成dom事件函数
        me.targetKeydownHandler = me.getTargetKeydownHandler();

        //加入dom事件
        me.on(target, 'keydown', me.targetKeydownHandler);

        target.setAttribute('autocomplete', 'off');

        //轮询计时器
        me.circleTimer = setInterval(function() {
            if (stopCircleTemporary) {
                return;
            }

            if (baidu.g(target) == null) {
                me.dispose();
            }

            var nowValue = target.value;
            //todo,这里的流程可以再简化一点
            if (
                nowValue == oldValue &&
                nowValue != '' &&
                nowValue != keyValue &&
                nowValue != pickValue
              ) {
                if (me.requestTimer == 0) {
                    me.requestTimer = setTimeout(function() {
                        me.dispatchEvent('onneeddata', nowValue);
                    }, 100);
                }
            }else {
                clearTimeout(me.requestTimer);
                me.requestTimer = 0;
                if (nowValue == '' && oldValue != '') {
                    pickValue = '';
                    me.hide();
                }
                oldValue = nowValue;
                if (nowValue != pickValue) {
                    me.defaultIptValue = nowValue;
                }
                if (keyValue != target.value) {
                    keyValue = '';
                }
            }
        }, 10);

        me.on(target, 'beforedeactivate', me.beforedeactivateHandler);
    });

    me.addEventListener('onitemclick', function() {
        stopCircleTemporary = false;
        //更新oldValue，否则circle的时候会再次出现suggestion
        me.defaultIptValue = oldValue = me.getTargetValue();
    });

    me.addEventListener('onpick', function(event) {
        //firefox2.0和搜狗输入法的冲突
        if (mousedownView)
            target.blur();
        target.value = pickValue = event.data.item.value;
        if (mousedownView)
            target.focus();
    });

    me.addEventListener('onmousedownitem', function(e) {
        mousedownView = true;
        //chrome和搜狗输入法冲突的问题
        //在chrome下面，输入到一半的字会进框，如果这个时候点击一下suggestion，就会清空里面的东西，导致suggestion重新被刷新
        stopCircleTemporary = true;
        setTimeout(function() {
            stopCircleTemporary = false;
            mousedownView = false;
        },500);
    });
    me.addEventListener('ondispose', function() {
        clearInterval(me.circleTimer);
    });
});

baidu.ui.Suggestion.extend({
    /*
     * IE和M$输入法打架的问题
     * 在失去焦点的时候，如果是点击在了suggestion上面，那就取消其默认动作(默认动作会把字上屏)
     */
    beforedeactivateHandler: function() {
        return function() {
            if (mousedownView) {
                window.event.cancelBubble = true;
                window.event.returnValue = false;
            }
        };
    },

    getTargetKeydownHandler: function() {
        var me = this;

        /*
         * 上下键对suggestion的处理
         */
        function keyUpDown(up) {

            if (!me._isShowing()) {
                me.dispatchEvent('onneeddata', me.getTargetValue());
                return;
            }

            var enableIndex = me.enableIndex,
                currentIndex = me.currentIndex;

            //当所有的data都处于disable状态。直接返回
            if (enableIndex.length == 0) return;
            if (up) {
                switch (currentIndex) {
                    case -1:
                        currentIndex = enableIndex.length - 1;
                        me.pick(enableIndex[currentIndex]);
                        me.highLight(enableIndex[currentIndex]);
                        break;
                    case 0:
                        currentIndex = -1;
                        me.pick(me.defaultIptValue);
                        me.clearHighLight();
                        break;
                    default:
                        currentIndex--;
                        me.pick(enableIndex[currentIndex]);
                        me.highLight(enableIndex[currentIndex]);
                        break;
                }
            }else {
                switch (currentIndex) {
                    case -1:
                        currentIndex = 0;
                        me.pick(enableIndex[currentIndex]);
                        me.highLight(enableIndex[currentIndex]);
                        break;
                    case enableIndex.length - 1:
                        currentIndex = -1;
                        me.pick(me.defaultIptValue);
                        me.clearHighLight();
                        break;
                    default:
                        currentIndex++;
                        me.pick(enableIndex[currentIndex]);
                        me.highLight(enableIndex[currentIndex]);
                        break;
                }
            }
            me.currentIndex = currentIndex;
        }
        return function(e) {
            var up = false, index;
            e = e || window.event;
            switch (e.keyCode) {
                case 9:     //tab
                case 27:    //esc
                    me.hide();
                    break;
                case 13:    //回车，默认为表单提交
                    baidu.event.stop(e);
                    me.confirm( me.currentIndex == -1 ? me.getTarget().value : me.enableIndex[me.currentIndex], 'keyboard');
                    break;
                case 38:    //向上，在firefox下，按上会出现光标左移的现象
                    up = true;
                case 40:    //向下
                    baidu.event.stop(e);
                    keyUpDown(up);
                    break;
                default:
                   me.currentIndex = -1;
            }
        };
    },

    /*
     * pick选择之外的oldValue
     */
    defaultIptValue: ''

});
/*
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * @path:ui/Table/Table$page.js
 * @author:linlingyu
 * @version:1.0.0
 * @date:2010-9-30
 */




/**
 * 表格翻页的插件
 * @name  baidu.ui.Table.Table$page
 * @addon baidu.ui.Table
 * @param   {Object} options config参数
 * @config  {Number} pageSize 一页显多少行的数字表示形式
 */
baidu.ui.Table.register(function(me){
	me._createPage();
	me.addEventListener("beforeupdate", function(){
		me._createPage();
	});
});
//
baidu.object.extend(baidu.ui.Table.prototype, {
	currentPage : 1,	//当前页
//	pageSize : 10,	//没有默认值，如果在options中设定了该值表示要分页，不设定则表示全部显示
	_createPage : function(){
		var me = this;
		me.dataSet = me.data || [];
		if(me.pageSize){//如果需要分页
			me.data = me.data.slice(0, me.pageSize);
		}
	},
	/**
	 * 直接翻到索引指定的页数
	 * @name  baidu.ui.Table.Table$page.gotoPage
	 * @addon baidu.ui.Table.Table$page
	 * @function
	 * @param {Object} index
	 */
	gotoPage : function(index){
		var me = this,
			index = index <= 0 ? 1 : Math.min(index, me.getTotalPage()),//对页数的修正
			offset = (index - 1) * me.pageSize,
			data = me.dataSet.slice(offset, offset + me.pageSize),
			i = 0,
			row;
		for(; i < me.pageSize; i++){
			row = me.getRow(i);
			if(data[i]){
				if(row){
					row.update(data[i]);
				}else{
					me.dispatchEvent("addrow", {rowId : me._addRow(data[i])});
				}
			}else{
				if(row){
					me.dispatchEvent("removerow", {rowId : me._removeRow(i--)});
				}
			}
		}
		me.data = data;
		me.currentPage = index;
		me.dispatchEvent("gotopage");
	},
	
	/**
	 * 翻到上一页
	 * @name  baidu.ui.Table.Table$page.prevPage
	 * @addon baidu.ui.Table.Table$page
	 * @function
	 */
	prevPage : function(){
		var me = this;
		me.gotoPage(--me.currentPage);
	},
	
	/**
	 * 翻到下一页
	 * @name  baidu.ui.Table.Table$page.nextPage
	 * @addon baidu.ui.Table.Table$page
	 * @function
	 */
	nextPage : function(){
		var me = this;
		me.gotoPage(++me.currentPage);
	},
	
	/**
	 * 取得总记录数
	 * @name  baidu.ui.Table.Table$page.getTotalCount
	 * @addon baidu.ui.Table.Table$page
	 * @function
	 * @return {number} 
	 */
	getTotalCount : function(){
		return this.dataSet.length;
	},
	
	/**
	 * 取得总页数
	 * @name  baidu.ui.Table.Table$page.getTotalPage
	 * @addon baidu.ui.Table.Table$page
	 * @function
	 * @return {number} 
	 */
	getTotalPage : function(){
		var me = this;
		return baidu.lang.isNumber(me.pageSize) ? Math.ceil(me.dataSet.length/me.pageSize)
		  : me.currentPage;
	},
	
	/**
	 * 取得当前页数
	 * @name  baidu.ui.Table.Table$page.getCurrentPage
	 * @addon baidu.ui.Table.Table$page
	 * @function
	 * @return {number} 
	 */
	getCurrentPage : function(){
		return this.currentPage;
	},
	
	/**
	 * 新增一个行，
	 * @param {Object} options 格式同table的addRow
	 * @param {Number} index 在索引的行之前插入，可选项，默认值是在最后插入
	 * @name  baidu.ui.Table.Table$page.addRow
	 * @addon baidu.ui.Table.Table$page
	 * @function
	 */
	addRow : function(options, index){
		var me = this,
			index = baidu.lang.isNumber(index) ? index : me.getTotalCount(),
			currPage = me.getCurrentPage(),
			instPage = Math.ceil((index + 1) / me.pageSize),
			data = options,
			rowId;
		if(me.pageSize){
			me.dataSet.splice(index, 0, data);
            if(currPage >= instPage){//addrow
                index %= me.pageSize;
                if(currPage != instPage){
                    data = me.dataSet[(currPage - 1) * me.pageSize];
                    index = 0;
                }
                rowId = me._addRow(data, index);
                if(me.getRowCount() > me.pageSize){//removerow
                    me.dispatchEvent("removerow", {rowId : me._removeRow(me.getRowCount() - 1)});
                }
            }
            me.dispatchEvent("addrow", {rowId : rowId});
		}else{
			me.dispatchEvent("addrow", {rowId : me._addRow(options, index)});
		}	
	},
	
	/**
	 * 移除一个行
	 * @param {Object} index 需要移除的行的索引
	 * @name  baidu.ui.Table.Table$page.removeRow
	 * @addon baidu.ui.Table.Table$page
	 */
	removeRow : function(index){
		var me = this,
			currPage = me.getCurrentPage(),
			delePage = Math.ceil((index + 1) / me.pageSize),
			removeRowId,
			data;
		if(me.pageSize){
			me.dataSet.splice(index, 1);
	        if(currPage >= delePage){
	            index = currPage != delePage? 0 : index % me.pageSize;
	            removeRowId = me._removeRow(index);
	            data = me.dataSet[currPage * me.pageSize - 1];//-1是上面删除了的一个
	            if(data){
	                me.dispatchEvent("addrow", {rowId : me._addRow(data)});
	            }
	        }
	        me.dispatchEvent("removerow", {rowId : removeRowId});
		}else{
			me.dispatchEvent("removerow", {rowId : me._removeRow(index)});
		}
	}
});
/*
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * @path:ui/Table/Table$btn.js
 * @author:linlingyu
 * @version:1.0.0
 * @date:2010-9-30
 */








/**
 * 为翻页功能增加相关按钮
 * @name  baidu.ui.Table.Table$btn
 * @addon baidu.ui.Table
 * @param {Object} options config参数
 * @config {Object} widthPager 当该参数要在table的结尾处增加翻页按钮
 */
baidu.ui.Table.register(function(me){
    me.addEventListeners("load, update", function(){
        if(me.withPager){
            baidu.dom.insertHTML(me.getTarget(), "beforeEnd", "<div id='" + me.getId("-pager") + "' align='right'></div>");
            me.pager = new baidu.ui.Pager({
                endPage : me.getTotalPage() + 1,
                ongotopage : function(evt){me.gotoPage(evt.page);}
            });
            me.pager.render(me.getPagerContainer());
            me.addEventListeners("addrow, removerow", function(){
                me.pager.update({endPage : me.getTotalPage() + 1});
            });
            me.resize();
            baidu.event.on(window, "resize", function(){me.resize();});
        }
    });
});

baidu.object.extend(baidu.ui.Table.prototype, {
    /**
     * 取得存放pager的容器
	 * @name  baidu.ui.Table.Table$btn.getPagerContainer
	 * @addon baidu.ui.Table.Table$btn
     * @return {html-element} 
     */
    getPagerContainer : function(){
        return baidu.g(this.getId("-pager"));
    },
    
    /**
     * 重设pager容器的大小
	 * @name  baidu.ui.Table.Table$btn.resize
	 * @addon baidu.ui.Table.Table$btn
     */
    resize : function(){
        var me = this;
        baidu.dom.setStyle(me.getPagerContainer(), "width", me.getBody().offsetWidth + "px");
    }
});
/*
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * @path:ui/Table/Table$edit.js
 * @author:linlingyu
 * @version:1.0.0
 * @date:2010-11-05
 */











/**
 * 使单元格支持编辑
 * @name  baidu.ui.Table.Table$edit
 * @addon baidu.ui.Table
 * @param {Object} options config参数
 * @config {Object} columns 在columns的数据描述中加入enableEdit属性并设置为true表示该支持可双击紡辑，如：{index:0, enableEdit: true}
 */
baidu.ui.Table.register(function(me){
    //me._editArray = [];    //存入用户设置的需要编辑的行对象
    //me._textField;        //编辑的通用input
    if(!me.columns){return;}
    me.addEventListeners('load, update', function(){
        var i = 0,
            rowCount = me.getRowCount(),
            editArray = me._editArray = [],
            field = me._textField = new baidu.ui.Input({//这里每次update都会innerHTML,则每次都得新建input
                element: me.getMain(),
                autoRender: true
            });
        field.getBody().onblur = baidu.fn.bind('_cellBlur', me);
        baidu.dom.hide(field.getBody());
        baidu.array.each(me.columns, function(item){
            if(item.hasOwnProperty('enableEdit')){
                editArray.push(item);
            }
        });
        for(; i < rowCount; i++){
            me.attachEdit(me.getRow(i));
        }
    });
});
//
baidu.object.extend(baidu.ui.Table.prototype, {
    /**
     * 绑定某行中的列拥有双击事件
     * @param {baidu.ui.table.Row} row 行对象
	 * @name  baidu.ui.Table.Table$edit.attachEdit
	 * @addon baidu.ui.Table.Table$edit
     */
    attachEdit : function(row){
        var me = this;
        baidu.array.each(me._editArray, function(item){
            var cell = row.getBody().cells[item.index];
                cell.ondblclick = item.enableEdit ? baidu.fn.bind('_cellFocus', me, cell)
                    : null;
        });
    },
    
    /**
     * 当双击单元格时取得焦点实现编辑
     * @param {HTMLElement} cell 一个td对象
     * @param {Event} evt 浏览器的事件对象
     */
    _cellFocus : function(cell, evt){
        var me = this,
            input = me._textField.getBody(),
            cellWidth = cell.clientWidth;//当是自适应模式时，这里需要先把clientWidth保存
        if(baidu.event.getTarget(evt || window.event).id == input.id){return;}
        input.value = cell.innerHTML;
        cell.innerHTML = '';
        //input.style.width = '0px';//当是自适应模式是时，需要先设为0
        cell.appendChild(input);
        baidu.dom.show(input);
        input.style.width = cellWidth
            - input.offsetWidth
            + input.clientWidth + 'px';
        input.focus();
        input.select();
    },
    
    /**
     * 失去单元格焦点时编辑数据写回单元格
     * @param {Object} evt
     */
    _cellBlur : function(evt){
        var me = this,
            target = baidu.event.getTarget(evt || window.event),
            cell = baidu.dom.getAncestorByTag(target, "td");
        baidu.dom.hide(target);
        me.getTarget().appendChild(target);
        cell.innerHTML = target.value;
    }
});
/*
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * @path:ui/Table/Table$page.js
 * @author:linlingyu
 * @version:1.0.0
 * @date:2010-9-30
 */












/**
 * 增加选择列的插件
 * @name  baidu.ui.Table.Table$select
 * @addon baidu.ui.Table
 * @param   {Object} options config 参数
 * @config  {Object} columns 在columns的数据描述中加入type属性并设置为'checkbox'表示该列支持checkbox，如：{index:0, type: 'checkbox'}
 */
baidu.ui.Table.register(function(me){
//	me._selectedItems = {};      //当前选中的id:checkbox-id, data:row-data
//	me._checkboxList = {};       //所有的 row-id 和 checkbox-id 对照表
//  me._checkboxDomList = {};    //提高全选性能，提有DOM节点
	if(me.columns){
		me.addEventListeners("load, update", function(){
			me._selectedItems = {};
			me._checkboxList = {};
			me._checkboxDomList = {};
			me._createSelect();
		});
		me.addEventListeners({
			addrow : function(evnt){
				me.addCheckbox(evnt.rowId, me._selectIndex);
			},
			removerow : function(evnt){
				me.removeCheckbox(evnt.rowId);
			},
			gotopage : function(){
				me.unselectAll();
			}
		});
	}
});

baidu.object.extend(baidu.ui.Table.prototype, {
	tplSelect : '<input id="#{id}" type="checkbox" value="#{value}" onclick="#{handler}"/>', //这里事件使用onchange时ie会有问题
//	titleCheckboxId : null,   //表格头部id
	/**
	 * 当存在title时创建一个全选的checkbox
	 * @param {Number} index 列索引
	 * @memberOf {TypeName} 
	 */
	_createTitleScelect : function(index){
		var me = this;
		me.titleCheckboxId = me.titleCheckboxId || me.getId("checkboxAll");
		baidu.dom.insertHTML(me.getTitleBody().rows[0].cells[index], "beforeEnd",
			baidu.string.format(me.tplSelect, {
				id : me.titleCheckboxId,
				value : "all",
				handler : me.getCallString("toggleAll")
			})
		);
	},
	
	/**
	 * 在指定的clumnIndex中创建一列带checkbox的选择列
	 * @memberOf {TypeName} 
	 */
	_createSelect : function(){
		var me = this,
			rowCount = me.getRowCount(),
			i = 0,
			index;
		baidu.array.each(me.columns, function(item){//取出列索引
			if(item.hasOwnProperty("type") && item.type.toLowerCase() == "checkbox"){
				me._selectIndex = index = item.index;
				return false;
			}
		});
		if(me.title && baidu.lang.isNumber(index)){//如果存在表格标题,生成全选checkbox
			if(me.getTitleBody && me.getTitleBody()){//这里和$title插件存在文件载入先后关联
				me._createTitleScelect(index);
			}else{
				me.addEventListener("titleload", function(){
					me._createTitleScelect(index);
					me.removeEventListener("titleload", arguments.callee);
				});
			}
		}
		if(baidu.lang.isNumber(index)){
			for(;i < rowCount; i++){//生成各行的checkbox
				me.addCheckbox(me.getRow(i).getId(), index);
			}
		}
	},
	
	/**
	 * 生成单个ceckbox的字符
	 * @param {baidu.ui.table.Row} row 行组件
	 * @memberOf {TypeName} 
	 * @return {string}
	 */
	_getSelectString : function(row){
		var me = this,
			rsid = row.getId("checkbox");
		me._checkboxList[row.getId()] = rsid;
		me._checkboxDomList[row.getId()] = rsid;
		return baidu.string.format(me.tplSelect, {
			id : rsid,
			value : row.id ? row.id : row.guid,
			handler : me.getCallString("toggle", rsid)
		});
	},
	
	/**
	 * 添加单个checkbox到行中
	 * @name  baidu.ui.Table.Table$select.addCheckbox
	 * @addon baidu.ui.Table.Table$select
	 * @function
	 * @param {String} rowId 该行的id
	 */
	addCheckbox : function(rowId, index){
		var me = this, row, cell, checkboxStr;
		if(baidu.lang.isNumber(index)){
			row = baidu.ui.get(baidu.g(rowId)),
			cell = row.getBody().cells[index],
			checkboxStr = me._getSelectString(row);
			baidu.dom.insertHTML(cell, "beforeEnd", checkboxStr);
			baidu.dom.setAttr(cell, "align", "center");
			row.addEventListener("update", function(){
				baidu.dom.insertHTML(cell, "beforeEnd", checkboxStr);
			});
			me._checkboxDomList[rowId] = baidu.dom.g(me._checkboxDomList[rowId]);
		}
	},
	
	/**
	 * 移除一个checkbox
	 * @param {Object} rowId 该行的id
	 * @name  baidu.ui.Table.Table$select.removeCheckbox
	 * @addon baidu.ui.Table.Table$select
	 * @function
	 */
	removeCheckbox : function(rowId){
		var me = this;
		delete me._selectedItems[me._checkboxList[rowId]];
		delete me._checkboxList[rowId];
		delete me._checkboxDomList[rowId];
	},
	
	/**
	 * 取得表格标题的全选checkbox
	 * @name  baidu.ui.Table.Table$select.getTitleCheckbox
	 * @addon baidu.ui.Table.Table$select
	 * @function
	 * @return {html-element} 
	 */
	getTitleCheckbox : function(){
		return baidu.dom.g(this.titleCheckboxId);
	},
	
	/**
	 * 设置一个自定义的全选checkbox
	 * @param {String} checkboxId 该checkbox的id
	 * @name  baidu.ui.Table.Table$select.setTitleCheckbox
	 * @addon baidu.ui.Table.Table$select
	 * @function
	 */
	setTitleCheckbox : function(checkbox){
		this.titleCheckboxId = checkbox.id || checkbox;
	},
	
	/**
	 * 根据checkbox对象状态来维护选中的MAP
	 * @param {Object} checkboxId
	 * @memberOf {TypeName} 
	 */
	_setSelectItems : function(checkboxId){
		var me = this,
			checkbox = baidu.g(checkboxId),
			row;
		if(checkbox.checked){
			row = baidu.ui.get(baidu.dom.getAncestorByTag(checkboxId, "TR"));
			me._selectedItems[checkbox.id] = row.id || row;
		}else{
			delete me._selectedItems[checkbox.id];
		}
	},
	
	/**
	 * 根据给定的索引设置checkbox的选中或返选状态
	 * @param {Array} indexArr 格式[1, 4],当是null时默认值是_checkboxList
	 * @param {Boolean} val true:选中, false:反选
	 * @memberOf {TypeName}_setCheckboxState
	 */
	_setCheckboxState : function(indexArr, val){
		var me = this,
			indexArr = baidu.lang.isNumber(indexArr) ? [indexArr] : indexArr,	//索引
			rsidList = [],	//checkbox-id array
			checkbox;
		if(indexArr){
			baidu.array.each(indexArr, function(item){
				rsidList.push(me._checkboxDomList[me.getRow(item).getId()]);
			});
		}else{
			rsidList = baidu.object.values(me._checkboxDomList);
		}
		baidu.array.each(rsidList, function(checkbox){
			if(val && !checkbox.checked){
				checkbox.checked = true;
			}else if(!val && checkbox.checked){
				checkbox.checked = false;
			}
			if(indexArr){//单选
				me.toggle(checkbox);
			}else{
				me._setSelectItems(checkbox);
			}
		});
	},
	
	/**
	 * 根据给定的数组索引选中checkbox
	 * @param {Object} indexArr 格式：[1, 3, 8]
	 * @name  baidu.ui.Table.Table$select.select
	 * @addon baidu.ui.Table.Table$select
	 * @function
	 */
	select : function(indexArr){
		this._setCheckboxState(indexArr, true);
	},
	
	/**
	 * 根据给定的数组索引反选checkbox
	 * @param {Object} indexArr 索引数组
	 * @name  baidu.ui.Table.Table$select.unselect
	 * @addon baidu.ui.Table.Table$select
	 * @function
	 */
	unselect : function(indexArr){
		this._setCheckboxState(indexArr, false);
	},
	
	/**
	 * 单项的切换选中或反选
	 * @param {Object} rsid 项ID
	 * @name  baidu.ui.Table.Table$select.toggle
	 * @addon baidu.ui.Table.Table$select
	 * @function
	 */
	toggle : function(rsid){
		var me = this,
			titleCheckbox = me.getTitleCheckbox(),
			checkbox = baidu.g(rsid),
			len;
		me._setSelectItems(rsid);//选中反选处理数据
		if(checkbox.checked){
			len = baidu.object.keys(me._selectedItems).length;
			if(titleCheckbox && !titleCheckbox.checked
				&& len == baidu.object.keys(me._checkboxList).length){
					titleCheckbox.checked = true;
			}
		}else{
			if(titleCheckbox && titleCheckbox.checked){
				titleCheckbox.checked = false;
			}
		}
	},
	
	/**
	 * 全部选中checkbox
	 * @name  baidu.ui.Table.Table$select.selectAll
	 * @addon baidu.ui.Table.Table$select
	 * @function
	 */
	selectAll : function(){
		this._setCheckboxState(null, true);
	},
	
	/**
	 * 全部反选checkbox
	 * @name  baidu.ui.Table.Table$select.unselectAll
	 * @addon baidu.ui.Table.Table$select
	 * @function
	 */
	unselectAll : function(){
		this._setCheckboxState(null, false);
	},
	
	/**
	 * 当全选的checkbox存在时才可以切换全选和全反选
	 * @name  baidu.ui.Table.Table$select.toggleAll
	 * @addon baidu.ui.Table.Table$select
	 * @function
	 */
	toggleAll : function(){
		var me = this, checkbox = me.getTitleCheckbox();
		if(checkbox){
			this._setCheckboxState(null, checkbox.checked);
		}
	},
	
	/**
	 * 取得已经选中的数据，如果该行的row.data中设置id则返回所选中的id数组，否则返回该row的data
	 * @name  baidu.ui.Table.Table$select.getSelected
	 * @addon baidu.ui.Table.Table$select
	 * @function
	 * @return {TypeName} 
	 */
	getSelected : function(){
		return baidu.object.values(this._selectedItems);
	}
});
/*
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * @path:ui/Table/Table$title.js
 * @author:linlingyu
 * @version:1.0.0
 * @date:2010-11-05
 */








/**
 * 增加列标题
 * @name  baidu.ui.Table.Table$title
 * @addon baidu.ui.Table
 * @param   {Object} options config参数
 * @config  {Object} title 在表格头上增加一个行来说明各个表格列的标题，参数格式：['column-1', 'column-2', 'column-3'...]
 */
baidu.ui.Table.register(function(me){
	if(me.title){
		me.addEventListeners("load, update", function(){
			if(!me.getTitleBody()){
				baidu.dom.insertHTML(me.getTarget(), "afterBegin", me._getTitleString());
				me.dispatchEvent("titleload");//这个事件派发主要是解决select插件
				baidu.dom.setStyles(me.getBody(), {tableLayout : "fixed"});//这一步设置需要在getTitleBody之前，防止宽度提前撑开
				baidu.dom.setStyles(me.getTitleBody(), {width : me.getBody().offsetWidth + "px", tableLayout : "fixed"});//这个地方很奇怪，不能用clientWidth，需要用offsetWidth各浏览器才显示正确
				
			}
			if(me.getTitleBody() && me.columns){
				baidu.array.each(me.columns, function(item){
					if(item.hasOwnProperty("width")){
						baidu.dom.setStyles(me.getTitleBody().rows[0].cells[item.index], {width : item.width});
					}
				});
			}
		});
		//
		me.addEventListener("addrow", function(){
            if(me.getRowCount() == 1){
            	baidu.dom.setStyles(me.getTitleBody(), {width : me.getBody().offsetWidth + "px"});//当是IE6时，当没有row时，offsetWidth会为0
            }
		});
	}
});
//
baidu.object.extend(baidu.ui.Table.prototype, {
	tplTitle : '<div><table id="#{rsid}" class="#{tabClass}" cellspacing="0" cellpadding="0" border="0"><tr class="#{trClass}">#{col}</tr></table></div>',
	
	/**
	 * 取得表格列标题的拼接字符串
	 * @memberOf {TypeName} 
	 * @return {TypeName} 
	 */
	_getTitleString : function(){
		var me = this,
			col = [],
			clazz = "";
		baidu.array.each(me.title, function(item){
			col.push("<td>", item, "</td>");
		});
		return baidu.string.format(me.tplTitle, {
			rsid : me.getId("title"),
			tabClass : me.getClass("title"),
			trClass : me.getClass("title-row"),
			col : col.join("")
		});
	},
	
	/**
	 * 取得表格的table对象
	 * @name  baidu.ui.Table.Table$title.getTitleBody
	 * @addon baidu.ui.Table.Table$title
	 * @function
	 * @return {html-element} 
	 */
	getTitleBody : function(){
		return baidu.g(this.getId("title"));
	}
});
/**
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */


















/**
 * toolBar基类，建立toolBar实例
 * @class
 * @grammar new baidu.ui.Toolbar(options)
 * @param   {Object}    options config参数.
 * @config  {String}    [title=""]  toolbar的title参数，默认为空.
 * @config  {String}    [name="ToolBar_item_xxx"]   name参数，每个toolbar对象都有一个name参数.
 * @config  {String}    [direction="horizontal"]    有效值:"vertical","horizontal" toolbar只能在横向和纵向之间进行选择，默认为横向，及"horizontal".
 * @config  {String}    [position="left" | "top"]   当direction为horizontal时，默认值为left;当direction为vertical时,默认值为top.
 *                                                  align有效值:'left', 'right', 'center', 'justify', 'inherit'
                                                    valign有效值:'top', 'middle', 'bottom', 'baseline'
 * @config  {String|Number} [width]     宽度.
 * @config  {String|Number} [height]    高度.
 * @config  {String|HTMLElement}    [container=document.body]   实例容器.
 * @config  {Array}     [items] Object数组，创建ui的JSON.
 * @config  {String}    [type="button"] ui控件类型
 * @config  {Object}    [config]    创建ui控件所需要的config参数.
 * @author  lixiaopeng
 */
baidu.ui.Toolbar = baidu.ui.createUI(function(options) {
    var me = this,
        positionCheck = false,
        positionPrefix = 'align="';

    me._itemObject = {};
    me.items = me.items || {};
   
    if(me.direction != 'horizontal'){
        me.direction = 'vertical';
        !baidu.array.contains(['top', 'middle', 'bottom', 'baseline'], me.position) && (me.position = 'top'); 
    }
    me._positionStr = positionPrefix + me.position + '"';

}).extend(
/**
 * @lends baidu.ui.Toolbar.prototype
 */
{
    title: '',
    direction: 'horizontal',
    position: 'left',
    cellIndex: 0,
    tplMain: '<div id="#{bodyId}" class="#{bodyClass}" onmousedown="javascript:return false;">' +
            '#{title}' +
            '<div id="#{bodyInner}" class="#{bodyInnerClass}">' +
                '<table cellpadding="0" cellspacing="0" style="width:100%; height:100%" id="#{tableId}">' +
                    '<tr><td style="width:100%; height:100%; overflow:hidden;" valign="top">' +
                        '<table cellpadding="0" cellspacing="0" id="#{tableInnerId}">#{content}</table>' +
                    '</td></tr>' +
                '</table>' +
            '</div>' +
            '</div>',
    tplTitle: '<div id="#{titleId}" class="#{titleClass}"><div id="#{titleInnerId}" class="#{titleInnerClass}">#{title}</div></div>',
    tplHorizontalCell: '<td id="#{id}" valign="middle" style="overflow:hidden;"></td>',
    tplVerticalCell: '<tr><td id="#{id}" valign="middle" style="overflow:hidden;"></td></tr>',
    uiType: 'toolbar',

    /**
     * 返回toolbar的html字符串
     * @private
     * @return {String} HTMLString.
     */
    getString: function() {
        var me = this;

        return baidu.format(me.tplMain, {
            bodyId : me.getId(),
            bodyClass : me.getClass(),
            bodyInner : me.getId('bodyInner'),
            bodyInnerClass : me.getClass('body-inner'),
            title : me.title === '' ? '' : baidu.format(me.tplTitle, {
                                                    titleId : me.getId('title'),
                                                    titleClass : me.getClass('title'),
                                                    titleInnerId : me.getId('titleInner'),
                                                    titleInnerClass : me.getClass('title-inner'),
                                                    title : me.title
                                                }),
            tableId : me.getId('table'),
            position : me._positionStr,
            tableInnerId : me.getId('tableInner'),
            content : me.direction == 'horizontal' 
                            ? '<tr>' + me._createCell(me.items.length, 'str') + '</tr>' 
                            : me._createCell(me.items.length, 'str')
        });
    },

    /**
     * 绘制toolbar
     * @param {String|HTMLElement}  [container=this.container] toolBar容器.
     * @return void
     */
    render: function(container) {
        var me = this, body;
        me.container = container = baidu.g(container || me.container);

        baidu.insertHTML(me.renderMain(container), 'beforeEnd', me.getString());

        body = baidu.g(me.getId());
        me.width && baidu.setStyle(body, 'width', me.width);
        me.height && baidu.setStyle(body, 'height', me.height);

        //创建item
        me._createItems();
    },

    /**
     * 创建item
     * @private
     * @return void
     */
    _createItems: function() {
        var me = this,
            container = baidu.g(me.getId('tableInner')),
            tdCollection = [];

        baidu.each(container.rows, function(tr,tr_index) {
            baidu.each(tr.cells, function(td,td_index) {
                tdCollection.push(td);
            });
        });

        baidu.each(me.items, function(item,i) {
            me.add(item, tdCollection[i]);
        });
    },

    /**
     * 使用传入config的方式添加ui组件到toolBar
     * @param   {Object}    options ui控件的config参数，格式参照构造函数options.items.
     * @param   {HTMLElement}   [container] ui控件的container,若没有container参数，则会自动根据当前toolbar的显示规则在最后创建container.
     * @return  {baidu.ui} uiInstance 创建好的ui对象.
     */
    add: function(options,container) {
        var me = this,
            uiInstance = null,
            defaultOptions = {
                type: 'button',
                config: {}
            },
            uiNS = null, ns;

        if (!options)
            return;

        /*检查默认参数*/
        baidu.object.merge(options, defaultOptions);
        delete(options.config.statable);
        options.type = options.type.toLowerCase();

        uiNS = baidu.ui.getUI(options.type);
        if(uiNS){
            baidu.object.merge(uiNS,{statable:true},{whiteList: ['statable']});
            uiInstance = new uiNS(options.config);
            me.addRaw(uiInstance, container);
        }

        return uiInstance;
    },

    /**
     * 直接向toolbar中添加已经创建好的uiInstance
     * @param {Object} uiInstance
     * @param {HTMLElement} container
     * @return void.
     */
    addRaw: function(uiInstance,container) {
        var me = this;

        if (!uiInstance)
            return;

        baidu.extend(uiInstance, baidu.ui.Toolbar._itemBehavior);
        uiInstance.setName(uiInstance.name);

        if (!container) {
            container = me._createCell(1, 'html')[0];
        }

        uiInstance.render(container);
        me._itemObject[uiInstance.getName()] = [uiInstance, container.id];
    },

    /**
     * 根据当前toolbar规则，创建tableCell
     * @private
     * @param {Number} num 创建cell的数量.
     * @param {String} [type="str"] str|html.
     * @return {String|HTMLElement} uiInstance的容器.
     */
    _createCell: function(num,type) {
        var me = this,
            td,
            cells = [],
            container,
            containerTR,
            i;
        type == 'str' || (type = 'html');

        if (type == 'str') {
            if (me.direction == 'horizontal') {
                for (i = 0; i < num; i++) {
                    cells.push(baidu.format(me.tplHorizontalCell,{id:me.getId('cell-' + me.cellIndex++ )}));
                }
            }else {
                for (i = 0; i < num; i++) {
                    cells.push(baidu.format(me.tplVerticalCell,{id:me.getId('cell-' + me.cellIndex++ )}));
                }
            }
            cells = cells.join('');
        }else {
            container = baidu.g(me.getId('tableInner'));
            containerTR = container.rows[0];
            if (me.direction == 'horizontal') {
                for (i = 0; i < num; i++) {
                    td = containerTR.insertCell(containerTR.cells.length);
                    td.id = me.getId('cell-' + me.cellIndex++ );
                    td.valign = 'middle';
                    cells.push(td);
                }
            }else {
                for (i = 0; i < num; i++) {
                    td = container.insertRow(container.rows.length);
                    td = td.insertCell(0);
                    td.id = me.getId('cell-' + me.cellIndex++ );
                    td.valign = 'middle';
                    cells.push(td);
                }
            }
        }

        return cells;
    },

    /**
     * 删除toolbar item
     * @param   {String} name 需要删除的控件的标识符.
     * @return void.
     */
    remove: function(name) {
        var me = this, item;
        if (!name) return;
        if (item = me._itemObject[name]) {
            item[0].dispose();
            baidu.dom.remove(item[1]);
            delete(me._itemObject[name]);
        }else{
            baidu.object.each(me._itemObject, function(item, index){
                item[0].remove && item[0].remove(name);
            });
        }
    },

    /**
     * 删除所有ui控件
     * @return void.
     */
    removeAll: function() {
        var me = this;
        baidu.object.each(me._itemObject, function(item,key) {
            item[0].dispose();
            baidu.dom.remove(item[1]);
        });
        me._itemObject = {};
    },

    /**
     * enable ui组件，当不传入name时，enable所有ui组件到
     * @public
     * @param {String} [name] ui组件唯一标识符.
     */
    enable: function(name) {
        var me = this, item;

        if (!name) {
            me.enableAll();
        }else if (item = me._itemObject[name]) {
            item[0].enable();
        }
    },

    /**
     * disable ui组件，当不传入name时，disable所有ui组建
     * @public
     * @param {String} [name] ui组件唯一标识符.
     */
    disable: function(name) {
        var me = this, item;

        if (!name) {
            me.disableAll();
        }else if (item = me._itemObject[name]) {
            item[0].disable();
        }
    },

    /**
     * 激活toolbar中所有的item
     * @return void.
     */
    enableAll: function() {
        var me = this;
        baidu.object.each(me._itemObject, function(item,key) {
            item[0].enable();
        });
    },

    /**
     * 禁用toolbar中所有的item
     * @return void.
     */
    disableAll: function() {
        var me = this;
        baidu.object.each(me._itemObject, function(item,key) {
            item[0].disable();
        });
    },

    /**
     * 通过name获取ui组件
     * @param {String} name ui组件唯一标识符.
     * @return {baidu.ui.Instance} 返回查找到的item.
     */
    getItemByName: function(name) {
        var me = this, item = me._itemObject[name];
        if (!item) {
            baidu.object.each(me._itemObject, function(i,k) {
                i.getItemByName && (item = i.getItemByName(name));
                if (item) {
                    return false;
                }
            });
        }

        return (item ? item[0] : null);
    },

    dispose: function(){
       var me = this;

       me.removeAll();
       me.dispatchEvent("dispose");
       baidu.dom.remove(me.getMain());
       baidu.lang.Class.prototype.dispose.call(me);
    }
});

/**
 * 全局唯一的toolbar_item id 索引
 * 此对象不对外暴露
 * @private
 */
baidu.ui.Toolbar._itemIndex = 0;

/**
 * @event onhighlight
 * 当item被设置为高亮时触发
 */

/**
 * @event oncancelhighlight
 * 当item被取消高亮时触发
 */

baidu.ui.Toolbar._itemBehavior = {

    /**
     * item唯一标识符
     * @private
     */
    _toolbar_item_name: '',

    /**
     * 为ui组创建自己的唯一的标识
     * @param {String} [name] 若传入了name，则使用传入的name为标识符.
     */
    setName: function(name) {
        var me = this;
        if (baidu.lang.isString(name)) {
            me._toolbar_item_name = name;
        }else {
            me._toolbar_item_name = 'tangram_toolbar_item_' + baidu.ui.Toolbar._itemIndex++;
        }

        //TODO:在更新name之后如自身已经被渲染到toolbar中
        //则更新toolbar中自己的名值对
    },

    /**
     * 返回toolbar item的唯一标识
     * @return {String} name.
     */
    getName: function() {
        var me = this;
        return me._toolbar_item_name;
    },

    /**
     * 设置高亮状态
     * @return void.
     */
    setHighLight: function() {
        var me = this;
        me.setState('highlight');
        me.dispatchEvent('onhighlight');
    },

    /**
     * 取消高亮状态
     * @return void.
     */
    cancelHighLight: function() {
        var me = this;
        me.removeState('highlight');
        me.dispatchEvent('oncancelhighlight');
    }
};
/**
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * @private
 * @class Toolbar类
 * @param   {Object}    options config参数.
 * @config  {String}    [name="ToolBar_item_xxx"]   ui控件的唯一标识符.
 * @config  {Object}    [options]   创建ui控件所需要的config参数.
 * @author  lixiaopeng
 */
baidu.ui.Toolbar.Separator = baidu.ui.createUI(function(options) {
}).extend(
    /*
     * @lends baidu.ui.Toolbar.Separator.prototype
     */   
{
    /**
     * statable
     * @private
     */
    statable: false,

    /**
     * uiType
     * @private
     */
    uiType: 'toolbar-separator',

    /**
     * 模板
	 * @private
     */
    tplMain: '<span id="#{id}" class="#{class}" style="display:block"></span>',

    /**
     * 获取HTML字符串
     * @private
     * @return {String} HTMLString.
     */
    getString: function() {
        var me = this;

        return baidu.format(me.tplMain, {
            id : me.getId(),
            'class' : me.getClass()
        });
    },

    /**
     * 绘制控件
     * @private
     * @return void.
     */
    render: function(container) {
        var me = this;
        baidu.dom.insertHTML(me.renderMain(container), 'beforeEnd', me.getString());
    }
});
/**
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */







/**
 * @private
 * @class Spacer类
 * @param   {Object}    options config参数.
 * @config  {String}    [name="ToolBar_item_xxx"]   ui控件的唯一标识符.
 * @config  {Object}    [options]   创建ui控件所需要的config参数.
 * @author  lixiaopeng
 */
baidu.ui.Toolbar.Spacer = baidu.ui.createUI(function(options) {
}).extend(
    
    /*
     * @lends baidu.ui.Toolbar.Spacer.prototype
     */
{
    /**
     * statable
     * @private
     */
    statable: false,

    /**
     * uiType
     * @private
     */
    uiType: 'toolbar-spacer',

    /**
     * 默认宽度
     * @private
     */
    width: '10px',

    /**
     * html 模板
     * @private
     */
    tplBody: '<div #{style} id="#{id}" class="#{class}"></div>',

    /**
     * 获取html字符串
     * @private
     * @return {String} str HTML字符串.
     */
    getString: function() {
        var me = this;
        return baidu.format(me.tplBody, {
            style : 'style="' + (me.height ? 'height:' + me.height : 'width:' + me.width) + '"',
            id : me.getId(),
            'class' : me.getClass()
        });
    },

    /**
     * 绘制item
     * @param {String|HTMLDom} [container=this.container] Item容器.
     * @private
     */
    render: function(container) {
        var me = this;
        baidu.dom.insertHTML(me.renderMain(container), 'beforeEnd', me.getString());
    }
});
/**
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */


















 /**
 * 弹出tip层,类似鼠标划过含title属性元素的效果
 * @class
 * @grammar new baidu.ui.Tooltip(options)
 * @param       {Object}          options         选项.
 * @config      {String|Array}    target          目标元素或元素id。可直接设置多个目标元素
 * @config      {String}          type            （可选）触发展开的类型，可以为:hover和click。默认为click
 * @config      {Element}         contentElement  （可选）Tooltip元素的内部HTMLElement。
 * @config      {String}          content         （可选）Tooltip元素的内部HTML String。若target存在title，则以title为准
 * @config      {String}          width           （可选）宽度
 * @config      {String}          height          （可选）高度
 * @config      {Array|Object}    offset          （可选）偏移量。若为数组，索引0为x方向，索引1为y方向；若为Object，键x为x方向，键y为y方向。单位：px，默认值：[0,0]。
 * @config      {boolean}         single          （可选）是否全局单例。若该值为true，则全局共用唯一的浮起tooltip元素，默认为true。
 * @config      {Number}          zIndex          （可选）浮起tooltip层的z-index值，默认为3000。
 * @config      {String}          positionBy      （可选）浮起tooltip层的位置参考，取值['mouse','element']，分别对应针对鼠标位置或者element元素计算偏移，默认mouse
 * @config      {Element}         positionElement （可选）定位元素，设置此元素且positionBy为element时，根据改元素计算位置
 * @config      {Boolean}         autoRender       是否自动渲染。
 * @config      {Function}        onopen          （可选）打开tooltip时触发。
 * @config      {Function}        onclose         （可选）关闭tooltip时触发。
 * @config      {Function}        onbeforeopen    （可选）打开tooltip前触发。
 * @config      {Function}        onbeforeclose   （可选）关闭tooltip前触发。
 * @plugin      click				支持单击隐藏显示
 * @plugin      close				支持关闭按钮
 * @plugin      fx					动画效果
 * @plugin      hover				支持鼠标滑过隐藏显示
 * @return     {baidu.ui.Tooltip}        Tooltip实例
 */

baidu.ui.Tooltip = baidu.ui.createUI(function(options) {
    
    var me = this;
    me.target = me.getTarget();
    me.offset = options.offset || [0, 0];
    me.positionElement = null;

    baidu.ui.Tooltip.showing[me.guid] = me;

}).extend(
/**
 *  @lends baidu.ui.Tooltip.prototype
 */
{
    uiType: 'tooltip',

    width: '',
    height: '',
    zIndex: 3000,
    currentTarget: null,

    type: 'click',

    posable: true,
    positionBy: 'element',
	offsetPosition: 'bottomright',

    isShowing: false,

    tplBody: '<div id="#{id}" class="#{class}"></div>',

    /**
     * 获取Tooltip的HTML字符串
     * @private
     * @return {String} TooltipHtml
     */
    getString: function() {
		var me = this;
		return baidu.format(me.tplBody, {
			id: me.getId(),
			'class' : me.getClass()
		});
	},

    /**
	 * 开关函数,返回false时不显示
     * @private
     */
	toggle: function() {return true},
    
    /**
     * 渲染Tooltip到HTML
     * @public 
     */
    render: function() {
        var me = this,
            main,title;

        main = me.renderMain();

        baidu.each(me.target, function(t,index){
            if((title = baidu.getAttr(t, 'title')) && title != ''){
                baidu.setAttr(t, 'tangram-tooltip-title', title);
                baidu.setAttr(t, 'title', '');
            }
        });
        baidu.dom.insertHTML(main,"beforeend",me.getString());
        me._update();
        me._close();
        
        me.dispatchEvent('onload');
    },

	/**
	 * 打开tooltip
	 * @public
     * @param {HTMLElement} [target] 显示tooltip所参照的html元素
	 */
	open: function(target) {
		var me = this,
            showTooltip = baidu.ui.Tooltip.showing,
            isSingleton = baidu.ui.Tooltip.isSingleton,
            target = target || me.target[0],
            currentTarget = me.currentTarget,
            body = me.getBody();

         //判断是否为当前打开tooltip的target
         //若是，则直接返回
        if(currentTarget === target) return;
        
        //若target为本组中之一，则关闭当前current
        me.isShowing && me.close(currentTarget);

        //查看当前tooltip全局设置,若为单例，关闭当前打开的tooltip
        if(isSingleton){
            baidu.object.each(showTooltip,function(tooltip,key){
                if(key != me.guid && tooltip.isShowing){
                    tooltip.close(); 
                } 
            });
        }

        //若toggle函数返回false，则直接返回
        if (typeof me.toggle == 'function' && !me.toggle()) return;

        me.currentTarget = target;

        me._updateBodyByTitle();
        me._setPosition();
        me.isShowing = true;
        
        //若onbeforeopen事件返回值为false，则直接返回
        if (me.dispatchEvent('onbeforeopen')){
            me.dispatchEvent('open');
            return;
        }
	},

    _updateBody: function(options){
        var me = this,
            options = options || {},
            body = me.getBody(),
            title;

        if(me.contentElement && me.contentElement !== body.firstChild){
            
            //若存在me.content 并且该content和content里面的firstChild不一样
            body.innerHTML = '';
            body.appendChild(me.contentElement);
            me.contentElement = body.firstChild;
        
        }else if(typeof options.contentElement != 'undefined'){
            
            //若options.content存在，则认为用户向对content进行更新
            body.innerHTML = '';
            options.contentElement != null && body.appendChild(options.contentElement);
        
        }
        
        if(!options.contentElement){
            if(typeof options.content == 'string'){

                //若存在options.contentText，则认为用户相对contentText进行更新
                body.innerHTML = '';
                body.innerHTML = options.content;

            }else if(typeof me.content == 'string' && baidu.dom.children(body).length == 0 ) {
                //第一次new Tooltip时传入contentText，进行渲染
                body.innerHTML = me.content;
            }
        }
    },
	
    _updateBodyByTitle:function(){
        var me = this,
            body = me.getBody(),
            title;
        
        if(!me.contentElement && !me.content && me.currentTarget){
            if((title = baidu.getAttr(me.currentTarget, 'tangram-tooltip-title')) && title != ''){
                body.innerHTML = title;
            }else{
                body.innerHTML = '';
            }
        }

    },

    /**
     * 更新tooltip属性值
     * @private
     * @param {Object} options 属性集合
     */
    _update: function(options){
        var me = this,
            options = options || {},
            main = me.getMain(),
            body = me.getBody();

        me._updateBody(options);
        baidu.object.extend(me, options);
        me.contentElement = baidu.dom.children(body).length > 0 ? body.firstChild : null;
        me._updateBodyByTitle();

        //更新寛高数据
        baidu.dom.setStyles(main, {
            zIndex: me.zIndex,
            width: me.width,
            height: me.height,
            // 防止插件更改display属性,比如fx.
            display: ''
        });
    },
    
    /**
     * 更新options
     * @public
     * @param       {Object}          options         选项.
     * @config      {String|Array}    target          目标元素或元素id。可直接设置多个目标元素
     * @config      {String}          type            （可选）触发展开的类型，可以为:hover和click。默认为click
     * @config      {Element}         contentElement  （可选）Tooltip元素的内部HTMLElement。
     * @config      {String}          content         （可选）Tooltip元素的内部HTML String。若target存在title，则以title为准
     * @config      {String}          width           （可选）宽度
     * @config      {String}          height          （可选）高度
     * @config      {Array|Object}    offset          （可选）偏移量。若为数组，索引0为x方向，索引1为y方向；若为Object，键x为x方向，键y为y方向。单位：px，默认值：[0,0]。
     * @config      {boolean}         single          （可选）是否全局单例。若该值为true，则全局共用唯一的浮起tooltip元素，默认为true。
     * @config      {Number}          zIndex          （可选）浮起tooltip层的z-index值，默认为3000。
     * @config      {String}          positionBy      （可选）浮起tooltip层的位置参考，取值['mouse','element']，分别对应针对鼠标位置或者element元素计算偏移，默认mouse。
     * @config      {Element}         positionElement （可选）定位元素，设置此元素且positionBy为element时，根据改元素计算位置
     * @config      {Boolean}         autoRender       是否自动渲染。
     * @config      {Function}        onopen          （可选）打开tooltip时触发。
     * @config      {Function}        onclose         （可选）关闭tooltip时触发。
     * @config      {Function}        onbeforeopen    （可选）打开tooltip前触发。
     * @config      {Function}        onbeforeclose   （可选）关闭tooltip前触发。
     */
    update: function(options){
        var me = this;
        me._update(options);
        me._setPosition();
        me.dispatchEvent('onupdate');
    },

    /**
     * 设置position
     * @private
     */
	_setPosition: function() {
		var me = this,
            insideScreen = typeof me.insideScreen == 'string' ? me.insideScreen : 'surround',
			positionOptions = {
				once: true,
				offset: me.offset,
				position: me.offsetPosition,
				insideScreen: insideScreen 
			};
		switch (me.positionBy) {
			case 'element':
				me.setPositionByElement(me.positionElement || me.currentTarget, me.getMain(), positionOptions);
				break;
			case 'mouse':
				me.setPositionByMouse(me.getMain(), positionOptions);
				break;
			default :
				break;
		}
	},

	/**
	 * 关闭tooltip
	 * @public
	 */
	close: function() {
		var me = this;

        if(!me.isShowing) return;
        
        me.isShowing = false;
        if(me.dispatchEvent('onbeforeclose')){
            me._close();
            me.dispatchEvent('onclose');
        }
        me.currentTarget = null;
    },


    _close: function() {
        var me = this;
                
        me.getMain().style.left = '-100000px';
    },
	/**
	 * 销毁控件
	 * @public
	 */
	dispose: function() {
		var me = this;
		me.dispatchEvent('ondispose');
		if (me.getMain()) {
			baidu.dom.remove(me.getMain());
		}
        delete(baidu.ui.Tooltip.showing[me.guid]);
		baidu.lang.Class.prototype.dispose.call(me);
	},
    /**
     * 获取target元素
	 * @private
	 */
    getTarget: function() {
        var me = this,
            target = [];
            
        baidu.each(baidu.lang.toArray(me.target),function(item){
            target.push(baidu.G(item));
        });

        return target;
    }
});

baidu.ui.Tooltip.isSingleton = false;
baidu.ui.Tooltip.showing = {};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */














/**
 * 支持单击隐藏显示Tooltip
 * @name  baidu.ui.Tooltip.Tooltip$click
 * @addon baidu.ui.Tooltip
 */
baidu.ui.Tooltip.register(function(me) {
    
    if (me.type == 'click') {

        //onload时绑定显示方法
        me.addEventListener("onload",function(){
            baidu.each(me.target,function(target){
                baidu.on(target, 'click', showFn); 
            });
        });

        //dispose时接触事件绑定
        me.addEventListener("ondispose",function(){
            baidu.each(me.target,function(target){
                baidu.un(target, 'click', showFn); 
            });

            baidu.un(document, 'click', hideFn);
        });

        //tooltip打开时，绑定和解除方法
        me.addEventListener('onopen', function(){
            baidu.un(me.currentTarget, 'click', showFn);
            baidu.on(me.currentTarget, 'click', hideFn);
            baidu.on(document, 'click', hideFn);
        });

        //tooltip隐藏时，绑定和解除方法
        me.addEventListener('onclose', function(){
            
            baidu.on(me.currentTarget, 'click', showFn);
            baidu.un(me.currentTarget, 'click', hideFn);
            baidu.un(document, 'click', hideFn);

        });

        //显示tooltip
        function showFn(e){
            me.open(this);
            
            //停止默认事件及事件传播
            baidu.event.stop(e || window.event);
        }

        //隐藏tooltip
        function hideFn(e){
            var target = baidu.event.getTarget(e || window.event),
                judge = function(el){
                    return me.getBody() == el;
                };
            if(judge(target) || baidu.dom.getAncestorBy(target, judge) || baidu.ui.get(target) == me){
                return;
            }

            me.close();
            //停止默认事件及事件传播
            baidu.event.stop(e || window.event);
        }
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */






/**
 * 创建关闭按钮
 * @param {String} headContent  内容
 * @name  baidu.ui.Tooltip.Tooltip$close
 * @addon baidu.ui.Tooltip
 */
baidu.ui.Tooltip.extend({
    headContent: '',
    tplhead: '<div class="#{headClass}" id="#{id}">#{headContent}</div>'
});

baidu.ui.Tooltip.register(function(me) {
    me.addEventListener('onload', function() {
        var me = this,
            button;
        
        baidu.dom.insertHTML(me.getBody(), 'afterBegin', baidu.format(me.tplhead, {
            headClass: me.getClass('head'),
            id: me.getId('head')
        }));

        button = new baidu.ui.Button({
            content: me.headContent,
            onclick: function(){
                me.close();
            }
        });
        button.render(me.getId('head'));
    });
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */







/**
 * 为Tooltip添加动画效果支持
 * @name  baidu.ui.Tooltip.Tooltip$fx
 * @addon baidu.ui.Tooltip
 */

baidu.ui.Tooltip.extend({
	//是否使用效果,默认开启
	enableFx: true,
	//显示效果,默认是fadeIn
	showFx: baidu.fx.fadeIn,
	showFxOptions: {duration: 500},
	//消失效果,默认是fadeOut
	hideFx: baidu.fx.fadeOut,
	hideFxOptions: {duration: 500}
});


baidu.ui.Tooltip.register(function(me) {
	if (me.enableFx) {
	
        var fxHandle = null;

        //TODO:fx目前不支持事件队列，此处打补丁解决
        //等fx升级后更新
        me.addEventListener('beforeopen', function(e) {
	        me.dispatchEvent('onopen');
            'function' == typeof me.showFx && me.showFx(me.getMain(), me.showFxOptions);
            e.returnValue = false;
	    });
		
        me.addEventListener('beforeclose', function(e) {
	        me.dispatchEvent('onclose');
            
            fxHandle = me.hideFx(me.getMain(), me.hideFxOptions);
            fxHandle.addEventListener('onafterfinish', function() {
	              me._close();
	        });
	        e.returnValue = false;
		});

        me.addEventListener('ondispose', function(){
            fxHandle && fxHandle.end(); 
        });
	}
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */










/**
 * 支持鼠标滑过隐藏显示
 * @name  baidu.ui.Tooltip.Tooltip$hover
 * @addon baidu.ui.Tooltip
 */
baidu.ui.Tooltip.extend({
    hideDelay: 500
});

baidu.ui.Tooltip.register(function(me) {
    
    if (me.type != 'hover') {return;}//断言句式

    var hideHandle = null,
        mouseInContainer = false;//用标识鼠标是否落在Tooltip容器内

    //onload时绑定显示方法
    me.addEventListener("onload", function(){
        baidu.each(me.target,function(target){
            me.on(target, 'mouseenter', showFn);
            me.on(target, 'mouseleave', hideFn);
        });
        me.on(me.getBody(), 'mouseover', setMouseInContainer);
        me.on(me.getBody(), 'mouseout', setMouseInContainer);
    });
    
    //用于设置鼠标在移入和移出Tooltip-body时标识状态
    function setMouseInContainer(evt){
        mouseInContainer = (evt.type.toLowerCase() == 'mouseover');
        !mouseInContainer && hideFn(evt);
    }
    
    //显示tooltip
    function showFn(e){
        hideHandle && clearTimeout(hideHandle);
        me.open(this);
    }

    //隐藏tooltip
    function hideFn(e){
        hideHandle = setTimeout(function(){
            !mouseInContainer && me.close();
        }, me.hideDelay);
    }
});

/**
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * path: ui/tree/Tree.js
 * author: fx
 * version: 1.0.0
 * date: 2010-10-27
 */



















/**
 * Tree：管理和操作TreeNode
 * @name baidu.ui.Tree
 * @class
 * @grammar new baidu.ui.Tree(options)
 * @param {Object} options
 * @config {Object} data 节点数据集合 {text: "", children: [{text: ""},{text: ""}]}
 * @config {Boolean} expandable  是否改变trunk的状态到leaf,当一个trunk的子节点数为0时，如果为true,那么就变为leaf的状态，否则就不会变
 * @config {Function} onclick  节点被点击后触发。
 * @config {Function} ontoggle  节点被展开或收起后触发。
 * @config {Function} onload  Tree渲染后触发。
 */

//  _rootNode : 根节点,默认值为null,
// _currentNode : 当前节点，默认值为null

baidu.ui.Tree = baidu.ui.createUI(function(options) {
    //树的所有节点的集合 树的ID与实例的键值对
    this._treeNodes = {};
});

//TreeNode类 

//此类做了以下优化。
//1. TreeNode通过字符串拼装HTML来代替模板format,因为多次使用
//   format是非常耗性能的。
//2. 弃用了baidu.ui.createUI的方法，在多次使用createUI有性能瓶颈。
//3. 增加了分步渲染机制。
//4. 优化了_getId,_getClass,_getCallRef等调用次数较多的方法。
//5. 减少函数调用的次数。比如_getId(),在初始化时，是通过字符串拼接来实现，因为一个函数多次调用
//   也对性能有影响。
//6. 用数组push再join代替字符串拼装。
//   如果字符串的叠加次数小于3至5，建议还是用字符串叠加，因为多次实例化一个Array，并且再join(''),
//   也挺消耗性能的。
//7. 去掉了不必要的HTML与样式，这些都会耗损渲染性能。

/**
 * 树节点类TreeNode
 * @name baidu.ui.Tree.TreeNode
 * @class
 * @grammar new baidu.ui.Tree.TreeNode(options)
 * @param {Object} options
 * @config {Boolean} isExpand  是否是展开, 默认值为false
 * @config {Array} children 子节点options数组  默认值为null
 * @config {Boolean} isRoot  是否是根节点,默认值为false
 * @config {Boolean} type  节点类型 trunk|leaf, 默认值为'leaf'
 * @config {String} id  节点的唯一标识ID。默认为null
 * @config {String} text  节点显示名称. 默认值为null
 * @config {String} href 节点的链接href. 默认值为null
 * @config {String} target 节点链接的target,有href的时候才生效。默认值为null
 * @config {String} icon 节点图标的路径. 默认值为null
 * @config {String} skin 节点样式选择符. 默认值为null
 * @config {Boolean} isToggle 是否支持节点展开或收起 默认值为true
 */
baidu.ui.Tree.TreeNode = function(options) {
    var me = this;
    baidu.object.extend(me, options);
    //这里只所以需要判断是因为_getId()的实现已经调用到了me.id,而me.id是对外开放的属性。
    me.id = me.id || baidu.lang.guid();
    me.childNodes = [];
    me._children = [];
    window['$BAIDU$']._instances[me.id] = me;
    me._tree = {};
    me._stringArray = [];
    
};



baidu.ui.Tree.TreeNode.prototype =  
/**
 * @lends baidu.ui.Tree.TreeNode.prototype
 */
{
    //ui控件的类型 **必须**
    uiType: 'tree-node',
    //节点的文本属性
    text: '' ,
    //节点类型：root trunk leaf
    type: 'leaf',
    //是否支持toggle
    isToggle: true,
    /**
     * 用来为HTML元素的ID属性生成唯一值。
     * @param {String} key
     * @return {String} id.
     * @private
     */
    _getId: function(key) {
       return this.id + '-' +key;
    },
    /**
     * 用来为HTML元素的class属性生成唯一值。
     * @param {String} key
     * @return {String} class.
     * @private
     */
    _getClass: function(key) {
        var me = this,
            className = 'tangram-tree-node-' + key;
        if( me.skin){
            className += ' '+me.skin+'-'+key;
        }
        return className;
    },
    /**
     * 生成当前实例所对应的字符串
     * @return {String} stringRef.
     * @private
     */
    _getCallRef: function() {
        return "window['$BAIDU$']._instances['" + this.id + "']";
    },
    /**
     * @private
     * 获得TreeNode dom的html string
     * @return {String} htmlstring.
     */
    getString: function() {
        var me = this,
            stringArray = me._stringArray,
            style='';
        stringArray.push('<dl id="',me.id,'">');
        me._createBodyStringArray();
        style = me.isExpand ? "display:''" : 'display:none';
        stringArray.push('<dd  style="'+style+'" id="',me.id,'-subNodeId"></dd></dl>');
        return stringArray.join('');
    },
    /**
     * 取得节点的父节点
     * @return {TreeNode} treeNode.
     */
    getParentNode: function() {
        return this.parentNode;
    },
    /**
     * 设置节点的父节点
     * @param {TreeNode} treeNode
     */
    setParentNode: function(parentNode) {
        var me = this;
        me.parentNode = parentNode;
        me._level = parentNode._level + 1;
    },
    /**
     * 取得节点的子节点数组
     * @return {Array} treeNodes.
     */
    getChildNodes: function() {
        return this.childNodes;
    },
    /**
     * 设置节点的对应的Tree
     * @param {Tree} tree
     */
    setTree: function(tree) {
        var me = this;
        me._tree = tree;
        me._tree._treeNodes[me.id] = me;
    },
    /**
     * 取得节点的对应的Tree
     * @return {Tree} tree.
     */
    getTree: function() {
        return this._tree;
    },
    /**
     * 增加一组children数据。数据格式:[{text:"",href:"",children:[{text:"",href:""}
     * ,{text:"",href:""}]},{text:""},{text:""}]
     * 可以数组里面嵌套数组
     * @param {Array} array
     */
    appendData: function(childrenData) {
        var me = this;
        baidu.dom.insertHTML(me._getSubNodesContainer(), 'beforeEnd'
        , me._getSubNodeString(childrenData));
        me._isRenderChildren = true;
    },
    /**
     * 取得所有子节点返回的HTMLString
     * @param {Array } array
     * @return {String} string.
     * @private
     */
    _getSubNodeString: function(childrenData) {
        var me = this,
            treeNode,
            len,
            stringArray = [],
            ii = 0,
            item,
            len = childrenData.length;
        for (; ii < len; ii++) {
            item = childrenData[ii];
            treeNode = new baidu.ui.Tree.TreeNode(item);
            if (ii == (len - 1)) {
                treeNode._isLast = true;
            }
            me._appendChildData(treeNode, len - 1);
            stringArray.push(treeNode.getString());
        }
        return stringArray.join('');
    },

    /**
     * 递归判断本节点是否是传进来treeNode的父节点
     * @param {TreeNode} treeNode 节点.
     */
    isParent: function(treeNode) {
        var me = this,
            parent = treeNode;
        while (!parent.isRoot && (parent = parent.getParentNode()) ) {
            if (parent == me) {
                return true;
            }
        }
        return false;
    },
    /**
     * 将已有节点添加到目标节点中，成为这个目标节点的子节点。
     * @param {TreeNode} parentNode 节点对象
     */
    appendTo: function(parentNode) {
        var me = this;
        me.getParentNode()._removeChildData(me);
        parentNode.appendChild(me);
        me.dispatchEvent('appendto');
    },
    /**
     * 将此节点移动至一个目标节点,成为这个目标节点的next节点
     * @param {TreeNode}  treeNode 移动至目标节点
     */
    moveTo: function(treeNode) {
        var me = this,
            oldParent = me.getParentNode(),
            newParent,
            index;
        if (oldParent == null) {
            return false;
        }
        //当treeNode是展开并且treeNode有子节点的时候。
        if (treeNode.isExpand && treeNode.getChildNodes().length > 0) {
            newParent = treeNode;
        }
        else {
            newParent = treeNode.getParentNode();
        }
        oldParent._removeChildData(me);
        index = (newParent == treeNode) ? -1 : treeNode.getIndex();
        newParent.appendChild(me, index);
        me.dispatchEvent('moveto');
    },
    /**
     * 新增一个子节点 只是单一的管理数据结构，没有渲染元素的职责。
     * @param {TreeNode} treeNode 需要加入的节点.
     * @param {TreeNode} index 索引，用来定位将节点加到索引对应的节点下.
     * @param {Boolean} isDynamic 是否是动态新增 用来区分动态新增节点和初始化json。
     * 初始化的json里面的children是有数据的，而动态新增节点的children是需要手动加的，
     * 所以如果初始化json就不需要对children进行维护，反之亦然.
     * @private
     */
    _appendChildData: function(treeNode,index,isDynamic) {
        var me = this,
            nodes = me.getChildNodes();
        treeNode.parentNode = me;
        treeNode.setTree(me.getTree());

        if (isDynamic) {
            nodes.splice(index+1 , 0, treeNode);
            //me.children = me.children || [];
            me._children.splice(index+1 , 0, treeNode.json);
        }
        else {
            nodes.push(treeNode);
            me._children.push(treeNode.json);
            //me.children.push(treeNode.json);
        }
    },

    /**
     * 新增一个子节点，1.先判断子节点是否被渲染过，如果渲染过，就将子节点append到自己subNodes容器里，否则就inertHTML的子节点的getString，2.对parentNode与childNodes进行变更， 3.更新treeNode与tree的update。
     * @param  {TreeNode}  treeNode 需要加入的节点(分为已经渲染的节点和为被渲染的节点)，通过treeNode._getContainer()返回值来判断是否被渲染.
     * @param  {Number}  index 此节点做为 节点集合的[index+1]的值
     * @return {TreeNode} treeNode 返回被新增的child
    */
    appendChild: function(treeNode,index) {
        var me = this,
            oldParent,
            string,
            childNodes,
            treeNodeContainer = treeNode._getContainer(),
            subNodeContainer = me._getSubNodesContainer();
        if (index == null) {
            index = me.getChildNodes().length - 1;
        }
        me._appendChildData(treeNode, index, true);
        childNodes = me.getChildNodes();
        oldParent = treeNode.getParentNode();
        string = treeNode.getString();
        //如果是已经被渲染过的节点
        if (treeNodeContainer) {
            //当本节点为展开的trunk节点
            if (index == -1) {
                //当本节点在treeNode加入之前的childNode的length为0时
                if (childNodes.length == 1) {
                    subNodeContainer.appendChild(treeNodeContainer);
                }
                else {
                    baidu.dom.insertBefore(treeNodeContainer, childNodes[1]._getContainer());
                }
            }
            else {
                baidu.dom.insertAfter(treeNodeContainer, childNodes[index]._getContainer());
            }
        }
        else {
            //console.log('-----appendData--------'+index);
            //当本节点为展开的trunk节点
            if (index == -1) {
                //当本节点在treeNode加入之前的childNode的length为0时
                if (childNodes.length == 1) {
                    baidu.dom.insertHTML(subNodeContainer, 'beforeEnd', string);
                }
                else {
                    baidu.dom.insertHTML(childNodes[1]._getContainer(), 'beforeBegin', string);
                }
            }
            else {
                baidu.dom.insertHTML(childNodes[index]._getContainer(), 'afterEnd', string);
            }
        }
        treeNode._updateAll();
        treeNode._updateOldParent(oldParent);
        if (me.type == 'leaf') {
            me.type = 'trunk';
            me._getIconElement().className = me._getClass('trunk');
        }
        me._getSpanElement().innerHTML = me._getImagesString();
        return treeNode;
    },
    /**
     * @private
     * @param {TreeNode} oldParentNode 节点之前的父节点
     * 修改节点原来父节点的状态.
     */
    _updateOldParent: function(oldParent) {
        var me = this;
        if (!oldParent) {
            return false;
        }
        if (oldParent.getLastChild()) {
            oldParent.getLastChild()._update();
        }
        else {
            if (me.getTree().expandable) {
                oldParent._getIconElement().className = me._getClass('leaf');
                oldParent.type = 'leaf';
            }
            oldParent._update();
        }
    },
    /**
     * 内部方法
     * @private
     * 只删除此节点的数据结构关系，而不删除dom元素对象。这个方法被用于appendTo
     * @param {TreeNode} treeNode
     * @param {Boolean} recursion  如果为true,那么就递归删除子节点
     * 主要是在将有子节点的节点做排序的时候会用到。.
     */
    _removeChildData: function(treeNode,recursion) {
        var me = this;
        baidu.array.remove(me._children, treeNode.json);
        baidu.array.remove(me.childNodes, treeNode);
        delete me.getTree().getTreeNodes()[treeNode.id];
        if (recursion) {
            while (treeNode.childNodes[0]) {
                treeNode._removeChildData(treeNode.childNodes[0]);
            }
        }
    },
    /**
     * 批量删除一个节点下的所有子节点
    */
    removeAllChildren: function() {
        var me = this,
            childNodes = me.getChildNodes();
        while (childNodes[0]) {
            me.removeChild(childNodes[0], true);
        }
    },
    /**
    *删除一个子节点
    *1.删除此节点对象的数据结构
    *2.删除此节点所对应的dom元素对象
    *@param {TreeNode} treeNode
    */
    removeChild: function(treeNode) {
        if (treeNode.getParentNode() == null) {
            return false;
        }
        var me = this,
            nodes = me.getChildNodes();
        me._removeChildData(treeNode, true);
        delete me.getTree().getTreeNodes()[treeNode.id];
        baidu.dom.remove(treeNode._getContainer());
        me.getTree().setCurrentNode(null);
        if (nodes.length <= 0 && !me.isRoot) {
            me._getSubNodesContainer().style.display = 'none';
            if (me.getTree().expandable) {
                me._getIconElement().className = me._getClass('leaf');
                me.type = 'leaf';
            }
        }
        me._updateAll();
    },
   /**
    * 除了更新节点的缩进图标状态外，还更新privious的状态
    * @private
    */
    _updateAll: function() {
        var me = this,
            previous = me.getPrevious();
        previous && previous._update();
        me._update();
    },
   /**
    * 更新节点的缩进，以及图标状态
    * @private
    */
    _update: function() {
        var me = this;
        me._getSpanElement().innerHTML = me._getImagesString();
        baidu.array.each(me.childNodes, function(item) {
            item._update();
        });
    },
    /**
    *更新节点的一系列属性
    *1.如有text,就更新text.
    *2.如有icon
    *@param {Object} options
    */
    update: function(options) {
        var me = this,
            hrefElement = me._getHrefElement(),
            textElement = me._getTextElement();
        baidu.extend(me, options);
        (hrefElement ? hrefElement : textElement).innerHTML = me.text;
    },
   /**
    * 切换toggle状态
    * @param {String} "block" or "none"
    * @param {String} "Lminus" or "Lplus"
    * @param {String} "Tminus" or "Tplus"
    * @param {Boolean} true or false
    * @private
    */
    _switchToggleState: function(display,lastClassName,className,flag) {
        var me = this,
            toggleElement = me._getToggleElement();
        if (me.type == 'leaf') {
            return false;
        }
        me.isExpand = flag;
        if (toggleElement) {
            toggleElement.className = me._getClass(me.isLastNode() ? lastClassName : className);
        }
        if (me.getChildNodes() && me.getChildNodes().length > 0) {
            me._getSubNodesContainer().style.display = display;
        }
    },
    /**
     * 展开节点
     * 分步渲染。第一次expand会渲染节点
     */
    expand: function() {
        var me = this;
        if (!me._isRenderChildren) {
            me.appendData(me.children);
        }
        me._switchToggleState('block', 'Lminus', 'Tminus', true);
    },
   /**
    * 收起节点
    */
    collapse: function() {
        this._switchToggleState('none', 'Lplus', 'Tplus', false);
    },
    /**
     * 切换，收起或者展开
     */
    toggle: function() {
        var me = this;
        if (me.type == 'leaf') {
            return false;
        }
        me.isExpand ? me.collapse() : me.expand();
    },

    /**
     * 切换focus的状态
     * @param {String className} className
     * @param {Bollean flag} flag
     * @param {String methodName} 方法名.
     * @private
     */
    _switchFocusState: function(className,flag,methodName) {
        var me = this;
        baidu.dom[methodName](me._getNodeElement() , me._getClass('current'));
        if (me.type != 'leaf') {
            me._getIconElement().className = me._getClass(className);
            me.isOpen = flag;
        }
    },
    /**
     * 失去焦点,让当前节点取消高亮。
     */
    blur: function() {
        var me = this;
        me._switchFocusState('trunk', false, 'removeClass');
        me.getTree().setCurrentNode(null);
    },
   /**
    * 取得焦点,并且让当前节点高亮，让上一节点取消高亮。
    */
    focus: function() {
        var me = this,
            oldNode = me.getTree().getCurrentNode();
        if (oldNode != null) {
            oldNode.blur();
        }
        me._switchFocusState('open-trunk', true, 'addClass');
        me.getTree().setCurrentNode(me);
        baidu.dom.removeClass(me._getNodeElement(), me._getClass('over'));
    },
    /**
     * 鼠标放上去的效果
     * @private
     */
    _onMouseOver: function(event) {
        var me = this;
        if (me != me.getTree().getCurrentNode()) {
            baidu.dom.addClass(me._getNodeElement(), me._getClass('over'));
        }
        me.dispatchEvent('draghover', {event: event});
        me.dispatchEvent('sorthover', {event: event});
    },
    /**
     * 鼠标离开的效果
     * @private
     */
    _onMouseOut: function() {
        var me = this;
        baidu.dom.removeClass(me._getNodeElement(), me._getClass('over'));
        me.getTree().dispatchEvent('mouseout', {treeNode: me});
    },
   /**
    * 点击节点时候的效果
    * @private
    */
    _onClick: function(eve) {
        var me = this;
        me.focus();
        me.getTree().dispatchEvent('click', {treeNode: me});
    },
   /**
    * mousedown节点时候的效果
    * @private
    */
    _onMouseDown: function(event) {
        var me = this;
        me.dispatchEvent('dragdown', {event: event});
    },
    
   /**
    * 当鼠标双击节点时的效果
    * @private
    */
    _onDblClick: function(event) {
        var me = this;
        me.focus();
        me.isToggle && me.toggle();
        me.getTree().dispatchEvent('dblclick', {
            treeNode: me,
            event: event
        });
    },
   /**
    * 当鼠标右击节点时的效果\
    * @private
    */
    _onContextmenu: function(event) {
        var me = this;
        return me.getTree().dispatchEvent('contextmenu', {
            treeNode: me,
            event: event
        });

    },
   /**
    * 点击toggle图标时候的效果
    * @private
    */
    _onToggleClick: function(event) {
        var me = this;
        me.isToggle && me.toggle();
        me.getTree().dispatchEvent('toggle', {treeNode: me});
        baidu.event.stopPropagation(event);
    },
    /**
     * 获得TreeNode  body的html string
     * @return {String} htmlstring.
     * @private
     */
    _createBodyStringArray: function() {
        var me = this,
            stringArray = me._stringArray;
        stringArray.push('<dt id="',me.id,'-node" class="tangram-tree-node-node"');
        if(me.skin){
            stringArray.push(' ',me.skin,'-node');
        }
        stringArray.push(' onclick="',me._getCallRef() + ('._onClick(event)'),'"> <span id="',
            me.id,'-span">',me._getImagesString(true),'</span>');
        me._createIconStringArray();
        me._createTextStringArray();
        stringArray.push('</dt>');
    },
    /**
     * 获得TreeNode  Images的html string
     * @param {Array} stringArray.
     * @param {isInit} 是否是初始化节点.
     * @return {Array} stringArray.
     * @private
     */
    _getImagesString: function(isInit) {
        var me = this,
            string = '';
        string += me._getIdentString(isInit);
        if (me.type == 'leaf') {
            string += me._getTLString(isInit);
        }
        else if (me.type == 'trunk') {
            if (me.children && me.children.length > 0) {
                string += me._getToggleString(isInit);
            } else {
                string += me._getTLString(isInit);
            }
        }
        return string;
    },
    /**
     * 获得TreeNode 缩进线条的String
     * @param {isInit} 是否是初始化节点.
     * @return {string} htmlstring.
     * @private
     */
    _getIdentString: function(isInit) {
        var me = this,
            string = '',
            prifix,
            className;
        while (me.getParentNode() && me.getParentNode().type != 'root') {
            me = me.getParentNode();
            prifix =( me.isLastNode(isInit) ? 'blank' : 'I');
            className = 'tangram-tree-node-' + prifix;
            if(me.skin){
                className += ' '+me.skin+ '-'+prifix;
            }
            string = '<span   class="'+className+'"></span>' + string;
        }
        return string;
    },
    /**
     * 获得TreeNode T线条或者L线条的String
     * @param {Array} stringArray.
     * @param {isInit} 是否是初始化节点.
     * @private
     */
    _getTLString: function(isInit) {
        var me = this,
            prifix = (me.isLastNode(isInit) ? 'L' : 'T');
            className = 'tangram-tree-node-' + prifix;
        if(me.skin){
            className += ' '+me.skin+'-'+prifix; 
        }
        return '<span   class="' + className + '" ></span>';
    },
    /**
     * 组建TreeNode  Toggle string
     * @param {Array} stringArray.
     * @param {isInit} 是否是初始化节点.
     * @private
     */
    _getToggleString: function(isInit) {
        var me = this,
            type = me.isExpand ? 'minus' : 'plus',
            prifix =  (me.isLastNode(isInit) ? 'L' : 'T') + type,
            className = 'tangram-tree-node-' + prifix;
        if(me.skin){
            className += ' '+me.skin+'-'+prifix;
        }
        return ['<span onclick="', me._getCallRef(),
                '._onToggleClick(event)" class="',className,
                '" id="',me.id,'-toggle"></span>'].join('');
    },
    /**
     * 组建TreeNode  Toggle string
     * @private
     */
    _createIconStringArray: function() {
        var me = this,
            className = (me.type == 'leaf' ? 'leaf' : 'trunk'),
            stringArray = me._stringArray;
        if (me.isOpen) {
            className = 'open-trunk';
        }
        stringArray.push('<span  class="tangram-tree-node-',className);
        if(me.skin) {
            stringArray.push(' ',me.skin,'-',className);
        }
        stringArray.push('" style="',me.icon ? 'background-image:url(' + me.icon + ')' : '',
            '" id="', me.id,'-icon"></span>');
    },
    /**
     * 获得TreeNode  text string
     * @return {String} htmlstring.
     * @private
     */
    _createTextStringArray: function() {

        var me = this,
            text = (me.href ? me._createHrefStringArray() : me.text),
            stringArray = me._stringArray;
        stringArray.push('<span title="',me.title || me.text,'" id="',
            me.id,'-text" >',text,'</span></span>');
    },
    /**
     * 获得TreeNode  href string
     * @return {String} htmlstring.
     * @private
     */
    _createHrefStringArray: function() {
        var me = this,
            stringArray = me._stringArray;
        stringArray.push('<a id="',me.id,'-link',
            (me.target ? "target='" + me.target + "'" : ''),' hidefocus="on" " href="',
            me.href,'" >',me.text,'</a>');
    },
    /**
     * 取得图标(线或者blank)的容器
     * @return {HTMLObject} span.
     * @private
     */
    _getSpanElement: function() {
        return baidu.g(this._getId('span'));
    },
    /**
     * 取得节点图标的HTMLObject
     * @return {HTMLObject}
     * @private
     */
    _getIconElement: function() {
        return baidu.g(this._getId('icon'));
    },
    /**
     * 取得文本父容器的HTMLObject
     * @return {HTMLObject}
     * @private
     */
    _getTextContainer: function() {
        return baidu.g(this._getId('textContainer'));
    },
    /**
     * 取得文本容器的HTMLObject
     * @return {HTMLObject}
     * @private
     */
    _getTextElement: function() {
        return baidu.g(this._getId('text'));
    },
    /**
     * 取得切换展开或收起的image HTMLObject
     * @return {HTMLObject}
     * @private
     */
    _getToggleElement: function() {
        return baidu.g(this._getId('toggle'));
    },
    /**
     * 取得装子节点的父容器 HTMLObject
     * @return {HTMLObject}
     * @private
     */
    _getSubNodesContainer: function() {
        return baidu.g(this._getId('subNodeId'));
    },
    /**
     * 取得href的容器 HTMLObject
     * @return {HTMLObject}
     * @private
     */
    _getHrefElement: function() {
        return baidu.g(this._getId('link'));
    },
    /**
     * 取得node(不包括子节点)的 HTMLObject
     * @return {HTMLObject}
     * @private
     */
    _getNodeElement: function() {
        return baidu.g(this._getId('node'));
    },
    /**
     * 取得node(包括子节点的dom)的容器 HTMLObject
     * @return {HTMLObject}
     * @private
     */
    _getContainer: function() {
        return baidu.g(this.id);
    },
    /**
     * 隐藏节点，但不包括它的子节点。
     */
    hide: function() {
        baidu.dom.hide(this._getNodeElement());
    },
    /**
     * 显示节点。
     */
    show: function() {
        baidu.dom.show(this._getNodeElement());
    },
    /**
     * 递归展开所有子节点
     */
    expandAll: function() {
        var me = this;
        if(me.children) {
            me.expand();
        }
        baidu.array.each(me.getChildNodes(), function(item) {
            item.expandAll();
        });
    },
    /**
     * 递归收起所有子节点
     */
    collapseAll: function() {
        var me = this;
        if (me.getChildNodes().length > 0) {
            me.collapse();
        }
        baidu.array.each(me.getChildNodes(), function(item) {
            item.collapseAll();
        });
    },
    /**
     * 取得本节点所对应父节点的索引
     * @return {int} index.
     */
    getIndex: function() {
        var me = this,
            nodes = me.isRoot ? [] : me.getParentNode().getChildNodes(),
            index = -1;
        for (var i = 0, len = nodes.length; i < len; i++) {
            if (nodes[i] == me) {
                return i;
            }
        }
        return index;
    },
    /**
     * 取得本节点的下一个节点
     * 如果没有就返回自己
     * @return {TreeNode} next.
     */
    getNext: function() {
        var me = this, 
            index = me.getIndex(),
            nodes;
        if(me.isRoot) {
            return me;
        }
        nodes = me.getParentNode().getChildNodes();
        return (index + 1 >= nodes.length) ? me : nodes[index + 1];
    },
    /**
     * 取得本节点的上一个节点
     * 如果没有就返回自己
     * @return {TreeNode} previous.
     */
    getPrevious: function() {
        var me = this, 
            index = me.getIndex(),
            nodes ;
        if(me.isRoot) {
            return me;
        }
        nodes = me.getParentNode().getChildNodes();
        return (index - 1 < 0) ? me : nodes[index - 1];
    },
    /**
     * 取得本节点的第一个子节点
     * 如果没有就返回null
     * @return {TreeNode} previous.
     */
    getFirstChild: function() {
        var me = this,
            nodes = me.getChildNodes();
        return (nodes.length <= 0) ? null : nodes[0];
    },
    /**
     * 取得本节点的最后一个子节点
     * 如果没有就返回null
     * @return {TreeNode} previous.
     */
    getLastChild: function() {
        var me = this,
            nodes = me.getChildNodes();
        return nodes.length <= 0 ? null : nodes[nodes.length - 1];
    },
    /**
     * 是否是最后一个节点
     * 在初始渲染节点的时候，自己维护了一个_isLast,就不用去动态算是否是最后一个子节点。
     * 而在动态新增，删除节点时，动态的处理是否是最后一个节点能方便代码实现，
     * 这样做的目的既能保证初始化时的性能，也能够方便动态功能的实现。.
     * @return {Boolean} true | false.
     */
     //isInit不作为参数做文档描述，是一个内部参数。
    isLastNode: function(isInit) {
        var me = this;
        if (isInit) {
            return me._isLast;
        }
        if(me.isRoot) {
            return true;
        }
            
        return me.getIndex() == (me.parentNode.childNodes.length - 1);
    }
    

};

baidu.object.extend(baidu.ui.Tree.TreeNode.prototype, baidu.lang.Class.prototype);

baidu.ui.Tree.extend(
    /**
     *  @lends baidu.ui.Tree.prototype
     */
    {
    //ui类型
    uiType: 'tree',
    //模板
    tplDOM: "<div class='#{class}'>#{body}</div>",
    /**
     * 取得html string
	 * @private
     * @return tree的htmlstring,
     */
    getString: function() {
        var me = this;
        return baidu.format(me.tplDOM, {
            'class' : me.getClass(),
            body: me._getBodyString()
        });
    },
    /**
     * 渲染树
     * @param {HTMLElement|String} main
     */
    render: function(main) {
        var me = this;
        me.renderMain(main).innerHTML = me.getString();
        me.dispatchEvent('onload');
    },
    /**
     * 内部方法,取得树的HTML的内容
     * @return {String} string.
     * @private
     */
    _getBodyString: function() {
        var string = '',
            me = this;
        if (me.data) {
            me._rootNode = new baidu.ui.Tree.TreeNode(me.data);
            me._rootNode.isRoot = true;
            me._rootNode.type = 'root';
            me._rootNode._level = 0;
            me._rootNode.setTree(me);
            //初始化树形结构
            string = me._rootNode.getString();
        }
        return string;
        
    },
    /**
     * 取得树的节点的集合map,treeNode的id与treeNode的键值对。
     * @return {Object} map.
     */
    getTreeNodes: function() {
        return this._treeNodes;
    },
    /**
     * 取得树的最根节点
     * @return {TreeNode} treeNode.
     */
    getRootNode: function() {
        return this._rootNode;
    },
    /**
     * 通过id属性来取得treeNode
     * @param {String} id       节点id
     * @return {TreeNode} treeNode.
     */
    getTreeNodeById: function(id) {
        return this.getTreeNodes()[id];
    },
    /**
     * 取得树的当前节点
     * @return {TreeNode} treeNode.
     */
    getCurrentNode: function() {
        return this._currentNode;
    },
    /**
     * 设置节点为树的当前节点
     * @return {TreeNode} treeNode.
     */
    setCurrentNode: function(treeNode) {
        this._currentNode = treeNode;
    },
    /**
     *销毁Tree对象
     */
    dispose: function() {
        var me = this;
        me.dispatchEvent('dispose');
        baidu.dom.remove(me.getMain());
        baidu.lang.Class.prototype.dispose.call(me);
    }
});
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * widget机制, 用于模块化开发.
 * @namespace baidu.widget
 * @remark
 *     widget是指一个包含它依赖信息的完整功能块. 
 * widget机制是通过一些api封装,解决widget的依赖管理,通信机制以及部署支持.
 * 依赖管理通过声明方式配置, 详见 baidu.widget.create方法.
 * 通信机制是指widget对其他widget的调用,对于所依赖widget,可以直接调用; 与非依赖widget的通信则通过事件机制实现.详见 baidu.widget.create方法.
 * 开发状态下,可以通过默认的路径配置规则对应代码,部署时可以工具配置baidu.widget._pathInfo.详见 baidu.widget.getPath方法.
 * @author rocy 
 * @see baidu.widget.create, baidu.widget.getPath
 */
baidu.widget = baidu.widget || {
    _pathInfo : {},
    /**
     * widget url查找的根路径, 相对根路径或绝对根路径皆可.
     */
    _basePath : '',
    _widgetAll : {},
    _widgetLoading : {},
    _defaultContext : {}
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 获取已加载的widget.
 * @name baidu.widget.get
 * @function
 * @grammar baidu.widget.get(name)
 * @param {String} name widget名.
 * @remark
 *   get方法仅获取已加载的widget,并不做加载. 。
 *
 * @return {Object} widget
 * @author rocy
 */
baidu.widget.get = function(name) {
    return baidu.widget._widgetAll[name] || null;
};

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 检查传入对象是否为widget
 * @name baidu.widget._isWidget
 * @author rocy
 * @function
 * @private
 * @grammar baidu.widget._isWidget(widget)
 * @param {Object} widget 待检测widget.
 *
 * @return {Boolean} 是否为widget.
 */
baidu.widget._isWidget = function(widget) {
    if (!widget ||
        !baidu.lang.isString(widget.id) ||
        !baidu.lang.isObject(widget.exports) ||
        !baidu.lang.isFunction(widget.main)) {
        return false;
    }
    return true;
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */



/**
 * 获取widget的url路径. <br/> 优先查找baidu.widget._pathInfo下的配置, 默认会将"pkg1.pkg2.widget" 映射成"pkg1/pkg2/widget.js"
 * @name baidu.widget.getPath
 * @function
 * @grammar baidu.widget.getPath(name)
 * @param {String} name widget名.
 * @remark
 *     可以根据实际情况重写
 *
 * @return {String} widget路径.
 * @author rocy
 */
baidu.widget.getPath = function(name) {
    return baidu.widget._basePath + 
    	(baidu.widget._pathInfo[name] || (name.replace(/\./g, '/') + '.js'));
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */









/**
 * 加载widget, 并在widget加载完成后执行传入的方法.
 * @name baidu.widget.load
 * @function
 * @grammar baidu.widget.load(widgets, executer)
 * @param {Array<String>|String} widgets widget名称数组.
 * @param {Function} executer widget加载完成时执行,第一个参数为获取widget API的方法(require).
 * @author rocy
 */
baidu.widget.load = function(widgets, executer) {
    var files = [],
        executer = executer || baidu.fn.blank,
        makeRequire = function(context){
            var ret = function (id){
                var widget = ret.context[id];
                if(!baidu.widget._isWidget(widget)){
                    throw "NO DEPENDS declare for: " + id;
                }
                return widget.exports;
            };
            ret.context = context;
            return ret;
        },
        realCallback = function() {
            var i = 0,
                length = widgets.length,
                context = baidu.object.extend({}, baidu.widget._defaultContext),
                widgetName,
                widget, widgetLoading;
            for (; i < length; ++i) {
                widgetName = widgets[i],
                widget = baidu.widget.get(widgetName),
                widgetLoading = baidu.widget._widgetLoading[widgetName];
                //避免重复加载.若widget正在加载中,则等待加载完成后再触发.否则清空加载状态.
                if (widgetLoading && widgetLoading.depends.length){
                    window.setTimeout(function() {
                        baidu.widget.load(widgetLoading.depends, realCallback);
                    }, 20);
                    return;
                }
                widget.load();

                //累加依赖模块的context，并将依赖模块置于context中，
                baidu.extend(context, widget.context);
                context[widgetName] = widget;
            }
            executer(makeRequire(context));
        };
    if (!widgets) {
        executer(makeRequire(baidu.widget._defaultContext));
    }
    //widget列表支持逗号分隔的字符串描述
    if (baidu.lang.isString(widgets)) {
        widgets = widgets.split(',');
    }
    baidu.each(widgets, function(widget) {
        if (baidu.widget._isWidget(baidu.widget.get(widget))) {//已加载
            return;
        }
        files.push({url: baidu.widget.getPath(widget)});
    });
    files.length ?
        baidu.page.load(files, {onload: realCallback}) :
        realCallback();
};
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 根据传入的widget名, 初始化方法等,创建widget.
 * @id baidu.widget.create
 * @class
 * @grammar baidu.widget.create(id, main, options)
 * @param {String} id widget名.
 * @param {Function} main widget的初始化方法,第一个参数为获取依赖widget API的方法(require), 第二个参数为API挂载点(exports).
 * @param {Object} [options] 配置参数.
 * @config {Array<String>|String} depends 依赖列表, 支持逗号分隔的字符串描述.
 * @config {Function} dispose 析构函数,在dispose时调用.
 * @config {Boolean} lazyLoad 延迟加载.该参数为true时不加载依赖模块,也不执行初始化方法,需显示调用 baidu.widget.load方法.
 * @remark
 * 该方法是commonjs中module部分的一个异步实现.
 * 该规范以及 require, exports 的定义等, 参考 http://wiki.commonjs.org/wiki/Modules/1.1.1
 * 若存在同名widget,将直接覆盖.
 * @see baidu.widget
 * @author rocy
 */
baidu.widget.create = function(id, main, options) {
    options = options || {};
    var widget = {
        id: id,
        main: main,
        depends: options.depends || [],
        exports: {},
        dispose: options.dispose
    };
    baidu.widget._widgetLoading[id] = widget;
    baidu.widget._widgetAll[id] = widget;
    widget.load = function() {
        var widget = this;
        if(widget._loaded){
            return;
        }
        widget._loaded = true;
        baidu.widget.load(widget.depends, function(require) {
            baidu.widget._widgetLoading[widget.id] = undefined;
            widget.context = require.context || baidu.widget._defaultContext;
            widget.main.call(widget, require, widget.exports);
        });
    };
    if (!options.lazyLoad) {
        widget.load();
    }
    return widget;
};

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */




/**
 * 析构widget. 如果widget有dispose方法,则执行.
 * @name baidu.widget.dispose
 * @function
 * @grammar baidu.widget.dispose(widget)
 * @param {String} name widget名.
 * @author rocy
 */
baidu.widget.dispose = function(name) {
    var widget = baidu.widget.get(name);
    if (!baidu.widget._isWidget(widget)) {
        return;
    }
    //执行widget的dispose方法
    if (baidu.lang.isFunction(widget.dispose)) {
        widget.dispose();
    }
    delete baidu.widget._widgetAll[name];
};
