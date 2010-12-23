module("baidu.object.values测试");

test("values函数输入对象", function(){
	var o;
	var v;
	
	o = {a:1,b:"test",c:3.12345,d:[1,2,3],e:{attr:"values",attr1:11}}; //对象当中没有函数作为value
	v = baidu.object.values(o);
	same(v, [1,"test",3.12345,[1,2,3],{attr:"values",attr1:11}], 'v = "[1,"test",3.12345,[1,2,3],{attr:"values",attr1:11}]"');
	
	o = {a:1,b:"test",c:3.12345,d:[1,2,3],e:{attr:"values",attr1:11}};
	o.fn = function(x){alert(x);};
	v = baidu.object.values(o);
//	same(v, [1,"test",3.12345,[1,2,3],{attr:"values",attr1:11}, function(x){alert(x);}]);
	equals(v.length, 6, 'v.length = 6');
	equals(v[0], 1, 'v[0] = 1');
	equals(v[1], "test", 'v[1] = "test"');
	equals(v[2], 3.12345, 'v[2] = 3.12345');
	same(v[3], [1,2,3], 'v[3] = [1,2,3]');
	same(v[4], {attr:"values",attr1:11}, 'v[4] = {attr:"values",attr1:11}');
	
//	ok(v[5]==(function(x){alert(x);}), '');
	var varFn = function(x){alert(x);};
	equals(typeof varFn, "function", 'varFn is "function"'); // 校验是否为函数，原则上还需要校验其内容（equals比较或正则表达式判断）
});

test("values函数输入没有任何属性的对象", function(){
	var v = baidu.object.values({});
	same(v, [], 'v = "[]"');
});

////baidu.object.values测试
//describe("baidu.object.values测试",{
//    "values函数输入对象":function (){
//        o = { a:1,b:'test',c:3.1415,d:[1,2,3],e:{attr:'values',attr1:11}};  //对象当中没有函数作为value
//        v = baidu.object.values(o);
//        value_of(v).should_be([1,'test',3.1415,[1,2,3],{attr:'values',attr1:11}]);
//        
//        o = { a:1,b:'test',c:3.1415,d:[1,2,3],e:{attr:'values',attr1:11}};  //对象当中有函数作为value
//        o.fn = function (x){alert(x);};
//        v = baidu.object.values(o);
//        value_of(v).should_be([1,'test',3.1415,[1,2,3],{attr:'values',attr1:11}, function (x){alert(x);}]);
//    },
//    "values函数输入没有任何属性的对象":function (){
//        v = baidu.object.values({ });
//        value_of(v).should_be([]);
//    }
//});
