module('baidu.dom.insertHTML测试')

/*
 *  create div
 *  create p in div
 *  Test insertHTML in beforeBegin、afterBegin、beforeEnd、afterEnd
 */

function insertHtmlCreate(type, id, parent) {
	var ele = document.createElement(type);
	ele.id = id;
	(parent || document.body).appendChild(ele);
	return ele;
}

function insertHtmlRemove(ele1, ele2) {
	var r = function(ele) {
		ele.parentNode.removeChild(ele);
	}
	if (ele1)
		r(ele1);
	if (ele2)
		r(ele2);
}

test('在元素的开始标签前插入html', function() {
	var oDiv = insertHtmlCreate('div', "div1_ih");
	var oP = insertHtmlCreate('p', "p1_ih", oDiv);
	equals(oDiv.childNodes.length, 1);
	equals(oDiv.childNodes[0].tagName, "P");
	var op1 = baidu.dom.insertHTML(oP, "beforeBegin", "<br>");
	equals(oDiv.childNodes.length, 2);
	equals(oDiv.childNodes[0].tagName, "BR");
	equals(oDiv.childNodes[1].tagName, "P");
	equals(op1, oP);
	insertHtmlRemove(oDiv, oP);
})

test('在元素的开始标签后插入html', function() {
	var oDiv = insertHtmlCreate('div', "div1_ih");
	var oP = insertHtmlCreate('p', "p1_ih", oDiv);
	oP.innerHTML = 'p2_ih';
	baidu.dom.insertHTML(oP, "afterBegin", "文本信息");
	equals(oP.innerHTML, "文本信息p2_ih");
	insertHtmlRemove(oDiv, oP);
	
})

test('在元素的结束标签前插入html', function() {
	var oDiv = insertHtmlCreate('div', "div1_ih");
	var oP = insertHtmlCreate('p', "p1_ih", oDiv);
	oP.innerHTML = 'p2_ih';
	baidu.insertHTML(oP, "beforeEnd", "END");
	equals(oP.innerHTML, "p2_ihEND");
	insertHtmlRemove(oDiv, oP);
})

test('在元素的结束标签后插入html', function() {
	var oDiv = insertHtmlCreate('div', "div1_ih");
	var oP = insertHtmlCreate('p', "p1_ih", oDiv);
	equals(oDiv.childNodes.length, 1);
	equals(oDiv.childNodes[0].tagName, "P");
	var op1 = baidu.dom.insertHTML(oP, "afterEnd",
			"<input type='text' value='data'/>");
	equals(oDiv.childNodes.length, 2);
	equals(oDiv.childNodes[0].tagName, "P");
	equals(oDiv.childNodes[1].tagName, "INPUT");
	equals(op1, oP);
	insertHtmlRemove(oDiv, oP);
})

test('FF下的特殊情况',function(){
	var table = insertHtmlCreate('table', 'id_table'),
		td = insertHtmlCreate('td', 'id_td', insertHtmlCreate('tr', 'id_tr', table));
	
	baidu.dom.insertHTML(td, 'beforeEnd', '<div id="test2"><div><table id="table2"><tr><td></td></tr></table></div></div>');
	baidu.dom.insertHTML(td, 'afterBegin', '<div id="test1"><div><table id="table1"><tr><td></td></tr></table></div></div>');
	
	equals(td.childNodes.length, 2, '两个节点插入后，子节点数应该时2');
	equals(td.childNodes[0].id, 'test1', '第一个子节点的校验');
	equals(td.childNodes[1].id, 'test2', '第二个子节点的校验');
	equals($("#table2")[0].parentNode.parentNode.id, 'test2', '确认table位置');
	equals($("#table1")[0].parentNode.parentNode.id, 'test1', '确认table位置');
	insertHtmlRemove(table);
})