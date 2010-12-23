module("baidu.dom.q")

test('1 param--className',function(){
	expect(4);
	var div = document.createElement('div');
	var div2 = document.createElement('div');
	var p = document.createElement('p');
	var span = document.createElement('span');
	var textNode = document.createTextNode('textnode');
	var textArea = document.createElement('textarea');
	document.body.appendChild(div);
	document.body.appendChild(div2);
	div2.appendChild(p);
	div2.appendChild(span);
	div2.appendChild(textNode);
	div2.appendChild(textArea);
	div.className = 'class1';
	span.className = 'class1';
	textArea.className = 'class1';
	p.className = 'class';
	var result = baidu.dom.q('class1');
	equal(result.length,3,'get 3 results');
	equal(result[0],div,'div result');
	equal(result[1],span,'span result');
	equal(result[2],textArea,'textarea result');
	
	result = null;
	document.body.removeChild(div2);
	document.body.removeChild(div);
})


test('2 params,element',function(){
	expect(3);
	var div = document.createElement('div');
	var div2 = document.createElement('div');
	var form = document.createElement('form');
	var table = document.createElement('table');
	var input = document.createElement('input');
	var p = document.createElement('p');
	var span = document.createElement('span');
	var textNode = document.createTextNode('textnode');
	var textArea = document.createElement('textarea');
	document.body.appendChild(div);
	document.body.appendChild(div2);
	div2.appendChild(p);
	div.appendChild(form);
	div2.appendChild(textNode);
	form.appendChild(span);
	form.appendChild(textArea);
	form.appendChild(input);
	input.type = 'text';
	div.className = 'class2';
	div2.className = 'class2';
	span.className = 'class2';
	textArea.className = 'class2';
	input.className = 'Class2';
	var result = baidu.dom.q('class2',form);
	
	equal(result.length,2,'get 2 results');
	equal(result[0],span,'span result');
	equal(result[1],textArea,'textarea result');
	
	result = null;
	document.body.removeChild(div2);
	document.body.removeChild(div);
})
test('2 params,document',function(){
	expect(5);
	var div = document.createElement('div');
	var div2 = document.createElement('div');
	var input = document.createElement('input');
	var textArea = document.createElement('textarea');
	document.body.appendChild(div);
	document.body.appendChild(div2);
	div.appendChild(input);
	div.appendChild(textArea);
	textArea.className = 'class2';
	input.type = 'text';
	div.className = 'class2';
	div2.className = 'class2';
	input.className = 'Class2';
	var result = baidu.dom.q('class2',undefined,'textarea');
	equal(result.length,1,'get 1 result');
	equal(result[0],textArea,'textarea result');
	
	result = baidu.dom.q('class2',undefined,'div');
	equal(result.length,2,'get 2 results');
	equal(result[0],div,'div result');
	equal(result[1],div2,'div2 result');
	
	result = null;
	document.body.removeChild(div2);
	document.body.removeChild(div);
})
test('3 params',function(){
	expect(4);
	var div = document.createElement('div');
	var div2 = document.createElement('div');
	var form = document.createElement('form');
	var table = document.createElement('table');
	var input = document.createElement('input');
	var p = document.createElement('p');
	var span = document.createElement('span');
	var textNode = document.createTextNode('textnode');
	var textArea = document.createElement('textarea');
	document.body.appendChild(div);
	document.body.appendChild(div2);
	div2.appendChild(p);
	div.appendChild(form);
	div2.appendChild(textNode);
	form.appendChild(span);
	form.appendChild(textArea);
	form.appendChild(input);
	input.type = 'text';
	div.className = 'class2';
	div2.className = 'class2';
	span.className = 'class2';
	textArea.className = 'class2';
	input.className = 'Class2';
	var result = baidu.dom.q('class2',form,'span');
	
	equal(result.length,1,'get 1 result');
	equal(result[0],span,'span result');
	
	result = baidu.dom.q('class2',form,'textarea');
	equal(result.length,1,'get 1 result');
	equal(result[0],textArea,'textArea result');
	
	result = null;
	document.body.removeChild(div2);
	document.body.removeChild(div);
})
test('short cut',function(){
	expect(7);
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.className = 'class3';
	var result = baidu.Q('class3',document,'div');
	equal(result[0],div,'baidu.Q');
	
	result = baidu.Q('class3',undefined,'div');
	equal(result[0],div,'baidu.Q--2 params');
	
	result = baidu.Q('class3');
	equal(result[0],div,'baidu.Q--1 param');
	
	result = baidu.q('class3',document,'div');
	equal(result[0],div,'baidu.q--3params');
	
	result = baidu.q('class3',undefined,'div');
	equal(result[0],div,'baidu.q--2 params');
	
	result = baidu.q('class3',document);
	equal(result[0],div,'baidu.q--2 params document');
	
	result = baidu.q('class3');
	equal(result[0],div,'baidu.q--1 param');
	
	result = null;
	document.body.removeChild(div);
})

test('null',function(){
	expect(2);
	var result = baidu.dom.q('');
	equal(result,null,'null param');
	result = baidu.dom.q();
	equal(result,"",'no param');
})

test('异常case',function(){
	expect(2);
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.className = 'classAbnormal';
	var result = baidu.dom.q('class');
	equal(result,"","no result");
	result = baidu.dom.q('classAbnormal',undefined,'span');
	equal(result,"","no result of span");
	document.body.removeChild(div);
})