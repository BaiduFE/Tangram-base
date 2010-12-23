module("baidu.number.pad测试");

/*
 * <li> n : number
 * <li> L : length of number
 * <li> r : baidu.number.pad(n, L)
 */

test("pad函数输入数字和期望长度Length,输入number为整数", function(){
	n = 315;
    L = 5;
    r = baidu.number.pad(n,L);
    
    equals(r, "00315");
});

test("pad函数输入数字和期望长度Length,输入number为小数", function(){
	n = 3.15;    
    L = 7;
    r = baidu.number.pad(n,L);
    
    equals(r, "0003.15");
});

test("pad函数输入数字和期望长度Length,输入Length小于number的长度", function(){
	n = 315;    
    L = 1;
    r = baidu.number.pad(n,L);
    
    equals(r, "315");
});

test("pad函数输入数字和期望长度Length,输入Length等于number的长度", function(){
	n = 3.15;    
    L = 4;
    r = baidu.number.pad(n,L);
    
    equals(r, "3.15");
});

test("pad函数输入数字和期望长度Length，输入Length为负数", function(){
	n = 3.15;    
    L = -1;
    r = baidu.number.pad(n,L);
    
    equals(r, "3.15");
});

test("pad函数输入数字和期望长度Length，输入Length不是整数(字符串)", function(){
	n = 3.15;    
    L = "string";
    r = baidu.number.pad(n,L);
    
    equals(r, "3.15");
});

test("pad函数输入数字和期望长度Length，输入Length不是整数（小数）", function(){
	n = 3.15;    
	L = 3.56;
    r = baidu.number.pad(n,L);
    
    equals(r, "3.15");
});

test("pad函数输入数字为负数，Length小于number长度", function(){
	n = -23;    
	L = 1;
    r = baidu.number.pad(n,L);
    
    equals(r, "-23");
});

test("pad函数输入数字为负数，Length等于number长度", function(){
	n = -23456;    
	L = 5;
    r = baidu.number.pad(n,L);
    
    equals(r, "-23456");
});

test("pad函数输入数字为负数，Length大于number长度", function(){
	n = -23;    
	L = 5;
    r = baidu.number.pad(n,L);
    
    equals(r, "-00023");
});

test("pad函数输入数字为0", function(){
	n = 0;    
	L = 5;
    r = baidu.number.pad(n,L);
    
    equals(r, "00000");
});