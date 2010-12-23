module("baidu.dom.hasClass")

test("给没有className的元素判断className",function(){
	expect(1);
	var div = document.createElement('div');
	ok(!baidu.dom.hasClass(div,"class"),"no class");
})

test("给有className的元素判断className",function(){
	expect(8);
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.className = "class";
	div.id = "div_id";
	ok(baidu.dom.hasClass(div,'class'),"div has class");
	ok(!baidu.dom.hasClass(div,'class class2'),'div contains 1 class');//2个中包含 1个
	ok(baidu.dom.hasClass('div_id','class '),'div contains 1 class by id');
	div.className = "class1 class2";
	ok(baidu.dom.hasClass(div,'class1 class2'),"div has 2 classes");//存在2个class
	ok(!baidu.dom.hasClass(div,'notexist'),"div doesn't have class notexist");//不存在
	ok(!baidu.dom.hasClass(div,'class1 class2 class3'),"div contains 2 classes");//3个包含2个
	ok(baidu.dom.hasClass(div,' class2 class1 '),"div contains 2 classes");//调换顺序
	ok(baidu.dom.hasClass(div,'  class2     '),"div contains 2 classes");//有空格
	document.body.removeChild(div);
})

