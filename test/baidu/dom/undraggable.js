module('baidu.dom.undraggable');

test('正常用例', function() {
	stop();
	var check = function() {
		var div = document.body.appendChild(document.createElement("div"));
		$(div).css('width', 10).css('height', 10).css('backgroundColor', 'red')
				.css('position', 'absolute').css('top', 0).css('left', 0);
		baidu.dom.draggable(div, {
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
		baidu.dom.undraggable(div);
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
	if (!baidu.dom.draggable) {
		ua.importsrc('baidu.dom.draggable', check);
	} else
		check();
});

/**
 * multi handler如何注册是个问题~
 */
//test('在一个元素上添加两个不同handler的draggable行为', function() {
//	stop();
//	var div = document.body.appendChild(document.createElement("div"));
//	$(div).css('width', 10).css('height', 10).css('backgroundColor', 'red')
//			.css('position', 'absolute').css('top', 0).css('left', 0);
//	baidu.dom.draggable(div, {
//		ondragstart : function() {
//			ok(false, '方法不应该被触发');
//		},
//		ondrag : function() {
//			ok(false, '方法不应该被触发');
//		},
//		ondragend : function() {
//			ok(false, '方法不应该被触发');
//		}
//	});
//
//	baidu.dom.undraggable(div);
//	
//	setTimeout(function() {
//		ua.dragto(div, {
//			startX : 2,
//			startY : 2,
//			endX : 12,
//			endY : 12,
//			callback : function() {
//				start();
//			}
//		});
//	}, 50);
//});
