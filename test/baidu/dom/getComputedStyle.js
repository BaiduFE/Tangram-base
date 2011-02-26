module("baidu.dom.getComputedStyle");

test("get style from style", function() {
	expect(7);
	var div = document.createElement('div');
	var img = document.createElement('img');
	document.body.appendChild(div);
	div.appendChild(img);
	div.id = 'div_id';
	div.style.float = 'left';
	div.style.width = '100px';
	div.style.height = '150px';
	div.style.background = "#FFCC80";
	div.style.color = "red";
	img.style.display = 'block';
	img.style.width = '10%';
	img.style.height = '10%';
	equal(baidu.dom.getComputedStyle(div, 'float'), 'left');
	equal(baidu.dom.getComputedStyle(div, 'width'), '100px');
	equal(baidu.dom.getComputedStyle(div, 'height'), '150px');
	var color = baidu.dom.getComputedStyle(div, 'color').toLowerCase();
	ok(color == '#ff0000' || color == 'red' || (/rgb\(255,\s?0,\s?0\)/.test(color)), 'color red');
	equal(baidu.dom.getComputedStyle(img, 'display'), 'block');
	equal(baidu.dom.getComputedStyle(img, 'width'), '10px');
	equal(baidu.dom.getComputedStyle(img, 'height'), '15px');

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
		equal(baidu.dom.getComputedStyle(div, 'float'), 'left');
		equal(baidu.dom.getComputedStyle(div, 'width'), '200px');
		var color = baidu.dom.getComputedStyle(div, 'color').toLowerCase();
		ok(color == '#00ff00' || color == 'rgb(0,255,0)'
				|| color == 'rgb(0, 255, 0)', 'color');
		equal(baidu.dom.getComputedStyle(div, 'position'), 'relative');
		/** IE的float属性叫styleFloat，firefox则是cssFloat */
		equal(baidu.dom.getComputedStyle(img, 'float'), 'left');
		equal(baidu.dom.getComputedStyle(img, 'display'), 'block');
		equal(baidu.dom.getComputedStyle(img, 'left'), '50px');
		equal(baidu.dom.getComputedStyle(img, 'width'), '200px');
		equal(baidu.dom.getComputedStyle(p, 'font-size'), '14px');

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
		equal(baidu.dom.getComputedStyle(img, 'opacity'), '1');
		document.body.removeChild(div);
		start();
	}, 'baidu.dom._styleFixer.opacity', 'baidu.dom.getComputedStyle');
});
