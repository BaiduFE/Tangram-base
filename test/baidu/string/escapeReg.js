module("baidu.String.escapeReg测试");

/**
 *  Test escape char: .*+?^=!:${}()|[]/\\
 *  Test new RegExp()
 *  Test exception case (null undefined)
 */

test("检查所有的需要转义的字符", function(){
	var strin = ".*+?^=!:${}()|[]/\\";
	var strout = "\.\*\+\?\^\=\!\:\$\{\}\(\)\|\[\]\/\\";
    equals(strin, strout);
}); // 1

test("输入包含需要转义的英文字符串", function(){
	var strin = "[escape]|.{reg}";
	var strout = "\[escape\]\|\.\{reg\}";
    equals(strin, strout);
}); // 2

test("输入混合字符串", function(){
	var strin = "(百度)^China?.";
	var strout = "\(百度\)\^China\?\.";
    equals(strin, strout);
    
  //带减号-的时候不需要转义减号
    strin = "[^w-z]+?(匹)配$";
    strout = "\[\^w-z\]\+\?\(匹\)配\$";
    equals(strin, strout);
}); // 3

test("输入没有转义字符的串", function(){
	var strEscapeReg = "";
	
	strEscapeReg = baidu.string.escapeReg("百度 中国");
    equals(strEscapeReg, "百度 中国");
    
    strEscapeReg = baidu.string.escapeReg("baidu china");
    equals(strEscapeReg, "baidu china");
    
    strEscapeReg = baidu.string.escapeReg("百度 china");
    equals(strEscapeReg, "百度 china");

    //带减号的时候不需要转义减号
    strEscapeReg = baidu.string.escapeReg("234-Hi-自动化");
    equals(strEscapeReg, "234-Hi-自动化");
}); // 4

test("输入空串", function(){
	var strEscapeReg = "";
	
	strEscapeReg = baidu.string.escapeReg("");
    equals(strEscapeReg, "");
}); // 5

test("构造正则表达式匹配", function(){
	var basestr = "bai[du]{test}end$^head+d..com";
	var str1 = "i[du]";
	var str2 = "^hea";
	var str3 = "u]{test}en";
	var str4 = "end$";
	var str5 = "d+d";
	var str6 = "d..com";
	var str7 = "^bai";
	var str8 = "com$";
    
    equals(new RegExp(baidu.string.escapeReg(str1)).test(basestr), true);
    equals(new RegExp(baidu.string.escapeReg(str2)).test(basestr), true);
    equals(new RegExp(baidu.string.escapeReg(str3)).test(basestr), true);
    equals(new RegExp(baidu.string.escapeReg(str4)).test(basestr), true);
    equals(new RegExp(baidu.string.escapeReg(str5)).test(basestr), true);
    equals(new RegExp(baidu.string.escapeReg(str6)).test(basestr), true);
    
    // baidu.string.escapeReg(str7)返回原字符串，此处为"^bai"，在basestr中不存在，故为false
    equals(new RegExp(baidu.string.escapeReg(str7)).test(basestr), false); 
    equals(new RegExp(baidu.string.escapeReg(str8)).test(basestr), false);
}); // 6

test("异常case", function(){
	var nullStr = null;	
	equals(baidu.string.escapeReg(nullStr), "null");
	
    var undefinedStr;
    equals(baidu.string.escapeReg(undefinedStr), "undefined");
}); // 7

////escapeReg的测试
//describe("baidu.String.escapeReg测试",{
//    "检查所有的需要转义的字符":function (){
//        strin = ".*+?^=!:${}()|[]/\\";
//        strout = "\\.\\*\\+\\?\\^\\=\\!\\:\\$\\{\\}\\(\\)\\|\\[\\]\\/\\\\";
//        value_of(baidu.string.escapeReg(strin)).should_be(strout);
//    },
//
//    "输入包含需要转义的英文字符串":function (){
//        strin = "[escape]|.{reg}";
//        strout = "\\[escape\\]\\|\\.\\{reg\\}";
//        value_of(baidu.string.escapeReg(strin)).should_be(strout);
//    },
//
//    "输入混合字符串":function (){
//        strin = "(百度)^China?.";
//        strout = "\\(百度\\)\\^China\\?\\.";
//        value_of(baidu.string.escapeReg(strin)).should_be(strout);
//        //带减号-的时候不需要转义减号
//        strin = "[^w-z]+?(匹)配$";
//        strout = "\\[\\^w-z\\]\\+\\?\\(匹\\)配\\$";
//        value_of(baidu.string.escapeReg(strin)).should_be(strout);
//    },
//
//    "输入没有转义字符的串":function (){
//        value_of(baidu.string.escapeReg("百度 中国")).should_be("百度 中国");
//        value_of(baidu.string.escapeReg("baidu china")).should_be("baidu china");
//        value_of(baidu.string.escapeReg("百度 china")).should_be("百度 china");
//        //带减号的时候不需要转义减号
//        value_of(baidu.string.escapeReg("234-Hi-自动化")).should_be("234-Hi-自动化");
//        
//    },
//
//    "输入空串":function (){
//        value_of(baidu.string.escapeReg("")).should_be("");
//    },
//
//    "构造正则表达式匹配":function (){
//        basestr = "bai[du]{test}end$^head+d..com";
//        str1 = "i[du]";
//        str2 = "^hea";
//        str3 = "u]{test}en";
//        str4 = "end$";
//        str5 = "d+d";
//        str6 = "d..com";
//        str7 = "^bai";
//        str8 = "com$";
//        
//        value_of(new RegExp(baidu.string.escapeReg(str1)).test(basestr)).should_be_true();
//        value_of(new RegExp(baidu.string.escapeReg(str2)).test(basestr)).should_be_true();
//        value_of(new RegExp(baidu.string.escapeReg(str3)).test(basestr)).should_be_true();
//        value_of(new RegExp(baidu.string.escapeReg(str4)).test(basestr)).should_be_true();
//        value_of(new RegExp(baidu.string.escapeReg(str5)).test(basestr)).should_be_true();
//        value_of(new RegExp(baidu.string.escapeReg(str6)).test(basestr)).should_be_true();
//        value_of(new RegExp(baidu.string.escapeReg(str7)).test(basestr)).should_be_false();
//        value_of(new RegExp(baidu.string.escapeReg(str8)).test(basestr)).should_be_false();
//    },
//
//    "异常case":function (){
//        var nullStr = null;
//        value_of(baidu.string.escapeReg(nullStr)).should_be("null");
//        var undefinedStr;
//        value_of(baidu.string.escapeReg(undefinedStr)).should_be("undefined");
//    }
//});