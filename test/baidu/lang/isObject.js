module("baidu.lang.isObject测试");

test("Object参数", function(){
	equals(baidu.lang.isObject({}), true, 'baidu.lang.isObject({}) is true');
});

test("Function类型", function(){
	equals(baidu.lang.isObject(new Function()), true, 'baidu.lang.isObject(new Function()) is true');
});

test("Array对象", function(){
	equals(baidu.lang.isObject([]), true, 'baidu.lang.isObject([]) is true');
});

test("Element对象", function(){
	var oDiv = document.createElement("div"); // create div
	oDiv.id="erikElement";
	document.body.appendChild(oDiv);
	
	equals(baidu.lang.isObject(document.getElementById('erikElement')), true, 'baidu.lang.isObject(document.getElementById("erikElement")) is true');
	
	oDiv.parentNode.removeChild(oDiv); // remove div
});

test("string对象", function(){
	equals(baidu.lang.isObject(new String("test")), true, 'baidu.lang.isObject(new String("test")) is true');
});

test("string类型", function(){
	equals(baidu.lang.isObject("test"), false, 'baidu.lang.isObject("test") is false');
});

test("number类型", function(){
	equals(baidu.lang.isObject(1), false, 'baidu.lang.isObject(1) is false');
});

test("boolean类型", function(){
	equals(baidu.lang.isObject(true), false, 'baidu.lang.isObject(true) is false');
	equals(baidu.lang.isObject(false), false, 'baidu.lang.isObject(false) is false');
});

test("null参数", function(){
	equals(baidu.lang.isObject(null), false, 'baidu.lang.isObject(null) is false');
});

test("undefined参数", function(){
	equals(baidu.lang.isObject(void(1)), false, 'baidu.lang.isObject(void(1)) is false');
});

test("快捷方式", function(){
	equals(baidu.isObject({}), true, 'baidu.isObject({}) is true');
});



//describe('baidu.lang.isObject测试',{
//    'Object参数': function () {
//        value_of(baidu.lang.isObject({})).should_be_true();
//    },
//
//    'Function类型': function () {
//        value_of(baidu.lang.isObject(new Function())).should_be_true();
//    },
//
//    'Array对象': function () {
//        value_of(baidu.lang.isObject([])).should_be_true();
//    },
//
//    'Element对象': function () {
//        value_of(baidu.lang.isObject(document.getElementById('erikElement'))).should_be_true();
//    },
//	
//	'string对象': function () {
//        value_of(baidu.lang.isObject(new String("string object"))).should_be_true();
//    },
//    
//    'string类型': function () {
//        value_of(baidu.lang.isObject("test")).should_be_false();
//    },
//
//    'number类型': function () {
//        value_of(baidu.lang.isObject(1)).should_be_false();
//    },
//
//    'boolean类型': function () {
//        value_of(baidu.lang.isObject(true)).should_be_false();
//    },
//
//    'null参数': function () {
//        value_of(baidu.lang.isObject(null)).should_be_false();
//    },
//
//    'undefined参数': function () {
//        value_of(baidu.lang.isObject(void(0))).should_be_false();
//    },
//	
//	'快捷方式': function () {
//        value_of(baidu.isObject({})).should_be_true();
//    }
//});