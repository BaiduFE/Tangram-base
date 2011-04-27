module("baidu.String.subByte测试");

test('中间有\n', function() {
	basestr = "\n\n编辑游记前序您可以在这里记录下行前的准备，"
			+ "或是旅行总体感受，\n亦或是任何写在行程前的话编辑游记前序您可以在这里记录下行前的准备，"
			+ "或是旅行总体感受，亦或是任何写在行程前的话编辑游记前序您可以在这里记录下行前的准备，"
			+ "或是旅行总体感受，亦或是任何写在行程前的话编辑游记前序您可以在这里记录下行前的准备，"
			+ "或是旅行总体感受，亦或是任何写在行程前的话编辑游记前序您可以在这里记录下行前的准备，"
			+ "或是旅行总体感受，亦或是任何写在行程前的话编辑游记前序您可以在这里记录下行前的准备，"
			+ "或是旅行总体感受，亦或是任何写在行程前的话编辑游记前序您可以在这里记录下行前的准备，"
			+ "或是旅行总体感受，亦或是任何写在行程前的话 ";

	equals(baidu.string.subByte(basestr, 100, '...'),
			"\n\n编辑游记前序您可以在这里记录下行前的准备，或是旅行总体感受，\n亦或是任何写在行程前的话编辑游记前序...");
})

test("输入英文字符串", function() {
	basestr = "english string for test";

	equals(baidu.string.subByte(basestr, 0), "");
	equals(baidu.string.subByte(basestr, 1), "e");
	equals(baidu.string.subByte(basestr, 5), "engli");
	equals(baidu.string.subByte(basestr, 23), "english string for test");
	equals(baidu.string.subByte(basestr, 25), "english string for test"); // 超过 length
	equals(baidu.string.subByte(basestr, -1), "english string for test"); // 负数
}); // 1

test("输入中文字符串", function() {
	basestr = "百度字符串测试";

	equals(baidu.string.subByte(basestr, 0), "");
	equals(baidu.string.subByte(basestr, 1), "");
	equals(baidu.string.subByte(basestr, 6), "百度字");
	equals(baidu.string.subByte(basestr, 7), "百度字");
	equals(baidu.string.subByte(basestr, 14), "百度字符串测试");
	equals(baidu.string.subByte(basestr, 15), "百度字符串测试");
	equals(baidu.string.subByte(basestr, 30), "百度字符串测试");
	equals(baidu.string.subByte(basestr, -10), "百度字符串测试");
}); // 2

test("输入中英文混合字符串", function() {
	basestr = "百度China";

	equals(baidu.string.subByte(basestr, 0), "");
	equals(baidu.string.subByte(basestr, 1), "");
	equals(baidu.string.subByte(basestr, 4), "百度");
	equals(baidu.string.subByte(basestr, 5), "百度C");
	equals(baidu.string.subByte(basestr, 3), "百");
	equals(baidu.string.subByte(basestr, 9), "百度China");
	equals(baidu.string.subByte(basestr, 12), "百度China");

	basestr = "bai百 du度";
	equals(baidu.string.subByte(basestr, 0), "");
	equals(baidu.string.subByte(basestr, 2), "ba");
	equals(baidu.string.subByte(basestr, 4), "bai");
	equals(baidu.string.subByte(basestr, 9), "bai百 du");
	equals(baidu.string.subByte(basestr, 10), "bai百 du度");
	equals(baidu.string.subByte(basestr, -3), "bai百 du度");
}); // 3

test("输入字符串包括了全角字符，空格和转义字符等特殊字符", function() {
	basestr = "百 \(度\)ｃｈｉｎａ\.";

	equals(baidu.string.subByte(basestr, 0), "");
	equals(baidu.string.subByte(basestr, 1), "");
	equals(baidu.string.subByte(basestr, 3), "百 ");
	equals(baidu.string.subByte(basestr, 4), "百 \(");
	equals(baidu.string.subByte(basestr, 5), "百 \(");
	equals(baidu.string.subByte(basestr, 8), "百 \(度\)"); // 差一个字符
	equals(baidu.string.subByte(basestr, 9), "百 \(度\)ｃ"); // 正好相等
	equals(baidu.string.subByte(basestr, 10), "百 \(度\)ｃ");// 差一个字符（比前ｃ又多一个字符）
	equals(baidu.string.subByte(basestr, 11), "百 \(度\)ｃｈ");
	equals(baidu.string.subByte(basestr, 18), "百 \(度\)ｃｈｉｎａ\.");
	equals(baidu.string.subByte(basestr, 22), "百 \(度\)ｃｈｉｎａ\.");
}); // 4

