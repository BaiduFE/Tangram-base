
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/element/Element.js
 * author: berg
 * version: 1.0.0
 * date: 2010/12/17
 */

///import baidu.element;

///import baidu.fn.methodize;
///import baidu.fn.multize;


/*
 * 包装静态方法，使其变成一个链条方法。先把静态方法multize化，让其支持接受数组参数，然后包装返回值，最后把静态方法methodize化，让其变成一个对象方法。
 * @name baidu.element._wrapFunction
 * @function
 * @grammar baidu.element._wrapFunction(func, index)
 * 
 * @param {Function} 	func	要包装的静态方法
 * @param {number} 		index	包装函数的第几个返回值
 *
 * @return {function} 	包装后的方法，能直接挂到Element的prototype上。
 */
baidu.element._wrapFunction = function(func, index){
    return baidu.fn.methodize(wrapReturnValue(baidu.fn.multize(func), baidu.element.Element, index), '_dom');

    /**
     * 包装函数的返回值，使其在能按照index指定的方式返回。
     * 如果其值为-1，直接返回返回值
     * 如果其值为0，返回'返回值'的包装结果
     * 如果其值大于0，返回第i个位置的参数的包装结果（从1开始计数）
     *
     * @param {function} func    需要包装的函数
     * @param {function} wrapper 包装器
     * @param {number} 包装第几个参数
     * 
     * @return {function} 包装后的函数
     */
    function wrapReturnValue(func, wrapper, index){
        index = index | 0;
        return function(){
            var ret = func.apply(this, arguments); 

            if(index > 0){
                return new wrapper(arguments[index - 1]);
            }
            if(!index){
                return new wrapper(ret);
            }

            return ret;
        }
    }
};
