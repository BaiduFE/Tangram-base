/*
	Copyright (c) 2010, Baidu Inc.  http://www.youa.com; http://www.qwrap.com
	author: wuliang
	author: JK
*/

/**
 * @class ArrayH 核心对象Array的扩展
 * @singleton 
 * @namespace QW
 * @helper
 */
(function(){

var ArrayH = {
	/** 
	* 在数组中的每个项上运行一个函数，并将全部结果作为数组返回。
	* @method map
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数.
	* @param {Object} pThis (Optional) 指定callback的this对象.
	* @return {Array} 返回满足过滤条件的元素组成的新数组 
	* @example 
		var arr=["aa","ab","bc"];
		var arr2=map(arr,function(a,b){return a.substr(0,1)=="a"});
		alert(arr2);
	*/
	map:function(arr,callback,pThis){
		var len=arr.length;
		var rlt=new Array(len);
		for (var i =0;i<len;i++) {
			if (i in arr) rlt[i]=callback.call(pThis,arr[i],i,arr);
		}
		return rlt;
	},

	/** 
	* 对Array的每一个元素运行一个函数。
	* @method forEach
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数.
	* @optional {Object} pThis (Optional) 指定callback的this对象.
	* @return {void}  
	* @example 
		var arr=["a","b","c"];
		var dblArr=[];
		forEach(arr,function(a,b){dblArr.push(b+":"+a+a);});
		alert(dblArr);
	*/
	forEach:function(arr,callback,pThis){
		for (var i =0,len=arr.length;i<len;i++){
			if (i in arr) callback.call(pThis,arr[i],i,arr);
		}
	},

	/** 
	* 在数组中的每个项上运行一个函数，并将函数返回真值的项作为数组返回。
	* @method filter
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数.
	* @optional {Object} pThis (Optional) 指定callback的this对象.
	* @return {Array} 返回满足过滤条件的元素组成的新数组 
	* @example 
		var arr=["aa","ab","bc"];
		var arr2=filter(arr,function(a,b){return a.substr(0,1)=="a"});
		alert(arr2);
	*/
	filter:function(arr,callback,pThis){
		var rlt=[];
		for (var i =0,len=arr.length;i<len;i++) {
			if((i in arr) && callback.call(pThis,arr[i],i,arr)) rlt.push(arr[i]);
		}
		return rlt;
	},

	/** 
	* 判断数组中是否有元素满足条件。
	* @method some
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数.
	* @optional {Object} pThis (Optional) 指定callback的this对象.
	* @return {boolean} 如果存在元素满足条件，则返回true. 
	* @example 
		var arr=["aa","ab","bc"];
		var arr2=filter(arr,function(a,b){return a.substr(0,1)=="a"});
		alert(arr2);
	*/
	some:function(arr,callback,pThis){
		for (var i =0,len=arr.length;i<len;i++) {
			if(i in arr && callback.call(pThis,arr[i],i,arr)) return true;
		}
		return false;
	},

	/** 
	* 判断数组中所有元素都满足条件。
	* @method every
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数.
	* @optional {Object} pThis (Optional) 指定callback的this对象.
	* @return {boolean} 所有元素满足条件，则返回true. 
	* @example 
		var arr=["aa","ab","bc"];
		var arr2=filter(arr,function(a,b){return a.substr(0,1)=="a"});
		alert(arr2);
	*/
	every:function(arr,callback,pThis){
		for (var i =0,len=arr.length;i<len;i++) {
			if(i in arr && !callback.call(pThis,arr[i],i,arr)) return false;
		}
		return true;
	},

	/** 
	* 返回一个元素在数组中的位置（从前往后找）。如果数组里没有该元素，则返回-1
	* @method indexOf
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Object} obj 元素，可以是任何类型
	* @optional {int} fromIdx (Optional) 从哪个位置开始找起，如果为负，则表示从length+startIdx开始找
	* @return {int} 则返回该元素在数组中的位置.
	* @example 
		var arr=["a","b","c"];
		alert(indexOf(arr,"c"));
	*/
	indexOf:function(arr,obj,fromIdx){
		var len=arr.length;
		fromIdx=fromIdx|0;//取整
		if(fromIdx<0) fromIdx+=len;
		if(fromIdx<0) fromIdx=0;
		for(; fromIdx < len; fromIdx ++){
			if(fromIdx in arr && arr[fromIdx] === obj) return fromIdx;
		}
		return -1;
	},

	/** 
	* 返回一个元素在数组中的位置（从后往前找）。如果数组里没有该元素，则返回-1
	* @method lastIndexOf
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Object} obj 元素，可以是任何类型
	* @optional {int} fromIdx (Optional) 从哪个位置开始找起，如果为负，则表示从length+startIdx开始找
	* @return {int} 则返回该元素在数组中的位置.
	* @example 
		var arr=["a","b","a"];
		alert(lastIndexOf(arr,"a"));
	*/
	lastIndexOf:function(arr,obj,fromIdx){
		var len=arr.length;
		fromIdx=fromIdx|0;//取整
		if(!fromIdx || fromIdx>=len) fromIdx=len-1;
		if(fromIdx<0) fromIdx+=len;
		for(; fromIdx >-1; fromIdx --){
			if(fromIdx in arr && arr[fromIdx] === obj) return fromIdx;
		}
		return -1;
	},

	/** 
	* 判断数组是否包含某元素
	* @method contains
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Object} obj 元素，可以是任何类型
	* @return {boolean} 如果元素存在于数组，则返回true，否则返回false
	* @example 
		var arr=["a","b","c"];
		alert(contains(arr,"c"));
	*/
	contains:function(arr,obj) {
		return (ArrayH.indexOf(arr,obj) >= 0);
	},

	/** 
	* 清空一个数组
	* @method clear
	* @static
	* @param {Array} arr 待处理的数组.
	* @return {void} 
	*/
	clear:function(arr){
		arr.length = 0;
	},

	/** 
	* 将数组里的某(些)元素移除。
	* @method remove
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Object} obj0 待移除元素
	* @param {Object} obj1 … 待移除元素
	* @return {number} 返回第一次被移除的位置。如果没有任何元素被移除，则返回-1.
	* @example 
		var arr=["a","b","c"];
		remove(arr,"a","c");
		alert(arr);
	*/
	remove:function(arr,obj){
		var idx=-1;
		for(var i=1;i<arguments.length;i++){
			var oI=arguments[i];
			for(var j=0;j<arr.length;j++){
				if(oI === arr[j]) {
					if(idx<0) idx=j;
					arr.splice(j--,1);
				}
			}
		}
		return idx;
	},

	/** 
	* 数组元素除重，得到新数据
	* @method unique
	* @static
	* @param {Array} arr 待处理的数组.
	* @return {void} 数组元素除重，得到新数据
	* @example 
		var arr=["a","b","a"];
		alert(unique(arr));
	*/
	unique:function(arr){
		var rlt = [];
		var oI=null;
		for(var i = 0; i < arr.length; i ++){
			if(ArrayH.indexOf(rlt,oI=arr[i])<0){
				rlt.push(oI);
			}
		}
		return rlt;
	},

	/** 
	* 合并两个已经unique过的数组，相当于两个数组concat起来，再unique，不过效率更高
	* @method union
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Array} arr2 待处理的数组.
	* @return {Array} 返回一个新数组
	* @example 
		var arr=["a","b"];
		var arr2=["b","c"];
		alert(union(arr,arr2));
	*/
	union:function(arr,arr2){
		var ra = [];
		for(var i = 0, len = arr2.length; i < len; i ++){
			if(!ArrayH.contains(arr,arr2[i])) {
				ra.push(arr2[i]);
			}
		}
		return [].concat(arr,ra);
	},

	/** 
	* 为数组元素进行递推操作。
	* @method reduce
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数。
	* @param {any} initial (Optional) 初始值，如果没有这初始，则从第一个有效元素开始。没有初始值，并且没有有效元素，会抛异常
	* @return {any} 返回递推结果. 
	* @example 
		var arr=[1,2,3];
		alert(reduce(arr,function(a,b){return Math.max(a,b);}));
	*/
	reduce:function(arr,callback,initial){
		var len=arr.length;
		var i=0;
		if(arguments.length<3){//找到第一个有效元素当作初始值
			var hasV=0;
			for(;i<len;i++){
				if(i in arr) {initial=arr[i++];hasV=1;break;}
			}
			if(!hasV) throw new Error("No component to reduce");
		}
		for(;i<len;i++){
			if(i in arr) initial=callback(initial,arr[i],i,arr);
		}
		return initial;
	},

	/** 
	* 为数组元素进行逆向递推操作。
	* @method reduceRight
	* @static
	* @param {Array} arr 待处理的数组.
	* @param {Function} callback 需要执行的函数。
	* @param {any} initial (Optional) 初始值，如果没有这初始，则从第一个有效元素开始。没有初始值，并且没有有效元素，会抛异常
	* @return {any} 返回递推结果. 
	* @example 
		var arr=[1,2,3];
		alert(reduceRight(arr,function(a,b){return Math.max(a,b);}));
	*/
	reduceRight:function(arr,callback,initial){
		var len=arr.length;
		var i=len-1;
		if(arguments.length<3){//逆向找到第一个有效元素当作初始值
			var hasV=0;
			for(;i>-1;i--){
				if(i in arr) {initial=arr[i--];hasV=1;break;}
			}
			if(!hasV) throw new Error("No component to reduceRight");
		}
		for(;i>-1;i--){
			if(i in arr) initial=callback(initial,arr[i],i,arr);
		}
		return initial;
	},

	/**
	* 将一个数组扁平化
	* @method expand
	* @static
	* @param {Array} arr要扁平化的数组
	* @return {Array} 扁平化后的数组
	*/	
	expand:function(arr){
		return [].concat.apply([], arr);
	},


	/** 
	* 将一个泛Array转化成一个Array对象。
	* @method toArray
	* @static
	* @param {Array} arr 待处理的Array的泛型对象.
	* @return {Array}  
	*/
	toArray:function(arr){
		var ret=[];
		for(var i=0;i<arr.length;i++){
			ret[i]=arr[i];
		}
		return ret;
	}

};

QW.ArrayH=ArrayH;

})();

