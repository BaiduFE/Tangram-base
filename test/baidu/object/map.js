module("baidu.object.map");

test("base", function() {
	expect(4);
	var check = function(o, fn, expects) {
		var actuals = baidu.object.map(o, fn);
		for ( var name in o) {
			if (name == 'd')
				continue;
			equals(actuals[name], "_" + o[name], "check value " + name);
		}
	}
	check({
		a : "a",
		b : "b",
		d : function() {
		}
	}, function(value, key) {
		if (key == "d")
			return "";
		equals(value, key, "check key " + key);
		return "_" + value;
	});
});