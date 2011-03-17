/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

///import baidu.fn;

/**
 * 包装函数的返回值，使其在能按照index指定的方式返回。<br/>如果其值为-1，直接返回返回值。 <br/>如果其值为0，返回"返回值"的包装结果。<br/> 如果其值大于0，返回第i个位置的参数的包装结果（从1开始计数）
 * @author berg
 * @name baidu.fn.wrapReturnValue
 * @function
 * @grammar baidu.fn.wrapReturnValue(func, wrapper, mode)
 * @param {function} func    需要包装的函数
 * @param {function} wrapper 包装器
 * @param {number} 包装第几个参数
 * @version 1.3.5
 * @return {function} 包装后的函数
 */
baidu.fn.wrapReturnValue = function (func, wrapper, mode) {
    mode = mode | 0;
    return function(){
        var ret = func.apply(this, arguments); 

        if(mode > 0){
            return new wrapper(arguments[mode - 1]);
        }
        if(!mode){
            return new wrapper(ret);
        }
        return ret;
    }
};
