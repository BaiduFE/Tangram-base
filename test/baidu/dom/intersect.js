module('baidu.dom.insertsect');

test('两个区域包含', function() {// 只适用于块元素
	expect(7);
	var div = document.createElement('div');
	var divChild = document.createElement('div');
	var img = document.createElement('img');
	var p = document.createElement('p');
	document.body.appendChild(div);
	div.appendChild(img);
	div.appendChild(divChild);
	div.appendChild(img);
	div.appendChild(p);
	div.id = 'div_id';
	divChild.id = 'divChild_id';
	ok(baidu.dom.intersect(div, divChild), 'div intersects with div');
	ok(baidu.dom.intersect(divChild, div), 'div intersects with father div');
	ok(baidu.dom.intersect('div_id', divChild),
			'div intersects with father div by id');
	ok(baidu.dom.intersect(div, 'divChild_id'),
			'div intersects with child by id');
	ok(baidu.dom.intersect('div_id', 'divChild_id'),
			'div intersects with child both by id');
	ok(baidu.dom.intersect(div, img), 'div intersects with img--1');
	ok(baidu.dom.intersect(img, div), 'div intersects with img');
	document.body.removeChild(div);
});

test('两个区域相交', function() {
	expect(2);
	var div = document.createElement('div');
	var div2 = document.createElement('div');
	document.body.appendChild(div);
	document.body.appendChild(div2);
	ok(baidu.dom.intersect(div, div2), "2 div 相邻");
	div.style.cssText = "position: absolute; top: -1000px;"
			+ " left: -1000px; width: 100px; height: 100px";
	div2.style.cssText = "position: absolute; top: -1050px;"
			+ " left: -1050px; width: 100px; height: 100px";
	ok(baidu.dom.intersect(div, div2), "2 div intersect");

	document.body.removeChild(div);
	document.body.removeChild(div2);
});

test('两个区域不重叠', function() {// 只适用于块元素
	expect(2);
	var div = document.createElement('div');
	var div2 = document.createElement('div');
	var img = document.createElement('img');
	var p = document.createElement('p');
	document.body.appendChild(div);
	document.body.appendChild(div2);
	document.body.appendChild(img);
	// div.style.height = '20px';
	// div.style.width = '20px';
	div2.style.height = '10px';
	div2.style.width = '20px';
	div.style.border = '2px';
	img.style.border = '1px';
	div.style.border = '2px';
	$(div).css('backgroundColor', 'red').css('height', '20px').css('width',
			'20px');
	$(div2).css('backgroundColor', 'blue');
	img.src = upath + 'test.jpg';
	div.style.cssText = "position: absolute; top: 100px; "
			+ "right: 10px; width: 100px; height: 100px";
	img.style.cssText = "position: absolute; top: -1050px; "
			+ "left: -1050px; width: 100px; height: 100px";
	// debugger;
	ok(!baidu.dom.intersect(div, div2), "2 div don't intersect");// 相邻
	ok(!baidu.dom.intersect(div, img), "div and img don't intersect");

	document.body.removeChild(div);
	document.body.removeChild(div2);
	document.body.removeChild(img);
});

// //baidu.dom.intersect测试
// describe("baidu.dom.intersect测试",{
// '两个元素区域相交': function () {
// value_of(baidu.dom.intersect(document.getElementById('intersect1'),
// 'intersect2')).should_be_true();
// value_of(baidu.dom.intersect(document.getElementById('intersect2'),
// 'intersect1')).should_be_true();
// },
//    
// '两个元素区域包含': function () {
// value_of(baidu.dom.intersect(document.getElementById('intersect1'),
// 'intersect3')).should_be_true();
// value_of(baidu.dom.intersect(document.getElementById('intersect3'),
// 'intersect1')).should_be_true();
// },
//    
// '两个元素不重叠': function () {
// value_of(baidu.dom.intersect(document.getElementById('intersect1'),
// 'intersect4')).should_be_false();
// value_of(baidu.dom.intersect(document.getElementById('intersect4'),
// 'intersect1')).should_be_false();
// }
// });
