
module("baidu.number.comma测试");

/*
 * <li> n : number
 * <li> L : length of number
 * <li> r : baidu.number.comma(n, L), L can be omitted
 * <li> default : 3 integer numbers for each array
 */

test("comma函数输入数字number和length=1", function(){
	n = 3421.002547;
	L = 1;
	r = baidu.number.comma(n, L);
	
	equals(r, "3,4,2,1.002547");
}); // 1

test("comma函数输入数字number和length=4", function(){
	n = 3421.002547;
	L = 4;
	r = baidu.number.comma(n, L);
	
	equals(r, "3421.002547");
}); // 2

test("comma函数输入数字number和length=0", function(){
	n = 3421.002547;
	L = 0; //输入0，则默认用3为分割
	r = baidu.number.comma(n, L);
	
	equals(r, "3,421.002547");
}); // 3

test("comma函数输入数字number和length=-1", function(){
	n = 3421.002547;
	L = -1; //输入负数，默认用三位分
	r = baidu.number.comma(n, L);
	
	equals(r, "3,421.002547");
}); // 4

test("comma函数输入长整数", function(){
	n = 198554649981.315  //检查长整数
	L = 5;
	r = baidu.number.comma(n, L);
	
	equals(r, "19,85546,49981.315");
}); // 5

test("comma函数输入数字number，省略Length", function(){
	n = 31245897  //检查长整数
	r = baidu.number.comma(n);
	
	equals(r, "31,245,897");
}); // 6

test("comma函数输入数字number，省略Length", function(){
	n = 32.698547256  //检查长整数
	r = baidu.number.comma(n);
	
	equals(r, "32.698547256");
}); // 7
