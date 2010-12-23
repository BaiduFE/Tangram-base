module('baidu.dom.setAttr')

test('基础测试',
		function() {
			expect(3);
			var div = document.createElement('div');
			baidu.dom.setAttr(div, 'title', "div_getAttri");
			baidu.dom.setAttr(div, 'className', "test_div")
					|| div.setAttr('class', "test_div");
			equal(div.getAttribute("rel"), null, "div gets no rel attribute");
			equal(div.getAttribute("title"), "div_getAttri",
					"div gets title attribute");
			equal(div.className, "test_div", "div gets class attribute");
		});

/**
 * 针对所有对象做自定义属性判断的用例
 */
test(
		'遍历所有元素类型',
		function() {
			var eleNames = ('p,h1,h2,h3,h4,h5,h6,blockquote,ol,ul,dl,div,form,a' + ',table,fieldset,address,ins,del,em,strong,q,cite,dfn,abbr' + ',acronym,code,samp,kbd,var,img,object,hr' + ',input,button,label,select,iframe')
					.split(',');
			expect(eleNames.length * 2);
			for ( var i in eleNames) {
				var ele = document.createElement(eleNames[i]);
				baidu.dom.setAttr(ele, 'id', ele.tagName + "_ele");
				equal(ele.getAttribute('id'), ele.tagName + "_ele", ele.tagName
						+ " gets id attribute");
				if(baidu.ie==8){
					baidu.dom.setAttr(ele, 'data', ele.tagName + "_data");
					equal(ele.getAttribute('data'), ele.tagName + "_data",ele.tagName);
				}
				else {
					baidu.dom.setAttr(ele, 'test', ele.tagName + "_test");
					equal(ele.getAttribute('test'), ele.tagName + "_test",ele.tagName);
				}		
			}
		});

/**
 * 为一个元素添加多个属性，判断各个属性是否存在
 * 
 */
test(
		'针对一个元素的多个属性进行的判断',
		function() {
			expect(2);
			var input = document.createElement('input');
			baidu.setAttr(input, 'type', 'button');// shortcut
			baidu.setAttr(input, 'name', 'buttonName');
			equal(input.getAttribute("type"), 'button',
					"input gets type attribute");
			equal(input.getAttribute("name"), "buttonName",
					"input gets name attribute");
		})

/**
 * However, the World Wide Web Consortium (W3C) recommends
 * <li>lowercase attributes/attribute values in their HTML 4 recommendation.
 */
test('针对大写情况下的属性进行判定', function() {
	expect(1);
	// TODO 该情况需要在其他Attribute用例中补充
		var div = document.createElement('div');
		baidu.dom.setAttr(div, "NEW_ATTRIBUTE", "newAttribute");
		equal(div.getAttribute("NEW_ATTRIBUTE"), "newAttribute",
				"new attribute of Uppercase ");
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
	baidu.dom.setAttr(li, 'className', "li_className");
	baidu.dom.setAttr(li, 'id', 'li_id');
	baidu.dom.setAttr(li, 'title', 'li_title');
	baidu.dom.setAttr(li, 'style', 'color:blue');
	equal(li.getAttribute("id"), 'li_id', "li gets id attribute");
	// equal(baidu.string.trim(li.getAttribute("style")).toLowerCase(),baidu.browser.ie?"color:
	// blue":"color: blue;","li gets style attribute");
		var color = $.trim(li.style.color.toLowerCase());
		ok(color == 'blue' || color == '#0000ff' || color == 'rgb(0,0,255)',
				'get color blue');
		equal(li.getAttribute("title"), "li_title", "li gets title attribute");
	})

test('特定标签的特定属性测试', function() {
	expect(5);
	var a = document.createElement('a');
	baidu.dom.setAttr(a, 'charset', 'utf-8');
	baidu.dom.setAttr(a, 'href', 'http://www.baidu.com');
	baidu.dom.setAttr(a, 'name', 'baidu');
	baidu.dom.setAttr(a, 'target', '_self');
	baidu.dom.setAttr(a, 'shape', 'default');
	equal(a.getAttribute('charset'), 'utf-8', "charset testing");
	/* IE下为'http://www.baidu.com',chrome下为'http://www.baidu.com/' */
	equal(a.getAttribute('href'), "http://www.baidu.com"
			|| "http://www.baidu.com/", "href testing");
	equal(a.getAttribute('name'), 'baidu', "name testing");
	equal(a.getAttribute('target'), '_self', "target testing");
	equal(a.getAttribute('shape'), 'default', 'shape testing');
})

/**
 * TODO : add dom for testing
 * 
 */
// test(
// '异常case',
// function() {
// expect(1);
// var div = document.createElement('div');
// baidu.dom.setAttr('id','')
// equal(div.id,"","no name attribute");
// })

// describe('baidu.dom.setAttr测试', {
// '通过key/value方式设置属性值': function() {
// baidu.dom.setAttr("lb1_sa", "for", "text1_sa");
// value_of(baidu.dom.getAttr("lb1_sa", "for")).should_be("text1_sa");
//
// baidu.dom.setAttr("div1_sa", "class", "class1-ss");
// value_of(baidu.dom.getAttr("div1_sa", "class")).should_be("class1-ss");
//            
// baidu.dom.setAttr("p1_sa", "style", "font-size:12px;width:50px");
// value_of(baidu.dom.getStyle("p1_sa", "fontSize")).
// should_be("12px");
// value_of(baidu.dom.getStyle("p1_sa", "width")).
// should_be("50px");
//
// baidu.dom.setAttr("text1_sa", "width", "50px");
// value_of(baidu.dom.getAttr("text1_sa", "width")).should_match("50");
// //快捷方式
// baidu.setAttr("lb1_sa", "for", "text1_sa_s");
// value_of(baidu.dom.getAttr("lb1_sa", "for")).should_be("text1_sa_s");
//
// },
// '异常case': function() {
// var oP2 = baidu.dom.g("p2_sa");
//
// //添加的属性值不存在
// baidu.dom.setAttr(oP2, "attrerror", "test");
// value_of(baidu.dom.getAttr(oP2, "attrerror")).should_be("test");
// }
// });
