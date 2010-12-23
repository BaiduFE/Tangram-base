module("baidu.json.decode测试");

test("decode函数输入合法的Json字符串", function(){
	var obj = "{\"a\":1,\"b\":\"text\",\"c\":true,\"d\":3.12345,\"e\":false,\"f\":null,\"g\":[1,2,3],\"h\":{\"aa\":1,\"bb\":2}}";
	var testobj = baidu.json.parse(obj);
	
	equals(testobj.a, 1);
	equals(testobj.b, "text");
	equals(testobj.c, true);
	equals(testobj.d, 3.12345);
	equals(testobj.e, false);
	equals(testobj.f, null);
	//equals(testobj.g, [1,2,3]);
	equals(typeof testobj.g, "object");
	equals(testobj.g.length, 3);
	equals(testobj.g[0], 1);
	equals(testobj.g[1], 2);
	equals(testobj.g[2], 3);
	//equals(testobj.h, {aa:1,bb:2});
	equals(testobj.h.aa, 1);
	equals(testobj.h.bb, 2);
	
	var array = "[{\"location1\":\"beijing\", \"company\":\"baidu\", \"money\":10.012, \"people\":10},{\"location1\":\"shanghai\", \"company\":\"baidu\", \"money\":10.51, \"people\":2}]";//输入为Json数组
	var jsarr = baidu.json.parse(array);
	equals(jsarr[0].location1, "beijing");
	equals(jsarr[0].company, "baidu");
	equals(jsarr[0].money, 10.012);
	equals(jsarr[0].people, 10);
	equals(jsarr[1].location1, "shanghai");
	equals(jsarr[1].company, "baidu");
	equals(jsarr[1].money, 10.51);
	equals(jsarr[1].people, 2);
}); // 1

test("输入为number", function(){
	var n = "3.14"; //输入为number
	var s = baidu.json.decode(n);
	equals(s, 3.14);
}); // 2

test("输入为string", function(){
	var n ="\"baidu Online\""; //输入为string
	var s = baidu.json.decode(n);
	equals(s, "baidu Online");
}); // 3

test("输入为null", function(){
	var n = "null"; //输入为null
	var s = baidu.json.decode(n);
	equals(s, null);
}); // 4

//test("输入为undefined", function(){
//	var n = "undefined";
//	var s = baidu.json.decode(n);
//	equals(s, null);
//}); // 5

test("输入为boolean", function(){
	var n = "true";
	var s = baidu.json.decode(n);
	equals(s, true);
	
	n = "false";
	equals(baidu.json.decode(n), false);
	
}); // 6


//describe('baidu.json.decode测试',{
//    "decode函数输入合法的Json字符串":function (){
//		var obj = "{\"a\":1,\"b\":\"test\",\"c\":true,\"d\":3.12345,\"e\":false,\"f\":null,\"g\":[1,2,3],\"h\":{\"aa\":1,\"bb\":2}}";  //输入为Json对象
//		var testobj = baidu.json.parse(obj);
//		value_of(testobj.a).should_be(1);
//		value_of(testobj.b).should_be("test");
//		value_of(testobj.c).should_be_true();
//		value_of(testobj.d).should_be(3.12345);
//		value_of(testobj.e).should_be_false();
//		value_of(testobj.f).should_be_null();
//		value_of(testobj.g).should_be([1,2,3]);
//		value_of(testobj.h).should_be({aa:1,bb:2});
//		
//		var array = "[{\"location1\":\"beijing\",\"company\":\"baidu\",\"money\":10.012,\"people\":10},{\"location1\":\"shanghai\",\"company\":\"baidu\",\"money\":10.51,\"people\":2}]";//输入为Json数组
//		var jsarr = baidu.json.parse(array);
//		value_of(jsarr[0].location1).should_be("beijing");
//		value_of(jsarr[0].company).should_be("baidu");
//		value_of(jsarr[0].money).should_be(10.012);
//		value_of(jsarr[0].people).should_be(10);
//		value_of(jsarr[1].location1).should_be("shanghai");
//		value_of(jsarr[1].company).should_be("baidu");
//		value_of(jsarr[1].money).should_be(10.51);
//		value_of(jsarr[1].people).should_be(2);
//	},
//	"输入为number":function (){		
//		var n = "3.14";  //输入为number
//		var s = baidu.json.decode(n);
//		value_of(s).should_be(3.14);
//	},
//	"输入为string":function (){
//		var n = "\"baidu Online\"";  //输入为string
//		var s = baidu.json.decode(n);
//		value_of(s).should_be("baidu Online");
//	},
//	"输入为null":function (){
//		var n = "null";  //输入为null
//		var s = baidu.json.decode(n);
//		value_of(s).should_be_null();
//	},
//	"输入为undefined":function (){
//		var n = "undefined";  //输入为undefined
//		var s = baidu.json.decode(n);
//		value_of(s).should_be_null();
//	},
//	"输入为boolean":function (){
//		var n = "true";  //输入为boolean
//		var s = baidu.json.decode(n);
//		value_of(s).should_be_true();
//				
//		n = "false";  //输入为boolean
//		value_of(baidu.json.decode(n)).should_be_false();
//	}
//});

