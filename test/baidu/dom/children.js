module("baidu.dom.children");

test("Element or id ", function() {
	expect(2);
	var div = document.createElement('div');
	div.id = "div_id";
	var img = document.createElement('img');
	var a = document.createElement('a');
	a.innerHTML = "a text node";// textnode
		var p = document.createElement('p');
		var text = document.createTextNode('textnode');// nodeType==3,won't
														// count in childs
		document.body.appendChild(div);
		div.appendChild(img);
		div.appendChild(a);
		div.appendChild(p);
		div.appendChild(text);
		var childs = baidu.dom.children(div);
		ok(UserAction.isEqualArray(childs, [ img, a, p ]), "get all childs");
		childs = baidu.dom.children("div_id");
		ok(UserAction.isEqualArray(childs, [ img, a, p ]),
				"get all childs by id");
		document.body.removeChild(div);
	});

test("body", function() {
	stop();
	expect(1);

	var next = function() {
		var w = frames[frames.length - 1];
		var doc = w.document;
		var div = doc.createElement('div');
		var a = doc.createElement('a');
		var img = doc.createElement('img');
		var p = doc.createElement('p');
		a.innerHTML = "a innerHTML";// 孙子节点
		doc.body.appendChild(div);
		div.appendChild(img);// grandson
		doc.body.appendChild(a);
		doc.body.appendChild(p);
		var childs = baidu.dom.children(doc.body);
		ok(UserAction.isEqualArray(childs, [ div, a, p ]),
				"get all childs of body");
		$('iframe#test_frame').remove();
		start();
	};
	var f = document.createElement("iframe");
	f.id = 'test_frame';
	f.src = cpath + "test.html";
	document.body.appendChild(f);
	$('iframe#test_frame').load(next);
});

test("empty childs", function() {
	expect(2);
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.id = "div_id";
	equal(baidu.dom.children(div), "", "no childs");
	equal(baidu.dom.children('div_id'), "", "no childs by id");
	document.body.removeChild(div);
})