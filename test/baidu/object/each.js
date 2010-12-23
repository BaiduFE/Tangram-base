module("baidu.object.each测试");

test("Object元素为number, string", function(){
	var n1 = new Number(3.24);
	var str1 = new String("str1");
	var aObject = {a:1,b:n1,c:0,d:"s1",e:str1,f:""};
	var count=0, rArray=[], rIndex=[];
	var srcObject = baidu.object.each(aObject, function(iVal, iIndex){
		rArray[count] = iVal;
		rIndex[count++] = iIndex;
	});
		
	same(rArray, [1,3.24,0,"s1","str1",""], 'rArray = [1,3.24,0,"s1","str1",""]');
	same(rIndex, ["a","b","c","d","e","f"], 'rIndex = ["a","b","c","d","e","f"]');
	same(srcObject, {a:1,b:n1,c:0,d:"s1",e:str1,f:""}, 'srcObject = {a:1,b:n1,c:0,d:"s1",e:str1,f:""}');
});

test("Object元素为Object,Array", function(){
	var aObject = {a:{"c":"a"},"b":{},"c":{a:{c:{}}},d:[3,"45"],e:[],f:[[["str"]],5]};
	var count = 0, rArray = [], rIndex = [];
	var srcObject = baidu.object.each(aObject, function(iVal, iIndex){
		rArray[count] = iVal;
		rIndex[count++] = iIndex;
	});
	
	same(rArray, [{"c":"a"}, {},{a:{c:{}}},[3,"45"],[],[[["str"]],5]], 'rArray = [{"c":"a"}, {},{a:{c:{}}},[3,"45"],[],[[["str"]],5]]');	
//	//A comparison assertion, equivalent to JUnit's assertEquals
//	//A deep recursive comparison assertion, working on primitive types, arrays and objects
//	same(rArray[1], {}, "Object: rArray[1] = '{}'"); 
//	same(rArray[2].a.c, {}, "Object: rArray[1] = '{}'");
	
	same(rIndex, ["a","b","c","d","e","f"], 'rIndex = ["a","b","c","d","e","f"]');	
	same(srcObject, {a:{"c":"a"},"b":{},"c":{a:{c:{}}},d:[3,"45"],e:[],f:[[["str"]],5]}, 'srcObject = {a:{"c":"a"},"b":{},"c":{a:{c:{}}},d:[3,"45"],e:[],f:[[["str"]],5]}');
});

test("Object元素为Function,Date", function(){
	var fun1 = function(){};
	var fun2 = function(a){a++;};
	var fun3 = function(){return 3;};
	var date1 = new Date();
	var aObject = {a:fun1,"b":fun2,"c":fun3,d:date1};
	var count = 0, rArray = [], rIndex = [];
	var srcObject = baidu.object.each(aObject, function(iVal, iIndex){
		rArray[count] = iVal;
		rIndex[count++] = iIndex;
	});
	
	same(rArray, [fun1, fun2, fun3, date1], 'rArray = [fun1, fun2, fun3, date1]');	
	same(rIndex, ["a","b","c","d"], 'rIndex = ["a","b","c","d"]');
	same(srcObject, {a:fun1,"b":fun2,"c":fun3,d:date1}, 'srcObject = {a:fun1,"b":fun2,"c":fun3,d:date1}');
});

test("Object元素为Null,undefined", function(){
	var aObject = {a:null,b:undefined};
	var count = 0, rArray = [], rIndex = [];
	var srcObject = baidu.object.each(aObject, function(iVal, iIndex){
		rArray[count] = iVal;
		rIndex[count++] = iIndex;
	});
	
	same(rArray, [null, undefined], 'rArray = [null, undefined]');	
	same(rIndex, ["a", "b"], 'rIndex = ["a", "b"]');
	same(srcObject, {a:null,b:undefined}, 'srcObject = {a:null,b:undefined}');
});

test("Object元素为迭代返回false的测试", function(){
	var aObject = {a:1,b:2,c:3,d:10,e:4,f:5};
	var count = 0, rArray = [], rIndex = [];
	var fnHandle1 = function(iVal, iIndex){
		if(iVal == 10){
			return false;
		}
		rArray[count] = iVal;
		rIndex[count++] = iIndex;
	};
	baidu.object.each(aObject, fnHandle1);
	
	same(rArray, [1,2,3], 'rArray = [1,2,3]');	
	same(rIndex, ["a","b","c"], 'rIndex = ["a","b","c"]');
});

