module("baidu.lang.register");

function myClass(option) {
	this.name = "myclass";
	this.givenName = option.givenName;
	this.getInfo = option.getInfo;
}

test("constructorHook", function(){
	expect(4);
	stop();
	ua.importsrc("baidu.lang.createClass", function(){
		var getInfo = function(){
			ok(true, "The getInfo() is apply");
			return this.givenName;
		}
		var NewClass = baidu.lang.createClass(myClass);
		baidu.lang.register(NewClass, getInfo);
		var sObject = new NewClass({
			givenName: 'Jim',
			getInfo: getInfo
		});
		
		equals(sObject.getInfo(), "Jim", "getInfo");
		equals(sObject.givenName, "Jim", 'givenName');
		start();
	}, "baidu.lang.createClass", "baidu.lang.register");
});

test("methods", function(){
	expect(3);
	stop();
	ua.importsrc("baidu.lang.createClass", function(){
		var getInfo = function(){
			return this.givenName;
		}
		var NewClass = baidu.lang.createClass(myClass);
		baidu.lang.register(NewClass, getInfo, {
			testmethod : function(){
				return this.givenName;
			}
		});
		var sObject = new NewClass({
			givenName: 'Jim',
			getInfo: getInfo
		});

		equals(sObject.getInfo(), "Jim", "getInfo");
		equals(sObject.givenName, "Jim", 'givenName');
		equals(sObject.testmethod(), "Jim", "testmethod");
		start();
	}, "baidu.lang.createClass", "baidu.lang.register");
});
