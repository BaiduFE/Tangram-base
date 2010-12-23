module("baidu.lang.isNumber");

test("number类型", function(){
	equals(baidu.lang.isNumber(1), true, 'baidu.lang.isNumber(1) is true');
});

test("Number对象", function(){
	equals(baidu.lang.isNumber(new Number(1)), true, 'baidu.lang.isNumber(new Number(1)) is true');
});

test("NaN", function(){
	equals(baidu.lang.isNumber(NaN), true, 'baidu.lang.isNumber(NaN) is true');
});

test("Object参数", function(){
	equals(baidu.lang.isNumber({}), false, 'baidu.lang.isNumber({}) is true');
});

test("Function类型", function(){
	equals(baidu.lang.isNumber(new Function()), false, 'baidu.lang.isNumber(new Function()) is false');
});

test("Element对象", function(){
	var oDiv = document.createElement("div"); // create div
	oDiv.id="erikElement";
	document.body.appendChild(oDiv);
	
	equals(baidu.lang.isNumber(document.getElementById("erikElement")), false, 'baidu.lang.isNumber(document.getElementById("erikElement")) is false');
	
	oDiv.parentNode.removeChild(oDiv); // remove div
});

test("string类型", function(){
	equals(baidu.lang.isNumber("test"), false, 'baidu.lang.isNumber("test") is false');
});

test("boolean类型", function(){
	equals(baidu.lang.isNumber(true), false, 'baidu.lang.isNumber(true) is false');
});

test("null参数", function(){
	equals(baidu.lang.isNumber(null), false, 'baidu.lang.isNumber(null) is false');
});

test("undefined参数", function(){
	equals(baidu.lang.isNumber(void(0)), false, 'baidu.lang.isNumber(void(0)) is false');
});


//describe('baidu.lang.isNumber测试',{
//    'number类型': function () {
//        value_of(baidu.lang.isNumber(1)).should_be_true();
//    },
//
//    'Number对象': function () {
//        value_of(baidu.lang.isNumber(new Number(1))).should_be_true();
//    },
//    
//    'NaN': function () {
//        value_of(baidu.lang.isNumber(NaN)).should_be_true();
//    },
//
//    'Object参数': function () {
//        value_of(baidu.lang.isNumber({})).should_be_false();
//    },
//
//    'Function类型': function () {
//        value_of(baidu.lang.isNumber(new Function())).should_be_false();
//    },
//
//    'Element对象': function () {
//        value_of(baidu.lang.isNumber(document.getElementById('erikElement'))).should_be_false();
//    },
//
//    'string类型': function () {
//        value_of(baidu.lang.isArray("test")).should_be_false();
//    },
//
//    'boolean类型': function () {
//        value_of(baidu.lang.isArray(true)).should_be_false();
//    },
//
//    'null参数': function () {
//        value_of(baidu.lang.isArray(null)).should_be_false();
//    },
//
//    'undefined参数': function () {
//        value_of(baidu.lang.isArray(void(0))).should_be_false();
//    }
//});