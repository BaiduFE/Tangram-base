module("baidu.url.jsonToQuery");

test("Json没有属性对", function(){
	equals(baidu.url.jsonToQuery({}), "", '');
});

test("Json只有一个属性对", function(){
	//属性和值中包括字母、数字，符号字符
	equals(baidu.url.jsonToQuery({"zaq147!@":"xsw258$^"}), "zaq147!@=xsw258$^", '');
	//属性和值只有一个字符
	equals(baidu.url.jsonToQuery({"a":"q"}), "a=q", '');
	equals(baidu.url.jsonToQuery({"1":"2"}), "1=2", '');
	equals(baidu.url.jsonToQuery({"@":"$"}), "@=$", '');
	equals(baidu.url.jsonToQuery({"%":"%"}), "%=%25", '');
	equals(baidu.url.jsonToQuery({"&":"&"}), "&=%26", '');
	equals(baidu.url.jsonToQuery({"+":"+"}), "+=%2B", '');
	equals(baidu.url.jsonToQuery({"/":"/"}), "/=%2F", '');
	equals(baidu.url.jsonToQuery({"#":"#"}), "#=%23", '');
	equals(baidu.url.jsonToQuery({"=":"="}), "==%3D", '');
	equals(baidu.url.jsonToQuery({" ":" "}), " =%20", '');
	
	//属性和值包含中文
	equals(baidu.url.jsonToQuery({"abc中文":"你好baidu"}), "abc中文=你好baidu", '');
	//属性和值包括全角字符、转义字符等特殊字符
	equals(baidu.url.jsonToQuery({"ＡａｂＢ！＠＃＄％＾＆＊（）＿＋＝／　１２３４\t\a":"１９０ａｌｄｏｅ；ｓ）（＊＆＾％＄＃＠\n\f"}), 'ＡａｂＢ！＠＃＄％＾＆＊（）＿＋＝／　１２３４\t\a=１９０ａｌｄｏｅ；ｓ）（＊＆＾％＄＃＠\n\f', '');
});

test("Json不止一个属性对", function(){
	equals(baidu.url.jsonToQuery({"zaq147!@":"xsw258$^", "a":"q", "@":"$", "+":"+", "abc中文":"你好baidu","ＡａｂＢ！＠＃＄％＾＆＊（）＿＋＝／　１２３４\t\a":"１９０ａｌｄｏｅ；ｓ）（＊＆＾％＄＃＠\n\f"}), "zaq147!@=xsw258$^&a=q&@=$&+=%2B&abc中文=你好baidu&ＡａｂＢ！＠＃＄％＾＆＊（）＿＋＝／　１２３４\t\a=１９０ａｌｄｏｅ；ｓ）（＊＆＾％＄＃＠\n\f", '');
	//key名字可能与前面的&符号组成实体字符，如&copy=1,这是不正常的用法
	equals(baidu.url.jsonToQuery({"copy":"1", "copy3":"2", "lt;":"\t"}), "copy=1&copy3=2&lt;=\t", '');
});

test("Json存在相同的属性对", function(){
	equals(baidu.url.jsonToQuery({"abc":"123abc", "abc":"27ad", "aaa":"aaa", "adc":"+aa", "abc中文":"你好baidu","ccc":"dds", "adc":"degc", "abc中文":"你好aaaddbaidu", "adc":"34fdgf"}), "abc=27ad&aaa=aaa&adc=34fdgf&abc中文=你好aaaddbaidu&ccc=dds", '');
});

test("Json的属性值中存在&、+等字符", function(){
	equals(baidu.url.jsonToQuery({"abc%&":"123abc =", "aaa+/":"aaa#/", "adc#=":"+&aa", "abc中文 ":"你好%baidu", "%25":"&26"}), "abc%&=123abc%20%3D&aaa+/=aaa%23%2F&adc#==%2B%26aa&abc中文 =你好%25baidu&%25=%2626", '');
});

test("replacer方法有效",  function(){
	equals(baidu.url.jsonToQuery({"acdc":"123abc", "abc":"27ad", "abc中文":"你好baidu"}, function(value, key){var value=value+key; return value;}), "acdc=123abcacdc&abc=27adabc&abc中文=你好baiduabc中文", '');
});

test("嵌套的object",  function(){
	var array1 = [1,2,3],
	    array2 = [4,5,6],
	    array3 = [7,8,9];
	var option = {
			"1":array1, 
			"2":array2, 
			"3":array3
	};
	equals(baidu.url.jsonToQuery(option), "1=3&1=2&1=1&2=6&2=5&2=4&3=9&3=8&3=7", '');
});






