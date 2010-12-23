module("baidu.object.clone测试");

test("clone函数输入string对象用例，用例1", function(){
	var n;
	var ntwin;
	
	s = "test";
	stwin = baidu.object.clone(s);
	equals(stwin, "test", "Test clone string");
	stwin = stwin+"tail";
	equals(s, "test", "Test source string");
	equals(stwin, "testtail", "Test strcat string");
});

test("clone函数输入string对象实例，用例2", function(){
	var n;
	var ntwin;
	
	s = new String("test");
	stwin = baidu.object.clone(s);
	equals(stwin, "test", "Test clone string");
	stwin = stwin+"tail";
	equals(s, "test", "Test source string");
	equals(stwin, "testtail", "Test strcat string");
});

test("clone函数输入number", function(){
	var n;
	var ntwin;
	
	n = 3.14;
	ntwin  = baidu.object.clone(n);
	equals(ntwin, 3.14, "ntwin = 3.14");
	ntwin = ntwin+2;
	equals(n, 3.14, "n = 3.14");
//	equals(ntwin, 5.14, "ntwin = 5.140000000000001"); // decimal precision is 15 bits
	
	//测试number为整数
	n = 3;
	ntwin = baidu.object.clone(n);
	equals(ntwin, 3, "ntwin = 3");
	ntwin = ntwin+2;
	equals(n, 3, "n = 3");
	equals(ntwin, 5, "ntwin = 5");
})

test("clone函数输入number对象实例", function(){
	var n;
	var ntwin;
	
	n = new Number(3.14);
	ntwin = baidu.object.clone(n);
	equals(ntwin, 3.14, "ntwin = 3.14");
	ntwin = ntwin+2;
	equals(n, 3.14, "n = 3.14");
//	equals(ntwin, 5.14, "ntwin = 5.140000000000001"); // decimal precision is 15 bits
	
	//测试number为整数
	n = 3;
	ntwin = baidu.object.clone(n);
	equals(ntwin, 3, "ntwin = 3");
	ntwin = ntwin+2;
	equals(n, 3, "n = 3");
	equals(ntwin, 5, "ntwin = 5");
});

test("clone函数输入object对象实例", function(){
	var o;
	var otwin;
	
	o = {a:1,b:'test',c:true};
	otwin = baidu.object.clone(o);
	equals(o.a==otwin.a, true, "o.a==otwin");
	equals(o.b==otwin.b, true, "o.b==otwin.b");
	equals(otwin.c, true, "otwin.c==true");
	
	otwin.a = 10;
	otwin.b += 'tail';
	otwin.c = false;
	equals(o.a, 1, "o.a==1");
	equals(o.b, "test", "o.b==test");
	equals(o.c, true, "o.c==true");
	equals(otwin.a, 10, "otwin.a==true");
	equals(otwin.b, "testtail", "otwin.b==testtail");
	equals(otwin.c, false, "otwin.c==false");
});

test("clone函数输入空对象", function(){
	var empty = {};
	var emptyTwin = baidu.object.clone(empty);	
	
	equals(empty.a, undefined, "empty.a==undefined");
	equals(emptyTwin.a, undefined, "emptyTwin==undefined");
	
	emptyTwin.a = "test";
	equals(empty.a, undefined, "empty.a==undefined");
	equals(emptyTwin.a, "test", "emptyTwin.a==test");
});

test("clone函数输入array", function(){
	var array = [1, "test", 3.14];
	var arrayTwin = baidu.object.clone(array);
	
	equals(array===arrayTwin, false, "array===arrayTwin is false");
	equals(array[0]==arrayTwin[0], true, "array[0]==arrayTwin[0]");
	equals(array[1]==arrayTwin[1], true, "array[1]==arrayTwin[1]");
	equals(array[2]==arrayTwin[2], true, "array[2]==arrayTwin[2]");
	
	arrayTwin[0] = 100;
	equals(array[0], 1, "array[0]==1");
	equals(arrayTwin[0], 100, "arrayTwin[0]==100");
});

