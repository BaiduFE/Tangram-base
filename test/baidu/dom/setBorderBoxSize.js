module("baidu.dom.setBorderBoxSize");

test("base", function() {
	var id = 0;
	var check = function(styles, expects) {
		if (baidu.browser.isStrict) {
			var div = document.body.appendChild(document.createElement("div"));
			div.id = "div_" + id++;
			$(div).css("backgroundColor", "red");
			for ( var style in styles) {
				$(div).css(style, styles[style]);
			}
			baidu.dom.setBorderBoxSize(div, styles);
			for ( var expect in expects) {
				equals(parseInt(div.style[expect]), expects[expect], "check "
						+ expect);
			}
			$(div).remove();
		}
	};

	check({
		height : 50,
		width : 50,
		padding : 0,
		borderWidth : 0
	}, {
		height : 50,
		width : 50
	});

	check({
		height : 50,
		width : 50,
		padding : 10,
		borderWidth : 10
	}, {
		height : 10,
		width : 10
	});

	check({
		height : 50,
		width : 50,
		padding : 0,
		borderWidth : 10
	}, {
		height : 30,
		width : 30
	});

	check({
		height : 50,
		width : 50,
		paddingTop : 10,
		paddingBottom : 0,
		paddingLeft : 10,
		paddingRight : 0,
		borderWidth : 0
	}, {
		height : 40,
		width : 40
	});
	
	check({
		height : 50,
		width : 50,
		padding : 0,
		borderLeftWidth : 10,
		borderRightWidth : 0,
		borderTopWidth : 10,
		borderBottomWidth : 0
	}, {
		height : 40,
		width : 40
	});
});
