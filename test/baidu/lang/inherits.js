module("baidu.lang.inherits");

var vehicle= function(vName){
    this.name = vName;
};
vehicle.prototype={wheels:4,engine:'fire',usage:'land'};

var car=function(cName,cBrand){
    this.brand = cBrand;
    var me = this;
    vehicle.call(me,cName); //cName initial in superClass vehicle
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


test("normal inherit case, using inherits interface", function(){
	carA = new car("Prime", "GE");
	
	equals(carA.name, "Prime", 'carA.name = "Prime"');
	equals(carA.brand, "GE", 'carA.brand = "GE"');
	equals(carA.wheels, 4, 'carA.wheels = 4');
	equals(carA.engine, "fire", 'carA.engine = "fire"');
	equals(carA.usage, "land", 'carA.usage = "land"');
});

test("normal inherit case,do not call baseclass constructor, using inherits interface", function(){
	truckA = new truck("volve");
	equals(truckA.name, undefined, 'truckA.name = undefined');
	equals(truckA.brand, "volve", 'truckA.brand = "volve"');
	equals(truckA.wheels, 4, 'truckA.wheels = 4');
	equals(truckA.engine, "fire", 'truckA.engine = "fire"');
	equals(truckA.usage, "land", 'truckA.usage = "land"');
});

test("normal inherit case, without using inherits interface", function(){
	busA = new bus("volve");
	equals(busA.name, "volvo bus", 'busA.name = "volvo bus"');
	equals(busA.brand, "volve", 'busA.brand = "volve"');
	equals(busA.wheels, undefined, 'busA.wheels = undefined');
	equals(busA.engine, undefined, 'busA.engine = undefined');
	equals(busA.usage, undefined, 'busA.usage = undefined');
});

test("complex normal inherit case, using inherits interface", function(){
	raceCarA = new raceCar(300, "911", "Porsche");
	
	equals(raceCarA.name, "911", 'raceCarA.name = "911"');
	equals(raceCarA.topspeed, 300, 'raceCarA.topspeed = 300');
	equals(raceCarA.brand, "Porsche", 'raceCarA.brand = "Porsche"');
	equals(raceCarA.wheels, 4, 'raceCarA.wheels = 4');
	equals(raceCarA.engine, "fire", 'raceCarA.engine = "fire"');
	equals(raceCarA.usage, "land", 'raceCarA.usage = "land"');
});

test("extend", function(){
	carA = new car("Prime", "GE");
	car.extend({
		newP: 'newP',
		name: 'newName'
	});
	
	equals(carA.name, "newName", 'carA.name = "newName"');
	equals(carA.newP, "newP", 'carA.newP = "newP"');
	equals(carA.brand, "GE", 'carA.brand = "GE"');
	equals(carA.wheels, 4, 'carA.wheels = 4');
	equals(carA.engine, "fire", 'carA.engine = "fire"');
	equals(carA.usage, "land", 'carA.usage = "land"');
});

/*
*  The following codes check the results with JSSpec framework
*/
	
//describe('baidu.lang.inherits测试',{
//    'normal inherit case, using inherits interface':function(){
//        carA = new car('Prime','GE');
//        value_of(carA.name).should_be('Prime');
//        value_of(carA.brand).should_be('GE');
//        value_of(carA.wheels).should_be(4);
//        value_of(carA.engine).should_be('fire');
//        value_of(carA.usage).should_be('land');
//        //value_of().should_be();
//    },
//    'normal inherit case,do not call baseclass constructor, using inherits interface':function(){
//        truckA = new truck('volve');
//        value_of(truckA.name).should_be_undefined();
//        value_of(truckA.brand).should_be('volve');
//        value_of(truckA.wheels).should_be(4);
//        value_of(truckA.engine).should_be('fire');
//        value_of(truckA.usage).should_be('land');
//    },
//    'normal inherit case, without using inherits interface':function(){
//        busA = new bus('volve');
//        value_of(busA.name).should_be('volvo bus');
//        value_of(busA.brand).should_be('volve');
//        value_of(busA.wheels).should_be_undefined();
//        value_of(busA.engine).should_be_undefined();
//        value_of(busA.usage).should_be_undefined();
//    },
//    'complex normal inherit case, using inherits interface':function(){
//        raceCarA = new raceCar(300,'911','Porsche');
//        value_of(raceCarA.name).should_be('911');
//        value_of(raceCarA.topspeed).should_be(300);
//        value_of(raceCarA.brand).should_be('Porsche');
//        value_of(raceCarA.wheels).should_be(4);
//        value_of(raceCarA.engine).should_be('fire');
//        value_of(raceCarA.usage).should_be('land');
//    }
//});