test("clone函数输入array中含有array", function(){
	var array = [[0,1],{'a':'3','b':['test']},[1,[[5,6],4]]];
	var arrayTwin = baidu.object.clone(array);
	
	equals(array==arrayTwin, false, "array==arrayTwin is false");
	equals(array===arrayTwin, false, "array===arrayTwin is false"); // == is false, so === is false too.
	equals(array[0]==arrayTwin[0], false, "array[0]==arrayTwin[0] is false"); // array === is false
	equals(array[0][0]==arrayTwin[0][0], true, "array[0][0]==arrayTwin[0][0]");
	equals(array[0][1]==arrayTwin[0][1], true, "array[0][1]==arrayTwin[0][1]");
	equals(array[0][0]===arrayTwin[0][0], true, "array[0][0]===arrayTwin[0][0]");
	equals(array[0][1]===arrayTwin[0][1], true, "array[0][1]===arrayTwin[0][1]");
	
	equals(array[1]==arrayTwin[1], false, "array[1]==arrayTwin[1] is false");
	equals(array[1].a==arrayTwin[1].a, true, "array[1].a==arrayTwin[1].a");
	equals(array[1].b==arrayTwin[1].b, false, "array[1].b==arrayTwin[1].b is false"); // array is false
	equals(array[1].b[0]==arrayTwin[1].b[0], true, "array[1].b[0]==arrayTwin[1].b[0]"); // array[] for 'test' is true
	
	equals(array[2]==arrayTwin[2], false, "array[2]==arrayTwin[2] is false");
	equals(array[2][0]==arrayTwin[2][0], true, "array[2][0]==arrayTwin[2][0]"); // array[2][0] is 1
	equals(array[2][1]==arrayTwin[2][1], false, "array[2][1]==arrayTwin[2][1] is false");
	equals(array[2][1][0]==arrayTwin[2][1][0], false, "array[2][1][0]==array[2][1][0] is false"); //array[2][1][0] is [5,6]
	equals(array[2][1][0][0]==arrayTwin[2][1][0][0], true, "array[2][1][0][0]==arrayTwin[2][1][0][0]"); // array[2][1][0][1] is 5
	equals(array[2][1][0][1]==arrayTwin[2][1][0][1], true, "array[2][1][0][1]==arrayTwin[2][1][0][1]"); // array[2][1][0][1] is 6
	equals(array[2][1][1]==arrayTwin[2][1][1], true, "array[2][1][1]==arrayTwin[2][1][1]"); // array[2][1][1] is 4
	
});

test("clone函数输入的对象当中包含了方法", function(){
	var o;
	var otwin;	
	
	o = new Object();
	o.a = 1;
	o.b = "test";
	o.c = true;
	o.fn = function(num){equals(this.a == num, true, "Function: this.a=num");};
	otwin = baidu.object.clone(o);
	equals(o.a==otwin.a, true, "o.a==otwin.a");
	equals(o.b==otwin.b, true, "o.b==otwin.b");
	
	otwin.a = 100;
	otwin.fn(100);
});

test("clone函数输入的对象当中包含了Date", function(){
	var o;
	var otwin;
	
	o = new Object();
	o.d = new Date();
	otwin = baidu.object.clone(o);
	equals(o.d==otwin.d, true, "Date: o.d==otwin.d");
});

test("clone函数输入的对象当中包含了Null", function(){
	var o;
	var otwin;
	
	o = new Object();
	o.n = null;
	otwin = baidu.object.clone(o);
	equals(o.n==otwin.o, true, "NULL: o.n==otwin.o");
});

test("clone函数输入的对象当中包含了Undefined", function(){
	var o;
	var otwin;
	
	o = new Object();
	o.n; // undefined
	otwin = baidu.object.clone(o);
	equals(o.n==otwin.o, true, "Undefined: o.n==otwin.o");
});


