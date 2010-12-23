module("baidu.lang.isBoolean");

test("类型覆盖校验",function(){
	// 空对象
    ok(!baidu.lang.isBoolean(),"empty obj is not boolean");
    // 字符串
    ok(!baidu.lang.isBoolean("test"),"string is not boolean");
    // 数字
    ok(!baidu.lang.isBoolean(123),"number is not boolean");
    // 布尔
    ok(baidu.lang.isBoolean(true),"bool is boolean");
    // 空
    ok(!baidu.lang.isBoolean({}),"empty is not boolean");
    // 数组
    ok(!baidu.lang.isBoolean([]),"array is not boolean");
    // undefine
    ok(!baidu.lang.isBoolean(void(0)),"undefined is not boolean");
    // 快捷方式
   ok(!baidu.lang.isBoolean(baidu),"short cut is not boolean");
});
