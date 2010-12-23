module("baidu.dom.addClass")

test("给没有className的元素添加",function(){
	expect(7);
	var trim = baidu.string.trim;
	var div = document.createElement('div');
	document.body.appendChild(div);
	equal(div.className,"","div no class");
	baidu.dom.addClass(div,"div_class1");
	equal(trim(div.className),"div_class1","div class1");
	var addDiv = baidu.dom.addClass(div,"div_class2 div_class3");//添加多个class
	equal(trim(div.className),"div_class1 div_class2 div_class3");
	equal(trim(div),addDiv,"equal div");//返回值
	var scDiv = baidu.addClass(div,"div_class4");//快捷方式
	equal(trim(div.className),"div_class1 div_class2 div_class3 div_class4");
	equal(scDiv,div,"equal div using shortcut");
    console.log("hi");
	baidu.addClass(div,"div_class1 div_class4");//重名
    console.log("hi");
	equal(trim(div.className),"div_class1 div_class2 div_class3 div_class4");
	document.body.removeChild(div);
})

test("给有className的元素添加",function(){
	expect(5);
	var trim = baidu.string.trim;
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.className = "orig_class";
	equal(div.className,"orig_class","original class");
	baidu.dom.addClass(div,"class1");
	equal(div.className,"orig_class class1","add new class");//添加1个class
	var scDiv = baidu.dom.addClass(div,"class2 class3");
	equal(trim(div.className),"orig_class class1 class2 class3","add 2 new classes")//添加2个class
	equal(scDiv,div,"equal div using short cut");
	baidu.addClass(div,"orig_class class2 class3");//添加3个class orig_class class2 class3
	equal(trim(div.className),"orig_class class1 class2 class3");
	document.body.removeChild(div);
})
