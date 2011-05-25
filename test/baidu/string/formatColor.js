module('baidu.string.formatColor测试');

test('param color', function() {
	var color1 = "#334455",
	color2 = "rgb(32, 41, 4)",
	color3 = "#f23",
	color4 = "white",
	color5 = "";
	
	var c1 = baidu.string.formatColor(color1);
	var c2 = baidu.string.formatColor(color2);
	var c3 = baidu.string.formatColor(color3);
	var c4 = baidu.string.formatColor(color4);
	
	equal(c1,color1,"check reg1 : ");
	equal(c2,"#202904","check reg2 : ");
	equal(c3,"#ff2233","check reg3 : ");
	equal(c4,"#ffffff","check reg4 : ");
	
	
});

test('异常参数param color', function() {
	var color1 = "#GGGGGG";
	var c1 = baidu.string.formatColor(color1);
	equal(c1,"","#GGGGGG 错误参数类型，直接返回\"\"");
	
});
