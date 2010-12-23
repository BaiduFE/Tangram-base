module("baidu.dom.getAncestorBy")

test("Element", function() {
	expect(3);
	var div = document.createElement('div');
	var div1 = document.createElement('div');
	var img = document.createElement('img');
	var i = document.createElement('i');
	var p = document.createElement('p');
	document.body.appendChild(div);
	div.appendChild(div1);
	div1.appendChild(img);
	div.appendChild(p);
	p.appendChild(i);
	i.innerHTML = "hello";
	div.id = "id";
	div1.id = "div1_id";
	p.id = "id";
	equal(baidu.dom.getAncestorBy(i, function(ele) {
		return ele.id == 'id';
	}), p, "get nearest ancestor by id");
	equal(baidu.dom.getAncestorBy(img, function(ele) {
		return ele.id == 'id';
	}), div, "get div as img's ancestor");
	equal(baidu.dom.getAncestorBy(img, function(ele) {
		return ele.className == 'className'
	}), null, "get no ele");
	document.body.removeChild(div);
})

test("id", function() {
	expect(3);
	var div = document.createElement('div');
	var div1 = document.createElement('div');
	var img = document.createElement('img');
	var i = document.createElement('i');
	var p = document.createElement('p');
	document.body.appendChild(div);
	div.appendChild(div1);
	div1.appendChild(img);
	div.appendChild(p);
	p.appendChild(i);
	i.innerHTML = "hello";
	img.id = "img_id";
	div.id = "id";
	div1.id = "div1_id";
	p.id = "id";
	equal(baidu.dom.getAncestorBy(i, function(ele) {
		return ele.id == 'id';
	}), p, "get nearest ancestor by id");
	equal(baidu.dom.getAncestorBy('div1_id', function(ele) {
		return ele.id == 'id';
	}), div, "get div as img's ancestor");
	equal(baidu.dom.getAncestorBy('img_id', function(ele) {
		return ele.className == 'className'
	}), null, "get no ele");
	document.body.removeChild(div);
})

test("body", function() {
	expect(1);
	equal(baidu.dom.getAncestorBy(document.body, function(ele) {
		return true;
	}), document.documentElement);
})
