module("baidu.String.wbr测试");

test("输入正常的字符", function(){
	equals(baidu.string.wbr('hello ci'), 'h<wbr>e<wbr>l<wbr>l<wbr>o<wbr> <wbr>c<wbr>i<wbr>');		
});

test("输入带有实体字符转义的字符", function(){
	equals(baidu.string.wbr('hello&nbsp;ci'), 'h<wbr>e<wbr>l<wbr>l<wbr>o<wbr>&nbsp;<wbr>c<wbr>i<wbr>');
});

test("输入带有html的字符", function(){
	equals(baidu.string.wbr('<a href="http://www.baidu.com" target="_blank">hello&nbsp;ci</a>'), '<a href="http://www.baidu.com" target="_blank">h<wbr>e<wbr>l<wbr>l<wbr>o<wbr>&nbsp;<wbr>c<wbr>i<wbr></a>');
});

test("存在<wbr>", function(){
	equals(baidu.string.wbr('<wbr>aaa<wbr>bbb&lt;wbr&gt;ccc&lt;wbr&gt;'), '<wbr>a<wbr>a<wbr>a<wbr><wbr>b<wbr>b<wbr>b<wbr>&lt;<wbr>w<wbr>b<wbr>r<wbr>&gt;<wbr>c<wbr>c<wbr>c<wbr>&lt;<wbr>w<wbr>b<wbr>r<wbr>&gt;<wbr>');
});


//describe("baidu.String.wbr测试",{
//    "输入正常的字符":function (){
//        value_of(baidu.string.wbr('hello ci')).should_be('h<wbr>e<wbr>l<wbr>l<wbr>o<wbr> <wbr>c<wbr>i<wbr>');
//    },
//
//    "输入带有实体字符转义的字符":function (){
//        value_of(baidu.string.wbr('hello&nbsp;ci')).should_be('h<wbr>e<wbr>l<wbr>l<wbr>o<wbr>&nbsp;<wbr>c<wbr>i<wbr>');
//    },
//    "输入带有html的字符":function (){
//        value_of(baidu.string.wbr('<a href="http://www.baidu.com" target="_blank">hello&nbsp;ci</a>')).should_be('<a href="http://www.baidu.com" target="_blank">h<wbr>e<wbr>l<wbr>l<wbr>o<wbr>&nbsp;<wbr>c<wbr>i<wbr></a>');
//    },
//    "存在<wbr>":function (){
//        value_of(baidu.string.wbr('<wbr>aaa<wbr>bbb&lt;wbr&gt;ccc&lt;wbr&gt;')).
//			should_be('<wbr>a<wbr>a<wbr>a<wbr><wbr>b<wbr>b<wbr>b<wbr>&lt;<wbr>w<wbr>b<wbr>r<wbr>&gt;<wbr>c<wbr>c<wbr>c<wbr>&lt;<wbr>w<wbr>b<wbr>r<wbr>&gt;<wbr>');
//    }
//});
