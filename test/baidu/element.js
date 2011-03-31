function chainMe(domObj) {
	domObj.addClass("aaa").insertHTML("afterEnd",
			"<p class='gaga'>oh my lady gaga</p><p class='berg'>berg</p>")
			.next().setStyle("font-weight", "bold").remove();
}

module('baidu.element');
/**
 * 载入依赖包
 */
var jslist = "baidu.dom.draggable,baidu.dom.resizable,"
		+ "baidu.dom.getStyle,baidu.lang.isArray,baidu.array.each,"
		+ "baidu.dom.g,baidu.dom.addClass,baidu.dom.insertHTML,baidu.dom.next,"
		+ "baidu.dom.setStyle,baidu.dom.remove,baidu.dom.query,baidu.dom.setAttr,"
		+ "baidu.dom.prev,baidu.dom.getAttr,baidu.dom.hasClass,baidu.dom.intersect,"
		+ "baidu.dom.getText,baidu.dom.contains,baidu.dom.hasAttr,baidu.event.on";

test('封装基础 - 输入字符串', function() {
	stop();
	ua.importsrc(jslist, function() {
		var div = document.body.appendChild(document.createElement('div'));
		div.id = 'aaa';
		chainMe(baidu.element("aaa"));
		equals(baidu.g('aaa').className, 'aaa', 'check class name');
		equals(baidu.dom.query('.gaga').length, 0, 'check sub');
		equals(baidu.dom.query('.berg').length, 1, 'check sub');
		document.body.removeChild(div.nextSibling);
		document.body.removeChild(div);
		start();
	}, 'baidu.event.on', 'baidu.element');
});

test('封装基础 - 输入数组', function() {
	var sp1, sp2;
	sp1 = document.body.appendChild(document.createElement('span'));
	sp1.className = 'span';
	sp1.innerHTML = 'span1';
	sp2 = document.body.appendChild(document.createElement('span'));
	sp2.className = 'span';
	sp2.innerHTML = 'span2';
	var spans = baidu.dom.query('span.span');
	chainMe(baidu.element(spans));
	expect(2);
	baidu.array.each(spans, function(item) {
		ok(baidu.dom.hasClass(item, 'aaa'), 'check class in array');
	});
	document.body.removeChild(sp1.nextSibling);
	document.body.removeChild(sp1);
	document.body.removeChild(sp2.nextSibling);
	document.body.removeChild(sp2);
});

test('封装基础 - 含有get的函数', function() {
	var p = document.body.appendChild(document.createElement('div'));
	p.id = 'first';
	baidu.e(p).setAttr('rel', 'i-m-first');// FIXME 貌似无法直接使用attr，难道是问题？
	var c = p.parentNode.appendChild(document.createElement('div'));
	equals(baidu.element(c).prev().attr("rel"), 'i-m-first',
			'check attr in chain');
	baidu.e(p).remove();
	baidu.e(c).remove();
});

test('封装基础 - each', function() {
	var p = document.body.appendChild(document.createElement('div'));
	p.className = 'berg';
	baidu.dom.setAttr(p, 'rel', 'i-m-parent');
	var c = p.appendChild(document.createElement('div'));
	c.className = 'berg';
	baidu.element(baidu.dom.query('.berg')).each(function(node) {
		node.addClass('classAdded');
	});
	equals(baidu.dom.query(".classAdded").length, 2,
			'check dom length with special class');
	document.body.removeChild(p);
});

test('封装基础 - event封装', function() {
	var p = document.body.appendChild(document.createElement('div'));
	var c = p.appendChild(document.createElement('div'));
	baidu.e(p).addClass('berg').attr('id', 'p');
	baidu.e(c).addClass('berg').attr('id', 'c');
	baidu.e(baidu.dom.query('.berg')).on('click', function(e) {
		ok(true, 'item clicked');
	});
	expect(2);
	ua.click(c);
	baidu.e(p).remove();
});

