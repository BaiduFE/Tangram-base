module("baidu.json.encode测试");

test("encode函数输入符合Json要求的对象", function(){
	var obj = {a:1,b:'test',c:true,d:3.12345,e:false,f:null,g:[1,2,3],h:{aa:1,bb:2}}; //输入为Json对象
	var s = baidu.json.encode(obj);
	equals(s, "{\"a\":1,\"b\":\"test\",\"c\":true,\"d\":3.12345,\"e\":false,\"f\":null,\"g\":[1,2,3],\"h\":{\"aa\":1,\"bb\":2}}");

	var arraytest = [{location:'beijing', company:'baidu', money:10.012, people:10},{location:'shanghai', company:'baidu', money:10.51, people:2}]; //输入为Json数组
	s = baidu.json.encode(arraytest);
	equals(s, "[{\"location\":\"beijing\",\"company\":\"baidu\",\"money\":10.012,\"people\":10},{\"location\":\"shanghai\",\"company\":\"baidu\",\"money\":10.51,\"people\":2}]");	
}); // 1

test("输入为number", function(){
	var n = 3.14; //输入为number
	var s = baidu.json.encode(n);
	equals(s, 3.14);
}); // 2

test("输入为string", function(){
	var n = 'baidu Online'; //输入为string
	var s = baidu.json.encode(n);
	equals(s, "\"baidu Online\"");
}); // 3

test("输入为null", function(){
	var n = null; //输入为null
	var s = baidu.json.encode(n);
	equals(s, "null");
}); // 4

test("输入为undefined", function(){
	var n = undefined; //输入为undefined
	var s = baidu.json.encode(n);
	equals(s, "undefined");
}); // 5

test("输入为boolean", function(){
	var n = true; // 输入为boolean
	var s = baidu.json.encode(n);
	equals(s, "true");
	
	n = false;
	s = baidu.json.encode(n);
	equals(s, "false");
}); // 6

test("输入的对象当中包含了function", function(){
	var obj = {a:1,b:'test',c:true,d:3.12345,e:false,f:null,g:[1,2,3],h:{aa:1,bb:2}};
	obj.fn1 = function(x){
		alert(x);
	}
	obj.fn2 = function(x, y){
		if(x>y)
			return 1;
		return 2;
	}
	
	var s = baidu.json.encode(obj);
	equals(s, "{\"a\":1,\"b\":\"test\",\"c\":true,\"d\":3.12345,\"e\":false,\"f\":null,\"g\":[1,2,3],\"h\":{\"aa\":1,\"bb\":2}}");
});

//describe("baidu.json.encode测试",{
//
//    "encode函数输入符合Json要求的对象":function() {
//        var obj = {a:1,b:'test',c:true,d:3.12345,e:false,f:null,g:[1,2,3],h:{aa:1,bb:2}};  //输入为Json对象
//        var s = baidu.json.encode(obj);
//        value_of(s).should_be("{\"a\":1,\"b\":\"test\",\"c\":true,\"d\":3.12345,\"e\":false,\"f\":null,\"g\":[1,2,3],\"h\":{\"aa\":1,\"bb\":2}}");
//        
//        var arraytest = [{location:'beijing',company:'baidu',money:10.012,people:10},{location:'shanghai',company:'baidu',money:10.51,people:2}];  //输入为Json数组
//        s = baidu.json.encode(arraytest);
//        value_of(s).should_be("[{\"location\":\"beijing\",\"company\":\"baidu\",\"money\":10.012,\"people\":10},{\"location\":\"shanghai\",\"company\":\"baidu\",\"money\":10.51,\"people\":2}]");
//    },
//    "输入为number":function() {
//        var n = 3.14;  //输入为number
//        var s = baidu.json.encode(n);
//        value_of(s).should_be("3.14");
//    },
//    "输入为string":function() {
//        var n = 'baidu Online';  //输入为string
//        //alert(n);
//        var s = baidu.json.encode(n);
//        //alert("string"+s);
//        value_of(s).should_be("\"baidu Online\"");
//    },
//    "输入为null":function() {
//        var n = null;  //输入为null
//        var s = baidu.json.encode(n);
//        value_of(s).should_be("null");
//    },
//    "输入为undefined":function() {
//        var n = undefined;  //输入为undefined
//        var s = baidu.json.encode(n);
//        value_of(s).should_be("undefined");
//    },
//    "输入为boolean":function() {
//        var n = true;  //输入为boolean
//        var s = baidu.json.encode(n);
//        value_of(s).should_be("true");
//        
//        n = false;  //输入为boolean
//        s= baidu.json.encode(n);
//        value_of(s).should_be("false");
//        
//    },
//    "输入的对象当中包含了function":function() {
//        var obj = {a:1,b:'test',c:true,d:3.12345,e:false,f:null,g:[1,2,3],h:{aa:1,bb:2}}; //输入的对象当中包含了function
//        obj.fn1 = function (x) {alert(x); };
//        obj.fn2 = function(x,y) { if (x > y) 
//                                                                    return 1; 
//                                                            return 2;};
//        var s = baidu.json.encode(obj);
//        value_of(s).should_be("{\"a\":1,\"b\":\"test\",\"c\":true,\"d\":3.12345,\"e\":false,\"f\":null,\"g\":[1,2,3],\"h\":{\"aa\":1,\"bb\":2}}");
//        
//    }
//});