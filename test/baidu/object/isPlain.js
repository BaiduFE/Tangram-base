module("baidu.object.isPlain");

test("基本用例", function(){
    var fn = baidu.object.isPlain,
        fun = function(){},
        children = function(){
            fun.call(this);
        };
	equals(false, fn(""), "1");
	equals(false, fn(1), "1");
	equals(true, fn(new Object()), "2");
	equals(true, fn({}), "3");
	equals(false, fn(new fun()), "函数");
	equals(false, fn(window), "5");
	equals(false, fn(document), "6");
	equals(false, fn(new children()), "7");
	equals(false, fn(new Number()), "8");
	equals(false, fn(new Object(3)), "9");
});

