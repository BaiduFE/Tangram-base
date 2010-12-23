module("baidu.dom.getParent");

/**
 * parentNode跟parentElement除了前者是w3c标准，后者只ie支持，其他的区别就不是那么明显了。
 * 
 * 当父节点的nodeType不是1，即不是element节点的话，它的parentElement就会是null。
 * 这就明白了名字中“Element”的含义了。
 */
test("基础校验", function() {
//	equals(baidu.dom.getParent(document.body), document);
	equals(baidu.dom.getParent(document.body.firstChild), document.body);
	equals(baidu.dom.getParent(document.createElement("div")), null);
	equals(baidu.dom.getParent(document.body.appendChild(document
			.createTextNode("test"))), document.body);
});