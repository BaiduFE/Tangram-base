
(function(){
var CustEvent=QW.CustEvent,CustEventTarget=QW.CustEventTarget;
function Film(name){
	this.name=name;
	CustEvent.createEvents(this,"beforeplay,play,stop");
}
Film.prototype.play=function(){
	if(!this.fire("beforeplay")) {
		value_of("Fail to play video.").log();
		return false;
	}
	value_of("Play video."+this.name).log();
	this.fire("play");
}
Film.prototype.stop=function(){
	value_of("Stop video.");
	this.fire("stop");
}

describe('CustEvent', {
	'CustEvent Members': function() {
		value_of(CustEvent).log();
		value_of(CustEvent.prototype).log('CustEvent.prototype');
	},
	'CustEventTarget Members': function() {
		value_of(CustEventTarget).log();
		value_of(CustEventTarget.prototype).log('CustEventTarget.prototype');
	},

	'createEvents': function() {
		var film=new Film("My Friends");
		value_of(film).should_have_method('on');	
		value_of(film).should_have_method('un');	
		value_of(film).should_have_method('fire');	
	},
	
	'on': function() {
		var film=new Film("My Friends");
		var canPlay=false,playing=false,played=false;;
		film.on("beforeplay",function(e){
			value_of("before play "+this.name).log();
			e.returnValue=canPlay;
		});
		var hdl1=function(e){
			playing=true;
		};
		film.on("play",hdl1);
		value_of(film.on("play",hdl1)).should_be(false);//重复添加会返回false
		var fn=function(e){
			played=true;
		}
		film.on("stop",fn);
		film.un("stop",fn);
		
		film.play();
		value_of(playing).should_be(false);
		canPlay=true;
		film.play();
		value_of(playing).should_be(true);
		film.stop();
		value_of(played).should_be(false);
	}

});


})();