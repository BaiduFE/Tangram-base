module("baidu.dom.show")

test('Element',function(){
	expect(4);
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.id = 'div_id';
	equal(div.style.display,"","div display is show");
	baidu.dom.show(div);
	equal(div.style.display,"",'after show');
	div.style.display = "none";
	equal(div.style.display,"none",'change display of div');
	baidu.dom.show(div);
	equal(div.style.display,"",'show again');
	document.body.removeChild(div);
})

test('id',function(){
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.id = 'div_id';
	equal(div.style.display,"","div display is show");
	baidu.dom.show('div_id');
	equal(div.style.display,"","div display after show");
	div.style.display ='none';
	baidu.dom.show('div_id');
	equal(div.style.display,"",'after show');
	document.body.removeChild(div);
})

test('shortcut',function(){
	expect(3);
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.id = 'div_id';
	baidu.show('div_id');
	
	equal(div.style.display,"",'after hide');
	div.style.display = "none";
	equal(div.style.display,"none",'back to hide');
	baidu.show(div);
	equal(div.style.display,"",'show again');
	document.body.removeChild(div);
})


//describe('baidu.dom.show测试', {
//    '将隐藏的元素显示': function() {
//        var oDiv2 = baidu.dom.g("div2_show");
//        var oDiv3 = baidu.dom.g("div3_show");
//
//        //显示用style方式隐藏的元素
//        value_of(oDiv2.style.display).should_be("none");
//        baidu.dom.show("div2_show");
//        value_of(oDiv2.style.display).should_be("");
//
//        //显示用css方式设置的隐藏元素
//        /*
//        value_of(oDiv3).should_not_be_null();
//        var oCSSRules = document.styleSheets[0].cssRules || document.styleSheets[0].rules;
//        value_of(oCSSRules).should_not_be_null();
//        value_of(oCSSRules[0].selectorText).should_be(".class-show");
//        value_of(oCSSRules[0].style.display).should_be("none");
//        baidu.dom.show(oDiv3);
//        value_of(oCSSRules[0].style.display).should_be("");
//        */
//    }/*,1.0.1版本中已不支持多个参数的情况
//	'将多个隐藏元素同时显示': function() {
//		var oDiv4 = baidu.dom.g("div4_show");
//
//		value_of(oDiv4.style.display).should_be("none");
//		value_of(baidu.dom.g("div5_show").style.display).should_be("none");
//		baidu.dom.show(oDiv4, "div5_show");
//		value_of(oDiv4.style.display).should_be("");
//		value_of(baidu.dom.g("div5_show").style.display).should_be("");
//	}*/
//});