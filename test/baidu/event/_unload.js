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
	expect(1);
	ua.frameExt(function(w, f) {
		var self = this;
		w.baidu.on(w, 'unload', function(){
			setTimeout(function(){
				ok(true, 'user unload will fire');
				self.finish();
			}, 500);
		});
		f.src = "";
	});
});
