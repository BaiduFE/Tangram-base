module("baidu.dom.getAncestorByTag")

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
	a.id = "a_id";
	equal(baidu.dom.getAncestorByTag(a,'div'),div1,"get nearest ancestor by tag");
	equal(baidu.dom.getAncestorByTag('a_id','div'),div1,"get by id"); 
	document.body.removeChild(div);
})


test("html or body", function() {
	expect(3);
	var div = document.createElement('div');
	document.body.appendChild(div);
	equal(baidu.dom.getAncestorByTag(document.body,'html'),document.documentElement,'get html ancestor');
	equal(baidu.dom.getAncestorByTag(div,'body'),document.body,'get body ancestor');
	equal(baidu.dom.getAncestorByTag(div,'html'),document.documentElement,'get html ancestor of div');
	document.body.removeChild(div);
})


test("no ancestor",function(){
	
	var div = document.createElement('div');
	equal(baidu.dom.getAncestorByTag(div,'body'),null,"no ancestor");
})

