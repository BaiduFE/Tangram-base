module("baidu.lang.createSingle");

//import("baidu.lang.instance");

test("with params", function(){
	var so = baidu.lang.createSingle({
		givenName: 'Jim',
		company: 'baidu',
		salary: 10000,
		getInfo: function(){
			return this.company + ' employee ' + this.givenName + ' can get money ' + this.salary;
		}
	});
	
	equals(so.getInfo(), "baidu employee Jim can get money 10000", 'so.getInfo() = "baidu employee Jim can get money 10000"');
	equals(so.givenName, "Jim", 'so.givenName = "Jim"');
	equals(so.salary, 10000, 'so.salary = 10000');
	equals(so.company, "baidu", 'so.company = "baidu"');
	equals(so instanceof baidu.lang.Class, true, 'so instanceof baidu.lang.Class is true');
//	var i = so.guid;
//	baidu.lang.decontrol(i);
//	equals(baidu.lang.instance(i), null, 'baidu.lang.instance(i) = null'); // include src.baidu.lang.instance.js
});

test("without params", function(){
	var so = baidu.lang.createSingle({test:"test"});
	equals(so.test, "test", 'so.test = "test"');
	equals(so.test1, undefined, 'so.test1 = undefined');
	equals(so instanceof baidu.lang.Class, true, 'so instanceof baidu.lang.Class is true');
	
//	var i = so.guid;
//	baidu.lang.decontrol(i);
//	equals(baidu.lang.instance(i), null, 'baidu.lang.instance(i) = null');
});

//describe('baidu.lang.createSingle', {
//	'with params' : function() {
//		var so = baidu.lang.createSingle( {
//			givenName : 'Jim',
//			company : 'baidu',
//			salary : 10000,
//			getInfo : function() {
//				return this.company + ' employee ' + this.givenName
//						+ ' can get money ' + this.salary;
//			}
//		});
//		value_of(so.getInfo()).should_be(
//				'baidu employee Jim can get money 10000');
//		value_of(so.givenName).should_be('Jim');
//		value_of(so.salary).should_be(10000);
//		value_of(so.company).should_be('baidu');
//		value_of(so instanceof baidu.lang.Class).should_be_true();
//		var i = so.guid;
//		baidu.lang.decontrol(i);
//		value_of(baidu.lang.instance(i)).should_be_null();
//	},
//	'without params' : function() {
//		var so = baidu.lang.createSingle({test:'test'});
//		value_of(so.test).should_be('test');
//		value_of(so.test1).should_be_undefined();
//		value_of(so instanceof baidu.lang.Class).should_be_true();
//		var i = so.guid;
//		baidu.lang.decontrol(i);
//		value_of(baidu.lang.instance(i)).should_be_null();
//	}
//});
