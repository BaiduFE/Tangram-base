module('baidu.element');

function chainMe(domObj) {
	domObj.addClass("aaa").insertHTML("afterEnd",
			"<p class='gaga'>oh my lady gaga</p><p class='berg'>berg</p>")
			.next().setStyle("font-weight", "bold").remove();
}

/**
 * 载入依赖包
 */
var jslist = "baidu.dom.draggable,baidu.dom.resizable,"
		+ "baidu.dom.getStyle,baidu.lang.isArray,baidu.array.each,"
		+ "baidu.dom.g,baidu.dom.addClass,baidu.dom.insertHTML,baidu.dom.next,"
		+ "baidu.dom.setStyle,baidu.dom.remove,baidu.dom.query,baidu.dom.setAttr,"
		+ "baidu.dom.prev,baidu.dom.getAttr,baidu.dom.hasClass,baidu.dom.intersect,"
		+ "baidu.dom.getText,baidu.dom.contains,baidu.dom.hasAttr,baidu.event.on,"
		+ "baidu.dom.children,"
		+ "baidu.dom.q,"
		+ "baidu.event.un,baidu.event.stop";

test('封装基础 - 输入字符串', function() {
	stop();
	ua.importsrc(jslist, function() {
		var div = document.body.appendChild(document.createElement('div'));
		div.id = 'aaa';
		chainMe(baidu.element("aaa"));
		equals(baidu.g('aaa').className, 'aaa', 'check class name');
		equals(baidu.dom.query('.gaga').length, 0, 'check sub');
		equals(baidu.dom.query('.berg').length, 1, 'check sub');
		TT.e(div).next().remove();
		TT.e(div).remove();
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
	document.body.removeChild(sp2.nextSibling);
	document.body.removeChild(sp2);
	document.body.removeChild(sp1.nextSibling);
	document.body.removeChild(sp1);
});

test('封装基础 - 含有get的函数', function() {
	var p = document.body.appendChild(document.createElement('div'));
	p.id = 'first';
	baidu.e(p).setAttr('rel', 'i-m-first');
	var c = document.body.appendChild(document.createElement('div'));
	equals(baidu.element(c).prev().attr("rel"), 'i-m-first',
			'check attr in chain');
	baidu.e(p).remove();
	baidu.e(c).remove();
});

test('封装基础 - each', function() {
	var div = document.body.appendChild(document.createElement('div'));
	var b = div.appendChild(document.createElement('div'));
	var c = div.appendChild(document.createElement('div'));

	var count = 0;
	baidu.e([ div, b, c ]).each(function() {
		count++;
		baidu.e(this).addClass('test'); // 问题1，这个this究竟应该是什么？
	});
	equals(count, 3);

    count = 0;
	var a_link = document.body.appendChild(document.createElement('a'));
	baidu.e(a_link).addClass('test');
    console.log(baidu.e(div));
	baidu.e(div).q('test').each(function(item) {
        console.log(item);
		count++; // 问题2，q应该支持当前元素作为父元素的用法
	});
    console.log(document.body.innerHTML);
	equals(count, 2);

    count = 0;
	baidu.e(div).children().each(function(div) {
		count++;// children传入到函数中的应该是每一个元素
	});
	equals(count, 2);
	TT.e([ div, a_link ]).remove();
});

test('event + on + un + stop', function() {
	expect(3);
	stop();
	ua.importsrc('baidu.event.stop', function() {
		var p = document.body.appendChild(document.createElement('div'));
		baidu.e(p).click(function(e) {
			ok(true, 'bind click');
		});
		baidu.e(p).on('click', function(e) {
			ok(true, 'bind on');
		});
		baidu.e(document.body).click(function(e) {
			ok(true, 'propagation');
			baidu.event.stop(e);
		});
		baidu.e(document).click(function() {
			ok(false, 'event stopped');
		});
		TT.event.fire(p, 'click');
		baidu.e(p).un('click');
		baidu.e(document.body).un('click');
		baidu.e(document).un('click');
		TT.event.fire(p, 'click');
		baidu.e(p).remove();
		start();
	}, 'baidu.event.stop');
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
		TT.e(div).remove();
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
	TT.e(drag).remove();
});

test('返回值是第一个参数的包装 resizable', function() {
	var div1 = document.body.appendChild(document.createElement('div'));
	baidu.e(div1).resizable().addClass("berg").attr('id', 'berg');
	ok(baidu.e(div1).hasClass('berg'), 'has class');
	TT.e(div1).remove();
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
