module("baidu.event.getPageY");

var checkX = function(y, offset, type) {// 不直接调用这个方法，防止页面出现滚动条的情况，统一调用checkscrollX
	var fn = function(e) {
		equal(baidu.event.getPageY(e), (y + offset) || 0, type + ' get PageY '
				+ (y + offset));
	};
	type = type || 'mousedown';
	offset = offset || 0;
	var element = document.body;
	if (element.addEventListener) {
		element.addEventListener(type, fn, false);
	} else if (document.body.attachEvent) {
		element.attachEvent('on' + type, fn);
	}
	if (UserAction[type] && typeof UserAction[type] == 'function') {
		UserAction[type](element, {
			clientX : 0,
			clientY : y
		});
	}
	if (element.removeEventListener) {
		element.removeEventListener(type, fn, false);
	} else if (element.detachEvent) {
		element.detachEvent('on' + type, fn);
	}
};

var checkscrollY = function(x, offset, type) {// 通过设置div的宽度制造滚动条，从而可以设置scrollLeft
	var div = document.createElement('div');
	document.body.appendChild(div);
	$(div).css('width', 200).css('height', 5000).css('border', 'solid');
	window.scrollTo(document.body.scrollLeft, offset);
	checkX(x, offset, type);
	window.scrollTo(document.body.scrollLeft, 0);
	document.body.removeChild(div);
};

test("getPageX", function() {
	expect(8);
	checkscrollY(0, 0);
	checkscrollY(100, 200, 'mousedown');
	checkscrollY(0, 0, 'mousemove');
	checkscrollY(100, 0, 'mouseover');
	checkscrollY(10, 200, 'mousemove');
	checkscrollY(0, 0, 'mouseout');
	checkscrollY(100, 200, 'click');
	checkscrollY(10, 20, 'dblclick');
});
