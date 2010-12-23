module("baidu.lang.Class");
(function() {
	/* 引入_inherits */
	var _inherits = function(subClass, superClass, className) {
		var key, proto, selfProps = subClass.prototype, clazz = new Function();

		clazz.prototype = superClass.prototype;
		proto = subClass.prototype = new clazz();
		for (key in selfProps) {
			proto[key] = selfProps[key];
		}
		subClass.prototype.constructor = subClass;
		subClass.superClass = superClass.prototype;

		// 类名标识，兼容Class的toString，基本没用
		if ("string" == typeof className) {
			proto._className = className;
		}
	};
	/*
	 * 定义一些继承与baidu.lang.Class的类
	 */
	baidu.lang.Class.prototype.owner = 'baidu';
	var Device = function() {
		baidu.lang.Class.call(this);
	};

	Device.prototype = new baidu.lang.Class();
	Device.prototype.constructor = Device;
	Device.prototype.dispose = function() {
		baidu.lang.Class.prototype.dispose.call(this);
	};

	var simpleDevice = function() {
		Device.call(this);
		this.tag = 'i am a simple device!';
	};
	_inherits(simpleDevice, Device);
	simpleDevice.prototype.dispose = function() {
		this.tag = null;
		baidu.lang.Class.prototype.dispose.call(this);

	};

	var Monitor = function(mbrand) {
		this.brand = mbrand;
		Device.call(this);
	};
	_inherits(Monitor, Device, 'Monitor_Class');
	Monitor.prototype.size = '22 inch';
	Monitor.prototype.dispose = function() {
		Device.prototype.dispose.call(this);
		this.brand = null;
		// BaseClass.prototype.dispose.call(this);
	};

	var MotherBoard = function(mproducer) {
		this.producer = mproducer;
		Device.call(this);
	};
	MotherBoard.prototype = {
		voltage : '5v',
		beep : true
	};
	_inherits(MotherBoard, Device, 'MotherBoard_Class');
	MotherBoard.prototype.dispose = function() {
		this.producer = null;
		Device.prototype.dispose.call(this);
	};

	var InputDevice = function(damount) {
		this.amount = damount;
		this.state = 'Work Fine';
		Device.call(this);
	};
	_inherits(InputDevice, Device, 'InputDevice_Class');
	InputDevice.prototype.dispose = function() {
		this.amount = null;
		this.state = null;
		Device.prototype.dispose.call(this);
	};

	var Computer = function(mbrand, monitorbrand, mproducer) {
		this.machineBrand = mbrand;
		this.inputPart = new InputDevice(2);
		this.monitor = new Monitor(monitorbrand);
		this.motherboard = new MotherBoard(mproducer);
		Device.call(this);
	};

	_inherits(Computer, Device, 'Computer_Class');
	Computer.prototype.dispose = function() {
		this.machineBrand = null;
		this.inputPart.dispose();
		this.inputPart = null;
		this.monitor.dispose();
		this.monitor = null;
		this.motherboard.dispose();
		this.motherboard = null;
		Device.prototype.dispose.call(this);
	};

	/*
	 * The following codes check the results with JSSpec framework
	 */
	var guidArray = []; // This array contains all the guids of all the
						// instances
	var arrayContain = function(array, ele) {
		i = 0;
		while (i < array.length) {
			if (array[i] == ele) {
				return true;
			}
			i = i + 1;
		}
		return false;
	}

	// Start test ...

	test("dispose", function() {
		expect(3);
		function myClass() {
			this.name = "myclass";
			this.method = function() {
				ok(true, "method is called");
			}
		}
		_inherits(myClass, baidu.lang.Class);
		// 通过继承baidu.lang.Class来获取dispose方法
			var obj = new myClass();
			obj.dispose();

			ok(obj.disposed, "disposed is set to true");
			equal(obj.name, undefined, "name is disposed");// name返回:undefined
			obj.method();

		});
	
	test("toString", function() {
		function myClass() {
			this.name = "myclass";
		}
		_inherits(myClass, baidu.lang.Class,"myclass");
		// 通过继承baidu.lang.Class来获取dispose方法
			var obj = new myClass();
			equal(obj.toString(),"[object myclass]", "check toString : ");// name返回:undefined
		});
	
})();