////baidu.object.clone的测试
//describe("baidu.object.clone测试",{
//    "clone函数输入string对象实例,用例1":function() {
//        s = 'test';
//        stwin = baidu.object.clone(s);
//        value_of(stwin).should_be('test');
//        stwin = stwin+'tail';
//        value_of(s).should_be('test');
//		value_of(stwin).should_be('testtail');
//    },
//    
//    "clone函数输入string对象实例，用例2":function() {
//        s = new String('test');
//        stwin = baidu.object.clone(s);
//        value_of(stwin).should_be('test');
//        stwin = stwin+'tail';
//        value_of(s).should_be('test');
//		value_of(stwin).should_be('testtail');
//    },
//    "clone函数输入number":function (){
//        n = 3.14;
//        ntwin = baidu.object.clone(n);
//        value_of(ntwin).should_be(3.14);
//        ntwin = ntwin +2;
//        value_of(n).should_be(3.14);
////		value_of(ntwin).should_be(5.14);
//    },
//    "clone函数输入number对象实例":function (){
//        n = new Number(3.14);
//        ntwin = baidu.object.clone(n);
//        value_of(ntwin).should_be(3.14);
//        ntwin = ntwin +2;
//        value_of(n).should_be(3.14);
//	//	value_of(ntwin).should_be(5.14);
//    },
//    "clone函数输入object对象实例":function (){
//        o = { a:1,b:'test',c:true};
//        otwin = baidu.object.clone(o);
//        value_of(o.a==otwin.a).should_be_true();
//        value_of(o.b==otwin.b).should_be_true();
//        value_of(otwin.c).should_be_true();
//        otwin.a = 10; 
//        otwin.b += 'tail';
//		otwin.c = false;
//        value_of(o.a).should_be(1);
//        value_of(o.b).should_be('test');
//        value_of(o.c).should_be_true();
//		value_of(otwin.a).should_be(10);
//        value_of(otwin.b).should_be('testtail');
//        value_of(otwin.c).should_be_false();
//		
//    },
//    "clone函数输入空对象":function (){
//        empty = {};
//        emptyTwin = baidu.object.clone(empty);
//        value_of(empty.a).should_be_undefined();
//        value_of(emptyTwin.a).should_be_undefined();
//        emptyTwin.a = 'test';
//        value_of(empty.a).should_be_undefined();
//        value_of(emptyTwin.a).should_be('test');
//    },
//    "clone函数输入array":function (){
//        array = [1,'test',3.14];
//        arrayTwin = baidu.object.clone(array);
//        value_of(array===arrayTwin).should_be_false();
//        value_of(array[0]==arrayTwin[0]).should_be_true();
//        value_of(array[1]==arrayTwin[1]).should_be_true();
//        value_of(array[2]==arrayTwin[2]).should_be_true();
//
//        arrayTwin[0] = 100;
//        value_of(array[0]).should_be(1);
//		value_of(arrayTwin[0]).should_be(100);
//    },
//    "clone函数输入array中含有array":function (){
//        var array = [[0,1], {'a':'3', 'b':['test']}, [1, [[5, 6], 4]]];
//        var arrayTwin = baidu.object.clone(array);
//        value_of(array===arrayTwin).should_be_false();
//        value_of(array[0]==arrayTwin[0]).should_be_false();
//		value_of(array[0][0] == arrayTwin[0][0]).should_be_true();
//		value_of(array[0][1] == arrayTwin[0][1]).should_be_true();
//		
//		value_of(array[1]==arrayTwin[1]).should_be_false();
//		value_of(array[1].a==arrayTwin[1].a).should_be_true();
//		value_of(array[1].b==arrayTwin[1].b).should_be_false();
//		value_of(array[1].b[0]==arrayTwin[1].b[0]).should_be_true();
//		
//        value_of(array[2]==arrayTwin[2]).should_be_false();
//		value_of(array[2][0]==arrayTwin[2][0]).should_be_true();
//		value_of(array[2][1]==arrayTwin[2][1]).should_be_false();
//		value_of(array[2][1][0]==arrayTwin[2][1][0]).should_be_false();
//		value_of(array[2][1][0][0]==arrayTwin[2][1][0][0]).should_be_true();
//		value_of(array[2][1][0][1]==arrayTwin[2][1][0][1]).should_be_true();
//		value_of(array[2][1][1]==arrayTwin[2][1][1]).should_be_true();
//		
//    },
//    "输入的对象当中包含了方法":function (){
//        o = new Object();
//        o.a =1;
//        o.b='test';
//        o.c = true;
//        o.fn = function (num){ value_of(this.a == num).should_be_true();};
//        otwin = baidu.object.clone(o);
//        value_of(o.a==otwin.a).should_be_true();
//        value_of(o.b==otwin.b).should_be_true();            
//        otwin.a =100;
//        o.fn(1);
//        otwin.fn(100);
//    },
//    "输入的对象当中包含了Date":function (){
//        o = new Object();
//        o.d = new Date();
//        otwin = baidu.object.clone(o);
//        value_of(o.d==otwin.d).should_be_true();
//    },
//    "输入的对象当中包含了Null":function (){
//        o = new Object();
//        o.n = null;
//        otwin = baidu.object.clone(o);
//        value_of(o.n===otwin.n).should_be_true();
//    },
//    "输入的对象当中包含了Undefined":function (){
//        o = new Object();
//        o.u;
//        otwin = baidu.object.clone(o);
//        value_of(o.u===otwin.u).should_be_true();
//    }
//});
