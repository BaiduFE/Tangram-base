/* 
  jSelector 1.0 alpha
  copyright 2008-2009, hackwaly@gmail.com
  http://www.opensource.org/licenses/mit-license.php
*/
/*
  Features:
  good parser. (accept specific legal selector)
  does not depend on cache. (dynamic page)
  jit-compile and inline optimize. (ie faster)
  always return an array with hash. (so can determine whether some node is in result.
  	note that return the HTMLCollection is not reliable in IE and FireFox except webkit because 
  	always hava 'document.getElementsByTagName("*") === document.getElementsByTagName("*")'.
*/
//TODO: :nth- 
//TODO: child travel optimize.
//TODO: querySelectorAll
//TODO: add comment
//TODO: use node.sourceIndex like uid
//TODO: control the cache.
window.$ = (function (){
	//#region parse
	function parseStr(rs, simple){
		if (/^\s*([\w_-]+)\s*/.test(rs)) {
			rs = RegExp.rightContext;
			simple.push(RegExp.$1);
		} else if (/^\s*"((?:[^"\\]|\\")*)"\s*/.test(rs)) {
			rs = RegExp.rightContext;
			simple.push(RegExp.$1.replace(/\\"/g, '"'));
		} else if (/^\s*'((?:[^'\\]|\\')*)'\s*/.test(rs)) {
			rs = RegExp.rightContext;
			simple.push(RegExp.$1.replace(/\\'/g, "'"));
		}
		return rs;
	}
	function parseNth(rs, simple){
		rs = rs.replace(/^[^\)]*/, '');
		var ls = RegExp['$&']
			.replace(/\s+/g, '')
			.replace('even', '2n')
			.replace('odd', '2n+1');
		if (/^(?:(\d+)n)?([+-]?\d+)?/.test(ls)) {
			simple.push(Number(RegExp.$1) || 0);
			simple.push(Number(RegExp.$2) || 0);
		}
		return rs;
	}
	function parseSimple(rs, sequence, negative){
		if (/^([\[#\.\:])?\s*([\w_-]+)/.test(rs)) {
			rs = RegExp.rightContext;
			var simple = [RegExp.$2];
			var _ = RegExp.$1 || ((simple[0] = simple[0].toUpperCase()),' ');
			simple.tag = _;
			if (_ == '[') {
				if (/^\s*([~^$|*!]?=)\s*/.test(rs)) {
					rs = RegExp.rightContext;
					simple.tag = RegExp.$1;
					rs = parseStr(rs, simple);
				}
				rs = rs.replace(/^\s*\]/, '');
			} else if (_ == ':') {
				_ = simple.pop();
				simple.tag = ':' + _;
				rs = rs.replace(/^\(\s*/, '');
				if (_ == 'not') {
					rs = parseSimple(rs, sequence, true);
					simple = sequence.pop();
				} else if (_ == 'contains') {
					rs = parseStr(rs, simple);
				} else if (_.indexOf('nth') != -1) {
					rs = parseNth(rs, simple);
				}
				rs = rs.replace(/^\s*\)/, '');
			}
			if (negative) {
				simple.negative = negative;
			}
			sequence.push(simple);
		} else throw rs;
		return rs;
	}
	function parse(rs){
		var sequence = [];
		sequence.tag = ' ';
		var chain = [sequence];
		var group = [chain];
		var ls, _;
		if (!(rs = rs.replace(/^\s+|\s+$/g, ''))) {
			return null;
		}
		while (ls != rs && (ls = rs)) {
			if (/^(?:\s*([,~+>])\s*|\s+)/.test(rs)) {
				rs = RegExp.rightContext;
				if ((_ = RegExp.$1 || ' ') == ',') {
					sequence = [];
					sequence.tag = ' ';
					chain = [sequence];
					group.push(chain);
				} else {
					sequence = [];
					sequence.tag = _;
					chain.push(sequence);
				}
			}
			rs = parseSimple(rs, sequence);
		}
		return group;
	}
	//#endregion
	//#region jit-compile.
	var LOCAL = [];
	function local(value){
		var ret = '_' + LOCAL.length;
		LOCAL.push(value);
		return  ret;
	}
	function locals(){
		var vars = [];
		for (var i=0; i<LOCAL.length; i++){
			vars[i] = i + '=local[' + i + ']';
		}
		return 'var _' + vars.join(',_') + ';';
	}
	var ATTR_NAME_MAP = {'class': 'className', 'for': 'htmlFor'};
	function getAttr(attr){
		if (ATTR_NAME_MAP[attr]){
			return 'node.'+ATTR_NAME_MAP[attr];
		} else if (attr == 'href'){
			return 'node.getAttribute("href",2)';
		} else {
			return 'node.'+attr;
		}
	}
	var SCOPE = 0;
	function gencode(tpl, params){
		var suffix = SCOPE ++;
		return tpl.replace(/\{(\w+)\}|(#)/g, function (m, p1, p2){
            if (p1){
                return params[p1] || m;
            } else {
				return suffix;
            }
        });
	}
	var UID = 1;
	// the cache version to validate the cache is expire.
	var CCV = 1;
	var tpl = {
		finder: {
			'+': 
			'var node#=node;'+
			'while ((node#=node#.nextSibling)!=null){'+
				'node=node#;'+
				'if(node.nodeType==1){'+
					'if({test}){'+
						'{next}'+
					'}'+
					'break;'+
				'}'+
			'}',
			'~': 
			'var hash#=hash#||{};'+
			'var node#=node;'+
			'while(node#=node#.nextSibling){'+
				'node=node#;'+
				'if(node.nodeType==1){'+
					'var key=node.uid||(node.uid=uid++);'+
					'if (key in hash#) break;'+
					'if ({test}){{next}}'+
					'hash#[key]=true;'+
				'}'+
			'}',
			'#': 
			'if (node.getElementById){'+
				'node=node.getElementById({argument});'+
			'} else {'+
				'node=node.getElementsByTagName('*').namedItem({argument});'+
			'}'+
			'if(node && {test}){{next}}',
			' ': 'var nodes#=node.getElementsByTagName({argument});',
			'.': 'var nodes#=node.getElementsByClassName({argument});',
			'*': 'var nodes#=node.all||node.getElementsByTagName("*");',
			'>': 'var nodes#=node.children||node.childNodes;'
		},
		passer: {
			'<': 
			'var pass = false;'+
            'var node# = node;'+
            '{pass}'+
            'if (pass){'+
                'node = node#;'+
                '{next}'+
            '}',
			' ':
			'var hash# = hash# || {};' +
            'var pass# = {value: false};' +
            'var node# = node;' +
            'while ((node# = node#.parentNode) != null){' +
                'node = node#;' +
                'var key = node.uid || (node.uid = uid++);' +
                'if (hash#[key]){' +
                    'pass = pass#.value = hash#[key].value;' +
                    'break;' +
                '} else {' +
                    'pass = false;' +
                    'if (node.nodeType == 1 && {test}){' +
                        '{pass}' +
                    '}' +
                    'if (pass){' +
                        'break;' +
                    '}' +
                '}' +
                'hash#[key] = pass#;'+
            '}'+
            'pass#.value = pass;',
			'>':
			''
		},
		tester: {
			' ': function (tagName){ return 'node.tagName=='+local(tagName); },
			'#': function (id){ return 'node.id=='+local(id); },
			'.': function (className){ return '(_=node.className)&&'+local(new RegExp('(?:^|\\s)'+className+'(?:\\s|$)'))+'.test(_)'; },
			'[': function (attr){ return getAttr(attr); },
			'=': function (attr, value){ return getAttr(attr)+'=='+local(value); },
			'!=': function (attr, value){ return getAttr(attr)+'!='+local(value);},
			'^=': function (attr, value){ return '(_='+getAttr(attr)+')&&_.substr(0,'+local(value.length)+')=='+local(value); },
			'$=': function (attr, value){ return '(_='+getAttr(attr)+')&&_.substring(_.length-'+local(value.length)+')=='+local(value); },
			'*=': function (attr, value){ return getAttr(attr)+'.indexOf('+local(value)+')>=0'; },
			'|=': function (attr, value){ return local(new RegExp('^'+value+'(-.*)?'))+'.test('+getAttr(attr)+')'; },
			'~=': function (attr, value){ return local(new RegExp('(?:^|\\s)'+value+'(?:\\s|$)'))+'.test('+getAttr(attr)+')'; },
			':contains': function (value){ return local(new RegExp(value))+'.test(node.innerText||node.textContent||"")'; },
			':nth-child': function (b, c){ return !(b||c)?'true':'(nthChild(node)-'+local(c)+')'+(b?'%'+b:'')+'==0'; },
			':nth-last-child': function (b, c){ return !(b||c)?'true':'(nthChild(node,true)-'+local(c)+')'+(b?'%'+b:'')+'==0'; },
			':first-child': function (){ return tpl.tester[':nth-child'](0, 1); },
			':last-child': function (){ return tpl.tester[':nth-last-child'](0, 1); },
			':only-child': function (){ return 'nthChild(node)&&node.parentNode.jselCount==1'; }
		},
		iterator: 'for(var i#=0,l#=nodes#.length; i#<l#; i#++){'+
				'node=nodes#[i#];if({test}){{next}}}',
		terminal: {
			left: 'pass=true;break;',
			right: 'var key=node.uid||(node.uid=uid++);if (!hash[key]){ret[retl++]=node;hash[key]=true;}'
		},
		select: '0,'+
		'function(root, ret){'+
			'var _,'+
				'local=arguments.callee.local,'+
				'uid=UID,'+
				'node=root,'+
				'ret=ret,'+
				'retl=ret.length,'+
				'hash=ret.hash||(ret.hash={});'+
			'{locals}'+
			'{body}'+
			'UID=uid;'+
			'ret.length = retl;'+
			'return ret;'+
		'}'
	};
	tpl.finder[' '] += tpl.iterator;
	tpl.finder['.'] += tpl.iterator;
	tpl.finder['*'] += tpl.iterator;
	tpl.finder['>'] += tpl.iterator;
	tpl.passer['~'] = tpl.passer[' ']
		.replace('parentNode', ' previousSibling');
	tpl.passer['+'] = tpl.finder['+']
		.replace('nextSibling', 'previousSibling')
		.replace('{next}', '{pass}');
	tpl.passer['>'] = tpl.passer['+'].replace('previousSibling', 'parentNode');
	var gen = {
		finder: function (selector, index){
			var r = false;
			if (index == null){
				if (selector.begin != null){
					index = selector.begin;
					r = index != 0;
				} else {
					index = 0;
				}
			}
			if (index == selector.length){
				return tpl.terminal.right;
			}
			var next = gen.finder(selector, index + 1);
			if (r){
				next = gencode(gen.passer(selector), {
					next: next
				});
			}
			var seq = selector[index];
			var argument = seq.argument != null ? local(seq.argument) : null;
			return gencode(tpl.finder[seq.tag], {
				argument: argument,
				test: gen.tester(seq),
				next: next
			});
		},
		passer: function (selector, index){
			var pass;
			var passer;
			if (index == null){
				index = selector.begin;
				passer = tpl.passer['<'];
			} else {
				var seq = selector[index];
				passer = tpl.passer[seq.rTag];
			}
			if (index == 0){
				pass = 'pass=(root.nodeType==9);';
			} else {
				pass = gen.passer(selector, index - 1);
			}
			return gencode(passer, {
				pass: pass,
				test: seq ? gen.tester(seq) : null
			});
		},
		tester: function (sequence){
			if (!sequence.length){
				return 'true';
			} else {
				var tests = [];
				for (var i=0; i<sequence.length; i++){
					var simple = sequence[i];
					var test = tpl.tester[simple.tag].apply(null, simple);
					test = (simple.negative ? '!' : '')+ '(' + test + ')';
					tests[i] = test;
				}
				return tests.join(' && ');
			}
		},
		select: function (selector){
			return gencode(tpl.select, {
				body: gen.finder(selector),
				locals: locals()
			});
		}
	};
	var LEVEL_MAP = {
		'#': 0, '=': 0, '!=': 0,
		' ': 1, '[': 1,
		'*=': 2, '|=': 2, '.': 2
	};
	var IN_RICH_WEB = null;
	function optimize(selector){
		//TODO: simplify this function
		var l = selector.length;
		var r = 0;
		var c = !!document.getElementsByClassName;
		if (IN_RICH_WEB == null){
			IN_RICH_WEB = (document.getElementsByTagName('div').length >= 1000);
		}
		var tag;
		while (l-- > 0) {
			var seq = selector[l];
			var a = [[],[],[],[]];
			if (IN_RICH_WEB && !r){
				r = l;
			}
			if (r){
				seq.rTag = tag;
			}
			tag = seq.tag;
			for (var i=0; i<seq.length; i++){
				var simple = seq[i];
				var t = simple.tag;
				if (t == '#') {
					r = l;
					seq.tag = t;
					seq.argument = simple[0];
					continue;
				}
				if (r == l){
					if (t == ' ' || (c && !simple.negative && t == '.')) {
						seq.tag = t;
						seq.argument = simple[0];
						continue;
					}
				}
				if (!r && seq.tag == ' '){
					if (t == ' ' || (c && !simple.negative && t == '.')) {
						seq.tag = t;
						seq.argument = simple[0];
						continue;
					}
				}
				a[LEVEL_MAP[simple.tag] || 3].push(simple);
			}
			if ((!r || r==l) && seq.tag == ' ' && !seq.argument){
				seq.tag = '*';
			}
			seq.length = 0;
			seq.push.apply(seq, seq.concat.apply([], a));
		}
		selector.begin = r;
		return selector;
	}
	//TODO: should be optimize if only want to test nth(N).
	function nthChild(node, last, t){
		var oNode = node;
		var parentNode = node.parentNode;
		if (!parentNode.jselChildrenIndexed == CCV){
			var index = 1;
			var nodes = parentNode.children || parentNode.childNodes;
			for (var i=0,l=nodes.length; i<l; i++){
				node = nodes[i];
				if (node.nodeType == 1){
					node.jselIndex = index++;
				}
			}
			parentNode.jselCount = index - 1;
			parentNode.jselChildrenIndexed = CCV;
		}
		return last ? parentNode.jselCount - oNode.jselIndex + 1 : oNode.jselIndex;
	}
	function compile(selector){
		LOCAL = [];
		SCOPE = 0;
		selector = optimize(selector);
		var fn = gen.select(selector);
		//var local = LOCAL;
		fn = eval(fn);
		fn.local = LOCAL;
		LOCAL = null;
        return fn;
	}
	//#endregion
	//#region main
	return function (src, root){
		var group;
		var ret = [];
        root = root || document;
		try {
			group = parse(src);
		} catch (ex){
			throw new SyntaxError('unrecognized token at " - '+ ex +'!"');
		}
        for (var i = 0; i < group.length; i++) {
			var selector = group[i];
			ret = compile(selector)(root, ret);
		}
        return ret;
	};
	//#endregion
})();
