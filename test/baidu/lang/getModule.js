module("baidu.lang.getModule");

var a = 10;
test("getModule", function(){
  equals(baidu.lang.getModule('a'), 10);
  equals(baidu.lang.getModule('nosuchvar'), null);

  var b = {
    a : 20
  };

  equals(baidu.lang.getModule('a', b), 20);
  equals(baidu.lang.getModule('nosuchvar', b), null);

  var a = {
    b : {
      c : {
        d : {
          e : 'hello'
        }
      }
    }
  };
  equals(baidu.lang.getModule('b.c.d.e', a), 'hello');
  
  equals(baidu.lang.getModule('baidu.lang.getModule'), baidu.lang.getModule);
  equals(baidu.lang.getModule('baidu.lang'), baidu.lang);
  equals(baidu.lang.getModule('baidu'), baidu);
  equals(baidu.lang.getModule('baidu.object.isEmpty'), null);
});

test("performance", function(){

function impl1(name, opt_obj) {
    var parts = name.split('.');
    var cur = opt_obj || window;
    for (var part; part = parts.shift(); ) {
        if (cur[part] != null) {
            cur = cur[part];
        } else {
          return null;
        }
    }

    return cur;
};

function impl2(name, opt_obj) {
    var conetxt = opt_obj || window,
        fn = new Function('o', 'try{o.' + name + '}catch(e){return null;}');
    return fn(conetxt);
}

var now = Date.now();
for(var i = 0; i < 10000; i ++) {
  impl1('baidu.lang.getModule');
}
ok(true, 'impl1 take ' + (Date.now() - now) + 'ms');

now = Date.now();
for(var i = 0; i < 10000; i ++) {
  impl2('baidu.lang.getModule');
}
ok(true, 'impl2 take ' + (Date.now() - now) + 'ms');
});





















/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
