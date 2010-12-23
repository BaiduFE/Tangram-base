/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: wangchen
	author: JK
*/


/*
	Dom_Retouch
*/


(function(){
var ObjectH=QW.ObjectH,
	HelperH=QW.HelperH,
	NodeC=QW.NodeC,
	NodeW=QW.NodeW,
	EventW=QW.EventW,
	EventTargetH=QW.EventTargetH;

/*
 * EventTarget Helper onfire 方法扩展
 * @class EventTargetH
 * usehelper BB.EventTargetH
*/
EventTargetH.fireHandler = function (element, e, handler, name) {
	var we = new EventW(e);
	return handler.call(element, we);
};

/*
NodeH2 = EventTargetH+NodeH
*/

var NodeH2=ObjectH.mix({},[QW.EventTargetH,QW.NodeH]);
var NodeH2=HelperH.mul(NodeH2,true);

/**
*@class Dom 将DomU的方法，以及NodeH的方法集中到一起的一个命名空间
*@namespace QW
*/
QW.Dom={};
ObjectH.mix(QW.Dom,[QW.DomU,NodeH2]);
HelperH.gsetter(QW.Dom,NodeC.gsetterMethods);//生成gsetters


/**
*@class NodeW 用NodeH与EventTargetH，以及ArrayH来渲染NodeW
*@namespace QW
*/
var wh=HelperH.rwrap(NodeH2,NodeW,NodeC.wrapMethods);
HelperH.gsetter(wh,NodeC.gsetterMethods);//生成gsetters
ObjectH.dump(QW.ArrayH,NodeC.arrayMethods,wh);//ArrayH的部分方法也移过来


HelperH.applyTo(wh,NodeW);	//NodeW的静态方法
HelperH.methodizeTo(wh,NodeW.prototype,"core");	//NodeW的原型方法

})();