//describe("baidu.url.jsonToQuery测试",{
//    "Json没有属性对":function(){
//        value_of(baidu.url.jsonToQuery({})).should_be("");
//    },
//    "Json只有一个属性对":function(){
//        //属性和值中包括字母、数字，符号字符
//        value_of(baidu.url.jsonToQuery({"zaq147!@":"xsw258$^"})).should_be("zaq147!@=xsw258$^");
//        //属性和值只有一个字符
//        value_of(baidu.url.jsonToQuery({"a":"q"})).should_be("a=q");
//        value_of(baidu.url.jsonToQuery({"1":"2"})).should_be("1=2");
//        value_of(baidu.url.jsonToQuery({"@":"$"})).should_be("@=$");
//        value_of(baidu.url.jsonToQuery({"%":"%"})).should_be("%=%25");
//        value_of(baidu.url.jsonToQuery({"&":"&"})).should_be("&=%26");
//        value_of(baidu.url.jsonToQuery({"+":"+"})).should_be("+=%2B");
//        value_of(baidu.url.jsonToQuery({"/":"/"})).should_be("/=%2F");
//        value_of(baidu.url.jsonToQuery({"#":"#"})).should_be("#=%23");
//        value_of(baidu.url.jsonToQuery({"=":"="})).should_be("==%3D");
//        value_of(baidu.url.jsonToQuery({" ":" "})).should_be(" =%20");		
//        //属性和值包含中文
//        value_of(baidu.url.jsonToQuery({"abc中文":"你好baidu"})).should_be("abc中文=你好baidu");
//        //属性和值包括全角字符、转义字符等特殊字符
//        value_of(baidu.url.jsonToQuery({"ＡａｂＢ！＠＃＄％＾＆＊（）＿＋＝／　１２３４\t\a":"１９０ａｌｄｏｅ；ｓ）（＊＆＾％＄＃＠\n\f"})).
//            should_be("ＡａｂＢ！＠＃＄％＾＆＊（）＿＋＝／　１２３４\t\a=１９０ａｌｄｏｅ；ｓ）（＊＆＾％＄＃＠\n\f");
//    },
//    "Json不止一个属性对":function(){
//        value_of(baidu.url.jsonToQuery({"zaq147!@":"xsw258$^", "a":"q", "@":"$", "+":"+", "abc中文":"你好baidu",
//            "ＡａｂＢ！＠＃＄％＾＆＊（）＿＋＝／　１２３４\t\a":"１９０ａｌｄｏｅ；ｓ）（＊＆＾％＄＃＠\n\f"})).
//            should_be("zaq147!@=xsw258$^&a=q&@=$&+=%2B&abc中文=你好baidu"+
//            "&ＡａｂＢ！＠＃＄％＾＆＊（）＿＋＝／　１２３４\t\a=１９０ａｌｄｏｅ；ｓ）（＊＆＾％＄＃＠\n\f");
//        //key名字可能与前面的&符号组成实体字符，如&copy=1,这是不正常的用法	
//        value_of(baidu.url.jsonToQuery({"copy":"1", "copy3":"2", "lt;":"\t"})).should_be("copy=1&copy3=2&lt;=\t");
//    },
//    "Json存在相同的属性对":function(){
//        value_of(baidu.url.jsonToQuery({"abc":"123abc", "abc":"27ad", "aaa":"aaa", "adc":"+aa", "abc中文":"你好baidu",
//            "ccc":"dds", "adc":"degc", "abc中文":"你好aaaddbaidu", "adc":"34fdgf"})).
//            should_be("abc=27ad&aaa=aaa&adc=34fdgf&abc中文=你好aaaddbaidu&ccc=dds");
//    },
//    "Json的属性值中存在&、+等字符":function(){
//        value_of(baidu.url.jsonToQuery({"abc%&":"123abc =", "aaa+/":"aaa#/", "adc#=":"+&aa", "abc中文 ":"你好%baidu", "%25":"&26"})).
//            should_be("abc%&=123abc%20%3D&aaa+/=aaa%23%2F&adc#==%2B%26aa&abc中文 =你好%25baidu&%25=%2626");
//    },
//    "replacer方法有效":function(){
//        value_of(baidu.url.jsonToQuery({"acdc":"123abc", "abc":"27ad", "abc中文":"你好baidu"}, function(value, key){
//			value = value+key;
//			return value;
//		})).should_be("acdc=123abcacdc&abc=27adabc&abc中文=你好baiduabc中文");
//    }
//});