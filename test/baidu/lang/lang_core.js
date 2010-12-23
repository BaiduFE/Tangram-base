//This file tests baidu.lang.inherits, there is no relation with baseclass
// More cases about inherits and baseClass can be found in baidu.lang.Class_Test file
var vehicle= function(vName){
    this.name = vName;
    };
vehicle.prototype={wheels:4,engine:'fire',usage:'land'};

var car=function(cName,cBrand){
    this.brand = cBrand;
    var me = this;
    vehicle.call(me,cName);
};

baidu.lang.inherits(car,vehicle,'car Class');

var truck= function(tBrand){
    this.brand = tBrand;
};
baidu.lang.inherits(truck,vehicle);

var bus = function(bBrand){  // We don't use inherits here
    this.brand = bBrand;
    vehicle.call(this,'volvo bus');
};


var raceCar = function(topspeed,cname,cbrand){
    this.topspeed = topspeed;
    car.call(this,cname,cbrand);
};
baidu.lang.inherits(raceCar,car);

// This part is testing multiple inheritance
var flyMachine = function(){
    this.machine = 'plane';
};
flyMachine.prototype={producer:'China',wing:2};

var flyRaceCar = function(topspeed,cname,cbrand){ // We don't use baidu.lang.inherits here 
    raceCar.call(this,topspeed,cname,cbrand);
    flyMachine.call(this);
};

var flyCar = function(cName,cBrand){
    car.call(this,cName,cBrand);
    flyMachine.call(this);
};
//快捷键
baidu.inherits(flyCar,car);
baidu.lang.inherits(flyCar,flyMachine);

/*
*  The following codes check the results with JSSpec framework
*/
	
describe('baidu.lang.inherits测试',{
    'normal inherit case, using inherits interface':function(){
        carA = new car('Prime','GE');
        value_of(carA.name).should_be('Prime');
        value_of(carA.brand).should_be('GE');
        value_of(carA.wheels).should_be(4);
        value_of(carA.engine).should_be('fire');
        value_of(carA.usage).should_be('land');
        //value_of().should_be();
    },
    'normal inherit case,do not call baseclass constructor, using inherits interface':function(){
        truckA = new truck('volve');
        value_of(truckA.name).should_be_undefined();
        value_of(truckA.brand).should_be('volve');
        value_of(truckA.wheels).should_be(4);
        value_of(truckA.engine).should_be('fire');
        value_of(truckA.usage).should_be('land');
    },
    'normal inherit case, without using inherits interface':function(){
        busA = new bus('volve');
        value_of(busA.name).should_be('volvo bus');
        value_of(busA.brand).should_be('volve');
        value_of(busA.wheels).should_be_undefined();
        value_of(busA.engine).should_be_undefined();
        value_of(busA.usage).should_be_undefined();
    },
    'complex normal inherit case, using inherits interface':function(){
        raceCarA = new raceCar(300,'911','Porsche');
        value_of(raceCarA.name).should_be('911');
        value_of(raceCarA.topspeed).should_be(300);
        value_of(raceCarA.brand).should_be('Porsche');
        value_of(raceCarA.wheels).should_be(4);
        value_of(raceCarA.engine).should_be('fire');
        value_of(raceCarA.usage).should_be('land');
    }
});


var myModule = {};
var myFun = function () {};
describe('baidu.lang.module测试',{
    '扩展存在的Object类型的模块': function () {
        baidu.lang.module('myModule.sum', function(a,b){return a+b;});
        value_of(myModule.sum(1,2)).should_be(3);
    },

    '扩展存在的Function类型的模块': function () {
        baidu.lang.module('myFun.sum', function(a,b){return a+b;});
        value_of(myFun.sum(1,2)).should_be(3);
    },

    '扩展不存在的模块': function () {
        baidu.lang.module('noExist.sum', function(a,b){return a+b;});
        value_of(noExist.sum(1,2)).should_be(3);
    },

    '指定owner的模块扩展': function () {
        baidu.lang.module('mod.sum', function(a,b){return a+b;}, myModule);
        value_of(myModule.mod.sum(1,2)).should_be(3);
    },
	'指定owner不存在的模块扩展': function () {
        baidu.lang.module('noex.sum', function(a,b){return a+b;}, null);
        value_of(noex.sum(1,2)).should_be(3);
    }
});

describe('baidu.lang.isString测试',{
    'string类型': function () {
        value_of(baidu.lang.isString("i am string")).should_be_true();
    },

    'String对象': function () {
        value_of(baidu.lang.isString(new String("i am string"))).should_be_true();
    },
    
    'number类型': function () {
        value_of(baidu.lang.isString(1)).should_be_false();
    },

    'boolean类型': function () {
        value_of(baidu.lang.isString(true)).should_be_false();
    },

    'Object参数': function () {
        value_of(baidu.lang.isString({})).should_be_false();
    },

    'Function参数': function () {
        value_of(baidu.lang.isString(new Function())).should_be_false();
    },

    'null参数': function () {
        value_of(baidu.lang.isString(null)).should_be_false();
    },

    'undefined参数': function () {
        value_of(baidu.lang.isString(void(0))).should_be_false();
    },
	
	'快捷方式': function () {
        value_of(baidu.isString("快捷方式")).should_be_true();
    }
});

