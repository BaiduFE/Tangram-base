module("baidu.string.filterFormat");


baidu.string.filterFormat.encodeUrl = function(url){
	return window.encodeURIComponent(url);
};
baidu.string.filterFormat.first5 = function(str){
	return str.substr(0,5);
};

test("only source",function(){
	var source = "test";
	var sRet;
	sRet = baidu.string.filterFormat(source);
	equals(sRet, "test");
});

test("默认分隔符Json数据格式化字符串", function(){
	var sPattern = "id=#{id}?+&action=#{action}&||type=#{type}.*result=#{result}";
	var sRet;
	sRet = baidu.string.filterFormat(sPattern, {id:1, action:"post", type:"node", result:5.1});
	equals(sRet, "id=1?+&action=post&||type=node.*result=5.1");
	
	var sAction = new String("\x25\u31f2");
	sRet = baidu.string.filterFormat(sPattern, {id:0, action:sAction, type: "&nbsp;$1$2", result:"\\\%@'64K*[^]"});
	equals(sRet, "id=0?+&action=\x25\u31f2&||type=&nbsp;$1$2.*result=\\\%@'64K*[^]");
	
	//json数据的json[key]为function
	//快捷方式
	sRet = baidu.string.filterFormat(sPattern, {id:0, action:function(){return arguments[0];}, type:"null", result:0});
	equals(sRet, "id=0?+&action=action&||type=null.*result=0");
	
	sPattern = "#a: 中文#{b}${0}$1c#{}";
	sRet = baidu.string.filterFormat(sPattern, {b:"hello字符"});
	equals(sRet, "#a: 中文hello字符${0}$1c#{}");
}); // 1

test("默认分隔符多个参数格式化字符串", function(){
	var sPattern = "a:#{0}|b:#{1}|c:#{2}";
	var sRet;
	
	sRet = baidu.string.filterFormat(sPattern, 12, "B$1", "code");
	equals(sRet, "a:12|b:B$1|c:code");
	
	//第一个替换参数是String，typeof是object
	var sStr = new String("showbug");
	equals(typeof sStr, "object");
	
	sRet = baidu.string.filterFormat(sPattern, "A", sStr, "C");
	equals(sRet, "a:A|b:showbug|c:C");
	
	sRet = baidu.string.filterFormat(sPattern, sStr, "B", "C");
	equals(sRet, "a:showbug|b:B|c:C");
	
	sPattern = "#{0}|#{2}|#{4}";
	sRet = baidu.string.filterFormat(sPattern, "a", "b", "c", "d", "e");
	equals(sRet, "a|c|e");
}); // 2

test("默认数组数据格式化字符串", function(){
	var sPattern = "a:#{0}|b:#{1}|c:#{2}";
	var sRet;
	
	sRet = baidu.string.filterFormat(sPattern, [12, "B$1", "code"]);
	equals(sRet, "a:12|b:B$1|c:code");
	
	//第一个替换参数是String，typeof是object
	var sStr = new String("showbug");
	equals(typeof sStr, "object");
	
	sRet = baidu.string.filterFormat(sPattern, ["A", sStr, "C"]);
	equals(sRet, "a:A|b:showbug|c:C");
	
	sRet = baidu.string.filterFormat(sPattern, [sStr, "B", "C"]);
	equals(sRet, "a:showbug|b:B|c:C");
	
	sPattern = "#{0}|#{2}|#{4}";
	sRet = baidu.string.filterFormat(sPattern, ["a", "b", "c", "d", "e"]);
	equals(sRet, "a|c|e");
}); // 3

test("特殊case", function(){
	var sPattern, sRet;
	
	//第一个0 
	sPattern ="#{0},#{1}";
	sRet = baidu.string.filterFormat(sPattern, 0, "abc");
	equals(sRet, "0,abc");
	
	//第一个""
	sPattern = "#{0},#{1}";
	sRet = baidu.string.filterFormat(sPattern, "", "abc");
	equals(sRet, ",abc");
	
	//function
	sPattern = "#{0}";
	sRet = baidu.string.filterFormat(sPattern, function(){return 'abc';});
	equals(sRet, "abc");	
}); // 4

