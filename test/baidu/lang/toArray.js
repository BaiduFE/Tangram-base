module('baidu.lang.toArray')

/**
 * 将一个变量转换成array
 * 
 *TODO 是否需要考虑提供类似切分功能产出array
 */
test('array to array', function(){
	expect(1);
	var array = [1,2,4,];
	var array_after = baidu.lang.toArray(array);
	equal(array,array_after,"convert array to array");
})

/**
 * dom
 * string 
 */
test('obj,string to array', function(){
	expect(2);
	var div = document.createElement('div');
	var str = "str_toArray";
	document.body.appendChild(div);
	if(baidu.lang.isArray(str))//string
		equal(baidu.lang.toArray(str),str,"convert string to array");
	else
		ok(true,"fail to convert string to array");
	
	var div_toArray = baidu.lang.toArray(div);
	if(baidu.lang.isArray(div_toArray)){//dom obj
		equal(div_toArray[0],div,"convert obj to array success");
	}else{
		ok(true,"fail to convert obj to array");
	}
	document.body.removeChild(div);
})

test('support obj with items', function(){
	expect(2);
	var div = document.createElement('div');
	var div2 = document.createElement('div');
	document.body.appendChild(div);
	document.body.appendChild(div2);
	var divList = document.getElementsByTagName('div');//dom
	var divList_toArray = baidu.lang.toArray(divList);
	ok(baidu.lang.isArray(divList_toArray),"convert obj with items to array success");
	for(var i in divList_toArray){
		if(divList_toArray[i]!=divList[i]){
			ok(false,"fail to convert obj with items to array");
			break;
		}
		if(i==(divList_toArray.length-1))
			ok(true,"convert obj with items to array");
	}
	document.body.removeChild(div);
	document.body.removeChild(div2);
})

test('function to array',function(){
	var handle = function(){
//		alert("function convert to array");
	}
	equal(baidu.lang.toArray(handle)[0],[handle][0],"convert function to array");
})

test('null and undefine to array', function(){
	expect(2);
	var nullPara = null;//null
	var undefinedPara;//undefined
	equal(baidu.lang.toArray(nullPara),"","convert null to array");
	equal(baidu.lang.toArray(undefinedPara),"","convert undefined to array");
})

