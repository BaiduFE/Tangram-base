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
		equals(baidu.g('aaa').className, ' aaa', 'check class name');
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
	baidu.dom.setAttr(p, 'rel', 'i-m-first');
	var c = p.parentNode.appendChild(document.createElement('div'));
	c.id = 'next';
	c.innerHTML = 'next';
	equals(baidu.element("next").prev().attr("rel"), 'i-m-first',
			'check attr in chain');
	document.body.removeChild(p);
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
	p.className = 'berg';
	var c = p.appendChild(document.createElement('div'));
	c.className = 'berg';
	baidu.element(baidu.dom.query('.berg')).on('click', function() {
		ok(true, 'item clicked');
	});
	expect(2);
	UserAction.click(c);
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
		for ( var i = 0; i < funs.length; i++) {
			var f = funs[i];
			var p = ele[f];
			if (p && typeof p == 'function')
				count++;
			else {
				if ('ready drag ddManager create resizable'.indexOf(f) >= 0)
					continue;
				ok(false, '[' + f + '] not in function list');
			}
		}
		start();
	});

});

/**
 * 返回值是第一个参数的包装 draggable droppable resizable
 */
test('返回值是第一个参数的包装 draggable droppable', function() {
	stop();
	var drag = document.body.appendChild(document.createElement('div'));
	var drop = document.body.appendChild(document.createElement('div'));
	drag.id = "drag";
	drop.id = "drop";
	$('#drag').css('width', 20).css('height', 20).css('left', 20)
			.css('top', 20).css('backgroundColor', '#0f0').css('border',
					'solid').css('position', 'absolute');
	$('#drop').css('width', 50).css('height', 50).css('left', 50)
			.css('top', 50).css('border', 'solid').css('position', 'absolute');
	baidu.e(drag).draggable().addClass("berg");
	UserAction.mousemove(document, {
		clientX : 0,
		clientY : 0
	});
	UserAction.mousedown(drag, {
		clientX : 0,
		clientY : 0
	});
	setTimeout(function() {
		var op = {
			ondropover : function() {
				ok(true, "droppable ondropover");
			},
			ondrop : function() {
				ok(true, "droppable ondrop");
			},
			ondropout : function() {
				ok(true, "droppable ondropout");
			}
		};
//		baidu.e(drop).droppable(op).addClass("berg");
	}, 15);
	setTimeout(function() {
		UserAction.mousemove(drag, {
			clientX : 30,
			clientY : 30
		});
	}, 30);
	setTimeout(function() {
		UserAction.mouseup(drag);
		equal(drag.className, " berg", "check draggable extend function");
//		equal(drop.className, " berg", "check droppable extend function");
		equal(baidu.dom.getStyle(drag, 'left'), '50px', '');
		equal(baidu.dom.getStyle(drag, 'top'), '50px');
		document.body.removeChild(drag);
		document.body.removeChild(drop);
		start();
	}, 60)

});

// test('返回值是第一个参数的包装 resizable', function() {
// var div1 = document.body.appendChild(document.createElement('div'));
// div1.id = "div1";
// $(div1).css('position', 'absolute').css('left', '0').css('top', '0').css(
// 'height', '100px').css('width', '100px').css('backgroundColor','red');
// var options = {
// onresizestart : function(){
// ok(true,"element extend resizeable success");
// }
// };
// baidu.e(div1).resizable().addClass("berg");
// UserAction.mousemove(document, {
// clientX : 100,
// clientY : 50
// });
// UserAction.mousedown(div1, {
// clientX : 100,
// clientY : 50
// });
// setTimeout(function() {
// UserAction.mousemove(div1, {
// clientX : 150,
// clientY : 50
// });
// }, 30);
// setTimeout(function() {
// UserAction.mouseup(div1);
// equal(div1.className," berg","check resizeable extend function");
// equal(baidu.dom.getStyle(div1,"left"),'150px',"div left change to : ");
// document.body.removeChild(div1);
// },60);
//
// });

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
  equal(parseInt(baidu.e(div).getStyle('left')[0], 10), 0, 'check getStyle : ');
	equal(baidu.e(div).hasClass('berg'), 'true', 'check hasClass : ');
	equal(baidu.e(div).intersect(div1), 'true', 'check intersect : ');
	equal(baidu.e(div).hasAttr('id'), 'true', 'check hasAttr : ');
	baidu.e(div).remove();
	var d = document.getElementById("div");
	equal(d, null, 'check remove : ');
});
