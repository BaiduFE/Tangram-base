//baidu.date.parse测试
module("baidu.date.parse")

test("采用斜线分隔",function(){
	expect(6);
	var date = baidu.date.parse("98/6/25");
	equal(date.getFullYear(),1998);
	equal(date.getMonth(),5);
	equal(date.getDate(),25);
	date = baidu.date.parse("98/10/25");
	equal(date.getFullYear(),1998);
	equal(date.getMonth(),9);
	equal(date.getDate(),25);
})

test("采用短横分隔",function(){
	expect(6);
	var date = baidu.date.parse("2007-10-23");
	equal(date.getFullYear(),2007);
	equal(date.getMonth(),9);
	equal(date.getDate(),23);
	
	date = baidu.date.parse("98-11-25");//年份2位时必须大于70
	equal(date.getFullYear(),1998);
	equal(date.getMonth(),10);
	equal(date.getDate(),25);
});

test("采用空格分隔",function(){
	var d;
	
	if (!ua.browser.opera) {
        //opera浏览器下这个case有问题，主要原因是百度JS仅实现了“-”分隔符的日期，
        //其他的分隔符由浏览器本身来决定的，具体见讨论区
		expect(16);
            d = baidu.date.parse("May 8 1991"); // 在这个类型的输入中，遍历月份表示的十二个月
            equal(d.getFullYear(),1991);
            equal(d.getMonth(),4);
            equal(d.getDate(),8);
            d = baidu.date.parse("Jan 8 1991");
            equal(d.getMonth(),0);
            d = baidu.date.parse("Feb 8 1991");
            equal(d.getMonth(),1);
            d = baidu.date.parse("Mar 8 1991");
            equal(d.getMonth(),2);
            d = baidu.date.parse("Apr 8 1991");
            equal(d.getMonth(),3);
            d = baidu.date.parse("Jun 8 1991");
            equal(d.getMonth(),5);
            d = baidu.date.parse("Jul 8 1991");
            equal(d.getMonth(),6);
            d = baidu.date.parse("Aug 8 1991");
            equal(d.getMonth(),7);
            d = baidu.date.parse("Sept 8 1991");
            equal(d.getMonth(),8);
            d = baidu.date.parse("Oct 8 1991");
            equal(d.getMonth(),9);
            d = baidu.date.parse("Nov 8 1991");
            equal(d.getMonth(),10);
            d = baidu.date.parse("Dec 8 1991");
            equal(d.getMonth(),11);
            var d2 = baidu.date.parse("Jan     8       92");//多个分隔符
            equal(d2.getMonth(),0);
            equal(d2.getFullYear(),1992);
            
        }
})

test("逗号分隔",function(){
	var d;
//	if (!baidu.browser.opera && !baidu.browser.safari) {
	if(!ua.browser.opera && !ua.browser.safari){
		expect(17);
        //opera、Safari浏览器下这个case有问题，主要原因是百度JS仅实现了“-”分隔符的日期，
        //其他的分隔符由浏览器本身来决定的，具体见讨论区
        d = baidu.date.parse("8,May,91");// 在这个类型的输入中，遍历月份表示的十二个月，逗号分隔
        equal(d.getFullYear(),1991);
        equal(d.getMonth(),4);
        equal(d.getDate(),8);
        
        d = baidu.date.parse("8,Jan,91");
        equal(d.getMonth(),0);

        d = baidu.date.parse("8,Feb,91");
        equal(d.getMonth(),1);
        d = baidu.date.parse("8,Mar,91");
        equal(d.getMonth(),2);
        d = baidu.date.parse("8,Apr,91");
        equal(d.getMonth(),3);
        d = baidu.date.parse("8,Jun,91");
        equal(d.getMonth(),5);
        d = baidu.date.parse("8,Jul,91");
        equal(d.getMonth(),6);
        d = baidu.date.parse("8,Aug,91");
        equal(d.getMonth(),7);
        d = baidu.date.parse("8,October,91");
        equal(d.getMonth(),9);
        d = baidu.date.parse("8,Sept,91");
        equal(d.getMonth(),8);
        d = baidu.date.parse("8,Nov,91");
        equal(d.getMonth(),10);
        d = baidu.date.parse("8,Dec,91");
        equal(d.getMonth(),11);
        
        d = baidu.date.parse("8,,,Dec,,,,,2009");//多个分隔符
        equal(d.getFullYear(),2009);
        equal(d.getMonth(),11);
        equal(d.getDate(),8);
	}
})

