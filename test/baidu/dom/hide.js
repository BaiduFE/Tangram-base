module("baidu.dom.hide")

test('Element',function(){
	expect(4);
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.id = 'div_id';
	equal(div.style.display,"","div display is show");
	baidu.dom.hide(div);
	equal(div.style.display,"none",'after hide');
	div.style.display = "";
	equal(div.style.display,"",'change display of div');
	baidu.dom.hide(div);
	equal(div.style.display,'none','hide again');
	document.body.removeChild(div);
})

test('id',function(){
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.id = 'div_id';
	equal(div.style.display,"","div display is show");
	baidu.dom.hide('div_id');
	equal(div.style.display,"none",'after hide');
	document.body.removeChild(div);
})

test('shortcut',function(){
	expect(3);
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.id = 'div_id';
	baidu.hide('div_id');
	
	equal(div.style.display,"none",'after hide');
	div.style.display = "";
	equal(div.style.display,"",'back to show');
	baidu.hide(div);
	equal(div.style.display,"none",'hide again');
	document.body.removeChild(div);
})

//describe('baidu.dom.hide测试', {
//    '隐藏显示的元素': function() {
//        var oDiv1 = baidu.dom.g("div1_hide");
//
//        value_of(oDiv1.style.display).should_be("");
//        baidu.dom.hide(oDiv1);
//        value_of(oDiv1.style.display).should_be("none");
//
//        value_of(baidu.dom.g("div2_hide").style.display).should_be("");
//        baidu.dom.hide("div2_hide");
//        value_of(baidu.dom.g("div2_hide").style.display).should_be("none");
//
//        var oDiv3 = baidu.dom.g("div3_hide");
//        value_of(oDiv3.style.display).should_be("");
//        baidu.dom.hide(oDiv3);
//        value_of(oDiv3.style.display).should_be("none");
//    },/*1.0.1版本中已不支持多个参数的情况 
//    '同时隐藏多个元素': function() {
//		var oDiv4 = baidu.dom.g("div4_hide");
//
//		value_of(oDiv4.style.display).should_be("");
//		value_of(baidu.G("div5_hide").style.display).should_be("");
//		baidu.hide(oDiv4, "div5_hide");
//		value_of(oDiv4.style.display).should_be("none");
//		value_of(baidu.G("div5_hide").style.display).should_be("none");
//	},*/
//    '用baidu.dom.hide隐藏元素再用baidu.dom.show显示': function(){
//        var oDiv6 = baidu.dom.g("div6_hide");
//        value_of(oDiv6.style.display).should_be("");
//        baidu.dom.hide(oDiv6);
//        value_of(oDiv6.style.display).should_be("none");
//        baidu.dom.show(oDiv6);
//        value_of(oDiv6.style.display).should_be("");
//		
//		//快捷方式
//		baidu.hide(oDiv6);
//        value_of(oDiv6.style.display).should_be("none");
//        baidu.show(oDiv6);
//        value_of(oDiv6.style.display).should_be("");
//    }
//});
