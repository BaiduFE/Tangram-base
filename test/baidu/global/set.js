module("baidu.global.set");

test("common",function(){
	expect(4);
	var a = baidu.global.set('id', 'value1');
	equals(a, 'value1', 'common');
	a = baidu.global.set('id', 'value2', true);
	equals(a, 'value1', 'protected_=true');
	a = baidu.global.set('id', 'value3');
	equals(a, 'value3', 'protected_=default');
	a = baidu.global.set('id', 'value4', false);
	equals(a, 'value4', 'protected_=false');
});

test("''",function(){
	expect(1);
	var a = baidu.global.set('id1', '');
	equals(a, '', 'common');
});

test("iframe",function(){
	expect(1);
	stop();
	ua.frameExt(function(w, f) {
		var a = w.baidu.global.set('id2', 'value1');
		equals(a, 'value1', 'iframe');
		this.finish();
	});
});