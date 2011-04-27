/***************************************************************************
 * 
 * Copyright (c) 2011 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/

/**
 * proxy.js ~ 2011/01/23 00:32:02
 * 
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$
 * @description
 * 
 */

//module("baidu.swf.Proxy");

// normal
//test(
//		"property&&flash[property] normal",
//		function() {
//			stop();
//			ua
//					.importsrc(
//							"baidu.swf.create,baidu.ajax.get,baidu.json.decode",
//							function() {
//								var div=document.createElement('div');
//								div.id='FlashContainer';
//								document.body.appendChild(div);
////								$(document.body).append(
////										"<div id='FlashContainer'></div>");
//								baidu.swf.create({
//									id : "Line",
//									url : upath + "line.swf",
//									width : "100%",
//									height : "165",
//									wmode : "transparent",
//									errorMessage : "载入FLASH出错",
//									ver : "9.0.0",
//									allowscriptaccess : "always"
//								}, "FlashContainer");
//
//								function flashLoaded() {
//
//									baidu.ajax
//											.get(
//													upath + 'two_line.json',
//													function(xhr) {
//														var data = baidu.json
//																.decode(xhr.responseText);
//														if (data) {
//															var isready = proxy
//																	.isReady();
//															ok(isready,
//																	"test isReady() successfully");
//															proxy
//																	.call(
//																			"setFlashLineData",
//																			data,
//																			1);
//															ok(true,
//																	"test call() and getFlash() successfully");
//														}
//														setTimeout(function(){
//															document.body.removeChild(div);
//														},200);
//														start();
//													});
//								}
//
//								var proxy = new baidu.swf.Proxy("Line",
//										"setFlashLineData", flashLoaded);
//								
//							});
//		});
