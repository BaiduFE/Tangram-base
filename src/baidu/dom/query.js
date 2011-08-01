/*
 * Tangram query
 *
 * code from https://github.com/hackwaly/Q
 * 
 * version: 1.0.0
 * date: 20110801
 * author: wenyuxiang
 */


///import baidu.dom;

/**
 * 提供css选择器功能
 * @name baidu.dom.query
 * @function
 * @grammar baidu.dom.query(selector[, context, results])
 * @param {String} selector 选择器定义
 * @param {HTMLElement | DOMDocument} [context] 查找的上下文
 * @param {Array} [results] 查找的结果会追加到这个数组中
 * @version 1.2
 * @remark
 * 
            选择器支持所有的<a href="http://www.w3.org/TR/css3-selectors/">css3选择器</a> ，核心实现采用sizzle。可参考<a href="http://wiki.github.com/jeresig/sizzle/" target="_blank">sizzle 文档</a>
        
 * @see baidu.dom.g, baidu.dom.q, baidu.dom.query.matches
 *             
 * @returns {Array}        包含所有筛选出的DOM元素的数组
 */

baidu.dom.query = (function (){
    var d = document;
    d._Q_rev = 0;

    var MUTATION = false;
    var _onMu = function (){
        d._Q_rev ++;
        MUTATION = true;
    };
    if (d.addEventListener) {
        d.addEventListener('DOMNodeInserted', _onMu, false);
        d.addEventListener('DOMNodeRemoved', _onMu, false);
    }

    var BY_ID1;
    var BY_CLASS;
    var IE678 = window.ActiveXObject && !d.addEventListener;
    (function (){
        var div = d.createElement('div');
        div.innerHTML = '<a name="d"></a><div id="d"></div>';
        BY_ID1 = div.getElementsByTagName('*')["d"] === div.lastChild;
        div.innerHTML = '<div class="t e"></div><div class="t"></div>';
        div.lastChild.className = 'e';
        BY_CLASS = div.getElementsByClassName && div.getElementsByClassName('e').length == 2;
    })();
    var BY_NAME = !!d.getElementsByName;
    var BY_ELEMENT = typeof d.documentElement.nextElementSibling !== 'undefined';
    var BY_CHILDREN = !!d.documentElement.children;
    var BY_CHILDREN_TAG = BY_CHILDREN && !!d.documentElement.children.tags;

    var PATTERN = /(?:\s*([ ~+>,])\s*)?(?:([:.#]?)((?:[\w\u00A1-\uFFFF-]|\\.)+|\*)|\[\s*((?:[\w\u00A1-\uFFFF-]|\\.)+)(?:\s*([~^$|*!]?=)\s*((['"]).*?\7|[^\]]*))?\s*\])/g;

    function trim(str){
        return str.replace(/^\s*|\s*$/, '');
    }
    function make(kind, array){
        return (array.kind = kind, array);
    }
    var parse = function (){
        var text;
        var index;

        function match(regex){
            var mc = (regex.lastIndex = index, regex.exec(text));
            return mc && mc.index == index ? (index = regex.lastIndex, mc) : null;
        }
        function dequote(str){
            var ch = str.charAt(0);
            return ch == '"' || ch == "'" ? str.slice(1, -1) : str;
        }
        function error(){ throw ['ParseError', text, index]; }

        function parse(){
            var mc, simple, seq = [], chain = [seq], group = [chain];
            while (mc = match(PATTERN)) {
                if (mc[1]) {
                    if (mc[1] == ',') group.push(chain = []);
                    if (seq.length) chain.push(seq = []);
                    if (mc[1] != ',') seq.comb = mc[1];
                }
                simple = [mc[4] || mc[3]];
                if (mc[6]) simple.push(dequote(mc[6]));
                simple.kind = mc[5] || (mc[4] ? '[' : mc[2] || 'T');
                if (simple[0] == '*' && simple.kind != 'T') error();
                if (mc[2] == ':') {
                    simple.kind = ':' + mc[3];
                    if (text.charAt(index) == '(') {
                        index ++;
                        if (mc[3] == 'not' || mc[3] == 'has') {
                            var t = index;
                            simple[0] = parse();
                            simple[1] = text.slice(t, index);
                            if (text.charAt(index) == ')') index ++; else error();
                        } else {
                            var tmpIndex = text.indexOf(')', index);
                            if (tmpIndex != -1) {
                                simple[0] = trim(text.slice(index, tmpIndex));
                                index = tmpIndex + 1;
                            } else error();

                            if (mc[3].indexOf('nth') == 0) {
                                var tmp = simple[0];
                                tmp = (tmp == 'even' ? '2n' : tmp == 'odd' ? '2n+1' :
                                    (tmp.indexOf('n') == -1 ? '0n': '') + tmp.replace(/\s*/g, '')).split('n');
                                simple[0] = !tmp[0] ? 1 : Number(tmp[0]) | 0;
                                simple[1] = Number(tmp[1]) | 0;
                            } else if (mc[3] == 'contains') {
                                simple[0] = dequote(simple[0]);
                            }
                        }
                    }
                }
                seq.push(simple);
            }
            return group;
        }

        return function (selector){
            return (text = selector, index = 0, selector = parse(), match(/\s*/g), index < text.length) ? error() : selector;
        };

    }();

    var fRMap = { '#': 9, 'N': BY_NAME ? 7 : 0, '.': BY_CLASS ? 6 : 0, 'T': 5 };
    var tRMap = { '#': 9, '=': 9, '[': 8, 'N': 9, 'T': 8, '.': 5,  '~=': 3, '|=': 3, '*=': 3,
        ':not': 6, ':has': 1, ':contains': 3, ':nth-child': 2, ':nth-last-child': 2,
        ':first-child': 3, ':last-child': 3, ':only-child': 3, ':not-ex': 7 };
    var efMap = { id: '#', name: 'N' };
    var testingOrder = function (a, b){ return a.tR - b.tR; };

    function process(seq){
        var finder, t;
        var k = seq.length;
        while (k --) {
            var simple = seq[k];
            // 转化[id="xxx"][name="xxx"][tagName="xxx"][className~="xxx"]之类的选择器
            // 识别:root,html|head|body|title等全局仅一个的标签的选择器，忽略*选择器
            // 合并类选择器以便于使用getElementsByClassName
            if (simple.kind == ':html') simple = make('T', 'html');
            if (simple.kind == '=') {
                if (efMap[simple[0]]) simple = make(efMap[simple[0]], [simple[1]]);
            } else if (simple.kind == '~=' && simple[0] == 'className') simple = make('.', [simple[1]]);
            if (simple.kind == 'T') {
                if (simple[0] == '*') simple.kind = '*'; else seq.tag = simple;
                t = simple[0].toLowerCase();
            } else if (simple.kind == '.') {
                if (!seq.classes) seq.classes = simple; else {
                    seq.classes.push(simple[0]);
                    simple.kind = '*';
                }
            }
            if (simple.kind == ':not' && !((t=simple[0],t.length==1)&&(t=t[0],t.length==1))) {
                simple.kind = ':not-ex';
            }
            // 计算选择器的得分用于优先级排序等策略
            simple.fR = fRMap[simple.kind] | 0;
            simple.tR = tRMap[simple.kind] | 0;
            if (simple.fR && (!finder || simple.fR > finder.fR)) finder = simple;
            seq[k] = simple;
        }
        // 按照优先级对用于测试的选择器进行排序
        seq.sort(testingOrder);
        // 记录用于getElementXXX的最佳的选择器
        seq.$ = finder;
        return seq;
    }
    // 对chain进行处理
    // 注意为了处理方便, 返回的数组是倒序的
    // div p a => [div] [p] [a]
    // div p>a => [div] [p>a]
    function slice(chain){
        var part = [];
        var parts = [part];
        var k = chain.length;
        while (k --) {
            var seq = chain[k];
            seq.N = 'node' + k;
            seq = process(seq);
            if (seq.$ && (!part.fR || seq.$.fR > part.fR || (seq.$.fR == part.fR && parts.length == 1))) {
                part.fR = seq.$.fR;
                part.fI = part.length;
            }
            part.push(seq);
            if (seq.comb == ' ' && k && part.fI != null) {
                parts.push(part = []);
                part.fR = 0;
            }
            if (k == chain.length - 1 && seq.tag) chain.tag = seq.tag;
        }
        for (var i=0; i<parts.length; i++) {
            part = parts[i];
            var part1 = parts[i + 1];
            if (part1 != null) {
                if (part.fR > part1.fR || (part.fR == part1.fR && part1.fI != 0)){
                    parts.splice(i + 1, 1);
                    part.push.apply(part, part1);
                    i --;
                } else {
                    part.R = part1[0].N;
                }
            } else {
                part.R = 'root';
            }
        }
        // 如果没有找到任何一个可以用于find的seq.
        if (parts[0].fI == null) {
            parts[0].fI = 0;
            parts[0][0].$ = make('*', ['*']);
        }
        return parts;
    }

    function format(tpl, params){
        return tpl.replace(/#\{([^}]+)\}/g, function (m, p){
            return params[p] == null ? m : params[p] + '';
        });
    }

    var CTX_NGEN = 0;

    var TPL_DOC = '/*^var doc=root.ownerDocument||root;^*/';
    var TPL_XHTML = TPL_DOC + '/*^var xhtml=Q._isXHTML(doc);^*/';
    var TPL_CONTAINS = IE678 ? '#{0}.contains(#{1})' : '#{0}.compareDocumentPosition(#{1})&16';
    var TPL_QID = '#{N}._Q_id||(#{N}._Q_id=++qid)';
    var TPL_FIND = {
        '#': 'var #{N}=#{R}.getElementById?#{R}.getElementById("#{P}"):#{R}.getElementsByTagName("*")["#{P}"];if(#{N}){#{X}}',
        'N': TPL_DOC + 'var #{N}A=doc.getElementsByName("#{P}");for(var #{N}I=0,#{N};#{N}=#{N}A[#{N}I];#{N}I++){if(#{R}===doc||' + format(TPL_CONTAINS, ['#{R}', '#{N}']) +'){#{X}}}',
        'T': 'var #{N}A=#{R}.getElementsByTagName("#{P}");for(var #{N}I=0,#{N};#{N}=#{N}A[#{N}I];#{N}I++){#{X}}',
        '.': 'var #{N}A=#{R}.getElementsByClassName("#{P}");for(var #{N}I=0,#{N};#{N}=#{N}A[#{N}I];#{N}I++){#{X}}',
        '*': 'var #{N}A=#{R}.getElementsByTagName("*");for(var #{N}I=0,#{N};#{N}=#{N}A[#{N}I];#{N}I++){#{X}}',
        '+': BY_ELEMENT ? '/*^var #{N};^*/if(#{N}=#{R}.nextElementSibling){#{X}}' : 'var #{N}=#{R};while(#{N}=#{N}.nextSibling){if(#{N}.nodeType==1){#{X}break;}}',
        '~': BY_ELEMENT ? '/*^var #{N}H={};^*/var #{N}=#{R};while(#{N}=#{N}.nextElementSibling){if(#{N}H[' + TPL_QID + '])break;#{N}H[' + TPL_QID + ']=1;#{X}}' : '/*^var #{N}H={};^*/var #{N}=#{R};while(#{N}=#{N}.nextSibling){if(#{N}.nodeType==1){if(#{N}H[' + TPL_QID + '])break;#{N}H[' + TPL_QID + ']=1;#{X}}}',
        '>': 'var #{N}A=#{R}.children||#{R}.childNodes;for(var #{N}I=0,#{N};#{N}=#{N}A[#{N}I];#{N}I++){if(#{N}.nodeType==1){#{X}}}',
        '>T': 'var #{N}A=#{R}.children.tags("#{P}");for(var #{N}I=0,#{N};#{N}=#{N}A[#{N}I];#{N}I++){#{X}}'
    };
    var TPL_LEFT = 'var #{R}V={_:false};NP_#{R}:{P_#{R}:{#{X}break NP_#{R};}#{R}V._=true;#{Y}}';
    var TPL_TOPASS = 'if(t=#{N}H[' + TPL_QID + ']){if(t._){break P_#{R};}else{break NP_#{R};}}#{N}H[' + TPL_QID + ']=#{R}V;#{X}';
    var TPL_TOPASS_UP = format(TPL_TOPASS, { X: 'if(#{N}!==#{R}){#{X}}' });
    var TPL_PASSED = 'break P_#{R};';
    var TPL_PASS = {
        '>': '/*^var #{N}H={};^*/var #{N}=#{C}.parentNode;' + TPL_TOPASS_UP,
        ' ': '/*^var #{N}H={};^*/var #{N}=#{C};while(#{N}=#{N}.parentNode){' + TPL_TOPASS_UP + '}',
        '+': BY_ELEMENT ? '/*^var #{N}H={};var #{N};^*/if(#{N}=#{C}.previousElementSibling){#{X}}' : '/*^var #{N}H={};^*/var #{N}=#{C};while(#{N}=#{N}.previousSibling){#{X}break;}',
        '~': BY_ELEMENT ? '/*^var #{N}H={};^*/var #{N}=#{C};while(#{N}=#{N}.previousElementSibling){' + TPL_TOPASS + '}' : '/*^var #{N}H={};^*/var #{N}=#{C};while(#{N}=#{N}.previousSibling){' + TPL_TOPASS + '}'
    };
    var TPL_MAIN = 'function(root, result){result=result||[];var qid=Q.qid,t,l=result.length;#{X}Q.qid=qid;return result;}';
    var TPL_HELP = '/*^var #{N}L;^*/if(!#{N}L||!' + format(TPL_CONTAINS, ['#{N}L', '#{N}']) +'){#{X}#{N}L=#{N};}';
    var TPL_PUSH = 'result[l++]=#{N};';
    var TPL_TEST = {
        'T': TPL_XHTML +'/*^var #{N}T=!xhtml?("#{0}").toUpperCase():"#{0}";^*/#{N}.tagName==#{N}T',
        '#': '#{N}.id=="#{0}"',
        'N': '#{N}.name=="#{0}"',
        '[': IE678 ? '(t=#{N}.getAttributeNode("#{0}"))&&(t.specified)' : '#{N}.hasAttribute("#{0}")',
        '=': '#{A}=="#{1}"',
        '!=': '#{A}!="#{1}"',
        '^=': '(t=#{A})&&t.slice(0,#{L})=="#{1}"',
        '$=': '(t=#{A})&&t.slice(-#{L})=="#{1}"',
        '*=': '(t=#{A})&&t.indexOf("#{1}")!==-1',
        '|=': '(t=#{A})&&(t=="#{1}"||t.slice(0,#{L})=="#{P}")',
        '~=': '(t=#{A})&&(" "+t+" ").indexOf("#{P}")!==-1',
        ':contains': '(#{N}.textContent||#{N}.innerText).indexOf("#{0}")!==-1',
        ':empty': '!#{N}.firstChild',
        ':first-child': BY_ELEMENT ? '#{N}.parentNode.firstElementChild===#{N}' : 'Q._isFirstChild(#{N})',
        ':nth-child': TPL_DOC + '/*^var rev=doc._Q_rev||(doc._Q_rev=Q.qid++);^*/Q._index(#{N},#{0},#{1},rev)',
        ':last-child': BY_ELEMENT ? '#{N}.parentNode.lastElementChild===#{N}' : 'Q._isLastChild(#{N})',
        ':only-child': BY_ELEMENT ? '(t=#{N}.parentNode)&&(t.firstElementChild===#{N}&&t.lastElementChild===#{N})' : 'Q._isOnlyChild(#{N})',
        ':not-ex': '/*^var _#{G}=Q._hash(Q("#{1}",root));qid=Q.qid;^*/!_#{G}[' + TPL_QID + ']',
        ':has': '(t=Q("#{1}", #{N}),qid=Q.qid,t.length>0)',
        ':element': '#{N}.nodeType==1'
    };

    function genAttrCode(attr){
        if (attr == 'for') return '#{N}.htmlFor';
        if (attr == 'class') return '#{N}.className';
        if (attr == 'type') return '#{N}.getAttribute("type")';
        if (attr == 'href') return '#{N}.getAttribute("href",2)';
        return '#{N}["' + attr + '"]||#{N}.getAttribute("' + attr + '")';
    }

    function genTestCode(simple){
        if (simple.kind.indexOf('=') !== -1) {
            simple.A = genAttrCode(simple[0]);
        }
        var t;
        switch (simple.kind) {
        case '.':
            var k = simple.length;
            var buff = [];
            while (k --) {
                buff.push('t.indexOf(" #{'+ k +'} ")!==-1');
            }
            return format('(t=#{N}.className)&&((t=" "+t+" "),(' + buff.join(' && ') + '))', simple);
        case '^=':
        case '$=':
            simple.L = simple[1].length;
            break;
        case '|=':
            simple.L = simple[1].length + 1;
            simple.P = simple[1] + '-';
            break;
        case '~=':
            simple.P = ' ' + simple[1] + ' ';
            break;
        case ':nth-child':
//        case ':nth-last-child':
            if (simple[0] == 1 && simple[1] == 0) return '';
            break;
        case ':not':
            t = genCondCode(simple[0][0][0]);
            return t ? '!(' + t + ')' : 'false';
        case ':not-ex':
        case ':has':
            simple.G = CTX_NGEN ++;
            break;
        case '*':
            return '';
        }
        return format(TPL_TEST[simple.kind], simple);
    }
    function genCondCode(seq){
        var buff = [];
        var k = seq.length;
        var code;
        while (k --) {
            var simple = seq[k];
            if (code = genTestCode(simple)) {
                buff.push(code);
            }
        }
        return buff.join(' && ');
    }
    function genThenCode(seq){
        var code = genCondCode(seq);
        return code ? format('if('+code+'){#{X}}', { N: seq.N }) : '#{X}';
    }
    var NEEDNOT_ELEMENT_CHECK = { '#': 1, 'T': 1, '.': 1, 'N': 1, ':element': 1 };
    function genFindCode(seq, R, comb){
        comb = comb || seq.comb;
        var tpl;
        if (comb == ' ') {
            var finder = seq.$;
            if (finder) {
                tpl = TPL_FIND[finder.kind];
                // 有hack的嫌疑, 让产生test代码时忽略已经用于find的seq.
                finder.kind = '*';
            } else {
                tpl = TPL_FIND['*'];
                if (IE678 && !NEEDNOT_ELEMENT_CHECK[seq[seq.length - 1].kind]) {
                    seq.push(make(':element', []));
                }
            }
        } else if (BY_CHILDREN_TAG && comb == '>' && seq.tag) {
            tpl = TPL_FIND['>T'];
            finder = seq.tag;
            seq.tag.kind = '*';
        } else {
//            if (!BY_ELEMENT && (comb == '+' || comb == '~') && !NEEDNOT_ELEMENT_CHECK[seq[seq.length - 1].kind]) {
//                seq.push(make(':element', []));
//            }
            tpl = TPL_FIND[comb];
        }
        return format(tpl, {
            P: finder && (finder.kind == '.' ? finder.join(' ') : finder[0]),
            N: seq.N,
            R: R,
            X: genThenCode(seq)
        });
    }
    function genNextCode(part, isLast){
        var code = '#{X}';
        var k = part.fI;
        while (k --) {
            code = format(code, { X: genFindCode(part[k], part[k+1].N) });
        }
        var nextCode;
        if (!isLast) {
            if (part.fI == 0 && (k = part[0].$.kind) && (k != 'S' && k != '#')) {
                nextCode = format(TPL_HELP, { N: part[0].N });
                code = format(code, { X: nextCode })
            }
        } else {
            nextCode = format(TPL_PUSH, { N: part[0].N });
            code = format(code, { X: nextCode });
        }
        return code;
    }
    function genPassCode(seq, C, comb){
        return format(TPL_PASS[comb], {
            N: seq.N,
            C: C,
            X: genThenCode(seq)
        });
    }
    function genLeftCode(part){
        var code = TPL_LEFT;
        for (var i=part.fI+1,l=part.length; i<l; i++) {
            var seq = part[i];
            var lastSeq = part[i-1];
            code = format(code, { X: genPassCode(seq, lastSeq.N, part[i-1].comb) });
        }
        code = format(code, { X: TPL_PASSED });
        code = format(code, { R: part.R });
        return code;
    }
    function genPartCode(part, isLast){
        var code = genFindCode(part[part.fI], part.R, ' ');
        var nextCode = genNextCode(part, isLast);
        if (part.fI < part.length - 1) {
            var passCode = genLeftCode(part);
            nextCode = format(passCode, { Y: nextCode });
        }
        return format(code, { X: nextCode });
    }
    function genCode(parts){
        CTX_NGEN = 0;
        var code = '#{X}';
        var k = parts.length;
        while (k --) {
            var part = parts[k];
            code = format(code, { X: genPartCode(part, k == 0) });
        }
        return code;
    }

    var documentOrder;
    if (d.documentElement.sourceIndex) {
        documentOrder = function (nodeA, nodeB){ return nodeA === nodeB ? 0 : nodeA.sourceIndex - nodeB.sourceIndex; };
    } else if (d.compareDocumentPosition) {
        documentOrder = function (nodeA, nodeB){ return nodeA === nodeB ? 0 : nodeB.compareDocumentPosition(nodeA) & 0x02 ? -1 : 1; };
    }
    function uniqueSort(nodeSet, notUnique){
        if (!nodeSet.length) return nodeSet;
        nodeSet.sort(documentOrder);
        if (notUnique) return nodeSet;
        var resultSet = [nodeSet[0]];
        var node, j = 0;
        for (var i=1, l=nodeSet.length; i<l; i++) {
            if (resultSet[j] !== (node = nodeSet[i])) {
                resultSet[++ j] = node;
            }
        }
        return resultSet;
    }

    function compile(expr){
        var group = parse(expr);
        var tags = {};
        var k = group.length;
        while (k --) {
            var chain = group[k];
            var code = genCode(slice(chain));
            if (tags && chain.tag && !tags[chain.tag[0]]) {
                tags[chain.tag[0]] = 1;
            } else {
                tags = null;
            }
            var hash = {};
            var buff = [];
            code = code.replace(/\/\*\^(.*?)\^\*\//g, function (m, p){
                return (hash[p] || (hash[p] = buff.push(p)), '');
            });
            code = format(TPL_MAIN, { X: buff.join('') + code });
            group[k] = new Function('Q', 'return(' + code + ')')(Q);
        }
        if (group.length == 1) {
            return group[0];
        }
        return function (root){
            var k = group.length;
            var result = [];
            while (k --) {
                result = group[k](root, result);
            }
            return uniqueSort(result, tags != null);
        };
    }

    Q._hash = function (result){
        var hash = result.hash;
        if (hash == null) {
            hash = result.hash = {};
            var k = result.length;
            var qid = Q.qid;
            while (k --) {
                var el = result[k];
                hash[el._Q_id||(el._Q_id=++qid)] = 1;
            }
            Q.qid = qid;
        }
        return hash;
    };

    function queryXML(expr, root, ret){
        throw ['NotImpl'];
    }
    var cache = {};
    var inQuery = false;
    function query(expr, root, ret){
        root = root || d;
        var doc = root.ownerDocument || root;
        if (!doc.getElementById) {
            return queryXML(expr, root, ret);
        }
        var fn  = cache[expr] || (cache[expr] = compile(expr));
        if (!inQuery) {
            inQuery = true;
            if (!MUTATION) {
                doc._Q_rev = Q.qid ++;
            }
            var result = fn(root, ret);
            inQuery = false;
            return result;
        } else {
            return fn(root, ret);
        }
    }

    Q.qid = 1;
    Q.contains = d.documentElement.contains ? function (a, b){
        return a !== b && a.contains(b);
    } : function (a, b) {
        return a !== b && a.compareDocumentPosition(b) & 16;
    };
    Q._has = function (node, nodes){
        for (var i=0, tnode; tnode=nodes[i++];) {
            if (!Q.contains(node, tnode)) return false;
        }
        return true;
    };
    Q._index = function (node, a, b, rev){
        var parent = node.parentNode;
        if (parent._Q_magic !== rev) {
            var tnode;
            var count = 1;
            if (BY_ELEMENT) {
                tnode = parent.firstElementChild;
                while (tnode) {
                    tnode._Q_index = count ++;
                    tnode = tnode.nextElementSibling;
                }
            } else {
                var nodes = parent.children || parent.childNodes;
                for (var i=0; tnode=nodes[i]; i++) {
                    if (tnode.nodeType == 1) {
                        tnode._Q_index = count ++;
                    }
                    tnode = tnode.nextSibling;
                }
            }
            parent._Q_count1 = count;
            parent._Q_magic = rev;
        }
        return a ? (node._Q_index - b) % a == 0 : node._Q_index == b;
    };
    Q._isOnlyChild = function (node){
        return Q._isFirstChild(node) && Q._isLastChild(node);
    };
    Q._isFirstChild = function (node){
        while (node = node.previousSibling) {
            if (node.nodeType == 1) return false;
        }
        return true;
    };
    Q._isLastChild = function (node){
        while (node = node.nextSibling) {
            if (node.nodeType == 1) return false;
        }
        return true;
    };
    Q._isXHTML = function (doc){
        return doc.documentElement.tagName == 'html';
    };
    function Q(expr, root, ret){
        return query(expr, root, ret);
    }
    return Q;
})();