module("baidu.lang.module");

var myModule = {};
var myFun = function () {};

test("扩展存在的Object类型的模块", function(){
	baidu.lang.module("myModule.sum", function(a,b){return a+b;});
	equals(myModule.sum(1,2), 3, 'extend exist Object module');
});

test("扩展存在的Function类型的模块", function(){
	baidu.lang.module("myFun.sum", function(a,b){return a+b;});
	equals(myFun.sum(1,2), 3, 'extend exist Function module');
});

test("扩展不存在的模块", function(){
	baidu.lang.module("noExist.sum", function(a,b){return a+b;});
	equals(noExist.sum(1,2), 3, 'extend noExist module extend');
});

test("指定owner的模块扩展", function(){
	baidu.lang.module("mod.sum", function(a,b){return a+b;}, myModule);
	equals(myModule.mod.sum(1,2), 3, 'declare owner module extend');
});

test("指定owner不存在的模块扩展", function(){
	baidu.lang.module("noex.sum", function(a,b){return a+b;}, null);
	equals(noex.sum(1,2), 3, 'declare owner noExist module extend');
});

test("指定namespace下面进行扩展", function(){
  var com = {
    'leeight' : {
      'package' : {
      
      },
      'name' : 'leeight',
      'age' : 25,
      'height' : 0
    }
  };
  
  baidu.lang.module("sum", function(a, b){ return a + b;}, com.leeight.package);
  equals(com.leeight.package.sum(1, 2), 3, "exists");

  baidu.lang.module("sum", function(a, b){ return a + b + 1;}, com.leeight.package);
  equals(com.leeight.package.sum(1, 2), 3, "can't be override");

  baidu.lang.module("sum", function(a, b){ return a + b;}, com.leeight.name);
  equals(com.leeight.name.sum, undefined, "exists");

  baidu.lang.module("sum", function(a, b){ return a + b;}, com.leeight.age);
  equals(com.leeight.age.sum, undefined, "exists");
  
  baidu.lang.module("sum", function(a, b){ return a + b;}, com.leeight.height);
  equals(com.leeight.height.sum, undefined, "exists");
});




//describe('baidu.lang.module测试',{
//    '扩展存在的Object类型的模块': function () {
//        baidu.lang.module('myModule.sum', function(a,b){return a+b;});
//        value_of(myModule.sum(1,2)).should_be(3);
//    },
//
//    '扩展存在的Function类型的模块': function () {
//        baidu.lang.module('myFun.sum', function(a,b){return a+b;});
//        value_of(myFun.sum(1,2)).should_be(3);
//    },
//
//    '扩展不存在的模块': function () {
//        baidu.lang.module('noExist.sum', function(a,b){return a+b;});
//        value_of(noExist.sum(1,2)).should_be(3);
//    },
//
//    '指定owner的模块扩展': function () {
//        baidu.lang.module('mod.sum', function(a,b){return a+b;}, myModule);
//        value_of(myModule.mod.sum(1,2)).should_be(3);
//    },
//	'指定owner不存在的模块扩展': function () {
//        baidu.lang.module('noex.sum', function(a,b){return a+b;}, null);
//        value_of(noex.sum(1,2)).should_be(3);
//    }
//});
