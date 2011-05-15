module('baidu.dom.drag');
/**
 * base stop update range autoStop
 * 
 * <li>mock mouse move and check dom position
 * 
 */
(function() {
	var td = QUnit.testDone;
	var te = {
		dom : []
	};
	QUnit.testDone = function() {
		TT.array.each(te.dom, function(node) {
			TT.e(node).remove();
		});
		td.apply(this, arguments);
	};

	/**
	 * 追加一个check方法，返回拖动及拖动元素，并增加一些预处理操作
	 * <li>开始会先移动鼠标到0,0或者特定位置
	 * <li>创建div并追加到自动清除列表
	 */
	window.drag_check = function(opt) {
		TT.event.fire(document.body, 'mousemove', {
			clientX : 0,
			clientY : 0
		});
		TT.e(document.body)
				.insertHTML('beforeend', '<div id="test_div"></div>');
		TT.e(document.body).setStyle('margin', 0).setStyle('padding', 0);
		var div = TT.e("test_div").setStyle('position', 'absolute').setStyle(
				'height', 10).setStyle('width', 10).setStyle(
				'background-color', 'red').setStyle('left', 0).setStyle('top',
				0)._dom[0];
		te.dom.push(div);
		opt = opt || {};
		var dc = {
			d : baidu.dom.drag(div, opt),
			dom : div,
			move : function(op, timeout, after) {
				var callback = function() {
					TT.event.fire(document.body, 'mousemove', op);
					after && after();
				};
				timeout ? setTimeout(callback, timeout) : callback();
			},
			check : function() {
				equals(parseInt(TT.e(div).style('left')), dc.check.left,
						"check left after drag");
				equals(parseInt(TT.e(div).style('top')), dc.check.left,
						"check top after drag");
			}
		};
		return dc;
	};
})();

/**
 * ondragstart ondragend ondrag
 */
test('base and events', function() {
	expect(5);
	var noDragging = true;
	var dc = window.drag_check({
		ondragstart : function() {
			ok(true, 'drag start');
		},
		ondrag : function() {
			if (noDragging) {
				ok(true, 'dragging');
				noDragging = false;
			}
		},
		ondragend : function() {
			ok(true, 'drag end');
		}
	});
	// 启动前，等待200
	QUnit.stop();
	ua.fnQueue().add(function() {
		dc.move({
			clientX : 50,
			clientY : 50
		});
	}, 50).add(function() {
		dc.check.left = 50;
		dc.check();
		dc.d.stop();
	}, 50).add(QUnit.start, 50).next();
});

test('update', function() {
	var dc = window.drag_check({
		autoStop : false,
		ondragend : function() {
			ok(enstop, 'stop not trigger by mouseup');
		}
	});
	var enstop = false;
	// mouseup不应该出发drag的stop
	TT.event.fire(document.body, 'mouseup');

	QUnit.stop();
	ua.fnQueue().add(function() {
		dc.move({
			clientX : 50,
			clientY : 50
		});
	}, 50).add(function() {
		dc.check.left = 0;
		dc.check();
		enstop = true;
		dc.d.stop();
	}).add(QUnit.start, 50).next();
});

