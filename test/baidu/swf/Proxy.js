/***************************************************************************
 * 
 * Copyright (c) 2011 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * proxy.js ~ 2011/01/23 00:32:02
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/

module("baidu.swf.Proxy");

test("baidu.swf.Proxy", function(){
  expect(1);

  stop();
  ua.importsrc("baidu.swf.create,baidu.ajax.get,baidu.json.decode", function(){
    $(document.body).append("<div id='FlashContainer'></div>");
    baidu.swf.create({
      id:"Line",
      url: upath + "line.swf",
      width:"100%",
      height:"165",
      wmode : "transparent",
      errorMessage:"载入FLASH出错",
      ver:"9.0.0",
      allowscriptaccess:"always"
    },"FlashContainer");

    function flashLoaded() {
      baidu.ajax.get(upath + 'two_line.json', function(xhr){
        var data = baidu.json.decode(xhr.responseText);
        if (data) {
          proxy.call("setFlashLineData", data, 1);
          ok(true);
        }
        start();
      }); 
    }

    var proxy = new baidu.swf.Proxy("Line", "setFlashLineData", flashLoaded);
    //proxy.init();
  });
});
