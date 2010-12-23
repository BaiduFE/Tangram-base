module("baidu.url.getQueryValue测试");

test("URL中没有参数时", function(){
	equals(baidu.url.getQueryValue("http://baidu.com", "key123!@"), null, 'url is not params for strng/number/other chars');
	equals(baidu.url.getQueryValue("http://baidu.com", "k"), null, 'url is not params for one char');
	equals(baidu.url.getQueryValue("http://baidu.com", "中文abc"), null, 'url is not params for english/chinese');
	equals(baidu.url.getQueryValue("http://baidu.com", "ＡＢｚ１２％\t\n"), null, 'url is not params for quan jiao zi fu');
});

test("URL中只有一个参数时，指定存在的key", function(){
	equals(baidu.url.getQueryValue("http://baidu.com?k=v", "k"), "v", 'URL has only one param(for english char)');
	equals(baidu.url.getQueryValue("http://baidu.com?中文abc=英文123", "中文abc"), "英文123", 'URL has only one param(for english/chinese char)');
	equals(baidu.url.getQueryValue("http://baidu.com?ＡＢｚ１２％\t\n=ｄｋＦＺ２３\b\a", "ＡＢｚ１２％\t\n"), "ｄｋＦＺ２３\b\a", 'URL has only one param(for quan jiao zi fu)');
	equals(baidu.url.getQueryValue("http://baidu.com?Key123!@=Value456*(", "Key123!@"), "Value456*(", 'URL has only one param(for other chars)');
});

test("URL中只有一个参数时，指定不存在的key", function(){
	equals(baidu.url.getQueryValue("http://baidu.com?Key123!@=Value456*(", "key123!@"), null, 'URL has only one param, but key is not exist(for other chars)');
	equals(baidu.url.getQueryValue("http://baidu.com?k=v", "v"), null, 'URL has only one param, but key is not exist(for english char)');
	equals(baidu.url.getQueryValue("http://baidu.com?中文abc=英文123", "中文ac"), null, 'URL has only one param, but key is not exist(for english/chinese char)');
	equals(baidu.url.getQueryValue("http://baidu.com?ＡＢｚ１２％\t\n=ｄｋＦＺ２３\b\a", "Ａｚ１２％\t\n"), null, 'URL has only one param, but key is not exist(for quan jiao zi fu)');
});

test("URL中不止一个参数时，指定存在的key", function(){
	equals(baidu.url.getQueryValue("http://baidu.com?z=s&k=v", "k"), "v", 'URL has more than one param(for english char)');
	equals(baidu.url.getQueryValue("http://baidu.com?百度baidu=中国bai&中文abc=英文123", "中文abc"), "英文123", 'URL has more than one param(for english/chinese char)');
	equals(baidu.url.getQueryValue("http://baidu.com?ｌＪ２３\t=ｉｕ９８\n&ＡＢｚ１２％\t\n=ｄｋＦＺ２３\b\a", "ＡＢｚ１２％\t\n"), "ｄｋＦＺ２３\b\a", 'URL has more than one param(quan jiao zi fu)');
	equals(baidu.url.getQueryValue("http://baidu.com?Hello90(=NiHao89)&Key123!@=Value456*(", "Key123!@"), "Value456*(", 'URL has more than one param(for other chars)');
});

test("URL中不止一个参数时，指定不存在的key", function(){
	equals(baidu.url.getQueryValue("http://baidu.com?Hello90(=NiHao89)&Key123!@=Value456*(", "key123!@"), null, 'URL has more than one param, but key is not exist(for other chars)');
	equals(baidu.url.getQueryValue("http://baidu.com?z=s&k=v", "v"), null, 'URL has more than one param, but key is not exist(for english char)');
	equals(baidu.url.getQueryValue("http://baidu.com?百度baidu=中国bai&中文abc=英文123", "中文bc"), null, 'URL has more than one param, but key is not exist(for english/chinese char)');
	equals(baidu.url.getQueryValue("http://baidu.com?ｌＪ２３\t=ｉｕ９８\n&ＡＢｚ１２％\t\n=ｄｋＦＺ２３\b\a", "Ａｚ１２％\t\n"), null, 'URL has more than one param, but key is not exist(quan jiao zi fu)');
});

test("URL中不止一个参数时，key是值为空的参数", function(){
	equals(baidu.url.getQueryValue("http://baidu.com?Hello90(=&Key123!@=Value456*(", "Hello90("), "", 'URL has more than one param, but key is null');
});

