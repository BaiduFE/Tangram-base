module("baidu.number.randomInt");

test("base", function(){
	equals(baidu.number.randomInt(0, 0), 0);
	ok(baidu.number.randomInt(0, 10)<10, "check random int");
	var arr = [];
	for(var i = 0; i < 20; i++){
		arr[i] = baidu.number.randomInt(0, 9);
		ok(arr[i]<10, "check random int : " + arr[i]);
	}
});