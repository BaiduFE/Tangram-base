module('baidu.dom.droppable');

/**
 * 三个用例分别校验
 * <li>移过
 * <li>移入
 * <li>cancel方法
 */

(function() {
	var s = document.createElement("script");
	document.head.appendChild(s);
	s.type = "text/javascript";
	s.src = "../../../src/baidu/lang/Class/$removeEventListener";
	
	var draghandle, drophandle, dragele, dropele, _ondropover, _ondrop, _ondropout;
	/**
	 * 初始化环境，包括droppable和创建元素等
	 */
	var beforecheck = function(callback) {
		$(document.body).append('<div id="drag"></div>').append(
				'<div id="drop"></div>');
		$('#drag').css('width', 20).css('height', 20).css('left', 20).css(
				'top', 20).css('backgroundColor', '#0f0')
				.css('border', 'solid').css('position', 'absolute');
		$('#drop').css('width', 50).css('height', 50).css('left', 50).css(
				'top', 50).css('border', 'solid').css('position', 'absolute');
		dragele = $('#drag')[0];
		dropele = $('#drop')[0];
		ua.mousemove(document, {
			clientX : 0,
			clientY : 0
		});
		draghandle = baidu.dom.draggable(dragele);

		setTimeout(function() {/* draggable中有异步处理的代码导致此处必须延迟处理 */
			var checkevent = function(expect, eventname) {
				return function(){ok(expect, eventname + ' dispatched!');};
			};
			var op = {
				ondropover : checkevent(_ondropover, 'ondropover'),
				ondrop : checkevent(_ondrop, 'ondrop'),
				ondropout : checkevent(_ondropout, 'ondropout')
			};
			drophandle = baidu.dom.droppable(dropele, op);
			if(_ondropover == 0)
				drophandle.cancel();
			ua.mousedown(dragele, {
				clientX : 0,
				clientY : 0
			});
			callback();
		}, 15);
	};

	/**
	 * 测试步骤模型
	 */
	function run(_over, _drop, _out) {
		_ondropover = _over, _ondrop = _drop, _ondropout = _out;
		stop();
		var sx = 0, sy = 0, ex = _ondropout || !_ondropover ? 150 : 60, ey = _ondropout ? 150
				: 60, mi = 20, ti = 22, drag, drop;
		var move = function() {
			ua.mousemove(document, {
				clientX : sx += mi,
				clientY : sy += mi
			});
			if (sx < ex)
				setTimeout(function() {
					move();
				}, ti);
			else {
				ua.mouseup(dragele, {
					clientX : ex,
					clientY : ey
				});
				drophandle.cancel();
				start();
			}
		};
		if (!baidu.dom.draggable) {
			ua.importsrc('baidu.dom.draggable', function() {
				beforecheck(move);
			}, 'baidu.dom.draggable', 'baidu.dom.droppable');
		} else
			beforecheck(move);
	};

	test('drop over', function() {
		run(1, 0, 1);
	});

	test('drop', function() {
		run(1, 1, 0);
	});

	test('cancel', function() {
		run(0, 0, 0);
	});
})();