test("URL中不止一个参数时，key为带转义字符的参数", function(){
	equals(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%25"), "%20", 'URL has more than one param, but key is the escape char');
	equals(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%26"), "%3D", 'URL has more than one param, but key is the escape char');
	equals(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%2B"), "%23", 'URL has more than one param, but key is the escape char');
	equals(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%2F"), "%2F", 'URL has more than one param, but key is the escape char');
	equals(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%23"), "%2B", 'URL has more than one param, but key is the escape char');
	equals(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%3D"), "%26", 'URL has more than one param, but key is the escape char');
	equals(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%20"), "%25", 'URL has more than one param, but key is the escape char');
});

test("URL中存在相同的参数，指定key为该参数，取第一次出现的值", function(){
	//key完全相同
	equals(baidu.url.getQueryValue("http://baidu.com?heLlo=nihao&heLlo=nibuhao&temp=temp2", "heLlo"), "nihao", 'URL has same keys');
	//key仅半角的大小写的区别
	equals(baidu.url.getQueryValue("http://baidu.com?Hello=nihao&hello=nibuhao&temp=temp2", "hello"), "nibuhao", 'URL has different upper and lower chars');
	//key仅全角的大小写的区别
	equals(baidu.url.getQueryValue("http://baidu.com?Ｈello=nihao&ｈello=nibuhao&temp=temp2", "ｈello"), "nibuhao", 'URL has different quan jiao zi fu');
});

//describe("baidu.url.getQueryValue测试",{
//    "URL中没有参数时":function(){
//        value_of(baidu.url.getQueryValue("http://baidu.com", "key123!@")).should_be_null();
//        value_of(baidu.url.getQueryValue("http://baidu.com", "k")).should_be_null();
//        value_of(baidu.url.getQueryValue("http://baidu.com", "中文abc")).should_be_null();
//        value_of(baidu.url.getQueryValue("http://baidu.com", "ＡＢｚ１２％\t\n")).should_be_null();
//    },
//    
//    "URL中只有一个参数时，指定存在的key":function(){		
//        value_of(baidu.url.getQueryValue("http://baidu.com?k=v", "k")).should_be("v");
//        value_of(baidu.url.getQueryValue("http://baidu.com?中文abc=英文123", "中文abc")).should_be("英文123");
//        value_of(baidu.url.getQueryValue("http://baidu.com?ＡＢｚ１２％\t\n=ｄｋＦＺ２３\b\a", "ＡＢｚ１２％\t\n")).
//            should_be("ｄｋＦＺ２３\b\a");
//        value_of(baidu.url.getQueryValue("http://baidu.com?Key123!@=Value456*(", "Key123!@")).should_be("Value456*(");
//    },
//
//    "URL中只有一个参数时，指定不存在的key":function(){
//        value_of(baidu.url.getQueryValue("http://baidu.com?Key123!@=Value456*(", "key123!@")).should_be_null();
//        value_of(baidu.url.getQueryValue("http://baidu.com?k=v", "v")).should_be_null();
//        value_of(baidu.url.getQueryValue("http://baidu.com?中文abc=英文123", "中文bc")).should_be_null();
//        value_of(baidu.url.getQueryValue("http://baidu.com?ＡＢｚ１２％\t\n=ｄｋＦＺ２３\b\a", "Ａｚ１２％\t\n")).should_be_null();
//    },
//    
//    "URL中不止一个参数时，指定存在的key":function(){		
//        value_of(baidu.url.getQueryValue("http://baidu.com?z=s&k=v", "k")).should_be("v");
//        value_of(baidu.url.getQueryValue("http://baidu.com?百度baidu=中国bai&中文abc=英文123", "中文abc")).should_be("英文123");
//        value_of(baidu.url.getQueryValue("http://baidu.com?ｌＪ２３\t=ｉｕ９８\n&ＡＢｚ１２％\t\n=ｄｋＦＺ２３\b\a", "ＡＢｚ１２％\t\n")).
//            should_be("ｄｋＦＺ２３\b\a");
//        value_of(baidu.url.getQueryValue("http://baidu.com?Hello90(=NiHao89)&Key123!@=Value456*(", "Key123!@")).should_be("Value456*(");
//    },
//
//    "URL中不止一个参数时，指定不存在的key":function(){
//        value_of(baidu.url.getQueryValue("http://baidu.com?Hello90(=NiHao89)&Key123!@=Value456*(", "ke123!@")).should_be_null();
//        value_of(baidu.url.getQueryValue("http://baidu.com?z=s&k=v", "v")).should_be_null();
//        value_of(baidu.url.getQueryValue("http://baidu.com?百度baidu=中国bai&中文abc=英文123", "中文bc")).should_be_null();
//        value_of(baidu.url.getQueryValue("http://baidu.com?ｌＪ２３\t=ｉｕ９８\n&ＡＢｚ１２％\t\n=ｄｋＦＺ２３\b\a", "Ａｚ１２％\t\n")).should_be_null();
//    },
//    
//    "URL中不止一个参数时，key是值为空的参数":function(){
//        value_of(baidu.url.getQueryValue("http://baidu.com?Hello90(=&Key123!@=Value456*(", "Hello90(")).should_be("");
//    },
//
//    "URL中不止一个参数时，key为带转义字符的参数":function(){
//        value_of(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%25")).
//            should_be("%20");
//        value_of(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%26")).
//            should_be("%3D");
//        value_of(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%2B")).
//            should_be("%23");
//        value_of(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%2F")).
//            should_be("%2F");
//        value_of(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%23")).
//            should_be("%2B");
//        value_of(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%3D")).
//            should_be("%26");
//        value_of(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25", "%20")).
//            should_be("%25");
//        value_of(baidu.url.getQueryValue("http://baidu.com?%25=%20&%26=%3D&%2B=%23&%2F=%2F&%23=%2B&%3D=%26&%20=%25" + 
//            "&%25%26%2B%2F%23%3D%20=%20%3D%23%2F%2B%26%25", "%25%26%2B%2F%23%3D%20")).
//            should_be("%20%3D%23%2F%2B%26%25");
//    },
//
//    "URL中存在相同的参数，指定key为该参数，取第一次出现的值":function(){
//        //key完全相同
//        value_of(baidu.url.getQueryValue("http://baidu.com?heLlo=nihao&heLlo=nibuhao&temp=temp2", "heLlo")).should_be("nihao");
//        //key仅半角的大小写的区别
//        value_of(baidu.url.getQueryValue("http://baidu.com?Hello=nihao&hello=nibuhao&temp=temp2", "hello")).should_be("nibuhao");
//        //key仅全角的大小写的区别
//        value_of(baidu.url.getQueryValue("http://baidu.com?Ｈello=nihao&ｈello=nibuhao&temp=temp2", "ｈello")).should_be("nibuhao");
//    }
//});
