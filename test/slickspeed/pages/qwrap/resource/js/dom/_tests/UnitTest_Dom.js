//Created by Wangchen

var readyTest = 0;
QW.Dom.ready(function () {
	readyTest = 1;
});
describe('DOM_Integrity_Retouch', {
	'query && insertAdjacentHTML insertAdjacentElement' : function () {
		//insertAdjacentHTML 内部会调用　insertAdjacentElement
		QW.Dom.insertAdjacentHTML(document.body, 'beforeEnd', '<div class="test">1</div>');
		var node = QW.NodeW.query(0, 'div.test');
		value_of(node.core.length).should_be(1);
		document.body.removeChild(node.core[0]);
		
		var node = QW.NodeW.query(0, 'div.test1');
		value_of(node.core.length).should_be(0);
	}
	, 'create' : function () {
		var node = QW.Dom.create('<div>ok</div>');
		value_of(node.innerHTML).should_be('ok');
		var node = QW.Dom.create('<div>1</div><div>2</div>', 1);
		value_of(node.childNodes.length).should_be(2);
	}
	, 'ready' : function () {
		value_of(readyTest).should_be(1);
	}
	, 'isElement' : function () {
		value_of(QW.Dom.isElement(document.createElement('div'))).should_be(true);
		value_of(QW.Dom.isElement(document.createTextNode('div'))).should_be(false);
	}
	, 'rectContains' : function () {
		value_of(QW.Dom.rectContains(
			{ top : 100, right : 200, bottom : 200, left : 100}
			, { top : 101, right : 199, bottom : 199, left : 101}
		)).should_be(true);

		value_of(QW.Dom.rectContains(
			{ top : 100, right : 200, bottom : 200, left : 100}
			, { top : 101, right : 199, bottom : 199, left : 99}
		)).should_be(false);
	}
	, 'rectIntersect' : function () {
		var rect = QW.Dom.rectIntersect(
			{ top : 100, right : 200, bottom : 200, left : 100}
			, { top : 160, right : 260, bottom : 260, left : 160 }
		)
		value_of(rect).should_not_be(null);

		value_of(rect.top).should_be(160);
		value_of(rect.right).should_be(200);
		value_of(rect.bottom).should_be(200);
		value_of(rect.left).should_be(160);

		value_of(QW.Dom.rectIntersect(
			{ top : 100, right : 200, bottom : 200, left : 100}
			, { top : 160, right : 260, bottom : 260, left : 201 }
		)).should_be(null);
	}
	, 'pluckWhiteNode' : function () {
		var node = QW.Dom.create('<div>a<span>a</span>a<span>a</span></div>');
		var nodes = QW.Dom.pluckWhiteNode(node.childNodes);
		value_of(nodes.length).should_be(2);
		value_of(nodes[0].nodeName).should_be('SPAN');
		value_of(nodes[1].nodeName).should_be('SPAN');
	}
	, 'encodeURIForm' : function () {
		value_of(
			QW.Dom.encodeURIForm(
				QW.Dom.create('<form><input name="a" value="1"><select name="b"><option selected value="2"></option></select><input type="radio" name="c" value="1"><input type="radio" name="c" value="3" checked="checked"></form>')
			)
		).should_be('a=1&b=2&c=3');
	}
	, 'getDocRect' : function () {
		var drect = QW.Dom.getDocRect();
		value_of(drect).log();
	}
	, 'on un fire' : function () {
		var test = 0, handler;
		QW.Dom.insertAdjacentHTML(document.body, 'beforeEnd', '<div id="test">1</div>');
		var node = QW.NodeH.$('test');
		QW.Dom.on(node, 'mousedown', handler = function (e) {
			value_of(e.target.nodeName);
			test += 1;
		});
		QW.Dom.fire(node, 'mousedown');
		QW.Dom.un(node, 'mousedown', handler);
		value_of(test).should_be(1);
		QW.Dom.fire(node, 'mousedown');
		value_of(test).should_be(1);
		document.body.removeChild(node);
	}
	, '$' : function () {
		QW.Dom.insertAdjacentHTML(document.body, 'beforeEnd', '<div id="test">1</div>');
		var node = QW.NodeH.$('test');
		value_of(node).should_not_be(null);
		document.body.removeChild(node);
	}
	, 'addClass removeClass replaceClass hasClass' : function () {
		QW.Dom.insertAdjacentHTML(document.body, 'beforeEnd', '<div id="test">1</div>');
		var node = QW.NodeH.$('test');
		QW.Dom.addClass(node, 'abc');
		value_of(node.className).should_be('abc');

		value_of(QW.Dom.hasClass(node, 'abc')).should_be(true);

		QW.Dom.replaceClass(node, 'abc', 'bcd');
		value_of(node.className).should_be('bcd');

		value_of(QW.Dom.hasClass(node, 'bc')).should_be(false);
		document.body.removeChild(node);
	}
	, 'setStyle getStyle getCurrentStyle' : function () {
		QW.Dom.insertAdjacentHTML(document.body, 'beforeEnd', '<div id="test"><span>1</span></div>');
		var node = QW.NodeH.$('test');
		QW.Dom.setStyle(node, 'font-size', '15px');
		value_of(QW.Dom.getStyle(node, 'font-size')).should_be('15px');

		value_of(QW.Dom.getStyle(node.firstChild, 'font-size')).should_be(null);
		value_of(QW.Dom.getCurrentStyle(node.firstChild, 'font-size')).should_be('15px');
		document.body.removeChild(node);
	}
	, 'show hide isVisible' : function () {
		QW.Dom.insertAdjacentHTML(document.body, 'beforeEnd', '<div id="test"><span>1</span></div>');
		var node = QW.NodeH.$('test');
		value_of(QW.Dom.isVisible(node)).should_be(true);
		QW.Dom.hide(node);
		value_of(QW.Dom.isVisible(node)).should_be(false);
		QW.Dom.show(node);
		value_of(QW.Dom.isVisible(node)).should_be(true);
		document.body.removeChild(node);
	}
	, 'borderWidth marginWidth paddingWidth' : function () {
		QW.Dom.insertAdjacentHTML(document.body, 'beforeEnd', '<div id="test" style="margin:10px;padding:10px;border:10px #000 solid">1</div>');
		var node = QW.NodeH.$('test');
		value_of(QW.Dom.borderWidth(node).toString()).should_be('10,10,10,10');
		value_of(QW.Dom.marginWidth(node).toString()).should_be('10,10,10,10');
		value_of(QW.Dom.paddingWidth(node).toString()).should_be('10,10,10,10');
		document.body.removeChild(node);
	}
	, 'contains' : function () {
		QW.Dom.insertAdjacentHTML(document.body, 'beforeEnd', '<div id="test"><div>1</div></div>');
		var node = QW.NodeH.$('test');
		value_of(QW.Dom.contains(node, node.firstChild)).should_be(true);
		value_of(QW.Dom.contains(node, node)).should_be(false);
		value_of(QW.Dom.contains(node, document.body)).should_be(false);
		document.body.removeChild(node);
	}
	, 'appendChild insertSiblingBefore' : function () {
		var node = QW.Dom.create('<div id="test">1</div>');
		QW.Dom.appendChild(document.body, node);
		
		value_of(QW.NodeH.$('test')).should_not_be(null);

		QW.Dom.insertSiblingBefore(node.firstChild, document.createTextNode('0'));
		value_of(node.innerHTML).should_be('01');
		document.body.removeChild(node);
	}
	, 'nextSibling previousSibling ancestorNode firstChild' : function () {
		QW.Dom.insertAdjacentHTML(document.body, 'beforeEnd', '<div><span>1</span><span id="test">2</span><span>3</span></div>');
		var node = QW.NodeH.$('test');
		var temp = QW.Dom.nextSibling(node);
		value_of(temp.nodeName).should_be('SPAN');
		value_of(QW.Dom.nextSibling(temp)).should_be(null);

		var temp = QW.Dom.previousSibling(node);
		value_of(QW.Dom.firstChild(temp.parentNode) == temp).should_be(true);
		value_of(QW.Dom.previousSibling(temp)).should_be(null);

		value_of(QW.Dom.ancestorNode(temp, 'BODY').nodeName).should_be('BODY');
		value_of(QW.Dom.ancestorNode(temp).nodeName).should_be('DIV');
		document.body.removeChild(node.parentNode);
	}
	, 'set get' : function () {
		var node = QW.Dom.create('<div>1</div>');
		var temp = {};
		QW.Dom.set(node, 'name', temp);
		value_of(QW.Dom.get(node, 'name')).should_be(temp);
	}
	, 'setAttr getAttr' : function () {
		var node = QW.Dom.create('<div test="1">1</div>');
		QW.Dom.setAttr(node, 'id', 'a');
		value_of(QW.Dom.getAttr(node, 'id')).should_be('a');
		value_of(QW.Dom.getAttr(node, 'test')).should_be('1');
	}
	, 'setSize setInnerSize' : function () {
		QW.Dom.insertAdjacentHTML(document.body, 'beforeEnd', '<div id="test" style="font-size:0px;line-height:0px;border:5px #000 solid;padding:5px;"></div>');
		var node = QW.NodeH.$('test');

		value_of(node.offsetHeight).should_be(20);
		
		QW.Dom.setSize(node, 30, 30);
		value_of(node.offsetHeight).should_be(30);

		QW.Dom.setInnerSize(node, 30, 30);
		value_of(node.offsetHeight).should_be(50);

		document.body.removeChild(node);
	}
	, 'getRect getXY setXY setInnerRect setRect' : function () {
		QW.Dom.insertAdjacentHTML(document.body, 'beforeEnd', '<div id="test" style="left:10px;top:10px;position:absolute;font-size:0px;line-height:0px;border:5px #000 solid;padding:5px;"></div>');
		var node = QW.NodeH.$('test');
		value_of(QW.Dom.getXY(node).toString()).should_be('10,10');

		QW.Dom.setXY(node, 11, 11);
		value_of(QW.Dom.getXY(node).toString()).should_be('11,11');
	
		QW.Dom.setRect(node, 12, 12, 30, 30);
		var temp = QW.Dom.getRect(node);
		value_of([temp.top, temp.right, temp.bottom, temp.left, temp.width, temp.height].toString()).should_be('12,42,42,12,30,30');

		QW.Dom.setInnerRect(node, 13, 13, 30, 30);
		var temp = QW.Dom.getRect(node);
		value_of([temp.top, temp.right, temp.bottom, temp.left, temp.width, temp.height].toString()).should_be('13,63,63,13,50,50');

		document.body.removeChild(node);
	}
});