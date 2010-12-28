module("baidu.url.queryToJson测试");

test("URL中没有参数的情况", function(){
	var obj = baidu.url.queryToJson("http://baidu.com");
	equals(typeof obj, "object", '');
	//same(obj, {}, '');
});

test("URL中只有一个参数的情况", function(){
	same(baidu.url.queryToJson("http://baidu.com?Key123!@=Value456*("), {"Key123!@":"Value456*("}, '');
	same(baidu.url.queryToJson("http://baidu.com?k=v"), {"k":"v"}, '');
	same(baidu.url.queryToJson("http://baidu.com?中文abc=英文123"), {"中文abc":"英文123"}, '');
	same(baidu.url.queryToJson("http://baidu.com???中文abc=英文123"), {"中文abc":"英文123"}, '');
	same(baidu.url.queryToJson("http://baidu.com?ＡＢｚ１２％\t\n=ｄｋＦＺ２３\b\a"), {"ＡＢｚ１２％\t\n":"ｄｋＦＺ２３\b\a"}, '');
});

test("URL中不止一个参数的情况", function(){
	same(baidu.url.queryToJson("http://baidu.com?Hello90(=NiHao89)&Key123!@=Value456*("), {"Hello90(":"NiHao89)","Key123!@":"Value456*("}, '');
	same(baidu.url.queryToJson("http://baidu.com?z=s&k=v"), {"z":"s", "k":"v"}, '');
	same(baidu.url.queryToJson("http://baidu.com?百度baidu=中国bai&中文abc=英文123&ddd=ccc"), {"百度baidu":"中国bai", "中文abc":"英文123", "ddd":"ccc"}, '');
	same(baidu.url.queryToJson("http://baidu.com?ｌＪ２３\t=ｉｕ９８\n&ＡＢｚ１２％\t\n=ｄｋＦＺ２３\b\a"), {"ｌＪ２３\t":"ｉｕ９８\n", "ＡＢｚ１２％\t\n":"ｄｋＦＺ２３\b\a"}, '');
});

test("URL中不止一个参数，并且key中带转义字符的情况", function(){
	same(baidu.url.queryToJson("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25&%25%26%2B%2F%23%3D%20=%20%3D%23%2F%2B%26%25"), 
								{"%25":"%20", "%26":"%3D", "%2B":"%23", "%2F":"%2F", "%23":"%2B", "%3D":"%26", "%20":"%25", "%25%26%2B%2F%23%3D%20":"%20%3D%23%2F%2B%26%25"}, '');
});

test("URL中出现空值参数的情况", function(){
	same(baidu.url.queryToJson("http://baidu.com?Hello90(=&Key123!@=Value456*("), {"Hello90(":"","Key123!@":"Value456*("}, '');
});

test("URL中存在相同的参数的情况，多值合并数组", function(){
	same(baidu.url.queryToJson("http://baidu.com?hello=nihao&hello=nibuhao&temp=temp2"), {"hello":["nihao",'nibuhao'], "temp":"temp2"}, '');
	//key仅半角的大小写的区别
	same(baidu.url.queryToJson("http://baidu.com?Hello=nihao&hello=nibuhao&temp=temp2"), {"Hello":"nihao", "hello":"nibuhao", "temp":"temp2"}, '');
	//key仅全角的大小写的区别
	same(baidu.url.queryToJson("http://baidu.com?Ｈello=nihao&ｈello=nibuhao&temp=temp2"), {"Ｈello":"nihao","ｈello":"nibuhao", "temp":"temp2"}, '');
});

test("URL中存在數組", function(){
	same(baidu.url.queryToJson("http://baidu.com?1=3&1=2&1=1&2=6&2=5&2=4&3=9&3=8&3=7"), {"1" : [ '3','2','1' ],"2" :[ '6','5','4' ],"3" : [ '9','8','7' ]}, '');
})

//describe("baidu.url.queryToJson测试",{
//    "URL中没有参数的情况":function(){
//        value_of(baidu.url.queryToJson("http://baidu.com")).should_be({});
//    },
//
//    "URL中只有一个参数的情况":function(){
//        value_of(baidu.url.queryToJson("http://baidu.com?Key123!@=Value456*(")).should_be({"Key123!@":"Value456*("});
//        value_of(baidu.url.queryToJson("http://baidu.com?k=v")).should_be({"k":"v"});
//        value_of(baidu.url.queryToJson("http://baidu.com?中文abc=英文123")).should_be({"中文abc":"英文123"});
//        value_of(baidu.url.queryToJson("http://baidu.com?ＡＢｚ１２％\t\n=ｄｋＦＺ２３\b\a")).
//            should_be({"ＡＢｚ１２％\t\n":"ｄｋＦＺ２３\b\a"});
//    },
//
//    "URL中不止一个参数的情况":function(){
//        value_of(baidu.url.queryToJson("http://baidu.com?Hello90(=NiHao89)&Key123!@=Value456*(")).
//            should_be({"Hello90(":"NiHao89)","Key123!@":"Value456*("});
//        value_of(baidu.url.queryToJson("http://baidu.com?z=s&k=v")).should_be({"z":"s", "k":"v"});
//        value_of(baidu.url.queryToJson("http://baidu.com?百度baidu=中国bai&中文abc=英文123&ddd=ccc")).
//            should_be({"百度baidu":"中国bai", "中文abc":"英文123", "ddd":"ccc"});
//        value_of(baidu.url.queryToJson("http://baidu.com?ｌＪ２３\t=ｉｕ９８\n&ＡＢｚ１２％\t\n=ｄｋＦＺ２３\b\a")).
//            should_be({"ｌＪ２３\t":"ｉｕ９８\n", "ＡＢｚ１２％\t\n":"ｄｋＦＺ２３\b\a"});
//    },
//
//
//    "URL中不止一个参数，并且key中带转义字符的情况":function(){
//        value_of(baidu.url.queryToJson("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25" + 
//            "&%25%26%2B%2F%23%3D%20=%20%3D%23%2F%2B%26%25")).
//            should_be({"%25":"%20", "%26":"%3D", "%2B":"%23", "%2F":"%2F", "%23":"%2B", "%3D":"%26", "%20":"%25", 
//                "%25%26%2B%2F%23%3D%20":"%20%3D%23%2F%2B%26%25"});
//    },
//
//    "URL中出现空值参数的情况": function () {
//        value_of(baidu.url.queryToJson("http://baidu.com?Hello90(=&Key123!@=Value456*(")).
//            should_be({"Hello90(":"","Key123!@":"Value456*("});
//    },
//
//    "URL中存在相同的参数的情况，多值合并数组":function(){
//        value_of(baidu.url.queryToJson("http://baidu.com?hello=nihao&hello=nibuhao&temp=temp2")).
//            should_be({"hello":["nihao",'nibuhao'], "temp":"temp2"});
//        //key仅半角的大小写的区别
//        value_of(baidu.url.queryToJson("http://baidu.com?Hello=nihao&hello=nibuhao&temp=temp2")).
//            should_be({"Hello":"nihao", "hello":"nibuhao", "temp":"temp2"});
//        //key仅全角的大小写的区别
//        value_of(baidu.url.queryToJson("http://baidu.com?Ｈello=nihao&ｈello=nibuhao&temp=temp2")).
//            should_be({"Ｈello":"nihao","ｈello":"nibuhao", "temp":"temp2"});
//    }
//});
