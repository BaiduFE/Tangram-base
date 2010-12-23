module('baidu.dom.setStyles');

test("set styles",function(){

	baidu.dom._styleFixer["float"] = ua.browser.ie ? "styleFloat" : "cssFloat";
	expect(4);
	var div = document.createElement('div');
	var img = document.createElement('img');
	document.body.appendChild(div);
	div.appendChild(img);
	img.id = 'img_id';
	baidu.dom.setStyles(img,{color:"red",float:'left',display:"", opacity:"0.2"});
	
	var color = $.trim(img.style.color.toLowerCase());
	ok(color=='red'||color=='rgb(255,0,0)'||color=='#ff0000','color red');
	equal(img.style.display,"",'get img display style');
	equal($(img).css('float'),'left','get img float');
	ok(img.style.opacity=='0.2'||img.filters.alpha.opacity== 20,'get img opacity');
	document.body.removeChild(div);
});

test("shortcut",function(){
	expect(4);
	var div = document.createElement('div');
	var img = document.createElement('img');
	document.body.appendChild(div);
	div.appendChild(img);
	img.id = 'img_id';
	baidu.setStyles(img,{color:"red",float:'left',display:"", opacity:"0.2"});
	
	var color = $.trim(img.style.color.toLowerCase());
	ok(color=='red'||color=='rgb(255,0,0)'||color=='#ff0000','color red');
	equal(img.style.display,"",'get img display style');
	equal($(img).css('float'),'left','get img float');
	ok(img.style.opacity=='0.2'||img.filters.alpha.opacity== 20,'get img opacity');
	document.body.removeChild(div);
});

//describe('baidu.dom.setStyles测试', {
//    '通过Json方式设置多个样式值': function() {    
//        var sStyles; 
//        if (baidu.browser.ie){
//            //包含filter属性，在IE中跑
//            sStyles = {"width":80, "filter":"blur(add=true,direction=90,strength=6)", 
//                "z-index":-5, "font-size": "20pt", "opacity": 0.5};
//        }
//        else {
//            //不包含filter属性，在其他浏览器中跑
//            sStyles = {"width":80, "z-index":-5, "font-size": "20pt", "opacity": 0.5};
//        }
//        var oP2 = baidu.dom.g("p2_ss");
//
//        baidu.dom.setStyles(oP2, sStyles);
//        value_of(oP2.style.width).should_be("80px");
//        if (baidu.browser.ie){
//            if("filter" in oP2.style) {
//                //用baidu.dom.getStyle在firefox下不行
//                value_of(baidu.dom.getStyle(oP2, "filter")).
//                    should_match(/blur\(add=true,direction=90,strength=6\)(alpha\(opacity=50\))?/);
//                value_of(oP2.style.filter).
//                    should_match(/blur\(add=true,direction=90,strength=6\)(alpha\(opacity=50\))?/);
//            }
//        }
//        value_of(oP2.style.zIndex).should_be(-5);
//        value_of(oP2.style.fontSize).should_be("20pt");
//        if("opacity" in oP2.style) {
//            if("filter" in oP2.style && !oP2.style.filter.match(/opacity/)) {
//                value_of(oP2.style.opacity).should_be(0.5);
//            }
//        }
//        
//
//        var oUl = baidu.dom.g("ul1_ss");
//
//        value_of(oUl.style.listStyle).should_match("decimal inside");
//        sStyles = {"list-style":"upper-alpha outside none", "visibility": "hidden"};
//		//function &快捷方式
//        baidu.setStyles(oUl, sStyles);
//        value_of(oUl.style.listStyleType).should_be("upper-alpha");
//        value_of(oUl.style.listStylePosition).should_be("outside");
//        value_of(oUl.style.listStyleImage).should_be("none");
//        value_of(oUl.style.visibility).should_be("hidden");
//    }
//});