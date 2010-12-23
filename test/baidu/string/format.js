module("baidu.string.format测试");

test("默认分隔符Json数据格式化字符串", function(){
	var sPattern = "id=#{id}?+&action=#{action}&||type=#{type}.*result=#{result}";
	
	var sRet;
	sRet = baidu.string.format(sPattern, {id:1, action:"post", type:"node", result:5.1});
	equals(sRet, "id=1?+&action=post&||type=node.*result=5.1");
	
	var sAction = new String("\x25\u31f2");
		sRet = baidu.string.format(sPattern, {id:0, action:sAction, type:"&nsbp;$1$2", result:"\\\%@'64K*[^]"});
	equals(sRet, "id=0?+&action=\x25\u31f2&||type=&nsbp;$1$2.*result=\\\%@'64K*[^]");
	
	//json数据的json[key]为function
	//快捷方式
	sRet = baidu.format(sPattern, {id:0, action:function(){return arguments[0];}, type:"null", result:0});
	equals(sRet, "id=0?+&action=action&||type=null.*result=0");
	
	sPattern = "#a: 中文#{b}${0}$1c#{}}";
	sRet = baidu.string.format(sPattern, {b:"hello字符"});
	equals(sRet, "#a: 中文hello字符${0}$1c");	
}); // 1

test("默认分隔符多个参数格式化字符串", function(){
	var sPattern = "a:#{0}|b:#{1}|c:#{2}";
	var sRet;
	
	sRet = baidu.string.format(sPattern, 12, "B$1", "code");
	equals(sRet, "a:12|b:B$1|c:code");
	
	//第一个替换参数是String，typeof是object
	var sStr = new String("showbug");
	equals(typeof sStr, "object");
	
	sRet = baidu.string.format(sPattern, "A", sStr, "C");
	equals(sRet, "a:A|b:showbug|c:C");
	
	sRet = baidu.string.format(sPattern, sStr, "B", "C");
	equals(sRet, "a:showbug|b:B|c:C");
	
	sPattern = "#{0}|#{2}|#{4}";
	sRet = baidu.string.format(sPattern, "a", "b", "c", "d", "e");
	equals(sRet, "a|c|e");
}); // 2

test("默认数组数据格式化字符串", function(){
	var sPattern = "a:#{0}|b:#{1}|c:#{2}";
	var sRet;
	
	sRet = baidu.string.format(sPattern, [12, "B$1", "code"]);
	equals(sRet, "a:12|b:B$1|c:code");
	
	//第一个替换参数是String，typeof是object
	var sStr = new String("showbug");
	equals(typeof sStr, "object");
	
	sRet = baidu.string.format(sPattern, ["A", sStr, "C"]);
	equals(sRet, "a:A|b:showbug|c:C");
	
	sRet = baidu.string.format(sPattern, [sStr, "B", "C"]);
	equals(sRet, "a:showbug|b:B|c:C");
	
	sPattern = "#{0}|#{2}|#{4}";
	sRet = baidu.string.format(sPattern, ["a", "b", "c", "d", "e"]);
	equals(sRet, "a|c|e");
	
}); // 3

test("特殊case", function(){
	var sPattern, sRet;
	
	//第一个0
	sPattern = "#{0},#{1}";
	sRet = baidu.string.format(sPattern, 0, "abc");
	equals(sRet, "0,abc");
	
	//第一个""
	sPattern = "#{0},#{1}";
	sRet = baidu.string.format(sPattern, "", "abc");
	equals(sRet, ",abc");
	
	//funciton
	sPattern = "#{0}";
	sRet = baidu.string.format(sPattern, function(){return 'abc';});
	equals(sRet, "abc");
});  // 4

test("异常case1", function(){
	var sPattern = "a:#{a},b=#{c}";
	var sRet;
	
	sRet = baidu.string.format(sPattern, {a:"A"});
	equals(sRet, "a:A,b=");
});  // 5

test("异常case2", function(){
	//2种方式混杂
	var sPattern = "a=#{a},b=#{0},c=#{c},d=#{1}";
	var sRet = baidu.string.format(sPattern, {a:"A",c:"C",0:"B",1:"D"});
	equals(sRet, "a=A,b=B,c=C,d=D");
});  // 6

