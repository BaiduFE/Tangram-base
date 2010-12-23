module("baidu.String.toHalfWidth测试");

test("输入为纯全角字符串", function(){
	strin = "ｑｕａｎ　ＪＩＡＯ％８６５＠　？＄";
	strout = "quan JIAO%865@ ?$";
	equals(baidu.string.toHalfWidth(strin), strout);
	
	//遍历所有的全角字符
	strin = "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ１２３４５６７８９０｀";
	strout = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`";
	equals(baidu.string.toHalfWidth(strin), strout);
	
	strin = "～！＠＃＄％＾＆＊（）－＿＝＋［］｛｝＼｜；：＇＂，．＜＞／？";
	strout = "~!@#$%^&*()-_=+[]{}\\|;:'\",.<>/?";
	equals(baidu.string.toHalfWidth(strin), strout);
}); // 1

test("输入为全角和半角混合串", function(){
	strin = "strｉｎｇ　ＣＬＡSS@baidu{．｝ｃｏｍ＃";
	strout = "string CLASS@baidu{.}com#";
	equals(baidu.string.toHalfWidth(strin), strout);
}); // 2

test("输入空串", function(){
	equals(baidu.string.toHalfWidth(""), "");
}); // 3

test("输入串包括中文和全角字符", function(){
	strin = "中－国Ｌｏ３7８ｖｅ百～度";
	strout = "中-国Lo378ve百~度";
	equals(baidu.string.toHalfWidth(strin), strout);
}); // 4

test("输入不包含全角的字符串", function(){
	equals(baidu.string.toHalfWidth("normal en glish"), "normal en glish");
	equals(baidu.string.toHalfWidth("正常字符 串 百度"), "正常字符 串 百度");
	equals(baidu.string.toHalfWidth("百度 n o rmal"), "百度 n o rmal");
}); // 5

test("输入包含转义字符的字符串", function(){
	equals(baidu.string.toHalfWidth("n\ten\\gli\nsh\s"), "n\ten\\gli\nsh\s");
}); // 6

test("异常case", function(){
	var nullStr = null;
	equals(baidu.string.toHalfWidth(nullStr), "null");
	
	var undefinedStr;
	equals(baidu.string.toHalfWidth(undefinedStr), "undefined");
});

////toHalfWidth的测试
//describe("baidu.String.toHalfWidth测试",{
//    "输入为纯全角字符串":function (){
//        strin = "ｑｕａｎ　ＪＩＡＯ％８６５＠　？＄";
//        strout = "quan JIAO%865@ ?$";
//        value_of(baidu.string.toHalfWidth(strin)).should_be(strout);
//        //遍历所有的全角字符
//        strin = "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ１２３４５６７８９０｀";
//        strout = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`";
//        value_of(baidu.string.toHalfWidth(strin)).should_be(strout);
//        strin = "～！＠＃＄％＾＆＊（）－＿＝＋［］｛｝＼｜；：＇＂，．＜＞／？";
//        strout = "~!@#$%^&*()-_=+[]{}\\|;:'\",.<>/?";
//        value_of(baidu.string.toHalfWidth(strin)).should_be(strout);
//    },
//
//    "输入为全角和半角混合串":function (){
//        strin = "strｉｎｇ　ＣＬＡSS@baidu{．｝ｃｏｍ＃";
//        strout = "string CLASS@baidu{.}com#";
//        value_of(baidu.string.toHalfWidth(strin)).should_be(strout);
//    },
//
//    "输入空串":function (){
//        value_of(baidu.string.toHalfWidth("")).should_be("");
//    },
//
//    "输入串包括中文和全角字符":function (){
//        strin = "中－国Ｌｏ３7８ｖｅ百～度";
//        strout = "中-国Lo378ve百~度";
//        value_of(baidu.string.toHalfWidth(strin)).should_be(strout);
//    },
//
//    "输入不包含全角的字符串":function (){
//        value_of(baidu.string.toHalfWidth("normal en glish")).should_be("normal en glish");
//        value_of(baidu.string.toHalfWidth("正常字符 串 百度")).should_be("正常字符 串 百度");
//        value_of(baidu.string.toHalfWidth("百度 n o rmal")).should_be("百度 n o rmal");
//    },
//
//    "输入包含转义字符的字符串":function (){
//        value_of(baidu.string.toHalfWidth("n\ten\\gli\nsh\s")).should_be("n\ten\\gli\nsh\s");
//    },
//
//    "异常case":function (){
//        var nullStr = null;
//        value_of(baidu.string.toHalfWidth(nullStr)).should_be("null");
//        var undefinedStr;
//        value_of(baidu.string.toHalfWidth(undefinedStr)).should_be("undefined");
//    }
//});