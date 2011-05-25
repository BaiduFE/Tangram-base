module("测试createHTML");

test("given/ungiven args test", function() {
	var object_given = {
		"id" : 1,
		"width" : 1,
		"height" : 1,
		"align" : 1,
		"devicefont" : 1,
		"ver" : 1
	};
	var param_given = {
		"url" : 1,
		"base" : 1,
		"bgcolor" : 1,
		"salign" : 1,
		"menu" : 1,
		"loop" : 1,
		"devicefont" : 1,
		"play" : 1,
		"quality" : 1,
		"scale" : 1,
		"wmode" : 1,
		"allowscriptaccess" : 1,
		"allownetworking" : 1,
		"allowfullscreen" : 1,
		"seamlesstabbing" : 1,
		"devicefont" : 1,
		"swliveconnect" : 1
	};
	var opt = {
		'id' : 'flash2',
		'url' : upath + 'short1.swf',
		'ver' : '10.0.0',
		'width' : '300',
		'height' : '180',
		'align' : 'B',
		'base' : '.',
		'bgcolor' : '#00EE00',
		'salign' : 'TR',
		'menu' : 'true',
		'loop' : 'false',
		'play' : 'false',
		'quality' : 'low',
		'scale' : 'Showall',
		'wmode' : 'Window',
		'allowscriptaccess' : 'sameDomain',
		'allownetworking' : 'all',
		'allowfullscreen' : 'false',
		'seamlesstabbing' : 'true',
		'devicefont' : 'true',
		'swliveconnect' : 'true',
		'othervar' : 'usrless',
		'vars' : {
			'param' : 'uselessParam'
		}
	};
	var flashstr = baidu.swf.createHTML(opt);
	var prefix = '<param name="', midfix = '" value="', postfix = '" />';
	for ( var key in opt) {
		var reKey = new RegExp(prefix + (key == "url" ? "movie" : key) + midfix
				+ opt[key] + postfix);
		var reKey2 = new RegExp(key + '="' + opt[key] + '"');
		if (param_given[key])
			ok(reKey.test(flashstr), "given arg of " + key + " must exist!");
		if (object_given[key])
			ok(reKey2.test(flashstr), "given arg of " + key + " must exist!");
		if (key == "vars") {
			vars = [];
			for ( var varskey in opt["vars"]) {
				vars[vars.length] = varskey + "=" + opt["vars"][varskey];
			}
			var reVars = new RegExp('<param name="flashvars" value="'
					+ vars.join('&') + '" />');
			ok(reVars.test(flashstr), "vars arg must exist as flashvars");
		}
		if (!param_given[key] && !object_given[key] && key == "vars") // key
																		// !=
																		// "vars"
			ok(!reKey.test(flashstr) && !reKey2.test(flashstr),
					"ungiven arg of " + key + " must not exist!");
	}
});