describe('baidu.lang.isObject测试',{
    'Object参数': function () {
        value_of(baidu.lang.isObject({})).should_be_true();
    },

    'Function类型': function () {
        value_of(baidu.lang.isObject(new Function())).should_be_true();
    },

    'Array对象': function () {
        value_of(baidu.lang.isObject([])).should_be_true();
    },

    'Element对象': function () {
        value_of(baidu.lang.isObject(document.getElementById('erikElement'))).should_be_true();
    },
	
	'string对象': function () {
        value_of(baidu.lang.isObject(new String("string object"))).should_be_true();
    },
    
    'string类型': function () {
        value_of(baidu.lang.isObject("test")).should_be_false();
    },

    'number类型': function () {
        value_of(baidu.lang.isObject(1)).should_be_false();
    },

    'boolean类型': function () {
        value_of(baidu.lang.isObject(true)).should_be_false();
    },

    'null参数': function () {
        value_of(baidu.lang.isObject(null)).should_be_false();
    },

    'undefined参数': function () {
        value_of(baidu.lang.isObject(void(0))).should_be_false();
    },
	
	'快捷方式': function () {
        value_of(baidu.isObject({})).should_be_true();
    }
});

describe('baidu.lang.isArray测试',{
    'Array对象': function () {
        value_of(baidu.lang.isArray([])).should_be_true();
    },

    'Object参数': function () {
        value_of(baidu.lang.isArray({})).should_be_false();
    },

    'Function类型': function () {
        value_of(baidu.lang.isArray(new Function())).should_be_false();
    },

    'Element对象': function () {
        value_of(baidu.lang.isArray(document.getElementById('erikElement'))).should_be_false();
    },

    'string类型': function () {
        value_of(baidu.lang.isArray("test")).should_be_false();
    },

    'number类型': function () {
        value_of(baidu.lang.isArray(1)).should_be_false();
    },

    'boolean类型': function () {
        value_of(baidu.lang.isArray(true)).should_be_false();
    },

    'null参数': function () {
        value_of(baidu.lang.isArray(null)).should_be_false();
    },

    'undefined参数': function () {
        value_of(baidu.lang.isArray(void(0))).should_be_false();
    }
});

describe('baidu.lang.isNumber测试',{
    'number类型': function () {
        value_of(baidu.lang.isNumber(1)).should_be_true();
    },

    'Number对象': function () {
        value_of(baidu.lang.isNumber(new Number(1))).should_be_true();
    },
    
    'NaN': function () {
        value_of(baidu.lang.isNumber(NaN)).should_be_true();
    },

    'Object参数': function () {
        value_of(baidu.lang.isNumber({})).should_be_false();
    },

    'Function类型': function () {
        value_of(baidu.lang.isNumber(new Function())).should_be_false();
    },

    'Element对象': function () {
        value_of(baidu.lang.isNumber(document.getElementById('erikElement'))).should_be_false();
    },

    'string类型': function () {
        value_of(baidu.lang.isArray("test")).should_be_false();
    },

    'boolean类型': function () {
        value_of(baidu.lang.isArray(true)).should_be_false();
    },

    'null参数': function () {
        value_of(baidu.lang.isArray(null)).should_be_false();
    },

    'undefined参数': function () {
        value_of(baidu.lang.isArray(void(0))).should_be_false();
    }
});

describe('baidu.lang.isElement测试',{
    'Element对象': function () {
        value_of(baidu.lang.isElement(document.getElementById('erikElement'))).should_be_true();
    },

    'document': function () {
        value_of(baidu.lang.isElement(document)).should_be_false();
    },

    'Object参数': function () {
        value_of(baidu.lang.isElement({})).should_be_false();
    },

    'Function类型': function () {
        value_of(baidu.lang.isElement(new Function())).should_be_false();
    },

    'string类型': function () {
        value_of(baidu.lang.isElement("test")).should_be_false();
    },

    'number类型': function () {
        value_of(baidu.lang.isElement(1)).should_be_false();
    },

    'boolean类型': function () {
        value_of(baidu.lang.isElement(true)).should_be_false();
    },

    'null参数': function () {
        value_of(baidu.lang.isElement(null)).should_be_false();
    },

    'undefined参数': function () {
        value_of(baidu.lang.isElement(void(0))).should_be_false();
    }
});
describe('baidu.lang.guid', {
	'guid is unique' : function(){
		var a = baidu.lang.guid();
		var b = baidu.lang.guid();
		var c = baidu.lang.guid();
		var d = baidu.lang.guid();
		var e = baidu.lang.guid();
		
		value_of(a).should_not_be(null);
		value_of(b).should_not_be(null);
		value_of(c).should_not_be(null);
		value_of(d).should_not_be(null);
		value_of(e).should_not_be(null);
		
		value_of(a).should_not_be(b);
		value_of(b).should_not_be(c);
		value_of(c).should_not_be(d);
		value_of(d).should_not_be(e);
	}
});
