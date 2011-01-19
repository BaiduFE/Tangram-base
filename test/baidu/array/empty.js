module("baidu.array.empty");

test("基础校验", function(){
    var source = [1,2,3];
    baidu.array.empty(source);
    equals(source[0], undefined,  "基础校验");
});