test('range and update range', function() {
	var dc = window.drag_check({
		range : [ 0, 100, 100, 0 ]
	// 上右下左
	});
	QUnit.stop();
	ua.fnQueue().add(function() {
		dc.move({
			clientX : 50,
			clientY : 50
		});
	}, 50).add(function() {
		dc.check.left = 50;
		dc.check();
	}, 50).add(function() {
		dc.move({// out of range
			clientX : 100,
			clientY : 100
		});
	}, 50).add(
			function() {
				ok(parseInt(TT.e(dc.dom).style('left')) < 100,
						"check left after drag");
				ok(parseInt(TT.e(dc.dom).style('top')) < 100,
						"check top after drag");
				dc.d.update({
					range : [ 0, 200, 200, 0 ]
				});
			}, 50).add(function() {
		dc.move({// out of range
			clientX : 150,
			clientY : 150
		});
	}, 50).add(function() {
		dc.check.left = 150;
		dc.check();
		dc.d.stop();
	}, 50).add(QUnit.start, 50).next();

});
// test('drag with update', function() {
// stop();
// expect(2);
// var div = document.createElement('div');
// document.body.appendChild(div);
// $(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
// 'height', '100px').css('width', '100px').css('backgroundColor','red');
// ua.mousemove(document, {
// clientX : 0,
// clientY : 0
// });
// var d = baidu.dom.drag(div, {
// ondragend : function(ele, op) {
// setTimeout(function() {
// equal(parseInt($(ele).css('left')), 100, 'stop left');
// equal(parseInt($(ele).css('top')), 50, 'stop top');
// document.body.removeChild(div);
// start();
// }, 1);
// }
// });
// var options = {
// ondragend : function(ele, op) {
// setTimeout(function() {
// equal(parseInt($(ele).css('left')), 150, 'stop left');
// equal(parseInt($(ele).css('top')), 100, 'stop top');
// document.body.removeChild(div);
// start();
// }, 1);
// }
// };
// d.update(options);
// setTimeout(function() {
// ua.mousemove(document, {
// clientX : 150,
// clientY : 100
// });
// }, 50);
// setTimeout(function() {
// ua.mouseup(document);
// }, 100);
// });
//
// test('drag', function() {
// stop();
// // if (ua.browser.opera) {
// // expect(4);
// // } else
// expect(2);
// var div = document.createElement('div');
// document.body.appendChild(div);
// $(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
// 'height', '100px').css('width', '100px').css('backgroundColor',
// 'red');
// ua.mousemove(document, {
// clientX : 0,
// clientY : 0
// });
// var d = baidu.dom.drag(div, {
// ondrag : function(ele, op) {
// // ok(true,'div is dragged');
// },
// ondragend : function(ele, op) {
// setTimeout(function() {
// equal(parseInt($(ele).css('left')), 100, 'stop left');
// equal(parseInt($(ele).css('top')), 50, 'stop top');
// document.body.removeChild(div);
// start();
// }, 1);
// }
// });
//	
// setTimeout(function() {
// ua.mousemove(document, {
// clientX : 100,
// clientY : 50
// });
//
// }, 50);
// setTimeout(function() {
// ua.mouseup(document);
// }, 100);
// });
//
// test('drag within range from outside to edge', function() {
// stop();
// expect(4);
// var div = document.createElement('div');
// document.body.appendChild(div);
// ua.mousemove(document, {
// clientX : 0,
// clientY : 0
// });
// $(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
// 'height', '100px').css('width', '100px').css('backgroundColor',
// 'red');
// baidu.dom.drag(div, {
// ondragstart : function(ele, op) {
// equal(parseInt($(ele).css('left')), 0, 'start left');
// equal(parseInt($(ele).css('top')), 0, 'start top');
// },
// ondragend : function(ele, op) {
// setTimeout(function() {
// equal(parseInt($(ele).css('left')), 30, 'stop left');
// equal(parseInt($(ele).css('top')), 30, 'stop top');
// document.body.removeChild(div);
// start();
// }, 1);
// },
// range : [ 20, 130, 130, 30 ]//上右下左
// });
// // move(div, 0, 0);
// setTimeout(function() {
// ua.mousemove(document, {
// clientX : 50,
// clientY : 50
// });
// }, 50);
// setTimeout(function() {
// ua.mouseup(div);
// }, 100);
// });
//
// test('drag within range from inside to edge', function() {
// stop();
// expect(4);
// var div = document.createElement('div');
// document.body.appendChild(div);
// ua.mousemove(document, {
// clientX : 0,
// clientY : 0
// });
// $(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
// 'height', '50px').css('width', '50px').css('backgroundColor',
// 'red');
// baidu.dom.drag(div, {
// ondragstart : function(ele, op) {
// equal(parseInt($(ele).css('left')), 0, 'start left');
// equal(parseInt($(ele).css('top')), 0, 'start top');
// },
// ondragend : function(ele, op) {
// setTimeout(function() {
// equal(parseInt($(ele).css('left')), 80, 'stop left');
// equal(parseInt($(ele).css('top')), 80, 'stop top');
// document.body.removeChild(div);
// start();
// }, 1);
// },
// range : [ 0, 130, 130, 0 ]//上右下左
// });
// setTimeout(function() {
// ua.mousemove(document, {
// clientX : 80,
// clientY : 80
// });
// }, 50);
// setTimeout(function() {
// ua.mouseup(div);
// }, 100);
// });
//
// test('drag within range from inside to outside', function() {
// stop();
// expect(4);
// var div = document.createElement('div');
// document.body.appendChild(div);
// ua.mousemove(document, {
// clientX : 0,
// clientY : 0
// });
// $(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
// 'height', '50px').css('width', '50px').css('backgroundColor',
// 'red');
// baidu.dom.drag(div, {
// ondragstart : function(ele, op) {
// equal(parseInt($(ele).css('left')), 0, 'start left');
// equal(parseInt($(ele).css('top')), 0, 'start top');
// },
// ondragend : function(ele, op) {
// setTimeout(function() {
// equal(parseInt($(ele).css('left')), 80, 'stop left');
// equal(parseInt($(ele).css('top')), 80, 'stop top');
// document.body.removeChild(div);
// start();
// }, 1);
// },
// range : [ 0, 130, 130, 0 ]//上右下左
// });
// setTimeout(function() {
// ua.mousemove(document, {
// clientX : 150,
// clientY : 150
// });
// }, 50);
// setTimeout(function() {
// ua.mouseup(div);
// }, 100);
// });
