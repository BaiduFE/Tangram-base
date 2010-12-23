module("baidu.lang.guid");

test("guid is unique", function(){
	var a = baidu.lang.guid();
	var b = baidu.lang.guid();
	var c = baidu.lang.guid();
	var d = baidu.lang.guid();
	var e = baidu.lang.guid();
	
	equals(a==null, false, 'a==null is false');
	equals(b==null, false, 'b==null is false');
	equals(c==null, false, 'c==null is false');
	equals(d==null, false, 'd==null is false');
	equals(e==null, false, 'e==null is false');
	
	equals(a==b, false, 'a==b is false');
	equals(b==c, false, 'b==c is false');
	equals(c==d, false, 'c==d is false');
	equals(d==e, false, 'd==e is false');
	equals(e==a, false, 'e==a is false');
});

//describe('baidu.lang.guid', {
//	'guid is unique' : function(){
//		var a = baidu.lang.guid();
//		var b = baidu.lang.guid();
//		var c = baidu.lang.guid();
//		var d = baidu.lang.guid();
//		var e = baidu.lang.guid();
//		
//		value_of(a).should_not_be(null);
//		value_of(b).should_not_be(null);
//		value_of(c).should_not_be(null);
//		value_of(d).should_not_be(null);
//		value_of(e).should_not_be(null);
//		
//		value_of(a).should_not_be(b);
//		value_of(b).should_not_be(c);
//		value_of(c).should_not_be(d);
//		value_of(d).should_not_be(e);
//	}
//});
