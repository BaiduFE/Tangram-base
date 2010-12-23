module("baidu.dom.getAncestorByClass")

test("Element or id",function(){
	expect(2);
	var div = document.createElement('div');
	var a = document.createElement('div');
	var div1 = document.createElement('div');
	var img = document.createElement('img');
	document.body.appendChild(div);
	div.appendChild(div1);
	div.appendChild(img);
	div1.appendChild(a);
	div1.id = "div1_id";
	img.className = "test-class";
	div1.className = 'test-class';
	div.className = 'test-class';
	equal(baidu.dom.getAncestorByClass(a,'test-class'),div1,"get nearest ancestor");
	equal(baidu.dom.getAncestorByClass('div1_id','test-class'),div,"get by id"); 
	document.body.removeChild(div);
})


test("多个class",function(){
	expect(2);
	var div = document.createElement('div');
	var a = document.createElement('div');
	var div1 = document.createElement('div');
	var img = document.createElement('img');
	document.body.appendChild(div);
	div.appendChild(div1);
	div.appendChild(img);
	div1.appendChild(a);
	div1.id = "div1_id";
	img.className = "test-class";
	div1.className = 'test-class2 test-class test';
	div.className = 'test-class';
	equal(baidu.dom.getAncestorByClass(a,'test-class'),div1,"get nearest ancestor");
	equal(baidu.dom.getAncestorByClass('div1_id','class'),null,"find no ancestor");//no ancestor
	document.body.removeChild(div);
})
    
