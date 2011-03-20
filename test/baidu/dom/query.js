module("baidu.dom.query");

// test('1 param', function() {
// expect(11);
// var div = document.createElement('div');
// var a = document.createElement('a');
// var a2 = document.createElement('a');
// var div2 = document.createElement('div');
// var input = document.createElement('input');
// document.body.appendChild(div);
// document.body.appendChild(a);
// div.appendChild(a2);
// div.appendChild(div2);
// div.appendChild(input);
// input.disabled = 'disabled';
// div.id = 'comId';
// // a.id = 'comId';/*多个相同的id是不允许的*/
// div.className = 'class';
// div2.className = 'class';
// a2.className = 'class';
// var result = baidu.dom.query('a');
// ok(result.length >= 2, '2 results of a');//根据标签查找的结果可能因页面而产生变化
// equal(result[1], a2, 'result 1 a');
// equal(result[0], a, 'result 2 a2');
// result = baidu.dom.query('#comId');// id
// equal(result.length, 1, '1 results of id comId');
// equal(result[0], div, 'id comId div');
//
// result = baidu.dom.query('.class');// className
// equal(result.length, 3, 'length 3');
// equal(result[0], div, 'class div');
// equal(result[1], a2, 'class a2');
// equal(result[2], div2, 'class div2');
//
// result = baidu.dom.query('input:disabled');
// equal(result.length, 1, '1 result of input');
// equal(result[0], input, 'input disabled');
// document.body.removeChild(div);
// document.body.removeChild(a);
// });

test('base', function() {
	var tag = 'input';
	var len = baidu.dom.query(tag).length;
	var a = document.createElement(tag);
	a.id = 'test_' + tag;
	a.className = 'test_class_' + tag;
	a.type = 'checkbox';
	a.disabled = true;
	a = document.body.appendChild(a);
	equal(baidu.dom.query(a.tagName)[len], a, 'query by tag');
	equal(baidu.dom.query('#' + a.id)[0], a, 'query by id');
	equal(baidu.dom.query('.' + a.className)[0], a, 'query by class');
	equal(baidu.dom.query(tag + ':disabled')[0], a, 'query by status');
	a.parentNode.removeChild(a);
});

test('2 params', function() {
	var div = document.createElement('div');
	var a = document.createElement('a');
	var a2 = document.createElement('a');
	var div2 = document.createElement('div');
	document.body.appendChild(div);
	document.body.appendChild(a);
	div.appendChild(a2);
	div.appendChild(div2);
	var result = baidu.dom.query('a', div);
	equal(result.length, 1, '2 results of a');
	equal(result[0], a2, 'result 1 a');
	// equal(result[1],a,'result 2 a2');

	document.body.removeChild(div);
	document.body.removeChild(a);
});