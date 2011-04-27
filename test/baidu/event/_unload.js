module("baidu.event._unload");

// normal
test("normal on and unload all eventlistener", function() {
	stop();
	ua.importsrc('baidu.event.on', function() {
		var handle_a = function() {
			ok(true, "div click");
		};
		var handle_b = function() {
			ok(true, "div mouseover");
		};
		var div = document.body.appendChild(document.createElement('div'));
		baidu.on(div, "onclick", handle_a);
		baidu.on(div, "onmouseover", handle_b);
		ua.click(div);
		ua.mouseover(div);
		baidu.event._unload();
		ua.click(div);
		ua.mouseover(div);
		document.body.removeChild(div);
		start();
	}, 'baidu.event.on', 'baidu.event._unload');
});
// unload Event 
test("window unload", function() {
	ua.frameExt(function(w, f) {
		var op = this;

		var fn = function() {
			equals(w.baidu.event._listeners.length, 0, "监听器应该被清空");
			start();
		};
		if (w.attachEvent) {
			w.attachEvent('onunload', fn);
		} else {
			w.addEventListener('unload', fn, false);
		}
		setTimeout(function() {
			$(f)[0].src = 'http://www.baidu.com';
			$(f).remove();
		}, 500);
	})
});
