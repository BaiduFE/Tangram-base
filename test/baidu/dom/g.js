module("baidu.dom.g");

test('参数不是string',function(){
	var test = 1;
	expect(2);
	equal(baidu.dom.g(test),null,"get 1 from 1");
	equal(baidu.g(test),null,"get 1 from 1 by shortcut");
})


test('id或element',function(){
	expect(5);
	var div = document.createElement('div');//单层,body的儿子
	var img = document.createElement('img');//多层,div的儿子
	div.setAttribute('id',"id_div");
	document.body.appendChild(div);
	div.appendChild(img);
	img.setAttribute('id',"id_img");
	equal(baidu.dom.g('id_div'),div,"get div by id");//id
	equal(baidu.dom.g(div),div,"get div by element");//element
	equal(baidu.g('id_div'),div,"get div by id using shortcut");//快捷方式
	equal(baidu.g(div),div,"get div by element using shortcut");//快捷方式
	equal(baidu.g(img),img,"get img by element using shortcut");
	document.body.removeChild(div);
})

test('特殊参数',function(){
	expect(3);
	var strObj = new String("str_test");//string object
	equal(baidu.dom.g(document),document,"get document");//get document
	equal(baidu.dom.g(document.body),document.body,"get body");//get body
	equal(baidu.g(strObj),null,"get string object");//将string obj看做string而不是obj
})

test('异常用例',function(){
	expect(3);
	var undefinedPara;
	equal(baidu.g(),null,"get none para");
	equal(baidu.g(undefinedPara),undefined,"get undefined para");
	equal(baidu.g(null),null,"get null para");
})

test('baidu.dom.g(baidu.dom.g("***"))',function(){
	expect(3);
	equal(baidu.g(null),null,"get null para");
	equal(baidu.g("***"),null,"get not exist para");
	equal(baidu.g(baidu.g("***")),null,"get null para");
})

