module('baidu.dom.toggleClass')

/**
 * 貌似依然需要遍历，这个是否可以考虑添加到tools.js中
 */
test('add', function(){
	expect(2);
	var trim = baidu.string.trim;
	var div = document.createElement('div');
	baidu.dom.toggleClass(div,"div_class1");
	baidu.dom.toggleClass(div,"div_class2 div_class3 div_class4");
	equal(trim(div.className),"div_class1 div_class2 div_class3 div_class4","add class");
	baidu.dom.toggleClass(div,"div_class5 div_class1");
	equal(trim(div.className),"div_class1 div_class2 div_class3 div_class4 div_class5","add class");
})

/**
 * 针对有class的元素进行移除操作
 */
test('remove', function(){
	expect(2);
	var trim = baidu.string.trim;
	var div = document.createElement('div');
	baidu.dom.toggleClass(div,"div_class1");
	baidu.dom.toggleClass(div,"div_class2 div_class3 div_class4 div_class5");
	baidu.dom.toggleClass(div,"div_class2");
	equal(trim(div.className),"div_class1 div_class3 div_class4 div_class5","remove 1 class");
	baidu.dom.toggleClass(div,"div_class3 div_class5");
	equal(trim(div.className),"div_class1 div_class4","remove 2 classes");
})

/**
 * 针对不可以设置class的元素进行操作,base,head,html,meta,param,script,style以及title,实验证明是可以设置的
 */
test('异常用例', function(){
	expect(2);
	var html = document.getElementsByTagName('html')[0];
	var head = document.getElementsByTagName('head')[0];
	html.className = "html_name";
	head.className = "head_name";
	baidu.dom.toggleClass(html,"html_class1");
	baidu.dom.toggleClass(head,"head_name");
	equal(html.className,"html_name html_class1","html sets classname");
	equal(head.className,"","head sets classname")
})