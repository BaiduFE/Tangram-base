module('baidu.dom.empty')

/**
 * 删除一个节点下面的所有子节点。会包含文本？
 */
test('innerHTML is blank', function(){
	var div = document.createElement('div');
	var a = document.createElement('a');
	document.body.appendChild(div);
	document.body.appendChild(a);
	a.innerHTML = "test_a";            //son of a
	var img = document.createElement('img')//son of div
	div.appendChild(img);
	var txt=document.createTextNode("textNode");//son of p
	var p=document.createElement('p');
	document.body.appendChild(p);
	p.appendChild(txt);	
	
	baidu.dom.empty(div);
	baidu.dom.empty(p);
	baidu.dom.empty(a);
	ok(div.childNodes.length==0,"div is empty;");
	ok(p.childNodes.length==0,"p is empty");
	ok(a.childNodes.length==0,"a is empty");
	document.body.removeChild(div);
	document.body.removeChild(a);
	document.body.removeChild(p);
})