module("baidu.array.contains");

test("基础校验", function(){
    var source = [1,2,3];
    equals(baidu.array.contains(source, 1), true, "基础校验");
    equals(baidu.array.contains(source, 4), false, "基础校验");
});