/**
 * dom方法集合的校验
 * <li>校验方法的集合，方法包含所有baidu.dom中包含的方法
 * <li>不包含drag和ready
 */
test('function list', function() {
	var div = document.body.appendChild(document.createElement('div'));
	var ele = baidu.element(div);
	stop();
	$.get(upath + 'element.php', function(data) {
		var funs = data.split(" "), count = 0;
		var countlose = 0;
		for ( var i = 0; i < funs.length; i++) {
			var f = funs[i];
			var p = ele[f];
			if (p && typeof p == 'function')
				count++;
			else {
				if ('ready drag ddManager create resizable getComputedStyle'
						.indexOf(f) >= 0)
					continue;
				ok(false, '[' + f + '] not in function list');
				countlose++;
			}
		}
		equals(countlose, 0, '没有函数被遗漏');
		start();
	});

});

/**
 * 返回值是第一个参数的包装 draggable droppable resizable
 */
test('返回值是第一个参数的包装 draggable droppable', function() {
	var drag = document.body.appendChild(document.createElement('div'));
	var e = baidu.e(drag);
	e.attr('id', 'drag');// 无返回
	e.draggable().addClass("berg");
	ok(e.hasClass('berg'), "check draggable extend function");
	e.remove();
});

test('返回值是第一个参数的包装 resizable', function() {
	var div1 = document.body.appendChild(document.createElement('div'));
	baidu.e(div1).resizable().addClass("berg").attr('id', 'berg');
	ok(baidu.e(div1).hasClass('berg'), 'has class');
});

/**
 * 直接返回返回值
 * 
 */
test('直接返回返回值 ', function() {
	var div = document.body.appendChild(document.createElement('div'));
	var div1 = div.appendChild(document.createElement('div'));
	div.id = "div";
	div.className = 'berg';
	var text = document.createTextNode("文本内容");
	div.appendChild(text);
	$(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
			'backgroundColor', 'red').css('width', '100px').css('height',
			'100px');
	var dd = baidu.e(div).getText();
	equal(baidu.e(div).getText(), '文本内容', 'check getText : ');
	equal(baidu.e(div).contains(div1), 'true', 'check contains : ');
	equal(baidu.e(div).getAttr('id'), 'div', 'check getAttr : ');
	equal(baidu.e(div).getPosition()[0].left, 0, 'check getPosition : ');
	equal(parseInt(baidu.e(div).getStyle('left')[0], 10), 0,
			'check getStyle : ');
	equal(baidu.e(div).hasClass('berg'), 'true', 'check hasClass : ');
	equal(baidu.e(div).intersect(div1), 'true', 'check intersect : ');
	equal(baidu.e(div).hasAttr('id'), 'true', 'check hasAttr : ');
	baidu.e(div).remove();
	var d = document.getElementById("div");
	equal(d, null, 'check remove : ');
});

test(
		'封装基础 - 构造函数',
		function() {
			var div = document.body.appendChild(document.createElement('DIV'));
			div.innerHTML = new Array(10).join('<span>hello</span>');

			var a = new baidu.element.Element(div);
			equal(a._dom.length, 1, "passed test");
			deepEqual(a._dom, [ div ], "passed test");

			var childs = div.getElementsByTagName('span'), b = new baidu.element.Element(
					childs);
			equal(b._dom.length, 9, "passed test");
			deepEqual(b._dom, baidu.lang.toArray(childs), "passed test");
			var childs = div.getElementsByTagName('span'), b = new baidu.element.Element(
					childs);
			equal(b._dom.length, 9, "passed test");
			deepEqual(b._dom, baidu.lang.toArray(childs), "passed test");

			document.body.removeChild(div);
		});
// test('漏测了关于event的封装', function() {
// ok(baidu.e("*").on);
// // 请QA补充下相关用例
// ok(baidu.e("*").click);
// ok(false);
// });
