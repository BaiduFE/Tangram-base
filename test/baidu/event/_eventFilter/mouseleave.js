module('baidu.event._eventFilter.mouseleave');

/*
 * 今天做一个下拉菜单的时候碰到了一个bug，用mouseout的时候，鼠标还没移出拉菜单就自动关闭了，
 * 
 * 大家知道事件的冒泡特性，在上面的BUG中也正是因为这个冒泡特性，对于mouseover事件来说 ，当鼠标从其他元素 移动到
 * child节点时发生，但此事件会冒泡 所以会导致 parent 也出发mouseover。如果我们对 parent注册了 mouseover监听，从
 * parent移动到child 同样出发parent的mouseover 有时候我们不希望这样的事情发生。
 * 
 * 对于 mouseover 和mouseenter 两个事件 最大的区别就是 mouseenter 是 不冒泡的事件，这时候 如果注册的监听
 * 是mouseenter的话 无论鼠标从任何元素 移动到child时 只有child元素 发生mouseenter事件 而其祖宗节点 都不会因为冒泡
 * 而触发此事件。
 * 
 * 对于 mouseout 和mouseleave 也是如此 当鼠标从child 移出时 mouseout同样会冒泡到 parent 从而触发parent的
 * mouseout 二mouseleave 同样无此问题。
 */

/*
 * 
 * 2.w3school 解释:
 * 
 * relatedTarget 事件属性返回与事件的目标节点相关的节点。
 * 
 * 对于 mouseover 事件来说，该属性是鼠标指针移到目标节点上时所离开的那个节点。
 * 
 * 对于 mouseout 事件来说，该属性是离开目标时，鼠标指针进入的节点。
 * 
 * 对于其他类型的事件来说，这个属性没有用。
 */

test('on and un', function() {
	stop();
	ua.importsrc('baidu.event.on,baidu.event.un', function() {
		var me = baidu.event._eventFilter.mouseleave;
		var type = 'mouseleave';
		if (window.attachEvent) {
			equals(me, null, 'return null if ie');
			start();
			return;
		}

		var div = document.body.appendChild(document.createElement('div'));
		$(div).css('width', 20).css('height', 20)
				.css('background-color', 'red');
		var div1 = document.body.appendChild(document.createElement('div'));
		$(div1).css('width', 20).css('height', 20).css('background-color',
				'blue');
		/**
		 * e0上派发，e1上监听，e2是前对象
		 */
		var check = function(eles, callback) {
//			var ae = me(null, 'mouseleave', callback);
			baidu.event.on(eles[0], type, callback);
			ua.mouseout(eles[1], {
				relatedTarget : eles[2]
			});
			baidu.event.un(eles[0], type, callback);
		};

		/**
		 * 绑定div 触发div
		 */
		check( [ div, div, document.body ], function() {
			ok(true, 'body 进入 div');
		});

		/**
		 * 绑定body，冒泡 触发div
		 */
		check( [ document.body, div, document.body ], function() {
			ok(false);
		});

		/**
		 * 绑定div 触发div 关联div1
		 */
		check( [ div, div, div1 ], function() {
			ok(true, 'div 进入 div1');
		});

		$(div).remove();
		$(div1).remove();
		expect(2);
		start();
	}, 'baidu.event.un', 'baidu.event._eventFilter.mouseleave');
});