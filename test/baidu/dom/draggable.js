module('baidu.dom.draggable');

/* need move mouse before testing */
test('check return value', function() {
	expect(1);
	var div = document.createElement('div');
	document.body.appendChild(div);
	var div1 = baidu.dom.draggable(div);
	ok(baidu.lang.isFunction(div1.cancel), "check return function");
	document.body.removeChild(div);
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
		UserAction.mousemove(div, {
			clientX : 0,
			clientY : 0
		});
		UserAction.mousedown(div, {
			clientX : 0,
			clientY : 0
		});

		var move = function(ele, x, y) {
			if (x >= 100) {
				UserAction.mouseup(ele);
				equal(parseInt($(ele).css('left')), 100);
				equal(parseInt($(ele).css('top')), 50);
				document.body.removeChild(div);
				start();
			} else {
				UserAction.mousemove(document, {
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
			equal(parseInt($(ele).css('left')), 0, 'start left');
			equal(parseInt($(ele).css('top')), 0, 'start top');
		},
		ondrag : function(ele, op) {
			ok(true, 'drag');
		},
		ondragend : function(ele, op) {
			setTimeout(function() {
				equal(parseInt($(ele).css('left')), 30, 'stop left');
				equal(parseInt($(ele).css('top')), 20, 'stop top');
				document.body.removeChild(div);
				start();
			}, 1);
		},
		range : [ 20, 130, 120, 30 ]
	});
	UserAction.mousemove(document, {
		clientX : 0,
		clientY : 0
	});

	UserAction.mousedown(div, {
		clientX : 0,
		clientY : 0
	});
	setTimeout(function() {
		UserAction.mousemove(document, {
			clientX : 50,
			clientY : 50
		});
	}, 50);
	setTimeout(function() {
		UserAction.mouseup(div);
	}, 100);
});

test('undraggble', function() {
	stop();
	var check = function() {
		var div = document.body.appendChild(document.createElement("div"));
		$(div).css('width', 10).css('height', 10).css('backgroundColor', 'red')
				.css('position', 'absolute').css('top', 0).css('left', 0);
		var re = baidu.dom.draggable(div, {
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
		re.cancel();
		setTimeout(function() {
			ua.dragto(div, {
				startX : 2,
				startY : 2,
				endX : 12,
				endY : 12,
				callback : function() {
					equals(parseInt($(div).css('left')), 0);
					equals(parseInt($(div).css('top')), 0);
					$(div).remove();
					start();
				}
			});
		}, 50);
	};
	
	ua.importsrc('baidu.dom.ddManager', check, 'baidu.dom.ddManager', 'baidu.dom.draggable');
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

	UserAction.mousemove(document, {
		clientX : 0,
		clientY : 0
	});
	UserAction.mousedown(div, {
		clientX : 0,
		clientY : 0
	});
	setTimeout(function() {
		UserAction.mousemove(div, {
			clientX : 100,
			clientY : 50
		});
	}, 20);
	setTimeout(function() {
		UserAction.mouseup(div);
		start();
	}, 60);
});
