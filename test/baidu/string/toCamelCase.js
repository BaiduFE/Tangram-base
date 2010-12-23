module("baidu.String.toCamelCase测试");

test("输入中划线连字的字符", function(){
	equals(baidu.string.toCamelCase('i-like-baidu'), 'iLikeBaidu');
	equals(baidu.string.toCamelCase('I-Like-Baidu'), 'ILikeBaidu');
}); // 1

test("两个下划线或中划线", function(){
	equals(baidu.string.toCamelCase('i--like--baidu'), 'i-Like-Baidu');
	equals(baidu.string.toCamelCase('I__Like__Baidu'), 'I_Like_Baidu');
}); // 2

test("开头有下划线或中划线", function(){
	equals(baidu.string.toCamelCase('-like-baidu'), 'LikeBaidu');
	equals(baidu.string.toCamelCase('_like_baidu'), 'LikeBaidu');
}); // 3

test("输入下划线连字的字符", function(){
	equals(baidu.string.toCamelCase('i_like_baidu'), 'iLikeBaidu');
	equals(baidu.string.toCamelCase('I_Like_Baidu'), 'ILikeBaidu');
}); // 4

test("下划线和中划线并存", function(){
	equals(baidu.string.toCamelCase('i-like_baidu-oh-yeah_haha_haha'), 'iLikeBaiduOhYeahHahaHaha');
	equals(baidu.string.toCamelCase('I_Like_Baidu-Oh-Yeah_Haha_Haha'), 'ILikeBaiduOhYeahHahaHaha');
}); // 5

test("", function(){
	equals(baidu.string.toCamelCase('ilikebaiduohyeahhahahaha'), 'ilikebaiduohyeahhahahaha');
	equals(baidu.string.toCamelCase('ILikeBaiduOhYeahHahaHaha'), 'ILikeBaiduOhYeahHahaHaha');
}); // 6

//describe("baidu.String.toCamelCase测试",{
//    "输入中划线连字的字符":function (){
//        value_of(baidu.string.toCamelCase('i-like-baidu')).should_be('iLikeBaidu');
//		value_of(baidu.string.toCamelCase('I-Like-Baidu')).should_be('ILikeBaidu');
//    },
//    "两个下划线或中划线":function (){
//        value_of(baidu.string.toCamelCase('i--like--baidu')).should_be('i-Like-Baidu');
//        value_of(baidu.string.toCamelCase('i__like__baidu')).should_be('i_Like_Baidu');
//    },
//    "开头有下划线或中划线":function (){
//        value_of(baidu.string.toCamelCase('-like-baidu')).should_be('LikeBaidu');
//        value_of(baidu.string.toCamelCase('_like_baidu')).should_be('LikeBaidu');
//    },
//    "输入下划线连字的字符":function (){
//        value_of(baidu.string.toCamelCase('i_like_baidu')).should_be('iLikeBaidu');
//		value_of(baidu.string.toCamelCase('I_Like_Baidu')).should_be('ILikeBaidu');
//    },
//	 "下划线和中划线并存":function (){
//        value_of(baidu.string.toCamelCase('i-like_baidu-oh-yeah_haha_haha')).should_be('iLikeBaiduOhYeahHahaHaha');
//		value_of(baidu.string.toCamelCase('I_Like_Baidu-Oh-Yeah_Haha_Haha')).should_be('ILikeBaiduOhYeahHahaHaha');
//    },
//	"没有下划线和中划线":function (){
//        value_of(baidu.string.toCamelCase('ilikebaiduohyeahhahahaha')).should_be('ilikebaiduohyeahhahahaha');
//		value_of(baidu.string.toCamelCase('ILikeBaiduOhYeahHahaHaha')).should_be('ILikeBaiduOhYeahHahaHaha');
//    }
//});
