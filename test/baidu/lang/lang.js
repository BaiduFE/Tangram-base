baidu.lang.Class.prototype.owner = 'baidu';
var Device = function(){
    baidu.lang.Class.call(this);
};
Device.prototype = new baidu.lang.Class();
Device.prototype.constructor = Device;
Device.prototype.dispose = function(){
    baidu.lang.Class.prototype.dispose.call(this);
};

var simpleDevice = function(){
    Device.call(this);
    this.tag = 'i am a simple device!';
};
baidu.lang.inherits(simpleDevice, Device);
simpleDevice.prototype.dispose = function(){
    this.tag = null;
    baidu.lang.Class.prototype.dispose.call(this);
    
};

var Monitor = function(mbrand){
    this.brand = mbrand;
    Device.call(this);
};
baidu.lang.inherits(Monitor, Device, 'Monitor_Class');
Monitor.prototype.size = '22 inch';
Monitor.prototype.dispose = function(){
    Device.prototype.dispose.call(this);
    this.brand = null;
    //BaseClass.prototype.dispose.call(this);
};


var MotherBoard = function(mproducer){
    this.producer = mproducer;
    Device.call(this);
    
};
MotherBoard.prototype = {
    voltage: '5v',
    beep: true
};
baidu.lang.inherits(MotherBoard, Device, 'MotherBoard_Class');
MotherBoard.prototype.dispose = function(){
    this.producer = null;
    Device.prototype.dispose.call(this);
};



var InputDevice = function(damount){
    this.amount = damount;
    this.state = 'Work Fine';
    Device.call(this);
};
baidu.lang.inherits(InputDevice, Device, 'InputDevice_Class');
InputDevice.prototype.dispose = function(){
    this.amount = null;
    this.state = null;
    Device.prototype.dispose.call(this);
};


var Computer = function(mbrand, monitorbrand, mproducer){
    this.machineBrand = mbrand;
    this.inputPart = new InputDevice(2);
    this.monitor = new Monitor(monitorbrand);
    this.motherboard = new MotherBoard(mproducer);
    Device.call(this);
};
baidu.lang.inherits(Computer, Device, 'Computer_Class');
Computer.prototype.dispose = function(){
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
 *  The following codes check the results with JSSpec framework
 */
guidArray = []; //This array contains all the guids of all the instances
var arrayContain = function(array, ele){
    i = 0;
    while (i < array.length) {
        if (array[i] == ele) {
            return true;
        }
        i = i + 1;
    }
    return false;
}

//describe('baidu.lang.decontrol', {
//    'decontrol exist guid and not exist guid': function(){
//		var SObject = baidu.lang.createSingle({
//            givenName: 'Jim',
//            company: 'baidu',
//            salary: 10000,
//            getInfo: function(){
//                return this.company + ' employee ' + this.givenName + ' can get money ' + this.salary;
//            }
//        });
//		value_of(SObject.getInfo()).should_be('baidu employee Jim can get money 10000');
//		value_of(SObject.givenName).should_be('Jim');
//		value_of(SObject.salary).should_be(10000);
//		value_of(SObject.company).should_be('baidu');
//		var i = SObject.guid;
//		value_of(i).should_not_be_null();
//		baidu.lang.decontrol(i+1);
//		value_of(baidu.lang.instance(i)).should_not_be_null();
//		baidu.lang.decontrol(i);
//		value_of(baidu.lang.instance(i)).should_be_null();
//    }
//});
//
//
//describe('baidu.lang.instance test', {
//    'given a exist instance\'s guid': function(){
//        c = new Computer('Lenovo', 'Dell', 'Lenovo China');
//        
//        value_of(c.guid.length > 0).should_be_true();
//        value_of(arrayContain(guidArray, c.guid)).should_be_false();
//        guidArray.push(c.guid);
//        
//        mid = c.monitor.guid;
//        iid = c.inputPart.guid;
//        mbid = c.motherboard.guid;
//        m = baidu.lang.instance(mid);
//        i = baidu.lang.instance(iid);
//        mb = baidu.lang.instance(mbid);
//        machine = baidu.lang.instance(c.guid);
//        
//        /*	 //This part may cause some trouble for dispose
//         value_of(i.guid.length>0).should_be_true();
//         value_of(arrayContain(guidArray,i.guid)).should_be_false();
//         guidArray.push(i.guid);
//         
//         value_of(mb.guid.length>0).should_be_true();
//         value_of(arrayContain(guidArray,mb.guid)).should_be_false();
//         guidArray.push(mb.guid);
//         
//         value_of(m.guid.length>0).should_be_true();
//         value_of(arrayContain(guidArray,m.guid)).should_be_false();
//         guidArray.push(m.guid);
//         */
//        value_of(m.brand).should_be('Dell');
//        value_of(m.size).should_be('22 inch');
//        value_of(i.amount).should_be(2);
//        value_of(i.state).should_be('Work Fine');
//        value_of(i.owner).should_be('baidu');
//        value_of(mb.producer).should_be('Lenovo China');
//        value_of(mb.beep).should_be_true();
//        value_of(mb.voltage).should_be('5v');
//        value_of(machine.machineBrand).should_be('Lenovo');
//        value_of(machine.owner).should_be('baidu');
//        
//        /*	value_of().should_be();
//         value_of().should_be();
//         value_of().should_be();
//         value_of().should_be();
//         value_of().should_be();
//         
//         */
//    },
//    'given guid do not exist': function(){
//        value_of(baidu.lang.instance('who_knows')).should_be_null();
//        value_of(baidu.lang.instance('NotExistID')).should_be_null();
//        
//        //check all the Objects we have~~
//        
//        var i = 0;
//        //var tmpArray=[];
//        while (i < guidArray.length) {
//            k = guidArray[i];
//            value_of(baidu.lang.instance(k).guid).should_be(k);
//            //tmpArray.push(baidu.lang.instance(k).guid);
//            i = i + 1;
//        }
//        //value_of(tmpArray).should_be(guidArray);
//    }
//});