test('filter', function(){

	// 自定义功能
	var sPattern = '<input value="#{0|encodeUrl}">', sRet = baidu.string
			.filterFormat(sPattern, "http://www.baidu.com");
	equals(sRet, '<input value="http%3A%2F%2Fwww.baidu.com">');
	

	// 链式过滤
	var sPattern = '<input value="#{url|encodeUrl|first5}">', sRet = baidu.string
			.filterFormat(sPattern, {
				url : "http://www.baidu.com"
			});
	equals(sRet, '<input value="http%">');
});

/*过滤功能移入独立case中*/

//test("过滤功能case", function(){
//	//escapeString
//	
//	var sPattern = '<input value="#{0|escapeString}#{1|e}#{2|e}#{3|e}#{4|e}#{5|e}">',
//		sRet = baidu.string.filterFormat(sPattern,'<','>','/','\\','"',"'");
//	equals(sRet, '<input value="&#60;&#62;&#47;&#92;&#34;&#39;">');
//	
//	//toInt
//	var sPattern = '#{0|toInt}|#{1|i}|#{2|i}',
//		sRet = baidu.string.filterFormat(sPattern, '1px', '-2', 'NaN');
//	equals(sRet, '1|-2|0');
//	
//	//escapeJs
//	var sPattern = '#{0|escapeJs}|#{1|js}|#{2|js}',
//		sRet = baidu.string.filterFormat(sPattern, '1a', '中文', 1);
//	equals(sRet, '\\x31\\x61|中文|1');
//	
//	//自定义功能
//	var sPattern = '<input value="#{0|encodeUrl}">',
//		sRet = baidu.string.filterFormat(sPattern, "http://www.baidu.com");
//	equals(sRet, '<input value="http%3A%2F%2Fwww.baidu.com">');
//	
//	//链式过滤
//	var sPattern = '<input value="#{url|encodeUrl|first5}">',
//		sRet = baidu.string.filterFormat(sPattern, {url:"http://www.baidu.com"});
//	equals(sRet, '<input value="http%">');
//	
//	//传入空参数
//	try{
//		var sPattern = '<input value="#{0|escapeString}#{1|e}">',
//			sRet = baidu.string.filterFormat(sPattern, '<');
//	}catch(e){
//		equals(sRet, "参数个数传入错误");
//	}	
//}); // 5

test("异常case", function(){
	var sPattern = "a:#{a},b=#{b}";
	var sRet;	
	sRet = baidu.string.filterFormat(sPattern, {a:"A"});	
	equals(sRet, "a:A,b=");
	
	//2种方式混杂
	sPattern = "a=#{a},b=#{0},c=#{c},d=#{1}";
	sRet = baidu.string.filterFormat(sPattern, {a:"A",c:"C",0:"B",1:"D"});
	equals(sRet, "a=A,b=B,c=C,d=D");
	
	//顺序颠倒
	sPattern = "#{1}|#{0}";
	sRet = baidu.string.filterFormat(sPattern, "A", "B"); 
	equals(sRet, "B|A"); // 默认 {0}|{1} 顺序
	
	//负序号，超边界
	sPattern = "#{-1}|#{0}|#{2}";
	sRet = baidu.string.filterFormat(sPattern, "A", "B");
	equals(sRet, "|A|");
	
	//#{}括号内包含特殊字符{
	sPattern = "#{ab{cd}";
	sRet = baidu.string.filterFormat(sPattern, {"ab{cd":"OK"}); // ab{cd is var
	equals(sRet, "OK");
	
	//特殊对象 RegExp
	sPattern = "#{0|e}";
	sRet = baidu.string.filterFormat(sPattern, /a/);
	equals(sRet, "/a/");
	
	//特殊对象 null
	sPattern = "#{0|int}";
	sRet = baidu.string.filterFormat(sPattern, null); // null is ""
	equals(sRet, "");
	
	//特殊对象 undefined
	sPattern = "#{0|js}";
	sRet = baidu.string.filterFormat(sPattern, undefined); // undefined is ""
	equals(sRet, "");
	
	//特殊对象 undefined
	sPattern = "#{0|e|int|js}";
	sRet = baidu.string.filterFormat(sPattern, 0);
	equals(sRet, "0");
}); // 6

