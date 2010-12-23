module("baidu.dom.resizable");

test("base", function() {
	// 添加了三个元素，e、s、es
	var div = document.body.appendChild(document.createElement("div"));
	$(div).css("width", 40).css("height", 40).css("position", "absolute").css(
			"left", 0).css("top", 0).css("backgroundColor", "red");
	baidu.dom.resizable(div);

	equals(div.childNodes.length, 3, '默认添加了三个子元素，用于实现拖拽');
	var e = div.childNodes[0], s = div.childNodes[1], es = div.childNodes[2];
	ok($(e).css("height") == '100%' || $(e).css("height") == '40px',
			"元素e高度与目标元素一致");
	equals($(e).css("cursor"), "e-resize", "校验cursor");
	ok($(s).css("width") == '100%' || $(s).css("width") == '40px',
			"元素s宽度与目标元素一致");
	equals($(s).css("cursor"), "s-resize", "校验cursor");
	equals($(es).css("cursor"), "se-resize", "校验se元素cursor");
	$(div).remove();
});

test("drag e", function() {
	var div = document.body.appendChild(document.createElement("div"));
	$(div).css("width", 40).css("height", 40).css("position", "absolute").css(
			"left", 0).css("top", 40).css("backgroundColor", "red");
	baidu.dom.resizable(div);
	stop();

	ua.mousemove(document.body, {
		clientX : 40,
		clientY : 20
	});

	var ehandle = div.firstChild;
	setTimeout(function() {
		ua.mousedown(ehandle, {
			clientX : 40,
			clientY : 20
		});
		setTimeout(function() {
			ua.mousemove(ehandle, {
				clientX : 50,
				clientY : 20
			});
			setTimeout(function() {				
				ua.mouseup(ehandle);
				setTimeout(function(){
					equals(parseInt($(div).css("width")), 50, "e拖动后，宽度变化");
					equals(parseInt($(div).css("height")), 40, "e拖动后，高度不变");
					$(div).remove();
					start();					
				}, 30);
			}, 30);
		}, 30);
	}, 30);
});

test("drag s", function() {
	var div = document.body.appendChild(document.createElement("div"));
	$(div).css("width", 40).css("height", 40).css("position", "absolute").css(
			"left", 0).css("top", 80).css("backgroundColor", "red");
	baidu.dom.resizable(div);
	stop();

	ua.mousemove(document.body, {
		clientX : 20,
		clientY : 80
	});

	var ehandle = div.firstChild.nextSibling;
	setTimeout(function() {
		ua.mousedown(ehandle, {
			clientX : 20,
			clientY : 80
		});
		setTimeout(function() {
			ua.mousemove(ehandle, {
				clientX : 20,
				clientY : 90
			});
			setTimeout(function() {				
				ua.mouseup(ehandle);
				setTimeout(function(){
					equals(parseInt($(div).css("width")), 40, "s拖动后，宽度不变");
					equals(parseInt($(div).css("height")), 50, "s拖动后，高度变化");
					$(div).remove();
					start();					
				}, 30);
			}, 30);
		}, 30);
	}, 30);
});

test("drag e", function() {
	var div = document.body.appendChild(document.createElement("div"));
	$(div).css("width", 40).css("height", 40).css("position", "absolute").css(
			"left", 0).css("top", 0).css("backgroundColor", "red");
	baidu.dom.resizable(div);
	stop();

	ua.mousemove(document.body, {
		clientX : 40,
		clientY : 40
	});

	var ehandle = div.lastChild;
	setTimeout(function() {
		ua.mousedown(ehandle, {
			clientX : 40,
			clientY : 40
		});
		setTimeout(function() {
			ua.mousemove(ehandle, {
				clientX : 50,
				clientY : 50
			});
			setTimeout(function() {				
				ua.mouseup(ehandle);
				setTimeout(function(){
					equals(parseInt($(div).css("width")), 50, "se拖动后，宽度变化");
					equals(parseInt($(div).css("height")), 50, "se拖动后，宽度变化");
					$(div).remove();
					start();					
				}, 30);
			}, 30);
		}, 30);
	}, 30);
});