test("Object元素为包含toString和valueOf的遍历", function(){
	var aObject = {a:1,b:2,c:3,d:10,e:4,f:5};
	aObject.toString = function(){
		return "aObject";
	};
	var count = 0, rArray = [], rIndex = [];
	var fnHandle1 = function(iVal, iIndex){
//		console.log(iVal);
//		console.log(iIndex);
		if(iVal == 10){
			return false;
		}
		rArray[count] = iVal;
		rIndex[count++] = iIndex;
	};
	baidu.object.each(aObject, fnHandle1);
	
	same(rArray, [1,2,3], '');
	same(rIndex, ["a", 'b', "c"], '');
	 /*
     *value_of(rArray).should_be([1, 2, 3]);
     *value_of(rIndex).should_be(["a", 'b', "c"]);
     */
	
});

//describe('baidu.object.each测试',{
//    'Object元素为number, string': function() {
//		var n1 = new Number(3.24);
//		var str1 = new String('str1');
//        var aObject = {a:1, b:n1, c:0, d:'s1', e:str1, f:''};
//        var count=0, rArray = [], rIndex = [];
//        var srcObject= baidu.object.each(aObject, function(iVal, iIndex){ 
//            rArray[count] = iVal; 
//            rIndex[count++] = iIndex;
//        });
//        value_of(rArray).should_be([1, 3.24, 0, 's1', 'str1', '']);
//        value_of(rIndex).should_be(["a", 'b', "c", 'd', 'e', 'f']);
//		value_of(srcObject).should_be({a:1, b:n1, c:0, d:'s1', e:str1, f:''});
//    },
//	'Object元素为Object,Array': function() {
//        var aObject = {a:{"c":"a"}, 'b':{}, "c":{a:{c:{}}}, d:[3, '45'], e:[], f:[[["str"]], 5]};
//        var count=0, rArray = [], rIndex = [];
//        var srcObject= baidu.object.each(aObject, function(iVal, iIndex){ 
//            rArray[count] = iVal; 
//            rIndex[count++] = iIndex;
//        });
//        value_of(rArray).should_be([{"c":"a"}, {}, {a:{c:{}}}, [3, '45'], [], [[["str"]], 5]]);
//        value_of(rIndex).should_be(["a", 'b', "c", 'd', 'e', 'f']);
//		value_of(srcObject).should_be({a:{"c":"a"}, 'b':{}, "c":{a:{c:{}}}, d:[3, '45'], e:[], f:[[["str"]], 5]});
//    },
//	'Object元素为Function,Date': function() {
//		var fun1 = function(){};
//		var fun2 = function(a){a++;};
//		var fun3 = function(){return 3;};
//		var date1 = new Date();
//        var aObject = {a:fun1, 'b':fun2, "c":fun3, d:date1};
//        var count=0, rArray = [], rIndex = [];
//        var srcObject= baidu.object.each(aObject, function(iVal, iIndex){ 
//            rArray[count] = iVal; 
//            rIndex[count++] = iIndex;
//        });
//        value_of(rArray).should_be([fun1, fun2, fun3, date1]);
//        value_of(rIndex).should_be(["a", 'b', "c", 'd']);
//		value_of(srcObject).should_be({a:fun1, 'b':fun2, "c":fun3, d:date1});
//    },
//	'Object元素为Null,undefined': function() {
//        var aObject = {a:null, b:undefined};
//        var count=0, rArray = [], rIndex = [];
//        var srcObject= baidu.object.each(aObject, function(iVal, iIndex){ 
//            rArray[count] = iVal; 
//            rIndex[count++] = iIndex;
//        });
//        value_of(rArray).should_be([null, undefined]);
//        value_of(rIndex).should_be(["a", 'b']);
//		value_of(srcObject).should_be({a:null, b:undefined});
//    },
//    '迭代返回false的测试': function() {
//        var aObject = {a:1, b:2, c:3, d:10, e:4, f:5};
//        var count=0, rArray = [], rIndex = [];
//        var fnHandle1 = function(iVal, iIndex) {
//            if(iVal == 10) {
//                return false;
//            }
//            rArray[count] = iVal; 
//            rIndex[count++] = iIndex;
//        };
//        baidu.object.each(aObject, fnHandle1);
//        value_of(rArray).should_be([1, 2, 3]);
//        value_of(rIndex).should_be(["a", 'b', "c"]);
//    },
//    '包含toString和valueOf的遍历': function() {
//        var aObject = {};
//        aObject.toString = function(){
//            return "aObject";
//        };
//        var count=0, rArray = [], rIndex = [];
//        var fnHandle1 = function(iVal, iIndex) {
//            console.log(iVal);
//            console.log(iIndex);
//        };
//        baidu.object.each(aObject, fnHandle1);
//        /*
//         *value_of(rArray).should_be([1, 2, 3]);
//         *value_of(rIndex).should_be(["a", 'b', "c"]);
//         */
//    }
//});
