module('baidu.dom.next')

test('兄弟节点有空节点',function(){
	expect(3);
	var div = document.createElement('div');
	var a = document.createElement('a');
	var img = document.createElement('img');
	var text = document.createTextNode('text');
	document.body.appendChild(div);
	document.body.appendChild(text);
	document.body.appendChild(img);
	document.body.appendChild(a);
	div.id = "div_id";
	equal(baidu.dom.next(div),img,"next node is not textNode");
	equal(baidu.dom.next('div_id'),img,"get next node by id");
	equal(baidu.dom.next(img),a,'img next node is a');
	document.body.removeChild(div);
	document.body.removeChild(img);
	document.body.removeChild(text);
	document.body.removeChild(a);
})

test('兄弟节点没有空节点',function(){
	expect(2);
	var div = document.createElement('div');
	var a = document.createElement('a');
	var img = document.createElement('img');
	var p = document.createElement('p');
	document.body.appendChild(div);
	div.appendChild(img);
	div.appendChild(a);
	div.appendChild(p);
	equal(baidu.dom.next(img),a,"next node is a");
	equal(baidu.dom.next(a),p,"a next node is p");
	document.body.removeChild(div);
})

test('不在dom树上',function(){
	expect(1);
	var div = document.createElement('div');
	equal(baidu.dom.next(div),null,"no child");
})

test('没有兄弟',function(){
	expect(1);
	var div = document.createElement('div');
	document.body.appendChild(div);
	equal(baidu.dom.next(div),null,"no child");
	document.body.removeChild(div);
})
