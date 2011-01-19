module("baidu.dom.setBorderBoxWidth");

test("base", function() {
	var check = function(styles, expects) {
		if (baidu.browser.isStrict) {
			var div = document.body.appendChild(document.createElement("div"));
			$(div).css("backgroundColor", "red");
			for ( var style in styles) {
				$(div).css(style, styles[style]);
			}
			baidu.dom.setBorderBoxWidth(div, styles["width"]);
			for ( var expect in expects) {
				equals(parseInt($(div).css(expect)), expects[expect], "check "
						+ expect);
			}
			$(div).remove();
		}
	};

	check({
		width : 50,
		padding : 0,
		borderWidth : 0
	}, {
		width : 50
	});

	check({
		width : 50,
		padding : 10,
		borderWidth : 10
	}, {
		width : 10
	});

	check({
		width : 50,
		padding : 10,
		borderWidth : 0
	}, {
		width : 30
	});

	check({
		width : 50,
		padding : 0,
		borderWidth : 10
	}, {
		width : 30
	});

	check({
		width : 50,
		paddingLeft : 10,
		borderWidth : 0
	}, {
		width : 40
	});
	check({
		width : 50,
		padding : 0,
		borderLeftWidth : 10
	}, {
		width : 40
	});
});