test("异常case3", function(){
	//顺序颠倒
	sPattern = "#{1}|#{0}";
	sRet = baidu.string.format(sPattern, "A", "B");
	equals(sRet, "B|A");
});  // 7

test("异常case4", function(){
	//负序号
	sPattern = "#{-1}|#{0}|#{2}";
	sRet = baidu.string.format(sPattern, "A", "B");
	equals(sRet, "|A|");
});  // 8

test("异常case5", function(){
	//#{}括号内包含特殊字符{
	sPattern = "#{ab{cd}";
	sRet = baidu.string.format(sPattern, {"ab{cd":"OK"});
	equals(sRet, "OK");
});  // 9

test("异常case6", function(){
	//特殊对象 RegExp
	sPattern = "#{0}";
	sRet = baidu.string.format(sPattern, /a/);
	equals(sRet, "/a/");
});  // 10

test("异常case7", function(){
	sPattern = "#{0}";
	sRet = baidu.string.format(sPattern, null);
	equals(sRet, "null");
});  // 11

//test("异常case8", function(){
//	sPattern = "#{0}";
//	sRet = baidu.string.format(sPattern, void(0));
//	equals(sRet, "0");
//});  // 12

test("异常case9", function(){
	sPattern = "#{0}#{1}";
	sRet = baidu.string.format(sPattern, [,"a"]);
	equals(sRet, "a");
});  // 13

test("异常case10", function(){
	sPattern = "#{0}#{1}";
	sRet = baidu.string.format(sPattern, [,false]);
	equals(sRet, "false");
});  // 14

test("异常case11", function(){
	sPattern = "#{0} #{1} #{2} #{3} #{4} #{5}";
	sRet = baidu.string.format(sPattern, [,false, 100, function(){return 123}, [1,2], {a:"a"}]);
	equals(sRet, " false 100 123 1,2 [object Object]");
});  // 15



