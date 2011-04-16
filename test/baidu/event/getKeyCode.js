module("baidu.dom.getKeyCode");

test('getKeyCode', function() {
	expect(2);
	var i = 0, element = document.body, type = 'keypress';
	var fn = function(e) {
		e = e || window.event;
		equal(baidu.event.getKeyCode(e), 50);
		i++;
	};
	if (document.body.addEventListener) {
		document.body.addEventListener(type, fn, false);
	} else if (document.body.attachEvent) {
		document.body.attachEvent('on' + type, fn);
	}
	ua.fireKeyEvent('keypress', document.body, {
		'keyCode' : 50
	});
	if (element.removeEventListener) {
		element.removeEventListener(type, fn, false);
	} else if (element.detachEvent) {
		element.detachEvent('on' + type, fn);
	}
	equal(i, 1, 'i count once');
});

test('document', function() {
	expect(2);
	var i = 0, type = 'keypress', element = document;
	var fn = function(e) {
		e = e || window.event;
		equal(baidu.event.getKeyCode(e), 8);
		i++;
	};
	if (element.addEventListener) {
		element.addEventListener(type, fn, false);
	} else if (document.body.attachEvent) {
		element.attachEvent('on' + type, fn);
	}
	ua.fireKeyEvent('keypress', document, {
		'keyCode' : 8
	});
	if (element.removeEventListener) {
		element.removeEventListener(type, fn, false);
	} else if (element.detachEvent) {
		element.detachEvent('on' + type, fn);
	}
	ua.fireKeyEvent('keypress', document, {
		'keyCode' : 8
	});
	equal(i, 1, 'i count once');
});

test('Esc', function() {
	expect(2);
	var i = 0, type = 'keypress', element = document;
	var fn = function(e) {
		e = e || window.event;
		equal(baidu.event.getKeyCode(e), 27);
		i++;
	};
	if (element.addEventListener) {
		element.addEventListener(type, fn, false);
	} else if (document.body.attachEvent) {
		element.attachEvent('on' + type, fn);
	}
	ua.fireKeyEvent('keypress', document, {
		'keyCode' : 27
	});
	if (element.removeEventListener) {
		element.removeEventListener(type, fn, false);
	} else if (element.detachEvent) {
		element.detachEvent('on' + type, fn);
	}
	equal(i, 1, 'i count once');
});