//
//
// describe('test baidu.lang.Class.create', {
// 'create single instance': function(){
// var SObject = baidu.lang.createSingle({
// givenName: 'Jim',
// company: 'baidu',
// salary: 10000,
// getInfo: function(){
// return this.company + ' employee ' + this.givenName + ' can get money ' +
// this.salary;
// }
// });
// value_of(arrayContain(guidArray, SObject.guid)).should_be_false();
//        
// value_of(SObject.getInfo()).should_be('baidu employee Jim can get money
// 10000');
// value_of(SObject.givenName).should_be('Jim');
// value_of(SObject.salary).should_be(10000);
// value_of(SObject.owner).should_be('baidu');
//        
// value_of(window[baidu.guid]._instances[SObject.guid].givenName).should_be('Jim');
// value_of(window[baidu.guid]._instances[SObject.guid].salary).should_be(10000);
//        
// i = SObject.guid;
// SObject.dispose();
// value_of(window[baidu.guid]._instances[i]).should_be(undefined);
// },
// // Skip this case, since create does not support json which contains guid
// attribute
// 'create single instance, json contais guid':function(){
// S = baidu.lang.createSingle(
// {guid:'testid001',
// school:'pku',
// year:2004,
// single:true,
// marry:function(){
// this.single = false;
// }});
// value_of(S.guid).should_be('testid001');
// value_of(arrayContain(guidArray,S.guid)).should_be_false();
// guidArray.push(S.guid);
// value_of(S.single).should_be_true();
// value_of(S.school).should_be('pku');
// value_of(S.year).should_be(2004);
// S.marry();
// value_of(S.single).should_be_false();
// value_of(S.owner).should_be('baidu');
//     
// value_of(baidu.lang.instance(S.guid).school).should_be('pku');
// value_of(baidu.lang.instance(S.guid).year).should_be(2004);
// },
// 'create single instance, json={}': function(){
// S = baidu.lang.createSingle({});
// value_of(arrayContain(guidArray, S.guid)).should_be_false();
// guidArray.push(S.guid);
// value_of(S.owner).should_be('baidu');
// },
// 'create single instance after several Objects are created': function(){
// o = new simpleDevice();
// value_of(arrayContain(guidArray, o.guid)).should_be_false();
// guidArray.push(o.guid);
//        
// o = new Monitor('HP');
// value_of(arrayContain(guidArray, o.guid)).should_be_false();
// guidArray.push(o.guid);
//        
// S = baidu.lang.createSingle({
// gender: 'male',
// hobby: 'PC games'
// });
// value_of(arrayContain(guidArray, S.guid)).should_be_false();
// guidArray.push(S.guid);
// value_of(S.gender).should_be('male');
// value_of(S.hobby).should_be('PC games');
// value_of(S.owner).should_be('baidu');
// },
// 'create several single instance': function(){
// S = baidu.lang.createSingle({
// gender: 'female',
// hobby: 'swim'
// });
// value_of(arrayContain(guidArray, S.guid)).should_be_false();
// guidArray.push(S.guid);
// value_of(S.hobby).should_be('swim');
//        
// S = baidu.lang.createSingle({
// level: 4,
// tech: 'Java'
// });
// value_of(arrayContain(guidArray, S.guid)).should_be_false();
// guidArray.push(S.guid);
// value_of(S.level).should_be(4);
//        
// S = baidu.lang.createSingle({
// site: 'free',
// id: 'DL'
// });
// value_of(arrayContain(guidArray, S.guid)).should_be_false();
// guidArray.push(S.guid);
// value_of(S.id).should_be('DL');
//        
// }
// });
//
//
// describe('baidu.lang.Class constructor test', {
// 'check children class contians all the attributes of father Class':
// function(){
// s = new simpleDevice();
// value_of(arrayContain(guidArray, s.guid)).should_be_false();
// guidArray.push(s.guid);
// value_of(s.tag).should_be('i am a simple device!');
// value_of(s.guid.length > 0).should_be_true();
// value_of(s.owner).should_be('baidu');
// },
// 'check instances have different guids': function(){
// s = new Monitor('Dell');
// value_of(s.guid.length > 0).should_be_true();
// value_of(arrayContain(guidArray, s.guid)).should_be_false();
// guidArray.push(s.guid);
//        
// s = new InputDevice(2);
// value_of(s.guid.length > 0).should_be_true();
// value_of(arrayContain(guidArray, s.guid)).should_be_false();
// guidArray.push(s.guid);
//        
// s = new MotherBoard('MSI');
// value_of(s.guid.length > 0).should_be_true();
// value_of(arrayContain(guidArray, s.guid)).should_be_false();
// guidArray.push(s.guid);
//        
// s = new Device();
// value_of(s.guid.length > 0).should_be_true();
// value_of(arrayContain(guidArray, s.guid)).should_be_false();
// guidArray.push(s.guid);
// },
// 'children class inherits BaseClass and has no more attributes ': function(){
// d = new Device();
// value_of(d.guid.length > 0).should_be_true();
// value_of(d.owner).should_be('baidu');
// value_of(arrayContain(guidArray, d.guid)).should_be_false();
// guidArray.push(d.guid);
//        
// d1 = new Device();
// value_of(d1.guid.length > 0).should_be_true();
// value_of(d1.owner).should_be('baidu');
// value_of(arrayContain(guidArray, d1.guid)).should_be_false();
// guidArray.push(d1.guid);
//        
// d2 = new Device();
// value_of(d2.guid.length > 0).should_be_true();
// value_of(d2.owner).should_be('baidu');
// value_of(arrayContain(guidArray, d2.guid)).should_be_false();
// guidArray.push(d2.guid);
//        
// d3 = new Device();
// value_of(d3.guid.length > 0).should_be_true();
// value_of(d3.owner).should_be('baidu');
// value_of(arrayContain(guidArray, d3.guid)).should_be_false();
// guidArray.push(d3.guid);
// }
// });
//
// describe('baidu.lang.Class.dispose test', {
// 'new an object and call its dispose function': function(){
// c = new Computer('Dell', 'Sony Monitor', 'Dell China');
// value_of(c.guid.length > 0).should_be_true();
// value_of(arrayContain(guidArray, c.guid)).should_be_false();
// value_of(window[baidu.guid]._instances[c.guid]).should_be(c);
//        
// k = c.guid;
// c.dispose();
// value_of(window[baidu.guid]._instances[k]).should_be(undefined);
// //check all the Objects we have~~
// var i = 0;
// var tmpArray = [];
// while (i < guidArray.length) {
// k = guidArray[i];
// tmpArray.push(window[baidu.guid]._instances[k].guid);
// i = i + 1;
// }
// value_of(tmpArray).should_be(guidArray);
// },
// 'call an existing object\'s dispose function': function(){
// k = guidArray.pop();
// i = window[baidu.guid]._instances[k];
// i.dispose();
// value_of(window[baidu.guid]._instances[k]).should_be(undefined);
//        
// //check all the Objects we have~~
// var i = 0;
// var tmpArray = [];
// while (i < guidArray.length) {
// k = guidArray[i];
// tmpArray.push(window[baidu.guid]._instances[k].guid);
// i = i + 1;
// }
// value_of(tmpArray).should_be(guidArray);
// }
// })
//
// describe('baidu.lang.Class.toString test', {
// 'set inherits interface argument classname': function(){
// c = new Computer('Dell', 'Sony Monitor', 'Dell China');
// value_of(c.toString()).should_be('[object Computer_Class]');
//        
// o = new Monitor('sonic');
// value_of(o.toString()).should_be('[object Monitor_Class]');
//        
// j = new MotherBoard('ASUS');
// value_of(j.toString()).should_be('[object MotherBoard_Class]');
//        
// },
// 'Do not set inherits interface argument classname': function(){
// c = new Device();
// value_of(c.toString()).should_be('[object Object]');
//        
// o = new simpleDevice('sonic');
// value_of(o.toString()).should_be('[object Object]');
// }
// });
