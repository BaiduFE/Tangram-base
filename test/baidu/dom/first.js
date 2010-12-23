module("baidu.dom.first")


test("第一个子节点为空节点",function(){
	expect(2);
	var div = document.createElement('div');
	var text = document.createTextNode('textnode');
	var img = document.createElement('img');
	var table = document.createElement('table');
	document.body.appendChild(div);
	div.id = "div";
	div.appendChild(text);
	div.appendChild(img);
	div.appendChild(table);
	equal(baidu.dom.first(div),img,"first child is not textNode");
	equal(baidu.dom.first('div'),img,"first child is not textNode--by id");
	document.body.removeChild(div);
})


test("第一个子节点不是空节点",function(){
	expect(2);
	var div = document.createElement('div');
	var img = document.createElement('img');
	var table = document.createElement('table');
	document.body.appendChild(div);
	div.appendChild(img);
	div.appendChild(table);
	div.id = "div_id";
	equal(baidu.dom.first(div),img,"first child is img");
	equal(baidu.dom.first('div_id'),img,"first child is img--by id");
	document.body.removeChild(div);
})

test("html",function(){
//	alert(baidu.dom.first(document));
	expect(2);
	equal(baidu.dom.first(document),document.documentElement,"first child is html");
	equal(baidu.dom.first(document.documentElement),document.documentElement.firstChild,"first child of html is head ");
})

test("没有子节点",function(){
	expect(1);
	var div = document.createElement('div');
	equal(baidu.dom.first(div),null,"no child");
})

