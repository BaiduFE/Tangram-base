/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/fn/multize.js
 * author: berg
 * version: 1.0.0
 * date: 2010/11/02 
 */

///import baidu.fn;

/**
 * 对函数进行集化，使其在第一个参数为array时，结果也返回一个数组
 * @name baidu.fn.multize
 * @function
 * @grammar baidu.fn.multize(func[, recursive])
 * @param {Function}	func 		需要包装的函数
 * @param {Boolean}		[recursive] 是否递归包装（如果数组里面一项仍然是数组，递归），可选
 * @param {Boolean}		[joinArray] 将操作的结果展平后返回（如果返回的结果是数组，则将多个数组合成一个），可选
 * @version 1.3
 *
 * @returns {Function} 已集化的函数
 */
baidu.fn.multize = /**@function*/function (func, recursive, joinArray) {
    var newFunc = function(){
        var list = arguments[0],
            fn = recursive ? newFunc : func,
            ret = [],
            moreArgs = [].slice.call(arguments,0),
            i = 0,
            len,
            r;

        if(list instanceof Array){
            for(len = list.length; i < len; i++){
                moreArgs[0]=list[i];
                r = fn.apply(this, moreArgs);
                if (joinArray) {
                    if (r) {
                        //TODO: 需要去重吗？
                        ret = ret.concat(r);
                    }
                } else {
                    ret.push(r); 	
                }
            }
            return ret;
        }else{
            return func.apply(this, arguments);
        }
    }
    return newFunc;
};
