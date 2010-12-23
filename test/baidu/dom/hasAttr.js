/**
 * 参考如下链接
 * <a>http://w3schools.com/html/html_attributes.asp</a>
 */
module('baidu.dom.hasAttr')

test('基础测试', function() {
	expect(3);
	var div = document.createElement('div');
	div.setAttribute('title',"div_hasAttri");
	div.setAttribute('className',"test-div");
	ok(!baidu.dom.hasAttr(div, "rel"),"div has no rel attribute");
	ok(baidu.dom.hasAttr(div,"title"),"div has title attribute");
	/*IE下使用class,chrome,FF使用className*/
	ok(baidu.dom.hasAttr(div,"class")||baidu.dom.hasAttr(div,"className"),"div has class attribute");
});

/**
 * 针对所有对象做id判断的用例
 */
test('遍历所有元素类型', function() {
	var eleNames = ('p,h1,h2,h3,h4,h5,h6,blockquote,ol,ul,dl,div,form,a'
			+ ',table,fieldset,address,ins,del,em,strong,q,cite,dfn,abbr'
			+ ',acronym,code,samp,kbd,var,img,object,hr'
			+ ',input,button,label,select,iframe').split(',');
	expect(eleNames.length);
	for(var i in eleNames){
		var ele = document.createElement(eleNames[i]);
		ele.setAttribute('id',ele.tagName+"_ele");
		ok(baidu.dom.hasAttr(ele,'id'),ele.tagName+" has id attribute");
	}
})

/**
 * 为一个元素添加多个属性，判断各个属性是否存在
 * 
 */
test('针对一个元素的多个属性进行的判断', function() {
	expect(3);
	var input = null;
	try {
		// IE6/IE7 构建方式
		input = document.createElement('<input name="buttonName">');
	} catch (e) {
		// W3C 构建方式
		input = document.createElement('input');
		input.name = 'buttonName';
	}
	input.type = "button";
	input.disabled = true;
	ok(baidu.dom.hasAttr(input,"type"),"input has type attribute");
	ok(baidu.dom.hasAttr(input,"name"),"input has name attribute");
	ok(baidu.dom.hasAttr(input,"disabled"),"input has disabled attribute");
})

/**
 * However, the World Wide Web Consortium (W3C) recommends
 * <li>lowercase attributes/attribute values in their HTML 4 recommendation.
 */
test('针对大写情况下的属性进行判定', function() {
	expect(1);
	// TODO 该情况需要在其他Attribute用例中补充
	var div = document.createElement('div');
	div.setAttribute("NEW_ATTRIBUTE","new_attribute");
	ok(baidu.dom.hasAttr(div,"NEW_ATTRIBUTE"),"new attribute of Uppercase ");
	})

/**
 * <li>class
 * <li>id
 * <li>style
 * <li>title <code>
 class	classname			Specifies a classname for an element
 id		id					Specifies a unique id for an element
 style	style_definition	Specifies an inline style for an element
 title	tooltip_text 		Specifies extra information about an element (displayed as a tool tip)
 * </code>
 */
test('针对特定的默认属性进行测试', function() {
	expect(3);
	var li = document.createElement('li');
	li.setAttribute('className',"li_className");
	li.id = 'li_id';
	li.style.color = "blue";
	li.title = "li_title";
	ok(baidu.dom.hasAttr(li,"id"),"li has id attribute");
	ok(baidu.dom.hasAttr(li,"style"),"li has style attribute");
	ok(baidu.dom.hasAttr(li,"title"),"li has title attribute");
})

/**
 * a href
 */
test('特定标签的特定属性测试', function() {
	expect(5);
	try {
		// IE6/IE7 构建方式
		a = document.createElement('<a name="baidu">');
	} catch (e) {
		// W3C 构建方式
		a = document.createElement('a');
		a.name = 'baidu';
	}
	a.charset = 'utf-8';
	a.href = "http://www.baidu.com";
	a.target = "_self";
	a.shape = "default";
	ok(a.charset=='utf-8',"charset testing");
	/*  IE下为'http://www.baidu.com',chrome下为'http://www.baidu.com/'  */
	ok(baidu.dom.hasAttr(a,"href"),"a has href attribute");
	ok(baidu.dom.hasAttr(a,"name"),"a has name attribute");
	ok(baidu.dom.hasAttr(a,"target"),"a has target attribute");
	ok(baidu.dom.hasAttr(a,"shape"),"a has shape attribute");
})