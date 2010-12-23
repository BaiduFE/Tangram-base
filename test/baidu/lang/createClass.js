module("baidu.lang.createClass");

function myClass(option) {
	this.name = "myclass";
	// baidu.lang.Class.call(this); 
	// 继承构造器，guid是在baidu.lang.Class的构造函数中生成的
	this.givenName = option.givenName;
	this.company = option.company;
	this.salary = option.salary;
	this.getInfo = option.getInfo;
}

test("default parent class", function(){
	var NewClass = baidu.lang.createClass(myClass);
	var sObject = new NewClass({
		givenName: 'Jim',
		company: 'baidu',
		salary: 10000,
		getInfo: function(){
			return this.company + ' emploee ' + this.givenName + ' can get money ' + this.salary;
		}
	});
	
	equals(sObject.getInfo(), "baidu emploee Jim can get money 10000", 'sObject.getInfo() = "baidu emploee Jim can get money 10000"');
	equals(sObject.givenName, "Jim", 'givenName = "Jim"');
	equals(sObject.salary, 10000, 'salary = 10000');
	equals(sObject.company, "baidu", '');
	equals(sObject instanceof NewClass, true, 'sObject instanceof NewClass is true');
	equals(sObject instanceof myClass, false, 'sObject instanceof myClass is false'); // sObject is not instance of myClass
	equals(sObject instanceof baidu.lang.Class, true, 'sObject instanceof baidu.lang.Class is true');
});

test("specific parent class point to baidu.lang.Class", function(){
	var NewClass = baidu.lang.createClass(myClass, new function(){
		baidu.lang.Class.call(this);
	});
	
	var sObject = new NewClass({
		givenName: 'Jim',
		company: 'baidu',
		salary: 10000,
		getInfo: function(){
			return this.company + " employee " + this.givenName + " can get money " + this.salary;
		}
	});
	equals(sObject.getInfo(), "baidu employee Jim can get money 10000", 'sObject.getInfo() = "baidu employee Jim can get money 10000"');
	equals(sObject.givenName, "Jim", 'givenName = "Jim"');
	equals(sObject.salary, 10000, 'salary = 10000');
	equals(sObject.company, "baidu", '');
	equals(sObject instanceof NewClass, true, 'sObject instanceof NewClass is true');
	equals(sObject instanceof myClass, false, 'sObject instanceof myClass is false'); // sObject is not instance of myClass
	equals(sObject instanceof baidu.lang.Class, true, 'sObject instanceof baidu.lang.Class is true');
});

test("specific parent class", function(){
	var NewClass = baidu.lang.createClass(myClass, new function(){
	});
	
	var sObject = new NewClass({
		givenName: 'Jim',
		company: 'baidu',
		salary: 10000,
		getInfo: function(){
			return this.company + ' employee ' + this.givenName + ' can get money ' + this.salary;
		}
	});
	
	equals(sObject.getInfo(), "baidu employee Jim can get money 10000", 'sObject.getInfo() = "baidu employee Jim can get money 10000"');
	equals(sObject.givenName, "Jim", 'givenName = "Jim"');
	equals(sObject.salary, 10000, 'salary = 10000');
	equals(sObject.company, "baidu", '');
	equals(sObject instanceof NewClass, true, 'sObject instanceof NewClass is true');
	equals(sObject instanceof myClass, false, 'sObject instanceof myClass is false'); // sObject is not instance of myClass
	equals(sObject instanceof baidu.lang.Class, true, 'sObject instanceof baidu.lang.Class is true');
});

test("option param", function(){
	function superClass(){
		this.superClassname = "superMyclass";
		ok(true,"to superClass !");
	}
	var NewClass = baidu.lang.createClass(myClass, {superClass:superClass});
	
	var sObject = new NewClass({
		givenName: 'Jim',
		company: 'baidu',
		salary: 10000,
		getInfo: function(){
			return this.company + ' employee ' + this.givenName + ' can get money ' + this.salary;
		}
	});
	equal(sObject.superClassname,new superClass().superClassname,"this is superClassname");
});

test("class extend", function(){
	function superClass(){
		this.superClassname = "superMyclass";
	}
	function extendFunc(){
		return "extend function";
	}
	var NewClass = baidu.lang.createClass(myClass, {superClass:superClass}).extend({extend:extendFunc});
	var sObject = new NewClass({
		givenName: 'Jim',
		company: 'baidu',
		salary: 10000,
		getInfo: function(){
			return this.company + " employee " + this.givenName + " can get money " + this.salary;
		}
	});
	equal(sObject.extend(),extendFunc(),"extend is success");
});




//describe('baidu.lang.createClass', {
//	'default parent class' : function() {
//		var NewClass = baidu.lang.createClass(myClass);
//		var sObject = new NewClass( {
//			givenName : 'Jim',
//			company : 'baidu',
//			salary : 10000,
//			getInfo : function() {
//				return this.company + ' employee ' + this.givenName
//						+ ' can get money ' + this.salary;
//			}
//		});
//		value_of(sObject.getInfo()).should_be(
//				'baidu employee Jim can get money 10000');
//		value_of(sObject.givenName).should_be('Jim');
//		value_of(sObject.salary).should_be(10000);
//		value_of(sObject.company).should_be('baidu');
//		value_of(sObject instanceof NewClass).should_be_true();
////		value_of(sObject instanceof MyClass).should_be_true();
//		value_of(sObject instanceof baidu.lang.Class).should_be_true();
//	},
//	'specific parent class point to baidu.lang.Class' : function() {
//		var NewClass = baidu.lang.createClass(myClass, new function() {
//			baidu.lang.Class.call(this);
//		});
//		var sObject = new NewClass( {
//			givenName : 'Jim',
//			company : 'baidu',
//			salary : 10000,
//			getInfo : function() {
//				return this.company + ' employee ' + this.givenName
//						+ ' can get money ' + this.salary;
//			}
//		});
//		value_of(sObject.getInfo()).should_be(
//				'baidu employee Jim can get money 10000');
//		value_of(sObject.givenName).should_be('Jim');
//		value_of(sObject.salary).should_be(10000);
//		value_of(sObject.company).should_be('baidu');
//		value_of(sObject instanceof NewClass).should_be_true();
////		value_of(sObject instanceof MyClass).should_be_true();
//		value_of(sObject instanceof baidu.lang.Class).should_be_true();
//	},
//	'specific parent class' : function() {
//		var NewClass = baidu.lang.createClass(myClass, new function() {
//		});
//		var sObject = new NewClass( {
//			givenName : 'Jim',
//			company : 'baidu',
//			salary : 10000,
//			getInfo : function() {
//				return this.company + ' employee ' + this.givenName
//						+ ' can get money ' + this.salary;
//			}
//		});
//		value_of(sObject.getInfo()).should_be(
//				'baidu employee Jim can get money 10000');
//		value_of(sObject.givenName).should_be('Jim');
//		value_of(sObject.salary).should_be(10000);
//		value_of(sObject.company).should_be('baidu');
//		value_of(sObject instanceof NewClass).should_be_true();
////		value_of(sObject instanceof MyClass).should_be_true();
//		value_of(sObject instanceof baidu.lang.Class).should_be_true();
//	}
//});