//describe('baidu.string.format测试', {
//	'默认分隔符Json数据格式化字符串': function() {
//		var sPattern = "id=#{id}?+&action=#{action}&||type=#{type}.*result=#{result}";
//		var sRet;
//		sRet = baidu.string.format(sPattern, {id:1, action:"post", type:"node",result:5.1});
//		value_of(sRet).should_be("id=1?+&action=post&||type=node.*result=5.1");
//
//		var sAction = new String("\x25\u31f2");
//		sRet = baidu.string.format(sPattern, {id:0, action:sAction, type:"&nbsp;$1$2",result:"\\\%@'64K*[^]"});
//		value_of(sRet).should_be("id=0?+&action=\x25\u31f2&||type=&nbsp;$1$2.*result=\\\%@'64K*[^]");
//
//		//json数据的json[key]为function
//		//快捷方式
//		sRet = baidu.format(sPattern, 
//				{id:0, action:function(){return arguments[0];}, type:"null",result:0});
//		value_of(sRet).should_be("id=0?+&action=action&||type=null.*result=0");
//		
//		sPattern = "#a：中文#{b}${0}$1c#{}}";
//		sRet = baidu.string.format(sPattern, {b:"hello字符"});
//		value_of(sRet).should_be("#a：中文hello字符${0}$1c");
//
//	},
//	'默认分隔符多个参数格式化字符串': function() {
//		var sPattern = "a:#{0}|b:#{1}|c:#{2}";
//		var sRet;
//		
//		sRet = baidu.string.format(sPattern, 12, "B$1", "code");
//		value_of(sRet).should_be("a:12|b:B$1|c:code");
//
//		//第一个替换参数是String，typeof是object
//		var sStr = new String("showbug");
//		value_of(typeof sStr).should_be("object");
//		
//		sRet = baidu.string.format(sPattern, "A", sStr, "C");
//		value_of(sRet).should_be("a:A|b:showbug|c:C");
//		
//		sRet = baidu.string.format(sPattern, sStr, "B", "C");
//		value_of(sRet).should_be("a:showbug|b:B|c:C");
//
//		sPattern = "#{0}|#{2}|#{4}";
//		sRet = baidu.string.format(sPattern, "a", "b", "c", "d", "e");
//		value_of(sRet).should_be("a|c|e");
//	},
//	'默认数组数据格式化字符串': function() {
//		var sPattern = "a:#{0}|b:#{1}|c:#{2}";
//		var sRet;
//		
//		sRet = baidu.string.format(sPattern, [12, "B$1", "code"]);
//		value_of(sRet).should_be("a:12|b:B$1|c:code");
//
//		//第一个替换参数是String，typeof是object
//		var sStr = new String("showbug");
//		value_of(typeof sStr).should_be("object");
//		
//		sRet = baidu.string.format(sPattern, ["A", sStr, "C"]);
//		value_of(sRet).should_be("a:A|b:showbug|c:C");
//		
//		sRet = baidu.string.format(sPattern, [sStr, "B", "C"]);
//		value_of(sRet).should_be("a:showbug|b:B|c:C");
//
//		sPattern = "#{0}|#{2}|#{4}";
//		sRet = baidu.string.format(sPattern, ["a", "b", "c", "d", "e"]);
//		value_of(sRet).should_be("a|c|e");
//	},
//	'特殊case': function() {//by berg
//		var sPattern, sRet;
//
//		//第一个0 
//		sPattern = "#{0},#{1}";
//		sRet = baidu.string.format(sPattern, 0, "abc");
//		value_of(sRet).should_be("0,abc");
//
//		//第一个""
//		sPattern = "#{0},#{1}";
//		sRet = baidu.string.format(sPattern, "", "abc");
//		value_of(sRet).should_be(",abc");
//		
//		//function
//		sPattern = "#{0}";
//		sRet = baidu.string.format(sPattern, function(){return 'abc';});
//		value_of(sRet).should_be("abc");
//    },
//
//	'异常case1': function() {
//		var sPattern = "a:#{a},b=#{b}";
//		var sRet;
//		sRet = baidu.string.format(sPattern, {a:"A"});
//		value_of(sRet).should_be("a:A,b=");
//    },
//    
//    '异常case2': function() {
//		//2种方式混杂
//		sPattern = "a=#{a},b=#{0},c=#{c},d=#{1}";
//		sRet = baidu.string.format(sPattern, {a:"A",c:"C",0:"B",1:"D"});
//		value_of(sRet).should_be("a=A,b=B,c=C,d=D");
//    },
//    '异常case3': function() {
//		//顺序颠倒
//		sPattern = "#{1}|#{0}";
//		sRet = baidu.string.format(sPattern, "A", "B");
//		value_of(sRet).should_be("B|A");
//    },
//    '异常case4': function() {
//		//负序号
//		sPattern = "#{-1}|#{0}|#{2}";
//		sRet = baidu.string.format(sPattern, "A", "B");
//		//TODO CHANGE_LOG from "#{-1}|A|#{2}" to "|A|"
//		value_of(sRet).should_be("|A|");
//    },
//    '异常case5': function() {
//		//#{}括号内包含特殊字符{
//		sPattern = "#{ab{cd}";
//		sRet = baidu.string.format(sPattern, {"ab{cd":"OK"});
//		value_of(sRet).should_be("OK");
//    },
//    '异常case6': function() {
//		//特殊对象 RegExp
//		sPattern = "#{0}";
//		sRet = baidu.string.format(sPattern, /a/);
//		value_of(sRet).should_be("/a/");
//    },
//    /******不考虑对于null和undefine*******/
////    '异常case7': function() {
////		//特殊对象 null
////		sPattern = "#{0}";
////		sRet = baidu.string.format(sPattern, null);
////		value_of(sRet).should_be("null");
////    },
////    '异常case8': function() {
////		sPattern = "#{0}";
////		sRet = baidu.string.format(sPattern, void(0));
////		value_of(sRet).should_be("");		
////	},
//    '异常case9': function() {
//		sPattern = "#{0}#{1}";
//		sRet = baidu.string.format(sPattern, [,"a"]);
//		value_of(sRet).should_be("a");		
//	},
//    '异常case9': function() {
//		sPattern = "#{0}#{1}";
//		sRet = baidu.string.format(sPattern, [,false]);
//		value_of(sRet).should_be("false");		
//	},
//    '异常case9': function() {
//		sPattern = "#{0} #{1} #{2} #{3} #{4} #{5}";
//		sRet = baidu.string.format(sPattern, [,false,100,function(){return 123},[1,2],{a:"a"}]);
//		value_of(sRet).should_be(" false 100 123 1,2 [object Object]");		
//	}
//});
