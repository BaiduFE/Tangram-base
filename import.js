/*
 * @fileoverview JavaScript framework 脚本开发框架的核心文件
 * 负责脚本模块加载、文件本地缓存等脚本框架运行环境的搭建

 * @author meizz
 * @version 20100623
 * @create-date 20050227

 * MSN:huangfr@msn.com QQ:112889082 Copyright(c) meizz
 * http://www.meizz.com/jsframework/ MIT-style license
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software
 */


/** @ignore
 * 这个 if 是阻止代码多次被初始化执行
 */
if (typeof window["\x06BAIDU"] != "object") {(function() {

    /**
     * 得到本脚本文件对应的<script>标签元素
     */
    var script = document.getElementsByTagName("SCRIPT");
    script = script[script.length - 1];
    var t = script.src.replace(/\\/g,"/");

    /**
     * 得到加载模块的起始路径
     */
    var pathmz = (t.lastIndexOf("/")<0?".":t.substring(0,t.lastIndexOf("/")));


    var TS = new Date().getTime().toString(36);
    /**
     * 将 namespace 转换成实际的文件路径
     * @return {String} 对应的路径
     */
    function mapPath(ns, op) {
        op = op || {};
        var p = op.path, mp = op._mpath;
        if (typeof mp == "string" && mp.length > 3) {
            mp += (mp.indexOf("?")>0?"&":"?")+(/(\?|&)\.t_=/.test(mp)?"":".t_="+TS);
            !(/^https?:\/\//i.test(mp)) && (mp = pathmz +"/"+ mp);
            return mp;
        } else  if (typeof p == "string" && p.length > 3) {
            p += (p.indexOf("?")>0?"&":"?")+(/(\?|&)\.t_=/.test(p)?"":".t_="+TS);
            return p;
        }
        return pathmz +"/"+ ns.replace(/\./g,"/") +".js"+ (op.nocache?"?.t_="+TS:"");
    }

    /**
     * 判断该模块是否已加载，避免重复加载
     */
    var existent={};    //为模块是否重复加载的判断而用

    /**
     * 代码内存存储对象
     */
    var codebase = {};

    /** @ignore
     * 创建一个 XMLHttpRequest 对象的实例
     */
    var xhr = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();

    /**
     * 加载指定的模块代码（一般暗指当前的 codelib 里还没有该模块代码）
     * load 的数据源有两种：本地缓存或者服务器
     * 在向服务器请求前先检查本地缓存
     * 从服务器端取回代码之后会先存入本地缓存和codebase中
     *
     * @param {String} namespace 模块的命名空间
     * @param {JSON} option 配置参数{path,nocache}
     * @return {String} 被加载的模块文本
     */
    function load(namespace, option) {
        var option = option || {};
        var path = mapPath(namespace, option);

        //用AJAX从服务器端取代码
        if (xhr){
            try {
                xhr.open("GET", path, false);
                xhr.send("");
            } catch(ex) {
                alert("xhr.open/send error, maybe cross domain");
            }
            if (xhr.readyState == 4) {
                if (xhr.status == 0 || xhr.status == 200) {
                    var s = xhr.responseText;
                    if (s == null || s.charAt(0) == "\uFFFD") {
                        alert("Maybe file encoding isn't ANSI or UTF-8");
                        return "";
                    }
                    if (s.charAt(0) == "\xef") {
                        s = s.substr(3);
                    }
                    return s;
                } else if(xhr.status == 404) {
                    alert(namespace + "\nFile not found");
                } else {
                    if (!option.reload) {
                        option.reload = true;
                        load(namespace, option);
                    } else {
                        throw new Error(namespace + "\n" + xhr.status + ": " + xhr.statusText);
                    }
                }
            }
        }else {
            alert("Your browser do not support XMLHttpRequest");
        }
        return "";
    };

    /**
     * 通过 namespace 加载指定的模块
     * @param   {String}    namespace   两种格式：path:./abc.js | aa.bb.cc
     * @param   {JSON}      option      {path,nocache,expires}
     */
    window.Import = function(namespace, option) {
        option = option||{};
        // 20100623添加 Include("path:xxx.js")这种直接引入JS文件
        if (namespace.toLowerCase().indexOf("path:") == 0) {
            option._mpath = namespace.substr(5);
        }
        var path = option.path = mapPath(namespace, option);

        //该 namespace 模块已经被加载并且已经在当前网页中执行过
        if (existent[namespace] == path) {
            return;
        }

        if(!/(^[\w\-$@]+(\.[\w\-$@]+)*$)|(^path:[\w\.\-\/\?\\&%=;]+$)/i.test(namespace)) {
            throw new Error(namespace + " nonstandard namespace");
        }

        var code = codebase[namespace] || load(namespace, option);

        if (code) {


            // 将模块里写明的依赖关系作一些预处理，以便加载这些依赖项
            // 这个正则表达式的 m 模式不支持IE5.0
            code = code.replace(/^[\s\t]*\/{3,}\s*import\s+(([\w\-\$]+(\.[\w\-\$]+)*)|(path:[\w\.\-\/\?\\&%=]+))\s*;?\s*$/mig, "Import(\"$1\");\n");

            // 20100623添加 Include("path:xxx.js")这种直接引入JS文件
            // [bug] /// include path:src/mz/dom.js; 这种载入模式中：URL不可有(;)号；无法自动完成父NameSpace的补齐操作
            if (namespace.toLowerCase().indexOf("path:") != 0) {
                // 比如 mz.dom.g 模块里就不需要手动 include mz.dom，而由下面这两句代码自动完成
                var ns = ("."+ namespace).replace(/\.[^\.]+$/, "");
                ns && (code = 'Import("'+ ns.substr(1) +'");\r\n'+ code);
            }

            if (window.execScript) {    // IE Chrome
                existent[namespace] = path;
                window.execScript(code);
            } else {    // Firefox Mozilla Opera Safari Netscape
                /**
                 * 此处原来想用 window.eval() 或 eval.call(window) 来做
                 * 但是 eval 在上述各浏览器上有差异，因此用下面的方法做
                 */
                var s = document.createElement("SCRIPT");
                s.type = "text/javascript";
                s.appendChild(document.createTextNode(code));
                script.parentNode.appendChild(s);
                existent[namespace] = path;
                s = null;
            }
        }
    };




    /**
     * 解析本<script>标签中src的queryString
     */
    if (script.src.indexOf("?") > 0) {
        var reg = new RegExp("(^|&|\\?)Import=([^&]*)(&|$)","i"), a;
        if ((a = script.src.match(reg)) && (a = a[2].split(","))) {
            for (var i=0; i<a.length; i++) {
                Include(a[i]);
            }
        }
    }

})()}
