module("baidu.array.some");

test("基础校验", function(){
    var source = [1,2,3, '4'];

    equals(baidu.array.some(source, function(item, i){
        if(typeof item == 'string')
            return true;
    }), true,  "基础校验");
});
