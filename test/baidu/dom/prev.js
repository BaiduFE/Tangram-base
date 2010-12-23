module('baidu.dom.prev')

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
//	img.id = "img_id"
	img.setAttribute('id','img_id');
	equal(baidu.dom.prev(img),div,"prev node is not textNode");
	equal(baidu.dom.prev('img_id'),div,"get prev node by id");
	equal(baidu.dom.prev(a),img,'img prev node is a');
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
	equal(baidu.dom.prev(a),img,"prev node is a");
	equal(baidu.dom.prev(p),a,"a prev node is p");
	document.body.removeChild(div);
})

test('不在dom树上',function(){
	expect(1);
	var div = document.createElement('div');
	equal(baidu.dom.prev(div),null,"no child");
})

test('没有兄弟',function(){
	expect(1);
	var div = document.createElement('div');
	var div1 = document.createElement('div');
	document.body.appendChild(div);
	div.appendChild(div1);
	equal(baidu.dom.prev(div1),null,"no child");
	document.body.removeChild(div);
})