test("异常case", function() {
	var nullstr = null;
	var undefstr;
	equals(baidu.string.subByte(nullstr, 2), "nu");
	equals(baidu.string.subByte(undefstr, 5), "undef"); // undefined is 9 characters
});

test("尾部追加字符串功能", function() {
	var str1 = "appending";
	equals(baidu.string.subByte(str1, 6, '...'), "append...");
	equals(baidu.string.subByte(str1, 100, '...'), "appending..."); // undefined is 9 characters
});

////subByte的测试
//describe("baidu.String.subByte测试",{
//    /*
//     *"输入英文字符串":function (){
//     *    basestr = "english string for test";
//     *    value_of(baidu.string.subByte(basestr,0)).should_be("");
//     *    value_of(baidu.string.subByte(basestr,1)).should_be("e");
//     *    value_of(baidu.string.subByte(basestr,5)).should_be("engli");
//     *    value_of(baidu.string.subByte(basestr,23)).should_be("english string for test");
//     *    value_of(baidu.string.subByte(basestr,25)).should_be("english string for test");
//     *    value_of(baidu.string.subByte(basestr,-1)).should_be("english string for test");
//     *},
//     */
//
//    "输入中文字符串":function (){
//        basestr = "百度字符串测试";
//        value_of(baidu.string.subByte(basestr,0)).should_be("");
//        value_of(baidu.string.subByte(basestr,1)).should_be("");
//        value_of(baidu.string.subByte(basestr,6)).should_be("百度字");
//        value_of(baidu.string.subByte(basestr,7)).should_be("百度字");
//        value_of(baidu.string.subByte(basestr,14)).should_be("百度字符串测试");
//        value_of(baidu.string.subByte(basestr,15)).should_be("百度字符串测试");
//        value_of(baidu.string.subByte(basestr,30)).should_be("百度字符串测试");
//        value_of(baidu.string.subByte(basestr,-10)).should_be("百度字符串测试");
//    },

//    "输入中英文混合字符串":function (){
//        basestr = "百度China";
//        value_of(baidu.string.subByte(basestr,0)).should_be("");
//        value_of(baidu.string.subByte(basestr,1)).should_be("");
//        value_of(baidu.string.subByte(basestr,4)).should_be("百度");
//        value_of(baidu.string.subByte(basestr,5)).should_be("百度C");
//        value_of(baidu.string.subByte(basestr,3)).should_be("百");
//        value_of(baidu.string.subByte(basestr,9)).should_be("百度China");
//        value_of(baidu.string.subByte(basestr,12)).should_be("百度China");
//        
//        basestr = "bai百 du度";
//        value_of(baidu.string.subByte(basestr,0)).should_be("");
//        value_of(baidu.string.subByte(basestr,2)).should_be("ba");
//        value_of(baidu.string.subByte(basestr,4)).should_be("bai");
//        value_of(baidu.string.subByte(basestr,9)).should_be("bai百 du");
//        value_of(baidu.string.subByte(basestr,-3)).should_be("bai百 du度");
//    },
//
//    "输入字符串包括了全角字符，空格和转义字符等特殊字符":function (){
//        basestr = "百 \(度\)ｃｈｉｎａ\.";
//        value_of(baidu.string.subByte(basestr,0)).should_be("");
//        value_of(baidu.string.subByte(basestr,1)).should_be("");
//        value_of(baidu.string.subByte(basestr,3)).should_be("百 ");
//        value_of(baidu.string.subByte(basestr,4)).should_be("百 \(");
//        value_of(baidu.string.subByte(basestr,5)).should_be("百 \(");
//        value_of(baidu.string.subByte(basestr,10)).should_be("百 \(度\)ｃ");
//        value_of(baidu.string.subByte(basestr,11)).should_be("百 \(度\)ｃｈ");
//        value_of(baidu.string.subByte(basestr,18)).should_be("百 \(度\)ｃｈｉｎａ\.");
//        value_of(baidu.string.subByte(basestr,22)).should_be("百 \(度\)ｃｈｉｎａ\.");
//    },
//
//    "异常case": function (){
//        var nullstr = null;
//        var undefstr;
//        value_of(baidu.string.subByte(nullstr,2)).should_be("nu");
//        value_of(baidu.string.subByte(undefstr,5)).should_be("undef");
//    }
//});
