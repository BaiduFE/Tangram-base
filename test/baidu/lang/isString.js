module("baidu.lang.isString");

test("string类型", function(){
	equals(baidu.lang.isString("i am string"), true, 'baidu.lang.isString("i am string") is true');
});

test("String对象", function(){
	equals(baidu.lang.isString(new String("i am string")), true, 'baidu.lang.isString(new String("i am string")) is true');
});

test("number类型", function(){
	equals(baidu.lang.isString(1), false, 'baidu.lang.isString(1) is false');
});

test("boolean类型", function(){
	equals(baidu.lang.isString(true), false, 'baidu.lang.isString(true) is false');
	equals(baidu.lang.isString(false), false, 'baidu.lang.isString(false) is false');
});

test("Object参数", function(){
	equals(baidu.lang.isString({}), false, 'baidu.lang.isString({}) is false');
});

test("Function参数", function(){
	equals(baidu.lang.isString(new Function()), false, 'baidu.lang.isString(new Function()) is false');
});

test("null参数", function(){
	equals(baidu.lang.isString(null), false, 'baidu.lang.isString(null) is false');
});

test("undefined参数", function(){
	equals(baidu.lang.isString(void(1)), false, 'baidu.lang.isString(void(1)) is false');
});

test("快捷方式", function(){
	equals(baidu.isString("快捷方式"), true, 'baidu.isString("快捷方式") is true');
});


//describe('baidu.lang.isString测试',{
//    'string类型': function () {
//        value_of(baidu.lang.isString("i am string")).should_be_true();
//    },
//
//    'String对象': function () {
//        value_of(baidu.lang.isString(new String("i am string"))).should_be_true();
//    },
//    
//    'number类型': function () {
//        value_of(baidu.lang.isString(1)).should_be_false();
//    },
//
//    'boolean类型': function () {
//        value_of(baidu.lang.isString(true)).should_be_false();
//    },
//
//    'Object参数': function () {
//        value_of(baidu.lang.isString({})).should_be_false();
//    },
//
//    'Function参数': function () {
//        value_of(baidu.lang.isString(new Function())).should_be_false();
//    },
//
//    'null参数': function () {
//        value_of(baidu.lang.isString(null)).should_be_false();
//    },
//
//    'undefined参数': function () {
//        value_of(baidu.lang.isString(void(0))).should_be_false();
//    },
//	
//	'快捷方式': function () {
//        value_of(baidu.isString("快捷方式")).should_be_true();
//    }
//});
