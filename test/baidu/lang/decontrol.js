module("baidu.lang.decontrol");

test('guid', function() {
	var m = window[baidu.guid];
	m._instances['a'] = {};
	baidu.lang.decontrol('a');
	equals(m._instances['a'], null, 'obj is deleted');
});