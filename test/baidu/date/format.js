//baidu.date.format的测试

module("baidu.date.format")

test("只有年月日",function(){
	expect(11);
	var date = new Date(2010,8,3);//月份日期为1位数
	var dateFormat = baidu.date.format(date,"yyyy-M-d");//年用4位表示
	equal(dateFormat,"2010-9-3");
	dateFormat = baidu.date.format(date,"yyyy-MM-d");
	equal(dateFormat,"2010-09-3");
	dateFormat = baidu.date.format(date,"yyyy-MM-dd");
	equal(dateFormat,"2010-09-03");
	dateFormat = baidu.date.format(date,"yy-MM-d");//年用2位表示
	equal(dateFormat,"10-09-3");
	
	date = new Date(2009,11,20);//月份日期为2位数
	dateFormat = baidu.date.format(date,"yyyy-M-d");
	equal(dateFormat,"2009-12-20");
	dateFormat = baidu.date.format(date,"yy-MM-d");
	equal(dateFormat,"09-12-20");
	dateFormat = baidu.date.format(date,"yy-MM-dd");
	equal(dateFormat,"09-12-20");
	dateFormat = baidu.date.format(date,"yy-M-d");
	equal(dateFormat,"09-12-20");
	dateFormat = baidu.date.format(date,"M-d");
	equal(dateFormat,"12-20");
	
	dateFormat = baidu.date.format(date,"yyyy年MM月dd日");//中文格式
	equal(dateFormat,"2009年12月20日");
	dateFormat = baidu.date.format(date,"yyyy/MM/dd");//斜线
	equal(dateFormat,"2009/12/20");
	
});

test("24小时制",function(){
	expect(8);
	var date = new Date(2010,9,3,2,2,9,568);//没有超过12点
	var dateFormat = baidu.date.format(date,"yyyy-MM-dd HH:mm:ss");
	equal(dateFormat,"2010-10-03 02:02:09","均采用2位表示");
	dateFormat = baidu.date.format(date,"yyyy-MM-dd H:mm:ss");
	equal(dateFormat,"2010-10-03 2:02:09","时采用1位表示");
	dateFormat = baidu.date.format(date,"yyyy-MM-dd HH:m:ss");
	equal(dateFormat,"2010-10-03 02:2:09","分采用1位表示");
	dateFormat = baidu.date.format(date,"yyyy-MM-dd HH:mm:s");
	equal(dateFormat,"2010-10-03 02:02:9","秒采用1位表示");
	dateFormat = baidu.date.format(date,"yyyy-MM-dd H:m:s");
	equal(dateFormat,"2010-10-03 2:2:9","均采用1位表示");
	
	date = new Date(2010,8,15,16,15,47,256);//超过12点
	dateFormat = baidu.date.format(date,"yyyy-MM-dd HH:mm:ss");
	equal(dateFormat,"2010-09-15 16:15:47","超过12点，HH:mm:ss");
	dateFormat = baidu.date.format(date,"yy-MM-dd H:m:s");
	equal(dateFormat,"10-09-15 16:15:47","超过12点，H:m:s");
	dateFormat = baidu.date.format(date,"M/dd H:m:s");//斜线
	equal(dateFormat,"9/15 16:15:47");
});

test("12小时制",function(){
	expect(9);
	var date = new Date(2010,9,3,2,2,9,568);//没有超过12点
	var dateFormat = baidu.date.format(date,"yyyy-MM-dd hh:mm:ss");
	equal(dateFormat,"2010-10-03 02:02:09","均采用2位表示");
	dateFormat = baidu.date.format(date,"yyyy-MM-dd h:mm:ss");
	equal(dateFormat,"2010-10-03 2:02:09","时采用1位表示");
	dateFormat = baidu.date.format(date,"yyyy-MM-dd hh:m:ss");
	equal(dateFormat,"2010-10-03 02:2:09","分采用1位表示");
	dateFormat = baidu.date.format(date,"yyyy-MM-dd hh:mm:s");
	equal(dateFormat,"2010-10-03 02:02:9","秒采用1位表示");
	dateFormat = baidu.date.format(date,"yyyy-MM-dd h:m:s");
	equal(dateFormat,"2010-10-03 2:2:9","均采用1位表示");
	
	date = new Date(2010,8,15,16,15,47,256);//超过12点,强制转换为12小时制
	dateFormat = baidu.date.format(date,"yyyy-MM-dd hh:mm:ss");
	equal(dateFormat,"2010-09-15 04:15:47","超过12点，hh:mm:ss");
	dateFormat = baidu.date.format(date,"yyyy-MM-dd h:m:s");
	equal(dateFormat,"2010-09-15 4:15:47","超过12点，h:m:s");
	
	dateFormat = baidu.date.format(date,"yyyy/M/dd h:m:s");//斜线
	equal(dateFormat,"2010/9/15 4:15:47");
	
	dateFormat = baidu.date.format(date,"M/dd hh:m:s");//斜线
	equal(dateFormat,"9/15 04:15:47");
});

test("测试异常,返回date的toString",function(){
	expect(1);
	var date = new Date(2010,9,3,2,2,9,568);//没有超过12点
	var dateFormat = baidu.date.format(date,new Object());
	equal(dateFormat,date.toString());
});


