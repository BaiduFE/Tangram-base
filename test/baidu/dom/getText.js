module('baidu.dom.getText')

/**
 * 仅考虑针对core方法进行元素遍历
 */
//应该考虑nodeType为4和8的情况！！！！
test('getText', function(){
	expect(2);
	var text = document.createTextNode("textNode");
	var text2 = document.createTextNode("textNode2");
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.appendChild(text);
	div.appendChild(text2);
	equal(baidu.dom.getText(text2),"textNode2","get text from textNode");
	equal(baidu.dom.getText(div),"textNodetextNode2","div innerHTML is textNodetextNode2");
	document.body.removeChild(div);
})

/**
 * 
 */

test('dom or id', function(){
	expect(2);
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.setAttribute('id',"id_div");
	div.innerHTML = "text of div";
	equal(baidu.dom.getText(div),"text of div","div text");//dom
	equal(baidu.dom.getText("id_div"),"text of div","div id test");//id
	document.body.removeChild(div);
})

/**
 * null or other parms
 * 
 */
test('null or other parms', function(){
	expect(2);
	var div;//非法节点
	try{
		baidu.dom.getText(div);
	}catch(e){
		ok(true,"catch exception ok");
	}
	try{
		baidu.dom.getText();//空参数
	}catch(e){
		ok(true,"catch exception ok");
	}
})

/**
 * 
 */
test('dom with none text', function(){
	expect(1);
	var p = document.createElement('p');
	equal(baidu.dom.getText(p),"","no text in p");
})

//确认一下哪些是特殊字符
test('special character',function(){
	expect(2);
	var a  = document.createElement('a');
	a.innerHTML = "百度一下"
	equal(baidu.dom.getText(a),"百度一下","text in Chinese");
	a.innerHTML = "^_'{}~@=?|/+-$%&*!<>\();:.,";
	equal(baidu.dom.getText(a),"^_'{}~@=?|/+-$%&*!<>\();:.,","get special characters");
})

