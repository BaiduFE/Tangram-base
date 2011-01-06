module("baidu.event.getPageX");

var checkX = function(x, offset, type) {// 不直接调用这个方法，防止页面出现滚动条的情况，统一调用checkscrollX
	var fn = function(e) {
		equal(baidu.event.getPageX(e), (x + offset) || 0, type + ' get PageX '
				+ (x + offset));
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
			clientX : x,
			clientY : 0
		});
	}
	if (element.removeEventListener) {
		element.removeEventListener(type, fn, false);
	} else if (element.detachEvent) {
		element.detachEvent('on' + type, fn);
	}
};

var checkscrollX = function(x, offset, type) {// 通过设置div的宽度制造滚动条，从而可以设置scrollLeft
//	var img = document.createElement('img');
//	document.body.appendChild(img);
//	img.style.width = '5000px';// 用于产生滚动条
//	img.style.border = '3px';
//	img.src = upath + 'test.jpg';
//	window.scrollTo(offset, document.body.scrollTop);// scrollLeft set to be
//														// 2000
//	checkX(x, offset, type);
//	window.scrollTo(0, document.body.scrollTop);
//	document.body.removeChild(img);
	
	var div = document.createElement('div');
	document.body.appendChild(div);
	$(div).css('width', 5000).css('height', 5000).css('border', 'solid');
	window.scrollTo(offset, document.body.scrollTop);
	checkX(x, offset, type);
	window.scrollTo(0, document.body.scrollTop);
	document.body.removeChild(div);
};

test("getPageX", function() {
	expect(8);
	checkscrollX(0, 0);
	checkscrollX(100, 200, 'mousedown');
	checkscrollX(0, 0, 'mousemove');
	checkscrollX(100, 0, 'mouseover');
	checkscrollX(10, 200, 'mousemove');
	checkscrollX(0, 0, 'mouseout');
	checkscrollX(100, 200, 'click');
	checkscrollX(10, 20, 'dblclick');
});
