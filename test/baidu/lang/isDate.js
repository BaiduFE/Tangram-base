module("baidu.lang.isDate");

test("日期校验",function(){
	expect(1);
	ok(baidu.lang.isDate(new Date()),"new Date is date");
});

test("类型覆盖校验",function(){
	// 空对象
    ok(!baidu.lang.isDate(),"empty obj is not boolean");
    // 字符串
    ok(!baidu.lang.isDate("test"),"string is not boolean");
    // 数字
    ok(!baidu.lang.isDate(123),"number is not boolean");
    // 布尔
    ok(!baidu.lang.isDate(true),"bool is boolean");
    // 空
    ok(!baidu.lang.isDate({}),"empty is not boolean");
    // 数组
    ok(!baidu.lang.isDate([]),"array is not boolean");
    // undefine
    ok(!baidu.lang.isDate(void(0)),"undefined is not boolean");
    // 快捷方式
   ok(!baidu.lang.isDate(baidu),"short cut is not boolean");
})
