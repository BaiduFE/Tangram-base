/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: JK
	author: wangchen
*/
/** 
* @class NodeW HTMLElement对象包装器
* @namespace QW
*/
(function () {
	var ObjectH = QW.ObjectH,
		mix = ObjectH.mix,
		getType = ObjectH.getType,
		push = Array.prototype.push,
		NodeH = QW.NodeH,
		$ = NodeH.$,
		query = NodeH.query;

	var NodeW=function(core) {
		if(!core) return null;
		var arg1=arguments[1];
		if(typeof core=='string'){
			if(this instanceof NodeW){//用法：var el=new NodeW(id); //不推荐本用法
				return new NodeW($(core,arg1));
			}
			else {//用法: var els=NodeW(selector)
				return new NodeW(query(arg1,core));
			}
		}
		else {
			core=$(core,arg1);
			if(this instanceof NodeW){
				this.core=core;
				var type=getType(core);
				if(type=='array'){//用法：var els=new NodeW([el1,el2]); 
					this.length=0;
					push.apply( this, core );
				}
				else{//用法: var el=new NodeW(el); 
					this.length=1;
					this[0]=core;
				}
			}
			else return new NodeW(core);//用法：var el=NodeW(el); var els=NodeW([el1,el2]); //省略"new"
		}
	};

	mix(NodeW.prototype,{
		/** 
		* 返回NodeW的第0个元素的包装
		* @method	first
		* @return	{NodeW}	
		*/
		first:function(){
			return NodeW(this[0]);
		},
		/** 
		* 返回NodeW的最后一个元素的包装
		* @method	last
		* @return	{NodeW}	
		*/
		last:function(){
			return NodeW(this[this.length-1]);
		},
		/** 
		* 返回NodeW的第i个元素的包装
		* @method	last
		* @param {int}	i 第i个元素
		* @return	{NodeW}	
		*/
		item:function(i){
			return NodeW(this[i]);
		}
	});

	QW.NodeW=NodeW;
})();

