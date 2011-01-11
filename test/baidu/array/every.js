module("baidu.array.every");

test("基础校验", function(){
    var source = [1,2,3, '4'];

    equals(baidu.array.every(source, function(item, i){
        if(typeof item == 'string')
            return true;
    }), false,  "基础校验");
});
