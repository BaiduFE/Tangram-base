module("baidu.lang.isElement");

test("Element对象", function(){
	
	var oDiv = document.createElement("div"); // create div
	oDiv.id="erikElement";
	document.body.appendChild(oDiv);
	
	equals(baidu.lang.isElement(document.getElementById('erikElement')), true, 'baidu.lang.isElement(document.getElementById("erikElement")) is true');
	
	oDiv.parentNode.removeChild(oDiv); // remove div
});

test("document", function(){
	equals(baidu.lang.isElement(document), false, 'baidu.lang.isElement(document) is false');
});

test("Object参数", function(){
	equals(baidu.lang.isElement({}), false, 'baidu.lang.isElement({}) is false');
});

test("Function类型", function(){
	equals(baidu.lang.isElement(new Function()), false, 'baidu.lang.isElement(new Function()) is false');
});

test("string类型", function(){
	equals(baidu.lang.isElement("test"), false, 'baidu.lang.isElement("test") is false');
});

test("number类型", function(){
	equals(baidu.lang.isElement(1), false, 'baidu.lang.isElement(1) is false');
});

test("boolean类型", function(){
	equals(baidu.lang.isElement(true), false, 'baidu.lang.isElement(true) is false');
	equals(baidu.lang.isElement(false), false, 'baidu.lang.isElement(false) is false');
});

test("null参数", function(){
	equals(baidu.lang.isElement(null), false, 'baidu.lang.isElement(null) is false');
});

test("undefined参数", function(){
	equals(baidu.lang.isElement(void(0)), false, 'baidu.lang.isElement(void(0)) is false');
});


//describe('baidu.lang.isElement测试',{
//    'Element对象': function () {
//        value_of(baidu.lang.isElement(document.getElementById('erikElement'))).should_be_true();
//    },
//
//    'document': function () {
//        value_of(baidu.lang.isElement(document)).should_be_false();
//    },
//
//    'Object参数': function () {
//        value_of(baidu.lang.isElement({})).should_be_false();
//    },
//
//    'Function类型': function () {
//        value_of(baidu.lang.isElement(new Function())).should_be_false();
//    },
//
//    'string类型': function () {
//        value_of(baidu.lang.isElement("test")).should_be_false();
//    },
//
//    'number类型': function () {
//        value_of(baidu.lang.isElement(1)).should_be_false();
//    },
//
//    'boolean类型': function () {
//        value_of(baidu.lang.isElement(true)).should_be_false();
//    },
//
//    'null参数': function () {
//        value_of(baidu.lang.isElement(null)).should_be_false();
//    },
//
//    'undefined参数': function () {
//        value_of(baidu.lang.isElement(void(0))).should_be_false();
//    }
//});