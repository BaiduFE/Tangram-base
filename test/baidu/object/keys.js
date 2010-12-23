module("baidu.object.keys测试");

test("keys函数输入对象实例", function(){
	o = {a:1,b:"text",c:3.12345,d:[1,2,3],e:new Object()}; //对象当中没有函数作为value
	k = baidu.object.keys(o);	
	same(k, ["a","b","c","d","e"], 'k = ["a","b","c","d","e"]');
	
	o = {a:1,b:"test",c:3.12345,d:[1,2,3],e:new Object()};
	o.fn = function(x){
		alert(x);
	};
	k = baidu.object.keys(o);
	same(k, ["a","b","c","d","e","fn"], 'k = ["a","b","c","d","e","fn"]');
});

test("keys函数输入没有任何属性的对象实例", function(){
	k = baidu.object.keys({});
	equals(k[0], undefined, '{}: k[0] = "undefined"');
});

////baidu.object.keys测试
//describe('baidu.object.keys测试',{
//    "keys函数输入对象实例":function (){
//        o = { a:1,b:'test',c:3.1415,d:[1,2,3],e:new Object()};  //对象当中没有函数作为value
//        k = baidu.object.keys(o);
//        value_of(k).should_be(['a','b','c','d','e']);
//        
//        o = { a:1,b:'test',c:3.1415,d:[1,2,3],e:new Object()};  //对象当中有函数作为value
//        o.fn = function (x){alert(x);};
//        k = baidu.object.keys(o);
//        value_of(k).should_be(['a','b','c','d','e','fn']);
//    },
//    "keys函数输入没有任何属性的对象实例":function (){
//        k = baidu.object.keys({});
//        value_of(k).should_be([]);
//    }
//});