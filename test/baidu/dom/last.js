module('baidu.dom.last')

test('最后一个子节点有空节点',function(){
	expect(2);
	var div = document.createElement('div');
	var a = document.createElement('a');
	var img = document.createElement('img');
	var text = document.createTextNode('text');
	document.body.appendChild(div);
	div.appendChild(img);
	div.appendChild(a);
	div.appendChild(text);
	div.id = "div_id";
	equal(baidu.dom.last(div),a,"last node is not textNode");
	equal(baidu.dom.last('div_id'),a,"get last node by id");
	document.body.removeChild(div);
})

test('最后一个子节点后没有空节点',function(){
	expect(1);
	var div = document.createElement('div');
	var a = document.createElement('a');
	var img = document.createElement('img');
	document.body.appendChild(div);
	div.appendChild(img);
	div.appendChild(a);
	equal(baidu.dom.last(div),a,"last node is a");
	document.body.removeChild(div);
})

test('不在dom树上',function(){
	expect(1);
	var div = document.createElement('div');
	equal(baidu.dom.last(div),null,"no child");
})

test('没有子节点',function(){
	expect(1);
	var div = document.createElement('div');
	document.body.appendChild(div);
	equal(baidu.dom.last(div),null,"no child");
	document.body.removeChild(div);
})

    
