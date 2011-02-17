module("baidu.json.stringify测试");

test(
		"stringify函数输入符合Json要求的对象",
		function() {
			var obj = {
				a : 1,
				b : 'test',
				c : true,
				d : 3.12345,
				e : false,
				f : null,
				g : [ 1, 2, 3 ],
				h : {
					aa : 1,
					bb : 2
				}
			}; // 输入为Json对象
			var s = baidu.json.stringify(obj);
			equals(
					s,
					"{\"a\":1,\"b\":\"test\",\"c\":true,\"d\":3.12345,\"e\":false,\"f\":null,\"g\":[1,2,3],\"h\":{\"aa\":1,\"bb\":2}}");

			var arraytest = [ {
				location : 'beijing',
				company : 'baidu',
				money : 10.012,
				people : 10
			}, {
				location : 'shanghai',
				company : 'baidu',
				money : 10.51,
				people : 2
			} ]; // 输入为Json数组
			s = baidu.json.stringify(arraytest);
			equals(
					s,
					"[{\"location\":\"beijing\",\"company\":\"baidu\",\"money\":10.012,\"people\":10},{\"location\":\"shanghai\",\"company\":\"baidu\",\"money\":10.51,\"people\":2}]");
		});

test("输入为number", function() {
	var n = 3.14;
	var s = baidu.json.stringify(n);
	equals(s, "3.14");
});

test("输入为Date", function() {
	var date = "2010/12/01 12:34:45";
	var myDate = new Date(date);
	var s = baidu.json.stringify(myDate);
	equals(s, "\"2010-12-01T12:34:45\"");
});

test("输入为string", function() {
	var n = 'baidu Online';
	var s = baidu.json.stringify(n);
	equals(s, "\"baidu Online\"");
	var k = '\x1c';
	var s = baidu.json.stringify(k);
	equals(s, "\"\\u001c\"");
});

test("输入为null", function() {
	var n = null;
	var s = baidu.json.stringify(n);
	equals(s, "null");
});

test("输入为undefined", function() {
	var n = void (0);
	var s = baidu.json.stringify(n);
	equals(s, "undefined");
});

test("输入为boolean", function() {
	var n = true;
	var s = baidu.json.stringify(n);
	equals(s, "true");

	n = false;
	s = baidu.json.stringify(n);
	equals(s, "false");
});

test(
		"输入的对象当中包含了function",
		function() {
			var obj = {
				a : 1,
				b : 'test',
				c : true,
				d : 3.12345,
				e : false,
				f : null,
				g : [ 1, 2, 3 ],
				h : {
					aa : 1,
					bb : 2
				}
			}; // 输入的对象当中包含了function
			obj.fn1 = function(x) {
				alert(x);
			}
			obj.fn2 = function(x, y) {
				if (x > y)
					return 1;
				return 2;
			}

			var s = baidu.json.stringify(obj);
			equals(
					s,
					"{\"a\":1,\"b\":\"test\",\"c\":true,\"d\":3.12345,\"e\":false,\"f\":null,\"g\":[1,2,3],\"h\":{\"aa\":1,\"bb\":2}}");
		});

test("hasOwnProperty", function() {
	var object = {
		"hasOwnProperty" : null,
		"constructor" : null,
		"isPrototypeOf" : null,
		"propertyIsEnumerable" : null,
		"toLocaleString" : null,
		"valueOf" : null,
		"toString" : null
	};

	if (ua.browser.ie && ua.browser.ie <= 8) {
		equals(baidu.json.stringify(object), '{}');
	} else {
		equals(baidu.json.stringify(object), '{"hasOwnProperty":null,'
				+ '"constructor":null,"isPrototypeOf":null,'
				+ '"propertyIsEnumerable":null,"toLocaleString":null,'
				+ '"valueOf":null,"toString":null}');
	}
});