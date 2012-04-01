module('baidu.dom.draggable');

var clear = function(element, dd, needstart) {
	if (element)
		$(element).remove();
	if (dd && dd.dispose && typeof dd.dispose == 'function')
		dd.dispose();
	if (needstart)
		start();
};

/* need move mouse before testing */
test('check return value', function() {
	stop();
	expect(1);
	ua.importsrc("baidu.dom.getPosition", function(){
		var div = document.createElement('div');
		document.body.appendChild(div);
		var div1 = baidu.dom.draggable(div);
		ok(baidu.lang.isFunction(div1.cancel), "check return function");
		clear(div, div1);
		start();
	}, "baidu.dom.getPosition", "baidu.dom.drag");
});

test('drag,no options', function() {
	stop();
	expect(2);
	var div = document.createElement('div');
	document.body.appendChild(div);
	$(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
			'backgroundColor', 'red').css('width', '100px').css('height',
			'100px');
	var div1 = baidu.dom.draggable(div);// 注册onmousedown事件
	ua.mousemove(div, {
		clientX : 0,
		clientY : 0
	});
	ua.mousedown(div, {
		clientX : 0,
		clientY : 0
	});

	var move = function(ele, x, y) {
		if (x >= 100) {
			ua.mouseup(ele);
			equal(baidu.dom.getPosition(div).left, 100, "stop left");
			equal(baidu.dom.getPosition(div).top, 50, "stop top");
			clear(div, div1, true);
		} else {
			ua.mousemove(document, {
				clientX : x + 10,
				clientY : y + 5
			});
			setTimeout(function() {
				move(ele, x + 10, y + 5);
			}, 20);
		}
	};
	move(div, 0, 0);
});

test('drag, static', function() {
	stop();
	expect(3);
	var div = document.createElement('div');
	document.body.appendChild(div);
	$(div).css('position', 'static').css('left', '0').css('top', '0').css(
			'backgroundColor', 'red').css('width', '100px').css('height',
			'100px');
	var oleft = baidu.dom.getPosition(div).left;
	var otop = baidu.dom.getPosition(div).top;
	var div1 = baidu.dom.draggable(div);// 注册onmousedown事件
	ua.mousemove(div, {
		clientX : 0,
		clientY : 0
	});
	ua.mousedown(div, {
		clientX : 0,
		clientY : 0
	});

	var move = function(ele, x, y) {
		if (x >= 100) {
			ua.mouseup(ele);
			equal(baidu.dom.getPosition(div).left, oleft, "stop left, the ele is not dragged");
			equal(baidu.dom.getPosition(div).top, otop, "stop top, the ele is not dragged");
			equal($(div).css('position'), 'static', "The ele is still static");
			clear(div, div1, true);
		} else {
			ua.mousemove(document, {
				clientX : x + 10,
				clientY : y + 5
			});
			setTimeout(function() {
				move(ele, x + 10, y + 5);
			}, 20);
		}
	};
	move(div, 0, 0);
});

test('options', function() {
	stop();
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.id = 'div_test';

	$(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
			'height', '100px').css('width', '100px').css('backgroundColor',
			'red');
	var div1 = baidu.dom.draggable('div_test', {
		ondragstart : function(ele, op) {
			equal(baidu.dom.getPosition(div).left, 0, 'start left');
			equal(baidu.dom.getPosition(div).top, 0, 'start top');
		},
		ondrag : function(ele, op) {
			ok(true, 'drag');
		},
		ondragend : function(ele, op) {
			setTimeout(function() {
				equal(parseInt($(ele).css('left')), 30, 'stop left');
				equal(parseInt($(ele).css('top')), 20, 'stop top');
				clear(div, div1, true);
			}, 1);
		},
		range : [ 20, 130, 120, 30 ]
	});
	ua.mousemove(document, {
		clientX : 0,
		clientY : 0
	});

	ua.mousedown(div, {
		clientX : 0,
		clientY : 0
	});
	setTimeout(function() {
		ua.mousemove(document, {
			clientX : 50,
			clientY : 50
		});
	}, 50);
	setTimeout(function() {
		ua.mouseup(div);
	}, 100);
});

test('undraggble', function() {
	stop();
	var check = function() {
		var div = document.body.appendChild(document.createElement("div"));
		$(div).css('width', 10).css('height', 10).css('backgroundColor', 'red')
				.css('position', 'absolute').css('top', 0).css('left', 0);
		var div1 = baidu.dom.draggable(div, {
			ondragstart : function() {
				ok(false, '方法不应该被触发');
			},
			ondrag : function() {
				ok(false, '方法不应该被触发');
			},
			ondragend : function() {
				ok(false, '方法不应该被触发');
			}
		});
		div1.cancel();
		setTimeout(function() {
			ua.dragto(div, {
				startX : 2,
				startY : 2,
				endX : 12,
				endY : 12,
				callback : function() {
					equals(baidu.dom.getPosition(div).left, 0);
					equals(baidu.dom.getPosition(div).top, 0);
					clear(div, div1, true);
				}
			});
		}, 50);
	};

	ua.importsrc('baidu.dom.ddManager', check, 'baidu.dom.ddManager',
			'baidu.dom.draggable');
});

test('ddManager', function() {
	stop();
	var div = document.createElement('div');
	document.body.appendChild(div);
	$(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
			'backgroundColor', 'red').css('width', '100px').css('height',
			'100px');
	var div1 = baidu.dom.draggable(div);

	var manager = baidu.dom.ddManager;
	dragstart = function() {
		ok(true, "dragstart from manager");
	};
	dragging = function() {
		ok(true, "ondrag from manager");
	};
	dragend = function() {
		ok(true, "ondragend from manager");
	};
	manager.addEventListener("ondragstart", dragstart);
	manager.addEventListener("ondrag", dragging);
	manager.addEventListener("ondragend", dragend);

	ua.mousemove(document, {
		clientX : 0,
		clientY : 0
	});
	ua.mousedown(div, {
		clientX : 0,
		clientY : 0
	});
	setTimeout(function() {
		ua.mousemove(div, {
			clientX : 100,
			clientY : 50
		});
	}, 20);
	setTimeout(function() {
		ua.mouseup(div);
		clear(div, div1, true);
	}, 60);
});

//
//// 测试非static元素是否可以正确移动，为便于定位，元素追加至某有特殊定位的父元素中
//test('element none static', function() {
//	var div = document.body.appendChild(document.createElement('div'));
//	div.id = 'test_div1';
//	$(div).css('position', 'fixed').css('width', 20).css('height', 20).css(
//			'backgroundColor', 'red');
//	var div1 = baidu.dom.draggable(div);
////	equals($(div).css('position'), 'relative',
////			'position应该更新为relative');
//	/* 尝试拖动确认可以正确工作 */
//	stop();
//	setTimeout(function() {
//		ua.dragto(div, {// 鼠标从2移动到12，元素应该也同步移动10
//			startX : 2,
//			startY : 2,
//			endX : 12,
//			endY : 12,
//			callback : function() {
//				equals($(div).css('position'), 'fixed');
////				equals(parseInt($(div).css('top')), 10);
////				clear(div, div1, true);
//			}
//		});
//	}, 50);
//});
