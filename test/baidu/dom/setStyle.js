module("baidu.dom.setStyle");
//Import("baidu.dom._styleFixer.float");
test("set style",function(){
	baidu.dom._styleFixer["float"] = ua.browser.ie ? "styleFloat" : "cssFloat";
	expect(3);
	var div = document.createElement('div');
	var img = document.createElement('img');
	document.body.appendChild(div);
	div.appendChild(img);
	img.id = 'img_id';
	baidu.dom.setStyle(img,'width','20px');
	baidu.dom.setStyle(img,'height','10px');
	baidu.dom.setStyle('img_id','float','left');
	
	equal(img.style.height,'10px',"get img height style");
	equal(img.style.width,'20px','get img width style');
	equal($(img).css('float'),'left','get img float');
	document.body.removeChild(div);
});

test('short cut',function(){
	expect(3);
	var div = document.createElement('div');
	var img = document.createElement('img');
	document.body.appendChild(div);
	div.appendChild(img);
	img.id = 'img_id';
	baidu.setStyle(img,'width','20px');
	baidu.setStyle(img,'height','10px');
	baidu.setStyle('img_id','float','left');
	
	equal(img.style.height,'10px',"get img height style by shortcut");
	equal(img.style.width,'20px','get img width style by shortcut');
	equal($(img).css('float'),'left','get img float by shortcut');
	document.body.removeChild(div);
});

//describe('baidu.dom.setStyle测试', {
//    '通过key/value方式设置样式值': function() {
//        var oP1 = baidu.dom.g("p1_ss");
//
//        //在style里设置样式
//        value_of(oP1.style.width).should_be("");
//        baidu.dom.setStyle(oP1, "width", 50);
//        value_of(oP1.style.width).should_be("50px");
//		//function &快捷方式
//        baidu.setStyle(oP1, "width", "90%");
//        value_of(oP1.style.width).should_be("90%");
//
//        value_of(oP1.style.backgroundColor).should_be("");
//        baidu.dom.setStyle(oP1, "background-color", "#ff0000");
//        value_of(oP1.style.backgroundColor).should_match(/(#ff0000|rgb\(255, 0, 0\))/i);
//
//        //覆盖css里设置的样式
//        value_of(baidu.dom.getStyle("div1_ss", "backgroundColor")).
//            should_match(/(#00ff00|rgb\(0, 255, 0\))/i);
//        baidu.dom.setStyle("div1_ss", "background-color", "#ff0000");
//        value_of(baidu.dom.getStyle("div1_ss", "backgroundColor")).
//            should_match(/(#ff0000|rgb\(255, 0, 0\))/i);
//
//        //filter样式,为IE特有的
//        if (baidu.browser.ie){
//            if("filter" in baidu.dom.g("tb1_ss").style) {
//                var sFilter = "shadow(color=#ff0000,direction=90)";
//                baidu.dom.setStyle("tb1_ss", "filter", sFilter);
//                value_of(baidu.dom.getStyle("tb1_ss", "filter")).should_be(sFilter);
//                //value_of(baidu.dom.g("tb1_ss").style.filter).should_be(sFilter);
//                sFilter = "filter:alpha(opacity=20,finishopacity=100,style=1,startx=0, starty=0,finishx=140,finishy=270)";
//                baidu.dom.setStyle("tb1_ss", "filter", sFilter);
//                //value_of(baidu.dom.g("tb1_ss").style.filter).should_be(sFilter);
//                value_of(baidu.dom.getStyle("tb1_ss", "filter")).should_be(sFilter);
//            }
//        }
//    },
//    
//    '异常case': function() {
//        var oP3 = baidu.dom.g("p3_ss");
//
//        //添加的样式值不存在
//        baidu.dom.setStyle(oP3, "style-error", "test");
//        value_of(baidu.dom.getStyle(oP3, "style-error")).should_be("test");
//    }
//});

