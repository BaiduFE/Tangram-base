module("baidu.dom.getStyle");

test("get style from attribute", function() {
	baidu.dom._styleFixer["float"] = baidu.browser.ie ? "styleFloat"
			: "cssFloat";
	expect(3);
	var div = document.createElement('div');
	var img = document.createElement('img');
	document.body.appendChild(div);
	div.appendChild(img);
	img.style.height = '10px';
	img.style.width = '20px';
	img.id = 'img_id';
	equal(baidu.dom.getStyle(img, 'height'), '10px',
			"get img height style by attribute");
	equal(baidu.dom.getStyle(img, 'width'), '20px',
			'get img width style by attribute');
	equal(baidu.dom.getStyle('img_id', 'height'), '10px',
			'get img height by id');

	document.body.removeChild(div);
});

test("get style from style", function() {
	expect(8);
	var div = document.createElement('div');
	var a = document.createElement('a');
	var img = document.createElement('img');
	document.body.appendChild(div);
	div.appendChild(a);
	div.appendChild(img);
	div.id = 'div_id';
	a.id = 'a_id';
	div.style.float = 'left';
	div.style.width = '10%';
	div.style.height = '15%';
	div.style.background = "#FFCC80";
	div.style.color = "red";
	img.style.display = 'block';
	img.style.width = '16px';
	img.style.height = '12px';
	a.style.top = '5px';
	equal(baidu.dom.getStyle(div, 'float'), 'left');
	equal(baidu.dom.getStyle(div, 'width'), '10%');
	equal(baidu.dom.getStyle(div, 'height'), '15%');
	var color = baidu.dom.getStyle(div, 'color').toLowerCase();
	ok(color == '#ff0000' || color == 'red' || color == 'rgb(255,0,0)',
			'color red');
	equal(baidu.dom.getStyle(img, 'display'), 'block');
	equal(baidu.dom.getStyle(img, 'width'), '16px');
	equal(baidu.dom.getStyle(img, 'height'), '12px');
	equal(baidu.dom.getStyle(a, 'top'), '5px');

	document.body.removeChild(div);
});

/** css加载也需要时间 * */
test("get style from css file", function() {
	expect(9);
	stop();
	var div = document.createElement('div');
	var div1 = document.createElement('div');
	var img = document.createElement('img');
	var p = document.createElement('p');
	var link = document.createElement('link');
	document.body.appendChild(div);
	document.body.appendChild(div1);
	var head = document.getElementsByTagName("head").item(0);
	div.appendChild(p);
	div.appendChild(img);
	$(link).attr('href', upath + 'style.css');
	$(link).attr('type', 'text/css');
	$(link).attr('rel', 'stylesheet');
	$(link).attr('media', 'screen');
	$(div).attr('className', "content");
	$(div1).attr('className', 'content');
	$(img).attr('className', 'content');
	$(p).attr('className', 'pid');
	head.appendChild(link);

	var handle = setTimeout(function() {
		/** IE的float属性叫styleFloat，firefox则是cssFloat * */
		equal(baidu.dom.getStyle(div, 'float'), 'left');
		equal(baidu.dom.getStyle(div, 'width'), '200px');
		var color = baidu.dom.getStyle(div, 'color').toLowerCase();
		ok(color == '#00ff00' || color == 'rgb(0,255,0)'
				|| color == 'rgb(0, 255, 0)', 'color');
		equal(baidu.dom.getStyle(div, 'position'), 'relative');
		/** IE的float属性叫styleFloat，firefox则是cssFloat */
		equal(baidu.dom.getStyle(img, 'float'), 'left');
		equal(baidu.dom.getStyle(img, 'display'), 'block');
		equal(baidu.dom.getStyle(img, 'left'), '50px');
		equal(baidu.dom.getStyle(img, 'width'), '200px');
		equal(baidu.dom.getStyle(p, 'font-size'), '14px');

		document.body.removeChild(div);
		document.body.removeChild(div1);
		start();
	}, 100);

});

test("get style from fixer", function() {
	stop();
	ua.importsrc('baidu.dom._styleFixer.opacity', function() {
		var div = document.createElement('div');
		document.body.appendChild(div);
		var img = document.createElement('img');
		div.appendChild(img);
		equal(baidu.dom.getStyle(img, 'opacity'), '1');
		document.body.removeChild(div);
		start();
	}, 'baidu.dom._styleFixer.opacity', 'baidu.dom.getStyle');
});
