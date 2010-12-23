module("baidu.string.getByteLength测试");

//分别检查英文串，中文串，有无空格和特殊字符（需要转义的字符以及全角字符）的情况
test("纯中文串和英文串测试", function(){
	equals(baidu.string.getByteLength('lovemylife'), 10);
	equals(baidu.string.getByteLength('中国百度七巧板'), 14);
}); // 1

test("包含转义字符和空格的字符串测试", function(){
	equals(baidu.string.getByteLength(new String('love?\tmy life\\')), 14); // \t \\ 两个转义符
	equals(baidu.string.getByteLength('中国 百度  七巧板'), 17);
}); // 2

test("包含全角字符的字符串", function(){
	equals(baidu.string.getByteLength('＋ｍｏｏ＃'), 10);
	equals(baidu.string.getByteLength('百＄七 板 ＊）％moon'), 20);
}); // 3

//混合串的长度，分别测试的是英文奇数个字符，偶数个字符，以及中英文混合的情况
test("中英文字符混合的字符串", function(){
	equals(baidu.string.getByteLength('love中国life'), 12);
	equals(baidu.string.getByteLength('lov中国'), 7);
	equals(baidu.string.getByteLength('国lif'), 5);
	equals(baidu.string.getByteLength('love中国life人民'), 16);
}); // 4

test("中英文混合加上标点符号的字符串", function(){
	equals(baidu.string.getByteLength('love? 中国 life#'), 16);
}); // 5

//空串和异常情况
test("空串", function(){
	equals(baidu.string.getByteLength(""), 0);
}); // 6

test("异常case", function(){
	var nullStr = null;
	equals(baidu.string.getByteLength(nullStr), 4);
	
	var undefinedStr;
	equals(baidu.string.getByteLength(undefinedStr), 9); // undefined is 9 char
	
	var num = -108;
	equals(baidu.string.getByteLength(num), 4);
}); // 7

////getByteLength的测试
//describe("baidu.String.getByteLength测试",{
//    //分别检查英文串，中文串，有无空格和特殊字符（需要转义的字符以及全角字符）的情况
//    "纯中文串和英文串测试":function() {
//        value_of(baidu.string.getByteLength('lovemylife')).should_be(10);
//        value_of(baidu.string.getByteLength('中国百度七巧板')).should_be(14);
//    },
//    "包含转义字符和空格的字符串测试":function (){
//        value_of(baidu.string.getByteLength(new String('love?\tmy life\\'))).should_be(14);
//        value_of(baidu.string.getByteLength('中国 百度  七巧板')).should_be(17);
//    },
//    "包含全角字符的字符串":function() {
//        value_of(baidu.string.getByteLength('＋ｍｏｏ＃')).should_be(10);
//        value_of(baidu.string.getByteLength('百＄七 板 ＊）％moon')).should_be(20);
//    },
//        //混合串的长度，分别测试的是英文奇数个字符，偶数个字符，以及中英文混合的情况
//    "中英文字符混合的字符串":function (){
//        value_of(baidu.string.getByteLength('love中国life')).should_be(12);
//        value_of(baidu.string.getByteLength('lov中国')).should_be(7);
//        value_of(baidu.string.getByteLength(new String('国lif'))).should_be(5);
//        value_of(baidu.string.getByteLength('love中国life人民')).should_be(16);
//    },
//    "中英文混合加上标点符号的字符串":function (){
//        value_of(baidu.string.getByteLength('love? 中国 life#')).should_be(16);
//    },
//        
//    //空串和异常情况
//    "空串":function (){
//        value_of(baidu.string.getByteLength("")).should_be(0);
//    },
//
//    "异常case":function(){
//        var nullStr = null;
//        value_of(baidu.string.getByteLength(nullStr)).should_be(4);
//        var undefinedStr;
//        value_of(baidu.string.getByteLength(undefinedStr)).should_be(9);
//        var num = -108;
//        value_of(baidu.string.getByteLength(num)).should_be(4);
//        //不可以直接不声明变量就调用函数，否则直接报错，函数不执行
//        //value_of(baidu.string.getByteLength(unstr)).should_be(0);
//     }
//});