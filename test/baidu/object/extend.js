module("baidu.object.extend测试");

test("拷贝属性", function(){
	var oSrc = {id:777, method:"post", "key":"value"};
	var oTarget = {};
	baidu.object.extend(oTarget, oSrc);	
	same(oTarget, {id:777, "method":"post", "key":"value"}, 'oTarget = {id:777, "method":"post", "key":"value"}');	
	same(oTarget, oSrc, "oTarget == oSrc");
	
	oTarget = {a:1, b:2};
	oSrc = {b:3, c:4};	
	//快捷方式
	var result = baidu.extend(oTarget, oSrc); //将oSrc中的属性都extend扩展到oTarget内（oTarget原有属性仍保留）	
	same(oTarget, {a:1, b:3, c:4}, "oTarget = {a:1, b:3, c:4}");	
	equals(result, oTarget, "result = oTarget"); // result = return oTarget
});

test("拷贝类属性", function(){
	//类Class1
	function Class1(){
		this.id = 1;
		this.method = "post";
		this.types = new Array("type1", "type2");
	}
	Class1.prototype.showMethod = function(){
		return this.method;
	};
	Class1.prototype.showType = function(){
		return this.types;
	};
	
	//类Class2
	function Class2(){
		this.id = 2;
		this.extend = "extend";
	}
	Class2.prototype.showMethod = function(){
		return "Error";
	};
	var oSrc = new Class1();
	var oTarget = new Class2();
	
	baidu.object.extend(oTarget, oSrc);
	
	equals(oTarget.id, 1, "oTarget.id = 1"); // id of oTarget is copied from oSrc's id
	same(oTarget.types, ["type1", "type2"], 'oTarget.types = ["type1", "type2"]');
	equals(oTarget.showMethod(), "Error", "oTarget.showMethod() = ’Error'"); // extend: only copy attributes, but not method
});



//describe('baidu.object.extend测试', {
//    '拷贝属性': function(){
//        var oSrc = {id:777, method:"post", "key": "value"};
//        var oTarget = {};
//
//        baidu.object.extend(oTarget, oSrc);
//        value_of(oTarget).should_be({id:777, "method":"post", "key": "value"});
//        value_of(oTarget).should_be(oSrc);
//
//        oTarget = {a:1, b:2};
//        oSrc = {b:3, c:4};
//		//快捷方式
//        var result = baidu.extend(oTarget, oSrc);
//        value_of(oTarget).should_be({a:1, b:3, c:4});
//        value_of(result).should_be(oTarget);
//    },
//    '拷贝类属性': function() {
//        //类Class1
//        function Class1() {
//            this.id = 1;
//            this.method = "post";
//            this.types = new Array("type1", "type2");
//        }
//        Class1.prototype.showMethod = function() {
//            return this.method;
//        };
//        Class1.prototype.showType = function() {
//            return this.types;
//        };
//        //类Class2
//        function Class2() {
//            this.id = 2;
//            this.extend = "extend";
//        }
//        Class2.prototype.showMethod = function() {
//            return "Error";
//        };
//        var oSrc = new Class1();
//        var oTarget = new Class2();
//
//        baidu.object.extend(oTarget, oSrc);
//        value_of(oTarget.id).should_be(1);
//        value_of(oTarget.types).should_be(["type1", "type2"]);
//        value_of(oTarget.showMethod()).should_be("Error");
//    }
//});