test("用空格分隔，但是年月日顺序改变",function(){
	var d;
	
	 if (!ua.browser.opera && !ua.browser.webkit) {
		 expect(18);
            //opera、chrome、Safari浏览器下这个case有问题，主要原因是百度JS仅实现了“-”分隔符的日期，
            //其他的分隔符由浏览器本身来决定的，具体见讨论区
            d = baidu.date.parse("92 April 14");// 在这个类型的输入中，年月日顺序变化
            equal(d.getMonth(),3);
            equal(d.getDate(),14);
            equal(d.getFullYear(),1992);
            
            d = baidu.date.parse("2004 14 Feb");
            equal(d.getMonth(),1);
            equal(d.getDate(),14);
            equal(d.getFullYear(),2004);
            
            d = baidu.date.parse("Jan 2006 1");
            equal(d.getMonth(),0);
            equal(d.getDate(),1);
            equal(d.getFullYear(),2006);
            
            d = baidu.date.parse("Ju 14 99");
            equal(d.getMonth(),6);
            equal(d.getDate(),14);
            equal(d.getFullYear(),1999);
            
            d = baidu.date.parse("30 Mar 2002");
            equal(d.getMonth(),2);
            equal(d.getDate(),30);
            equal(d.getFullYear(),2002);
            
            d = baidu.date.parse("20 Sept 2003");
            equal(d.getMonth(),8);
            equal(d.getDate(),20);
            equal(d.getFullYear(),2003);
	 }
})
test("Ju解释为7月",function(){
	var d;
	if (!ua.browser.webkit && !ua.browser.opera) {
		expect(1);
            //webkit内核（chrome、Safari）的浏览器下这个case不通过，主要原因是百度JS仅实现了“-”分隔符的日期，
            //其他的分隔符由浏览器本身来决定的，具体见讨论区
            d = baidu.date.parse("2008 1 Ju"); //Ju解释成为7月
            equal(d.getMonth(),6);
        }
})

test("错误的星期",function(){
	expect(2);
	   var d = baidu.date.parse("Fri 31 Aug 2010"); //星期输入错误
        equal(d.getDay(),2);//星期二
        equal(d.getMonth(),7);
})

test("输入完整的年月日时分秒",function(){
	var d;
	expect(6);
	d = baidu.date.parse("16 Jun 2009 1:10:9 ");
    equal(d.getDate(),16);
    equal(d.getMonth(),5);
    equal(d.getFullYear(),2009);
    equal(d.getHours(),1);
    equal(d.getMinutes(),10);
    equal(d.getSeconds(),9);
})

test("输入的小时信息带pm",function(){
	var d;
	if (!ua.browser.safari) {
		expect(6);
        //opera、chrome、Safari浏览器下这个case有问题，主要原因是百度JS仅实现了“-”分隔符的日期，
        //其他的分隔符由浏览器本身来决定的，具体见讨论区
        d = baidu.date.parse("2:34 pm Jun 16 2009");
        equal(d.getDate(),16);
        equal(d.getMonth(),5);
        equal(d.getFullYear(),2009);
        equal(d.getHours(),14);
        equal(d.getMinutes(),34);
        equal(d.getSeconds(),0);
    }
})

test("输入的小时信息带am",function(){
	var d;
	 if (!ua.browser.safari) {
		 expect(6);
         //Safari浏览器下这个case有问题，主要原因是百度JS仅实现了“-”分隔符的日期，
         //其他的分隔符由浏览器本身来决定的，具体见讨论区
         d = baidu.date.parse("2:34 am Jun 16 2009");
         equal(d.getDate(),16);
         equal(d.getMonth(),5);
         equal(d.getFullYear(),2009);
         equal(d.getHours(),2);
         equal(d.getMinutes(),34);
         equal(d.getSeconds(),0);
	 }
})
